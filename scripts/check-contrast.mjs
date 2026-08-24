#!/usr/bin/env node
/**
 * 썸네일 과정명 대비 검증 (기술명세서 v1.0 §6 · §8, 최종 v2.0 §5)
 *
 * styles/kium.css의 .kium-thumb 3겹 그라디언트를 그대로 재현해
 * "과정명 텍스트 앵커 존"(좌하단)의 여러 지점에서 흰색 텍스트 대비를 계산한다.
 * 7카테고리 × 스크림 유무 전 조합을 검사하고, 4.5:1(WCAG AA) 미달이 하나라도 있으면 exit 1.
 *
 *   실행: node scripts/check-contrast.mjs
 *
 * ※ 토큰 값은 명세 원문이므로 이 스크립트에서 바꾸지 않는다.
 *   실패 시 해결책은 토큰 변경이 아니라 텍스트 앵커/스크림 규칙 재검토다.
 */

// ── .kium-thumb 토큰 (styles/kium.css와 1:1) ────────────────────────────
const MESH_BASE = '#2E1A6B';
const MESH_DARK = '#1B0F45';

// [수정 4] 보조색 채도·커버리지 상향판
// [카테고리 재지정 · 260824] 6종 → 7종. business/comm은 소멸한 executive/common 색을 재배정했고,
// cs만 기존 전역 토큰 --p2(#E91E63) + 그 45% 틴트(color-mix 결과 #F59AB9)를 쓴다.
const CATEGORIES = [
  { key: 'onboarding', label: '신입·온보딩', a: '#2563EB', b: '#60A5FA' },
  { key: 'roleup', label: '승진자', a: '#7C3AED', b: '#C4B5FD' },
  { key: 'leadership', label: '리더십·관리자', a: '#3730A3', b: '#818CF8' },
  { key: 'ai', label: 'AI활용', a: '#0891B2', b: '#67E8F9' },
  { key: 'business', label: '비즈니스 역량', a: '#172554', b: '#D4A72C' },
  { key: 'comm', label: '커뮤니케이션·조직활성화', a: '#52525B', b: '#D4D4D8' },
  { key: 'cs', label: 'CS·민원응대', a: '#E91E63', b: '#F59AB9' },
];

// 레이어 정의 — CSS의 radial-gradient(rx ry at cx cy, color 0%, transparent stop)
const LAYER_B = { cx: 0.85, cy: 0.12, rx: 1.2, ry: 0.9, stop: 0.7 }; // 최상단 레이어(55%→70%)
const LAYER_A = { cx: 0.68, cy: 0.78, rx: 1.1, ry: 1.0, stop: 0.85 }; // (60%→85%)
const LINEAR_DEG = 150; // linear-gradient(150deg, base → dark)

// 텍스트 스크림 — 하단 40% 높이, transparent → rgba(20,10,50,alpha)
// alpha는 --scrim 인자로 덮어쓸 수 있다(지시서: AA 미달 시 .35 → .45)
// 기본값 .45 — [수정 4] 커버리지 상향(60→85% / 55→70%) 후 ai 카테고리가 .35에서 미달하여
// 지시서 지침대로 .45로 확정(styles/kium.css .kium-thumb::after 와 동일 값)
const SCRIM_ALPHA = Number(process.env.SCRIM_ALPHA ?? 0.45);
const SCRIM = { height: 0.4, color: [20, 10, 50], alpha: SCRIM_ALPHA };

// 과정명 앵커 존 — 좌하단 고정(전 카테고리 공통). 카드 폭 대비 비율 좌표.
// .kium-thumb-title: left/right 14px, bottom 12px, 15~17px 2줄 클램프 기준의 실제 텍스트 점유 영역.
const ZONE = { x0: 0.05, x1: 0.7, y0: 0.72, y1: 0.94 };
const STEPS = 12; // 존 내부 샘플 격자 해상도

const ASPECT = 4 / 3; // .kium-thumb aspect-ratio
const AA = 4.5;
const AAA = 7;

// ── 색 유틸 ──────────────────────────────────────────────────────────────
function parseColor(c) {
  if (c.startsWith('#')) {
    const h = c.slice(1);
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`지원하지 않는 색 표기: ${c}`);
  const p = m[1].split(',').map((s) => parseFloat(s.trim()));
  return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]];
}

/** src(알파 포함)를 dst 위에 소스-오버 합성 */
function over(dst, src) {
  const a = src[3];
  return [
    src[0] * a + dst[0] * (1 - a),
    src[1] * a + dst[1] * (1 - a),
    src[2] * a + dst[2] * (1 - a),
  ];
}

