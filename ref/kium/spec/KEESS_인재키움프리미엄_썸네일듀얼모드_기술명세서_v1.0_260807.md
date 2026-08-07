# KEESS 인재키움프리미엄 — 과정 카드 썸네일 듀얼 모드 + 오픈 모션 기술명세서 v1.0

- 작성일: 2026-08-07
- 대상 페이지: `/kium` '과정안내' 탭 (F7/F8 — `KiumCourseGrid` / `KiumCourseCard` / `KiumThumb` / `KiumCoursePanel`)
- 작성자: 임지홍 (HRD사업지원팀) 요청 기반, 코드 그라운딩 후 작성
- 관련 선행 문서: `ref/kium/spec/KEESS_G2-01-02_인재키움프리미엄_기술명세서_upgrade-02_260805.md`, `ref/kium/prd/KEESS_G2-01-02_인재키움프리미엄_PRD_v1.0_260805.md` (R2)
- 범위: §1~§7 썸네일 이미지/텍스트 듀얼 모드, §8 과정 카드 오픈 모션(같은 빌드 세션에서 함께 반영)

---

## 0. 배경 — 기존 결정과 본 명세서의 관계

`upgrade-02` 기술명세서에는 이미 아래와 같은 주석·백로그가 명시돼 있었다.

> `/* 썸네일 이미지 자산 도입 시(이미지 모드): 배경 텍스트 제거 + 본문 타이틀 복원 */` — **분기 구현은 금지(텍스트 모드 단일)**

당시 결정 배경(PRD R2)은 "과정별 이미지 자산이 없는 제약 하에서 카탈로그가 빈약해 보이지 않게" 하기 위한 임시 대체 표면이었고, 이미지 자산이 없는 상태에서 미리 분기 코드를 두는 것은 죽은 코드(dead code)가 되므로 의도적으로 보류되어 있었다.

**본 명세서는 이 백로그 항목을 실제로 활성화한다.** 사유: 19개 과정의 썸네일 이미지 제작이 오픈일(8/19) 이전에 전건 완료되지 못할 가능성이 있어, **과정 단위로 이미지 모드/텍스트 모드가 혼재**해야 하는 상황이 되었다. 따라서 "텍스트 모드 단일 구현" 결정을 아래 내용으로 대체한다.

- 오픈 시점(8/19): 이미지 자산이 준비되지 않았다면 **전건 텍스트 모드**로 그대로 오픈(현행 유지, 추가 작업 없음)
- 이후: 과정별로 이미지 자산이 준비되는 대로 **데이터 파일 값만 채워 넣으면** 코드 재배포 없이 해당 카드만 이미지 모드로 순차 전환됨
- 이미지 자산이 끝내 준비되지 않는 과정은 텍스트 모드로 영구 유지 가능 — 두 모드는 상시 공존 가능한 것이 본 설계의 핵심

---

## 1. 분기 기준 — 데이터 필드 1개 추가

`lib/kium/data.ts`의 `KiumCourse` 타입에 선택 필드 `thumbSrc`를 추가한다. 가짓수·조건 분기 없이 **"값이 있으면 이미지 모드, 없으면(undefined) 텍스트 모드"** 단일 기준으로 판단한다.

```ts
// 수정 전
export type KiumCourse = {
  id: string; category: KiumCategory; subCategory: string
  titleMarketing: string; titleOfficial: string
  target: string; hours: number; days: number
  type: '일반형' | 'AI융합형'; capacity: number; schedule: string; delivery: string
  summary: string; slogan: string; goals: string[]
  highlights: { no: string; title: string; desc: string }[]
  modules: { area: string; content: string; hours: number }[]
}

// 수정 후
export type KiumCourse = {
  id: string; category: KiumCategory; subCategory: string
  titleMarketing: string; titleOfficial: string
  target: string; hours: number; days: number
  type: '일반형' | 'AI융합형'; capacity: number; schedule: string; delivery: string
  summary: string; slogan: string; goals: string[]
  highlights: { no: string; title: string; desc: string }[]
  modules: { area: string; content: string; hours: number }[]
  /** 썸네일 이미지 자산 경로. 값이 있으면 이미지 모드, 없으면(undefined) 텍스트 모드로 렌더링된다. */
  thumbSrc?: string
}
```

