# [KEESS] 모바일 기기 대응 고도화 — 기술명세서 및 빌드 프롬프트 v1.0

**작성일**: 2026-08-10
**저장 경로**: `ref/spec/KEESS_모바일대응_고도화_기술명세서_및_프롬프트_v1.0_260810.md`
**대상**: keess-newscope (기획 산출물) 전 페이지
**빌드 환경**: VS Code + 클로드 코드, Next.js App Router, Vercel 배포
**기준 화면**: https://keess-newscope.vercel.app/
**발단**: 모바일 검수 중 `/ax-ai` 'AX 전환 교육' 섹션의 레이아웃 붕괴 발견. KEESS는 반응형 사이트이므로 개별 수정이 아닌 **전수 진단 → 아키타입별 처방** 방식으로 접근한다.

---

## 1. 전략 요약

| 구분 | 내용 |
| --- | --- |
| 문제 | 데스크톱 기준으로 설계된 가로형 레이아웃이 모바일 브레이크포인트에서 재정의되지 않아, 컬럼이 콘텐츠보다 좁게 수축하며 붕괴 |
| 접근 | ① 계측 기반 전수 진단(감각 판단 배제) → ② 레이아웃 **아키타입 7종**으로 분류 → ③ 아키타입별 표준 처방 적용 → ④ 재계측 검증 |
| 왜 이 방식인가 | 발견된 1건만 고치면 **같은 원인의 나머지가 그대로 남는다.** 원인이 "특정 섹션의 실수"가 아니라 "가로형 레이아웃의 모바일 분기 부재"라는 패턴이기 때문 |
| 이번 빌드 범위 | **P0(파손) 수정 + P1·P2 목록 보고**. 한 번에 전부 고치지 않고 변경 세트를 검토 가능한 크기로 유지 |

---

## 2. 진단 — 확인된 파손

### 2-1. `/ax-ai` > 'AX 전환 교육' 섹션

캡처(가로 337px 기준) 관찰 결과는 다음과 같다.

- 섹션이 **좌측 약 62px 폭의 세로 띠 + 우측 대부분 빈 흰 영역**으로 갈라져 있다
- 좌측 띠 안에서 라벨 "End-to-End AX Transformation Partner"와 헤드라인 "교육이 아니라, 전환을 설계합니다"가 **한 글자씩 세로로 흘러내린다**
- 우측 영역에는 돋보기 아이콘(1단계 '진단'의 아이콘으로 추정) 하나만 보이고 나머지는 공백

이 섹션은 데스크톱에서 **좌측 섹션 헤더 + 우측 5단계 플로우(진단 → 설계 → 학습 → 실행 → 성과)**의 가로 2단 구조다. 모바일에서 그 2단 비율이 그대로 유지되면서 좌측 컬럼이 화면 폭의 약 18%로 압축된 것이 현상의 실체다.

### 2-2. 원인 가설 (빌드 시 코드로 확정할 것)

1. **모바일 브레이크포인트 미정의** — 데스크톱 `grid-template-columns`가 좁은 폭에서 재정의되지 않음 (가장 유력)
2. **고정 단위 사용** — `px`/`vw` 고정폭 또는 `flex-basis` 고정으로 뷰포트에 연동되지 않음
3. **수축 하한 부재** — `min-width:0` 기본값과 `flex-shrink:1`이 겹쳐 아이템이 콘텐츠 폭 아래로 무한 수축

### 2-3. 파손의 성격

한글은 `word-break: keep-all` 환경에서 컨테이너가 어절 폭보다 좁아지면 **글자 단위로 쪼개져 세로로 흐른다.** 영문은 하이픈 없이 넘치는 반면 한글은 이렇게 "세로 글자탑"이 되므로, 한국어 사이트에서는 컬럼 수축 사고가 **훨씬 더 파괴적으로 드러난다.** 따라서 모든 텍스트 컨테이너에 **최소 폭 하한**을 두는 것이 이번 고도화의 핵심 원칙 중 하나다.

---

## 3. 전수 진단 대상 — 레이아웃 아키타입 7종

페이지 구조 전수 확인 결과, 동일 원인으로 붕괴할 수 있는 가로형 레이아웃을 아래 7종으로 분류했다. **발견된 1건이 아니라 이 7종 전체가 점검 대상**이다.