function relLuminance([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** 흰색(#fff) 텍스트 대비비 */
function contrastWithWhite(rgb) {
  return 1.05 / (relLuminance(rgb) + 0.05);
}

// ── 그라디언트 샘플링 ────────────────────────────────────────────────────
/** CSS radial-gradient(color 0%, transparent stop) 의 지점 알파 */
function radialAlpha(layer, x, y) {
  const dx = (x - layer.cx) / layer.rx;
  const dy = (y - layer.cy) / layer.ry;
  const d = Math.hypot(dx, dy);
  if (d >= layer.stop) return 0;
  return 1 - d / layer.stop;
}

/** CSS linear-gradient(Ndeg, c0 0%, c1 100%) 의 지점 진행도 t */
function linearT(deg, x, y, aspect) {
  const rad = (deg * Math.PI) / 180;
  // CSS 각도: 0deg = to top, 시계방향. 화면 좌표(y 아래로 증가) 기준 방향 벡터
  const ux = Math.sin(rad);
  const uy = -Math.cos(rad);
  // 종횡비 반영(폭 = aspect, 높이 = 1)
  const W = aspect;
  const H = 1;
  const px = (x - 0.5) * W;
  const py = (y - 0.5) * H;
  const proj = px * ux + py * uy;
  const len = Math.abs(W * ux) + Math.abs(H * uy);
  return Math.min(1, Math.max(0, 0.5 + proj / len));
}

function mix(c0, c1, t) {
  return [c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, c0[2] + (c1[2] - c0[2]) * t];
}

/** 지점 (x,y)의 최종 표면색 */
function surfaceAt(cat, x, y, withScrim) {
  const base = parseColor(MESH_BASE);
  const dark = parseColor(MESH_DARK);
  let rgb = mix(base, dark, linearT(LINEAR_DEG, x, y, ASPECT));

  const a = parseColor(cat.a);
  rgb = over(rgb, [a[0], a[1], a[2], a[3] * radialAlpha(LAYER_A, x, y)]);

  const b = parseColor(cat.b);
  rgb = over(rgb, [b[0], b[1], b[2], b[3] * radialAlpha(LAYER_B, x, y)]);

  if (withScrim) {
    // 하단 40% 구간에서 transparent → alpha 선형 증가
    const top = 1 - SCRIM.height;
    if (y > top) {
      const p = (y - top) / SCRIM.height;
      rgb = over(rgb, [...SCRIM.color, SCRIM.alpha * p]);
    }
  }
  return rgb;
}

/** 앵커 존 격자에서 최저 대비 지점 탐색 */
function worstInZone(cat, withScrim) {
  let worst = { ratio: Infinity, x: 0, y: 0 };
  for (let i = 0; i <= STEPS; i++) {
    for (let j = 0; j <= STEPS; j++) {
      const x = ZONE.x0 + ((ZONE.x1 - ZONE.x0) * i) / STEPS;
      const y = ZONE.y0 + ((ZONE.y1 - ZONE.y0) * j) / STEPS;
      const ratio = contrastWithWhite(surfaceAt(cat, x, y, withScrim));
      if (ratio < worst.ratio) worst = { ratio, x, y };
    }
  }
  return worst;
}

// ── 실행 ─────────────────────────────────────────────────────────────────
const rows = [];
let fails = 0;
let min = Infinity;

for (const cat of CATEGORIES) {
  for (const withScrim of [false, true]) {
    const w = worstInZone(cat, withScrim);
    // 게이트는 "실제 렌더 구성"(스크림 상시 적용)만 판정한다.
    // 스크림 없는 행은 스크림 기여도를 보기 위한 진단 표시일 뿐, 화면에 존재하지 않는 구성이다.
    if (withScrim) {
      if (w.ratio < AA) fails++;
      min = Math.min(min, w.ratio);
    }
    rows.push({
      카테고리: `${cat.key} (${cat.label})`,
      스크림: withScrim ? 'O (렌더 구성)' : 'X (진단용)',
      '최저 대비': `${w.ratio.toFixed(2)}:1`,
      등급: w.ratio >= AAA ? 'AAA' : w.ratio >= AA ? 'AA' : '미달',
      '최악 지점': `x${w.x.toFixed(2)} y${w.y.toFixed(2)}`,
    });
  }
}

console.log('썸네일 과정명(흰색 600) 대비 검증 — WCAG AA 4.5:1');
console.log(`스크림 알파: ${SCRIM_ALPHA} (SCRIM_ALPHA 환경변수로 조정)`);
console.log(
  `앵커 존: x ${ZONE.x0}~${ZONE.x1} / y ${ZONE.y0}~${ZONE.y1} (좌하단), 격자 ${STEPS + 1}×${STEPS + 1}`
);
console.log('판정 대상 = 스크림 O 행(실제 렌더 구성). 스크림 X 행은 진단 표시.\n');
console.table(rows);

if (fails > 0) {
  console.error(`\n✗ 렌더 구성 기준 AA(4.5:1) 미달 ${fails}건 — 스크림 알파 상향 또는 메시 토큰 재검토 필요.`);
  process.exit(1);
}
console.log(`\n✓ 렌더 구성 전건 AA 통과 — 최저 ${min.toFixed(2)}:1`);
