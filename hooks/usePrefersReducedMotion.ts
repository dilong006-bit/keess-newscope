'use client';

import { useEffect, useState } from 'react';

/**
 * prefers-reduced-motion: reduce 여부 (반응형 · SSR 안전)
 *
 * lib/utils.ts 의 `prefersReducedMotion()` 은 호출 시점 1회 평가라 렌더 중 사용할 수 없다.
 * 여기서는 초기값 false(서버·클라이언트 첫 렌더 동일) → useEffect 에서 동기화하고
 * change 이벤트를 구독해 OS 설정 변경에 따라간다.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
