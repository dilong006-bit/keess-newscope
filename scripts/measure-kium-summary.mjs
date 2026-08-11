#!/usr/bin/env node
/**
 * /kium 과정 카드 소개문(summary) 말줄임 계측
 *
 *   실행: BASE_URL=http://localhost:3001 node scripts/measure-kium-summary.mjs
 *         OUT=audit/kium-summary-after.json  (선택 · 원시 결과 저장)
 *
 * -webkit-line-clamp:2로 잘린 텍스트는 scrollHeight > clientHeight로 검출된다.
 * 데스크톱 3열 그리드에서 카드가 가장 좁아질 수 있으므로 1024를 반드시 포함한다.
 */
import { chromium, devices } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3001';
const OUT = process.env.OUT ?? '';
const VPS = [360, 390, 768, 1024, 1440];

const b = await chromium.launch();
const rows = {}; // title -> { chars, vp: {…} }

for (const w of VPS) {
  const mobile = w <= 767;
  const ctx = await b.newContext({
    viewport: { width: w, height: 900 }, deviceScaleFactor: 1,
    isMobile: mobile, hasTouch: mobile,
    ...(mobile ? { userAgent: devices['iPhone 13'].userAgent } : {}),
  });
  const p = await ctx.newPage();
  // 과정안내 탭은 해시로 직접 진입한다(탭 클릭 애니메이션 대기 불필요)
  await p.goto(`${BASE}/kium#courses`, { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForSelector('.kium-card-summary', { timeout: 30000 });
  await p.waitForTimeout(700);

  const data = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('.kium-card-wrap').forEach((wrap) => {
      const el = wrap.querySelector('.kium-card-summary');
      if (!el) return;
      // 카드 제목: 이미지 모드는 .kium-card-title, 텍스트 모드는 썸네일 안의 제목
      const t = wrap.querySelector('.kium-card-title, .kium-thumb-title');
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight);
      return out.push({
        title: (t?.textContent || '').trim(),
        text: (el.textContent || '').trim(),
        chars: (el.textContent || '').trim().length,
        scrollH: +el.scrollHeight.toFixed(1),
        clientH: +el.clientHeight.toFixed(1),
        clientW: +el.clientWidth.toFixed(1),
        lines: Math.round(el.scrollHeight / lh),
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
        clamp: cs.webkitLineClamp || cs.getPropertyValue('-webkit-line-clamp'),
        wordBreak: cs.wordBreak,
        minHeight: cs.minHeight,
        clipped: el.scrollHeight > el.clientHeight + 0.5,
      });
    });
    return out;
  });

  for (const d of data) {
    rows[d.title] ??= { chars: d.chars, text: d.text, vp: {} };
    rows[d.title].chars = d.chars;
    rows[d.title].text = d.text;
    rows[d.title].vp[w] = d;
  }
  console.log(`vp ${w}: 카드 ${data.length}건 · summary 실폭 ${data[0]?.clientW}px · ` +
    `font ${data[0]?.fontSize}/${data[0]?.lineHeight} clamp=${data[0]?.clamp} ` +
    `word-break=${data[0]?.wordBreak} min-height=${data[0]?.minHeight}`);
  await ctx.close();
}
await b.close();

// 교체 대상 7건 (id가 DOM에 없으므로 제목으로 식별)
const REPLACED = new Set([
  '경력 신입사원 On-Performing 온보딩 과정',
  '진단 기반 팀장 리더십 Re-Lead 과정',
  '전략적 비즈니스 협상 스킬 과정',
  '스피치&프레젠테이션 클리닉 과정',
  'AI 시대, 감성 지능 소통역량',
  '세대와 직급별 소통 백과사전',
  'CS 종합 솔루션 과정',
]);

console.log('\n| # | 과정 제목 | 교체여부 | 글자수 | ' + VPS.join(' | ') + ' |');
console.log('|---|---|---|---:|' + VPS.map(() => '---|').join(''));
let i = 0;
const clippedReplaced = [];
const clippedOther = [];
for (const [title, r] of Object.entries(rows)) {
  i += 1;
  const rep = REPLACED.has(title);
  const cells = VPS.map((w) => {
    const d = r.vp[w];
    if (!d) return '—';
    if (d.clipped) {
      (rep ? clippedReplaced : clippedOther).push(`${title} @${w}`);
      return `❌말줄임(${d.lines}행 필요)`;
    }
    return `${d.lines}행`;
  });
  console.log(`| ${i} | ${title} | ${rep ? '✅교체' : '—'} | ${r.chars} | ${cells.join(' | ')} |`);
}

console.log(`\n교체 7건 말줄임 발생: ${clippedReplaced.length}건` +
  (clippedReplaced.length ? ` → ${clippedReplaced.join(', ')}` : ' ✅'));
console.log(`미교체 12건 말줄임 발생: ${clippedOther.length}건` +
  (clippedOther.length ? `\n  ${[...new Set(clippedOther.map((s) => s.split(' @')[0]))].join('\n  ')}` : ' ✅'));

if (OUT) { mkdirSync(dirname(OUT), { recursive: true }); writeFileSync(OUT, JSON.stringify(rows, null, 2)); console.log(`\nraw → ${OUT}`); }
