/**
 * 상담 폼 진입 출처 → '관심 영역' 사전 선택 (쿼리 파라미터 기반)
 *
 * 서비스 페이지의 상담 CTA가 `?interest=<칩 value>`를 달고 홈 상담 폼(/#inq)으로 보내면,
 * 폼이 마운트될 때 해당 칩을 켠 상태로 시작한다. 최초 진입 1회성 기본값일 뿐이며
 * 사용자는 이후 자유롭게 해제·추가할 수 있다(강제 고정 아님).
 *
 * 값은 `INQ.interests`의 value와 동일해야 하고(ax-ai / leadership / hrd / content / …),
 * 유효하지 않거나 파라미터가 없으면 미선택으로 폴백한다. 폼 쪽에 페이지별 분기를 두지 않으므로
 * 다른 서비스 페이지도 링크만 바꾸면 그대로 확장된다.
 *
 * GNB '교육 상담'처럼 서비스 컨텍스트가 없는 진입은 파라미터를 붙이지 않아 기존 동작을 유지한다.
 */

export const INTEREST_PARAM = 'interest';

/**
 * 서비스 페이지 → 상담 폼 링크 생성.
 * @param interest 관심 영역 칩 value (쉼표로 여러 개 가능)
 */
export function inquiryHref(interest: string, base = '/', anchor = 'inq'): string {
  return `${base}?${INTEREST_PARAM}=${encodeURIComponent(interest)}#${anchor}`;
}

/**
 * 현재 URL에서 사전 선택할 관심 영역을 읽는다. 유효한 값만 통과시키고,
 * 서버 렌더 시점에는 빈 배열을 돌려 hydration 불일치를 만들지 않는다.
 */
export function readInterestParam(valid: readonly string[]): string[] {
  if (typeof window === 'undefined') return [];
  const raw = new URLSearchParams(window.location.search).get(INTEREST_PARAM);
  if (!raw) return [];
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter((v) => valid.includes(v));
}
