'use client';

import { EMAIL_RE } from '@/lib/utils';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ConsentGroup from '@/components/common/ConsentGroup';
import { CONSENT_TEXTS, DOWNLOAD_OPTIN_BANNER } from '@/data/consent';
import { CONSULT_MODAL, DOWNLOAD_MODAL, DOWNLOAD, downloadFileName } from '@/data/content';
import { DOWNLOAD_CONFIG as DC } from '@/lib/download/config';
import { fetchFileWithProgress } from '@/lib/download/fetchWithProgress';
import { saveBlob } from '@/lib/download/saveBlob';
import { canUseBlobDownload } from '@/lib/download/canUseBlobDownload';

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

/** 다운로드 모달 상태 (기술명세서 §1) */
type DlStep = 'form' | 'preparing' | 'downloading' | 'saving' | 'done' | 'error';

/**
 * 리드 전송 슬롯 (기술명세서 §7).
 * 백엔드가 없으므로(CLAUDE.md §0-6) 지금은 항상 성공한다. 실제 API가 붙으면 이 함수만 교체하면 되고,
 * 호출부의 "전송 성공을 확인한 뒤에만 다운로드 단계로 진입한다" 순서는 그대로 유지된다.
 */
async function submitLead(payload: Record<string, unknown>): Promise<boolean> {
  void payload;
  return true;
}

const mb = (bytes: number) => (bytes / 1048576).toFixed(1);

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

const S = DOWNLOAD_MODAL.steps;

