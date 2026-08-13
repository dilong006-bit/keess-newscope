import type { InquiryResult, InquirySubmission } from './types';

/**
 * 기준환경 전용 모의 제출 (기술명세서 §4).
 *
 * 검수자가 실제로 `<script>alert('XSS')</script>` 를 입력해 차단 화면을 확인할 수 있도록,
 * 운영 웹방화벽이 걸러내는 패턴을 같은 결과로 재현한다.
 * 개인정보는 어디에도 전송하지 않으며 콘솔 로그도 남기지 않는다.
 */

/** 운영 웹방화벽이 반응하는 패턴 (§4-3 규칙 2) */
const WAF_PATTERNS = ['<script', 'onerror=', 'javascript:', '<iframe'];

/** submitting 상태 렌더를 확인할 수 있게 하는 지연 */
const MOCK_DELAY_MS = 600;

/** 검수용 상태 강제 — ?__inqState=success | blocked | error (§4-3 규칙 1) */
function forcedState(): InquiryResult | null {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search).get('__inqState');
  if (q === 'success') return 'success';
  if (q === 'blocked') return 'blockedByFilter';
  if (q === 'error') return 'serverError';
  return null;
}

export async function submitMock(payload: InquirySubmission): Promise<InquiryResult> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));

  const forced = forcedState();
  if (forced) return forced;

  const msg = (payload.message || '').toLowerCase();
  if (WAF_PATTERNS.some((p) => msg.includes(p))) return 'blockedByFilter';

  return 'success';
}