| # | 아키타입 | 해당 위치 (확인된 것) | 위험도 |
| --- | --- | --- | --- |
| **A** | 가로 프로세스 플로우 (N단계 + 연결선) | `/ax-ai` 5단계(진단→설계→학습→실행→성과) · `/leadership` 5단계(진단→역량개발→현업적용→조직확산→조직문화정착) · `/hrd` 정부지원 4단계 · `/content` IT·자격 3단계 | **높음** — 단계 수만큼 컬럼이 쪼개짐 |
| **B** | 역량·직무 매트릭스 | `/leadership` 6대 트랙·6대 역량·성장단계 타임라인 · `/content` 어학 4레벨 매트릭스 · `/ax-ai` 직무별 한눈에 보기 | **높음** — 행·열 양방향 |
| **C** | 비교표 | `/content` 일반 법정교육 vs KG에듀원 · `/hrd` 부정훈련 본인확인 방식 표 | 중 |
| **D** | 다열 카드 그리드 | 홈 교육체계 4열 · `/kium` 과정 카드 · `/csr` 카드 그리드 | 중 |
| **E** | 로고월·캐러셀 | 홈 고객사 로고월(40+) · 히어로 캐러셀 | 중 |
| **F** | 인터랙티브 위젯 | `/hrd` KGESA Builder 토글 그리드 | 중 |
| **G** | 폼·모달 | 도입문의 폼 · 부정훈련 모달(3탭) · 개인정보처리방침 모달 · 다운로드 모달 | 중 — 키보드·`100vh` 이슈 |

---

## 4. 모바일 준수 기준 (계측 가능한 형태로 정의)

감각적 판단을 배제하기 위해, 모든 기준을 **자동 계측이 가능한 명제**로 정의한다.

### 4-1. 치명 기준 (P0 — 하나라도 위반 시 파손으로 판정)

| # | 기준 | 계측 방법 |
| --- | --- | --- |
| C1 | 가로 스크롤 없음 | `document.documentElement.scrollWidth <= window.innerWidth + 1` |
| C2 | 뷰포트 밖으로 나가는 요소 없음 | 모든 요소의 `getBoundingClientRect().right <= innerWidth + 1` 및 `left >= -1` (의도적 가로 스크롤 컨테이너 내부는 예외) |
| C3 | 텍스트 컨테이너 최소 폭 확보 | 텍스트를 가진 리프 요소의 폭 **≥ 160px** (한글 `keep-all` 기준 1줄 8자 이상). 위반 시 "세로 글자탑" 발생 |
| C4 | 텍스트 세로 붕괴 없음 | 리프 텍스트 요소에서 `height > width × 2.2`이면 붕괴 후보로 플래그 |
| C5 | 콘텐츠 잘림 없음 | `scrollWidth > clientWidth + 2` 이면서 `overflow` 가 `hidden`인 요소 |

### 4-2. 품질 기준 (P2)

| # | 기준 | 값 |
| --- | --- | --- |
| Q1 | 터치 타깃 | 버튼·링크 **≥ 44 × 44px**, 인접 타깃 간 간격 ≥ 8px |
| Q2 | 본문 최소 크기 | 본문 ≥ 14px, 캡션·주석 ≥ 12px |
| Q3 | 좌우 안전 여백 | 콘텐츠 좌우 패딩 ≥ 16px (노치·엣지 대응 시 `env(safe-area-inset-*)` 병행) |
| Q4 | 뷰포트 높이 단위 | `100vh` 대신 `100dvh` (모바일 주소창 수축 대응) |
| Q5 | 명도대비 | 텍스트 4.5:1, 비텍스트 3:1 — DF-012·DF-015 연계 |
| Q6 | 레이아웃 시프트 | 이미지·미디어에 `aspect-ratio` 또는 `width/height` 지정 |

### 4-3. 지원 폭

| 구분 | 폭 | 취급 |
| --- | --- | --- |
| 최소 지원 | **320px** | 파손 없어야 함(C1~C5) |
| 주 검증 | **360px / 390px** | 파손 없음 + 품질 기준 충족 |
| 태블릿 | **768px** | 파손 없음 |

---

## 5. 아키타입별 표준 처방

개별 섹션마다 다른 해법을 즉흥적으로 만들지 않는다. 아래 처방을 아키타입에 따라 적용한다.

