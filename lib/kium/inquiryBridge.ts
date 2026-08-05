'use client';

import { KIUM_CONTENT } from './content';

/**
 * 과정 패널 CTA → 도입문의 폼 브리지 (기술명세서 최종 v2.0 §4 KiumCtaBand ⑤)
 *
 * 폼(HomeInquiry)의 필드·동의 구조는 그대로 두고, '문의 내용' 초기값만 채운다.
 * 채워진 값은 일반 textarea 값이므로 사용자가 자유롭게 편집·삭제할 수 있다.
 */
export const KIUM_PREFILL_EVENT = 'kium:inquiry-prefill';

/** 프리필 토큰 — 재클릭 시 중복 누적되지 않도록 이 패턴을 교체한다 */
export const KIUM_PREFILL_RE = /^\[관심 과정: [^\]]*\]\s*/;

export function kiumPrefillText(titleMarketing: string) {
  return `[관심 과정: ${titleMarketing}] `;
}

/** 제출 페이로드 태깅 값 — UI에는 노출하지 않는다 */
export const KIUM_LEAD_SOURCE = KIUM_CONTENT.leadSource;

/** 문의 내용 프리필 요청 + 폼으로 이동 */
export function requestKiumInquiry(titleMarketing: string) {
  window.dispatchEvent(
    new CustomEvent(KIUM_PREFILL_EVENT, { detail: { text: kiumPrefillText(titleMarketing) } })
  );
  const el = document.getElementById('inq');
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}
