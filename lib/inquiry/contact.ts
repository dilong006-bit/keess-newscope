/**
 * 상담 접수 대체 연락처 (기술명세서 §2-5).
 * 화면 문구에 하드코딩하지 않는다 — 변경 시 이 파일 한 곳만 고친다.
 */
export const INQUIRY_CONTACT = {
  EMAIL: 'kg11_kg6030@kggroup.co.kr',
  TEL: '02-828-2704',
  MAIL_SUBJECT: '[KEESS] 교육 상담 문의',
} as const;

/**
 * mailto 링크 — 제목만 프리필한다.
 * body·쿼리에 사용자 입력값(회사명·담당자명·연락처·문의 내용)을 절대 싣지 않는다.
 * URL과 메일 클라이언트 이력에 개인정보가 남기 때문이다.
 */
export const INQUIRY_MAILTO =
  `mailto:${INQUIRY_CONTACT.EMAIL}?subject=${encodeURIComponent(INQUIRY_CONTACT.MAIL_SUBJECT)}`;

/** tel 링크 — 모바일 탭 대응 */
export const INQUIRY_TEL_HREF = `tel:${INQUIRY_CONTACT.TEL.replace(/-/g, '')}`;
