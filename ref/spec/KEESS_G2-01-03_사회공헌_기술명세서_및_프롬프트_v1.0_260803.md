# [KEESS] 사회공헌(/csr) 기술 명세서 및 빌드 프롬프트 v1.0

**작성일**: 2026-08-03
**대상**: 홈 하단 밴드 섹션 + `/csr` 목록 + `/csr/[id]` 상세 (신규 구축)
**전제 문서**: 사회공헌 반영 세부 전략(260803) / UI/UX 고도화 전략(260803) / G2-01-03 Flow 최종본(업무번호 23620) / KEESS UI/UX 방향성 v1(260701)
**빌드 환경**: 클로드 코드, Next.js App Router 전제, 대상 저장소 `keess-newscope`
**기준 화면(디자인 토큰 원본)**: https://prototype-keess-final.vercel.app/

---

## 0. 사전 확인 — 저장소 현황 (반드시 먼저 점검)

`keess-newscope` 저장소는 2026.07.31 생성 이후 **빌드 착수 전 상태**임이 확인되었다(2026.08.03 기준). 이 명세서는 아래 두 경우 중 어느 쪽인지에 따라 1단계 작업이 달라지므로, 클로드 코드는 구현 착수 전 반드시 저장소 상태를 먼저 점검해야 한다.

| 경우 | 상태 | 이번 작업 범위 |
|---|---|---|
| A | `prototype-keess-final`의 소스(App Router, 기존 홈페이지 `app/page.tsx`, 공통 `Footer` 컴포넌트, 디자인 토큰 CSS)가 이미 이관되어 있음 | 이 명세서 1~9장을 그대로 적용해 기능 추가 |
| B | 완전히 빈 저장소이거나 `create-next-app` 기본 스캐폴드만 있음 | CSR 기능 구현 전에 **최소한 홈페이지 구조·Footer·디자인 토큰(색상/타이포/그림자/라운드 변수)을 먼저 이식**해야 함 — 없는 상태에서 홈 밴드·푸터 링크를 추가할 대상 자체가 없기 때문. 이 경우 클로드 코드는 임의로 새 홈페이지를 만들지 말고, 어떤 소스를 기준으로 이식할지(예: 확정 프로토타입 `keess_home_C_v18_최종확정.html`을 변환) 먼저 보고하고 진행 방식을 확인받는다.

---

## 1. 한 줄 요약

| 구분 | 내용 |
| --- | --- |
| 무엇을 | 쌤플러스(ssamplus.com) 사회공헌 게시판 최신 게시물을 1회 큐레이션하여, KEESS 내부에서 완결되는 정적 목록+상세 게시판(`/csr`)과 홈 하단 밴드 섹션을 구축 |
| 왜 | 대표 지시(그룹 계열사 사회공헌 노출) 이행. ADMIN·별도 서버 없이 유지 가능해야 함 |
| 어떻게 | 크롤러 없이 수작업으로 수집한 콘텐츠를 타입 안전한 구조화 데이터로 저장하고, Next.js 정적 페이지로 렌더링 |
| 핵심 설계 판단 | 원문 HTML을 그대로 저장·주입(`dangerouslySetInnerHTML`)하지 않고, **본문을 문단/이미지 블록 배열로 구조화**해 저장한다 — 외부 게시판 HTML을 원문 그대로 미러링하면 XSS·마크업 오염 위험이 있고 유지보수도 어렵기 때문. 사용자에게 보이는 결과(텍스트+이미지가 상세페이지에 노출)는 동일하되 구현은 더 안전하다 |

---

## 2. 정보구조 · 라우팅

```
/                        홈 (기존)
  └─ CsrHomeBand 컴포넌트 (FAQ~상담폼 섹션과 푸터 사이 삽입)
       └─ [전체 보기] → /csr (내부 이동)

/csr                     목록 페이지 (신규, 정적)
  └─ 카드 클릭 → /csr/[id]

/csr/[id]                상세 페이지 (신규, 정적, generateStaticParams)
  └─ 출처 박스 내 "원문 보기" 링크만 외부(ssamplus.com) 새창 이동

Footer (기존 컴포넌트 수정)
  └─ "사회공헌" 텍스트 링크 → /csr
```

