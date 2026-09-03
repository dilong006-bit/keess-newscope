/**
 * 공개교육 교육비 — 원천: 「2026_인재키움프리미엄_훈련과정_260804_HRD솔루션팀.xlsx」
 *   시트 「2. 신청 훈련과정 정보」 · **N열 훈련비 단가(원) = 1인 기준**
 *
 * ※ O열(총 훈련비)은 N열 × M열(훈련인원)로 계산된 과정 총액이므로 개인 신청 화면에 쓰지 않는다.
 * ※ 이 파일의 금액은 원천 외 수정 금지. 임의 산출·환산·할인 표기 금지.
 */
export const KIUM_PRICES: Record<string, number> = {
  'kium-03': 400000, // On-Powering 리텐션 과정
  'kium-04': 400000, // 진단 기반 팀장 리더십 Re-Lead 과정
  'kium-09': 700000, // 업무효율화: Agent 과정
  'kium-10': 700000, // 업무효율화: Data 과정
  'kium-11': 700000, // AI 직무전문화 과정
  'kium-12': 400000, // 전략적 비즈니스 협상 스킬 과정
  'kium-13': 400000, // 스피치&프레젠테이션 클리닉 과정
  'kium-14': 400000, // 인정받는 직장인의 구두보고 스킬
  'kium-19': 250000, // CS 종합 솔루션 과정
};

/**
 * 가격 표기 게이트 — content.ts facts 게이트와 같은 사상.
 * VAT 포함/별도, 환급 전/후 표기가 사업부 회신으로 확정되기 전에는 false로 두고,
 * 화면은 금액 대신 PRICE_FALLBACK을 노출한다. 부분 노출로 금액을 오해시키지 않는다.
 */
export const KIUM_PRICE_VERIFIED = true;

/** 금액 옆 각주 — VAT 표기 확정 시 이 상수만 교체한다(컴포넌트 수정 0) */
export const KIUM_PRICE_NOTE = '1인 기준';

export const PRICE_FALLBACK = '비용은 상담 시 안내';

export function getPrice(courseId: string): number | undefined {
  return KIUM_PRICES[courseId];
}

/** '700,000원' — 미검증·미등록이면 대체 문구 */
export function fmtPrice(courseId: string): string {
  const p = getPrice(courseId);
  if (!KIUM_PRICE_VERIFIED || p === undefined) return PRICE_FALLBACK;
  return `${p.toLocaleString('ko-KR')}원`;
}
