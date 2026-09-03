'use client';

import { KIUM_PREFILL_EVENT } from './inquiryBridge';
import { fmtRangePrefill, type KiumSession } from './sessions';
import { fmtPrice, KIUM_PRICE_NOTE } from './pricing';
import type { KiumCourse } from './data';

/** 공개교육 프리필 토큰 — 재클릭 시 누적되지 않도록 이 패턴을 교체한다 */
export const KIUM_OPEN_PREFILL_RE = /^\[공개교육 신청\][^\n]*\n(?:신청 인원:[^\n]*\n?)?/;
/** 기존 '관심 과정' 토큰도 함께 제거 대상에 넣는다 */
export const KIUM_COURSE_PREFILL_RE = /^\[관심 과정: [^\]]*\]\s*/;

/** 요약 배너가 구독하는 이벤트 */
export const KIUM_OPEN_SELECT_EVENT = 'kium:open-select';

export function openPrefillText(course: KiumCourse, session: KiumSession): string {
  const price = fmtPrice(course.id);
  return (
    `[공개교육 신청] ${course.titleMarketing} / ${session.displayMonth}월 회차 ` +
    `(${fmtRangePrefill(session)}, ${course.hours}시간·${course.days}일) / 교육비 ${price}(${KIUM_PRICE_NOTE})\n` +
    `신청 인원: `
  );
}

/**
 * 회차 선택 → 폼 프리필 + 이동.
 * 폼의 필드·동의 구조는 그대로 두고 '문의 내용'과 '예상 교육인원'만 채운다.
 * 개인정보 동의·마케팅 동의는 어떤 경우에도 자동 체크하지 않는다.
 */
export function applyForSession(course: KiumCourse, session: KiumSession) {
  window.dispatchEvent(
    new CustomEvent(KIUM_PREFILL_EVENT, {
      detail: {
        text: openPrefillText(course, session),
        trainees: 'lte9',                                    // 1~9명
        strip: [KIUM_OPEN_PREFILL_RE, KIUM_COURSE_PREFILL_RE],
      },
    })
  );
  window.dispatchEvent(
    new CustomEvent(KIUM_OPEN_SELECT_EVENT, { detail: { courseId: course.id, sessionId: session.id } })
  );

  const el = document.getElementById('inq');
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });

  // 스크롤 후 첫 빈 필수 필드로 포커스 — preventScroll로 스크롤을 두 번 흔들지 않는다
  window.setTimeout(() => {
    document.getElementById('f-company')?.focus({ preventScroll: true });
  }, reduce ? 0 : 480);
}
