/**
 * 공개교육 탭 아이콘 — Lucide SVG 인라인 (명세 STEP 6)
 *
 * 신규 npm 의존성(@iconify/react 등)을 추가하지 않는다. Lucide 원본 path를 그대로 옮기고
 * stroke="currentColor" / stroke-width:2 / viewBox를 유지한다.
 *
 * 규칙
 * - 크기는 2단만: 16px(메타) · 14px(배지 내부). 그 외 값 사용 금지
 * - 아이콘 단독 사용 금지 — 항상 텍스트를 병기하고 아이콘 자체는 aria-hidden
 * - 색은 currentColor 상속. 아이콘에 색을 직접 지정하지 않는다
 */
type IconProps = { size?: 14 | 16 | 20; className?: string };

function Svg({ size = 16, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** lucide:calendar-days — 일정·날짜 */
export const IconCalendarDays = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 2v4M16 2v4M3 10h18" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
  </Svg>
);

/** lucide:calendar-range — 교육일정(기간) */
export const IconCalendarRange = (p: IconProps) => (
  <Svg {...p}>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M3 10h18M8 2v4M17 14h-6M13 18H7M7 14h.01M17 18h.01" />
  </Svg>
);

/** lucide:clock — 교육시간 */
export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Svg>
);

/** lucide:wallet — 수강료 */
export const IconWallet = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </Svg>
);

/** lucide:users — 대상 */
export const IconUsers = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

/** lucide:user-check — 정원·잔여석 */
export const IconUserCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </Svg>
);

/** lucide:circle-dashed — 모집중 */
export const IconCircleDashed = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10.1 2.18a9.93 9.93 0 0 1 3.8 0" />
    <path d="M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7" />
    <path d="M21.82 10.1a9.93 9.93 0 0 1 0 3.8" />
    <path d="M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69" />
    <path d="M13.9 21.82a9.94 9.94 0 0 1-3.8 0" />
    <path d="M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7" />
    <path d="M2.18 13.9a9.93 9.93 0 0 1 0-3.8" />
    <path d="M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69" />
  </Svg>
);

/** lucide:circle-check — 개강확정 */
export const IconCircleCheck = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

/** lucide:alarm-clock — 마감임박 */
export const IconAlarmClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3M6.38 18.7 4 21M17.64 18.67 20 21" />
  </Svg>
);

/** lucide:circle-slash — 마감 */
export const IconCircleSlash = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="9" x2="15" y1="15" y2="9" />
  </Svg>
);

/** lucide:arrow-right — 상담 이동 CTA */
export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </Svg>
);

/** lucide:corner-down-right — 다음 회차 보조 링크 */
export const IconCornerDownRight = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="15 10 20 15 15 20" />
    <path d="M4 4v7a4 4 0 0 0 4 4h12" />
  </Svg>
);

/** lucide:chevron-down — 확장 */
export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

/** lucide:badge-percent — 정부지원 스탯 */
export const IconBadgePercent = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m15 9-6 6" />
    <path d="M9 9h.01M15 15h.01" />
  </Svg>
);
