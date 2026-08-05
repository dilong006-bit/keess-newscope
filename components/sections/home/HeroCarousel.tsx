'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Img from '@/components/common/Img';
import { HERO_SLIDES } from '@/data/home';

const DUR = 6000;

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rmRef = useRef(false);
  const hoverRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progRef = useRef<HTMLSpanElement>(null);
  const n = HERO_SLIDES.length;

  const pad = (x: number) => ('0' + x).slice(-2);

  const resetProg = useCallback(() => {
    const p = progRef.current;
    if (!p) return;
    p.style.transition = 'none';
    p.style.width = '0%';
    void p.offsetWidth;
  }, []);
  const runProg = useCallback(() => {
    const p = progRef.current;
    if (!p) return;
    p.style.transition = `width ${DUR}ms linear`;
    p.style.width = '100%';
  }, []);
  const freezeProg = useCallback(() => {
    const p = progRef.current;
    if (!p) return;
    const w = getComputedStyle(p).width;
    p.style.transition = 'none';
    p.style.width = w;
  }, []);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (playing && !rmRef.current && !hoverRef.current) {
      resetProg();
      runProg();
      timer.current = setTimeout(() => setI((x) => (x + 1) % n), DUR);
    }
  }, [playing, n, resetProg, runProg]);

  // 초기: reduced-motion 감지
  useEffect(() => {
    rmRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rmRef.current) setPlaying(false);
  }, []);

  // 슬라이드 변경/재생 상태에 따라 스케줄
  useEffect(() => {
    schedule();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [i, playing, schedule]);

  const go = (x: number) => setI(((x % n) + n) % n);

  const onEnter = () => {
    hoverRef.current = true;
    if (timer.current) clearTimeout(timer.current);
    freezeProg();
  };
  const onLeave = () => {
    hoverRef.current = false;
    if (playing && !rmRef.current) schedule();
  };

  const rm = () => rmRef.current;
  const scrollTo = (sel: string) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: rm() ? 'auto' : 'smooth' });
  };

  return (
    <section
      className="hero"
      id="hero"
      aria-roledescription="carousel"
      aria-label="주요 소식"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="hero-track">
        {HERO_SLIDES.map((s, k) => (
          <div
            key={s.theme}
            className={`hero-slide${k === i ? ' active' : ''}`}
            data-theme={s.theme}
            aria-hidden={k === i ? 'false' : 'true'}
          >
            <div className="hs-bg" />
            {s.img && <Img className="hs-img" src={s.img} eager={s.eager} />}
            <div className="hs-scrim" />
            <div className="wrap">
              <div className="hs-content">
                {s.tag && <div className="hs-tag">{s.tag}</div>}
                <p className="eyebrow">{s.eyebrow}</p>
                <h1 dangerouslySetInnerHTML={{ __html: s.title }} />
                <p className="sub" dangerouslySetInnerHTML={{ __html: s.sub }} />
                <div className="actions">
                  {/* href = 다른 라우트 이동(캠페인 슬라이드) / scroll = 같은 페이지 앵커 */}
                  {s.cta.href ? (
                    <Link className="btn btn-ink" href={s.cta.href}>
                      {s.cta.label}
                    </Link>
                  ) : (
                    <button className="btn btn-ink" onClick={() => scrollTo(s.cta.scroll!)}>
                      {s.cta.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-indicator">
        <div className="wrap">
          <div className="hero-ind-inner">
            <button className="hero-arrow prev" type="button" aria-label="이전 슬라이드" onClick={() => go(i - 1)}>‹</button>
            <button className="hero-arrow next" type="button" aria-label="다음 슬라이드" onClick={() => go(i + 1)}>›</button>
            <div className="hero-count">
              <span className="cur">{pad(i + 1)}</span>
              <div className="hero-line"><span ref={progRef} /></div>
              <span className="tot">{pad(n)}</span>
            </div>
            <button
              className="hero-play"
              type="button"
              aria-label={playing ? '일시정지' : '재생'}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? '❚❚' : '▶'}
            </button>
          </div>
        </div>
      </div>
      <div className="scrolldown">SCROLL<div className="bar" /></div>
    </section>
  );
}
