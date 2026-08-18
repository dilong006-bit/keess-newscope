'use client';

import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** 소멸 애니메이션 길이. CSS 의 nb-out 과 동일해야 한다 (기술명세서 §2 M1 모션표). */
const EXIT_MS = 180;

interface Props {
  /** 배지를 띄울지. false 로 바뀌면 소멸 모션 후 DOM 에서 제거된다. */
  show: boolean;
}

/**
 * 햄버거 NEW 배지 (기술명세서 v1.0 §2 M1)
 *
 * 등장·정지 모션은 전부 CSS(data-state) 가 담당하고, 여기서는 "언제 DOM 에서 빠지는가"만 센다.
 * 소멸은 즉시 언마운트가 아니라 180ms 뒤 — 그래야 scale+opacity 아웃이 보인다.
 * 단, reduced-motion 에서는 기다릴 모션이 없으므로 그 프레임에 바로 제거한다.
 *
 * 배지는 장식이 아니라 중복 정보다(햄버거 aria-label 이 같은 사실을 말한다) → aria-hidden.
 * 색만으로 정보를 전달하지 않도록 문자 'N' 을 반드시 포함한다.
 */
export default function NewBadge({ show }: Props) {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (show) {
      setMounted(true);
      setState('in');
      return;
    }
    if (!mounted) return;
    if (reduced) {
      setMounted(false);
      return;
    }
    setState('out');
    const t = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [show, reduced, mounted]);

  if (!mounted) return null;

  // <span> 이 아니라 <i> 인 이유: 햄버거 3선을 그리는 `.hamb span{width:24px;height:2px}` 이
  // (0,1,1) 로 `.new-badge`(0,1,0) 를 이겨 배지를 24×4 막대로 뭉갠다. 태그를 바꿔 선택자
  // 자체가 매칭되지 않게 하는 편이, 3선 규칙마다 특이도를 올려 쫓아가는 것보다 안전하다.
  return (
    <i className="new-badge" data-state={state} data-ga-id="gnb-new-badge" aria-hidden="true">
      N
    </i>
  );
}
