# [P1·P2] 모바일 히어로 상단 개선 — 기술명세서 & 클로드코드 빌드 프롬프트 v1.0

**작성일** 2026.08.10 · **대상** `/ax-ai`(P1) · `/leadership`(P2) 모바일 히어로 상단
**적용 범위** P1·P2 히어로만 (다른 페이지·데스크톱 레이아웃 무변경)
**개선 강도** 결함 수정 + 위계 정리 (카피·정보구조 유지, 표현 계층만 수정)
**적용 스킬** apple-hig-design(계층·조화·일관성·접근성) + trendy-ui-design(머티리얼·모션·폴리시)
**핵심 사용자 작업 1개** — "이 필러가 우리 문제를 푸는지 3초 안에 판단하고 상담으로 넘어간다"

> **진단 근거 범위 고지**
> 컨테이너 네트워크 정책상 `keess-newscope.vercel.app` 직접 렌더링(Playwright)이 차단되어,
> ① 제공된 모바일 스크린샷 2종 ② 페이지 렌더 콘텐츠(카피·구조) 실측 ③ KEESS 디자인 시스템 문서를 근거로 진단했습니다.
> **CSS 원인 규명(선택자·컴포넌트 위치)은 클로드코드가 레포에서 확인 후 확정**하도록 프롬프트에 지시해 두었습니다.

---

## 1. 진단 — HIG 3원칙 위반 지점

| 원칙 | 위반 | 증상 |
|---|---|---|
| **계층** | chrome(헤더)이 콘텐츠(브랜드 로고)를 가림 | 히어로 아이브로 배지가 KEESS 로고 위에 겹쳐 로고 판독 불가 |
| **조화** | 필러 페이지 간 히어로 문법 불일치 | P1은 CTA 1개+스탯카드, P2는 CTA 2개+이미지카드 — 형제 페이지로 안 읽힘 |
| **일관성** | 좌측 정렬 축 붕괴 | 배지·H1·칩이 서로 다른 x축에서 시작, 배지는 gutter 밖으로 잘림 |

## 2. 결함 목록 (심각도순)

### S0 — 배포 즉시 수정 (브랜드·판독 결함)

| ID | 결함 | 근거 |
|---|---|---|
| **D-01** | **헤더 로고 ↔ 히어로 배지 z축 겹침** (P1·P2 공통). "KEESS" 워드마크가 배지에 덮여 브랜드 식별 불가 | 헤더가 히어로 위 overlay인데 히어로 `padding-top`이 헤더 높이를 확보하지 않음(추정 원인, 레포 확인 필요) |
| **D-02** | **배지 좌측 잘림 / gutter 침범**. 배지 라운드 캡이 뷰포트 좌측에서 절단, H1(20px)과 좌측 축 불일치 | 배지에만 컨테이너 padding 미적용 또는 음수 마진 |

### S1 — 가독성·접근성 (WCAG)

| ID | 결함 | 근거 |
|---|---|---|
| **D-03** | P1 H1 상단부가 배경 사진 밝은 영역과 겹쳐 흰 텍스트 대비 부족 구간 발생. 현행 균일 틴트로는 사진 최명부를 못 누름 | 실측 계산 §4-3: 사진 픽셀이 순백일 때 퍼플 틴트 α=0.62면 4.40:1 (AA 4.5:1 미달) |
| **D-04** | 햄버거 터치타깃 44×44pt 미확보 추정, 사진 위 아이콘 대비 미검증 | HIG 최소 터치타깃 |
| **D-05** | **P1 스탯 숫자가 정적 렌더에서 `0`으로 노출**. 카운트업 미실행(JS 실패·`prefers-reduced-motion`·크롤러) 시 "0단계 / 0 Skill Matrix"라는 **잘못된 정보**가 그대로 보임 | 렌더 콘텐츠 실측에서 두 값 모두 `0` 반환 확인 |

### S2 — 위계·일관성

| ID | 결함 |
|---|---|
| **D-06** | CTA 문법 불일치 — P1 단일(흰 pill) / P2 2개(흰+투명). 필러 페이지 히어로가 페이지마다 다른 약속을 함 |
| **D-07** | P2 secondary 버튼 경계가 사진 위에서 흐려 눌리는 요소로 안 읽힘. primary/secondary 구분이 **색 단독** |
| **D-08** | 칩 리스트 2열이 텍스트 길이에 따라 어긋남(ragged). 2번째 열 시작 x가 행마다 달라 스캔 축 붕괴 |
| **D-09** | 히어로 하단 카드 구조가 페이지별 상이(P1 스탯 타일 / P2 이미지+플로팅 라벨) — 공통 컴포넌트 부재 |
| **D-10** | P1 스탯 타일 계단식 배치 → 카드 면적의 상당 부분이 죽은 공백, 시선 경로 지그재그 |
| **D-11** | P2 플로팅 라벨 2개가 카드 밖으로 삐져나오고 서로 다른 스타일(핑크 숫자 / 흰 배경) — 규칙 부재 |

