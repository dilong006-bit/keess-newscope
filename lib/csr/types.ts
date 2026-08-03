/**
 * 사회공헌(/csr) 데이터 타입 — 최종 명세 v2.0 §3
 *
 * 타입 원본은 `data.ts`에 있다(수집 파이프라인이 생성하는 파일이라 타입이 내장됨).
 * 여기서는 re-export만 하여 **정의를 한 곳으로 유지**한다. data.ts가 재생성되어도
 * 수기 수정이 필요 없도록 이 방향을 택했다.
 *
 * 원문 HTML을 그대로 저장·주입하지 않고, 본문을 문단/이미지 블록 배열로
 * 구조화해 저장한다(dangerouslySetInnerHTML 금지 · XSS·마크업 오염 차단).
 *
 * CsrPost 주요 필드
 *  - affiliate  : 계열사 라벨. 카드·상세의 배지로 노출
 *  - sortDate   : 정렬 전용. UI에 절대 표기하지 않는다(명세 v2.0 §1-2)
 *  - sourceUrl  : KG그룹 공식 사회공헌 페이지 원문(kggroup.co.kr)
 */
import type { CsrPost } from './data';

export type { CsrBodyBlock, CsrPost } from './data';

/**
 * 카드가 실제로 쓰는 필드만 추린 투영 타입.
 * 목록은 클라이언트 컴포넌트(CsrListGrid)라 넘긴 값이 그대로 RSC 페이로드로 직렬화된다.
 * 전체 CsrPost를 넘기면 본문(body)·sortDate·sourceUrl까지 브라우저로 전송되므로
 * 이 타입으로 좁혀서 전달한다.
 */
export type CsrCardData = Pick<CsrPost, 'id' | 'title' | 'affiliate' | 'summary' | 'thumbnail'>;
