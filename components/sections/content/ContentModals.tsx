'use client';

import { EMAIL_RE } from '@/lib/utils';
import { createContext, useContext, useState } from 'react';
import Modal from '@/components/common/Modal';
import ConsentGroup from '@/components/common/ConsentGroup';
import { CONSENT_TEXTS, DOWNLOAD_OPTIN_BANNER } from '@/data/consent';
import { CONSULT_MODAL, DOWNLOAD_MODAL, DOWNLOAD, downloadFileName } from '@/data/content';

interface Ctx { openConsult: (axis?: string) => void; openDownload: () => void }
const ModalCtx = createContext<Ctx>({ openConsult: () => {}, openDownload: () => {} });
export const useContentModal = () => useContext(ModalCtx);

// 다운로드 모달 헤더 아이콘 — 다운로드 카드(.xls)와 동일한 스프레드시트 글리프 재사용
const IcSheet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M4 9h16M4 15h16M10 3v18" /></svg>
);
// 상담 모달 헤더 아이콘 — GNB '교육 상담' 버튼과 동일한 말풍선 글리프 재사용
const IcChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.9 8.4 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.5a8.4 8.4 0 0 1-.8-3.6A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" /></svg>
);


function triggerDL() {
  const a = document.createElement('a');
  a.href = DOWNLOAD.fileHref;
  // 저장 파일명에 기준월을 실어 보낸다 — 화면에서 뺀 시점 표기가 사는 곳(DF-021-B).
  // 파일명 하드코딩 금지: DOWNLOAD.basisMonth 하나만 고치면 여기까지 따라온다.
  a.download = downloadFileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function ConsultBody({ axis, onClose }: { axis?: string; onClose: () => void }) {
  const [v, setV] = useState({ name: '', org: '', mail: '', msg: '' });
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [agree, setAgree] = useState(false);
  const [agreeErr, setAgreeErr] = useState(false);
  const [done, setDone] = useState(false);
  const upd = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV((s) => ({ ...s, [k]: e.target.value }));
  function submit() {
    const next: Record<string, boolean> = {};
    let ok = true;
    (['name', 'org'] as const).forEach((k) => { const bad = !(v[k] || '').trim(); next[k] = bad; if (bad) ok = false; });
    const eok = EMAIL_RE.test((v.mail || '').trim());
    next.mail = !eok; if (!eok) ok = false;
    setErrs(next);
    setAgreeErr(!agree);
    if (!agree) ok = false;
    if (!ok) return;
    // 제출 payload — 동의 사실 입증 기록(추후 연동 슬롯). 입력값은 분석 도구로 전송하지 않는다.
    void { ...v, privacy_agreed: true, agreed_at: new Date().toISOString() };
    setDone(true);
  }
  if (done) return <div className="okmsg"><div className="ic">✓</div><h3>{CONSULT_MODAL.successTitle}</h3><p className="lead">{CONSULT_MODAL.successMsg}</p><button className="btn-line-dark" style={{ marginTop: 16 }} onClick={onClose}>닫기</button></div>;
  const fld = (k: string) => `field${errs[k] ? ' invalid' : ''}`;
  return (
    <div>
      {axis && <div className="ctx">문의 대상: {axis}</div>}
      <div className={fld('name')}><label>담당자명 <span className="req">*</span></label><input aria-label="담당자명" placeholder="홍길동" value={v.name} onChange={upd('name')} /><span className="err">담당자명을 입력해 주세요.</span></div>
      <div className={fld('org')}><label>회사/기관 <span className="req">*</span></label><input aria-label="회사/기관" placeholder="회사명" value={v.org} onChange={upd('org')} /><span className="err">회사/기관을 입력해 주세요.</span></div>
      <div className={fld('mail')}><label>이메일 <span className="req">*</span></label><input aria-label="이메일" type="email" placeholder="name@company.com" value={v.mail} onChange={upd('mail')} /><span className="err">올바른 이메일을 입력해 주세요.</span></div>
      <div className="field"><label>필요한 콘텐츠·과제</label><textarea aria-label="필요한 콘텐츠·과제" rows={3} placeholder="예: 전 직원 법정의무 + 실무자 생성형 AI + 기업 맞춤 제작" value={v.msg} onChange={upd('msg')} /></div>
      <ConsentGroup formKey="content" idPrefix="ct-" required={agree} onRequiredChange={(c) => { setAgree(c); if (c) setAgreeErr(false); }} error={agreeErr} />
      <button className="btn btn-ink" style={{ width: '100%', marginTop: 18 }} onClick={submit}>문의 보내기</button>
    </div>
  );
}

// 선택 동의(매월 리스트 수신)의 존재 여부 — 배너와 선택 동의 행이 이 한 값에 함께 종속된다.
// CONSENT_TEXTS.download.optional 을 null 로 바꾸면 둘 다 사라지므로,
// '배너만 남고 동의는 없는' 상태가 구조적으로 발생할 수 없다.
const HAS_DL_OPTIN = CONSENT_TEXTS.download.optional !== null;

function DownloadBody() {
  const [v, setV] = useState({ name: '', org: '', mail: '' });
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [agree, setAgree] = useState(false);
  const [agreeErr, setAgreeErr] = useState(false);
  const [optIn, setOptIn] = useState(false);
  const [done, setDone] = useState(false);
  const upd = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: e.target.value }));
  function submit() {
    const next: Record<string, boolean> = {};
    let ok = true;
    (['name', 'org'] as const).forEach((k) => { const bad = !(v[k] || '').trim(); next[k] = bad; if (bad) ok = false; });
    const eok = EMAIL_RE.test((v.mail || '').trim());
    next.mail = !eok; if (!eok) ok = false;
    setErrs(next);
    setAgreeErr(!agree);
    if (!agree) ok = false;
    if (!ok) return;
    // 제출 payload — 선택 동의는 렌더된 경우에만 포함. 입력값은 분석 도구로 전송하지 않는다.
    void { ...v, privacy_agreed: true, agreed_at: new Date().toISOString(), ...(HAS_DL_OPTIN ? { marketing_agreed: optIn } : {}) };
    setDone(true);
    triggerDL(); // 실제 xlsx 다운로드
  }
  if (done) return (
    <div className="okmsg">
      <div className="ic">✓</div>
      <h3>{DOWNLOAD_MODAL.okTitle}</h3>
      <p className="lead" style={{ margin: '0 auto 14px' }}>{DOWNLOAD_MODAL.okMsg}</p>
      <a className="btn btn-ink" href={DOWNLOAD.fileHref} download={downloadFileName} style={{ display: 'inline-flex' }}>{DOWNLOAD_MODAL.okBtn}</a>
    </div>
  );
  const fld = (k: string) => `field${errs[k] ? ' invalid' : ''}`;
  return (
    <div>
      {/* 안내 배너 — 선택 동의와 한 스위치에 묶임(§3-3 히든 스위치) */}
      {HAS_DL_OPTIN && <div className="ctx">{DOWNLOAD_OPTIN_BANNER}</div>}
      <div className={fld('name')}><label>담당자명 <span className="req">*</span></label><input aria-label="담당자명" placeholder="홍길동" value={v.name} onChange={upd('name')} /><span className="err">담당자명을 입력해 주세요.</span></div>
      <div className={fld('org')}><label>회사/기관 <span className="req">*</span></label><input aria-label="회사/기관" placeholder="회사명" value={v.org} onChange={upd('org')} /><span className="err">회사/기관을 입력해 주세요.</span></div>
      <div className={fld('mail')}><label>이메일 <span className="req">*</span></label><input aria-label="이메일" type="email" placeholder="name@company.com" value={v.mail} onChange={upd('mail')} /><span className="err">올바른 이메일을 입력해 주세요.</span></div>
      <ConsentGroup formKey="download" idPrefix="dl-" required={agree} onRequiredChange={(c) => { setAgree(c); if (c) setAgreeErr(false); }} error={agreeErr} optional={optIn} onOptionalChange={setOptIn} />
      <button className="btn btn-ink" style={{ width: '100%', marginTop: 18 }} onClick={submit}>
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 11l5 5 5-5M4 20h16" /></svg> {DOWNLOAD_MODAL.submit}
      </button>
    </div>
  );
}