function DownloadBody({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [v, setV] = useState({ name: '', org: '', mail: '' });
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [agree, setAgree] = useState(false);
  const [agreeErr, setAgreeErr] = useState(false);
  const [optIn, setOptIn] = useState(false);

  // 상태 머신 (기술명세서 §1)
  const [step, setStep] = useState<DlStep>('form');
  const [showPreparing, setShowPreparing] = useState(false);
  const [pct, setPct] = useState(0);
  const [received, setReceived] = useState(0);
  const [total, setTotal] = useState(0);
  const [fails, setFails] = useState(0);
  const [direct, setDirect] = useState(false);
  const [live, setLive] = useState('');
  const [reduce, setReduce] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const closeTimer = useRef<number | null>(null);
  const prepTimer = useRef<number | null>(null);
  const lastTick = useRef(0);
  const lastMile = useRef(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  const upd = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: e.target.value }));

  const clearPrep = useCallback(() => {
    if (prepTimer.current !== null) { window.clearTimeout(prepTimer.current); prepTimer.current = null; }
  }, []);
  const clearAutoClose = useCallback(() => {
    if (closeTimer.current !== null) { window.clearTimeout(closeTimer.current); closeTimer.current = null; }
  }, []);

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // 닫힘 → 진행 중이면 중단하고 진행률·오류를 초기화한다(재진입 시 잔존 금지).
  useEffect(() => {
    if (open) return;
    abortRef.current?.abort();
    abortRef.current = null;
    clearPrep();
    clearAutoClose();
    setStep('form'); setShowPreparing(false); setPct(0); setReceived(0); setTotal(0);
    setFails(0); setDirect(false); setLive('');
    lastMile.current = -1;
  }, [open, clearPrep, clearAutoClose]);

  // 언마운트 정리 — 타이머 누수·중복 방지(§5-5)
  useEffect(() => () => { abortRef.current?.abort(); clearPrep(); clearAutoClose(); }, [clearPrep, clearAutoClose]);

  // 자동 닫힘 — 'done' 에서만 건다(§5-1). error·preparing·downloading 에서는 절대 걸지 않는다.
  useEffect(() => {
    if (step !== 'done') return;
    closeTimer.current = window.setTimeout(() => { closeTimer.current = null; onClose(); },
      direct ? DC.AUTO_CLOSE_MS_DIRECT : DC.AUTO_CLOSE_MS);
    // 사용자가 손을 대면 타이머를 해제하고 재개하지 않는다(§5-2).
    const dialog = rootRef.current?.closest('.pv-dialog');
    const cancel = () => clearAutoClose();
    dialog?.addEventListener('pointerenter', cancel);
    dialog?.addEventListener('focusin', cancel);
    dialog?.addEventListener('click', cancel);
    return () => {
      clearAutoClose();
      dialog?.removeEventListener('pointerenter', cancel);
      dialog?.removeEventListener('focusin', cancel);
      dialog?.removeEventListener('click', cancel);
    };
  }, [step, direct, onClose, clearAutoClose]);

  const onProgress = useCallback((recv: number, tot: number) => {
    const now = performance.now();
    const finished = tot > 0 && recv >= tot;
    // 청크마다 setState 하면 리렌더가 폭주한다 — 100ms throttle(완료분은 항상 반영)
    if (!finished && now - lastTick.current < DC.PROGRESS_THROTTLE_MS) return;
    lastTick.current = now;
    clearPrep();
    setStep((s) => (s === 'preparing' ? 'downloading' : s));
    setReceived(recv);
    setTotal(tot);
    if (tot > 0) {
      const p = Math.min(100, Math.round((recv / tot) * 100));
      setPct(p);
      // 스크린리더는 0·25·50·75·100% 네 지점에서만 갱신한다(§6-2)
      const mile = Math.floor(p / 25) * 25;
      if (mile > lastMile.current) { lastMile.current = mile; setLive(`${mile}%`); }
    }
  }, [clearPrep]);

  const startDownload = useCallback(async () => {
    // 비적합 환경 → directMode: 진행률·완료 감지 없이 직접 링크로 저장(§4)
    if (!canUseBlobDownload()) {
      setDirect(true);
      triggerDL();
      setLive(DOWNLOAD_MODAL.okTitle);
      setStep('done');
      return;
    }
    const ac = new AbortController();
    abortRef.current = ac;
    lastTick.current = 0; lastMile.current = -1;
    setPct(0); setReceived(0); setTotal(0); setLive('');
    setStep('preparing');
    setShowPreparing(false);
    // 0.3초 안에 끝나면 스피너를 아예 띄우지 않는다 — 깜빡임 방지(§2-1)
    prepTimer.current = window.setTimeout(() => { prepTimer.current = null; setShowPreparing(true); }, DC.PREPARING_DELAY_MS);
    try {
      const blob = await fetchFileWithProgress(DC.FILE_URL, ac.signal, onProgress);
      clearPrep();
      // 100% → 저장 → 완료. 저장은 즉시 끝나므로 saving 화면은 통상 렌더되지 않는다(§2-3).
      setStep('saving');
      saveBlob(blob, DC.FILE_NAME);
      setFails(0);
      setLive(S.doneTitle);
      setStep('done');
    } catch (e) {
      clearPrep();
      // 취소는 오류가 아니다 — 화면 없이 조용히 종료
      if (ac.signal.aborted || (e as Error)?.name === 'AbortError') return;
      setFails((f) => f + 1);
      setLive(S.errTitle);
      setStep('error');
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
    }
  }, [onProgress, clearPrep]);

  async function submit() {
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
    const payload = { ...v, privacy_agreed: true, agreed_at: new Date().toISOString(), ...(HAS_DL_OPTIN ? { marketing_agreed: optIn } : {}) };
    // 리드 전송이 성공한 뒤에만 다운로드 단계로 들어간다(§7). 실패하면 폼 단계에 머문다.
    const sent = await submitLead(payload);
    if (!sent) return;
    void startDownload();
  }

  function cancelDownload() {
    abortRef.current?.abort();
    onClose();
  }

  const busy = step === 'preparing' || step === 'downloading' || step === 'saving';
  // preparing이 아직 화면에 뜨지 않은 구간에서는 폼을 유지한다(§2-1 깜빡임 방지)
  const showForm = step === 'form' || (step === 'preparing' && !showPreparing);
  const fld = (k: string) => `field${errs[k] ? ' invalid' : ''}`;
  const autoCloseMs = direct ? DC.AUTO_CLOSE_MS_DIRECT : DC.AUTO_CLOSE_MS;

  return (
    <div ref={rootRef}>
      {/* 진행 상황 안내 — aria-describedby 대상 겸 라이브 리전 */}
      <p id="dl-desc" className="dl-live" role="status" aria-live="polite">{live}</p>

      {showForm ? (
        <div>
          {/* 안내 배너 — 선택 동의와 한 스위치에 묶임(§3-3 히든 스위치) */}
          {HAS_DL_OPTIN && <div className="ctx">{DOWNLOAD_OPTIN_BANNER}</div>}
          <div className={fld('name')}><label>담당자명 <span className="req">*</span></label><input aria-label="담당자명" placeholder="홍길동" value={v.name} onChange={upd('name')} /><span className="err">담당자명을 입력해 주세요.</span></div>
          <div className={fld('org')}><label>회사/기관 <span className="req">*</span></label><input aria-label="회사/기관" placeholder="회사명" value={v.org} onChange={upd('org')} /><span className="err">회사/기관을 입력해 주세요.</span></div>
          <div className={fld('mail')}><label>이메일 <span className="req">*</span></label><input aria-label="이메일" type="email" placeholder="name@company.com" value={v.mail} onChange={upd('mail')} /><span className="err">올바른 이메일을 입력해 주세요.</span></div>
          <ConsentGroup formKey="download" idPrefix="dl-" required={agree} onRequiredChange={(c) => { setAgree(c); if (c) setAgreeErr(false); }} error={agreeErr} optional={optIn} onOptionalChange={setOptIn} />
          <button className="btn btn-ink" style={{ width: '100%', marginTop: 18 }} onClick={submit} disabled={busy} aria-busy={busy}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 11l5 5 5-5M4 20h16" /></svg> {DOWNLOAD_MODAL.submit}
          </button>
        </div>
      ) : (
        <div className="okmsg">
          {step === 'preparing' && (
            <>
              <div className="ic" aria-hidden="true"><Loader2 className="dl-spin" /></div>
              <h3>{S.preparingTitle}</h3>
              <p className="lead">{DC.FILE_SIZE_LABEL} · {S.preparingMsg}</p>
              <div className="dl-acts"><button className="dl-text" type="button" onClick={cancelDownload}>{S.cancel}</button></div>
            </>
          )}

          {step === 'downloading' && (
            <>
              <div className="ic" aria-hidden="true"><Loader2 className="dl-spin" /></div>
              <h3>{S.downloadingTitle}</h3>
              <div className="dl-prog">
                <div className="dl-track" role="progressbar" aria-label={S.downloadingTitle} aria-valuemin={0} aria-valuemax={100} aria-valuenow={total > 0 ? pct : undefined}>
                  <div className={`dl-fill${total > 0 ? '' : ' indet'}`} style={total > 0 ? { width: `${pct}%` } : undefined} />
                </div>
                {/* 수치는 라이브 리전이 따로 읽으므로 시각 표기만 담당 */}
                <p className="dl-num" aria-hidden="true">
                  {total > 0 ? `${pct}% · ${mb(received)}MB / ${mb(total)}MB` : `${mb(received)}MB ${S.downloadingIndet}`}
                </p>
              </div>
              <div className="dl-acts"><button className="dl-text" type="button" onClick={cancelDownload}>{S.cancel}</button></div>
            </>
          )}

          {step === 'saving' && (
            <>
              <div className="ic" aria-hidden="true"><Loader2 className="dl-spin" /></div>
              <h3>{S.savingTitle}</h3>
            </>
          )}

          {step === 'done' && (
            <>
              <div className="ic" aria-hidden="true"><Check /></div>
              <h3>{direct ? DOWNLOAD_MODAL.okTitle : S.doneTitle}</h3>
              <p className="lead" style={{ margin: '0 auto 14px' }}>{direct ? DOWNLOAD_MODAL.okMsg : S.doneMsg}</p>
              <p className="dl-hint">{S.doneHint}</p>
              {!reduce && <div className="dl-count" aria-hidden="true"><i style={{ animationDuration: `${autoCloseMs}ms` }} /></div>}
              <div className="dl-acts"><button className="btn-line-dark" type="button" onClick={onClose}>{S.close}</button></div>
              <a className="dl-text" href={DC.FILE_URL} download={DC.FILE_NAME}>{S.fallback}</a>
            </>
          )}

          {step === 'error' && (
            <>
              <div className="ic dl-err" aria-hidden="true"><AlertCircle /></div>
              <h3>{S.errTitle}</h3>
              {/* 상태코드는 노출하지 않는다(§2-5) */}
              <p className="lead" style={{ margin: '0 auto 14px' }}>{S.errMsg}</p>
              <div className="dl-acts">
                {fails < DC.MAX_RETRY && <button className="btn btn-ink" type="button" onClick={() => void startDownload()}>{S.retry}</button>}
                <a className="btn btn-line-dark" href={DC.FILE_URL} download={DC.FILE_NAME}>{S.direct}</a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ContentModalProvider({ children }: { children: React.ReactNode }) {
  const [consult, setConsult] = useState<{ open: boolean; axis?: string }>({ open: false });
  const [dl, setDl] = useState(false);
  const openConsult = (axis?: string) => setConsult({ open: true, axis });
  // 자동 닫힘 타이머가 매 렌더마다 리셋되지 않도록 참조를 고정한다.
  const closeDl = useCallback(() => setDl(false), []);

  return (
    <ModalCtx.Provider value={{ openConsult, openDownload: () => setDl(true) }}>
      {children}
      <Modal open={consult.open} onClose={() => setConsult({ open: false })} labelledBy="c-title" title={<span className="exp-head"><span className="cat-ic" aria-hidden="true"><IcChat /></span><span>{CONSULT_MODAL.title}</span><span className="mb">{CONSULT_MODAL.mb}</span></span>} maxWidth={480}>
        <ConsultBody axis={consult.axis} onClose={() => setConsult({ open: false })} />
      </Modal>
      <Modal open={dl} onClose={closeDl} labelledBy="d-title" describedBy="dl-desc" title={<span className="exp-head"><span className="cat-ic" aria-hidden="true"><IcSheet /></span><span>{DOWNLOAD_MODAL.title}</span><span className="mb">{DOWNLOAD_MODAL.mb1} · {DOWNLOAD_MODAL.mb2}</span></span>} maxWidth={480}>
        <DownloadBody open={dl} onClose={closeDl} />
      </Modal>
    </ModalCtx.Provider>
  );
}
