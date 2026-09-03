import { KIUM_COURSES, KIUM_CATEGORY_META, type KiumCategory, type KiumCourse } from './data';

/**
 * 공개교육 회차 데이터 — 요청 원문 「※공개교육 일자※」 표(260903) 1:1.
 * 규칙: 이 파일의 일자는 요청 원문 외 수정 금지. 요일 표기는 저장하지 않고 startDate에서 파생한다
 *       (요일 오기를 구조적으로 불가능하게 만든다 — 원문 표에서 실제 1건 발견됨).
 */
export type KiumSessionStatus = 'open' | 'confirmed' | 'closing' | 'closed';

export type KiumSession = {
  /** 딥링크 키 */
  id: string;
  /** KIUM_COURSES.id 참조 — 과정 메타는 전부 조인해서 쓴다(중복 저장 금지) */
  courseId: string;
  /** 일정표 열 배치 기준월. 11/30~12/1 회차는 12(사업부 원안 준수) */
  displayMonth: 10 | 11 | 12;
  /** 정렬·과거 판정의 단일 기준 (ISO). tbd인 경우 빈 문자열 */
  startDate: string;
  endDate: string;
  status: KiumSessionStatus;
  /** 일자 미확정(사업부 회신 대기). true면 리스트·집계에서 제외하고 매트릭스에서만 비활성 렌더 */
  tbd?: boolean;
};

/**
 * ⚠ status 20건은 **사업부 회신 전 추정값**이다(요청 시안 캡처 기준).
 *   시안은 레이아웃 예시로 판정된 자료이므로 이 필드는 원문 근거가 없다.
 *   오픈 전 실제 모집 상태를 회신받아 전건 교체할 것. 전건 'open'도 유효한 확정안이다.
 */
export const KIUM_SESSIONS: KiumSession[] = [
  // AI활용 — 업무효율화: Agent (kium-09)
  { id: 'agent-r1',  courseId: 'kium-09', displayMonth: 10, startDate: '2026-10-12', endDate: '2026-10-13', status: 'confirmed' },
  { id: 'agent-r2',  courseId: 'kium-09', displayMonth: 11, startDate: '2026-11-02', endDate: '2026-11-03', status: 'open' },
  { id: 'agent-r3',  courseId: 'kium-09', displayMonth: 12, startDate: '2026-11-30', endDate: '2026-12-01', status: 'open' },
  // AI활용 — 업무효율화: Data (kium-10)
  { id: 'data-r1',   courseId: 'kium-10', displayMonth: 10, startDate: '2026-10-14', endDate: '2026-10-15', status: 'confirmed' },
  { id: 'data-r2',   courseId: 'kium-10', displayMonth: 11, startDate: '2026-11-09', endDate: '2026-11-10', status: 'open' },
  { id: 'data-r3',   courseId: 'kium-10', displayMonth: 12, startDate: '2026-12-07', endDate: '2026-12-08', status: 'open' },
  // AI활용 — AI 직무전문화 (kium-11)
  { id: 'aijob-r1',  courseId: 'kium-11', displayMonth: 10, startDate: '2026-10-19', endDate: '2026-10-20', status: 'open' },
  { id: 'aijob-r2',  courseId: 'kium-11', displayMonth: 11, startDate: '2026-11-16', endDate: '2026-11-17', status: 'open' },
  { id: 'aijob-r3',  courseId: 'kium-11', displayMonth: 12, startDate: '2026-12-14', endDate: '2026-12-15', status: 'open' },
  // 비즈니스 역량 — 전략적 비즈니스 협상 스킬 (kium-12)
  { id: 'nego-r1',   courseId: 'kium-12', displayMonth: 10, startDate: '2026-10-27', endDate: '2026-10-27', status: 'confirmed' },
  // 비즈니스 역량 — 스피치&프레젠테이션 클리닉 (kium-13)
  { id: 'speech-r1', courseId: 'kium-13', displayMonth: 11, startDate: '2026-11-12', endDate: '2026-11-13', status: 'open' },
  // 비즈니스 역량 — 인정받는 직장인의 구두보고 스킬 (kium-14)
  { id: 'report-r1', courseId: 'kium-14', displayMonth: 12, startDate: '2026-12-11', endDate: '2026-12-11', status: 'open' },
  // CS·민원응대 — CS 종합 솔루션 (kium-19)
  { id: 'cs-r1',     courseId: 'kium-19', displayMonth: 10, startDate: '2026-10-26', endDate: '2026-10-26', status: 'open' },
  { id: 'cs-r2',     courseId: 'kium-19', displayMonth: 11, startDate: '2026-11-17', endDate: '2026-11-17', status: 'open' },
  { id: 'cs-r3',     courseId: 'kium-19', displayMonth: 12, startDate: '2026-12-21', endDate: '2026-12-21', status: 'open' },
  // 리더십·관리자 — 진단 기반 팀장 리더십 Re-Lead (kium-04)
  { id: 'relead-r1', courseId: 'kium-04', displayMonth: 10, startDate: '2026-10-21', endDate: '2026-10-22', status: 'open' },
  { id: 'relead-r2', courseId: 'kium-04', displayMonth: 11, startDate: '2026-11-18', endDate: '2026-11-19', status: 'open' },
  // ⚠ 원문 표기 `12/17(수)~18(금`이 실제 달력과 불일치(2026-12-17=목). 사업부 회신 전까지 tbd.
  { id: 'relead-r3', courseId: 'kium-04', displayMonth: 12, startDate: '', endDate: '', status: 'open', tbd: true },
  // 신입·온보딩 — On-Powering 리텐션 (kium-03)
  { id: 'onpow-r1',  courseId: 'kium-03', displayMonth: 12, startDate: '2026-12-09', endDate: '2026-12-10', status: 'open' },
  { id: 'onpow-r2',  courseId: 'kium-03', displayMonth: 12, startDate: '2026-12-16', endDate: '2026-12-17', status: 'open' },
];