### A. 가로 프로세스 플로우

**≤768px에서 세로 스택으로 전환**한다. 단계 간 연결선·화살표도 가로에서 세로 방향으로 바꾼다(가상요소 `::before/::after`의 방향 전환). 번호 배지는 좌측 정렬로 두고 텍스트는 우측에 둔다.

가로 스크롤 방식은 **최후 수단**이다. 프로세스는 "전체 흐름을 한눈에 보는 것"이 목적인데 가로 스크롤은 그 목적을 정면으로 훼손한다. 불가피하게 쓴다면 스크롤 가능 힌트(우측 페이드 마스크 + 첫 진입 시 살짝 미는 모션)를 반드시 함께 넣는다.

### B. 역량·직무 매트릭스

**≤640px에서 표 → 카드형(라벨:값)으로 전환**한다. `thead`를 숨기고 각 셀에 `data-label`을 붙여 `::before`로 항목명을 출력하는 패턴이며, **개인정보처리방침 모달에서 이미 채택한 방식이므로 그대로 재사용**한다. 신규 패턴을 발명하지 않는다.

### C. 비교표

2열 비교(우리 vs 일반)는 **항목 단위 카드로 재구성**해 한 카드 안에 두 값을 위아래로 넣는다. 3열 이상이면 가로 스크롤 + 첫 열 `position: sticky`를 허용하되, 스크롤 힌트를 함께 제공한다.

### D. 다열 카드 그리드

`grid-template-columns`를 브레이크포인트로 단계 조정한다. ≤480px 1열, 481~768px 2열, 769~1024px 3열, 그 이상 원안 유지. 고정 `fr` 비율 대신 `repeat(auto-fit, minmax(280px, 1fr))` 형태를 권장한다 — 컬럼이 콘텐츠 최소 폭 아래로 수축하지 않는다.

### E. 로고월·캐러셀

모바일에서 행 수를 줄이고(예: 3행 → 2행) 로고 크기를 키워 판독성을 확보한다. 자동 스크롤은 `prefers-reduced-motion: reduce`에서 정지시킨다.

### F. 인터랙티브 위젯

세로 스택 + 각 조작 요소 44px 타깃 확보. 드래그·리오더가 있다면 터치 제스처와 스크롤이 충돌하지 않는지 확인한다.

### G. 폼·모달

높이 단위를 `100dvh`로 교체하고, 모달 본문에 `overscroll-behavior: contain`을 적용해 배경 스크롤 관통을 막는다. 입력 필드 `font-size`는 **16px 이상**으로 둔다(iOS Safari는 16px 미만 입력에 포커스 시 자동 확대된다). 좌우 2열 필드는 ≤480px에서 1열로 스택한다.

### 공통 안전장치 (전역 1회 적용)

```css
/* 텍스트 컨테이너가 콘텐츠 폭 아래로 수축하지 않도록 */
.grid > *, .flex > * { min-width: 0; }        /* 넘침 방지 */
:where(p, h1, h2, h3, h4, li, td) { overflow-wrap: anywhere; }
/* 미디어 기본 반응형 */
img, svg, video, canvas, iframe { max-width: 100%; height: auto; }
```

`min-width: 0`과 텍스트 최소 폭(C3)은 **함께** 다뤄야 한다. `min-width:0`만 넣으면 넘침은 막히지만 세로 글자탑은 그대로다. 컬럼 자체가 스택되도록 브레이크포인트를 잡는 것이 근본 처방이다.

---

## 6. 우선순위

| 등급 | 정의 | 이번 빌드 |
| --- | --- | --- |
| **P0** | C1~C5 위반 = 레이아웃 파손·판독 불가 | **수정** |
| **P1** | P0와 동일 아키타입이라 재발 가능한 지점 (현재는 통과하나 구조상 취약) | 목록만 보고 |
| **P2** | Q1~Q6 품질 기준 위반 | 목록만 보고 |

한 번에 전부 고치면 변경 세트가 커져 회귀 판정이 불가능해진다. **P0 수정 + P1·P2 보고**로 끊고, 검토 후 다음 빌드에서 P1을 처리한다.

---

## 7. 계측 스크립트 (빌드 시 사용)

