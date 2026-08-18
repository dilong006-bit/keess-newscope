/**
 * 신규 메뉴 알림 열람 상태 (모바일 신규 메뉴 인지 개선 기술명세서 v1.0 §3-1)
 *
 * localStorage 는 사파리 프라이빗 모드·쿠키 차단·용량 초과 등에서 **접근 자체가 throw** 한다.
 * 그래서 읽기·쓰기 전부를 try/catch 로 감싸고, 실패하면 예외를 올리는 대신
 * "미열람"(=알림을 아직 못 본 상태) 기본값으로 되돌린다. 알림을 한 번 더 보여주는 손해는
 * 화면이 백지가 되는 손해보다 훨씬 싸다.
 *
 * 키에 `_v1` 을 붙여 둔다 — 다음 신규 메뉴 알림에서 `_v2` 로 올리면 전체가 자연히 초기화된다.
 */

const STORAGE_KEY = 'keess_notice_v1';

export type NoticeFlag = 'kiumBadgeSeen' | 'kiumTeaserSeen';

type NoticeState = Partial<Record<NoticeFlag, boolean>>;

/** 저장값 읽기. 접근 실패·형식 이상 시 항상 빈 객체(=전부 미열람). */
function read(): NoticeState {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return {};
  }
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    // 배열·null·원시값이 들어와 있으면 우리 스키마가 아니다 → 오염된 키로 간주
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      remove();
      return {};
    }
    return parsed as NoticeState;
  } catch {
    // 파싱 실패 → 해당 키를 지우고 기본값 사용 (§3-1 "파싱 실패" 규칙)
    remove();
    return {};
  }
}

function remove() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* 지우지 못해도 기본값으로 동작하므로 무시 */
  }
}

/** 해당 알림을 이미 열람했는지. 판정 불가 상황은 전부 false(미열람). */
export function isNoticeSeen(flag: NoticeFlag): boolean {
  if (typeof window === 'undefined') return false;
  return read()[flag] === true;
}

/** 열람 처리. 다른 플래그를 덮어쓰지 않도록 기존 값을 읽어 병합한다. */
export function markNoticeSeen(flag: NoticeFlag): void {
  if (typeof window === 'undefined') return;
  try {
    const next: NoticeState = { ...read(), [flag]: true };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* 저장 실패 시 이번 세션 동안만 노출되지 않는다 — 사용자에게 오류를 보이지 않는다 */
  }
}