/** 공개교육 개설 과정 id — KIUM_SESSIONS에서 파생(수기 목록 금지) */
export const KIUM_OPEN_COURSE_IDS: string[] = Array.from(
  new Set(KIUM_SESSIONS.map((s) => s.courseId))
);

export function isOpenCourse(courseId: string): boolean {
  return KIUM_OPEN_COURSE_IDS.includes(courseId);
}

/** 공개교육 9과정 — KIUM_COURSES 기존 정렬(카테고리 order → 연번) 유지 */
export function getOpenCourses(): KiumCourse[] {
  return KIUM_COURSES.filter((c) => isOpenCourse(c.id));
}

/** 일자 확정 회차만 (집계·리스트·정렬의 기준) */
export function getDatedSessions(): KiumSession[] {
  return KIUM_SESSIONS.filter((s) => !s.tbd);
}

/** 특정 과정 + 특정 월의 회차 (매트릭스 셀) — tbd 포함 */
export function getSessionsOf(courseId: string, month: 10 | 11 | 12): KiumSession[] {
  return KIUM_SESSIONS.filter((s) => s.courseId === courseId && s.displayMonth === month);
}

/** 시작일 오름차순 (리스트 뷰) */
export function getSessionsByDate(): KiumSession[] {
  return [...getDatedSessions()].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function getSessionById(id: string): KiumSession | undefined {
  return KIUM_SESSIONS.find((s) => s.id === id);
}

export function countByMonth(month: 10 | 11 | 12): number {
  return getDatedSessions().filter((s) => s.displayMonth === month).length;
}

/** 총 회차 수 — 히어로 지표. 수기 숫자 금지 */
export const KIUM_SESSION_TOTAL = getDatedSessions().length;

/** 공개교육 9과정 기준 카테고리 카운트 (0건 카테고리는 칩 자체를 만들지 않는다) */
export function openCategoryCounts(): { key: KiumCategory; label: string; count: number }[] {
  const open = getOpenCourses();
  return (Object.keys(KIUM_CATEGORY_META) as KiumCategory[])
    .map((key) => ({ key, label: KIUM_CATEGORY_META[key].label, count: open.filter((c) => c.category === key).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => KIUM_CATEGORY_META[a.key].order - KIUM_CATEGORY_META[b.key].order);
}

/* ── 표기 유틸 — 요일은 전부 여기서 파생한다 ───────────────────────── */
const DOW = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 'YYYY-MM-DD' → Date. 타임존 영향 없이 로컬 자정으로 고정 */
function toDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** '10.12(월)' */
export function fmtDay(iso: string): string {
  const d = toDate(iso);
  return `${d.getMonth() + 1}.${d.getDate()}(${DOW[d.getDay()]})`;
}

/** 1일: '10.12(월)' / 2일: '10.12(월) ~ 13(화)' / 월 경계: '11.30(월) ~ 12.1(화)' */
export function fmtRange(s: KiumSession): string {
  if (s.tbd) return '일정 조율 중';
  const a = toDate(s.startDate);
  const b = toDate(s.endDate);
  const head = fmtDay(s.startDate);
  if (s.startDate === s.endDate) return head;
  const tail =
    a.getMonth() === b.getMonth()
      ? `${b.getDate()}(${DOW[b.getDay()]})`
      : `${b.getMonth() + 1}.${b.getDate()}(${DOW[b.getDay()]})`;
  return `${head} ~ ${tail}`;
}

/** 스크린리더용 완전 표기 — '2026년 10월 12일 월요일부터 10월 13일 화요일까지' */
export function fmtRangeA11y(s: KiumSession): string {
  if (s.tbd) return '일정 조율 중';
  const a = toDate(s.startDate);
  const b = toDate(s.endDate);
  const one = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 ${DOW[d.getDay()]}요일`;
  return s.startDate === s.endDate
    ? `${a.getFullYear()}년 ${one(a)}`
    : `${a.getFullYear()}년 ${one(a)}부터 ${one(b)}까지`;
}

/** 프리필용 — '2026.10.12 월 ~ 10.13 화' */
export function fmtRangePrefill(s: KiumSession): string {
  if (s.tbd) return '일정 조율 중';
  const a = toDate(s.startDate);
  const b = toDate(s.endDate);
  const head = `${a.getFullYear()}.${a.getMonth() + 1}.${a.getDate()} ${DOW[a.getDay()]}`;
  if (s.startDate === s.endDate) return head;
  return `${head} ~ ${b.getMonth() + 1}.${b.getDate()} ${DOW[b.getDay()]}`;
}

/** 종료일이 오늘 이전인가 — 클라이언트 마운트 후에만 호출할 것(§8 SSG 규칙) */
export function isPast(s: KiumSession, now: Date = new Date()): boolean {
  if (s.tbd) return false;
  const end = toDate(s.endDate);
  end.setHours(23, 59, 59, 999);
  return end.getTime() < now.getTime();
}

/**
 * §8 안전장치 — 데이터의 status가 무엇이든 마운트 후 종료일이 지난 회차는 closed로 승격한다.
 * 운영 담당자가 배지를 못 바꿔서 지난 회차에 신청이 들어오는 사고를 구조적으로 차단한다.
 */
export function effectiveStatus(s: KiumSession, now: Date | null): KiumSessionStatus {
  if (now && isPast(s, now)) return 'closed';
  return s.status;
}