### S3 — 체감 품질

| ID | 결함 |
|---|---|
| **D-12** | 히어로가 1스크린 초과인데 하단 카드가 **의도 없이** 잘려 "깨진 화면"으로 읽힘. 스크롤 단서 없음 |
| **D-13** | 진입 stagger·헤더 스크롤 morph 부재 (trendy-ui-design 안티패턴: 전환 없는 즉시 노출) |

---

## 3. 개선 설계

### F-01 헤더/히어로 수직 계약 재정의 (D-01 해소)

```
헤더  position: sticky; top: 0; height: 56px; z-index: 50
      초기: 배경 투명 (히어로 사진 위)
      스크롤 8px 초과: background rgba(<brand-ink>, .55)
                      + backdrop-filter: blur(20px) saturate(180%)
                      + border-bottom: 1px solid rgba(255,255,255,.12)
      transition: 240ms cubic-bezier(.2,0,0,1)
      로고 좌 padding: max(20px, env(safe-area-inset-left) + 20px)
      햄버거 우 동일 · 터치타깃 44×44 (아이콘 24px + 패딩 10px)

히어로 padding-top: calc(56px + env(safe-area-inset-top) + 24px)
```
→ 배지 상단이 헤더 바닥에서 **24px 아래**. 겹침을 z-index로 덮지 말고 **물리적으로 제거**.
→ 히어로 아이브로 배지에 `position:absolute` / 음수 `margin-top` **금지**. 히어로 콘텐츠 흐름의 첫 요소로만 존재.

### F-02 아이브로 배지 스펙 통일 (D-02 해소)

| 속성 | 값 |
|---|---|
| 레이아웃 | `inline-flex`, height 28px, padding 0 12px, gap 6px, radius 999px |
| 표면 | `rgba(255,255,255,.14)` + `1px solid rgba(255,255,255,.28)` + `backdrop-filter: blur(12px)` |
| dot | 5px, `rgba(255,255,255,.85)` |
| 텍스트 | 12px / 700 / `#fff` **불투명도 100%**(.8 이하 금지) / `white-space: nowrap` |
| 정렬 | 좌측 축 = 히어로 컨테이너 gutter(20px). H1·서브카피·CTA·칩과 **동일 x축** |

### F-03 스크림 2겹 규칙 (D-03 해소) — 실측 검증된 alpha 하한

```
① 브랜드 틴트  linear-gradient(180deg,
     rgba(<tint>, A_top) 0%, rgba(<tint>, A_mid) 45%, rgba(<tint>, A_bot) 100%)
② 상단 헤더 스크림  linear-gradient(180deg, rgba(0,0,0,.35) 0%, transparent 40%)
```

**alpha 하한 (배경 사진 픽셀이 순백일 때 흰 텍스트 대비, 계산 결과)**

| 틴트 계열 | α=0.62 | α=0.68 | α=0.72 | α=0.75 | AA(4.5:1) 하한 |
|---|---|---|---|---|---|
| 퍼플 `#2E1A6B` (P1) | 4.40 ✗ | 5.30 ✓ | 6.01 ✓ | 6.63 ✓ | **α ≥ 0.65** |
| 버건디 `#7A1F3D` 근사 (P2) | 3.74 ✗ | 4.37 ✗ | 4.86 ✓ | 5.27 ✓ | **α ≥ 0.70** |

> 붉은 계열은 R채널 잔존으로 휘도가 덜 떨어짐 → **P2의 alpha 하한이 P1보다 높다.** 두 페이지에 같은 alpha를 쓰면 안 된다.

**권장값** — P1: `.74 / .68 / .82` · P2: `.80 / .75 / .86` (여유 마진 포함)
**검증 의무** — P2 실제 틴트 hex는 레포 값을 사용하고, 그 값으로 위 계산을 재수행해 AA 통과를 리포트할 것.

### F-04 타이포·수직 리듬

