'use client';

import { fmtPhone, hasNonPhoneChar } from '@/lib/utils';
import { validateField, type ValidatedField } from '@/lib/validation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useModal } from '@/lib/useModal';
import { REPORT_SEED, REPORT_STATUS, REPORT_MASTER_PW, type ReportRecord } from '@/data/report';

// 세션 내 신규 접수 유지 (v26 window.__keessReports 대응)
const reports: ReportRecord[] = [...REPORT_SEED];

type Tab = 'info' | 'report' | 'lookup';

function genNo() {
  const d = new Date();
  const p = (x: number) => ('0' + x).slice(-2);
  const r = ('000' + Math.floor(Math.random() * 9000 + 1000)).slice(-4);
  return 'KR-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + r;
}
function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
}
// 접수 시각 HH:mm:ss (24시간제·KST). 접수 시점의 실제 시각을 기록한다.
function nowTimeStr() {
  const d = new Date();
  const p = (x: number) => ('0' + x).slice(-2);
  return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}
// 접수일시 표기 — 'YYYY-MM-DD HH:mm:ss'. time이 없는 건은 날짜만(값 임의 생성 금지).
function fmtReceivedAt(r: ReportRecord) {
  return r.time ? r.date + ' ' + r.time : r.date;
}

// 비밀번호 인증 전 '내용' 자리에 노출되는 안내 문구
const CONTENT_LOCKED_MSG = '비밀번호 확인 후 내용을 확인하실 수 있습니다.';
/** 전문 아코디언 펼침 상한(px) — 교체된 전문이 잘리지 않도록 상향(§G2-11) */
const CONSENT_TEXT_MAXH = 700;
// 전화 자동 하이픈은 lib/utils의 fmtPhone(정본)을 공유한다 — 상담 폼과 단일 기준.

// ── 아이콘 ────────────────────────────────────────────────────────────────
const IcShield = () => (
  <svg className="pvi-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.6-3.1 8.2-7 10-3.9-1.8-7-5.4-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>
);
const IcReport = () => (
  <svg className="pvi-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21V4"/><path d="M5 4h11l-1.6 4L16 12H5"/></svg>
);
const IcSearch = () => (
  <svg className="pvi-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.2-4.2"/></svg>
);

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: Tab;
}

const emptyForm = {
  name: '', phone: '', pw: '', pw2: '', email: '', role: '',
  ttype: '', course: '', org: '', target: '', title: '', content: '',
};

