/** 상담 신청 제출 결과 (기술명세서 §1) */
export type InquiryResult = 'success' | 'blockedByFilter' | 'serverError';

/**
 * 판정에 사용하는 최소 형상.
 * 폼의 InquiryPayload가 구조적으로 이 형상을 만족하므로 폼 필드명을 바꾸지 않는다.
 */
export interface InquirySubmission {
  message: string;
}