| 요소 | 값 |
|---|---|
| H1 | `clamp(25px, 8.2vw, 34px)` / 800 / line-height 1.22 / letter-spacing **-0.03em** |
| H1 줄바꿈 | `<br>` 하드코딩 금지 → `word-break: keep-all; text-wrap: balance` (한국어 어절 보존) |
| 서브카피 | `clamp(13.5px, 3.8vw, 15px)` / 400 / line-height 1.62 / `rgba(255,255,255,.86)` |
| 칩 | 12.5px / 600 / `rgba(255,255,255,.9)` · dot 4px `rgba(255,255,255,.55)` |
| 숫자 | `font-variant-numeric: tabular-nums` 전역 |

**수직 갭 (그룹 간 > 그룹 내 리듬)**

| 구간 | 표준 | 컴팩트 `@media (max-height:700px)` |
|---|---|---|
| 헤더 → 배지 | 24 | 16 |
| 배지 → H1 | 24 | 16 |
| H1 → 서브카피 | 14 | 12 |
| 서브카피 → CTA | 28 | 20 |
| CTA → 칩 | 20 | 14 |
| 칩 → Proof Card | 32 | 20 |

### F-05 CTA 문법 통일 (D-06·D-07 해소)

- **P1·P2 모두 2버튼 고정.** 배치 `grid-template-columns: 1fr 1fr; gap: 10px` (폭 균등 → 정렬 축 확보)
- **Primary** — 흰 배경 + 브랜드 잉크 텍스트, height 52px, radius 999px, 15px/700, `--shadow-2`
- **Secondary** — 투명 + `1.5px solid rgba(255,255,255,.45)` + 흰 텍스트 + `backdrop-filter: blur(8px)`
  → 색 단독 구분 금지. **면(fill) 유무 + 그림자 유무**로도 위계가 서게 함
- `@media (max-width:360px)` 에서 라벨 2줄 발생 시 세로 스택 폴백
- **P1 secondary 신규 라벨은 임의 생성 금지** — 페이지 내 기존 섹션 제목(예: AX Framework 섹션)에서 가져와 앵커 링크로 연결하고, 어떤 문자열을 어디서 가져왔는지 보고할 것

### F-06 칩 2열 축 고정 (D-08 해소)

```css
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
gap: 8px 16px;
```
→ `flex-wrap` 폐기. 셀 폭이 균등해지므로 2열 시작 x가 행마다 고정. P2(3개)는 마지막 셀이 비고 3번째가 좌측 축에 정렬되어 자연스러움.
→ 칩 개수(P1 4 / P2 3)는 **그대로 유지**. 개수를 맞추려 항목을 창작하지 말 것.

### F-07 공통 Proof Card 컴포넌트 (D-09·D-10·D-11 해소)

**공통 껍데기 (P1·P2 동일)**
```
radius 20px · padding 20px
background rgba(255,255,255,.10)
border 1px solid rgba(255,255,255,.18)
backdrop-filter blur(16px)
box-shadow 0 2px 4px rgba(0,0,0,.06), 0 8px 20px rgba(0,0,0,.10)
```

**P1 슬롯** — 계단식 폐기
- 스탯 2타일 `grid-template-columns: 1fr 1fr; gap: 12px` **균등 배치**
- 숫자 32px/800 tabular-nums · 라벨 12px/500 `rgba(255,255,255,.7)`
- hairline `1px rgba(255,255,255,.14)` 구분선 → 플로우 행 "진단 → 설계 → 학습 → 실행 → 성과" 13px/600 → 캡션 11.5px

**P2 슬롯** — 플로팅 라벨 규칙화
- 라벨 2개를 카드 **안쪽 12px 인셋**으로 이동. 카드 밖 돌출 금지
- 두 라벨 스타일 통일: 흰 배경 + 잉크 텍스트, radius 12px, padding 8px 10px, `--shadow-1`
- 숫자 강조는 **색이 아니라 weight**(800)로 — 히어로에 강조색 추가 금지
- 하단 6단계 텍스트: 11.5px, `word-break: keep-all`, 2줄 허용

### F-08 카운트업 안전장치 (D-05 해소)

- 스탯 DOM 초기값을 **최종값(5, 8)** 으로 렌더. 카운트업은 그 위에서 실행
- `prefers-reduced-motion: reduce` · IntersectionObserver 미지원 · JS 실패 → **즉시 최종값**
- 검수 기준: JS 비활성 상태 렌더 HTML에 스탯 `0` 문자열 **0건**

### F-09 1스크린 수납 + 의도된 peek (D-12 해소)

