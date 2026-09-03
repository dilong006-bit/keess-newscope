# [KEESS] /kium 공개교육 탭 고도화 — 기술명세서 v1.0

- 작성일: 2026-09-03 / 작성: 임지홍 (HRD사업지원팀) · 최고급 시니어 풀스택 개발자 관점
- 대상 리포지토리: `keess-newscope` (Next.js + TypeScript, Vercel 자동 배포)
- 대상 페이지: `/kium` — **공개교육 탭 한정** (사업소개·과정안내 탭 및 타 페이지 회귀 zero가 절대 조건)
- 근거 문서: `KEESS_kium_공개교육_UIUX고도화전략_v1.1_260903.md` (본 명세서는 해당 전략의 구현 명세)
- 관련 선행: 썸네일 듀얼모드 기술명세서 v1.0(260807) — `thumbSrc` 이미지 모드 설계 재사용

---

## STEP 0. 리포 진단 (구현 전 필수 — 모든 후속 STEP의 전제)

문서의 파일·컴포넌트명은 **후보**다. 구현 전 아래를 실제 코드에서 확정하고, 이후 모든 STEP은 확정된 실명 기준으로 수행한다.

| # | 확인 항목 | 후보 위치 |
|:--:|---|---|
| 1 | 공개교육 탭 루트 컴포넌트·탭 전환 방식 | `app/kium/` 하위, `components/sections/kium/` 또는 `components/kium/` |
| 2 | 일정 테이블(과정명/10월/11월/12월 매트릭스) 구현 파일 — **깨짐(헤더 겹침)의 원인 코드** | 공개교육 탭 내 schedule/table 관련 컴포넌트 |
| 3 | 공개교육 과정 카드 — 과정안내 탭 `KiumCourseCard`/`KiumThumb` 재사용 여부 | `components/…/KiumCourseCard.tsx`, `KiumThumb.tsx` |
| 4 | 회차(일정) 데이터 구조 — 과정 데이터에 내장인지 별도 배열인지 | `lib/kium/data.ts` (`KiumCourse.schedule` 필드 존재 확인) |
| 5 | 상담폼 컴포넌트·관심영역 칩 상태 관리 방식 | 페이지 하단 공용 폼 (도입문의 폼 재사용 여부) |
| 6 | 인트로 문장("…1명부터 신청하실 수 있습니다.") 렌더 위치와 `<br>`/max-width | 공개교육 탭 인트로 |
| 7 | 기존 배지·칩 클래스( `개강확정`/`모집중` pill, `정부지원 환급`, `공개교육 개설` ) 정의 위치 | `styles/kium.css` 등 |

진단 결과(파일 경로 매핑표)를 작업 로그 최상단에 기록한 후 STEP 1로 진행한다.

---

## STEP 1. 데이터 모델 — 회차(Session) 분리 + 상태 4종 enum

### 1-1. 타입 (`lib/kium/data.ts` 또는 진단된 실제 데이터 파일)

```ts
/** 회차 모집 상태 — 4종 단일 enum. 운영자가 데이터로 지정(자동 계산 없음) */
export type KiumSessionStatus = 'recruiting' | 'confirmed' | 'closing' | 'closed'

export type KiumSession = {
  id: string            // 예: 'kium-03-s1'
  courseId: string      // KiumCourse.id 참조
  start: string         // ISO 'YYYY-MM-DD'
  end: string           // 1일 과정은 start와 동일
  status: KiumSessionStatus
  seatsLeft?: number    // 마감임박 시 잔여석 (선택)
}

export const KIUM_SESSION_META: Record<KiumSessionStatus, {
  label: string; tone: 'amber' | 'green' | 'red' | 'gray'; weight: number
}> = {
  confirmed:  { label: '개강확정', tone: 'green', weight: 1 },
  closing:    { label: '마감임박', tone: 'red',   weight: 1 },
  recruiting: { label: '모집중',   tone: 'amber', weight: 2 },
  closed:     { label: '마감',     tone: 'gray',  weight: 4 },
}
```

- 기존 `KiumCourse.schedule: string`(문자열)에 회차가 박혀 있으면 → `KIUM_SESSIONS: KiumSession[]` 별도 배열로 이관하고 문자열 필드는 미사용 처리(삭제는 과정안내 탭 영향 확인 후)
- 날짜 표기 유틸 1개 신설: `formatSessionRange(s)` → `10.12(월) ~ 10.13(화) · 2일` / 1일 과정 `10.27(화) · 1일` (요일 한글, 일수 자동 계산)

