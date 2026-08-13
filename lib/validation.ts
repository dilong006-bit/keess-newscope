// 필드 단위 입력 검증 — 폼 컴포넌트가 아니라 여기에 규칙을 둔다.
// 검증기는 '통과=null / 실패=사용자에게 보여줄 안내 문구'를 돌려주는 단일 시그니처를
// 공유하므로, 폼 쪽은 어떤 필드든 같은 방식으로 상태를 관리·렌더할 수 있다.

/** 필드 검증 결과 — null 이면 통과, 문자열이면 그대로 화면에 노출할 안내 문구 */
export type FieldError = string | null;

/** 필드 검증기 시그니처 (전화번호 형식·비밀번호 확인 일치 등 확장 시 이 형태를 따른다) */
export type FieldValidator = (raw: string) => FieldError;

/**
 * 이메일 형식 — 명백한 오입력만 걸러낸다.
 * 공백 없음 · @ 정확히 1개 · @ 앞 최소 1자 · 도메인에 점(.) 존재 · 최상위 도메인 2자 이상.
 * RFC 5322 완전 준수 정규식은 쓰지 않는다(유지보수 불가 + 정상 주소 오탐).
 *
 * ※ lib/utils 의 EMAIL_RE 는 최상위 도메인을 1자 이상으로 보아 `a@b.c` 를 통과시킨다.
 *   그쪽은 상담·다운로드 폼이 공유하므로 이번 범위(부정훈련 신고)에서 건드리지 않았다.
 *   두 규칙의 차이는 1자 TLD 뿐이며, 타 폼이 작업 범위에 들어올 때 이 규칙으로 통합한다.
 */
export const EMAIL_RE_STRICT = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * 안내 문구 — 미입력과 형식 오류를 분리한다.
 * 판정형('올바르지 않습니다')이 아니라 무엇을 하면 되는지 알려주는 지시형으로 쓰고,
 * '형식'·'유효성' 같은 기술 용어는 노출하지 않는다.
 * format 의 예시 주소는 해당 입력 필드의 placeholder 와 같은 문자열이어야 한다.
 */
export const EMAIL_MSG = {
  empty: '이메일을 입력해 주세요.',
  format: 'name@company.com 형식으로 입력해 주세요.',
} as const;

/** 이메일 검증. 앞뒤 공백은 붙여넣기에서 매우 흔하므로 trim 후 판정한다(대소문자는 변환하지 않는다). */
export const validateEmail: FieldValidator = (raw) => {
  const v = (raw || '').trim();
  if (!v) return EMAIL_MSG.empty;
  return EMAIL_RE_STRICT.test(v) ? null : EMAIL_MSG.format;
};

/** 검증기 레지스트리 — 필드를 추가할 때 여기에 등록하면 폼 쪽 코드는 그대로 쓴다. */
export const FIELD_VALIDATORS = {
  email: validateEmail,
} satisfies Record<string, FieldValidator>;

export type ValidatedField = keyof typeof FIELD_VALIDATORS;

/** 필드 키로 검증 실행 */
export function validateField(field: ValidatedField, raw: string): FieldError {
  return FIELD_VALIDATORS[field](raw);
}