export default function ContentModalProvider({ children }: { children: React.ReactNode }) {
  const [consult, setConsult] = useState<{ open: boolean; axis?: string }>({ open: false });
  const [dl, setDl] = useState(false);
  const openConsult = (axis?: string) => setConsult({ open: true, axis });

  return (
    <ModalCtx.Provider value={{ openConsult, openDownload: () => setDl(true) }}>
      {children}
      <Modal open={consult.open} onClose={() => setConsult({ open: false })} labelledBy="c-title" title={<span className="exp-head"><span className="cat-ic" aria-hidden="true"><IcChat /></span><span>{CONSULT_MODAL.title}</span><span className="mb">{CONSULT_MODAL.mb}</span></span>} maxWidth={480}>
        <ConsultBody axis={consult.axis} onClose={() => setConsult({ open: false })} />
      </Modal>
      <Modal open={dl} onClose={() => setDl(false)} labelledBy="d-title" title={<span className="exp-head"><span className="cat-ic" aria-hidden="true"><IcSheet /></span><span>{DOWNLOAD_MODAL.title}</span><span className="mb">{DOWNLOAD_MODAL.mb1} · {DOWNLOAD_MODAL.mb2}</span></span>} maxWidth={480}>
        <DownloadBody />
      </Modal>
    </ModalCtx.Provider>
  );
}