- 경로는 `/csr`로 확정 (Flow 원문의 `/crs` 오타는 채택하지 않음)
- GNB 신설 없음
- 존재하지 않는 `[id]` 접근 시 `dynamicParams = false` 설정으로 기존 `app/not-found.tsx`(에러페이지 명세서 v2.0에서 이미 구현됨)가 그대로 처리하도록 한다 — 별도 404 로직 신규 구현 불필요

---

## 3. 데이터 모델

### 3-1. 타입 (`lib/csr/types.ts`)

```ts
export type CsrBodyBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }

export type CsrPost = {
  id: string              // slug, 예: "2026-3rd-quarter-volunteer"
  title: string
  date: string             // 'YYYY-MM-DD', 원문 게시일
  summary: string          // 1~2문장, 카드 발췌/메타디스크립션용
  thumbnail?: { src: string; alt: string }  // 카드 대표 이미지, 없으면 undefined
  body: CsrBodyBlock[]      // 상세페이지 본문
  sourceUrl: string         // 원문 URL (ssamplus.com만 허용)
  collectedAt: string       // 'YYYY-MM-DD', 수집일 — 스냅샷 기준 시점 표기에 사용
}

export const CSR_CATEGORY_LABEL = 'KG그룹 사회공헌'
```

### 3-2. 데이터 파일 (`lib/csr/data.ts`)

- `export const CSR_POSTS: CsrPost[] = [...]`
- **금지**: 실 데이터 없이 그럴듯한 사회공헌 게시물 내용을 임의 생성하지 않는다. 초기 구현 시에는 구조 검증용 예시 1건만 포함하고, 반드시 `// SAMPLE — 실 데이터로 교체 필요` 주석으로 표시한다. 나머지는 빈 배열로 두고, 실 데이터(ssamplus.com 최신 6~10건 큐레이션 결과)는 별도 데이터 입력 작업으로 채운다.
- `sourceUrl`은 `ssamplus.com` 도메인만 허용 (다른 출처 혼입 방지)

### 3-3. 쿼리 함수 (`lib/csr/queries.ts`)

```ts
export function getAllCsrPosts(): CsrPost[] // date desc 정렬
export function getCsrPostById(id: string): CsrPost | undefined
export function getAdjacentCsrPosts(id: string): { prev?: CsrPost; next?: CsrPost }
export function getHomeBandCsrPosts(limit = 6): CsrPost[] // getAllCsrPosts().slice(0, limit)
```

- 이 계층을 두는 이유: 2차(예약 스케줄러 자동 수집) 전환 시 이 파일 내부 구현만 "정적 배열 읽기" → "캐시 읽기"로 교체하면 되고, 컴포넌트·페이지는 변경이 필요 없다.

### 3-4. 이미지 저장

- 경로 규칙: `public/csr/{postId}/{순번}.{ext}` (원본 파일명 그대로 쓰지 않음)
- 포맷: 가능하면 webp로 변환, 원본이 jpg/png면 그대로 두어도 무방(Vercel의 `next/image`가 배포 시 자동 최적화)
- 외부 이미지 URL 직접 참조 금지 — 반드시 로컬 리호스팅 후 참조 (원문 서버 부하·핫링크 문제 방지)
- 모든 이미지 객체는 `alt` 필수 (접근성 — 없으면 타입 에러가 나도록 `alt: string`으로 선택 필드가 아닌 필수 필드로 정의되어 있음에 유의)

---

## 4. 컴포넌트 명세

### 4-1. `components/csr/CsrCard.tsx`