export default function ReportModal({ open, onClose, initialTab = 'info' }: ReportModalProps) {
  const overlayRef = useModal(open, onClose);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [tab, setTabState] = useState<Tab>(initialTab);

  // 신고 접수
  const [form, setForm] = useState({ ...emptyForm });
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  // 필드 단위 검증 — errs(필수 누락 불리언)와 달리 '보여줄 문구'를 담는다.
  // touched: 한 번이라도 입력한 적이 있는지. 탭으로 지나가기만 한 빈 필드는 지적하지 않는다.
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  const touched = useRef<Record<string, boolean>>({});
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [consentOpen, setConsentOpen] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const [receiptNo, setReceiptNo] = useState('-');
  const [phoneHint, setPhoneHint] = useState(false);
  const [lkPhoneHint, setLkPhoneHint] = useState(false);
  const phoneHintTimer = useRef<ReturnType<typeof setTimeout>>();
  const lkPhoneHintTimer = useRef<ReturnType<typeof setTimeout>>();

  // 토스트
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'error'; show: boolean }>({ msg: '', type: 'ok', show: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const showToast = useCallback((msg: string, type: 'ok' | 'error' = 'ok') => {
    setToast({ msg, type, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3800);
  }, []);

  // 조회
  const [lkName, setLkName] = useState('');
  const [lkPhone, setLkPhone] = useState('');
  const [lkErr, setLkErr] = useState<{ name?: boolean; phone?: boolean }>({});
  const [lkRecs, setLkRecs] = useState<ReportRecord[] | null>(null);
  const [lkNotFound, setLkNotFound] = useState(false);
  const [cardOpen, setCardOpen] = useState<Record<number, boolean>>({});
  const [cardPw, setCardPw] = useState<Record<number, string>>({});
  const [cardPwErr, setCardPwErr] = useState<Record<number, string>>({});
  const [cardRevealed, setCardRevealed] = useState<Record<number, boolean>>({});

  const resetReport = useCallback(() => {
    setForm({ ...emptyForm });
    setErrs({});
    setFieldErr({});
    touched.current = {};
    setAgree1(false);
    setAgree2(false);
    setConsentOpen({});
    setDone(false);
    setPhoneHint(false);
  }, []);
  const resetLookup = useCallback(() => {
    setLkName('');
    setLkPhone('');
    setLkErr({});
    setLkRecs(null);
    setLkNotFound(false);
    setCardOpen({});
    setCardPw({});
    setCardPwErr({});
    setCardRevealed({});
    setLkPhoneHint(false);
  }, []);

  const setTab = useCallback((t: Tab) => {
    if (t === 'report' && done) resetReport();
    setTabState(t);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [done, resetReport]);

  useEffect(() => {
    if (open) {
      setTabState(initialTab);
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
    } else {
      // 닫힐 때 초기화 (v26 close: resetLookup + resetReport)
      resetReport();
      resetLookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialTab]);

  const upd = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // 검증 결과를 필드 키에 반영 (null 이면 해제)
  const setErrFor = useCallback((k: string, msg: string | null) => {
    setFieldErr((s) => {
      if (!msg) {
        if (!(k in s)) return s;
        const n = { ...s };
        delete n[k];
        return n;
      }
      return s[k] === msg ? s : { ...s, [k]: msg };
    });
  }, []);

  // 검증 타이밍 — 늦게 지적하고, 빠르게 풀어준다.
  // 입력 중에는 지적하지 않되(아직 다 치지 않았다), 이미 에러가 뜬 뒤에는 매 입력마다
  // 재검증해 고치는 순간 해제한다(blur 를 기다리게 하지 않는다).
  const onValidatedChange = (k: ValidatedField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    touched.current[k] = true;
    if (fieldErr[k]) setErrFor(k, validateField(k, v));
  };
  // 포커스 이탈 = "이 필드 다 썼다"는 신호. 이 시점에 최초 검증한다.
  // 붙여넣기로 섞여 들어온 앞뒤 공백은 여기서 state 까지 정리한다.
  const onValidatedBlur = (k: ValidatedField) => () => {
    const trimmed = (form[k] || '').trim();
    if (trimmed !== form[k]) setForm((f) => ({ ...f, [k]: trimmed }));
    if (!trimmed && !touched.current[k]) return;
    setErrFor(k, validateField(k, trimmed));
  };

  const onPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const bad = hasNonPhoneChar(raw);
    setForm((f) => ({ ...f, phone: fmtPhone(raw) }));
    if (bad) {
      setPhoneHint(true);
      clearTimeout(phoneHintTimer.current);
      phoneHintTimer.current = setTimeout(() => setPhoneHint(false), 2500);
    } else setPhoneHint(false);
  };
  const onLkPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const bad = hasNonPhoneChar(raw);
    setLkPhone(fmtPhone(raw));
    if (bad) {
      setLkPhoneHint(true);
      clearTimeout(lkPhoneHintTimer.current);
      lkPhoneHintTimer.current = setTimeout(() => setLkPhoneHint(false), 2500);
    } else setLkPhoneHint(false);
  };

  // ── 신고 접수 (필수 6개: 성함·전화번호·비밀번호·이메일·제목·내용) ──
  // 이메일은 처리결과 안내 채널이므로 필수(정보보호팀 회신 조건부 지침 + 사업 결정 · G2-11).
  function submitReport() {
    const LBL: Record<string, string> = { name: '성함', phone: '전화번호', pw: '비밀번호', email: '이메일', title: '제목', content: '내용' };
    // 이메일은 아래 필드 단위 검증이 빈값·형식을 함께 판정하므로 이 목록에서 제외한다.
    const reqs: (keyof typeof emptyForm)[] = ['name', 'phone', 'pw', 'title', 'content'];
    const next: Record<string, boolean> = {};
    const miss: string[] = [];
    let ok = true;
    reqs.forEach((id) => {
      const bad = !(form[id] || '').trim();
      next[id] = bad;
      if (bad) { ok = false; miss.push(LBL[id]); }
    });
    // 이메일: blur 없이 바로 제출한 경우를 대비해 여기서 다시 검증한다.
    // 미입력/형식 오류를 필드 아래 문구로 구분해 알린다(토스트는 항목명만).
    const email = (form.email || '').trim();
    if (email !== form.email) setForm((f) => ({ ...f, email }));
    const emailErrMsg = validateField('email', email);
    setErrFor('email', emailErrMsg);
    if (emailErrMsg) { ok = false; miss.push(LBL.email); }
    // 비번확인: 값 있을 때만 일치검증
    if (form.pw2 && form.pw !== form.pw2) {
      next.pw2 = true;
      ok = false;
      miss.push('비밀번호 확인');
    } else next.pw2 = false;
    // 동의 2건 필수
    const c1 = !agree1, c2 = !agree2;
    next.__c1 = c1;
    next.__c2 = c2;
    if (c1 || c2) { ok = false; miss.push('개인정보 동의'); }
    setErrs(next);
    if (!ok) {
      // 값이 모두 유효하면 포커스를 건드리지 않는다(기존 정책). 오류가 있을 때만 그 자리로 보낸다.
      // invalid 클래스는 위 setState 가 커밋된 뒤에야 DOM 에 붙으므로 다음 프레임에서 찾는다.
      requestAnimationFrame(() => {
        const first = bodyRef.current?.querySelector<HTMLElement>('#pv-report-form .field.invalid, #pv-report-form .consent.invalid');
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        first?.querySelector<HTMLElement>('input, select, textarea')?.focus({ preventScroll: true });
      });
      showToast(miss.join(', ') + ' 항목을 확인해 주세요.', 'error');
      return;
    }
    const no = genNo();
    reports.push({
      no, name: form.name.trim(), phone: form.phone.trim(), pw: form.pw, email: form.email.trim(),
      role: form.role, ttype: form.ttype, course: form.course.trim(), org: form.org.trim(),
      target: form.target, title: form.title.trim(), content: form.content.trim(), status: 0,
      date: todayStr(), time: nowTimeStr(),
    });
    setReceiptNo(no);
    setDone(true);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    showToast('신고가 정상적으로 접수되었습니다.');
  }

  function fromDoneToLookup() {
    const nm = form.name.trim();
    const ph = form.phone.trim();
    setTabState('lookup');
    setLkName(nm);
    setLkPhone(ph);
  }

  // ── 조회 (이름·연락처 비어있지 않으면 전체 최신순, 매칭필터 없음) ──
  function doLookup() {
    const name = lkName.trim();
    const phone = lkPhone.trim();
    setLkErr({ name: !name, phone: !phone });
    if (!name || !phone) {
      showToast('이름과 연락처를 입력해 주세요.', 'error');
      return;
    }
    const recs = reports.slice().reverse();
    setCardOpen({});
    setCardPw({});
    setCardPwErr({});
    setCardRevealed({});
    if (!recs.length) {
      setLkNotFound(true);
      setLkRecs(null);
      return;
    }
    setLkNotFound(false);
    setLkRecs(recs);
  }
  function lookupBack() {
    setLkRecs(null);
    setLkNotFound(false);
  }
  function verifyCard(i: number, rec: ReportRecord) {
    const v = cardPw[i] || '';
    if (v !== rec.pw && v !== REPORT_MASTER_PW) {
      setCardPwErr((s) => ({ ...s, [i]: '비밀번호가 일치하지 않습니다.' }));
      return;
    }
    setCardPwErr((s) => ({ ...s, [i]: '' }));
    setCardRevealed((s) => ({ ...s, [i]: true }));
  }

  const fld = (k: keyof typeof emptyForm) => `field${errs[k] ? ' invalid' : ''}`;

  return (
    <div
      className={`pv-overlay${open ? ' open' : ''}`}
      id="prevent-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pv-modal-title"
      aria-hidden={!open}
      onPointerDown={(e) => { if (e.target === e.currentTarget) (e.currentTarget as HTMLElement).dataset.down = '1'; else (e.currentTarget as HTMLElement).dataset.down = '0'; }}
      onPointerUp={(e) => { if (e.target === e.currentTarget && (e.currentTarget as HTMLElement).dataset.down === '1') onClose(); }}
    >
      <div className="pv-dialog" ref={overlayRef}>
        <div className="pv-head">
          <h3 id="pv-modal-title">부정훈련 예방 및 신고</h3>
          <button className="pv-close" type="button" aria-label="닫기" onClick={onClose} data-autofocus>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="pv-tabs" role="tablist">
          <button className={`pv-tab${tab === 'info' ? ' on' : ''}`} type="button" role="tab" aria-selected={tab === 'info'} onClick={() => setTab('info')}><IcShield />예방 안내</button>
          <button className={`pv-tab${tab === 'report' ? ' on' : ''}`} type="button" role="tab" aria-selected={tab === 'report'} onClick={() => setTab('report')}><IcReport />신고 접수</button>
          <button className={`pv-tab${tab === 'lookup' ? ' on' : ''}`} type="button" role="tab" aria-selected={tab === 'lookup'} onClick={() => setTab('lookup')}><IcSearch />신고 조회</button>
        </div>

        <div className="pv-body" ref={bodyRef}>
          {/* ── 예방 안내 ── */}
          <div className={`pv-pane${tab === 'info' ? ' on' : ''}`} id="pv-pane-info">
            <p className="pv-lead">KG에듀원은 부정훈련을 철저히 관리합니다. 부정훈련이 적발되면 진도율·평가점수와 관계없이 미수료 처리되며, 고용보험상의 정부지원을 받을 수 없습니다.</p>
            <h4 className="pv-h"><svg className="pvi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 4.3 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>부정훈련이란?</h4>
            <p>「국민 평생 직업능력 개발법」에 따른 직업능력개발훈련을 법과 규정을 벗어난 방법으로 실시하는 것을 말합니다. 대표적으로 훈련생이 아닌 타인의 대리 수강·평가, 훈련비 지원금 리베이트 거래, 승인 내용과 다르게 운영하는 훈련내용 미준수 등이 있습니다.</p>
            <p className="pv-warn"><svg className="pvi-warn" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 4.3 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg><span>적발 시 훈련기관·기업·개인은 훈련비 지원금 징수(부정수급액 최대 5배)와 지원 제한 등 행정처분 및 형사처벌을 받을 수 있습니다.</span></p>
            <h4 className="pv-h"><svg className="pvi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.6-3.1 8.2-7 10-3.9-1.8-7-5.4-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>본인 수강 확인</h4>
            <table className="pv-table"><thead><tr><th>학습 단계</th><th>본인 확인 방식</th></tr></thead><tbody>
              <tr><td>최초 로그인</td><td>휴대폰 · I-PIN</td></tr>
              <tr><td>과정 입과 시 최초 1회</td><td>mOTP · 공동인증서 · 휴대폰 · I-PIN</td></tr>
              <tr><td>1일 1회 진도 학습 · 평가 · 과제</td><td>mOTP · 휴대폰 · I-PIN</td></tr>
            </tbody></table>
            <h4 className="pv-h"><svg className="pvi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.2-4.2"/></svg>부정훈련 적발 기준</h4>
            <ul className="pv-list">
              <li>연속된 시간에 동일 IP·PC 정보에서 평가를 제출한 경우</li>
              <li>접속자의 FDS 정보가 동일한 경우</li>
              <li>사업자 정보가 다르지만 동일 IP에서 수강·평가한 경우</li>
            </ul>
            <p className="pv-note">위 항목 중 하나라도 해당하면 부정훈련 검출 프로그램을 통해 절차를 진행합니다.</p>
            <h4 className="pv-h"><svg className="pvi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>KG에듀원의 부정훈련 방지 약속</h4>
            <ul className="pv-list">
              <li>훈련생의 진도·평가를 담당자나 외부 인원이 대신 수행하지 않습니다.</li>
              <li>수료 기준에 미달한 훈련생을 임의로 수료 처리하지 않습니다.</li>
              <li>승인받은 콘텐츠·교재와 평가문항으로 진행하며, 평가 전 모범답안을 제공하지 않습니다.</li>
              <li>경력·학력이 인증된 자격 있는 교·강사가 역할을 수행합니다.</li>
              <li>수강을 강요하지 않으며, 대리수강·모사답안 방지를 위해 상시 모니터링합니다.</li>
            </ul>
            <div className="pv-cta">
              <div><b>부정훈련을 발견하셨나요?</b></div>
              <button className="btn btn-ink" type="button" onClick={() => setTab('report')}><IcReport />부정훈련 신고하기</button>
            </div>
          </div>

          {/* ── 신고 접수 ── */}
          <div className={`pv-pane${tab === 'report' ? ' on' : ''}`} id="pv-pane-report">
            {!done ? (
              <>
                <div className="pv-toplink"><button type="button" className="pv-link" onClick={() => setTab('lookup')}><IcSearch />이미 신고하셨나요? 신고 조회하기</button></div>
                {/* 법령 근거 안내 — 정보보호팀 회신(G2-11) 제공 원문 그대로. 기존 안내 박스 스타일 재사용 */}
                <p className="pv-warn"><span><b>[부정훈련 신고 안내]</b> 본 신고 채널은 「국민 평생 직업능력 개발법」 및 「직업능력개발훈련 모니터링 및 지도·감독에 관한 규정」 제14조(위반사항 조치 등)에 의거하여, 훈련기관의 부정수급 및 부정행위를 예방하고 공정한 훈련 환경을 조성하기 위해 운영됩니다.</span></p>
                <p className="pv-lead">KG에듀원은 부정·부실훈련을 줄이고 올바른 훈련문화를 만들기 위해 노력합니다. 아래로 신고 내용을 남겨 주시면 접수·처리되며, 입력하신 정보는 비공개로 처리됩니다.</p>

                <div id="pv-report-form">
                  <div className="pv-fs">
                    <div className="pv-fs-head"><span className="pv-fs-t"><svg className="pvi-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>신고자 정보</span><span className="pv-fs-d">입력 정보는 비공개 처리됩니다</span></div>
                    <div className="pv-frow">
                      <div className={fld('name')}><label>성함 <span className="req">*</span></label><input id="pv-name" aria-label="성함" type="text" value={form.name} onChange={upd('name')} /><span className="err">필수 항목을 확인해 주세요.</span></div>
                      <div className={fld('phone')}><label>전화번호 <span className="req">*</span></label><input id="pv-phone" aria-label="전화번호" type="tel" inputMode="numeric" placeholder="010-0000-0000" value={form.phone} onChange={onPhone} />{phoneHint && <span className="phone-hint">숫자만 입력할 수 있어요.</span>}<span className="err">필수 항목을 확인해 주세요.</span></div>
                    </div>
                    <div className="pv-frow">
                      <div className={fld('pw')}><label>접수 비밀번호 <span className="req">*</span></label><input id="pv-pw" aria-label="접수 비밀번호" type="password" value={form.pw} onChange={upd('pw')} /><span className="fnote">상세 조회 시 사용됩니다</span><span className="err">필수 항목을 확인해 주세요.</span></div>
                      <div className={fld('pw2')}><label>비밀번호 확인</label><input id="pv-pw2" aria-label="비밀번호 확인" type="password" value={form.pw2} onChange={upd('pw2')} /><span className="err">비밀번호가 일치하지 않습니다.</span></div>
                    </div>
                    <div className="pv-frow">
                      {/* 이메일 = 접수 비밀번호와 함께 신고 조회 인증 키. 오입력 시 본인도 다시 열 수 없다 */}
                      <div className={`field${fieldErr.email ? ' invalid' : ''}`}><label htmlFor="pv-email">이메일 <span className="req">*</span></label><input id="pv-email" aria-label="이메일" type="email" inputMode="email" autoComplete="email" placeholder="name@company.com" value={form.email} onChange={onValidatedChange('email')} onBlur={onValidatedBlur('email')} aria-invalid={fieldErr.email ? true : undefined} aria-describedby={fieldErr.email ? 'pv-email-error' : undefined} /><span className="err" id="pv-email-error" aria-live="polite">{fieldErr.email || ''}</span></div>
                      <div className="field"><label>신고자 신분</label><div className="sel"><select id="pv-role" aria-label="신고자 신분" value={form.role} onChange={upd('role')}><option value="">선택</option><option>훈련생</option><option>훈련강사</option><option>훈련기관 관계자</option><option>기업 관계자</option><option>기타</option></select></div></div>
                    </div>
                  </div>

                  <div className="pv-fs">
                    <span className="pv-fs-t"><svg className="pvi-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h13a1 1 0 0 1 1 1v15H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1z"/><path d="M5 17h14"/></svg>훈련 정보</span>
                    <div className="pv-frow">
                      <div className="field"><label>훈련 구분</label><div className="sel"><select id="pv-ttype" aria-label="훈련 구분" value={form.ttype} onChange={upd('ttype')}><option value="">선택</option><option>사업주훈련</option><option>디지털아카이브</option><option>AI 기초훈련</option><option>국민내일배움카드</option><option>기타</option></select></div></div>
                      <div className="field"><label>훈련 과정명</label><input id="pv-course" aria-label="훈련 과정명" type="text" value={form.course} onChange={upd('course')} /></div>
                    </div>
                    <div className="field"><label>훈련 기관</label><input id="pv-org" aria-label="훈련 기관" type="text" value={form.org} onChange={upd('org')} /></div>
                  </div>

                  <div className="pv-fs">
                    <span className="pv-fs-t"><svg className="pvi-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h8"/><path d="M16.5 3.5a2 2 0 0 1 3 3L8 18l-4 1 1-4z"/></svg>신고 내용</span>
                    <div className="field"><label>신고 대상</label><div className="sel"><select id="pv-target" aria-label="신고 대상" value={form.target} onChange={upd('target')}><option value="">선택</option><option>훈련생</option><option>훈련강사</option><option>훈련내용</option><option>기타</option></select></div></div>
                    <div className={fld('title')}><label>제목 <span className="req">*</span></label><input id="pv-title" aria-label="제목" type="text" value={form.title} onChange={upd('title')} /><span className="err">필수 항목을 확인해 주세요.</span></div>
                    <div className={fld('content')}><label>내용 <span className="req">*</span></label><textarea id="pv-content" aria-label="내용" rows={4} placeholder="신고 내용을 구체적으로 작성해 주세요." value={form.content} onChange={upd('content')} /><span className="err">필수 항목을 확인해 주세요.</span></div>
                  </div>

                  <div className="consent-group" style={{ marginTop: 8 }}>
                    <div className={`consent${errs.__c1 && !agree1 ? ' invalid' : ''}`} id="pv-c1-wrap">
                      <label className="consent-main"><input type="checkbox" id="pv-agree1" checked={agree1} onChange={(e) => setAgree1(e.target.checked)} /><span><b className="c-tag req-tag">필수</b> 개인정보 수집·이용 안내</span></label>
                      <button type="button" className="consent-view" onClick={() => setConsentOpen((s) => ({ ...s, p1: !s.p1 }))}>{consentOpen.p1 ? '접기' : '전문 보기'}</button>
                    </div>
                    <div className="consent-text" style={{ maxHeight: consentOpen.p1 ? CONSENT_TEXT_MAXH : 0 }}><div className="ct-inner"><p><b>개인정보 수집·이용 안내 (필수)</b></p><p>부정훈련 신고센터를 통해 신고 접수 시 아래와 같이 개인정보를 수집·이용합니다.</p><p><b>수집 항목</b><br />(필수) 신고자의 성명, 휴대폰번호, 이메일, 접수 비밀번호, 신고 제목, 신고 내용<br />(선택) 신고자 신분, 비밀번호 확인, 훈련 구분, 훈련 과정명, 훈련 기관, 신고 대상</p><p><b>수집·이용 목적</b><br />신고의 접수·처리 등 소관 업무 수행</p><p><b>보유·이용 기간</b><br />신고 접수와 관련해 수집한 개인정보는 10년간 기록·보존되며, 기간 경과 시 관련 법령에 따라 파기합니다.</p></div></div>
                    <div className={`consent${errs.__c2 && !agree2 ? ' invalid' : ''}`} id="pv-c2-wrap">
                      <label className="consent-main"><input type="checkbox" id="pv-agree2" checked={agree2} onChange={(e) => setAgree2(e.target.checked)} /><span><b className="c-tag req-tag">필수</b> 개인정보 제3자 제공</span></label>
                      <button type="button" className="consent-view" onClick={() => setConsentOpen((s) => ({ ...s, p2: !s.p2 }))}>{consentOpen.p2 ? '접기' : '전문 보기'}</button>
                    </div>
                    <div className="consent-text" style={{ maxHeight: consentOpen.p2 ? CONSENT_TEXT_MAXH : 0 }}><div className="ct-inner"><p><b>개인정보의 제3자 제공 (필수)</b></p><p><b>제공받는 기관</b><br />훈련기관 주소 기준 관할 고용복지플러스센터, 고용노동부</p><p><b>제공 목적</b><br />부정훈련 신고사항 검토 및 지도점검 등 훈련품질관리 업무</p><p><b>제공 항목</b><br />신고자의 성명, 휴대폰번호, 신고자 신분</p><p><b>보유·이용 기간</b><br />관련 법령에 따라 10년간 기록·보존되며, 기간 경과 시 파기합니다.</p></div></div>
                  </div>
                  <button className="btn btn-ink" id="pv-submit" type="button" style={{ width: '100%', marginTop: 20 }} onClick={submitReport}>신고 접수</button>
                </div>
              </>
            ) : (
              <div className="pv-done show" id="pv-done">
                <div className="check"><svg className="pvi-done" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg></div>
                <h4>신고가 접수되었습니다.</h4>
                <p>담당자가 확인 후 절차를 진행합니다.<br />접수 시 입력하신 이름·연락처로 신고 내역을 조회하실 수 있습니다.</p>
                <div className="pv-receipt"><span>접수번호</span><b>{receiptNo}</b></div>
                <p className="pv-receipt-note">이름·연락처로 목록을 조회하고, 상세 내용은 이 신고의 비밀번호로 확인합니다.</p>
                <div className="pv-done-cta">
                  <button className="btn btn-ink" type="button" onClick={fromDoneToLookup}><IcSearch />신고 조회하기</button>
                  <button className="btn-line-dark" type="button" onClick={onClose}>닫기</button>
                </div>
              </div>
            )}
          </div>

          {/* ── 신고 조회 ── */}
          <div className={`pv-pane${tab === 'lookup' ? ' on' : ''}`} id="pv-pane-lookup">
            <p className="pv-lead">접수 시 입력하신 <b>이름</b>과 <b>연락처</b>로 신고 내역을 조회하실 수 있습니다. 상세 내용은 신고마다 설정한 <b>비밀번호</b>로 확인합니다.</p>
            {!lkRecs ? (
              <>
                <div id="pv-lookup-form">
                  <div className="pv-fs"><div className="pv-frow">
                    <div className={`field${lkErr.name ? ' invalid' : ''}`}><label>이름 <span className="req">*</span></label><input id="pv-lk-name" aria-label="이름" type="text" placeholder="홍길동" value={lkName} onChange={(e) => setLkName(e.target.value)} /><span className="err">필수 항목을 확인해 주세요.</span></div>
                    <div className={`field${lkErr.phone ? ' invalid' : ''}`}><label>연락처 <span className="req">*</span></label><input id="pv-lk-phone" aria-label="연락처" type="tel" inputMode="numeric" placeholder="010-1234-5678" value={lkPhone} onChange={onLkPhone} />{lkPhoneHint && <span className="phone-hint">숫자만 입력할 수 있어요.</span>}<span className="err">필수 항목을 확인해 주세요.</span></div>
                  </div></div>
                  <button className="btn btn-ink" id="pv-lookup-btn" type="button" style={{ width: '100%', marginTop: 6 }} onClick={doLookup}>신고 내역 조회</button>
                </div>
                {lkNotFound && <div className="pv-notfound">조회할 신고 내역이 없습니다.</div>}
              </>
            ) : (
              <div id="pv-lookup-result" aria-live="polite">
                <div className="pv-list-head"><span>총 <b>{lkRecs.length}</b>건의 신고 내역</span><button className="pv-link" id="pv-lk-back" type="button" onClick={lookupBack}>← 다시 조회</button></div>
                {lkRecs.map((r, i) => (
                  <div className={`pv-rcard${cardOpen[i] ? ' open' : ''}`} key={r.no + i}>
                    <div className="pv-rc-head" onClick={() => setCardOpen((s) => ({ ...s, [i]: !s[i] }))}>
                      <div className="pv-rc-top"><span className="pv-rc-no">{r.no}</span><span className={`pv-badge s${r.status}`}>{REPORT_STATUS[r.status]}</span><span className="pv-rc-chev">›</span></div>
                      <div className="pv-rc-title">{r.title}</div>
                      <div className="pv-rc-meta">{r.ttype || '훈련구분 미지정'} · {r.date} 접수</div>
                      {/* 인증 전: 내용 자리에 안내 문구(일부 발췌도 금지 — 문맥으로 신고 대상 유추 가능)
                          인증 후: 상세 패널 '내용' 행과 중복되므로 이 줄은 표시하지 않는다 */}
                      {!cardRevealed[i] && <div className="pv-rc-preview pv-rc-locked">{CONTENT_LOCKED_MSG}</div>}
                    </div>
                    <div className={`pv-rc-detail${cardOpen[i] ? ' open' : ''}`}>
                      {!cardRevealed[i] ? (
                        <div className="pv-rc-pw">
                          <label>이 신고의 비밀번호</label>
                          <div className="pv-rc-pwrow">
                            <input type="password" placeholder="접수 시 설정한 비밀번호" value={cardPw[i] || ''} onChange={(e) => setCardPw((s) => ({ ...s, [i]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') verifyCard(i, r); }} />
                            <button className="btn-line-dark" type="button" onClick={() => verifyCard(i, r)}>확인</button>
                          </div>
                          <span className="pv-rc-err">{cardPwErr[i] || ''}</span>
                        </div>
                      ) : (
                        <div className="pv-rc-content">
                          <dl className="pv-dl2">
                            <dt>접수번호</dt><dd>{r.no}</dd>
                            <dt>접수일시</dt><dd>{fmtReceivedAt(r)}</dd>
                            <dt>신고자</dt><dd>{r.name} · {r.phone}</dd>
                            <dt>이메일</dt><dd>{r.email || '-'}</dd>
                            <dt>신고자 신분</dt><dd>{r.role || '-'}</dd>
                            <dt>훈련 구분</dt><dd>{r.ttype || '-'}</dd>
                            <dt>훈련 과정명</dt><dd>{r.course || '-'}</dd>
                            <dt>훈련 기관</dt><dd>{r.org || '-'}</dd>
                            <dt>신고 대상</dt><dd>{r.target || '-'}</dd>
                            <dt>제목</dt><dd>{r.title}</dd>
                            <dt>내용</dt><dd className="pv-dd-content">{r.content}</dd>
                          </dl>
                          {r.status < 3 && (
                            <div className="pv-steps">
                              {['접수 완료', '검토 중', '처리 완료'].map((s, k) => (
                                <span key={s} style={{ display: 'contents' }}>
                                  <span className={`pv-step${k <= Math.min(r.status, 2) ? ' on' : ''}`}><span className="dot" />{s}</span>
                                  {k < 2 && <span className="pv-step-arrow">›</span>}
                                </span>
                              ))}
                            </div>
                          )}
                          {r.answer && <div className="pv-answer"><b>처리 결과</b><p>{r.answer}</p></div>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 토스트 (모달당 1개 · Footer=layout 단일 인스턴스) */}
      <div className={`toast${toast.show ? ' show' : ''}${toast.type === 'error' ? ' err' : ''}`} id="toast" role="status" aria-live="polite">
        {toast.type === 'error' ? (
          <svg className="tico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
        ) : (
          <svg className="tico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></svg>
        )}
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}