### 1-2. 시드 데이터 — 상태 커버리지 강제 (전략 §8-1)

- 4종 상태 **각 2건 이상** 배정. 4개 노출 표면(일정순 행 · 과정별 pill · 상세 스트립 · 카드 최근접 배지) 모두에서 전 상태가 최소 1회 노출되도록 분산
- 최소 1개 과정은 회차 3개(confirmed + closing + closed) 동시 보유
- closing 2건 중 1건은 `seatsLeft` 있음(예: 3), 1건은 없음
- 회차 0개 과정 1건 유지("다음 회차 준비 중" 케이스)
- **프론트 가드**: `end < today`인 회차는 status와 무관하게 closed로 표시 처리(렌더 단계 override, 데이터 원본은 불변)

---

## STEP 2. 상태 배지 컴포넌트 `SessionBadge`

### 2-1. 컴포넌트 (신규 `components/…/SessionBadge.tsx`)

```tsx
export default function SessionBadge({ status, seatsLeft }: {
  status: KiumSessionStatus; seatsLeft?: number
}) {
  const meta = KIUM_SESSION_META[status]
  return (
    <span className="kium-badge" data-tone={meta.tone}>
      {BADGE_ICON[status] /* 인라인 SVG, §7 */}
      <span>{meta.label}</span>
      {status === 'closing' && seatsLeft != null && <em>잔여 {seatsLeft}석</em>}
    </span>
  )
}
```

### 2-2. CSS (`styles/kium.css` 신규 — 기존 토큰과 별도 배지 전용 4톤)

```css
.kium-badge{display:inline-flex;align-items:center;gap:4px;height:24px;
  padding:0 8px;border-radius:999px;font-size:12px;font-weight:700;
  letter-spacing:-.01em;white-space:nowrap}
.kium-badge svg{width:14px;height:14px;flex:none}
.kium-badge[data-tone="amber"]{background:#FEF3C7;color:#92400E}
.kium-badge[data-tone="green"]{background:#DCFCE7;color:#166534}
.kium-badge[data-tone="red"]  {background:#FEE2E2;color:#B91C1C}
.kium-badge[data-tone="gray"] {background:#F3F4F6;color:#4B5563}
.kium-badge em{font-style:normal;font-weight:800}
```

- 4톤 전건 대비 AA(4.5:1) 이상 — 위 값 기준 충족, 변경 시 실측 재확인
- **레드 계열은 마감임박 전용** — 지면 내 타 요소에 레드 신규 사용 금지
- 아이콘은 `currentColor` 상속(별도 색 지정 금지)

### 2-3. 상태별 CTA 규칙 (전 노출 표면 공통)

| 상태 | CTA | 구현 |
|---|---|---|
| recruiting / confirmed | 「이 일정으로 상담 →」 | 기본 outline 버튼, §5 프리필 링크 |
| closing | 「마감 전 상담 →」 | **강조 filled**(`#DC2626` bg + white, hover 어둡게) — 지면 유일의 filled 레드 |
| closed | CTA 제거 → 텍스트 링크 「다음 회차 상담 ↗」 | `aria-disabled` 버튼 금지, **요소 자체 교체**. §5 경로 B 프리필 |

- closed 행/카드: `opacity:.6` + 썸네일·텍스트 채도 저하(`filter:saturate(.5)` 또는 색 토큰 강등), 날짜 텍스트 취소선 금지(가독 해침) — 흐림으로만 후퇴

---

## STEP 3. 일정 뷰 교체 — 매트릭스 폐기, 듀얼 리스트

### 3-1. 철거

- STEP 0-2에서 확정한 매트릭스 테이블 컴포넌트(과정명/10월/11월/12월 헤더 + sticky 겹침 코드) **완전 제거** — 부분 수정 금지, 헤더 겹침(D1)·필터 붕괴(D2)·빈 열(D3)의 뿌리이므로 교체가 조치다

### 3-2. 필터 바 (기존 유지 + 확장)