- Props: `{ post: CsrPost; variant: 'band' | 'list' }`
- **단일 컴포넌트로 썸네일 유무 두 케이스를 모두 처리** (목록 페이지에서 "이미지형/텍스트형 카드 두 종"을 별도 컴포넌트로 만들지 않고, 시각 슬롯 하나를 조건부로 채우는 방식으로 단순화):
  - `post.thumbnail`이 있으면 실제 이미지를 `next/image`로 렌더
  - 없으면 동일한 시각 슬롯에 브랜드 그라디언트 플레이스홀더(`linear-gradient(135deg, var(--p1), var(--p1s))`, 기존 `.assetcard .thumb` 톤 재사용) + 중앙 KEESS 마크
- 구조: 시각 슬롯(정사각 1:1) → 카테고리 라벨칩(`CSR_CATEGORY_LABEL`, muted 배경) → 제목(`-webkit-line-clamp:2`) → 날짜(우측 정렬, `tabular-nums`)
- 스타일: 기존 `.card` 토큰 상속(`border-radius:20px`, `box-shadow:var(--sh1)`), hover 시 `translateY(-3px)` + `var(--sh2)`, transition `240ms var(--ease-out)` — 신규 CSS 변수 추가 없이 기존 `:root` 토큰만 사용
- 전체 카드가 `<Link href={/csr/${post.id}}>`로 클릭 영역 확보 (44×44px 이상)

### 4-2. `components/csr/CsrHomeBand.tsx`

- `getHomeBandCsrPosts(6)` 사용, 데스크톱 3열×2행 / 태블릿 2열 / 모바일 1열 — 기존 `.grid.g3` 클래스·브레이크포인트(860px, 560px) 그대로 재사용, 신규 그리드 시스템 만들지 않음
- 상단: 헤드라인(세리프, "함께 성장하는 사회공헌") + 서브카피 1줄 + 우측 "전체 보기 →" (`.btn.ghost` 재사용) + 스냅샷 배지("{최신 collectedAt} 기준", caption 11px muted)
- `CsrCard variant="band"` 6장을 IntersectionObserver 기반 stagger(40ms)로 등장 — 기존 `.rv`/`io` 패턴 재사용

### 4-3. `app/csr/page.tsx` (목록)

- `getAllCsrPosts()` 전체를 `CsrCard variant="list"`로 렌더 (그리드, 페이지네이션 없음 — 소량 콘텐츠 전제)
- 상단 eyebrow + Gowun Batang 헤드라인 + 서브카피(왜/얼마나 — 확보된 수치 없으면 서브카피에서 수치 언급 생략) + 스냅샷 배지
- 0건일 경우("아직 데이터 입력 전") 빈 상태 UI: "곧 소식을 전해드리겠습니다" + 홈으로 돌아가기 링크 — 개발 중간 상태에서도 페이지가 깨지지 않도록 반드시 처리
- `generateMetadata`: title "사회공헌 | KEESS", description은 고정 소개문 1~2문장

### 4-4. `app/csr/[id]/page.tsx` (상세)

- `export function generateStaticParams()` → `getAllCsrPosts().map(p => ({ id: p.id }))`
- `export const dynamicParams = false` (목록에 없는 id는 기존 `not-found.tsx`로)
- `generateMetadata({ params })`: title = `${post.title} | KEESS 사회공헌`, description = `post.summary`, openGraph.image = `post.thumbnail?.src`
- 레이아웃: "← 목록으로" → 제목(세리프) → 날짜+카테고리 라벨 → `CsrBody` → 출처 박스 → 이전글/다음글 내비게이션

### 4-5. `components/csr/CsrBody.tsx`

- Props: `{ blocks: CsrBodyBlock[] }`
- `paragraph` 블록: `<p>` 렌더, line-height 1.6, 맑은 고딕
- `image` 블록: `next/image` + radius 12px, `caption`이 있으면 하단 소형 caption 텍스트. 이미지 블록이 연속으로 2개 이상이면 반응형 2열 그리드로 묶어 렌더(캐러셀 등 별도 JS 컴포넌트 사용하지 않음 — 유지보수 단순화)
- `dangerouslySetInnerHTML` 사용하지 않음 (2장 핵심 설계 판단 참조)

### 4-6. 출처 박스 (상세페이지 내 인라인, 별도 컴포넌트 불필요)

