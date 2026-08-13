/**
 * Blob 다운로드(B안)를 쓸 수 있는 환경인지 사전 판정한다 (기술명세서 §4).
 *
 * 16MB를 메모리에 조립하는 방식이라 iOS Safari·저메모리 기기는 실패 위험이 크다.
 * false면 호출부는 <a download> 직접 링크(A안 directMode)로 분기한다.
 */
export function canUseBlobDownload(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('download' in HTMLAnchorElement.prototype)) return false;

  // iOS/iPadOS Safari — 대용량 Blob 다운로드 신뢰도 낮음
  const ua = navigator.userAgent;
  const isIOS =
    /iP(hone|ad|od)/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return false;

  // 저메모리 기기 (지원 브라우저에 한함)
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === 'number' && mem <= 2) return false;

  return true;
}
