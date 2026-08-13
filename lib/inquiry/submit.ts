import type { InquiryResult, InquirySubmission } from './types';

/**
 * 운영 환경 판정 계약 (기준환경은 mock 으로 동일 결과를 재현한다)
 *
 * 웹방화벽 차단 시 응답: 200 OK + Content-Type: text/html
 * → 상태코드만으로는 실패를 알 수 없으므로 Content-Type 으로 먼저 판정한다.
 *
 * const ct = res.headers.get('content-type') || ''
 * if (!ct.includes('application/json')) return 'blockedByFilter'
 * if (!res.ok)                          return 'serverError'
 * return 'success'
 *
 * 순서가 중요하다. res.ok 를 먼저 보면 차단(200)이 성공으로 판정된다.
 */

const MOCK = process.env.NEXT_PUBLIC_INQUIRY_MOCK === '1';

/**
 * 상담 신청 제출.
 *
 * MOCK 모드에서는 submitMock 이 위 계약과 같은 결과를 재현한다(동적 import — 운영 번들에서 분리).
 * 그 외 경로는 백엔드 연동 슬롯이다(CLAUDE.md §0-6). 기준환경에 운영 API 호출 코드는 두지 않는다.
 */
export async function submitInquiry(payload: InquirySubmission): Promise<InquiryResult> {
  if (MOCK) {
    const { submitMock } = await import('./submitMock');
    return submitMock(payload);
  }
  // 연동 슬롯 — 실제 엔드포인트가 붙을 자리. 위 판정 계약을 그대로 구현한다.
  void payload;
  return 'success';
}