- 월 칩(전체·10월·11월·12월, 카운트 병기) 유지 · 카테고리 칩 유지
- **상태 칩 4종 신설**: `전체 n · 모집중 n · 개강확정 n · 마감임박 n · 마감 n` — 각 칩에 SessionBadge와 동일 아이콘 축소 병기, 카운트는 현재 월·카테고리 필터 적용 후 값
- `과정별 | 일정순` 세그먼트 토글 유지 — **기본값을 「일정순」으로 변경**
- 필터 결과 0건: `해당 조건의 회차가 없습니다.` 빈 상태 블록(아이콘 + 문구 + [필터 초기화])

### 3-3. 「일정순」 뷰 — `SessionListView` (신규)

- 월별 그룹 헤더(`── 10월 ──`) + 회차 행 리스트
- 회차 행 구성(좌→우, 모바일은 상→하): ①날짜 블록(`formatSessionRange` — 행에서 가장 크고 진한 요소, `lucide:calendar-days` 병기) ②카테고리 dot-칩 + 과정명 ③메타(시간 `clock` · 가격 `wallet`) ④SessionBadge ⑤CTA(§2-3)
- 그룹 내 정렬: `weight ASC → start ASC` (confirmed·closing 상단, closed 최하단)
- 월 그룹 헤더 우측 보조 링크 「이 시기 교육 상담 →」(§5 경로 C)
- 행은 `<li>` 시맨틱 리스트, 행 전체 클릭은 두지 않음(CTA·과정명만 인터랙티브 — 오클릭 방지)

### 3-4. 「과정별」 뷰 — `CourseListView` (신규)

- 과정 1행: 카테고리 dot-칩 + 과정명 + 메타(시간·일수·가격) + **회차 pill 목록** + [과정 상세 ↓] [과정만 상담 →]
- 회차 pill: `[아이콘] 10.12~13` 형태, SessionBadge와 동일 tone의 연한 배경. 클릭 = 해당 회차 프리필(§5 경로 A). **closed pill은 비클릭**(`<span>`, 흐림 처리 — 취소선 금지)
- [과정 상세 ↓] = 인라인 확장으로 상세 패널(STEP 4-2) 렌더

### 3-5. 반응형

- 매트릭스가 아니므로 가로 스크롤 원천 차단 — PC/TB/MO 모두 세로 리스트, 행 내부만 flex-wrap
- 검수 케이스: 필터 0건/1건/전체 · 상태 4종 단독 필터 각각 · PC/TB/MO 3구간

---

## STEP 4. 과정 소개 카드 + 상세 패널 정비

### 4-1. 카드 구조 단일화 (D4·C1~C4)

- **칩 제거**: 썸네일 위 카테고리 텍스트(C1) · `정부지원 환급`(C3) · `공개교육 개설`(C4) 렌더 코드 제거. `정부지원 환급` 정보는 섹션 상단 3-스탯 카드('정부지원')가 담당 — 카드 개별 렌더는 삭제
- **과정명 1회**: 본문 타이틀 1회만. 전 과정 실사 통일로 썸네일 텍스트 모드 미사용 (`thumbSrc` 전건 세팅 — 4-3)
- **높이 통일**: 과정명 `line-clamp:2` + `min-height:2줄분(≈44.8px = 16px×1.4×2)` / 요약문 `line-clamp:2` + min-height 동일 원칙. **카드 전체 `min-height` 고정 금지**(모바일 1열 하단 여백 결함 재생산 — DF-024 교훈)
- **최근접 회차 배지 신설**: 카드 메타 하단에 미래 회차 중 가장 임박한 1건 `SessionBadge(축소형) + 날짜` 노출. 미래 회차 없으면 `다음 회차 준비 중` 그레이 텍스트
- 그리드: PC 3열 / TB 2열 / MO 1열 · `align-items:stretch`는 다열 구간에만(`@media (min-width:768px)`)

### 4-2. 상세 패널 — 회차 스트립 최상단

정보 순서 재배치: **① 교육일정(회차 카드 스트립) → ② 메타 그리드(대상·시간·정원·방식·가격) → ③ 요약·목표 → ④ 커리큘럼 → ⑤ [이 과정으로 상담하기]**

- 회차 카드(`SessionCard` 신규): 날짜(헤드라인) + SessionBadge + 상태별 CTA(§2-3)
- 회차 2장 이상 모바일: 가로 스크롤 + `scroll-snap-type:x mandatory`, 카드 `scroll-snap-align:start`, 마지막 카드 일부가 잘려 보이는 peek 폭(다음 카드 어포던스)
- 회차 1장: 스트립 아님, 카드 1장 전폭 / 회차 0장: `다음 회차 준비 중 — 과정만 상담이 가능합니다` 안내 + ⑤ CTA만
- ⑤ CTA = §5 경로 B