```
출처: 쌤플러스 사회공헌 게시판 · [원문 보기 ↗](sourceUrl) · {collectedAt} 수집
```

- `surface` 배경 카드, `<a href={sourceUrl} target="_blank" rel="noopener noreferrer">`
- 링크 텍스트 자체에 "새 창에서 열림" 의미가 드러나도록 화살표 아이콘 + 시각적 표기(스크린리더는 링크 근처에 숨김 텍스트 `(새 창에서 열림)` 추가)

---

## 5. 기존 코드베이스 연동 지점 (수정 대상)

| 파일(추정) | 변경 내용 |
| --- | --- |
| `app/page.tsx` (홈) | FAQ 섹션과 상담 폼 섹션 사이(또는 상담 폼과 푸터 사이 — 실제 섹션 순서를 먼저 확인 후 삽입 위치 결정)에 `<CsrHomeBand />` 삽입 |
| 공통 `Footer` 컴포넌트 | 기존 유틸리티 링크 목록(개인정보처리방침 등과 같은 자리)에 "사회공헌" 텍스트 링크 → `/csr` 추가 |
| `next.config.*` | 로컬 `/public` 이미지만 사용하므로 `images.remotePatterns` 등 별도 설정 불필요(외부 이미지 직참조를 하지 않기 때문) |

이 표의 파일 경로는 기존 코드베이스 확인 후 실제 경로로 정정한다(0장 사전 확인과 연동).

---

## 6. 금지 사항

| 번호 | 금지 항목 | 이유 |
| --- | --- | --- |
| 1 | 실 데이터 없이 그럴듯한 사회공헌 게시물 내용을 임의 생성 | 사실 왜곡, 회사 대외 콘텐츠 신뢰성 문제 |
| 2 | 원문 HTML을 `dangerouslySetInnerHTML`로 그대로 주입 | XSS·마크업 오염 위험 — 구조화 블록으로만 렌더 |
| 3 | 외부(ssamplus.com) 이미지 URL 직접 참조(핫링킹) | 원문 서버 의존, 원문 삭제/변경 시 KEESS 화면도 깨짐 — 반드시 로컬 리호스팅 |
| 4 | GNB 신규 메뉴 추가 | G2-12 최종 결정(영업 상품 체계와 성격 상이) |
| 5 | 확보되지 않은 수치(참여 인원·누적 건수 등)를 홈 밴드·목록 서브카피에 임의 표기 | 사회공헌 UI/UX 벤치마크 리서치의 "근거 없는 수치 생성 금지" 원칙 |
| 6 | 새 강조색 추가 | 기존 브랜드 퍼플(`--p1`)만 포인트로 사용, 정부지원 옐로우와 혼동 금지 |
| 7 | alt 없는 이미지 커밋 | 접근성 체크리스트 필수 항목 |
| 8 | GA·애널리틱스 코드 삽입 | 오픈 후 별도 적용 방침(G2-10)과 동일 원칙 적용 |

---

## 7. QA 체크리스트

### 7-1. 로컬(빌드 전)

- [ ] `npm run build` 성공 (0건 데이터 상태에서도 성공해야 함 — 빈 배열 방어 로직 확인)
- [ ] 샘플 데이터 1건으로 `/csr`, `/csr/[해당id]` 정상 렌더
- [ ] 존재하지 않는 `/csr/abc` 접근 시 기존 404 화면(`not-found.tsx`) 표시
- [ ] 이미지 없는 게시물(썸네일 `undefined`)일 때 그라디언트 플레이스홀더 정상 표시(빈 여백 없음)
- [ ] 이미지 2장 이상 게시물의 본문 그리드 레이아웃 확인

### 7-2. 콘텐츠 정합성

- [ ] 모든 `CsrPost.sourceUrl`이 `ssamplus.com` 도메인인지 확인
- [ ] 모든 이미지 `alt` 텍스트 존재 여부
- [ ] 홈 밴드·목록의 날짜가 최신순으로 정렬되는지
- [ ] 출처 박스의 원문 링크 클릭 시 실제 원문으로 정확히 연결되는지(건별 전수 확인)

