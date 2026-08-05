// GNB 라우팅 (Design.md §0.5-1 · 무동작 금지 · 실제 페이지 이동)
export type NavKey = 'home' | 'ax-ai' | 'leadership' | 'hrd' | 'content';

export interface NavItem {
  key: NavKey;
  label: string;
  href: string;
}

// AX·AI→/ax-ai, 리더십·조직→/leadership, HRD 통합→/hrd, 콘텐츠→/content
// (정부지원 GNB 진입점은 제거 — /hrd#gov 섹션 및 타 위치 링크는 유지)
export const NAV_ITEMS: NavItem[] = [
  { key: 'ax-ai', label: 'AX·AI 전환', href: '/ax-ai' },
  { key: 'leadership', label: '리더십·조직', href: '/leadership' },
  { key: 'hrd', label: 'HRD 통합 솔루션', href: '/hrd' },
  { key: 'content', label: '콘텐츠 솔루션', href: '/content' },
];

// 홈 로고 = 홈(/) (Design.md §0.5-2)
export const LOGO = { label: 'KEESS', href: '/' };

// GNB 우측 이벤트 칩 — 정식 메뉴 아님(기술명세서 최종 v2.0 §6-8: GNB 정식 메뉴 추가 금지).
// NAV_ITEMS와 분리해 두어 aria-current 대상·모바일 메뉴 구성에서 제외된다.
export const EVENT_CHIP = { label: '인재키움 프리미엄', href: '/kium' };