### 4-3. 실사 썸네일 전건 적용

- 듀얼모드 명세 그대로: `public/images/kium/` · `kium-XX.jpg` · 4:3 · 800×600+ · 300KB 이내 · `thumbSrc` 값 세팅만으로 이미지 모드 전환
- 공개교육 탭 노출 과정 전건 `thumbSrc` 세팅 — Unsplash 실사(카테고리별 키워드: 전략 §4-3), **인물 식별 가능 컷 지양**, 이미지 위 텍스트 합성 금지
- 이미지 자산이 리포에 없을 경우: Unsplash 다운로드 → 4:3 크롭 → 최적화(WebP 변환 허용) 후 커밋. 원격 URL 직결(핫링크) 금지 — `next/image` 미사용 환경 전제로 기존 `Img` 공용 컴포넌트 재사용

### 4-4. 인트로 줄바꿈 (D5)

- 인트로 문단의 `<br>` 하드코딩 제거(존재 시) + 컨테이너 `max-width`를 문장이 자연 줄바꿈되는 폭으로 상향(또는 해제) · `word-break:keep-all` 유지
- 완료 기준: PC 기준 "…1명부터 신청하실 수 있습니다."가 어절 중간·조사 앞 강제 줄바꿈 없이 렌더

---

## STEP 5. 상담폼 프리필 — 3경로 + 마감 가드

### 5-1. 전달 방식

- URL 쿼리: `/kium?consult=1&course={courseId}&session={sessionId}` + 상담폼 앵커 스크롤
- 페이지 로드/쿼리 변경 시 폼 컴포넌트가 쿼리를 읽어 프리필 — **새로고침·링크 공유에도 유지**
- Next.js: `useSearchParams`(client) 사용, 폼이 서버 컴포넌트면 클라이언트 경계 확인

### 5-2. 프리필 동작 (3경로)

| 경로 | 트리거 | 동작 |
|:--:|---|---|
| A | 일정순 행 CTA · 과정별 pill · 상세 회차 카드 CTA | 관심영역 `인재키움` 칩 자동 선택(해제 가능) + 문의내용 **value 주입**(placeholder 금지):<br>`[공개교육 상담 신청]`<br>`· 과정명: {titleMarketing}`<br>`· 희망 회차: {formatSessionRange} ({상태label})`<br>`· 문의 내용: ` |
| B | 「과정만 상담」 · 상세 ⑤ CTA · closed 회차 「다음 회차 상담」 | 동일 + 희망 회차 대신 `· 일정: 협의 희망` (closed 진입 시 `· 마감 회차: {날짜} — 다음 회차 문의`) |
| C | 월 그룹 「이 시기 교육 상담」 | 동일 + `· 희망 시기: {월}월 개강 과정 상담 희망` |

- 문의내용에 기존 사용자 입력이 있으면 **덮어쓰지 않고** 상단에 프리필 블록 삽입 여부 확인 없이 → 프리필 블록을 기존 텍스트 앞에 prepend (유실 zero)
- 폼 상단 확인 배너: `📋 '{과정명} · {회차}' 상담으로 작성 중입니다 [변경]` — [변경] 클릭 시 일정 섹션으로 복귀 스크롤
- 접근성: 프리필 진입 시 포커스를 폼 첫 필드로 이동 + `aria-live="polite"` 영역에 `과정 정보가 입력되었습니다` 1회 안내

### 5-3. 마감 가드

- 쿼리의 `session` 상태가 closed(또는 지난 날짜)면: 배너를 `해당 회차는 마감되었습니다 — 다음 회차 상담으로 접수됩니다`로 전환 + 문의내용은 경로 B(closed) 문안으로 대체
- 존재하지 않는 `course`/`session` id: 프리필 전체 무시(폼 기본 상태) — 콘솔 에러 zero

---

## STEP 6. 아이콘 — Lucide 인라인 SVG

