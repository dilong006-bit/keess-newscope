'use client';

import { useEffect, useState } from 'react';
import { KIUM_OPEN_SELECT_EVENT } from '@/lib/kium/openBridge';
import { getCourseById } from '@/lib/kium/queries';
import { fmtRange, getSessionById } from '@/lib/kium/sessions';
import { fmtPrice } from '@/lib/kium/pricing';

/**
 * 신청 요약 배너 (명세 §7-2)
 *
 * 공유 폼(HomeInquiry)을 건드리지 않고 프리필 상태를 시각화하기 위해 폼 바깥에 둔다.
 * 이것이 회귀 위험을 낮추는 핵심 설계다 — 폼의 필드·검증·동의 구조는 이 컴포넌트와 무관하다.
 *
 * · 선택 없음 → 렌더하지 않는다
 * · role="status" → 암묵 aria-live="polite". 프리필 완료가 스크린리더에 고지된다
 * · [변경] → 공개교육 탭 상단으로 복귀
 */
export default function KiumApplySummary() {
  const [sel, setSel] = useState<{ courseId: string; sessionId: string } | null>(null);

  useEffect(() => {
    const onSelect = (e: Event) => {
      const d = (e as CustomEvent<{ courseId?: string; sessionId?: string }>).detail;
      if (!d?.courseId || !d?.sessionId) return;
      setSel({ courseId: d.courseId, sessionId: d.sessionId });
    };
    window.addEventListener(KIUM_OPEN_SELECT_EVENT, onSelect);
    return () => window.removeEventListener(KIUM_OPEN_SELECT_EVENT, onSelect);
  }, []);

  if (!sel) return null;
  const course = getCourseById(sel.courseId);
  const session = getSessionById(sel.sessionId);
  if (!course || !session) return null;

  return (
    <div className="kium-apply-sum" role="status">
      <span>
        신청 과정 <b>{course.titleMarketing}</b> · {session.displayMonth}월 회차 ({fmtRange(session)}) ·{' '}
        {fmtPrice(course.id)}
      </span>
      <a className="chg" href="#kium-open">
        변경
      </a>
    </div>
  );
}
