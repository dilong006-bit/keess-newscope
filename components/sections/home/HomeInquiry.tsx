'use client';

import { EMAIL_RE, INQ_MAX, fmtPhone, hasNonPhoneChar } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { INQ } from '@/data/home';

const ALLOWED = ['zip', 'pdf', 'hwp', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif'];
const MAX = 10 * 1024 * 1024;
const FILE_PLACEHOLDER = '파일을 선택하거나 끌어다 놓으세요';
/** 접수 완료 후 입력 폼으로 자동 복귀까지의 대기 시간(ms) */
const AUTO_RETURN_MS = 5000;
/**
 * 첨부파일 민감정보 유의 문구(정보보호팀 승인 문구 · G2-11). 전문 말미(4. 동의 거부 권리 뒤)와
 * 첨부파일 필드 헬퍼에 동일 문구로 노출한다 — 전문을 열지 않아도 인지 가능하도록.
 */
const FILE_PRIVACY_NOTE =
  '※ 첨부파일에는 개인정보(주민등록번호, 계좌정보 등 민감정보 포함)가 담기지 않도록 유의하여 주시기 바랍니다.';
/** 전문 아코디언 펼침 상한(px) — 교체된 전문이 잘리지 않도록 상향(§G2-11) */
const CONSENT_TEXT_MAXH = 700;

/** 상태 key → 입력 element id (제출 실패 시 첫 미충족 필드로 포커스 이동) */
const FIELD_ID: Record<string, string> = {
  company: 'f-company', name: 'f-name', phone: 'f-phone', position: 'f-position',
  emailLocal: 'f-email', emailDomain: 'f-email', companySize: 'f-csize', trainees: 'f-trainees', message: 'f-msg',
};

/** 상담 신청 제출 페이로드 — A안 정본 스키마(기술명세서 §C). */
export interface InquiryPayload {
  companyName: string;
  managerName: string;
  phone: string;
  position: string;
  email: string; // `${id}@${domain}` 결합값
  companySize: string;
  expectedTrainees: string;
  interests: string[];
  message: string;
  attachment: File | null;
  agreePrivacy: true;
  agreeMarketing: boolean;
  agreeMarketingEmail: boolean;
  agreeMarketingSms: boolean;
  agreeMarketingTel: boolean;
  /** 유입 경로 태깅(예: /kium 경유 = 'kium'). 화면에 노출되지 않는 비수집 메타 필드 */
  lead_source?: string;
}

interface HomeInquiryProps {
  /**
   * 관심 영역 칩 초기 선택값(사용자가 해제 가능). 홈에서는 지정하지 않아 기존 동작 그대로다.
   * ※ 폼의 필드·동의 구조는 변경하지 않는다 — 기존 칩 중 무엇을 켜고 시작할지만 정한다.
   */
  presetInterests?: string[];
  /**
   * '정부 지원' 세부 분야 칩의 초기 선택값(사용자가 해제 가능).
   * 부모 칩이 함께 선택돼 있지 않으면 노출되지 않는다.
   */
  presetInterestSubs?: string[];
  /** 제출 페이로드에 실을 유입 경로 값(UI 미노출) */
  leadSource?: string;
  /** 지정 시 해당 CustomEvent를 구독해 '문의 내용'만 프리필한다(사용자 편집 가능) */
  prefillEventName?: string;
}

/** 백엔드 없음(CLAUDE.md §0-6) — 추후 사내 API·메일 서비스 엔드포인트를 여기에 연결한다. */
function submitInquiry(payload: InquiryPayload) {
  return Promise.resolve(payload);
}

/** presetInterests → 칩 선택 상태. 미지정(홈)이면 빈 객체 = 기존 동작 */
function initInterests(preset?: string[]): Record<string, boolean> {
  return Object.fromEntries((preset ?? []).map((k) => [k, true]));
}

/** 세부 분야를 가진 부모 칩 value ('gov') */
const SUB_PARENT = INQ.interestSubs.parent;

/**
 * '정부 지원' 관심 영역 값 병합 — 신규 name 필드를 만들지 않기 위한 표기 규칙.
 * 세부 미선택: 'gov'(기존 값 그대로) / 선택: '정부 지원(인재키움·아카이브)'
 */
function mergeGovInterest(value: string, selectedSubs: string[]) {
  return selectedSubs.length ? `${INQ.interestSubs.parentLabel}(${selectedSubs.join('·')})` : value;
}

export default function HomeInquiry({
  presetInterests,
  presetInterestSubs,
  leadSource,
  prefillEventName,
}: HomeInquiryProps = {}) {
  const [v, setV] = useState({
    company: '', name: '', phone: '', position: '',
    emailLocal: '', emailDomain: '', companySize: '', trainees: '', message: '',
  });
  const [customDomain, setCustomDomain] = useState(false);
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [interests, setInterests] = useState<Record<string, boolean>>(() => initInterests(presetInterests));
  const [subs, setSubs] = useState<Record<string, boolean>>(() => initInterests(presetInterestSubs));
  const [consent, setConsent] = useState(false);
  const [mkt, setMkt] = useState({ email: false, sms: false, tel: false });
  const [consentErr, setConsentErr] = useState(false);
  const [consentOpen, setConsentOpen] = useState<Record<string, boolean>>({});
  const [hp, setHp] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState(FILE_PLACEHOLDER);
  const [fileErr, setFileErr] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [phoneHint, setPhoneHint] = useState(false);
  const [lenErr, setLenErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mktAllRef = useRef<HTMLInputElement>(null);
  const phoneHintTimer = useRef<ReturnType<typeof setTimeout>>();
  const returnTimer = useRef<ReturnType<typeof setTimeout>>();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // 마케팅 부모 ↔ 3채널 양방향 동기화
  const mktAll = mkt.email && mkt.sms && mkt.tel;
  const mktSome = (mkt.email || mkt.sms || mkt.tel) && !mktAll;
  useEffect(() => {
    if (mktAllRef.current) mktAllRef.current.indeterminate = mktSome;
  }, [mktSome]);
  const toggleMktAll = (checked: boolean) => setMkt({ email: checked, sms: checked, tel: checked });
  const toggleMkt = (k: 'email' | 'sms' | 'tel') => setMkt((p) => ({ ...p, [k]: !p[k] }));

  // 완료(감사) 상태에서만 자동복귀 타이머 가동, 복귀/언마운트 시 정리(중복 실행·누수 방지)
  useEffect(() => {
    if (!done) return;
    returnTimer.current = setTimeout(() => resetForm(), AUTO_RETURN_MS);
    return () => clearTimeout(returnTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  /** 상태 완전 초기화 후 입력 폼으로 복귀 + 첫 필드 포커스 (즉시복귀·자동복귀 공용) */
  function resetForm() {
    clearTimeout(returnTimer.current);
    clearTimeout(phoneHintTimer.current);
    setV({ company: '', name: '', phone: '', position: '', emailLocal: '', emailDomain: '', companySize: '', trainees: '', message: '' });
    setCustomDomain(false);
    // 초기화 후에도 진입 경로 프리셀렉트는 유지(홈은 preset 미지정이라 기존과 동일하게 빈 상태)
    setInterests(initInterests(presetInterests));
    setSubs(initInterests(presetInterestSubs));
    setConsent(false);
    setMkt({ email: false, sms: false, tel: false });
    setErrs({});
    setConsentErr(false);
    setConsentOpen({});
    setLenErr(null);
    setPhoneHint(false);
    setFile(null);
    setFileName(FILE_PLACEHOLDER);
    setFileErr('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setHp('');
    setDone(false);
    requestAnimationFrame(() => firstFieldRef.current?.focus({ preventScroll: true }));
  }

  // R1: 입력 단계 캡 — maxLength를 우회하는 붙여넣기·IME 조합까지 slice로 차단
  const upd = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const max = (INQ_MAX as Record<string, number | undefined>)[k];
    const next = max ? e.target.value.slice(0, max) : e.target.value;
    setV((s) => ({ ...s, [k]: next }));
  };

  // R3·R4: 연락처 — 숫자만 남기고 자동 하이픈. 포맷·힌트 모두 신고 접수 '전화번호' 정본과 동일.
  const onPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const bad = hasNonPhoneChar(raw);
    setV((s) => ({ ...s, phone: fmtPhone(raw) }));
    if (bad) {
      setPhoneHint(true);
      clearTimeout(phoneHintTimer.current);
      phoneHintTimer.current = setTimeout(() => setPhoneHint(false), 2500);
    } else setPhoneHint(false);
  };
  useEffect(() => () => clearTimeout(phoneHintTimer.current), []);

  /**
   * 과정 패널 CTA → '문의 내용' 프리필 ([관심 과정: ...]).
   * 값만 넣을 뿐 필드·검증·동의 구조는 그대로이며, 사용자가 자유롭게 편집·삭제할 수 있다.
   * 재클릭 시 앞선 토큰만 교체해 중복 누적을 막는다.
   */
  useEffect(() => {
    if (!prefillEventName) return;
    const onPrefill = (e: Event) => {
      const text = (e as CustomEvent<{ text?: string }>).detail?.text;
      if (!text) return;
      setV((s) => {
        const rest = s.message.replace(/^\[관심 과정: [^\]]*\]\s*/, '');
        return { ...s, message: (text + rest).slice(0, INQ_MAX.message) };
      });
    };
    window.addEventListener(prefillEventName, onPrefill);
    return () => window.removeEventListener(prefillEventName, onPrefill);
  }, [prefillEventName]);

  const email = `${v.emailLocal.trim()}@${v.emailDomain.trim()}`;

  function resetFile(msg: string) {
    setFile(null);
    setFileName(FILE_PLACEHOLDER);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (msg) setFileErr(msg);
  }

  function takeFile(f: File | undefined) {
    setFileErr('');
    if (!f) return resetFile('');
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED.includes(ext)) return resetFile('허용되지 않는 파일 형식입니다.');
    if (f.size > MAX) return resetFile('파일 용량은 최대 10MB까지 가능합니다.');
    setFile(f);
    setFileName(`${f.name} (${(f.size / 1048576).toFixed(1)}MB)`);
  }

  /** R2: 제출 직전 전 필드 길이 재검증 — 초과 시 서버 전송 없이 차단 + 해당 필드 포커스 */
  function findOverflow(): keyof typeof v | null {
    for (const k of Object.keys(v) as (keyof typeof v)[]) {
      const max = (INQ_MAX as Record<string, number | undefined>)[k];
      if (max && (v[k] || '').length > max) return k;
    }
    return null;
  }

  // 제출 차단 = 필수 5개(회사·기관명/담당자명/연락처/직급·직책/이메일) + 개인정보 동의
  function submit() {
    if (hp) return; // 허니팟
    const next: Record<string, boolean> = {};
    let ok = true;
    (['company', 'name', 'phone', 'position'] as const).forEach((k) => {
      const bad = !(v[k] || '').trim();
      next[k] = bad;
      if (bad) ok = false;
    });
    const emailOK = !!v.emailLocal.trim() && !!v.emailDomain.trim() && EMAIL_RE.test(email);
    next.email = !emailOK;
    if (!emailOK) ok = false;

    // R2: 길이 초과는 페이로드 조립 전에 차단한다(과다 입력이 서버로 넘어가지 않게)
    const over = findOverflow();
    if (over) {
      next[over === 'emailLocal' || over === 'emailDomain' ? 'email' : over] = true;
      setLenErr(over);
      ok = false;
    } else setLenErr(null);

    setErrs(next);
    const cBad = !consent;
    setConsentErr(cBad);
    if (cBad) ok = false;
    if (fileErr) ok = false;
    if (!ok) {
      const firstBad = over ?? (['company', 'name', 'phone', 'position'] as const).find((k) => next[k]);
      if (firstBad) document.getElementById(FIELD_ID[firstBad])?.focus({ preventScroll: false });
      return;
    }

    const payload: InquiryPayload = {
      companyName: v.company.trim(),
      managerName: v.name.trim(),
      phone: v.phone.trim(),
      position: v.position.trim(),
      email,
      companySize: v.companySize,
      expectedTrainees: v.trainees,
      // 관심 영역 — '정부 지원'은 세부 분야가 선택된 경우 값 자체에 병합해 싣는다.
      // 새 name 필드를 만들지 않으므로 폼 수집 항목 수는 그대로다(신규 수집 0).
      interests: INQ.interests
        .filter((o) => interests[o.value])
        .map((o) => (o.value === SUB_PARENT ? mergeGovInterest(o.value, subLabels) : o.value)),
      message: v.message.trim(),
      attachment: file,
      agreePrivacy: true,
      agreeMarketing: mktAll,
      agreeMarketingEmail: mkt.email,
      agreeMarketingSms: mkt.sms,
      agreeMarketingTel: mkt.tel,
      // 유입 경로 태깅 — 폼에 입력 UI가 없는 비노출 메타(GA4·GTM 코드 삽입 아님)
      ...(leadSource ? { lead_source: leadSource } : {}),
    };
    submitInquiry(payload);
    setDone(true);
  }

  // 세부 분야 — 부모 칩이 켜져 있을 때만 노출/집계. 부모를 끄면 선택값도 초기화한다.
  const govOn = !!interests[SUB_PARENT];
  const subLabels = govOn ? INQ.interestSubs.options.filter((o) => subs[o]) : [];
  const toggleInterest = (value: string) => {
    setInterests((s) => {
      const next = { ...s, [value]: !s[value] };
      if (value === SUB_PARENT && !next[value]) setSubs({});
      return next;
    });
  };

  const fld = (k: string) => `field${errs[k] ? ' invalid' : ''}`;
  const half = { flex: '1 1 160px', width: 'auto', minWidth: 0 } as const;

  return (
    <section className="section inq" id="inq">
      <div className="wrap">
        <div className="inq-grid">
          <div className="inq-side r">
            <div>
              <p className="lead">{INQ.side.lead}</p>
              <p className="leadsub">{INQ.side.sub}</p>
            </div>
            <div className="trust">
              {INQ.side.trust.map((t, i) => (
                <span key={t} style={{ display: 'contents' }}>
                  <span>{t}</span>
                  {i < INQ.side.trust.length - 1 && <span>·</span>}
                </span>
              ))}
            </div>
          </div>

          <div className="form r">
            {!done ? (
              <div id="form-body">
                {/* 1·2 회사·기관명* / 담당자명* */}
                <div className="frow">
                  <div className={fld('company')}>
                    <label htmlFor="f-company">회사·기관명 <span className="req">*</span></label>
                    <input id="f-company" ref={firstFieldRef} name="company" maxLength={INQ_MAX.company} value={v.company} onChange={upd('company')} aria-required="true" aria-invalid={!!errs.company} />
                    <span className="err" aria-live="polite">회사·기관명을 입력해 주세요.</span>
                  </div>
                  <div className={fld('name')}>
                    <label htmlFor="f-name">담당자명 <span className="req">*</span></label>
                    <input id="f-name" name="contactName" maxLength={INQ_MAX.name} value={v.name} onChange={upd('name')} aria-required="true" aria-invalid={!!errs.name} />
                    <span className="err" aria-live="polite">담당자명을 입력해 주세요.</span>
                  </div>
                </div>

                {/* 3·4 연락처* / 직급·직책* */}
                <div className="frow">
                  <div className={fld('phone')}>
                    <label htmlFor="f-phone">연락처 <span className="req">*</span></label>
                    {/* R3~R5: 숫자만·자동 하이픈·힌트 문구 모두 신고 접수 '전화번호' 정본과 동일 */}
                    <input id="f-phone" name="phone" type="tel" inputMode="numeric" placeholder="010-0000-0000" maxLength={INQ_MAX.phone} value={v.phone} onChange={onPhone} aria-required="true" aria-invalid={!!errs.phone} />
                    {phoneHint && <span className="phone-hint" aria-live="polite">숫자만 입력할 수 있어요.</span>}
                    <span className="err" aria-live="polite">연락처를 입력해 주세요.</span>
                  </div>
                  <div className={fld('position')}>
                    <label htmlFor="f-position">직급/직책 <span className="req">*</span></label>
                    <input id="f-position" name="jobTitle" placeholder="예: 인사팀 과장 / 교육담당" maxLength={INQ_MAX.position} value={v.position} onChange={upd('position')} aria-required="true" aria-invalid={!!errs.position} />
                    <span className="err" aria-live="polite">직급/직책을 입력해 주세요.</span>
                  </div>
                </div>

                {/* 5 이메일* — 아이디 @ 도메인(프리셋/직접입력) */}
                <div className={fld('email')}>
                  <label htmlFor="f-email">이메일 <span className="req">*</span></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <input id="f-email" name="emailLocal" placeholder="이메일 아이디" maxLength={INQ_MAX.emailLocal} style={half} value={v.emailLocal} onChange={upd('emailLocal')} aria-required="true" aria-invalid={!!errs.email} />
                    <span aria-hidden="true" style={{ flex: 'none', color: 'var(--muted)', fontWeight: 700 }}>@</span>
                    {customDomain ? (
                      <input name="emailDomain" aria-label="이메일 도메인 직접 입력" placeholder="직접 입력 (예: company.com)" maxLength={INQ_MAX.emailDomain} style={half} value={v.emailDomain} onChange={upd('emailDomain')} />
                    ) : (
                      <select name="emailDomain" aria-label="이메일 도메인 선택" style={half} value={v.emailDomain} onChange={upd('emailDomain')}>
                        <option value="">이메일 선택</option>
                        {INQ.emailDomains.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    )}
                    <label className="email-direct">
                      <input type="checkbox" checked={customDomain} onChange={(e) => setCustomDomain(e.target.checked)} />
                      직접입력
                    </label>
                  </div>
                  <span className="err" aria-live="polite">이메일을 입력해 주세요.</span>
                </div>

                {/* 6·7 회사 규모 / 예상 교육인원 (별도 필드·선택) */}
                <div className="frow">
                  <div className="field">
                    <label htmlFor="f-csize">회사 규모 <span className="lopt">(임직원 수)</span></label>
                    <select id="f-csize" name="companySize" value={v.companySize} onChange={upd('companySize')}>
                      <option value="">선택</option>
                      {INQ.companySizes.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="f-trainees">예상 교육인원</label>
                    <select id="f-trainees" name="expectedTrainees" value={v.trainees} onChange={upd('trainees')}>
                      <option value="">선택</option>
                      {INQ.trainees.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* 8 관심 영역 (선택·다중 5칩) */}
                <div className="field">
                  <label id="f-interests-label" htmlFor="f-interests-label">관심 영역</label>
                  <div className="chips" role="group" aria-labelledby="f-interests-label">
                    {INQ.interests.map((o) => (
                      <button
                        type="button"
                        key={o.value}
                        className={`mchip${interests[o.value] ? ' on' : ''}`}
                        aria-pressed={!!interests[o.value]}
                        onClick={() => toggleInterest(o.value)}
                      >
                        {o.label}
                      </button>
                    ))}
                    {/* '정부 지원' 세부 분야 — 부모 칩 선택 시 우측 여백에 노출(모바일은 다음 행으로 개행).
                        새 수집 항목이 아니라 관심 영역 분류의 세분화이며, 제출 시 부모 값에 병합된다. */}
                    {govOn && (
                      <span className="mchip-subs" role="group" aria-label={`${INQ.interestSubs.parentLabel} 세부 분야`}>
                        {INQ.interestSubs.options.map((o, i) => (
                          <button
                            type="button"
                            key={o}
                            className={`mchip mchip-sub${subs[o] ? ' on' : ''}`}
                            style={{ animationDelay: `${i * 90}ms` }}
                            aria-pressed={!!subs[o]}
                            onClick={() => setSubs((s) => ({ ...s, [o]: !s[o] }))}
                          >
                            {o}
                          </button>
                        ))}
                      </span>
                    )}
                  </div>
                </div>

                {/* 9 문의 내용 (선택) */}
                <div className="field">
                  <label htmlFor="f-msg">문의 내용</label>
                  <textarea id="f-msg" name="message" rows={3} maxLength={INQ_MAX.message} value={v.message} onChange={upd('message')}
                    placeholder="도입을 검토 중인 교육 주제와 예상 인원·시기, 해결하고 싶은 조직 과제를 남겨주시면 담당 컨설턴트가 맞춤 상담으로 안내드립니다. (예: 임직원 300명 대상 AX 전환 교육을 3분기 중 검토 중입니다.)" />
                  <div className={`len-count${v.message.length >= INQ_MAX.message ? ' max' : ''}`} aria-live="polite">
                    {v.message.length}/{INQ_MAX.message}
                  </div>
                </div>

                {/* 10 첨부파일 (선택·드롭존) */}
                <div className="field"><label htmlFor="f-file">첨부파일</label>
                  <label
                    className={`filebox${file ? ' has' : ''}${dragOver ? ' over' : ''}`}
                    htmlFor="f-file"
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); takeFile(e.dataTransfer.files?.[0]); }}
                  >{fileName}</label>
                  <input id="f-file" ref={fileInputRef} name="attachment" type="file" style={{ display: 'none' }} accept=".zip,.pdf,.hwp,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif" onChange={(e) => takeFile(e.target.files?.[0])} />
                  <div className="filehint">zip·pdf·hwp·ppt·pptx·doc·docx·xls·xlsx·jpg·png·gif / 최대 10MB</div>
                  <div className="filehint">{FILE_PRIVACY_NOTE}</div>
                  {fileErr && <span className="err" style={{ display: 'block' }} aria-live="polite">{fileErr}</span>}
                </div>

                <input className="hp" tabIndex={-1} autoComplete="off" placeholder="website" value={hp} onChange={(e) => setHp(e.target.value)} aria-hidden="true" />

                <div className="consent-group">
                  {/* 11 개인정보 수집·이용 동의 (필수) */}
                  <div className={`consent${consentErr ? ' invalid' : ''}`}>
                    <label className="consent-main"><input type="checkbox" name="agreePrivacy" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-required="true" aria-invalid={consentErr} /><span><b className="c-tag req-tag">필수</b> 개인정보 수집·이용 동의</span></label>
                    <button type="button" className="consent-view" onClick={() => setConsentOpen((s) => ({ ...s, priv: !s.priv }))}>{consentOpen.priv ? '접기' : '전문 보기'}</button>
                  </div>
                  {consentErr && <span className="err" style={{ display: 'block', marginTop: 0 }} aria-live="polite">개인정보 수집·이용에 동의해 주세요.</span>}
                  <div className="consent-text" style={{ maxHeight: consentOpen.priv ? CONSENT_TEXT_MAXH : 0 }}><div className="ct-inner"><p><b>개인정보 수집·이용 동의 (필수)</b></p><p>KG에듀원 KEESS 서비스를 제공하기 위해 필요한 필수 정보를 아래와 같이 수집·이용하고자 하오니, 이에 동의하여 주시기를 부탁드립니다.</p><p><b>1. 수집·이용 목적</b><br />상담신청 및 안내: KEESS 직원 교육 상담신청 서비스의 상담·안내를 위한 자료 활용</p><p><b>2. 수집 항목</b><br />(필수) 담당자명, 회사·기관명, 직급/직책, 연락처, 이메일<br />(선택) 회사 규모(임직원 수), 예상 교육인원, 관심 영역, 문의 내용, 첨부파일</p><p><b>3. 보유 및 이용 기간</b><br />법령에 따른 보유·이용 기간 또는 동의받은 기간 내에서 처리·보유합니다. 수집·보유 근거: 정보주체의 동의 / 보유·이용기간: 동의일로부터 1년간(보유목적 달성) 또는 삭제 요청 시 지체 없이 파기.</p><p><b>4. 동의 거부 권리</b><br />동의를 거부할 권리가 있습니다. 다만 거부 시 상담 서비스 이용이 제한될 수 있습니다.</p><p>{FILE_PRIVACY_NOTE}</p></div></div>

                  {/* 12 마케팅 정보 수신 동의 (선택) — 부모 + 3채널 */}
                  <div className="consent">
                    <label className="consent-main"><input ref={mktAllRef} type="checkbox" name="agreeMarketing" checked={mktAll} aria-checked={mktSome ? 'mixed' : mktAll} onChange={(e) => toggleMktAll(e.target.checked)} /><span><b className="c-tag opt-tag">선택</b> 마케팅 정보 수신 동의</span></label>
                    <button type="button" className="consent-view" onClick={() => setConsentOpen((s) => ({ ...s, mkt: !s.mkt }))}>{consentOpen.mkt ? '접기' : '전문 보기'}</button>
                  </div>
                  <div className="filehint">수집 항목: 이름, 전화번호, 이메일 · 마케팅(EDM·이벤트) 정보 발송 목적</div>
                  <div className="mkt-sub" role="group" aria-label="마케팅 정보 수신 채널">
                    <label className="mkt-item"><input type="checkbox" name="agreeMarketingEmail" checked={mkt.email} onChange={() => toggleMkt('email')} /><span>이메일</span></label>
                    <label className="mkt-item"><input type="checkbox" name="agreeMarketingSms" checked={mkt.sms} onChange={() => toggleMkt('sms')} /><span>SMS(문자)</span></label>
                    <label className="mkt-item"><input type="checkbox" name="agreeMarketingTel" checked={mkt.tel} onChange={() => toggleMkt('tel')} /><span>전화(TM)</span></label>
                  </div>
                  <div className="consent-text" style={{ maxHeight: consentOpen.mkt ? CONSENT_TEXT_MAXH : 0 }}><div className="ct-inner"><p><b>마케팅 정보 수신 동의 (선택)</b></p><p>KG에듀원 KEESS는 「개인정보 보호법」 제22조에 의거하여 마케팅 목적의 개인정보 수집·이용에 대해 별도 동의를 받습니다. 동의를 거부하셔도 서비스 이용이 가능하며, 일부 서비스·혜택 제공이 제한될 수 있습니다.</p><p><b>수집·이용 목적</b><br />① 이메일·SMS(문자)·전화(TM)를 통한 EDM·이벤트 등 마케팅 정보 발송<br />② 모바일 상품권(기프티콘) MMS 발송</p><p><b>수집 항목</b><br />이름, 전화번호, 이메일</p><p><b>보유 및 이용 기간</b><br />① EDM·이벤트 마케팅: 동의일로부터 1년간 (또는 삭제 요청 시 지체 없이 파기)<br />② 모바일 상품권(기프티콘): 상품권 수령 완료 시까지</p><p>상기 이외의 마케팅 목적으로 수집·이용 시 별도 동의를 받습니다.</p></div></div>
                </div>
                <button className="btn submit" onClick={submit}>상담 신청</button>
              </div>
            ) : (
              <div className="form-done show" role="status" aria-live="polite">
                <div className="check">✓</div>
                <h4>{INQ.success.title}</h4>
                <p>{INQ.success.msg}</p>
                <p className="done-return">접수가 완료되었습니다. 잠시 후 문의 폼으로 돌아갑니다.</p>
                <button type="button" className="btn btn-line-dark done-again" onClick={resetForm}>새 문의 작성</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
