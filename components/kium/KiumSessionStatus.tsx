import type { KiumSessionStatus } from '@/lib/kium/sessions';

/**
 * 회차 모집 상태 배지 4종 (명세 §5-6)
 *
 * - 기존 `.kium-badge`를 상속하고 `data-st`로만 변주한다 — 신규 클래스 최소화
 * - 색만으로 상태를 전달하지 않는다. 텍스트 라벨을 항상 동반하고 `aria-hidden`을 쓰지 않는다.
 */
export const STATUS_LABEL: Record<KiumSessionStatus, string> = {
  open: '모집중', confirmed: '개강확정', closing: '마감임박', closed: '마감',
};

export default function KiumSessionStatusBadge({ status }: { status: KiumSessionStatus }) {
  return (
    <span className="kium-badge st" data-st={status}>
      {STATUS_LABEL[status]}
    </span>
  );
}