- 히어로 `min-height: 100svh`(dvh 아님 — 주소창 변동 시 점프 방지), `padding-bottom: 0`
- 목표: **배지~칩까지 fold 위 완전 수납**, Proof Card는 상단만 peek → 잘림 자체가 스크롤 단서
- 별도 scroll-down 아이콘 **추가 금지**(chrome 증가는 계층 원칙 위반)

**수직 예산 검증 결과 (계산 완료)**

| 뷰포트 | 칩까지 소계 | Proof Card peek | 판정 |
|---|---|---|---|
| 390×844 (svh 745) 표준갭 · H1 32px 3줄 | 481.6px | **231.4px** | OK (≥96) |
| 430×932 (svh 800) 표준갭 | 491.3px | **276.7px** | OK |
| 360×640 (svh 570) 표준갭 · H1 26px 4줄 | 511.6px | 26.4px | **FAIL** |
| 360×640 (svh 570) **컴팩트갭** · H1 25px 4줄 | 471.5px | **78.5px** | 최소확보 (≥56) |

→ 소형 뷰포트는 F-04 컴팩트 갭 미디어쿼리로만 통과. **`@media (max-height:700px)` 누락 시 회귀.**

### F-10 모션

- 진입 stagger: 배지 → H1 → 서브카피 → CTA → 칩 → 카드, **50ms 간격**, `translateY(10px)→0` + opacity, 240ms `cubic-bezier(.2,0,0,1)`
- 헤더 glass morph 240ms · linear easing 금지 · pop(즉시 교체) 금지
- `prefers-reduced-motion: reduce` → 전 애니메이션 opacity 전환만으로 강등

### F-11 접근성

- 햄버거 `<button>` 44×44, `aria-label="메뉴 열기"`, `aria-expanded` 동기화
- 배지는 정보 요소 → H1 앞 읽기 순서 유지, `aria-hidden` 금지
- 페이지당 `<h1>` 1개, 스킵 링크 `#main` 유지
- 포커스 링 **이중 링**(사진 위 어떤 배경에서도 보이게): `outline: 2px solid #fff; outline-offset: 2px; box-shadow: 0 0 0 4px rgba(0,0,0,.5)`

---

## 4. 보류 (별도 승인 필요 — 이번 작업 범위 밖)

| 항목 | 사유 |
|---|---|
| P2 배지 카피 "KG에듀원 리더십·조직 체계" 축약 | 로고와 브랜드명 중복. 카피 변경은 임의 생성 금지 원칙 대상 |
| P1/P2 히어로 배경 톤(네이비-퍼플 vs 버건디) 통일 | 필러 컬러 정책과 연계 판단 필요 |
| P3·P4 동일 패턴 확산 | 이번 범위는 P1·P2 한정. 본 건 검수 후 별도 진행 |

---

## 5. 클로드코드 빌드 프롬프트 (복붙용)