`KIUM_COURSES` 배열의 개별 과정 객체에는 **오픈 시점 기준 `thumbSrc` 키를 아예 넣지 않는다**(전건 텍스트 모드로 시작). 추후 이미지 자산이 준비된 과정부터 해당 객체에 `"thumbSrc": "/images/kium/kium-01.jpg"` 형태로 한 줄씩 추가한다.

---

## 2. 이미지 자산 규격

- 배치 경로: `public/images/kium/`
- 파일명: 과정 `id` 그대로 사용 — 예) `kium-01.jpg`, `kium-02.jpg` (19개 과정 id는 `kium-01`~`kium-19`로 이미 확정돼 있음)
- 비율: **4:3** 고정 (`.kium-thumb`의 `aspect-ratio:4/3`을 그대로 따름 — 크롭은 이미지 제작 단계에서 완료해서 넣을 것, 코드 쪽 크롭 로직 없음)
- 권장 해상도: 최소 800×600 이상 (레티나 대응), JPG 또는 WebP, 카드 1장당 300KB 이내 권장
- 이미지 위에 별도 텍스트를 합성하지 않는다 — 과정명·카테고리 라벨은 이미지가 아니라 카드 본문 쪽 실제 DOM 텍스트로 노출된다(§4)

---

## 3. `KiumThumb.tsx` — 이미지/텍스트 모드 분기

```tsx
// 수정 전
export default function KiumThumb({
  category,
  title,
}: {
  category: KiumCategory;
  title: string;
}) {
  return (
    <div className="kium-thumb" data-cat={category}>
      {/* 배경 레이어 — 장식 */}
      <span className="kium-grain" aria-hidden="true" />
      <span className="kium-thumb-cat" aria-hidden="true">
        {KIUM_CATEGORY_META[category].label}
      </span>
      <span className="kium-thumb-title">{title}</span>
    </div>
  );
}
```

```tsx
// 수정 후
import Img from '@/components/common/Img';

export default function KiumThumb({
  category,
  title,
  thumbSrc,
}: {
  category: KiumCategory;
  title: string;
  thumbSrc?: string;
}) {
  return (
    <div className="kium-thumb" data-cat={category}>
      {/* 배경 레이어 — 이미지 모드에서도 유지: 이미지 로드 실패 시 폴백 표면 역할 */}
      <span className="kium-grain" aria-hidden="true" />

      {thumbSrc ? (
        // 이미지 모드 — 배경 텍스트(카테고리 라벨·과정명) 제거. 과정명은 본문 타이틀이 담당(§4).
        <Img className="kium-thumb-img" src={thumbSrc} alt={title} />
      ) : (
        // 텍스트 모드 — 기존과 100% 동일, 무변경
        <>
          <span className="kium-thumb-cat" aria-hidden="true">
            {KIUM_CATEGORY_META[category].label}
          </span>
          <span className="kium-thumb-title">{title}</span>
        </>
      )}
    </div>
  );
}
```

- `Img` 컴포넌트는 이미 `components/common/Img.tsx`에 존재하는 공용 컴포넌트를 그대로 재사용한다(신규 이미지 로딩 로직 작성 금지). `onError` 시 이미지 자체를 `display:none` 처리하는 폴백이 이미 내장돼 있어, 이미지 경로가 잘못돼도 `.kium-thumb`의 그라디언트 메시 배경(`.kium-thumb` 자체 배경 + `.kium-grain`)이 그대로 드러나 빈 여백처럼 보이지 않는다.
- 텍스트 모드 분기는 기존 코드를 한 글자도 바꾸지 않는다.

---

## 4. `KiumCourseCard.tsx` — 이미지 모드일 때만 본문 타이틀 복원

```tsx
// 수정 전
export default function KiumCourseCard({
  course, open, panelId, onToggle,
}: { course: KiumCourse; open: boolean; panelId: string; onToggle: () => void }) {
  return (
    <button type="button" className="kium-card" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
      <KiumThumb category={course.category} title={course.titleMarketing} />

      <span className="kium-card-body">
        <span className="kium-card-labels">
          <span className="kium-lab cat" data-cat={course.category}>
            <span className="kium-dot" aria-hidden="true" />
            {KIUM_CATEGORY_META[course.category].label}
          </span>
          <span className="kium-lab sub">{course.subCategory}</span>
        </span>

        {/* [수정 12] 본문 과정명 행 제거 — 과정명은 썸네일 텍스트가 담당한다(중복 노출 제거). */}
        <span className="kium-card-summary">{course.summary}</span>
        ...
```

