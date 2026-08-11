'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * 뷰포트 진입 시 0→value 카운트업 (reduced-motion 시 즉시).
 *
 * 초기값은 0이 아니라 **최종값**이다. 0으로 시작하면 정적 렌더 HTML에 "0"이 박혀,
 * JS 실패·크롤러·JS 비활성 환경에서 "0 AX Framework 단계" 같은 틀린 정보가 그대로 노출된다.
 * 카운트업을 실제로 돌릴 수 있다고 확인된 뒤에만(클라이언트 + 모션 허용 + IO 지원)
 * 페인트 전에 0으로 되감는다 — useLayoutEffect라 되감기가 화면에 보이지 않는다.
 */
const useIsoLayout = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function CountNum({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);

  // 되감기: 애니메이션 가능 조건일 때만, 페인트 전에 0으로
  useIsoLayout(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setN(0);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // 모션 저감·IO 미지원 → 최종값 유지(되감기 자체가 일어나지 않았다)
    if (rm || typeof IntersectionObserver === 'undefined') { setN(value); return; }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) {
          const dur = 1000, st = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - st) / dur, 1);
            setN(Math.round((1 - Math.pow(1 - p, 3)) * value));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return <span ref={ref} className={`num ${className || ''}`.trim()}>{n}</span>;
}