```
KEESS 모바일 히어로 상단 개선 작업입니다. 대상은 /ax-ai(P1)과 /leadership(P2)
두 페이지의 히어로 상단(헤더+히어로)뿐입니다. 다른 페이지·데스크톱 레이아웃·
카피·정보구조는 절대 변경하지 마세요. 전부 표현 계층 수정입니다.
문안·수치·항목을 임의로 생성하지 마세요.

[0단계 — 원인 규명 먼저]
· P1·P2 히어로를 렌더하는 컴포넌트/스타일 파일을 찾아 다음을 보고할 것:
  (a) 헤더의 position 값과 높이, (b) 히어로의 padding-top,
  (c) 아이브로 배지의 위치 지정 방식(흐름 / absolute / 음수 마진),
  (d) 배지에 컨테이너 gutter가 적용되는지
· 로고와 배지가 겹치는 진짜 원인을 특정한 뒤 수정에 착수. 추측으로 z-index만
  올려 덮는 임시방편 금지.

[수정 1 — 헤더/히어로 수직 계약 (S0)]
· 헤더: position:sticky; top:0; height:56px; z-index:50
  - 초기 배경 투명, 스크롤 8px 초과 시 rgba(<브랜드잉크>,.55)
    + backdrop-filter:blur(20px) saturate(180%)
    + border-bottom:1px solid rgba(255,255,255,.12)
    - transition 240ms cubic-bezier(.2,0,0,1)
  - 로고 좌 padding: max(20px, env(safe-area-inset-left) + 20px), 햄버거 우 동일
  - 햄버거 터치타깃 44×44 (아이콘 24px + 패딩 10px), <button>,
    aria-label="메뉴 열기", aria-expanded 동기화
· 히어로: padding-top: calc(56px + env(safe-area-inset-top) + 24px)
· 아이브로 배지는 히어로 콘텐츠 흐름의 첫 요소로만 존재.
  position:absolute·음수 margin-top 사용 금지.

[수정 2 — 아이브로 배지 스펙 통일 (S0)]
· inline-flex / height 28px / padding 0 12px / gap 6px / radius 999px
· 표면: rgba(255,255,255,.14) + 1px solid rgba(255,255,255,.28)
        + backdrop-filter: blur(12px)
· dot 5px rgba(255,255,255,.85)
· 텍스트 12px/700, color #fff (불투명도 100% — .8 이하 금지), white-space:nowrap
· 좌측 축 = 히어로 컨테이너 gutter(20px). 배지·H1·서브카피·CTA·칩이 모두
  같은 x축에서 시작하는지 확인. 좌측 잘림 0건.

[수정 3 — 스크림 2겹 + 대비 확보 (S1)]
· 배경 사진 위 2겹:
  ① 브랜드 틴트 linear-gradient(180deg,
       rgba(<tint>,A_top) 0%, rgba(<tint>,A_mid) 45%, rgba(<tint>,A_bot) 100%)
  ② 헤더 스크림 linear-gradient(180deg, rgba(0,0,0,.35) 0%, transparent 40%)
· alpha 권장값 — P1: .74/.68/.82   P2: .80/.75/.86
  ※ 붉은 계열은 휘도가 덜 떨어져 P2 하한이 더 높습니다. 두 페이지에 같은
    alpha를 쓰지 마세요.
· P2의 실제 틴트 hex는 레포 값을 사용하고, 그 값 기준으로 아래를 계산해 리포트:
  "배경 픽셀이 순백(255,255,255)일 때 틴트 합성색 대비 흰 텍스트 대비비"
  → H1·서브카피·칩 전부 4.5:1 이상이어야 통과 (큰 텍스트 3:1 완화 적용하지 말 것)

[수정 4 — 타이포·수직 리듬 (S2)]
· H1: clamp(25px,8.2vw,34px)/800, line-height 1.22, letter-spacing -0.03em
      word-break:keep-all; text-wrap:balance  (<br> 하드코딩 제거)
· 서브카피: clamp(13.5px,3.8vw,15px)/400, line-height 1.62,
            color rgba(255,255,255,.86)
· 칩: 12.5px/600 rgba(255,255,255,.9), dot 4px rgba(255,255,255,.55)
· 숫자 전역 font-variant-numeric: tabular-nums
· 수직 갭 (표준 → 컴팩트 @media (max-height:700px)):
  헤더→배지 24→16 / 배지→H1 24→16 / H1→서브 14→12 /
  서브→CTA 28→20 / CTA→칩 20→14 / 칩→카드 32→20
  ※ 컴팩트 미디어쿼리 누락 시 360×640에서 히어로가 넘칩니다. 반드시 넣을 것.

[수정 5 — CTA 문법 통일 (S2)]
· P1·P2 모두 2버튼, grid-template-columns: 1fr 1fr; gap:10px (폭 균등)
· Primary: 흰 배경 + 브랜드 잉크 텍스트, height 52px, radius 999px, 15px/700,
           box-shadow 0 2px 4px rgba(0,0,0,.06), 0 8px 20px rgba(0,0,0,.10)
· Secondary: 투명 + 1.5px solid rgba(255,255,255,.45) + 흰 텍스트
             + backdrop-filter: blur(8px)
  → primary/secondary 구분이 색 단독이 되지 않도록 fill 유무·그림자 유무로도 구분
· @media (max-width:360px) 라벨 2줄 발생 시 세로 스택 폴백
· P1은 현재 CTA가 1개("교육 상담")입니다. secondary 라벨을 **창작하지 말고**
  해당 페이지 내 기존 섹션 제목에서 가져와 앵커 링크로 연결한 뒤,
  어떤 문자열을 어느 섹션에서 가져왔는지 보고하세요.

[수정 6 — 칩 2열 축 고정 (S2)]
· flex-wrap 폐기 → display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px 16px
· 칩 개수(P1 4개 / P2 3개)는 그대로 유지. 개수 맞추려 항목 창작 금지.

[수정 7 — 공통 Proof Card (S2)]
· 공통 껍데기(P1·P2 동일): radius 20px, padding 20px,
  background rgba(255,255,255,.10), border 1px solid rgba(255,255,255,.18),
  backdrop-filter blur(16px),
  box-shadow 0 2px 4px rgba(0,0,0,.06), 0 8px 20px rgba(0,0,0,.10)
· P1 내부: 스탯 계단식 배치 폐기 →
  grid-template-columns:1fr 1fr; gap:12px 균등 2타일
  숫자 32px/800 tabular-nums, 라벨 12px/500 rgba(255,255,255,.7)
  하단 hairline 1px rgba(255,255,255,.14) 후
  플로우 행 13px/600 + 캡션 11.5px
· P2 내부: 플로팅 라벨 2개를 카드 안쪽 12px 인셋으로 이동(밖 돌출 금지),
  두 라벨 스타일 통일(흰 배경 + 잉크 텍스트, radius 12px, padding 8px 10px,
  box-shadow 0 1px 2px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.06)).
  숫자 강조는 색이 아니라 weight 800으로. 히어로에 강조색 신규 추가 금지.
  하단 6단계 텍스트 11.5px, word-break:keep-all, 2줄 허용.

[수정 8 — 카운트업 안전장치 (S1)]
· 현재 P1 스탯이 정적 렌더에서 0으로 노출됩니다(카운트업 초기값).
· DOM 초기값을 최종값으로 렌더하고 카운트업은 그 위에서 실행.
· prefers-reduced-motion:reduce / IntersectionObserver 미지원 / JS 실패 시
  즉시 최종값 노출.
· 검수 기준: JS 비활성 렌더 HTML에 스탯 0 문자열 0건.

[수정 9 — 1스크린 수납 + peek (S3)]
· 히어로 min-height:100svh (dvh 금지 — 주소창 변동 시 점프), padding-bottom:0
· 배지~칩까지 fold 위 완전 수납, Proof Card는 상단만 peek되게.
  이 잘림이 스크롤 단서 역할을 하므로 별도 scroll-down 아이콘 추가 금지.

[수정 10 — 모션 (S3)]
· 진입 stagger: 배지→H1→서브카피→CTA→칩→카드, 50ms 간격,
  translateY(10px)→0 + opacity, 240ms cubic-bezier(.2,0,0,1)
· linear easing 금지, 즉시 교체(pop) 금지
· prefers-reduced-motion:reduce → opacity 전환만으로 강등

[수정 11 — 접근성]
· 페이지당 h1 1개 유지, 배지는 h1 앞 읽기 순서 유지(aria-hidden 금지)
· 포커스 링 이중 링:
  outline:2px solid #fff; outline-offset:2px;
  box-shadow:0 0 0 4px rgba(0,0,0,.5)

[검증·보고 — 아래를 모두 수행하고 결과를 표로 제출]
1. npm run build 0 경고
2. 대비 리포트: P1·P2 각각, 히어로 배경 최악조건(사진 픽셀 순백) 기준
   H1·서브카피·칩·배지 텍스트의 흰색 대비비. 전부 ≥4.5:1
3. 뷰포트 4종 전/후 스크린샷: 360×640 / 390×844 / 414×896 / 430×932
   - 로고 가림 0건, 배지 좌측 잘림 0건
   - 히어로 세로 오버플로 0건(360×640 포함), Proof Card peek 확인
4. 터치타깃 감사: 햄버거·CTA 2종 전부 ≥44×44
5. JS 비활성 렌더에서 스탯 0 노출 0건
6. 좌측 정렬 축 검증: 배지·H1·서브카피·CTA·칩의 computed left 값이 동일
7. prefers-reduced-motion:reduce 상태 스크린샷 1장(모션 강등 확인)
8. 데스크톱(≥1024px) 전/후 스크린샷 — 무회귀 확인
9. 변경 파일 목록과 각 파일의 변경 사유 1줄

commit/push 금지 — 검토 후 지시합니다.
```

---

## 6. 검수 통과 기준 (요약)

- [ ] 로고 가림 **0건** (P1·P2, 4개 뷰포트)
- [ ] 배지 좌측 잘림 **0건**, 좌측 정렬 축 5요소 동일
- [ ] 히어로 텍스트 4종 대비 **전부 ≥4.5:1** (최악조건 기준)
- [ ] 360×640 포함 전 뷰포트 히어로 세로 오버플로 **0건**
- [ ] 터치타깃 **전부 ≥44×44**
- [ ] JS 비활성 시 스탯 `0` 노출 **0건**
- [ ] P1·P2 CTA·칩·Proof Card 문법 **동일**
- [ ] 데스크톱 무회귀
- [ ] 카피·데이터 신규 생성 **0건**
