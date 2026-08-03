'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import CountNum from '@/components/common/CountNum';
import SubNav from '@/components/common/SubNav';
import Img from '@/components/common/Img';
import {
  HERO, BENTO, SCENARIO, SCEN, STEP5, FRAMEWORK, FW, LV_CLASS,
  JOBS, JOBLV, STAGE_NAMES, STAGE_MIX, JOBPOS, WHY, GAP, COURSES, FINAL, SUBNAV,
} from '@/data/axai';

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const BENTO_ICONS: Record<string, React.ReactNode> = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>,
  bar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><rect x="7" y="10" width="3" height="7" /><rect x="13" y="6" width="3" height="11" /></svg>,
  gear: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" /><circle cx="12" cy="12" r="3" /></svg>,
  rise: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l6-6 4 4 8-8" /><path d="M17 7h4v4" /></svg>,
  learn: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 6.5a4 4 0 00-4-2.5H3v13h5a4 4 0 014 2.5M12 6.5a4 4 0 014-2.5h5v13h-5a4 4 0 00-4 2.5M12 6.5v13" /></svg>,
};

export default function Sections() {


  return (
    <main id="main" tabIndex={-1}>
      {/* ── HERO (다크 톤 정합) ── */}
      <section className="ax-hero" id="hero">
        <Img className="hero-img" src={HERO.img} eager />
        <div className="hero-scrim" />
        <div className="wrap">
          <div className="ax-hero-grid">
            <div className="ax-hero-copy">
              <span className="ax-tag"><span className="d" />{HERO.tag}</span>
              <h1><span className="dim">{HERO.h1Lead}</span> <span className="hl">{HERO.h1Emph}</span></h1>
              <p className="sub">{HERO.sub}</p>
              <div className="act">
                <Link className="btn btn-ink" href="/#inq">{HERO.cta} <Arrow /></Link>
              </div>
              <div className="ax-strip">{HERO.strip.map((s) => <span key={s}>{s}</span>)}</div>
            </div>
            <div className="ax-visual" role="img" aria-label="AX 전환 교육 비주얼">
              {HERO.floats.map((f, i) => (
                <div className={`ax-float f${i + 1}`} key={f.label}><div className="fv"><CountNum value={f.count} /></div><div className="fl">{f.label}</div></div>
              ))}
              <div className="ax-vlabel"><div className="t">{HERO.vlabel.t}</div><div className="s">{HERO.vlabel.s}</div></div>
            </div>
          </div>
        </div>
      </section>

      <SubNav items={SUBNAV} />

      {/* ── OFFER (bento) ── */}
      {/* 히어로 직후 최상단 콘텐츠 섹션. 형제 페이지(#pain·#arch·#ax1)와 동일하게
          서브내비 첫 항목의 앵커 대상이 되도록 id 부여 (C1) */}
      <section className="section" id="offer">
        <div className="wrap">
          <p className="eyebrow r ax-eyebrow-tight">{BENTO.eyebrow}</p>
          <div className="ax-bento stagger">
            <article className="bcard b-hero">
              <div className="bk">{BENTO.hero.bk}</div>
              <div>
                <h3>{BENTO.hero.h3[0]}<br />{BENTO.hero.h3[1]}</h3>
                <p>{BENTO.hero.p}</p>
                <div className="bmini">{BENTO.hero.mini.map((m) => <span key={m}>{m}</span>)}</div>
              </div>
            </article>
            {BENTO.cards.map((c) => (
              <article className="bcard" key={c.ok}>
                <div className="oi">{BENTO_ICONS[c.icon]}</div>
                <div className="ok">{c.ok}</div>
                <h4>{c.h4}</h4>
                <p>{c.p}</p>
              </article>
            ))}
            <article className="bcard b-stat">
              {BENTO.stat.map((s) => (
                <div className="st" key={s.label}><div className="v"><CountNum value={s.count} />{s.unit}</div><div className="l">{s.label}</div></div>
              ))}
            </article>
          </div>
        </div>
      </section>

      <Scenario />

      {/* ── 5 STEP ── */}
      <section className="section" id="service">
        <div className="wrap ax-center">
          <p className="eyebrow r">{STEP5.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{STEP5.title}</h2>
          <p className="sec-sub r" style={{ marginLeft: 'auto', marginRight: 'auto' }}>{STEP5.sub}</p>
        </div>
        <div className="wrap">
          <div className="steps5 stagger">
            {STEP5.steps.map((s) => (
              <div className="s5" key={s.k}>
                <div className="sk">{s.k}</div>
                <div className="sn">{s.n}</div>
                <h4>{s.title}</h4>
                <ul>{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
                <div className="deliver"><div className="dl">주요 산출물</div>{s.deliver.map((d) => <span className="dchip" key={d}>{d}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Framework />

      <JobMap />

      {/* ── WHY / vs ── */}
      <section className="section" id="why">
        <div className="wrap">
          <p className="eyebrow r">{WHY.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{WHY.title}</h2>
          <div className="vs r">
            <div className="vs-row vs-head"><div className="vs-cell crit">{WHY.head[0]}</div><div className="vs-cell other">{WHY.head[1]}</div><div className="vs-cell kg">{WHY.head[2]}</div></div>
            {WHY.rows.map((r) => (
              <div className="vs-row" key={r[0]}><div className="vs-cell crit">{r[0]}</div><div className="vs-cell other">{r[1]}</div><div className="vs-cell kg">{r[2]}</div></div>
            ))}
          </div>
        </div>
      </section>

      <GapProof />

      {/* ── COURSES ── */}
      <section className="section" id="courses">
        <div className="wrap ax-center">
          <p className="eyebrow r">{COURSES.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{COURSES.title}</h2>
        </div>
        <div className="wrap">
          <div className="course-grid stagger">
            {COURSES.items.map((c) => (
              <div className="course" key={c.title}>
                <div className="cth" style={{ ['--cimg' as string]: `url(${c.img})` }}><span className="ax-badge">{c.badge}</span></div>
                <div className="cbd"><h4>{c.title}</h4></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL ── */}
      <section className="section" id="inq">
        <div className="wrap">
          <div className="ax-final r">
            <h2>{FINAL.title}</h2>
            <p>{FINAL.sub}</p>
            <div className="act">
              <Link className="btn btn-ink" href="/#inq">{FINAL.cta} <Arrow /></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ── Scenario (목표 선택 → 패널) ──
function Scenario() {
  const [key, setKey] = useState('diag');
  const s = SCEN[key];
  const optRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); const n = (i + 1) % SCENARIO.opts.length; optRefs.current[n]?.focus(); setKey(SCENARIO.opts[n].key); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (i - 1 + SCENARIO.opts.length) % SCENARIO.opts.length; optRefs.current[n]?.focus(); setKey(SCENARIO.opts[n].key); }
  };
  return (
    <section className="section" id="scenario" style={{ background: 'var(--surface)' }}>
      <div className="wrap">
        <p className="eyebrow r">{SCENARIO.eyebrow}</p>
        <h2 className="sec-title r" style={{ marginTop: 14 }}>{SCENARIO.title}</h2>
        <p className="sec-sub r">{SCENARIO.sub}</p>
        <div className="scen">
          <div className="scen-opts" role="tablist" aria-label="목표 선택">
            {SCENARIO.opts.map((o, i) => (
              <button
                key={o.key}
                ref={(el) => { optRefs.current[i] = el; }}
                className={`opt${key === o.key ? ' on' : ''}`}
                role="tab"
                aria-selected={key === o.key}
                onClick={() => setKey(o.key)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className="od" />
                <span>{o.badge && <span className="obadge">{o.badge}</span>}<span className="ot">{o.text}</span></span>
              </button>
            ))}
          </div>
          <div className="scen-panel" role="tabpanel" aria-live="polite">
            <div className="pc">
              <div className="pk">{s.k}</div>
              <h3>{s.t}</h3>
              <p>{s.p}</p>
              <div className="pchips">{s.chips.map((c) => <span key={c}>{c}</span>)}</div>
              <div className="pcta"><Link className="btn" href="/#inq">{s.cta} <Arrow /></Link></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Framework (통증칩 → 단계, 계단 선택, 역량 영역) ──
function Framework() {
  const [stage, setStage] = useState(1);
  const [dx, setDx] = useState<number | null>(null);
  const [capsIn, setCapsIn] = useState(false);
  const stairRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCapsIn(false);
    const t = setTimeout(() => setCapsIn(true), 20);
    return () => clearTimeout(t);
  }, [stage]);

  const pickDx = (n: number) => {
    setDx(n);
    setStage(n);
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stairRef.current?.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'center' });
  };

  const fw = FW[stage];
  let capIdx = 0;
  return (
    <section className="section" id="framework" style={{ background: 'var(--surface)' }}>
      <div className="wrap">
        <p className="eyebrow r">{FRAMEWORK.eyebrow}</p>
        <h2 className="sec-title r" style={{ marginTop: 14 }}>{FRAMEWORK.title}</h2>
        <p className="sec-sub r" style={{ whiteSpace: 'pre-line' }}>{FRAMEWORK.sub}</p>
        <div className="dx r">
          <div className="dxq"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>{FRAMEWORK.dxTitle}</div>
          <div className="dx-chips">
            {FRAMEWORK.dxChips.map((c) => (
              <button key={c.dx} className={`dx-chip${dx === c.dx ? ' on' : ''}`} onClick={() => pickDx(c.dx)}>{c.text}</button>
            ))}
          </div>
        </div>
        <div className="stair r" id="stair" ref={stairRef} role="tablist" aria-label="AX 단계 선택">
          {FRAMEWORK.stages.map((st) => (
            <button
              key={st.stage}
              className={`step${stage === st.stage ? ' on' : ''}`}
              role="tab"
              aria-selected={stage === st.stage}
              onClick={() => setStage(st.stage)}
              style={{ minHeight: st.h, background: `linear-gradient(160deg, color-mix(in srgb, var(--p1) ${Math.max(st.mix - 12, 30)}%, #fff), color-mix(in srgb, var(--p1) ${st.mix}%, #000))` }}
            >
              <span className="sl">{st.lv}</span>
              <span className="sn">{st.name}</span>
            </button>
          ))}
        </div>
        <div className="fw-body">
          <p className="fd" dangerouslySetInnerHTML={{ __html: fw.d }} />
          <div className="fw-areas">
            {fw.areas.map((a) => (
              <div className="fw-area" key={a.n}>
                <h5>{a.n}</h5>
                {a.caps.map((c) => {
                  const delay = capIdx++ * 35;
                  return (
                    <div key={c[0]} className={`fw-cap${capsIn ? ' in' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
                      <span>{c[0]}</span><span className={`lv ${LV_CLASS[c[1]]}`}>{c[1]}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── JobMap (포지셔닝 맵 + 직무 선택 → 5단계) ──
function JobMap() {
  const jobs = useMemo(() => Object.keys(JOBLV), []);
  const [job, setJob] = useState(jobs[0]);
  const [stepsIn, setStepsIn] = useState(false);

  useEffect(() => {
    setStepsIn(false);
    const t = setTimeout(() => setStepsIn(true), 20);
    return () => clearTimeout(t);
  }, [job]);

  return (
    <section className="section" id="jobs">
      <div className="wrap">
        <p className="eyebrow r">{JOBS.eyebrow}</p>
        <h2 className="sec-title r" style={{ marginTop: 14 }}>{JOBS.title}</h2>
        <p className="sec-sub r">{JOBS.sub}</p>
        <div className="qmap r">
          <div className="qax qy-top">{JOBS.qLabels.yTop}</div>
          <div className="qax qy-bot">{JOBS.qLabels.yBot}</div>
          <div className="qax qx-left">{JOBS.qLabels.xLeft}</div>
          <div className="qax qx-right">{JOBS.qLabels.xRight}</div>
          <div className="qplot">
            <div className="qline-h" /><div className="qline-v" />
            {JOBS.quads.map((q) => <span key={q.cls} className={`qquad ${q.cls}`}>{q.label}</span>)}
            {Object.keys(JOBPOS).map((j) => {
              const [x, y] = JOBPOS[j];
              return (
                <button key={j} className={`qdot${job === j ? ' on' : ''}`} style={{ left: `${x}%`, top: `${100 - y}%` }} aria-label={j} onClick={() => setJob(j)}>
                  <span className="pt" /><span className="lb">{j}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="job-pills r">
          {jobs.map((j) => (
            <button key={j} className={`jpill${job === j ? ' on' : ''}`} onClick={() => setJob(j)}>{j}</button>
          ))}
        </div>
        <div className="job-steps r">
          {JOBLV[job].map((cap, i) => (
            <div key={i} className={`jstep${stepsIn ? ' in' : ''}`} style={{ borderTopColor: `color-mix(in srgb, var(--p1) ${STAGE_MIX[i]}%, #fff)`, transitionDelay: `${i * 60}ms` }}>
              <div className="jl">Lv{i + 1} · {STAGE_NAMES[i]}</div>
              <div className="jt">{cap}</div>
            </div>
          ))}
        </div>
        <p className="job-note r">{JOBS.note}</p>
      </div>
    </section>
  );
}

// ── GapProof (사전-사후 바, 뷰 진입 시 채움) ──
function GapProof() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { setRevealed(true); io.unobserve(e.target); } }),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow r">{GAP.eyebrow}</p>
        <h2 className="sec-title r" style={{ marginTop: 14 }}>{GAP.title}</h2>
        <div className="gapbox r" id="proof" ref={boxRef}>
          <div style={{ fontSize: 15.5, fontWeight: 700 }}>{GAP.boxTitle}</div>
          {GAP.rows.map((r) => (
            <div className="gap-row" key={r.label}>
              <span className="gl">{r.label}</span>
              <div className="gap-track">
                <div className="gap-pre" style={{ width: revealed ? `${r.pre}%` : 0 }} />
                <div className="gap-post" style={{ width: revealed ? `${r.post}%` : 0 }} />
              </div>
            </div>
          ))}
          <div className="gap-leg">
            <span><b style={{ background: 'color-mix(in srgb, var(--p1) 22%, #fff)' }} />사전</span>
            <span><b style={{ background: 'var(--p1)' }} />사후</span>
          </div>
          <p className="gap-cap">{GAP.cap}</p>
        </div>
      </div>
    </section>
  );
}
