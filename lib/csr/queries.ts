import { CSR_POSTS } from './data';
import type { CsrPost } from './types';

/**
 * 사회공헌 조회 계층 — G2-01-03 기술명세서 §3-3
 *
 * 컴포넌트·페이지는 이 함수들만 사용한다. 2차(수집 스케줄러) 전환 시
 * 이 파일 내부 구현만 '정적 배열 읽기 → 캐시 읽기'로 교체하면 되고,
 * 컴포넌트·페이지는 변경이 필요 없다.
 */

/** 전체 게시물 (sortDate 내림차순). sortDate는 정렬 전용 — UI 표기 금지 */
export function getAllCsrPosts(): CsrPost[] {
  return [...CSR_POSTS].sort((a, b) =>
    a.sortDate < b.sortDate ? 1 : a.sortDate > b.sortDate ? -1 : 0
  );
}

export function getCsrPostById(id: string): CsrPost | undefined {
  return CSR_POSTS.find((p) => p.id === id);
}

/** 목록 정렬(sortDate desc) 기준 이전글(더 최신)/다음글(더 과거) */
export function getAdjacentCsrPosts(id: string): { prev?: CsrPost; next?: CsrPost } {
  const posts = getAllCsrPosts();
  const i = posts.findIndex((p) => p.id === id);
  if (i === -1) return {};
  return { prev: posts[i - 1], next: posts[i + 1] };
}

/** 홈 하단 밴드 노출분 (기본 6건 — 노출 건수 조정은 이 인자만 변경) */
export function getHomeBandCsrPosts(limit = 6): CsrPost[] {
  return getAllCsrPosts().slice(0, limit);
}
