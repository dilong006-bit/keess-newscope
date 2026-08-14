'use client';

import { useAutoDismissTimer } from '@/hooks/useAutoDismissTimer';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** 인라인 도입문의 폼(/leadership · /hrd)의 완료 카드 유지 시간(ms) — RD-009 */
export const SUCCESS_AUTO_RESET_MS = 6000;

interface InquirySuccessProps {
  title: string;
  message: string;
  /**
   * 유지 시간(ms). 기본값 null = 자동 복귀 없음(현행 동작).
   * 값을 넘기지 않는 호출부는 지금과 똑같이 동작한다 — 모달·홈 폼이 자동으로
   * 사라지지 않도록 자동 복귀를 컴포넌트 내부에 하드코딩하지 않는다.
   */
  autoResetMs?: number | null;
  onReset?: () => void;
}

/**
 * 도입문의 완료 카드 (기존 .form-done 골격 1:1)
 *
 * ※ 카드 자체에 aria-live / role="status" 를 걸지 않는다. live region 은 DOM 에 먼저
 *   존재한 뒤 내용이 바뀌어야 낭독되므로, 내용을 담은 채 통째로 마운트되는 카드는
 *   스크린리더가 읽지 않는 경우가 많다. 낭독은 호출부의 상시 live region 이 맡는다.
 * ※ "잠시 후"·"6초 후" 같은 시간 예고 문장을 두지 않는다. 타이머는 hover·탭 비활성·
 *   뷰포트 이탈로 일시정지되므로 그런 문장은 반드시 실제와 어긋난다(RD-009의 원인).
 *   잔여 시간은 프로그레스 바로만 표현한다.
 */
export default function InquirySuccess({
  title, message, autoResetMs = null, onReset,
}: InquirySuccessProps) {
  const reduced = usePrefersReducedMotion();
  const enabled = autoResetMs != null && autoResetMs > 0 && typeof onReset === 'function';

  const { cardRef, barRef } = useAutoDismissTimer({
    durationMs: autoResetMs ?? 0,
    enabled,
    onExpire: () => onReset?.(),
    // 감소 모션: 바를 없애지 않고 1초 단위 6단계로만 갱신해 연속 애니메이션만 제거
    quantizeMs: reduced ? 1000 : 0,
  });

  return (
    <div className="form-done show" ref={cardRef}>
      <div className="check" aria-hidden="true">✓</div>
      <h4>{title}</h4>
      <p>{message}</p>
      {enabled && (
        <div className="done-progress" aria-hidden="true">
          <div className="done-progress__bar" ref={barRef} />
        </div>
      )}
    </div>
  );
}
