'use client';

import { useEffect, useRef, useState } from 'react';
import { goToInquiry, scrollToId } from '@/lib/utils';
import Link from 'next/link';
import Img from '@/components/common/Img';
import SubNav from '@/components/common/SubNav';
import ConsentGroup from '@/components/common/ConsentGroup';
import KgesaDemo from './KgesaDemo';
import ModuleTabs from './ModuleTabs';
import { useHdModal } from './HdModal';
import {
  HERO, ARCH, STUDIO, DEMO, AI, MODULES, GOV, INQ, SUBNAV,
} from '@/data/hrd';

export default function Sections() {
  const { openInq } = useHdModal();
  // 정부지원 CTA → 문의 프리셀렉트 (F7)
  const [preselect, setPreselect] = useState<string | undefined>(undefined);
  const [nonce, setNonce] = useState(0);
  const goToInq = (area: string) => {
    setPreselect(area);
    setNonce((n) => n + 1);
    goToInquiry('inq');
  };

  // /hrd#gov 등 해시 도착 시 스크롤
  useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (id && document.getElementById(id)) {
      setTimeout(() => scrollToId(id), 120);
    }
  }, []);

  return (
    <main id="main" tabIndex={-1}>
      {/* ── HERO ── */}
      <section className="hd-hero" id="hero">
        <Img className="hb-img" src={HERO.img} eager />
        <div className="hb-mesh" />
        <div className="wrap">
          <span className="tag-b"><span className="d" />{HERO.tag}</span>
          <h1 className="hb-h1">{HERO.h1Lead}<br /><span className="g">{HERO.h1Emph}</span></h1>
          <p className="hb-sub">{HERO.sub}</p>
          <div className="act">
            <button className="btn btn-ink" onClick={openInq}>{HERO.ctaPrimary}</button>
            <button className="btn btn-glass" onClick={() => scrollToId('demo')}>{HERO.ctaSecondary}</button>
          </div>
          <div className="hb-metrics">
            {HERO.metrics.map((m) => (
              <div className="hbm" key={m.l}><div className="hbv">{m.v}<span>{m.unit}</span></div><div className="hbl">{m.l}</div></div>
            ))}
          </div>
        </div>
      </section>

      <SubNav items={SUBNAV} />

      {/* ── 아키텍처 ── */}
      <section className="section" id="arch">
        <div className="wrap">
          <p className="eyebrow r">{ARCH.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{ARCH.title}</h2>
          <p className="sec-sub r">{ARCH.lead}</p>
          <div className="bento r">
            {ARCH.cells.map((c) => (
              <div className={`bento-cell ${c.cls}`} key={c.bk}>
                <span className="bk">{c.bk}</span>
                <h3>{c.h3}</h3>
                <p>{c.p}</p>
                {c.chips && <div className="bchips">{c.chips.map((ch) => <span key={ch}>{ch}</span>)}</div>}
                {c.demoLink && <span className="bcta" onClick={() => scrollToId('demo')}>데모 →</span>}
              </div>
            ))}
          </div>
          <div className="svc-model r">
            <div className="svm-head">
              <p className="eyebrow" style={{ marginBottom: 6 }}>{ARCH.svcHead.eyebrow}</p>
              <h2 className="sec-title">{ARCH.svcHead.title}</h2>
              <p className="svm-sub">{ARCH.svcHead.sub}</p>
            </div>
            <div className="svc-grid">
              {ARCH.svc.map((s) => (
                <div className="svc" key={s.svn}><span className="svn">{s.svn}</span><b>{s.b}</b><p>{s.p}</p><span className="svp">{s.svp}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 특장점 스튜디오 ── */}
      <section className="section" id="studio">
        <div className="wrap">
          <p className="eyebrow r">{STUDIO.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{STUDIO.title}</h2>
          <div className="adv-split r">
            <div className="adv-visual"><Img src={STUDIO.img} /><div className="adv-scrim" /><div className="adv-badge">{STUDIO.badge}</div></div>
            <div className="adv-body">
              <p className="adv-lead">{STUDIO.lead}</p>
              <div className="adv-list">
                {STUDIO.list.map((a) => <div className="advi" key={a.b}><b>{a.b}</b><span>{a.s}</span></div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KGESA 데모 (dark) ── */}
      <section className="section sec-dark" id="demo">
        <div className="wrap">
          <p className="eyebrow r">{DEMO.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{DEMO.title}<span className="tbd-d">{DEMO.tbd}</span></h2>
          <p className="sec-sub r">{DEMO.lead}</p>
          <p className="kg-pcnote r"><span className="tbd-d">{DEMO.pcBadge}</span> {DEMO.pcNote}</p>
          <KgesaDemo />
        </div>
      </section>

      {/* ── AI (dark) ── */}
      <section className="section sec-dark" id="ai">
        <div className="wrap">
          <p className="eyebrow r">{AI.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{AI.title}<span className="tbd-d">{AI.tbd}</span></h2>
          <p className="sec-sub r">{AI.lead}</p>
          <div className="ai-roles r">
            {AI.roles.map((r) => (
              <div className={`airole${r.hi ? ' hi' : ''}`} key={r.art}><span className="art">{r.art}</span><b>{r.b}</b><p>{r.p}</p></div>
            ))}
          </div>
          <div className="ai-matrix r">
            <div className="amx amx-head">{AI.matrixHead.map((h) => <span key={h}>{h}</span>)}</div>
            {AI.matrix.map((m) => (
              <div className="amx" key={m.k}><span className="amx-k">{m.k}</span><span>{m.a}</span><span className="amx-t">{m.t}</span></div>
            ))}
          </div>
          <div className="roadmap r">
            <p className="rm-label">{AI.roadmapLabel}</p>
            {/* 순서 있는 3단계 — 스크린리더가 1/3·2/3·3/3으로 읽도록 ol/li.
                레일·노드는 CSS 가상요소이므로 DOM에는 카드와 화살표만 둔다. */}
            <ol className="rm-flow" role="list">
              {AI.roadmap.map((r, i) => (
                <li key={r.rmt} className={`rm-item${r.now ? ' is-now' : ''}`} aria-current={r.now ? 'step' : undefined}>
                  <div className={`rm${r.now ? ' rm-now' : ''}`}><span className="rmt">{r.rmt}</span><b>{r.b}</b><p>{r.p}</p></div>
                  {i < AI.roadmap.length - 1 && <span className="rm-arr" aria-hidden="true">→</span>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── 솔루션 모듈 ── */}
      <section className="section" id="modules">
        <div className="wrap">
          <p className="eyebrow r">{MODULES.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>{MODULES.title}</h2>
          <p className="sec-sub r">{MODULES.lead}</p>
          <ModuleTabs />
        </div>
      </section>

      {/* ── 정부지원 환급 (B안 특화) ── */}
      <section className="section" id="gov">
        <div className="wrap">
          <p className="eyebrow gov-eb r"><span className="gov-dot" />{GOV.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 14 }}>교육비, <span className="gov-g">정부지원으로 돌려받으세요</span></h2>
          <p className="sec-sub r">{GOV.lead}<span className="nowrap">{GOV.leadTail}</span></p>
          <div className="gov-grid r">
            {GOV.cards.map((c) => (
              <div className={`gcard${c.hi ? ' hi' : ''}`} key={c.gk}>
                <span className="gk">{c.gk}</span>
                <b>{c.bnum ? <>훈련비 최대 <span className="gnum">{c.bnum}</span> 환급</> : c.b}{c.em && <em>{c.em}</em>}</b>
                <p>{c.p}</p>
              </div>
            ))}
          </div>
          <div className="gov-proc r">
            {GOV.steps.map((s, i) => (
              <span key={s.gsn} style={{ display: 'contents' }}>
                <div className="gstep"><span className="gsn">{s.gsn}</span><b>{s.b}</b><p>{s.p}</p></div>
                {i < GOV.steps.length - 1 && <div className="garr">→</div>}
              </span>
            ))}
          </div>
          <div className="gov-cta r">
            <div className="gc-copy">
              <b>{GOV.ctaCopy}</b>
              <span>{GOV.ctaSub}<span className="nowrap">{GOV.ctaSubTail}</span></span>
              {/* K4: 환급 링크는 상담 문구에 이어 붙지 않도록 별도 줄로 분리 */}
              <Link className="gc-link" href={GOV.crossLink.href}>{GOV.crossLink.label}</Link>
            </div>
            <button className="btn" onClick={() => goToInq(GOV.preselect)}>{GOV.cta}</button>
          </div>
          <p className="gov-note r">{GOV.note}</p>
        </div>
      </section>

      {/* ── 도입문의 ── */}
      <section className="section inq" id="inq">
        <div className="wrap iwrap">
          <div className="r">
            <h2>{INQ.title}</h2>
            <p className="isub" style={{ whiteSpace: 'pre-line' }}>{INQ.sub}</p>
          </div>
          <div className="iform r">
            <Inquiry preselect={preselect} nonce={nonce} />
          </div>
        </div>
      </section>
    </main>
  );
}

// ── 인라인 도입문의 폼 (fArea 프리셀렉트 지원, 시안대로 동의 없음) ──
function Inquiry({ preselect, nonce }: { preselect?: string; nonce: number }) {
  const [v, setV] = useState({ company: '', name: '', contact: '', interest: INQ.interests[0], msg: '' });
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const areaRef = useRef<HTMLSelectElement>(null);

  // 프리셀렉트 (정부지원 CTA)
  useEffect(() => {
    if (preselect && INQ.interests.includes(preselect)) {
      setV((s) => ({ ...s, interest: preselect }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  const upd = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setV((s) => ({ ...s, [k]: e.target.value }));

  // 개인정보 보호법 제15조 — 필수 동의
  const [agree, setAgree] = useState(false);
  const [agreeErr, setAgreeErr] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, boolean> = {};
    let ok = true;
    (['company', 'name', 'contact'] as const).forEach((k) => { const bad = !(v[k] || '').trim(); next[k] = bad; if (bad) ok = false; });
    setErrs(next);
    setAgreeErr(!agree);
    if (!agree) ok = false;
    if (!ok) return;
    // 제출 payload — 동의 사실 입증 기록(추후 연동 슬롯). 입력값은 분석 도구로 전송하지 않는다.
    void { ...v, privacy_agreed: true, agreed_at: new Date().toISOString() };
    setDone(true);
  }

  if (done) {
    return (
      <div className="form-done show">
        <div className="check">✓</div>
        <h4>{INQ.successTitle}</h4>
        <p>{INQ.successMsg}</p>
      </div>
    );
  }
  const fld = (k: string) => `field${errs[k] ? ' invalid' : ''}`;
  return (
    <form onSubmit={submit}>
      <div className="frow">
        <div className={fld('company')}><label>회사명 <span className="req">*</span></label><input aria-label="회사명" placeholder="예) KG에듀원" value={v.company} onChange={upd('company')} /><span className="err">회사명을 입력해 주세요.</span></div>
        <div className={fld('name')}><label>담당자 <span className="req">*</span></label><input aria-label="담당자" placeholder="성함" value={v.name} onChange={upd('name')} /><span className="err">담당자명을 입력해 주세요.</span></div>
      </div>
      <div className="frow">
        <div className={fld('contact')}><label>연락처 <span className="req">*</span></label><input aria-label="연락처" placeholder="010-0000-0000" value={v.contact} onChange={upd('contact')} /><span className="err">연락처를 입력해 주세요.</span></div>
        <div className="field"><label>관심 영역</label><select id="fArea" aria-label="관심 영역" ref={areaRef} value={v.interest} onChange={upd('interest')}>{INQ.interests.map((o) => <option key={o}>{o}</option>)}</select></div>
      </div>
      <div className="field"><label>문의 내용</label><textarea aria-label="문의 내용" rows={3} placeholder="대상·인원·목표를 간단히 적어주세요" value={v.msg} onChange={upd('msg')} /></div>
      <ConsentGroup formKey="hrd" idPrefix="hrd-" required={agree} onRequiredChange={(c) => { setAgree(c); if (c) setAgreeErr(false); }} error={agreeErr} />
      <button className="btn btn-ink" type="submit" style={{ width: '100%', marginTop: 20 }}>도입 문의 보내기</button>
    </form>
  );
}