```tsx
// 수정 후
export default function KiumCourseCard({
  course, open, panelId, onToggle,
}: { course: KiumCourse; open: boolean; panelId: string; onToggle: () => void }) {
  return (
    <button type="button" className="kium-card" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
      <KiumThumb category={course.category} title={course.titleMarketing} thumbSrc={course.thumbSrc} />

      <span className="kium-card-body">
        <span className="kium-card-labels">
          <span className="kium-lab cat" data-cat={course.category}>
            <span className="kium-dot" aria-hidden="true" />
            {KIUM_CATEGORY_META[course.category].label}
          </span>
          <span className="kium-lab sub">{course.subCategory}</span>
        </span>

        {/*
          이미지 모드(thumbSrc 있음): 과정명이 더 이상 썸네일 텍스트로 노출되지 않으므로 본문에 복원.
          텍스트 모드(thumbSrc 없음): 기존과 동일하게 미노출(과정명은 썸네일 텍스트가 담당, 중복 제거 유지).
        */}
        {course.thumbSrc && <span className="kium-card-title">{course.titleMarketing}</span>}

        <span className="kium-card-summary">{course.summary}</span>
        ...
```

- 나머지(`kium-card-meta`, 배지 등)는 무변경.
- 텍스트 모드 카드는 `course.thumbSrc`가 `undefined`이므로 `kium-card-title`이 렌더링되지 않아 현재 화면과 **완전히 동일하게 유지**된다.

---

## 5. CSS 신규 규칙 (`styles/kium.css`)

`.kium-thumb-cat`/`.kium-thumb-title` 규칙(407~433행 부근) 바로 아래에 이미지 모드 전용 규칙과, 본문 타이틀 복원용 `.kium-card-title` 규칙을 추가한다.

```css
/* 이미지 모드 — 썸네일 실사 이미지. 그라디언트 메시 배경은 이미지 로드 실패 폴백으로 유지(위 레이어만 덮음) */
.kium-thumb-img{position:absolute;inset:0;z-index:2;width:100%;height:100%;object-fit:cover}

/* 본문 과정명(이미지 모드 전용 복원) — [수정 12]에서 제거된 자리를 이미지 모드에서만 복원.
   기준값: .nf-card h3(error.css)와 동일 스케일로 사이트 카드 타이틀 톤 일치 */
.kium-card-title{font-size:16px;font-weight:800;color:var(--ink);line-height:1.4;
  letter-spacing:-.01em;word-break:keep-all;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
```

- `.kium-thumb::after`(하단 스크림)와 `.kium-grain`은 이미지 모드에서도 그대로 적용되어, 실사 이미지 위에도 카드 전체 톤(보라 베이스)이 은은하게 겹쳐 보이는 일관된 무드를 유지한다(디자인 통일성 — 이미지가 섞여도 카탈로그가 이질감 없이 보이도록). 이 레이어들을 이미지 모드에서 끄고 싶다면 별도 확인 후 결정할 것(기본값은 유지).
- 신규 색상·신규 radius·신규 shadow 값 없음 — 기존 토큰만 사용.

---

## 6. 접근성

- `alt={title}`(=`course.titleMarketing`) — 이미지 모드에서 스크린리더가 과정명을 읽을 수 있는 유일한 통로 중 하나이므로 필수.
- 이미지 모드에서는 본문에 실제 텍스트 타이틀(`.kium-card-title`)이 별도로 존재하므로, 버튼(`.kium-card`)의 접근 가능한 이름에는 이미지 alt + 본문 타이틀 텍스트가 중복 포함될 수 있음 — 스크린리더 사용성에 실질적 해는 없으나, 완료 보고 시 VoiceOver/NVDA 중 하나로 버튼 이름이 과도하게 길게 중복 낭독되지 않는지 1회 확인.
- 텍스트 모드는 기존 접근성 특성(썸네일 텍스트가 실질적 헤딩 역할) 무변경.

---

## 7. Done when

