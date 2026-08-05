'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * [수정 1 ①] 히어로 WebGL 그라디언트 레이어 (@firecms/neat)
 *
 * ★ 이 컴포넌트는 "덧입히는 층"이다. 마운트되지 않아도 히어로는 정적 메시 블롭(폴백 CSS)만으로
 *   완성된 상태이며, 여기서 하는 일은 그 위에 저속·저채도 그라디언트를 더하는 것뿐이다.
 *
 * ★ 라이선스 게이트 — @firecms/neat는 MIT가 아니라 MIT + Commons Clause이며,
 *   라이선스 키가 없으면 캔버스에 "NEAT by FireCMS" 워터마크(외부 링크 클릭 영역 포함)를 그린다.
 *   KG에듀원 정부지원 페이지에 타사 워터마크를 노출할 수 없으므로,
 *   NEXT_PUBLIC_NEAT_LICENSE_KEY가 설정된 경우에만 WebGL을 활성화한다.
 *   키가 없으면 아무것도 렌더하지 않고 폴백 표면이 그대로 유지된다.
 *
 * 강등 조건: 라이선스 키 없음 / prefers-reduced-motion / WebGL 컨텍스트 생성 불가 / 로드 실패
 */

const LICENSE_KEY = process.env.NEXT_PUBLIC_NEAT_LICENSE_KEY;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function KiumHeroNeat() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!LICENSE_KEY) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!webglAvailable()) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    let gradient: { destroy: () => void } | null = null;
    let cancelled = false;

    // 초기 번들에 포함되지 않도록 동적 로드
    import('@firecms/neat')
      .then(({ NeatGradient }) => {
        if (cancelled || !ref.current) return;
        gradient = new NeatGradient({
          ref: ref.current,
          licenseKey: LICENSE_KEY,
          // 색은 기존 토큰만 — 브랜드 퍼플 계열 + 저채도 시안(보조, 영향도 최소)
          colors: [
            { color: '#2E1A6B', enabled: true, influence: 1 },
            { color: '#1B0F45', enabled: true, influence: 1 },
            { color: '#5A3FB0', enabled: true, influence: 0.6 },
            { color: '#0891B2', enabled: true, influence: 0.2 },
          ],
          speed: 1.5, // 저속
          horizontalPressure: 3,
          verticalPressure: 3,
          waveFrequencyX: 1.5,
          waveFrequencyY: 1.5,
          waveAmplitude: 3,
          colorSaturation: -2, // 저채도
          colorBrightness: 1,
          colorBlending: 6,
          shadows: 0,
          highlights: 2,
          grainScale: 2,
          grainIntensity: 0.2,
          grainSpeed: 0,
          resolution: 0.5,
          backgroundColor: '#FFFFFF',
          backgroundAlpha: 0,
        });
      })
      .catch(() => {
        // 로드 실패 = 폴백 표면 유지. 사용자 영향 없음.
      });

    return () => {
      cancelled = true;
      gradient?.destroy();
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas className="kium-hero-neat" ref={ref} aria-hidden="true" />;
}
