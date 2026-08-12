'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Img from '@/components/common/Img';
import { PILLARS } from '@/data/home';

export default function HomePillars() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(-1);
  const [dotColor, setDotColor] = useState('#2E1A6B');

  // 카드 전체가 링크이므로, 텍스트 드래그 선택처럼 '누른 채 이동한' 동작이
  // 클릭으로 오인돼 라우팅되지 않게 막는다. 임계값 10px.
  const down = useRef({ x: 0, y: 0 });
  const onPointerDown = (e: React.PointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY };
  };
  const onGuardedClick = (e: React.MouseEvent) => {
    if (e.detail === 0) return; // 키보드 Enter — 좌표가 없어 판별 대상이 아니다
    if (Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) > 10) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pillars = Array.from(document.querySelectorAll<HTMLElement>('.pillar'));
    const stepsEls = Array.from(document.querySelectorAll<HTMLElement>('.pillar .steps'));
    const pmedias = Array.from(document.querySelectorAll<HTMLElement>('.pmedia .pimg'));

    function onScroll() {
      const vh = window.innerHeight;
      if (!rm) {
        pmedias.forEach((img) => {
          const parent = img.parentElement;
          if (!parent) return;
          const m = parent.getBoundingClientRect();
          if (m.bottom < 0 || m.top > vh) return;
          const prog = (m.top + m.height / 2 - vh / 2) / vh;
          const sc = 1 + Math.min(Math.abs(prog), 0.5) * 0.12;
          img.style.transform = `scale(${sc.toFixed(3)}) translateY(${prog * -16}px)`;
        });
        stepsEls.forEach((st) => {
          const r = st.getBoundingClientRect();
          let p = (vh * 0.62 - r.top) / (r.height * 0.85);
          p = Math.max(0, Math.min(1, p));
          const fill = st.querySelector<HTMLElement>('.steps-fill');
          if (fill) fill.style.height = p * 100 + '%';
          const items = Array.from(st.querySelectorAll<HTMLElement>('.step'));
          items.forEach((s, idx) => {
            const f = items.length > 1 ? idx / (items.length - 1) : 0;
            s.classList.toggle('lit', p >= f - 0.04);
          });
        });
      }
      let act = -1;
      let best = Infinity;
      pillars.forEach((sec, idx) => {
        const r = sec.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (r.top < vh * 0.6 && r.bottom > vh * 0.4 && d < best) {
          best = d;
          act = idx;
        }
      });
      setActiveDot(act);
      if (act >= 0) setDotColor(getComputedStyle(pillars[act]).getPropertyValue('--ac'));
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const rmScroll = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const goDot = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: rmScroll() ? 'auto' : 'smooth' });
  };

  return (
    <div ref={rootRef}>
      <div className="pdots" id="pdots" style={{ opacity: activeDot >= 0 ? 1 : 0.5, ['--ac' as string]: dotColor }}>
        {PILLARS.map((p, idx) => (
          <button
            key={p.id}
            aria-label={p.dot}
            className={activeDot === idx ? 'active' : undefined}
            onClick={() => goDot(p.id)}
          />
        ))}
      </div>

      {PILLARS.map((p) => (
        <section
          key={p.id}
          className={`pillar${p.reverse ? ' rev' : ''}`}
          id={p.id}
          style={{ ['--ac' as string]: p.ac, ['--pg' as string]: p.pg }}
        >
          <div className="pgrid" onPointerDown={onPointerDown}>
            <div className="pmedia">
              <Img className="pimg" src={p.img} />
              <div className="pscrim" />
              <div className="pbadge">{p.badge}</div>
            </div>
            <div className="ptext">
              <div className="pidx r">{p.idx}</div>
              <div className="pname r">{p.name}</div>
              <h3 className="lines">
                {p.headLines.map((ln, k) => (
                  <span className="ln" key={k}><span>{ln}</span></span>
                ))}
              </h3>
              <div className="prule" />
              <div className="steps">
                <div className="steps-line"><div className="steps-fill" /></div>
                {p.steps.map((s) => (
                  <div className="step" key={s.num}>
                    <div className="snum">{s.num}</div>
                    <div className="stt">{s.title}</div>
                    <div className="std">{s.desc}</div>
                  </div>
                ))}
              </div>
              {p.close && <div className="pclose r">{p.close}</div>}
              {/* DOM상 슬라이드당 유일한 앵커. ::after가 .pgrid 전체를 덮어 카드 어디를 눌러도 이동한다 */}
              <Link
                className="pcta"
                href={p.href}
                aria-label={`${p.name} 자세히 보기`}
                data-cta={`home-pillar-${p.idx}`}
                onClick={onGuardedClick}
              >
                <span className="pcta-btn">
                  자세히 보기 <span aria-hidden="true">→</span>
                </span>
              </Link>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