`scripts/mobile-audit.mjs`로 저장해 로컬 개발 서버(`npm run dev`, 기본 3000)를 대상으로 실행한다.

```js
// scripts/mobile-audit.mjs
import { chromium, devices } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:3000';
const PAGES = ['/', '/ax-ai', '/leadership', '/hrd', '/content', '/kium', '/csr'];
const VPS = [320, 360, 390, 768];

const browser = await chromium.launch();
const report = [];

for (const w of VPS) {
  for (const path of PAGES) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: 844 }, deviceScaleFactor: 2,
      isMobile: true, hasTouch: true, userAgent: devices['iPhone 13'].userAgent,
    });
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);

    const r = await page.evaluate((VW) => {
      const sel = (el) => {
        let s = el.tagName.toLowerCase();
        if (el.id) s += '#' + el.id;
        const c = typeof el.className === 'string' ? el.className.trim() : '';
        if (c) s += '.' + c.split(/\s+/).slice(0, 3).join('.');
        return s;
      };
      const sectionOf = (el) => {
        const s = el.closest('section, [data-section]');
        if (!s) return '(none)';
        const h = s.querySelector('h1,h2,h3');
        return (s.id || '') + '|' + (h ? h.textContent.trim().slice(0, 28) : sel(s));
      };
      const inScroller = (el) => !!el.closest('[data-hscroll], .hscroll');
      const out = {
        C1_pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1
          ? { scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth } : null,
        C2_outOfViewport: [], C3_narrowText: [], C4_verticalCollapse: [],
        C5_clipped: [], Q1_tinyTargets: [], Q2_smallFont: [],
      };
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 && b.height === 0) continue;
        const leaf = el.children.length === 0;
        const txt = (el.textContent || '').trim();

        if (!inScroller(el) && b.width > 8 && (b.right > VW + 1 || b.left < -1))
          out.C2_outOfViewport.push({ sec: sectionOf(el), sel: sel(el), left: Math.round(b.left), right: Math.round(b.right) });

        if (leaf && txt.length > 4) {
          if (b.width < 160) out.C3_narrowText.push({ sec: sectionOf(el), sel: sel(el), w: Math.round(b.width), text: txt.slice(0, 30) });
          if (b.height > b.width * 2.2) out.C4_verticalCollapse.push({ sec: sectionOf(el), sel: sel(el), w: Math.round(b.width), h: Math.round(b.height), text: txt.slice(0, 30) });
          const fs = parseFloat(cs.fontSize);
          if (fs < 12) out.Q2_smallFont.push({ sec: sectionOf(el), sel: sel(el), fs });
        }
        if (cs.overflow === 'hidden' && el.scrollWidth > el.clientWidth + 2 && b.width > 40)
          out.C5_clipped.push({ sec: sectionOf(el), sel: sel(el), clientW: el.clientWidth, scrollW: el.scrollWidth });

        if ((el.tagName === 'A' || el.tagName === 'BUTTON' || el.getAttribute('role') === 'button')
            && b.width > 0 && (b.height < 44 || b.width < 44))
          out.Q1_tinyTargets.push({ sec: sectionOf(el), sel: sel(el), w: Math.round(b.width), h: Math.round(b.height), text: txt.slice(0, 20) });
      }
      const dedup = (a, k) => { const s = new Set(); return a.filter(o => { const v = k(o); if (s.has(v)) return false; s.add(v); return true; }); };
      for (const k of ['C2_outOfViewport','C3_narrowText','C4_verticalCollapse','C5_clipped','Q1_tinyTargets','Q2_smallFont'])
        out[k] = dedup(out[k], o => o.sec + o.sel + (o.w ?? o.fs ?? ''));
      return out;
    }, w);

    report.push({ viewport: w, path, ...r });
    await page.screenshot({ path: `audit/${w}${path.replace(/\//g,'_')||'_home'}.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
```

`data-hscroll` 또는 `.hscroll` 클래스를 붙인 컨테이너 내부는 **의도된 가로 스크롤**로 간주해 C2 검사에서 제외한다. 처방 C(비교표)에서 가로 스크롤을 채택할 경우 이 표식을 함께 붙인다.

---

## 8. 금지 사항

| # | 금지 | 이유 |
| --- | --- | --- |
| 1 | 데스크톱(≥1025px) 렌더 결과 변경 | 이번 건은 모바일 대응. 데스크톱은 변경 전과 동일해야 함 |
| 2 | 신규 색상·radius·shadow 토큰 추가 | 기존 디자인 토큰만 사용 |
| 3 | 콘텐츠 문안·정보 구조 변경 | 레이아웃 대응이지 콘텐츠 개편이 아님. 모바일에서 항목을 **생략하지 않는다**(정보 동등성) |
| 4 | 전역 `overflow-x: hidden`으로 덮기 | 증상만 가리고 원인은 남으며, `position: sticky`를 무력화하는 부작용이 있음 |
| 5 | 폰트 크기를 줄여 맞추기 | 12px 미만 축소로 넘침을 해결하지 않는다. 레이아웃을 바꾼다 |
| 6 | 프로세스 플로우를 이유 없이 가로 스크롤로 전환 | 전체 흐름 조망이라는 목적 훼손 (§5-A) |
| 7 | 새 컴포넌트·새 패턴 발명 | 기존 사이트에 존재하는 반응형 패턴 재사용 (특히 표→카드 전환) |
| 8 | P1·P2를 임의로 함께 수정 | 변경 세트가 커져 회귀 판정 불가 |

---

## 9. 완료 조건

**계측**
- [ ] 320 / 360 / 390 / 768px × 7개 페이지 = 28개 조합 전부 계측 완료
- [ ] 수정 후 재계측에서 **P0(C1~C5) 위반 0건**
- [ ] 데스크톱(1440px) 렌더가 변경 전과 동일 (스크린샷 대조)

**개별**
- [ ] `/ax-ai` 'AX 전환 교육' 섹션이 모바일에서 세로 스택으로 정상 표시되고, 라벨·헤드라인·5단계가 모두 판독 가능
- [ ] 5단계 연결선·번호 배지가 세로 방향에 맞게 표시
- [ ] 한글 텍스트의 세로 글자탑(C4) 0건

**보고**
- [ ] 수정 전/후 계측 결과 비교표
- [ ] P1(동일 아키타입 취약 지점)·P2(품질 기준 위반) 목록 — 위치·현상·권장 처방 포함
- [ ] 수정 전/후 스크린샷: `/ax-ai` 해당 섹션 (360px, 390px)
- [ ] `npm run build` 경고 0건

---

## 10. 빌드 프롬프트 (클로드 코드 붙여넣기용)

```
keess-newscope 저장소의 모바일 대응 고도화 작업입니다.
아래 명세서를 먼저 읽고 시작해 주세요.
  ref/spec/KEESS_모바일대응_고도화_기술명세서_및_프롬프트_v1.0_260810.md

[배경]
모바일 검수 중 /ax-ai 'AX 전환 교육' 섹션이 붕괴한 것을 발견했습니다.
데스크톱의 가로 2단 구조(좌: 섹션 헤더 / 우: 5단계 플로우)가 모바일에서 그대로 유지되어,
좌측 컬럼이 화면 폭의 약 18%(≈62px)로 압축되고 한글 텍스트가 한 글자씩 세로로 흘러내립니다.

KEESS는 반응형 사이트이므로, 이 1건만 고치면 같은 원인의 다른 섹션이 그대로 남습니다.
따라서 계측 기반 전수 진단 → 아키타입별 처방 → 재계측 검증 순서로 진행합니다.

────────────────────────────────
[1단계] 계측 (수정하기 전에 먼저 수행하고 결과를 보고)
────────────────────────────────
- 명세서 7장의 스크립트를 scripts/mobile-audit.mjs 로 저장합니다.
- npm run dev 로 로컬 서버를 띄우고, 320 / 360 / 390 / 768px × 7개 페이지
  (/, /ax-ai, /leadership, /hrd, /content, /kium, /csr)를 계측합니다.
- 결과를 아래 형식의 표로 보고해 주세요. 이 시점에서는 아직 코드를 수정하지 마세요.
  | 페이지 | 뷰포트 | 위반 기준 | 섹션 | 선택자 | 현상 요약 |

- 명세서 4장의 기준으로 P0 / P1 / P2를 분류합니다.
  P0 = C1~C5 위반(레이아웃 파손·판독 불가)
  P1 = P0와 같은 아키타입이라 재발 가능한 지점(현재는 통과하나 구조상 취약)
  P2 = Q1~Q6 품질 기준 위반

────────────────────────────────
[2단계] 원인 확정
────────────────────────────────
- /ax-ai 'AX 전환 교육' 섹션의 컴포넌트와 CSS를 찾아, 붕괴 원인을 코드로 확정해 보고해 주세요.
  명세서 2-2의 가설 3가지(① 모바일 브레이크포인트 미정의 ② 고정 단위 사용 ③ 수축 하한 부재)
  중 무엇인지, 아니면 다른 원인인지 명시합니다.
- 같은 원인이 다른 섹션에도 있는지 함께 확인해 목록화합니다.

────────────────────────────────
[3단계] 수정 — P0만
────────────────────────────────
- 1단계에서 P0로 분류된 항목만 수정합니다. P1·P2는 목록으로 보고만 하고 손대지 마세요.
- 명세서 5장의 아키타입별 표준 처방을 적용합니다. 즉흥적으로 새 해법을 만들지 마세요.
  A 가로 프로세스 플로우 → ≤768px 세로 스택, 연결선도 세로 방향 전환
  B 역량·직무 매트릭스 → ≤640px 표 → 카드형(라벨:값). 개인정보처리방침 모달의 기존 패턴 재사용
  C 비교표 → 항목 단위 카드 재구성, 3열 이상이면 가로 스크롤 + 첫 열 sticky + 스크롤 힌트
  D 다열 카드 그리드 → repeat(auto-fit, minmax(280px,1fr)) 형태로 전환
  E 로고월·캐러셀 → 행 수 축소, prefers-reduced-motion 대응
  F 인터랙티브 위젯 → 세로 스택 + 44px 타깃
  G 폼·모달 → 100dvh, overscroll-behavior:contain, 입력 font-size 16px 이상
- 공통 안전장치(명세서 5장 말미의 min-width:0 / overflow-wrap / 미디어 max-width)를
  전역에 1회 적용합니다.
- 가로 스크롤을 의도적으로 채택한 컨테이너에는 data-hscroll 속성을 붙입니다(계측 예외 처리용).

[금지]
- 데스크톱(≥1025px) 렌더 결과 변경 금지 — 변경 전과 동일해야 합니다
- 전역 overflow-x:hidden 으로 덮기 금지 (증상만 가리고 sticky를 무력화)
- 폰트 크기를 줄여 넘침 해결 금지 (12px 미만 금지). 레이아웃을 바꿉니다
- 모바일에서 항목·정보를 생략하기 금지 (정보 동등성 유지)
- 콘텐츠 문안·정보 구조 변경 금지
- 신규 색상·radius·shadow 토큰 추가 금지
- 새 컴포넌트·새 패턴 발명 금지 — 기존 반응형 패턴 재사용
- P1·P2 임의 수정 금지

────────────────────────────────
[4단계] 검증 및 보고
────────────────────────────────
아래를 직접 실행하고 결과를 보고해 주세요.
1. 수정 후 재계측 — P0(C1~C5) 위반 0건인지, 수정 전/후 비교표
2. 데스크톱 1440px 렌더가 변경 전과 동일한지 (스크린샷 대조)
3. /ax-ai 'AX 전환 교육' 섹션의 수정 전/후 스크린샷 (360px, 390px)
   — 라벨·헤드라인·5단계가 모두 판독 가능한지
4. 한글 세로 글자탑(C4) 0건인지
5. npm run build 경고 0건
6. P1 목록 — 위치 · 현상 · 권장 처방(아키타입)
7. P2 목록 — 위치 · 현상 · 권장 값
8. 수정한 파일과 선택자, 변경 전/후 값
```

---

## 11. 배포 및 후속

| 순서 | 작업 |
| --- | --- |
| 1 | 1단계 계측 결과 검토 → P0 범위 합의 |
| 2 | 3단계 수정 후 완료 보고 8개 항목 검토 |
| 3 | git 커밋·푸시 → Vercel 프리뷰에서 실기기 확인 |
| 4 | 프로덕션 반영 |
| 5 | P1 목록 검토 → 다음 빌드 범위 확정 |
| 6 | 확정된 모바일 기준(4장)을 디자인 산출물 검수 기준으로 [G2-03] 계열 태스크에 공유 |
