'use client';

import { useEffect, useRef } from 'react';

interface Options {
  /** 유지 시간(ms). 0 이하이거나 enabled=false 면 타이머를 걸지 않는다 */
  durationMs: number;
  enabled: boolean;
  onExpire: () => void;
  /** 진행률 표시 양자화 간격(ms). 0이면 매 프레임 연속 갱신 */
  quantizeMs?: number;
}

/** 프레임 델타 상한(ms) — 탭 복귀·긴 블로킹 후 경과가 한 번에 누적되는 것을 막는다 */
const MAX_FRAME_DELTA = 100;
/** 계측 시작·유지 판정 기준: 카드가 뷰포트에 이 비율 이상 보일 때만 진행 */
const VISIBLE_RATIO = 0.5;

/**
 * 자동 소멸 타이머 (RD-009)
 *
 * 계측은 제출 시점이 아니라 카드가 뷰포트 50% 이상 노출된 시점부터 시작하며,
 * (a) 카드 hover · (b) 탭 비활성 · (c) 뷰포트 50% 미만 중 하나라도 참인 프레임은
 * 경과에 누적하지 않는다(일시정지). 정지가 풀리면 리셋이 아니라 남은 시간부터 이어진다.
 *
 * 진행률은 리렌더 없이 barRef 의 transform 에 직접 기입한다.
 */
export function useAutoDismissTimer({ durationMs, enabled, onExpire, quantizeMs = 0 }: Options) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  // 콜백 변경이 타이머를 재시작시키지 않도록 ref 로 최신값만 유지한다
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    const card = cardRef.current;
    if (!enabled || !card || durationMs <= 0) return;

    // 터치 기기는 pointerleave 가 오지 않아 영구 정지될 수 있으므로 hover 정지는 마우스 환경만
    const hoverCapable = window.matchMedia('(hover: hover)').matches;

    let raf = 0;
    let elapsed = 0;
    let last = 0;
    let visible = false;
    let hovered = false;
    let finished = false;

    // isIntersecting 은 "1px이라도 겹치면 true" — 50% 규칙은 intersectionRatio 로 판정해야 한다
    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.intersectionRatio >= VISIBLE_RATIO; },
      { threshold: [0, VISIBLE_RATIO] }
    );
    io.observe(card);

    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };
    if (hoverCapable) {
      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointerleave', onLeave);
    }

    // 탭이 숨겨지면 브라우저가 rAF 자체를 멈춰 document.hidden 분기가 도는 프레임이 없다.
    // 여기서 기준 시각을 리셋하지 않으면 복귀 첫 프레임에 숨김 구간 전체가 한 번에 누적된다.
    const onVisibility = () => { if (document.hidden) last = 0; };
    document.addEventListener('visibilitychange', onVisibility);

    const tick = (now: number) => {
      if (visible && !hovered && !document.hidden) {
        if (last !== 0) elapsed += Math.min(now - last, MAX_FRAME_DELTA);
        last = now;
      } else {
        last = 0; // 정지 구간은 경과에 포함하지 않는다
      }

      const ratio = Math.min(1, elapsed / durationMs);
      const shown = quantizeMs > 0
        ? Math.min(1, (Math.floor(elapsed / quantizeMs) * quantizeMs) / durationMs)
        : ratio;
      if (barRef.current) barRef.current.style.transform = `scaleX(${1 - shown})`;

      if (ratio >= 1) {
        if (!finished) {
          finished = true;
          onExpireRef.current();
        }
        return; // 루프 종료
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (hoverCapable) {
        card.removeEventListener('pointerenter', onEnter);
        card.removeEventListener('pointerleave', onLeave);
      }
    };
  }, [enabled, durationMs, quantizeMs]);

  return { cardRef, barRef };
}
