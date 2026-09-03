'use client';

import {
  IconAlarmClock,
  IconArrowRight,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleSlash,
  IconCornerDownRight,
} from './kiumIcons';
import { KIUM_SESSION_META, type KiumSessionStatus } from '@/lib/kium/sessions';

/**
 * 회차 모집 상태 배지 (명세 STEP 2)
 *
 * - 색만으로 상태를 전달하지 않는다: 색 + 아이콘 + 텍스트 3중 부호화. `aria-hidden` 금지
 * - 클래스는 `.kium-sbadge` — 기존 `.kium-badge`(과정안내 탭 `정부지원 환급` 칩)를 재정의하면
 *   같은 페이지의 다른 탭 렌더가 바뀌므로 별도 클래스로 격리한다(명세 값은 그대로).
 * - 레드 계열은 마감임박 전용. 지면 안 다른 요소에 레드 신규 사용 금지.
 */
const BADGE_ICON: Record<KiumSessionStatus, (p: { size?: 14 }) => JSX.Element> = {
  recruiting: IconCircleDashed,
  confirmed: IconCircleCheck,
  closing: IconAlarmClock,
  closed: IconCircleSlash,
};

export default function SessionBadge({
  status,
  seatsLeft,
}: {
  status: KiumSessionStatus;
  seatsLeft?: number;
}) {
  const meta = KIUM_SESSION_META[status];
  const Icon = BADGE_ICON[status];
  return (
    <span className="kium-sbadge" data-tone={meta.tone}>
      <Icon size={14} />
      <span>{meta.label}</span>
      {status === 'closing' && seatsLeft != null && <em>잔여 {seatsLeft}석</em>}
    </span>
  );
}

/** 상태별 CTA 라벨 — 명세 §2-3. 문구는 이 상수 한 곳에만 존재한다 */
export const CTA_LABEL: Record<KiumSessionStatus, string> = {
  recruiting: '이 일정으로 상담',
  confirmed: '이 일정으로 상담',
  closing: '마감 전 상담',
  closed: '다음 회차 상담',
};

/**
 * 상태별 CTA (명세 §2-3)
 *
 * - recruiting / confirmed → 기본 outline 버튼
 * - closing → 강조 filled(레드). 지면에서 유일하게 filled로 렌더된다
 * - closed → **요소 자체를 교체**한다. `aria-disabled` 버튼은 스크린리더에 혼선을 주므로
 *   버튼이 아니라 텍스트 링크로 바꾸고, 다음 회차 상담(경로 B)으로 보낸다.
 */
export function SessionCta({
  status,
  label,
  onClick,
}: {
  status: KiumSessionStatus;
  /** 접근명 보강용 컨텍스트(과정명·일자). 버튼 텍스트는 CTA_LABEL 고정 */
  label: string;
  onClick: () => void;
}) {
  const text = CTA_LABEL[status];
  if (status === 'closed') {
    return (
      <button type="button" className="kium-cta-next" onClick={onClick} aria-label={`${label} ${text}`}>
        <IconCornerDownRight size={16} />
        <span>{text}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`kium-cta-ses${status === 'closing' ? ' is-urgent' : ''}`}
      onClick={onClick}
      aria-label={`${label} ${text}`}
    >
      <span>{text}</span>
      <IconArrowRight size={16} />
    </button>
  );
}