### 7-3. 접근성·반응형

- [ ] 카드 클릭 영역 44×44px 이상
- [ ] 카테고리 라벨·muted 텍스트 명도 대비 WCAG AA
- [ ] 키보드 탭 이동으로 카드→상세→출처링크까지 접근 가능, 포커스 링 시각적으로 확인 가능
- [ ] 데스크톱/태블릿/모바일 3단 반응형 그리드 확인(860px, 560px 브레이크포인트)

### 7-4. 배포 후(운영 URL 기준)

- [ ] 홈 하단 밴드 → "전체 보기" → `/csr` 내부 이동(새창 아님) 확인
- [ ] `/csr` 카드 → 상세 이동, 뒤로가기/이전글·다음글 내비게이션 정상
- [ ] 상세페이지 원문 링크만 새창(`target="_blank"`) 이동 확인
- [ ] 푸터 "사회공헌" 링크 정상 동작
- [ ] 모바일 실기기 확인

---

## 8. 클로드 코드 프롬프트

```text
KEESS 웹사이트(Next.js App Router, keess-newscope 저장소)에 사회공헌(/csr) 기능을 구현해 주세요. 기획·UI/UX 설계가 끝난 작업이므로 임의 판단 대신 아래 기준을 그대로 따라 주세요.

[작업 0: 저장소 상태 먼저 확인 — 반드시 가장 먼저 실행]
- 이 저장소에 이미 KEESS 홈페이지(app/page.tsx 등), 공통 Footer 컴포넌트, 디자인 토큰(CSS 변수: 배경/잉크/라인/서피스/브랜드 퍼플 #2E1A6B, 카드 radius 20px, box-shadow 등)이 존재하는지 확인해 주세요.
- 존재하면 아래 작업을 이 코드베이스 위에 그대로 적용합니다.
- 존재하지 않거나 create-next-app 기본 스캐폴드뿐이라면, 임의로 새 홈페이지를 만들지 마세요. 대신 저장소 현황(어떤 파일이 있는지)을 보고해 주시고, 그 상태로는 "홈 하단 밴드/푸터 링크"를 추가할 대상 자체가 없다는 점을 알려주세요. 저 없이 판단해서 진행하지 말고 먼저 확인을 구해 주세요.

[디자인 토큰 — 기존 값 재사용, 새 값 추가 금지]
배경 #FAFAFB · 잉크 #14141A · 보조텍스트 #54585f · 라인 #E6E8EC · 서피스 #F3F5F8 · 브랜드 퍼플 #2E1A6B(보조 #5a3fb0) · 카드 radius 20px · 컨트롤 radius 12px · pill radius 999px · shadow 2단(sh1 기본/sh2 호버) · 진입 모션 ease-out(cubic-bezier(.2,0,0,1)) 240ms + stagger 40ms · 헤드라인 세리프(Gowun Batang), 본문 맑은 고딕. 코드베이스에 이미 이 값들이 CSS 변수로 정의되어 있다면 반드시 그것을 참조하고 새로 만들지 마세요.

[작업 1: 데이터 계층]
- lib/csr/types.ts: CsrBodyBlock(paragraph|image 유니온), CsrPost 타입, CSR_CATEGORY_LABEL = 'KG그룹 사회공헌' 상수를 정의합니다. CsrPost 필드: id, title, date, summary, thumbnail?(src,alt), body(CsrBodyBlock[]), sourceUrl, collectedAt.
- lib/csr/data.ts: CSR_POSTS 배열. 실제 사회공헌 게시물 내용을 절대 임의로 지어내지 마세요. 구조 검증용으로 명확히 "// SAMPLE — 실 데이터로 교체 필요" 주석을 단 예시 1건만 포함하고, 나머지는 빈 배열로 둡니다.
- lib/csr/queries.ts: getAllCsrPosts()(date desc 정렬), getCsrPostById(id), getAdjacentCsrPosts(id)(prev/next), getHomeBandCsrPosts(limit=6) 함수를 만듭니다.

[작업 2: CsrCard 컴포넌트]
- components/csr/CsrCard.tsx, props { post, variant: 'band'|'list' }.
- post.thumbnail이 있으면 next/image로 정사각(1:1) 렌더, 없으면 같은 자리에 브랜드 그라디언트(linear-gradient(135deg, #2E1A6B, #5a3fb0)) 플레이스홀더 + 중앙에 작은 KEESS 마크(텍스트로 대체 가능)를 렌더해 빈 여백이 남지 않게 하세요.
- 구조(위→아래): 시각 슬롯 → 카테고리 라벨칩(CSR_CATEGORY_LABEL, 서피스 배경) → 제목 2줄 말줄임 → 날짜(우측 정렬, tabular-nums).
- 카드 전체를 Link로 감싸 /csr/[id]로 이동하게 하고, 클릭 영역이 44x44px 이상이 되게 하세요.
- hover 시 translateY(-3px) + 그림자 강화, transition 240ms ease-out. 기존 코드베이스에 .card 클래스나 유사 카드 스타일이 있으면 그것을 확장해서 쓰고 새로 만들지 마세요.

[작업 3: 홈 밴드 섹션]
- components/csr/CsrHomeBand.tsx: getHomeBandCsrPosts(6) 사용. 상단에 헤드라인("함께 성장하는 사회공헌", 세리프) + 서브카피 1줄 + 우측 "전체 보기 →" 링크(/csr, 기존 ghost 버튼 스타일) + 작은 스냅샷 배지("{최신 게시물의 collectedAt} 기준"). 아래 CsrCard variant="band" 그리드(데스크톱 3열, 태블릿 2열, 모바일 1열).
- 기존 홈페이지(app/page.tsx 등)에서 FAQ 섹션과 상담 폼 섹션 사이, 혹은 상담 폼과 푸터 사이 중 실제 구조를 확인해 자연스러운 위치에 <CsrHomeBand />를 삽입해 주세요. GNB에는 어떤 메뉴도 추가하지 마세요.

[작업 4: 목록 페이지]
- app/csr/page.tsx: getAllCsrPosts() 전체를 CsrCard variant="list"로 그리드 렌더 (페이지네이션 없음). 상단에 eyebrow "KG그룹 사회공헌" + 세리프 헤드라인 + 서브카피(확보되지 않은 수치는 절대 언급하지 마세요) + 스냅샷 배지.
- 게시물이 0건일 때를 반드시 처리하세요: "곧 소식을 전해드리겠습니다" 안내 문구 + 홈으로 돌아가기 링크. 개발 중간 상태(데이터 입력 전)에서도 페이지가 깨지지 않아야 합니다.
- generateMetadata로 title "사회공헌 | KEESS" 설정.

[작업 5: 상세 페이지]
- app/csr/[id]/page.tsx: generateStaticParams()로 전체 id 목록 생성, export const dynamicParams = false로 설정해서 존재하지 않는 id는 기존 not-found.tsx(이미 구현되어 있다면)가 처리하도록 하세요.
- generateMetadata({ params })로 title, description(summary), openGraph.image(thumbnail) 설정.
- 레이아웃: "← 목록으로" 링크 → 제목(세리프, 큰 크기) → 날짜 + 카테고리 라벨 → 본문(CsrBody 컴포넌트) → 출처 박스 → 이전글/다음글 내비게이션.
- components/csr/CsrBody.tsx: blocks(CsrBodyBlock[])를 순회하며 paragraph는 <p>(line-height 1.6, 맑은 고딕), image는 next/image(radius 12px) + caption을 렌더하세요. 연속된 image 블록이 2개 이상이면 반응형 2열 그리드로 묶어 렌더하세요. dangerouslySetInnerHTML은 절대 사용하지 마세요.
- 출처 박스: 서피스 배경 카드에 "출처: 쌤플러스 사회공헌 게시판 · 원문 보기 ↗ · {collectedAt} 수집" 텍스트, 원문 링크만 target="_blank" rel="noopener noreferrer"로 새창 이동하게 하고, 스크린리더용으로 "(새 창에서 열림)" 숨김 텍스트를 추가하세요.

[작업 6: 푸터 링크]
- 기존 공통 Footer 컴포넌트의 유틸리티 링크 목록(개인정보처리방침 등이 있는 자리)에 "사회공헌" 텍스트 링크(→ /csr)를 추가하세요.

[공통 금지 사항]
- 실 데이터 없는 사회공헌 게시물 내용 임의 생성 금지 (작업 1 참조)
- dangerouslySetInnerHTML 사용 금지
- 외부(ssamplus.com) 이미지 URL 직접 참조(핫링킹) 금지 — public/csr/{id}/ 로 로컬 리호스팅한다는 전제로 코드를 작성하되, 실제 이미지 파일은 이번 작업에서 넣지 않아도 됩니다(경로 구조만 맞추면 됨)
- GNB 메뉴 추가 금지
- 확보되지 않은 수치(참여 인원 등) 임의 표기 금지
- 새 강조색 추가 금지 (기존 브랜드 퍼플만 사용)
- alt 없는 이미지 금지
- GA·애널리틱스 코드 삽입 금지

[완료 확인: 아래를 직접 실행하고 결과를 표로 보고]
1. 작업 0 점검 결과 (저장소에 기존 홈페이지·Footer·디자인 토큰이 있었는지)
2. npm run build 성공 여부 (샘플 데이터 1건 + 빈 배열 양쪽 상태 모두 테스트)
3. 로컬에서 /csr, /csr/[샘플id] 정상 렌더 확인
4. 존재하지 않는 /csr/abc 접근 시 기존 404 화면으로 처리되는지 확인
5. 홈페이지에 CsrHomeBand가 삽입된 위치와 이유
6. Footer 링크 정상 동작 확인
7. 이미지 없는 게시물(플레이스홀더) 렌더 확인
8. 수정·생성된 파일 목록
```

