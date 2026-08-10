'use client';

import Link from 'next/link';
import SubNav from '@/components/common/SubNav';
import Img from '@/components/common/Img';
import { useContentModal } from './ContentModals';
import {
  HERO, AXISNAV, AX1, AX2, AX3, AX4, AX5, AX6, DOWNLOAD, FINAL,
} from '@/data/content';

const IcGrid = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="5" width="14" height="14" rx="2" /><rect x="9" y="9" width="6" height="6" /></svg>;
const IcGlobe = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>;
const IcCode = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" /></svg>;
const IcLayers = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5M3 16.5l9 5 9-5" /></svg>;
const IcShield = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg>;
const IcCam = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2" /><circle cx="12" cy="13.5" r="3.5" /><path d="M8 7l1.5-3h5L16 7" /></svg>;
const IcDown = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 11l5 5 5-5M4 20h16" /></svg>;
const IcList = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>;
const IcSheet = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M4 9h16M4 15h16M10 3v18" /></svg>;
// 직무군 개별 아이콘 (프로토타입 정합 — 6개 직무 구분)
const IcTarget = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /></svg>;
const IcSpeaker = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11v2a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1z" /><path d="M15 8a5 5 0 010 8M18 5a9 9 0 010 14" /></svg>;
const IcPeople = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0112 0" /><circle cx="17" cy="9" r="2.4" /><path d="M15 20a5 5 0 019-3" /></svg>;
const IcBars = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V4" /><path d="M4 20h16" /><rect x="7" y="12" width="3" height="5" /><rect x="12" y="8" width="3" height="9" /><rect x="17" y="5" width="3" height="12" /></svg>;
const IcBox = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></svg>;
const JOB_ICONS = [IcGrid, IcTarget, IcSpeaker, IcPeople, IcBars, IcBox];
const HEX_ICONS = [IcGrid, IcGlobe, IcCode, IcLayers, IcShield, IcCam];
const AX_ICONS = [IcGrid, IcGlobe, IcCode, IcLayers, IcShield, IcCam];

function AxHead({ kicker, icon: Icon, title, lead, tag, extra }: { no?: string; kicker: string; icon: () => JSX.Element; title: React.ReactNode; lead?: string; tag?: string; extra?: React.ReactNode }) {
  return (
    <div className="axhead">
      <div>
        <span className="ct-eyebrow r"><Icon /> {kicker}</span>
        <h2>{title}</h2>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {tag && <span className="axtag">{tag}</span>}
      {extra}
    </div>
  );
}

