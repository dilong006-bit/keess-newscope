/**
 * 인라인 도입문의 폼(/leadership · /hrd) 공용 상수·헬퍼 (RD-009)
 *
 * 문구는 페이지별 분기 없이 단일 원본으로 관리한다 — 두 페이지가 같은 문장을 읽는다.
 * ※ 시간을 예고하는 문장("잠시 후"·"6초 후")은 어떤 분기에도 두지 않는다.
 *   타이머는 hover·탭 비활성·뷰포트 이탈로 일시정지되므로 반드시 실제와 어긋난다.
 */

/** 제출 진행 상태 */
export type InquiryPhase = 'form' | 'submitting' | 'success';

/** 동일 내용 재제출 차단 구간(ms) */
export const DEDUPE_WINDOW_MS = 10 * 60 * 1000;

/** 중복 접수 차단 안내 — 제출 버튼 위 인라인 */
export const DUPLICATE_MSG = '동일한 내용의 문의가 이미 접수되었습니다. 담당자 확인 후 연락드리겠습니다.';

/** 폼 복귀 시 스크린리더 안내 */
export const RETURN_MSG = '문의 폼으로 돌아왔습니다.';

interface InquiryValues {
  company: string;
  name: string;
  contact: string;
  interest: string;
  msg: string;
}

/** 중복 판정 키 — 회사명|담당자|연락처|관심영역|문의내용 (공백 정규화) */
export function dedupeKey(v: InquiryValues): string {
  return [v.company, v.name, v.contact, v.interest, v.msg]
    .map((s) => (s ?? '').trim().replace(/\s+/g, ' '))
    .join('|');
}
