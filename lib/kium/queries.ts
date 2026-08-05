import { KIUM_COURSES, KIUM_CATEGORY_META, type KiumCategory, type KiumCourse } from './data';

/**
 * 인재키움프리미엄 조회 계층 — 기술명세서 v1.0 §3
 *
 * 컴포넌트·페이지는 이 함수들만 사용한다. data.ts는 소스 문서에서 자동 추출된
 * 원문이므로 이 파일에서도 값을 가공하지 않는다(정렬·필터링만 수행).
 */

/** 연번(kium-01~19) 추출 — id 접미 숫자. 정렬 전용 */
function seq(c: KiumCourse): number {
  return Number(c.id.replace(/^kium-/, '')) || 0;
}

/** 전체 과정 — 카테고리 order → 연번 오름차순 (성장단계 내러티브 고정 순서) */
export function getAllCourses(): KiumCourse[] {
  return [...KIUM_COURSES].sort((a, b) => {
    const d = KIUM_CATEGORY_META[a.category].order - KIUM_CATEGORY_META[b.category].order;
    return d !== 0 ? d : seq(a) - seq(b);
  });
}

export function getCoursesByCategory(cat: KiumCategory): KiumCourse[] {
  return getAllCourses().filter((c) => c.category === cat);
}

export function getCourseById(id: string): KiumCourse | undefined {
  return KIUM_COURSES.find((c) => c.id === id);
}

/**
 * 전 과정이 실시간 비대면을 지원하는가 — data.ts `delivery` 필드 전수 확인.
 * 새 수치를 만드는 것이 아니라 소스 데이터에서 파생한 사실이며,
 * 19건 중 하나라도 어긋나면 false가 되어 해당 문구가 렌더되지 않는다.
 */
export function isAllRealtimeRemote(): boolean {
  return KIUM_COURSES.length > 0 && KIUM_COURSES.every((c) => c.delivery.includes('실시간 비대면'));
}

/** 필터 칩 카운트 병기용 — 카테고리 order 순 [key, label, count] */
export function getCategoryCounts(): { key: KiumCategory; label: string; count: number }[] {
  return (Object.keys(KIUM_CATEGORY_META) as KiumCategory[])
    .sort((a, b) => KIUM_CATEGORY_META[a].order - KIUM_CATEGORY_META[b].order)
    .map((key) => ({
      key,
      label: KIUM_CATEGORY_META[key].label,
      count: KIUM_COURSES.filter((c) => c.category === key).length,
    }));
}