- [ ] `KiumCourse` 타입에 `thumbSrc?: string` 추가, `KIUM_COURSES` 19건은 오픈 시점 기준 전건 `thumbSrc` 미설정(텍스트 모드) 상태로 유지
- [ ] `thumbSrc`가 있는 과정만 이미지 모드로 렌더링(이미지 + 본문 타이틀), 나머지는 현재 화면과 픽셀 단위로 동일
- [ ] 이미지 모드 카드에서 카테고리 라벨·과정명 텍스트가 썸네일 위에 노출되지 않음(이미지 단독)
- [ ] 이미지 존재하지 않는 경로를 `thumbSrc`에 임시로 넣어 테스트했을 때, 빈 화면이 아니라 그라디언트 메시 배경이 폴백으로 노출됨
- [ ] `npm run build` 경고 0건
- [ ] 데스크톱/모바일에서 텍스트 모드 카드 19장 전건 스크린샷 1장(현재와 동일함을 확인), 이미지 모드 테스트 카드 1장 스크린샷 1장

---

## 8. 과정 카드 오픈 모션 — "하단에 상세정보가 열렸다" 인지 강화

### 8-1. 현황 진단

- **데스크톱**: 클릭 시 카드에 상단 액센트 바(`::before`, 2px `--p1`)와 그림자 승격(`box-shadow`)이 나타나고, 클릭한 행 바로 아래에 `.kium-panel-slot`이 `grid-template-rows: 0fr → 1fr`(300ms)로 부드럽게 확장된다(`KiumCourseGrid.tsx`). 다만 세 가지 인지 공백이 있다.
  1. 클릭한 카드 자체에 "펼침/닫힘"을 나타내는 방향성 아이콘이 전혀 없다 — 사용자가 카드를 "펼칠 수 있는 것"으로 사전에 인지하기 어렵다.
  2. 패널이 뷰포트 아래쪽(스크롤이 필요한 영역)에서 열릴 경우 자동 스크롤이 없다 — 사용자가 직접 스크롤하지 않으면 방금 열린 패널을 놓칠 수 있다.
  3. 패널 내부 콘텐츠(`.kium-detail`)는 별도 진입 트랜지션 없이, grid-row 공간이 열리자마자 즉시 나타난다 — "공간은 부드럽게 열리는데 내용은 뚝 나타나는" 리듬 불일치가 있다.
- **모바일(<768px)**: 바텀시트가 dim 오버레이와 함께 화면 하단에서 슬라이드업(`translateY(100%)→0`, 300ms)되므로 "열렸다"는 인지가 이미 명확하다 — **모바일은 현행 유지, 변경 없음.**

### 8-2. 전략 (전부 기존 트랜지션 토큰 `var(--ease)`/`var(--ease-out)`과 기존 아이콘 라이브러리 `lucide-react`만 재사용 — 신규 이징·신규 색상 없음)

**A. 방향성 인디케이터 — Chevron 아이콘**
카드 메타 영역(`.kium-card-meta`) 우측 끝에 `ChevronDown`(lucide-react — `KiumEligibility.tsx`의 `.kium-elig-chev`와 동일 라이브러리·동일 패턴 재사용)을 상시 노출. `aria-expanded="true"`일 때 180도 회전(250ms) — 클릭 전에는 "펼칠 수 있다"는 방향성을, 열린 상태에서는 "지금 펼쳐져 있다"는 상태를 지속적으로 표시한다.

**B. 컨텍스트 유지형 오토스크롤**
패널이 열리는 시점(`slotOpen`이 `true`로 바뀌는 시점)에 해당 패널을 `scrollIntoView({behavior:'smooth', block:'nearest'})` — AX·AI 전환 페이지의 `stairRef.scrollIntoView` 패턴과 동일한 기존 사이트 컨벤션을 그대로 재사용한다(신규 패턴 아님). `block:'nearest'`이므로 패널이 이미 화면에 보이는 경우엔 스크롤이 발생하지 않아 불필요한 점프가 없다.

**C. 패널 콘텐츠 진입 트랜지션**
`.kium-detail`에 `opacity 0→1` + `translateY(6px→0)`, 250ms, 50ms 지연 추가 — 그리드 행이 열리기 시작한 직후 콘텐츠가 살짝 뒤따라와 "공간이 열리고 내용이 함께 떠오르며 자리 잡는" 하나의 동작으로 인지되게 한다.

**D. (선택 적용) 클릭 프레스 피드백**
카드 클릭 시 짧은 `scale(0.98→1)`, 120ms 마이크로 인터랙션. 클릭이 정확히 인식됐다는 촉각적 확인 역할이며, 이번 요청의 핵심(하단 인지)과는 결이 달라 **선택 사항**으로 둔다. 반영 여부는 클로드 코드 완료 보고 후 화면 확인하고 판단해도 된다.

### 8-3. 구현