- `@iconify/react` 등 **신규 의존성 추가 금지** — Lucide SVG를 인라인 복사해 `components/…/kiumIcons.tsx` 1파일에 모음(`stroke="currentColor"`, `stroke-width:2`, `viewBox` 유지)
- 적용 맵: calendar-days(일정) · clock(시간) · wallet(가격) · users(대상) · user-check(정원·잔여석) · circle-dashed(모집중) · circle-check(개강확정) · alarm-clock(마감임박) · circle-slash(마감) · arrow-right(CTA) · corner-down-right(다음 회차) · chevron-down(확장) · badge-percent(정부지원 스탯)
- 크기 2단만: 16px(메타) · 14px(배지 내부). 아이콘 단독 사용 금지 — 항상 텍스트 병기, 장식 배치 금지

---

## STEP 7. 상태 쇼케이스 — `?preview=badges` (개발 전용)

- 쿼리 `preview=badges` 감지 시 공개교육 탭 최하단에 `BadgeShowcase` 블록 렌더:
  ① SessionBadge 4종(+ closing 잔여석 변형) ② 일정순 행 4종 ③ 회차 pill 4종(closed 비클릭 포함) ④ SessionCard 4종 ⑤ 마감 가드 배너 — 각 항목에 상태명 캡션
- 가드: `process.env.NODE_ENV !== 'production'` **또는** 쿼리 존재 시에만 렌더하되 프로덕션 노출이 우려되면 env 가드 우선 — 단, 이번 빌드는 Vercel 프리뷰에서 확인해야 하므로 **쿼리 가드만으로 구현**(쿼리 없으면 DOM 자체 미생성). 링크 유출 방지를 위해 사이트 내 어떤 UI에서도 이 쿼리로의 링크를 만들지 않는다
- 목적: 데이터 조작 없이 4종 상태 UI 일괄 확인 · AA 대비 실측 · 회귀 검수 기준 화면

---

## STEP 8. 검증 · 완료 조건 (Done when)

**레이아웃·중복 (P0)**
- [ ] 매트릭스 테이블 코드 제거 — 헤더 겹침·필터 붕괴·빈 열 재현 불가
- [ ] PC/TB/MO 3구간 × 필터(0건·1건·전체·상태 4종 단독) 전수 — 겹침·잘림·가로 스크롤 zero
- [ ] 카드: 과정명 1회 노출 · 카테고리 칩 1개 · `정부지원 환급`/`공개교육 개설` 칩 zero (전역 검색으로 렌더 코드 잔존 0건 확인)
- [ ] 1줄/2줄 과정명 카드 나란히 — 높이 리듬 동일
- [ ] 인트로 문장 자연 줄바꿈

**상태 4종 (P1)**
- [ ] 4종 상태가 4개 표면(일정순 행·pill·상세 스트립·카드 최근접 배지) 전부에서 육안 확인
- [ ] closing CTA filled 강조 / closed CTA가 「다음 회차 상담」으로 교체 + pill 비클릭
- [ ] 배지 4톤 대비 AA 이상 · 그레이스케일에서도 아이콘·텍스트로 4종 판별 가능
- [ ] 지난 날짜 회차 자동 closed 처리

**프리필 (P1)**
- [ ] 3경로 전건: 관심영역 자동 선택 + 문의내용 value 주입 + 확인 배너
- [ ] 프리필 URL 새로고침·직접 진입 시 유지 / 잘못된 id 시 무시·에러 zero
- [ ] closed session 쿼리 진입 시 마감 가드 배너 전환
- [ ] 기존 입력 텍스트 유실 zero(prepend 확인)

**품질 공통**
- [ ] `npm run build` 경고 0건
- [ ] 사업소개·과정안내 탭 및 타 페이지(`/`, `/ax-ai`, `/leadership`, `/hrd`, `/content`) 픽셀 회귀 zero — 변경 파일 목록에 해당 범위 파일이 없는 것으로 1차 증명
- [ ] `?preview=badges` 쇼케이스 렌더 · 쿼리 없으면 DOM 미생성
- [ ] 작업 전 백업 태그 생성(`git tag backup/kium-open-YYYYMMDD-HHmm`) → 완료 후 커밋·푸시 → Vercel 배포 완료 확인 → 배포 URL에서 완료 조건 재확인(로컬 아닌 배포본 기준)

**완료 보고 양식**: ①STEP 0 진단 매핑표 ②변경 파일 목록(신규/수정/삭제) ③완료 조건 체크 결과표 ④배포 URL + `?preview=badges` URL ⑤PC·MO 스크린샷(일정순 뷰 · 카드 그리드 · 상세 스트립 · 프리필 폼 · 쇼케이스 각 1장)
