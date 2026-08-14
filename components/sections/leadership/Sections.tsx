'use client';

import { useCallback, useRef, useState } from 'react';
import { scrollToId } from '@/lib/utils';
import Img from '@/components/common/Img';
import SubNav from '@/components/common/SubNav';
import ConsentGroup from '@/components/common/ConsentGroup';
import InquirySuccess, { SUCCESS_AUTO_RESET_MS } from '@/components/common/InquirySuccess';
import { DEDUPE_WINDOW_MS, DUPLICATE_MSG, RETURN_MSG, dedupeKey, type InquiryPhase } from '@/lib/inquiry/inlineForm';
import Orbit from './Orbit';
import { useLdModal } from './LdModal';
import {
  HERO, PAIN, JOURNEY, TRACKS_SECTION, FRAMEWORK, OFFLINE, PROG,
  FACULTY, GROWTHFIT, WHY, INQ, SUBNAV,
} from '@/data/leadership';

// **강조** 파싱
function Rich({ text }: { text: string }) {
  const parts = text.split('**');
  return <>{parts.map((p, i) => (i % 2 ? <b key={i}>{p}</b> : <span key={i}>{p}</span>))}</>;
}

export default function Sections() {
  const { openInq } = useLdModal();

  return (
    <main id="main" tabIndex={-1}>
      {/* ── HERO ── */}
      <section className="ld-hero" id="hero" data-probe="hero">
        {/* 배경 베이스 레이어 — 사유는 /ax-ai 히어로의 동일 레이어 주석 참조 */}
        <div className="hero-base" aria-hidden="true" />
        <Img className="hero-img" src={HERO.img} eager />
        <div className="hero-scrim" />
        <div className="wrap">
          <div className="ld-hero-grid">
            <div>
              {/* data-probe — tests/hero-collision.spec.ts 상시 감시 앵커(제거 금지) */}
              <span className="ld-tag" data-probe="hero-badge"><span className="d" />{HERO.tag}</span>
              {/* <br> 앞의 공백은 데스크톱에서 줄 끝에 붙어 사라지고(렌더 무변경),
                  모바일에서 br을 display:none 하면 어절 사이 공백으로 살아난다.
                  공백 없이 br만 지우면 "리더는우연히"로 붙는다. */}
              <h1>{HERO.h1Lead}{' '}<br /><span className="hl">{HERO.h1Emph}</span></h1>
              <p className="sub">{HERO.sub}</p>
              <div className="act">
                <button className="btn btn-ink" onClick={openInq}>{HERO.ctaPrimary}</button>
                <button className="btn btn-glass" onClick={() => scrollToId('journey')}>{HERO.ctaSecondary}</button>
              </div>
              <div className="ld-strip">{HERO.strip.map((s) => <span key={s}>{s}</span>)}</div>
            </div>
            <div className="ld-visual">
              <Img src={HERO.img} />
              <div className="hv-scrim" />
              {HERO.floats.map((f, i) => (
                <div className={`ld-float f${i + 1}`} key={f.fl}><div className="fv">{f.fv}</div><div className="fl">{f.fl}</div></div>
              ))}
              <div className="ld-vlabel"><div className="t">{HERO.vlabel.t}</div><div className="s">{HERO.vlabel.s}</div></div>
            </div>
          </div>
        </div>
      </section>

      <SubNav items={SUBNAV} />

      {/* ── 고민 ── */}
      <section className="section" id="pain">
        <div className="wrap">
          <p className="eyebrow r">{PAIN.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{PAIN.title}</h2>
          <p className="sec-sub r">{PAIN.lead}</p>
          <div className="pain-grid r">
            {PAIN.chips.map((c, i) => <div className="pain-chip" key={i}><Rich text={c} /></div>)}
          </div>
        </div>
      </section>

      {/* ── 성장여정 + Architecture ── */}
      <section className="section" id="journey" style={{ background: 'var(--surface)' }}>
        <div className="wrap">
          <p className="eyebrow r">{JOURNEY.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{JOURNEY.title}</h2>
          <p className="sec-sub r"><Rich text={JOURNEY.lead} /></p>
          <div className="jstrip r">
            {JOURNEY.stages.map((s) => (
              <div className="jchip" key={s.jn}><div className="jn">{s.jn}</div><div className="js">{s.js}</div><div className="jr">{s.jr}</div></div>
            ))}
          </div>
          <p className="eyebrow r" style={{ marginTop: 52 }}>{JOURNEY.archEyebrow}</p>
          <h3 className="r" style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>{JOURNEY.archTitle}</h3>
          <div className="arch r">
            {JOURNEY.arch.map((a) => (
              <div className="acard" key={a.an}><div className="an">{a.an}</div><div className="at">{a.at}</div><div className="ad">{a.ad}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6대 역량 트랙 ── */}
      <section className="section" id="tracks">
        <div className="wrap">
          <p className="eyebrow r">{TRACKS_SECTION.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{TRACKS_SECTION.title}</h2>
          <p className="sec-sub r"><Rich text={TRACKS_SECTION.lead} /></p>
          <div className="tracks r">
            {TRACKS_SECTION.cards.map((t) => (
              <div className="tcard" key={t.tk}>
                <div className="ti">{t.ti}</div>
                <div className="tk">{t.tk}</div>
                <h4>{t.h4}</h4>
                <p>{t.p}</p>
                <div className="ttags">{t.tags.map((tg) => <span key={tg}>{tg}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Framework (오빗) ── */}
      <section className="section" id="framework" style={{ background: 'var(--surface)' }}>
        <div className="wrap">
          <p className="eyebrow r">{FRAMEWORK.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{FRAMEWORK.title}</h2>
          <p className="sec-sub r">{FRAMEWORK.lead}</p>
          <Orbit />
        </div>
      </section>

      {/* ── 오프라인 성장시점 ── */}
      <OfflineScenario />

      {/* ── 운영·강사 ── */}
      <section className="section" id="faculty">
        <div className="wrap">
          <p className="eyebrow r">{FACULTY.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{FACULTY.title}<span className="tbd-inline">{FACULTY.tbd}</span></h2>
          <p className="sec-sub r">{FACULTY.lead}</p>
          <div className="fac-steps r">
            {FACULTY.steps.map((s) => (
              <div className="fstep" key={s.fsn}><span className="fsn">{s.fsn}</span><b>{s.b}</b><p>{s.p}</p></div>
            ))}
          </div>
          <div className="fac-principles r">
            {FACULTY.principles.map((p) => (
              <div className="fprin" key={p.b}><b>{p.b}</b><p>{p.p}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Growth-Fit 조직진단 ── */}
      <section className="section" id="growthfit" style={{ background: 'var(--surface)' }}>
        <div className="wrap">
          <p className="eyebrow r">{GROWTHFIT.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{GROWTHFIT.title}</h2>
          <p className="sec-sub r"><Rich text={GROWTHFIT.lead} /></p>

          <div className="gf-diag r">
            <div className="gf-radar">
              <Radar labels={GROWTHFIT.radarLabels} />
              <p className="gf-note">{GROWTHFIT.radarNote}</p>
            </div>
            <div className="gf-dimlist">
              {GROWTHFIT.dims.map((d) => <div className="gfd" key={d.b}><b>{d.b}</b><span>{d.s}</span></div>)}
            </div>
          </div>

          <div className="gf-compare r">
            <div className="gfc-head"><Rich text={GROWTHFIT.compareHead} /></div>
            <div className="gfc-rows">
              {GROWTHFIT.compare.map((row) => (
                <div className="gfc-row" key={row[0]}><span className="gfc-old">{row[0]}</span><span className="gfc-arr">→</span><span className="gfc-new">{row[1]}</span></div>
              ))}
            </div>
          </div>

          <div className="gf-flow r">
            <div className="gff-label">{GROWTHFIT.flowLabel}</div>
            <div className="gff-items">{GROWTHFIT.flow.map((f) => <span key={f}>{f}</span>)}</div>
          </div>

          <div className="gf-cta r">
            <div className="gfcta-t">{GROWTHFIT.ctaTitle}</div>
            <div className="gfcta-s">{GROWTHFIT.ctaSub}</div>
            <button className="btn" onClick={() => scrollToId('inq')}>{GROWTHFIT.cta}</button>
          </div>
        </div>
      </section>

      {/* ── 차별점 ── */}
      <section className="section" id="why">
        <div className="wrap">
          <p className="eyebrow r">{WHY.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{WHY.title}</h2>
          <div className="why-grid r">
            {WHY.cards.map((c) => (
              <div className="wcard" key={c.wn}><div className="wn">{c.wn}</div><h4>{c.h4}</h4><p>{c.p}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 도입문의 ── */}
      <section className="section" id="inq">
        <div className="wrap iwrap">
          <div className="r">
            <h2>{INQ.title}</h2>
            <p className="isub">{INQ.sub}</p>
          </div>
          <div className="iform r">
            <Inquiry />
          </div>
        </div>
      </section>
    </main>
  );
}

// ── 오프라인 성장시점 시나리오 ──
function OfflineScenario() {
  const [i, setI] = useState(0);
  const p = PROG[i];
  return (
    <section className="section" id="offline">
      <div className="wrap">
        <p className="eyebrow r">{OFFLINE.eyebrow}</p>
        <h2 className="sec-title r" style={{ marginTop: 14 }}>{OFFLINE.title}<span className="badge-off">{OFFLINE.badge}</span></h2>
        <p className="sec-sub r"><Rich text={OFFLINE.lead} /></p>
        <div className="ld-scen r">
          <div className="scen-opts" role="tablist" aria-label="성장 시점 선택">
            {PROG.map((pr, idx) => (
              <button key={pr.ph} className={`opt${i === idx ? ' on' : ''}`} role="tab" aria-selected={i === idx} onClick={() => setI(idx)}>
                <span className="od" />
                <span><span className="obadge">{pr.ph}</span><span className="ot">{pr.key} · {pr.nm}</span></span>
              </button>
            ))}
          </div>
          <div className="scen-panel" role="tabpanel" aria-live="polite">
            <div className="pk">{p.nm}</div>
            <h3>{p.en}</h3>
            <span className="pmod">온라인 여정 · 오프라인 집합 선택 가능</span>
            <div className="psubs">
              {p.sub.map((x) => (
                <div className="psub" key={x.t}><b>{x.t}</b><div className="psd">{x.d}</div><div className="pcaps">{x.caps.map((c) => <span key={c}>{c}</span>)}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 인라인 도입문의 폼 (개인정보 보호법 제15조 — 필수 동의 적용) ──
function Inquiry() {
  const [v, setV] = useState({ company: '', name: '', contact: '', interest: INQ.interests[0], msg: '' });
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [agree, setAgree] = useState(false);
  const [agreeErr, setAgreeErr] = useState(false);
  const [phase, setPhase] = useState<InquiryPhase>('form');
  const [minHeight, setMinHeight] = useState<number | undefined>();
  const [dupErr, setDupErr] = useState<string | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);   // 제출 후 포커스 앵커
  const shellRef = useRef<HTMLDivElement>(null);     // minHeight 측정·적용 대상(동일 요소)
  const liveRef = useRef<HTMLDivElement>(null);      // phase 무관 상시 live region
  const lastSubmitRef = useRef<{ key: string; at: number } | null>(null);
  const agreedAtRef = useRef<string | null>(null);   // 동의 체크된 시각

  const upd = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((s) => ({ ...s, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, boolean> = {};
    let ok = true;
    (['company', 'name', 'contact'] as const).forEach((k) => { const bad = !(v[k] || '').trim(); next[k] = bad; if (bad) ok = false; });
    setErrs(next);
    setAgreeErr(!agree);
    if (!agree) ok = false;
    if (!ok) return;

    // 중복 접수 방지 — 10분 이내 동일 내용은 전송 없이 차단
    const key = dedupeKey(v);
    const prev = lastSubmitRef.current;
    if (prev && prev.key === key && Date.now() - prev.at < DEDUPE_WINDOW_MS) {
      setDupErr(DUPLICATE_MSG);
      return;
    }
    setDupErr(null);
    setPhase('submitting');
    // 제출 payload — 동의 사실 입증 기록(추후 연동 슬롯). 입력값은 분석 도구로 전송하지 않는다.
    void { ...v, privacy_agreed: agree, agreed_at: agreedAtRef.current };
    lastSubmitRef.current = { key, at: Date.now() };
    // 레이아웃 점프 차단 — 전환 직전 셸 높이를 고정한다(측정·적용 대상 동일)
    setMinHeight(shellRef.current?.offsetHeight);
    setPhase('success');
    sectionRef.current?.focus({ preventScroll: true });
    if (liveRef.current) liveRef.current.textContent = `${INQ.successTitle}. ${INQ.successMsg}`;
  }

  const handleReset = useCallback(() => {
    setV({ company: '', name: '', contact: '', interest: INQ.interests[0], msg: '' });
    setErrs({});
    setAgree(false);
    setAgreeErr(false);
    setDupErr(null);
    agreedAtRef.current = null;
    setMinHeight(undefined);
    setPhase('form');
    if (liveRef.current) liveRef.current.textContent = RETURN_MSG;
  }, []);

  const fld = (k: string) => `field${errs[k] ? ' invalid' : ''}`;
  return (
    <div ref={sectionRef} tabIndex={-1} style={{ outline: 'none' }}>
      <div ref={shellRef} className="inq-shell" style={minHeight ? { minHeight } : undefined}>
        {phase === 'success' ? (
          <InquirySuccess
            title={INQ.successTitle}
            message={INQ.successMsg}
            autoResetMs={SUCCESS_AUTO_RESET_MS}
            onReset={handleReset}
          />
        ) : (
          <form onSubmit={submit}>
            <div className="frow">
              <div className={fld('company')}><label>회사명 <span className="req">*</span></label><input aria-label="회사명" placeholder="예) KG에듀원" value={v.company} onChange={upd('company')} /><span className="err">회사명을 입력해 주세요.</span></div>
              <div className={fld('name')}><label>담당자 <span className="req">*</span></label><input aria-label="담당자" placeholder="성함" value={v.name} onChange={upd('name')} /><span className="err">담당자명을 입력해 주세요.</span></div>
            </div>
            <div className="frow">
              <div className={fld('contact')}><label>연락처 <span className="req">*</span></label><input aria-label="연락처" placeholder="010-0000-0000" value={v.contact} onChange={upd('contact')} /><span className="err">연락처를 입력해 주세요.</span></div>
              <div className="field"><label>관심 영역</label><select aria-label="관심 영역" value={v.interest} onChange={upd('interest')}>{INQ.interests.map((o) => <option key={o}>{o}</option>)}</select></div>
            </div>
            <div className="field"><label>문의 내용</label><textarea aria-label="문의 내용" rows={3} placeholder="대상·인원·목표를 간단히 적어주세요" value={v.msg} onChange={upd('msg')} /></div>
            <ConsentGroup formKey="leadership" idPrefix="ld-" required={agree} onRequiredChange={(c) => { setAgree(c); if (c) { setAgreeErr(false); agreedAtRef.current = new Date().toISOString(); } else { agreedAtRef.current = null; } }} error={agreeErr} />
            {dupErr && <span className="inq-dupe" role="alert">{dupErr}</span>}
            <button className="btn btn-ink" type="submit" disabled={phase === 'submitting'} style={{ width: '100%', marginTop: 20 }}>도입 문의 보내기</button>
          </form>
        )}
      </div>
      {/* phase 와 무관하게 항상 DOM 에 존재해야 낭독된다 */}
      <div ref={liveRef} className="inq-live" aria-live="polite" />
    </div>
  );
}

// ── Growth-Fit 레이더 (정적 예시 · --p2 데이터색) ──
function Radar({ labels }: { labels: string[] }) {
  return (
    <svg viewBox="0 0 280 250" width="280" height="250" role="img" aria-label="Growth-Fit 6 Core Dimensions 진단 프로파일 예시">
      <polygon points="140.0,93.4 164.7,107.7 164.7,136.3 140.0,150.6 115.3,136.3 115.3,107.7" fill="none" stroke="var(--line)" strokeWidth="1" />
      <polygon points="140.0,65.7 188.7,93.9 188.7,150.1 140.0,178.3 91.3,150.1 91.3,93.9" fill="none" stroke="var(--line)" strokeWidth="1" />
      <polygon points="140.0,38.0 212.7,80.0 212.7,164.0 140.0,206.0 67.3,164.0 67.3,80.0" fill="none" stroke="var(--line)" strokeWidth="1" />
      <line x1="140" y1="122" x2="140.0" y2="38.0" stroke="var(--line)" strokeWidth="1" />
      <line x1="140" y1="122" x2="212.7" y2="80.0" stroke="var(--line)" strokeWidth="1" />
      <line x1="140" y1="122" x2="212.7" y2="164.0" stroke="var(--line)" strokeWidth="1" />
      <line x1="140" y1="122" x2="140.0" y2="206.0" stroke="var(--line)" strokeWidth="1" />
      <line x1="140" y1="122" x2="67.3" y2="164.0" stroke="var(--line)" strokeWidth="1" />
      <line x1="140" y1="122" x2="67.3" y2="80.0" stroke="var(--line)" strokeWidth="1" />
      <polygon points="140.0,53.1 188.0,94.3 192.4,152.2 140.0,170.7 84.7,153.9 94.9,96.0" fill="color-mix(in srgb, var(--p2) 16%, transparent)" stroke="var(--p2)" strokeWidth="2" />
      {[[140.0, 53.1], [188.0, 94.3], [192.4, 152.2], [140.0, 170.7], [84.7, 153.9], [94.9, 96.0]].map((d, i) => (
        <circle key={i} cx={d[0]} cy={d[1]} r="3.5" fill="var(--p2)" />
      ))}
      <text x="140.0" y="20.0" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">{labels[0]}</text>
      <text x="226.6" y="75.0" textAnchor="start" fontSize="12" fontWeight="700" fill="var(--ink)">{labels[1]}</text>
      <text x="226.6" y="175.0" textAnchor="start" fontSize="12" fontWeight="700" fill="var(--ink)">{labels[2]}</text>
      <text x="140.0" y="226.0" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">{labels[3]}</text>
      <text x="53.4" y="175.0" textAnchor="end" fontSize="12" fontWeight="700" fill="var(--ink)">{labels[4]}</text>
      <text x="53.4" y="75.0" textAnchor="end" fontSize="12" fontWeight="700" fill="var(--ink)">{labels[5]}</text>
    </svg>
  );
}