**`components/kium/KiumCourseCard.tsx`**
```tsx
// 수정 전
import KiumThumb from './KiumThumb';
import { KIUM_CATEGORY_META, type KiumCourse } from '@/lib/kium/data';
```
```tsx
// 수정 후
import { ChevronDown } from 'lucide-react';
import KiumThumb from './KiumThumb';
import { KIUM_CATEGORY_META, type KiumCourse } from '@/lib/kium/data';
```

`kium-card-meta` 블록 끝에 chevron 추가:
```tsx
// 수정 전
          {course.type === 'AI융합형' && <span className="kium-badge ai">AI융합형</span>}
          <span className="kium-badge gov">정부지원 환급</span>
        </span>
      </span>
    </button>
```
```tsx
// 수정 후
          {course.type === 'AI융합형' && <span className="kium-badge ai">AI융합형</span>}
          <span className="kium-badge gov">정부지원 환급</span>
          <ChevronDown className="kium-card-chev" size={16} aria-hidden="true" />
        </span>
      </span>
    </button>
```

**`components/kium/KiumCourseGrid.tsx`** — 패널 오픈 시 오토스크롤 추가:
```tsx
// 수정 전
  useEffect(() => {
    if (!openId || sheet) {
      setSlotOpen(false);
      return;
    }
    const id = requestAnimationFrame(() => setSlotOpen(true));
    return () => cancelAnimationFrame(id);
  }, [openId, sheet]);
```
```tsx
// 수정 후
  useEffect(() => {
    if (!openId || sheet) {
      setSlotOpen(false);
      return;
    }
    const id = requestAnimationFrame(() => {
      setSlotOpen(true);
      const panel = document.getElementById(`kium-panel-${openId}`);
      if (panel) {
        const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        panel.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'nearest' });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [openId, sheet]);
```
(모바일 바텀시트는 `sheet===true`일 때 이 분기를 타지 않으므로 영향 없음 — 기존 시트 모션 그대로.)

**`styles/kium.css`** — `.kium-card-meta`(390행 부근) 아래에 chevron 규칙, `.kium-panel-slot`(437행 부근) 아래에 콘텐츠 진입 규칙 추가:
```css
/* 카드 개폐 방향 인디케이터 — .kium-elig-chev(KiumEligibility)와 동일 회전 패턴 */
.kium-card-chev{flex:none;margin-left:auto;color:var(--muted);transition:transform .25s var(--ease)}
.kium-card[aria-expanded="true"] .kium-card-chev{transform:rotate(180deg);color:var(--p1)}

/* 패널 콘텐츠 진입 — 그리드 행이 열리는 동작(.kium-panel-slot)과 분리된 콘텐츠 자체의 등장 모션 */
.kium-panel-clip .kium-detail{opacity:0;transform:translateY(6px);
  transition:opacity .25s var(--ease-out) .05s,transform .25s var(--ease-out) .05s}
.kium-panel-slot.open .kium-detail{opacity:1;transform:none}
```

(선택 적용 D를 반영할 경우에만 추가)
```css
.kium-card:active{transform:scale(.98)}
```

**모션 저감 대응** — 기존 `@media(prefers-reduced-motion:reduce)` 블록(565행 부근)에 아래 2줄 추가:
```css
  .kium-card-chev{transition:none}
  .kium-panel-clip .kium-detail{transition:none}
```
(오토스크롤은 코드 자체에서 `prefers-reduced-motion` 분기로 `behavior:'auto'` 처리하므로 별도 CSS 불필요 — 기존 `stairRef` 패턴과 동일)

### 8-4. Done when (모션)

- [ ] 데스크톱에서 카드 클릭 → chevron이 180도 회전하며 열림 상태 표시, 다시 클릭 시 원위치
- [ ] 뷰포트 하단에 가까운 카드를 클릭했을 때 패널이 부드럽게 스크롤되어 시야에 들어옴(이미 보이는 위치라면 스크롤 미발생)
- [ ] 패널 내부 콘텐츠가 그리드 확장과 함께 살짝 떠오르듯 등장(뚝 끊기지 않음)
- [ ] 모바일 바텀시트 동작은 기존과 완전히 동일(변경 없음)
- [ ] `prefers-reduced-motion: reduce` 환경에서 chevron 회전·콘텐츠 페이드 전환이 즉시 상태 전환으로 처리되고, 스크롤도 즉시 이동으로 처리됨
- [ ] `npm run build` 경고 0건
