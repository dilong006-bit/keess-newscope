'use client';

import { KIUM_PREFILL_EVENT } from './inquiryBridge';
import {
  KIUM_SESSION_META,
  effectiveStatus,
  formatSessionRange,
  getNextOpenSession,
  type KiumSession,
} from './sessions';
import type { KiumCourse } from './data';

/** 공개교육 프리필 토큰 — 재클릭 시 누적되지 않도록 이 블록을 통째로 교체한다 */
export const KIUM_OPEN_PREFILL_RE = /^\[공개교육 상담 신청\]\n(?:· [^\n]*\n)+/;
/** 기존 '관심 과정' 토큰도 함께 제거 대상에 넣는다 */
export const KIUM_COURSE_PREFILL_RE = /^\[관심 과정: [^\]]*\]\s*/;

/** 요약 배너가 구독하는 이벤트 */
export const KIUM_OPEN_SELECT_EVENT = 'kium:open-select';

/** 프리필 경로 — A 과정+일정 / B 과정만 / C 일정(시기)만 */
export type PrefillRoute = 'A' | 'B' | 'C';

export type OpenSelection =
  | { route: 'A'; courseId: string; sessionId: string; guard?: 'closed' | 'invalid' }
  | { route: 'B'; courseId: string; fromClosedSessionId?: string }
  | { route: 'C'; month: 10 | 11 | 12 };

/* ── 문의 내용 본문 조립 ─────────────────────────────────────────────
   placeholder가 아니라 실제 value로 주입한다. 사용자가 자유롭게 편집·삭제할 수 있다. */

const HEAD = '[공개교육 상담 신청]';

/** 경로 A — 과정 + 희망 회차 */
export function prefillTextA(course: KiumCourse, session: KiumSession, now: Date | null): string {
  const st = effectiveStatus(session, now);
  return (
    `${HEAD}\n` +
    `· 과정명: ${course.titleMarketing}\n` +
    `· 희망 회차: ${formatSessionRange(session)} (${KIUM_SESSION_META[st].label})\n` +
    // 블록을 개행으로 닫는다 — 사용자 입력이 다음 줄에서 시작해야 재클릭 시 토큰만 정확히 교체된다
    `· 문의 내용: \n`
  );
}

/** 경로 B — 과정만. 마감 회차에서 넘어온 경우 그 사실을 문장으로 남긴다 */
export function prefillTextB(course: KiumCourse, closedFrom?: KiumSession): string {
  const line = closedFrom
    ? `· 마감 회차: ${formatSessionRange(closedFrom)} → 다음 회차 문의\n`
    : `· 일정: 협의 희망\n`;
  return `${HEAD}\n` + `· 과정명: ${course.titleMarketing}\n` + line + `· 문의 내용: \n`;
}

/** 경로 C — 시기만 */
export function prefillTextC(month: 10 | 11 | 12): string {
  return `${HEAD}\n` + `· 희망 시기: ${month}월 개강 과정 상담 희망\n` + `· 문의 내용: \n`;
}

/** 마감 가드 문구 — 요약 배너가 그대로 출력한다 */
export const GUARD_CLOSED_TEXT = '해당 회차는 마감되었습니다 — 다음 회차 상담으로 안내됩니다';

/**
 * 상담 폼으로 이동 + 프리필.
 *
 * 폼의 필드·검증·동의 구조는 그대로 두고 '문의 내용'만 채운다.
 * 관심 영역 `인재키움`은 /kium 페이지가 이미 presetInterestSubs로 선택 상태로 시작한다.
 * 개인정보 동의·마케팅 동의는 어떤 경우에도 자동 체크하지 않는다.
 */
export function dispatchPrefill(text: string, selection: OpenSelection) {
  window.dispatchEvent(
    new CustomEvent(KIUM_PREFILL_EVENT, {
      detail: {
        text,
        // 기존 프리필 토큰만 걷어내고 사용자가 직접 쓴 문장은 그대로 뒤에 남긴다(prepend)
        strip: [KIUM_OPEN_PREFILL_RE, KIUM_COURSE_PREFILL_RE],
      },
    })
  );
  window.dispatchEvent(new CustomEvent(KIUM_OPEN_SELECT_EVENT, { detail: selection }));
}

/** 상담 섹션으로 이동 + 첫 빈 필수 필드로 포커스 */
export function scrollToInquiry() {
  const el = document.getElementById('inq');
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  // 스크롤 후 포커스 — preventScroll로 화면을 두 번 흔들지 않는다
  window.setTimeout(
    () => document.getElementById('f-company')?.focus({ preventScroll: true }),
    reduce ? 0 : 480
  );
}

/** URL 쿼리 반영 — 새로고침·링크 공유에도 프리필이 유지된다 */
export function syncConsultQuery(params: Record<string, string | null>) {
  const url = new URL(window.location.href);
  url.searchParams.set('consult', '1');
  for (const [k, v] of Object.entries(params)) {
    if (v === null) url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

/* ── 경로별 진입점 ─────────────────────────────────────────────────── */

/** 경로 A — 일정 행 CTA · 회차 pill · 상세 회차 카드 CTA */
export function consultSession(course: KiumCourse, session: KiumSession, now: Date | null) {
  if (effectiveStatus(session, now) === 'closed') {
    // 마감 회차는 그 회차로 프리필하지 않는다 — 다음 회차 상담(경로 B)으로 넘긴다
    consultCourse(course, session);
    return;
  }
  dispatchPrefill(prefillTextA(course, session, now), {
    route: 'A',
    courseId: course.id,
    sessionId: session.id,
  });
  syncConsultQuery({ course: course.id, session: session.id, month: null });
  scrollToInquiry();
}

/** 경로 B — 「과정만 상담」 · 상세 하단 CTA · 마감 회차의 「다음 회차 상담」 */
export function consultCourse(course: KiumCourse, closedFrom?: KiumSession) {
  dispatchPrefill(prefillTextB(course, closedFrom), {
    route: 'B',
    courseId: course.id,
    fromClosedSessionId: closedFrom?.id,
  });
  syncConsultQuery({ course: course.id, session: closedFrom?.id ?? null, month: null });
  scrollToInquiry();
}

/** 경로 C — 월 그룹 헤더 「이 시기 교육 상담」 */
export function consultMonth(month: 10 | 11 | 12) {
  dispatchPrefill(prefillTextC(month), { route: 'C', month });
  syncConsultQuery({ month: String(month), course: null, session: null });
  scrollToInquiry();
}

/** 마감 회차에서 안내할 다음 회차 (없으면 undefined) */
export { getNextOpenSession };
