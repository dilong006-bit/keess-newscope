'use client';

import { useCallback, useEffect, useState } from 'react';
import { isNoticeSeen, markNoticeSeen, type NoticeFlag } from '@/lib/notice';

/**
 * 신규 메뉴 알림 미열람 여부 + 소멸 처리 (기술명세서 v1.0 §3-2)
 *
 * [하이드레이션 규칙 — 어기면 불일치 경고가 난다]
 * localStorage 는 서버에 없다. 그래서 초기 상태는 **반드시 false(=알림 숨김)** 로 두고,
 * 서버 렌더·최초 클라이언트 렌더가 동일한 DOM 을 만든 다음 useEffect 에서만 true 로 올린다.
 * M1 의 "마운트 0.6초 뒤 pop" 지연이 이 한 프레임의 공백을 자연스럽게 흡수한다.
 *
 * mobileOnly 는 1회 평가가 아니라 matchMedia 구독이다 — 회전·리사이즈로 PC 폭이 되면
 * 배지가 그 자리에서 사라져야 하고(§5-4 PC 노출 금지), CSS 가드에만 기대지 않는다.
 */

/** 배지·티저 노출 상한. 명세서 §2 M1 "뷰포트 < 1024px" 를 배타 상한으로 표기. */
const MOBILE_QUERY = '(max-width: 1023.98px)';

interface Options {
  /** true 면 모바일 뷰포트에서만 unseen 이 참이 된다 */
  mobileOnly?: boolean;
}

export function useNoticeFlag(flag: NoticeFlag, { mobileOnly = false }: Options = {}) {
  const [stored, setStored] = useState(false);
  const [inViewport, setInViewport] = useState(!mobileOnly);

  // 저장값 확인은 마운트 이후에만 (SSR 불일치 방지)
  useEffect(() => {
    setStored(!isNoticeSeen(flag));
  }, [flag]);

  useEffect(() => {
    if (!mobileOnly) {
      setInViewport(true);
      return;
    }
    const mq = window.matchMedia(MOBILE_QUERY);
    setInViewport(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setInViewport(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mobileOnly]);

  /** 소멸 — 화면에서 즉시 내리고 열람 사실을 영구 기록한다 */
  const dismiss = useCallback(() => {
    setStored(false);
    markNoticeSeen(flag);
  }, [flag]);

  return { unseen: stored && inViewport, dismiss };
}