export default function Sections() {
  const { openConsult, openDownload } = useContentModal();

  return (
    <main id="main" tabIndex={-1}>
      {/* ── HERO ── */}
      <section className="ct-hero section" id="hero">
        <Img className="hero-img" src={HERO.img} eager />
        <div className="hero-scrim" />
        <div className="wrap">
          <div className="ct-hero-in">
            <div>
              <span className="ct-eyebrow"><span className="d" />{HERO.eyebrow}</span>
              <h1>{HERO.h1Lead}<span className="hl">{HERO.h1Emph}</span>{HERO.h1Tail}<br />{HERO.h1Line2}</h1>
              <p className="lead">{HERO.lead}</p>
              <div className="hero-cta">
                <a href="#ax1" className="btn btn-ink">6개 체계 보기</a>
              </div>
            </div>
            <div className="hexmap" aria-label="6축 체계 맵">
              <div className="core"><b>{HERO.core.b}</b><span>{HERO.core.span}</span></div>
              <div className="g6">
                {HERO.hex.map((h, i) => {
                  const Icon = HEX_ICONS[i];
                  return (
                    <a className={`hx${h.law ? ' law' : ''}${h.net ? ' net' : ''}`} href={h.href} key={h.n}>
                      <span className="hx-ic"><Icon /></span><span className="t">{h.t}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SubNav items={AXISNAV} />

      {/* ── ax1 직무 ── */}
      <section className="section" id="ax1">
        <div className="wrap">
          <AxHead no={AX1.no} kicker={AX1.kicker} icon={AX_ICONS[0]} title={AX1.title} lead={AX1.lead} tag={AX1.tag} />
          <div className="jobgrid">
            {AX1.jobs.map((j, i) => {
              const JI = JOB_ICONS[i] || IcGrid;
              return (
                <div className="jobcard" key={j.h3}>
                  <div className="top"><div className="ib"><JI /></div><h3>{j.h3}</h3></div>
                  <div className="sk">{j.sk.map((s) => <span key={s}>{s}</span>)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ax2 어학 ── */}
      <section className="section" id="ax2" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <AxHead no={AX2.no} kicker={AX2.kicker} icon={AX_ICONS[1]} title={AX2.title} lead={AX2.lead} tag={AX2.tag} />
          <div className="langwrap">
            <div className="profmatrix">
              <div className="pmhead"><div className="axis">언어 ↓ / 레벨 →</div>{AX2.cols.map((c) => <div className="col" key={c}>{c}</div>)}</div>
              {AX2.rows.map((r) => (
                <div className="pmrow" key={r.lang}>
                  <div className="lang"><IcGlobe />{r.lang}</div>
                  {r.cells.map((c, i) => <div className={`pmcell c${i + 1}`} key={i}>{c}</div>)}
                </div>
              ))}
              <div className="pmgrow">{AX2.grow}<span className="bar" /></div>
            </div>
            <p className="pmnote">{AX2.note}</p>
            <div className="langfoot"><span className="lb">외국어 협력사</span>{AX2.partners.map((p) => <span className="p" key={p}>{p}</span>)}</div>
          </div>
        </div>
      </section>

      {/* ── ax3 IT·자격 ── */}
      <section className="section" id="ax3">
        <div className="wrap">
          <AxHead no={AX3.no} kicker={AX3.kicker} icon={AX_ICONS[2]} title={AX3.title} lead={AX3.lead} tag={AX3.tag} />
          <div className="substep">{AX3.sub}</div>
          <div className="ct-roadmap">
            <div className="rmline">{AX3.stages.map((s) => <div className="rmpt" key={s.st}><div className="dot" /><div className="st">{s.st}</div><div className="nm">{s.nm}</div></div>)}</div>
            <div className="rmcols">
              {AX3.stages.map((s) => (
                <div className="rmcard" key={s.st}>
                  <div className="sk">{s.sk.map((x) => <span key={x}>{x}</span>)}</div>
                  <div className="ct"><div className="cl"><IcShield />취득 가능 자격</div><div className="cb">{s.cert.map((x) => <span key={x}>{x}</span>)}</div></div>
                </div>
              ))}
            </div>
            <div className="rmaxis"><span>{AX3.axisL}</span><span className="rmaxis-track" aria-hidden="true" /><span className="r">{AX3.axisR}</span></div>
          </div>
        </div>
      </section>

      {/* ── ax4 비즈니스·리더십 ── */}
      <section className="section" id="ax4" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <div className="wrap">
          <AxHead no={AX4.no} kicker={AX4.kicker} icon={AX_ICONS[3]} title={AX4.title} lead={AX4.lead} tag={AX4.tag} />
          <div className="growthfw">
            <div className="gfaxis"><span className="lab">{AX4.axis}</span><span className="arr" /></div>
            <div className="gftiers">
              {AX4.tiers.map((t, i) => (
                <div className={`gftier t${i + 1}`} key={t.no}>
                  <div><div className="no">{t.no}</div><h3>{t.h3}</h3><div className="items">{t.items.map((i) => <span key={i}>{i}</span>)}</div></div>
                  <div className="stage"><b>{t.stage}</b><span>대상</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="culturebar"><span className="lb">{AX4.culture.lb}</span>{AX4.culture.chips.map((c) => <span className="c" key={c}>{c}</span>)}</div>
        </div>
      </section>

      {/* ── ax5 법정 ── */}
      <section className="section" id="ax5">
        <div className="wrap">
          <AxHead no={AX5.no} kicker={AX5.kicker} icon={AX_ICONS[4]} title={<>{AX5.titleLead}<span className="hl">{AX5.titleEmph}</span>{AX5.titleTail}</>} lead={AX5.lead} tag={AX5.tag} />
          <div className="substep">{AX5.seriesSub}</div>
          <div className="timeline">
            {AX5.timeline.map((t) => (
              <div className={`tnode${t.cur ? ' cur' : ''}`} key={t.yr}><div className="dot" /><div className="yr">{t.yr}</div><div className="nm">{t.nm}</div><div className="cc">{t.cc}</div>{t.cur && <div className="bn">현재 시리즈</div>}</div>
            ))}
          </div>
          <div className="substep">{AX5.lawSub}</div>
          <div className="lawgrid">
            {AX5.laws.map((l) => (
              <div className="lawcard" key={l.h3}><span className="must">의무</span><h3>{l.h3}</h3>
                <div className="frow"><dt>근거</dt><dd>{l.근거}</dd></div>
                <div className="frow"><dt>대상</dt><dd>{l.대상}</dd></div>
                <div className="frow"><dt>주기</dt><dd>{l.주기}</dd></div>
              </div>
            ))}
          </div>
          <div className="substep">{AX5.diffSub}</div>
          {/* overflow-x:auto로 가로 스크롤을 의도한 3열 비교표 — 모바일 계측(C2) 예외 표식 */}
          <div className="difftable" data-hscroll>
            <table><thead><tr>{AX5.diffHead.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{AX5.diff.map((r) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table>
          </div>
          <p className="samplenote">{AX5.note}</p>
        </div>
      </section>

      {/* ── ax6 제작·파트너 ── */}
      <section className="section" id="ax6">
        <div className="wrap">
          <AxHead no={AX6.no} kicker={AX6.kicker} icon={AX_ICONS[5]} title={AX6.title} lead={AX6.lead}
            extra={<button className="btn-line-dark" onClick={() => openConsult(AX6.consultAxis)}>제작 문의</button>} />
          <div className="infra" style={{ marginTop: 30 }}>
            <div className="imgslot"><span className="cap">{AX6.studioCap}</span></div>
            <div className="pipebox">
              <div className="lb">{AX6.pipeLabel}</div>
              <div className="pipe">{AX6.pipe.map((p, i) => <div className="pstep" key={p.t}><div className="ic">{i + 1}</div><div className="t">{p.t}</div><div className="dd">{p.dd}</div></div>)}</div>
            </div>
          </div>
          <div className="substep">{AX6.ipSub}</div>
          <div className="ipgrid">{AX6.ips.map((ip) => <div className="ipcard" key={ip.t}><span className="ipt">{ip.t}</span><p>{ip.p}</p></div>)}</div>
          <div className="substep">{AX6.partnerSub}</div>
          <div className="plogos">{AX6.partners.map((p) => <div className="plogo" key={p}>{p}</div>)}</div>
          <div className="counter"><b>{AX6.counter.b}</b><span>{AX6.counter.span}</span></div>
        </div>
      </section>

      {/* ── 다운로드 (B안 · F9) ── */}
      <section className="section" id="download">
        <div className="wrap">
          <div className="dl r">
            <div>
              <span className="ct-eyebrow" style={{ color: 'var(--p4)' }}><IcList /> {DOWNLOAD.eyebrow}</span>
              <h2>{DOWNLOAD.titleLead}<br /><span className="hl">{DOWNLOAD.titleEmph}</span>{DOWNLOAD.titleTail}</h2>
              <p className="lead">{DOWNLOAD.lead}</p>
              <Link className="dl-cross" href={DOWNLOAD.crossLink.href}><IcShield /> {DOWNLOAD.crossLink.label}</Link>
              <div className="dl-act">
                <button className="btn btn-ink" onClick={openDownload}><IcDown /> {DOWNLOAD.cta}</button>
                <span className="dl-meta">{DOWNLOAD.meta}</span>
              </div>
            </div>
            <div className="dl-file" aria-label="과정 리스트 구성">
              <div className="fh"><span className="xls" aria-label="Excel"><IcSheet /></span><div><b>{DOWNLOAD.file.name}</b><span>{DOWNLOAD.file.basis}</span></div></div>
              <div className="dl-stats">
                {DOWNLOAD.stats.map((s) => <div className={`dst${s.hi ? ' hi' : ''}`} key={s.s}><b>{s.b}</b><span>{s.s}</span></div>)}
              </div>
              <p className="dl-upd">{DOWNLOAD.upd}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── final ── */}
      <section className="section">
        <div className="wrap">
          <div className="final r">
            <h2>{FINAL.titleLead}<br />{FINAL.titleLine2}</h2>
            <p>{FINAL.sub}</p>
            <div className="fbtns">
              <button className="btn btn-ink" onClick={() => openConsult()}>{FINAL.ctaPrimary}</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