---

## 9. 배포 절차 (클로드 코드 완료 후)

| 순서 | 작업 | 확인 |
| --- | --- | --- |
| 1 | 완료 보고 표 검토 | 8개 항목 전부 통과, 특히 작업 0 결과 확인 |
| 2 | 실 데이터 입력 | ssamplus.com 최신 6~10건 큐레이션 → `lib/csr/data.ts`에 반영, 이미지 `public/csr/{id}/`에 리호스팅 |
| 3 | 실데이터 반영 후 재빌드·QA | 7장 체크리스트 전체 재수행 |
| 4 | git 커밋·푸시 | keess-newscope |
| 5 | Vercel 프리뷰 배포 확인 | 프리뷰 URL에서 `/csr` 전체 플로우 확인 |
| 6 | 프로덕션 반영 (또는 prototype-keess-final과의 병합 방식 별도 결정) | — |

---

## 10. 남은 결정 사항

| 번호 | 항목 | 비고 |
| --- | --- | --- |
| 1 | keess-newscope가 실제로 기존 코드베이스를 포함하는지 | 0장 사전 확인에서 클로드 코드가 최초 보고 |
| 2 | 홈 밴드 노출 건수(4 vs 6) | 본 명세서는 6건 기준으로 작성, 확정 시 `getHomeBandCsrPosts(limit)` 인자만 조정 |
| 3 | 쌤플러스/평생교육팀에 콘텐츠 재게시 사전 고지 여부·시점 | 사회공헌 세부 전략 문서 리스크 항목과 동일 |
| 4 | SEO 정책 — `/csr` 페이지를 검색엔진에 정상 색인할지, 원문과의 중복 콘텐츠 이슈를 어떻게 볼지 | 기본값은 색인 허용(별도 noindex 미적용)으로 설계했으나 최종 확인 필요 |
| 5 | keess-newscope 프로토타입을 이후 prototype-keess-final(운영 소스)과 어떻게 병합할지 | 배포 절차 6단계와 연결, 별도 협의 필요 |
