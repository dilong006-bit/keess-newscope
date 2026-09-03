# KEESS 인재키움 프리미엄 — '공개교육' 탭 신설 기술명세서 v1.1

- **작성일**: 2026-09-03 (v1.1 개정 동일자)
- **개정 이력**: v1.0 최초 · **v1.1** — 원본 일정표 대조 완료(C2 종결) / FAQ를 기존 목록 통합 + 칩 방식으로 확정(§4-3·§5-7-1) / `status` 추정 사실 명시(C8) / FAQ 문안 보완 항목 신설(C9)
- **대상 저장소**: `KEESS_NEWSCOPE` (Next.js App Router · SSG)
- **대상 페이지**: `/kium` — 3번째 탭 `#open` 신설 + 기존 자산 최소 개정
- **문서 지위**: 본 건 구현의 **단일 기준**. 선행 UI/UX 전략 v1.0·v2.0을 구현 계약으로 확정한다.
- **선행 문서**: `ref/kium/spec/KEESS_G2-01-02_인재키움프리미엄_기술명세서_최종_v2.0_260805.md`, `…_upgrade-05_260806.md`, `KEESS_인재키움프리미엄_썸네일듀얼모드_기술명세서_v1.0_260807.md`
- **코드 그라운딩**: 2026-09-03 실제 저장소 실사 완료. 본 문서의 파일 경로·컴포넌트명·props·클래스명·토큰은 **전부 실제 코드에서 확인된 값**이다.

---

## 0. 실사로 확정된 사실 (추측 아님)

| 항목 | 실측 결과 | 영향 |
| --- | --- | --- |
| 상담 폼 위치 | **`/kium` 페이지 내부** — `app/kium/page.tsx`의 `.kium-cta-band > <HomeInquiry/>`, 앵커 `#inq` | 프리필은 **같은 페이지 스크롤**. 별도 라우트 이동 불필요 |
| 프리필 기반 | `lib/kium/inquiryBridge.ts` + `HomeInquiry`의 `prefillEventName` 구독 **이미 존재** | 확장만 하면 됨 (신규 아키텍처 0) |
| 관심 영역 프리셀렉트 | `/kium`이 이미 `presetInterests={['gov']}` `presetInterestSubs={['인재키움']}` 전달 중 | **요구 ③의 절반은 이미 구현돼 있음** |
| `INQ.trainees` 옵션 | `none(해당없음) / lte50(~ 50명) / lte100 / lte500 / lte1000 / gt1000` | **1~9명 옵션 부재 → 신규 옵션 1개 추가 필요 (§5-9)** |
| 탭 컴포넌트 | `KiumTabs`가 `TABS` 상수 2건을 map — 3건으로 확장 시 인디케이터·패널 자동 대응 | 구조 개편 0 |
| **탭 해시 잠재 결함** | `indexFromHash()`가 미등록 해시(`#inq` 등)에 **0(사업소개) 폴백** → `#inq` 앵커 클릭 시 탭이 튐 | **§5-8에서 반드시 수정.** 공개교육 탭의 CTA가 `#inq`를 쓰므로 방치 시 즉시 발현 |
| 과정 데이터 | `KIUM_COURSES` 19건, id `kium-01`~`kium-19`, 카테고리 7종 | 공개교육 9과정 id 확정(부록 B) |
| 디자인 토큰 | `app/globals.css :root` — `--p1 #2E1A6B` `--p2 #E91E63` `--p3 #8B27A8` `--p4 #F58220` `--gov #F4B83A` `--notice #E5342B` `--surface #F3F5F8` `--line #E6E8EC` `--muted #54585f` `--ink #14141A` `--r 20px` `--ease` `--shadow-1~3` | **신규 색 토큰 발명 금지**. 상태 배지는 이 토큰 파생으로 구성 |
| 기존 그리드 BP | `.kium-grid` 3열 → `max-width:1000px` 2열 → `max-width:767px` 1열 | 일정 뷰 BP를 여기에 **정렬**시킨다 |
| 모바일 시트 분기 | `SHEET_MQ = '(max-width:767px)'` | 동일 상수 재사용 |

---

## 1. 확정 요구사항

| ID | 요구사항 | 근거 |
| --- | --- | --- |
| OP-01 | `/kium` 상단 탭에 **'공개교육'** 3번째 탭(`#open`) 신설 | 요청 [1] |
| OP-02 | 페이지 타이틀 = `소수 인원도 부담 없이, 필요한 교육에 바로 참여하세요` (원문 고정) | 요청 [2]-1 |
| OP-03 | 10~12월 회차 일정 노출. **반응형 최적화가 핵심 과제** | 요청 [2]-2 |
| OP-04 | 회차별 모집 상태 배지 **4단계**(모집중/개강확정/마감임박/마감) | 요청 시안 + 확정 |
| OP-05 | 공개교육 **9과정만** 카탈로그 노출 (기존 카드 재사용) | 요청 시안 칩 개수 |
| OP-06 | **기존 `#courses` 탭** 상세 패널에 `교육일정` 행 추가 (9과정 한정) | 요청 [2]-3 |
| OP-07 | **기존 FAQ 목록에 2문항 추가** + `공개교육` 칩 표기. 공개교육 탭에서는 태그된 2문항만 필터 노출 (문안 원문 고정) | 요청 [3] + 사업 확정(9/3) |
| OP-08 | 기존 상담 폼 재사용. **신규 수집 필드·동의 구조 변경 0** | 요청 본문 |
| OP-09 | 20개 회차 동시 오픈 | 요청 본문 |
| OP-10 | 일정 하단 캡션 `※ 상기 일정은 운영 상황에 따라 변동될 수 있습니다.` (원문 고정) | 요청 표 각주 |
| **OP-11** | **교육비 노출** — 1인 단가 기준 | 추가 요청(9/3) |
| **OP-12** | 회차 클릭 → 폼 **자동 입력 + 셀렉트 선택 상태로 진입** | 추가 요청(9/3) |

### 1-1. 선행 명세 금지사항의 개정

기존 기술명세서 최종 v2.0 §6-5 「**단가·강사·NCS·환급 소요기간 노출 금지**」 중 **단가 조항을 공개교육 9과정에 한해 해제**한다(OP-11). 나머지(강사·NCS·환급 소요기간)와 위탁 10과정의 단가 비노출은 **그대로 유지**한다.

---

## 2. IA · 라우팅

```
/kium
 ├─ #intro    사업소개   (무변경)
 ├─ #courses  과정안내   (상세 패널 2행 추가 · 카드 배지 1종 추가)
 └─ #open     공개교육   ★ 신설
      ?course=<kium-id>&round=<sessionId>   회차 딥링크
      ?apply=1                              폼까지 바로 이동
      #inq                                  상담 폼 앵커(기존)
```

- 신규 라우트 **0건**. `app/kium/page.tsx` 단일 페이지 내 탭 추가
- `?cat=` (기존 과정 필터)와 충돌 없음 — 네임스페이스가 다르다
- 쿼리에는 **표현 상태만** 싣는다. 개인정보·식별자 금지

---

## 3. 신규/개정 파일 목록

### 3-1. 신규 (기존 코드 영향 0)

| 파일 | 역할 |
| --- | --- |
| `lib/kium/sessions.ts` | 회차 데이터 20건 + 타입 + 파생 쿼리 |
| `lib/kium/pricing.ts` | 교육비 9건 + 표기 유틸 |
| `lib/kium/openBridge.ts` | 회차 → 상담 폼 프리필 브리지 |
| `components/kium/KiumOpenTab.tsx` | 공개교육 탭 루트 (상태·딥링크 오케스트레이션) |
| `components/kium/KiumOpenHero.tsx` | 타이틀 + 신뢰 지표 3종 + 가장 빠른 개강 |
| `components/kium/KiumSchedule.tsx` | 필터 + 보기 전환 + 매트릭스/리스트 스위치 |
| `components/kium/KiumScheduleMatrix.tsx` | 과정별 매트릭스 (≥1024) |
| `components/kium/KiumScheduleList.tsx` | 일정순 리스트 (<1024) |
| `components/kium/KiumSessionStatus.tsx` | 상태 배지 4종 |
| `components/kium/KiumApplySummary.tsx` | 폼 상단 신청 요약 배너 |
| `styles/kium-open.css` | 공개교육 전용 CSS (기존 토큰만) |

### 3-2. 개정

| 파일 | 변경 | 위험 |
| --- | --- | --- |
| `app/kium/page.tsx` | 탭 3번째 패널 주입 · `kium-open.css` import · 요약 배너 배치 | 낮음 |
| `components/kium/KiumTabs.tsx` | `TABS` 3건화 + **해시 폴백 결함 수정** | 낮음 |
| `components/kium/KiumCourseCard.tsx` | `공개교육 개설` 배지 조건부 1종 | 낮음 |
| `components/kium/KiumCoursePanel.tsx` | 메타 pill에 `교육일정`·`교육비` 조건부 2종 | 낮음 |
| `components/kium/KiumFaq.tsx` | `items` prop 주입 + `공개교육` 칩 렌더 | 낮음 |
| `lib/kium/content.ts` | `faq` 2문항 추가(`tag`) + `open` 블록 추가 | 낮음 |
| `lib/kium/inquiryBridge.ts` | 프리필 토큰 정규식 확장 | 낮음 |
| `components/sections/home/HomeInquiry.tsx` | 프리필 이벤트 detail에 `trainees` 수용 (**4줄**) | **중간 — 회귀 테스트 필수** |
| `data/home.ts` | `INQ.trainees`에 `lte9` 옵션 1개 추가 | **중간 — 회귀 테스트 필수** |

> **`HomeInquiry`와 `data/home.ts`가 유일한 고위험 지점이다.** 이 폼은 사이트 전체 문의를 받는다. 변경은 위 범위를 넘지 말고, §12 회귀 항목을 반드시 통과시킨다.

---

## 4. 데이터 모델

### 4-1. `lib/kium/sessions.ts` (신규 · 전문)

```ts
import { KIUM_COURSES, type KiumCourse } from './data';

/**
 * 공개교육 회차 데이터 — 요청 원문 「※공개교육 일자※」 표(260903) 1:1.
 * 규칙: 이 파일의 일자는 요청 원문 외 수정 금지. 요일 표기는 저장하지 않고 startDate에서 파생한다
 *       (요일 오기를 구조적으로 불가능하게 만든다 — 원문 표에서 실제 1건 발견됨).
 */
export type KiumSessionStatus = 'open' | 'confirmed' | 'closing' | 'closed';

export type KiumSession = {
  /** 딥링크 키 */
  id: string;
  /** KIUM_COURSES.id 참조 — 과정 메타는 전부 조인해서 쓴다(중복 저장 금지) */
  courseId: string;
  /** 일정표 열 배치 기준월. 11/30~12/1 회차는 12(사업부 원안 준수) */
  displayMonth: 10 | 11 | 12;
  /** 정렬·과거 판정의 단일 기준 (ISO). tbd인 경우 빈 문자열 */
  startDate: string;
  endDate: string;
  status: KiumSessionStatus;
  /** 일자 미확정(사업부 회신 대기). true면 리스트·집계에서 제외하고 매트릭스에서만 비활성 렌더 */
  tbd?: boolean;
};

/**
 * ⚠ status 20건은 **사업부 회신 전 추정값**이다(요청 시안 캡처 기준).
 *   시안은 레이아웃 예시로 판정된 자료이므로 이 필드는 원문 근거가 없다.
 *   오픈 전 실제 모집 상태를 회신받아 전건 교체할 것. 전건 'open'도 유효한 확정안이다.
 */
export const KIUM_SESSIONS: KiumSession[] = [
  // AI활용 — 업무효율화: Agent (kium-09)
  { id: 'agent-r1',  courseId: 'kium-09', displayMonth: 10, startDate: '2026-10-12', endDate: '2026-10-13', status: 'confirmed' },
  { id: 'agent-r2',  courseId: 'kium-09', displayMonth: 11, startDate: '2026-11-02', endDate: '2026-11-03', status: 'open' },
  { id: 'agent-r3',  courseId: 'kium-09', displayMonth: 12, startDate: '2026-11-30', endDate: '2026-12-01', status: 'open' },
  // AI활용 — 업무효율화: Data (kium-10)
  { id: 'data-r1',   courseId: 'kium-10', displayMonth: 10, startDate: '2026-10-14', endDate: '2026-10-15', status: 'confirmed' },
  { id: 'data-r2',   courseId: 'kium-10', displayMonth: 11, startDate: '2026-11-09', endDate: '2026-11-10', status: 'open' },
  { id: 'data-r3',   courseId: 'kium-10', displayMonth: 12, startDate: '2026-12-07', endDate: '2026-12-08', status: 'open' },
  // AI활용 — AI 직무전문화 (kium-11)
  { id: 'aijob-r1',  courseId: 'kium-11', displayMonth: 10, startDate: '2026-10-19', endDate: '2026-10-20', status: 'open' },
  { id: 'aijob-r2',  courseId: 'kium-11', displayMonth: 11, startDate: '2026-11-16', endDate: '2026-11-17', status: 'open' },
  { id: 'aijob-r3',  courseId: 'kium-11', displayMonth: 12, startDate: '2026-12-14', endDate: '2026-12-15', status: 'open' },
  // 비즈니스 역량 — 전략적 비즈니스 협상 스킬 (kium-12)
  { id: 'nego-r1',   courseId: 'kium-12', displayMonth: 10, startDate: '2026-10-27', endDate: '2026-10-27', status: 'confirmed' },
  // 비즈니스 역량 — 스피치&프레젠테이션 클리닉 (kium-13)
  { id: 'speech-r1', courseId: 'kium-13', displayMonth: 11, startDate: '2026-11-12', endDate: '2026-11-13', status: 'open' },
  // 비즈니스 역량 — 인정받는 직장인의 구두보고 스킬 (kium-14)
  { id: 'report-r1', courseId: 'kium-14', displayMonth: 12, startDate: '2026-12-11', endDate: '2026-12-11', status: 'open' },
  // CS·민원응대 — CS 종합 솔루션 (kium-19)
  { id: 'cs-r1',     courseId: 'kium-19', displayMonth: 10, startDate: '2026-10-26', endDate: '2026-10-26', status: 'open' },
  { id: 'cs-r2',     courseId: 'kium-19', displayMonth: 11, startDate: '2026-11-17', endDate: '2026-11-17', status: 'open' },
  { id: 'cs-r3',     courseId: 'kium-19', displayMonth: 12, startDate: '2026-12-21', endDate: '2026-12-21', status: 'open' },
  // 리더십·관리자 — 진단 기반 팀장 리더십 Re-Lead (kium-04)
  { id: 'relead-r1', courseId: 'kium-04', displayMonth: 10, startDate: '2026-10-21', endDate: '2026-10-22', status: 'open' },
  { id: 'relead-r2', courseId: 'kium-04', displayMonth: 11, startDate: '2026-11-18', endDate: '2026-11-19', status: 'open' },
  // ⚠ 원문 표기 `12/17(수)~18(금`이 실제 달력과 불일치(2026-12-17=목). 사업부 회신 전까지 tbd.
  { id: 'relead-r3', courseId: 'kium-04', displayMonth: 12, startDate: '', endDate: '', status: 'open', tbd: true },
  // 신입·온보딩 — On-Powering 리텐션 (kium-03)
  { id: 'onpow-r1',  courseId: 'kium-03', displayMonth: 12, startDate: '2026-12-09', endDate: '2026-12-10', status: 'open' },
  { id: 'onpow-r2',  courseId: 'kium-03', displayMonth: 12, startDate: '2026-12-16', endDate: '2026-12-17', status: 'open' },
];

/** 공개교육 개설 과정 id — KIUM_SESSIONS에서 파생(수기 목록 금지) */
export const KIUM_OPEN_COURSE_IDS: string[] = Array.from(
  new Set(KIUM_SESSIONS.map((s) => s.courseId))
);

export function isOpenCourse(courseId: string): boolean {
  return KIUM_OPEN_COURSE_IDS.includes(courseId);
}

/** 공개교육 9과정 — KIUM_COURSES 기존 정렬(카테고리 order → 연번) 유지 */
export function getOpenCourses(): KiumCourse[] {
  return KIUM_COURSES.filter((c) => isOpenCourse(c.id));
}

/** 일자 확정 회차만 (집계·리스트·정렬의 기준) */
export function getDatedSessions(): KiumSession[] {
  return KIUM_SESSIONS.filter((s) => !s.tbd);
}

/** 특정 과정 + 특정 월의 회차 (매트릭스 셀) — tbd 포함 */
export function getSessionsOf(courseId: string, month: 10 | 11 | 12): KiumSession[] {
  return KIUM_SESSIONS.filter((s) => s.courseId === courseId && s.displayMonth === month);
}

/** 시작일 오름차순 (리스트 뷰) */
export function getSessionsByDate(): KiumSession[] {
  return [...getDatedSessions()].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function getSessionById(id: string): KiumSession | undefined {
  return KIUM_SESSIONS.find((s) => s.id === id);
}

export function countByMonth(month: 10 | 11 | 12): number {
  return getDatedSessions().filter((s) => s.displayMonth === month).length;
}

/** 총 회차 수 — 히어로 지표. 수기 숫자 금지 */
export const KIUM_SESSION_TOTAL = getDatedSessions().length;

/* ── 표기 유틸 — 요일은 전부 여기서 파생한다 ───────────────────────── */
const DOW = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 'YYYY-MM-DD' → Date. 타임존 영향 없이 로컬 자정으로 고정 */
function toDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** '10.12(월)' */
export function fmtDay(iso: string): string {
  const d = toDate(iso);
  return `${d.getMonth() + 1}.${d.getDate()}(${DOW[d.getDay()]})`;
}

/** 1일: '10.12(월)' / 2일: '10.12(월) ~ 13(화)' / 월 경계: '11.30(월) ~ 12.1(화)' */
export function fmtRange(s: KiumSession): string {
  if (s.tbd) return '일정 조율 중';
  const a = toDate(s.startDate);
  const b = toDate(s.endDate);
  const head = fmtDay(s.startDate);
  if (s.startDate === s.endDate) return head;
  const tail =
    a.getMonth() === b.getMonth()
      ? `${b.getDate()}(${DOW[b.getDay()]})`
      : `${b.getMonth() + 1}.${b.getDate()}(${DOW[b.getDay()]})`;
  return `${head} ~ ${tail}`;
}

/** 스크린리더용 완전 표기 — '2026년 10월 12일 월요일부터 10월 13일 화요일까지' */
export function fmtRangeA11y(s: KiumSession): string {
  if (s.tbd) return '일정 조율 중';
  const a = toDate(s.startDate);
  const b = toDate(s.endDate);
  const one = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 ${DOW[d.getDay()]}요일`;
  return s.startDate === s.endDate
    ? `${a.getFullYear()}년 ${one(a)}`
    : `${a.getFullYear()}년 ${one(a)}부터 ${one(b)}까지`;
}

/** 프리필용 — '2026.10.12 월 ~ 10.13 화' */
export function fmtRangePrefill(s: KiumSession): string {
  if (s.tbd) return '일정 조율 중';
  const a = toDate(s.startDate);
  const b = toDate(s.endDate);
  const head = `${a.getFullYear()}.${a.getMonth() + 1}.${a.getDate()} ${DOW[a.getDay()]}`;
  if (s.startDate === s.endDate) return head;
  return `${head} ~ ${b.getMonth() + 1}.${b.getDate()} ${DOW[b.getDay()]}`;
}

/** 종료일이 오늘 이전인가 — 클라이언트 마운트 후에만 호출할 것(§8 SSG 규칙) */
export function isPast(s: KiumSession, now: Date = new Date()): boolean {
  if (s.tbd) return false;
  const end = toDate(s.endDate);
  end.setHours(23, 59, 59, 999);
  return end.getTime() < now.getTime();
}
```

### 4-2. `lib/kium/pricing.ts` (신규 · 전문)

```ts
/**
 * 공개교육 교육비 — 원천: 「2026_인재키움프리미엄_훈련과정_260804_HRD솔루션팀.xlsx」
 *   시트 「2. 신청 훈련과정 정보」 · **N열 훈련비 단가(원) = 1인 기준**
 *
 * ※ O열(총 훈련비)은 N열 × M열(훈련인원)로 계산된 과정 총액이므로 개인 신청 화면에 쓰지 않는다.
 * ※ 이 파일의 금액은 원천 외 수정 금지. 임의 산출·환산·할인 표기 금지.
 */
export const KIUM_PRICES: Record<string, number> = {
  'kium-03': 400000, // On-Powering 리텐션 과정
  'kium-04': 400000, // 진단 기반 팀장 리더십 Re-Lead 과정
  'kium-09': 700000, // 업무효율화: Agent 과정
  'kium-10': 700000, // 업무효율화: Data 과정
  'kium-11': 700000, // AI 직무전문화 과정
  'kium-12': 400000, // 전략적 비즈니스 협상 스킬 과정
  'kium-13': 400000, // 스피치&프레젠테이션 클리닉 과정
  'kium-14': 400000, // 인정받는 직장인의 구두보고 스킬
  'kium-19': 250000, // CS 종합 솔루션 과정
};

/**
 * 가격 표기 게이트 — content.ts facts 게이트와 같은 사상.
 * VAT 포함/별도, 환급 전/후 표기가 사업부 회신으로 확정되기 전에는 false로 두고,
 * 화면은 금액 대신 PRICE_FALLBACK을 노출한다. 부분 노출로 금액을 오해시키지 않는다.
 */
export const KIUM_PRICE_VERIFIED = true;

/** 금액 옆 각주 — VAT 표기 확정 시 이 상수만 교체한다(컴포넌트 수정 0) */
export const KIUM_PRICE_NOTE = '1인 기준';

export const PRICE_FALLBACK = '비용은 상담 시 안내';

export function getPrice(courseId: string): number | undefined {
  return KIUM_PRICES[courseId];
}

/** '700,000원' — 미검증·미등록이면 대체 문구 */
export function fmtPrice(courseId: string): string {
  const p = getPrice(courseId);
  if (!KIUM_PRICE_VERIFIED || p === undefined) return PRICE_FALLBACK;
  return `${p.toLocaleString('ko-KR')}원`;
}
```

### 4-3. `lib/kium/content.ts` — `open` 블록 추가

`KIUM_CONTENT` 객체 안, `leadSource` 앞에 아래 블록을 추가한다. **기존 필드는 한 글자도 수정하지 않는다.**

```ts
  // 공개교육 탭 — 요청 원문(260903) 고정. 창작·윤문 금지
  open: {
    tabLabel: '공개교육',
    eyebrow: '공개교육',
    title: '소수 인원도 부담 없이, 필요한 교육에 바로 참여하세요',
    sub: '정기 공개교육은 여러 기업의 신청을 한 회차로 모아 개설합니다. 1명부터 신청하실 수 있습니다.',
    scheduleHeading: '10~12월 일정 한눈에 보기',
    // 원문 각주 — 수정 금지
    scheduleCaption: '※ 상기 일정은 운영 상황에 따라 변동될 수 있습니다.',
    coursesHeading: '과정 소개',
    faqHeading: '자주 묻는 질문',
    /** FAQ 태그 값 — 기존 faq 배열에서 공개교육 문항을 골라내는 단일 키 */
    faqTag: '공개교육',
  },
```

**② 기존 `faq` 배열에 2문항 추가 (요청 [3] 원문 · 수정 금지)**

FAQ는 **배열을 나누지 않는다.** 기존 7문항 배열에 2문항을 추가하고 `tag`로 구분한다. 문안이 한 곳에만 존재해야 사업소개 탭과 공개교육 탭의 답이 어긋나지 않는다.

먼저 타입에 선택 필드를 추가한다.

```ts
export type FaqStatus = 'draft' | 'confirmed'
export type FaqTag = '공개교육'      // ← 신규
```

기존 `faq` 배열의 **2번째 항목('직원 개인이 직접 신청할 수 있나요?') 바로 뒤**에 아래 2건을 삽입한다.

```ts
    {
      status: 'confirmed' as FaqStatus,
      tag: '공개교육' as FaqTag,
      q: '한 회사에서 1명만 신청해도 되나요?',
      a: '네. 정기 공개교육은 기업별로 많은 인원을 모집하기 어려운 경우에도 참여할 수 있도록 운영됩니다. 1명부터 소수 인원까지 신청 가능하며, 원하는 과정과 일정을 선택하여 참여할 수 있습니다.',
    },
    {
      status: 'confirmed' as FaqStatus,
      tag: '공개교육' as FaqTag,
      q: '신청자가 적어도 교육은 진행되나요?',
      a: '공개교육은 과정별 최소 개강인원 충족 시 최종 개강됩니다. 최소 인원에 미달할 경우 교육 일정 변경 또는 다음 회차 참여에 대해 사전에 안내드립니다. 10~12월 동일 과정이 반복 개설되므로 다른 회차로 변경하여 참여할 수 있습니다.',
    },
```

> **삽입 위치가 설계 요소다.** 기존 2번 문항은 "개인 자격의 신청·결제는 지원되지 않습니다"이고, 새 문항은 "1명부터 신청 가능"이다. 두 문장은 실무적으로 모순이 아니지만(신청 주체는 어느 쪽도 기업), **떨어져 있으면 모순으로, 붙어 있으면 보완 설명으로 읽힌다.** 목록 끝에 붙이지 말 것.
>
> 기존 7문항은 전건 `status:'draft'`(검수 대기)이고, 신규 2문항은 사업부 제공 원문이므로 `'confirmed'`로 둔다.

**③ `getOpenFaq()` — 공개교육 탭용 필터**

```ts
// lib/kium/queries.ts 에 추가
import { KIUM_CONTENT } from './content';

/** 공개교육 태그가 붙은 문항만. 배열을 복제하지 않고 참조만 거른다 */
export function getOpenFaq() {
  return KIUM_CONTENT.faq.filter((f) => 'tag' in f && f.tag === KIUM_CONTENT.open.faqTag);
}
```

---

## 5. 컴포넌트 명세

### 5-1. `KiumOpenTab` (신규 · 탭 루트)

```tsx
'use client';
interface Props { }   // 데이터는 전부 lib에서 조회
```

**책임**

1. 필터 상태(`month` / `cat` / `confirmedOnly`)와 보기 상태(`view`)를 보유
2. URL 쿼리 동기화 — `?view=` `?month=` (`history.replaceState`, 뒤로가기 스택 미오염 — `KiumCourseGrid`의 `changeCat`과 동일 패턴)
3. 딥링크 처리(§7-4)
4. `KiumOpenHero` / `KiumSchedule` / 과정 소개(`KiumCourseGrid` 재사용) / FAQ(`KiumFaq` 재사용 — §5-7-1) 조립

**상태 초기값**

| 상태 | 초기값 | 비고 |
| --- | --- | --- |
| `month` | `'all'` | |
| `cat` | `'all'` | 과정 소개 섹션의 필터와 **공유하지 않는다** (혼란 방지 — 일정 필터와 카탈로그 필터를 분리) |
| `confirmedOnly` | `false` | |
| `view` | **마운트 후** `window.matchMedia('(min-width:1024px)').matches ? 'course' : 'date'` | 서버 렌더 시에는 `'date'` 고정 → §8 하이드레이션 규칙 |
| `showPast` | `false` | |
| `now` | `null` → 마운트 후 `new Date()` | 과거 회차 판정용 |

### 5-2. `KiumOpenHero` (신규)

```
[공개교육]                                     ← .kium-eyebrow-chip 재사용
소수 인원도 부담 없이, 필요한 교육에 바로 참여하세요   ← .kium-sec-title 재사용
정기 공개교육은 여러 기업의 신청을 한 회차로 모아…   ← .kium-sec-sub 재사용

┌──────────┬──────────────┬──────────────┐   ← .kium-open-stats (신규)
│ 1명부터   │ 10~12월       │ 정부지원      │
│ 신청 가능 │ 19개 회차     │ 환급 과정     │
└──────────┴──────────────┴──────────────┘

▸ 가장 빠른 개강 · 10.12(월) 업무효율화: Agent 과정  [신청하기]  ← .kium-open-next (신규)
```

| 항목 | 규칙 |
| --- | --- |
| 회차 수 | `KIUM_SESSION_TOTAL` 사용. **수기 숫자 금지** (tbd 회차는 제외되므로 19로 렌더됨) |
| '정부지원 환급 과정' | `getFact('supportRate').verified`가 true일 때만 렌더. false면 이 타일 자체를 제외하고 2칸 그리드로 축소 |
| 가장 빠른 개강 | 마운트 후 `getSessionsByDate().find(s => !isPast(s, now))`. `now`가 `null`(서버·마운트 전)이면 **이 줄 전체 미렌더** |
| 클릭 | 해당 회차로 §7 신청 플로우 실행 |

### 5-3. `KiumSchedule` (신규 · 필터 + 보기 전환)

```tsx
interface Props {
  sessions: KiumSession[];          // 필터 적용 후
  view: 'course' | 'date';
  onView: (v: 'course' | 'date') => void;
  month: 'all' | 10 | 11 | 12;
  onMonth: (m: 'all' | 10 | 11 | 12) => void;
  cat: 'all' | KiumCategory;
  onCat: (c: 'all' | KiumCategory) => void;
  confirmedOnly: boolean;
  onConfirmedOnly: (b: boolean) => void;
  now: Date | null;
  onApply: (s: KiumSession) => void;
}
```

**필터 바** — 기존 `.kium-filters` / `.kium-chip` 클래스 그대로 재사용

| 필터 | 옵션 | 마크업 |
| --- | --- | --- |
| 월 | 전체 / 10월 / 11월 / 12월 (각 회차 수 `.cnt` 병기) | `.kium-chip` + `aria-pressed` |
| 카테고리 | 전체 9 / AI활용 3 / 비즈니스 역량 3 / 리더십·관리자 1 / 신입·온보딩 1 / CS·민원응대 1 | `.kium-chip` + `aria-pressed` |
| 개강확정만 | 토글 | `.kium-chip` + `aria-pressed` |

**보기 전환 세그먼트**

```html
<div class="kium-viewseg" role="radiogroup" aria-label="일정 보기 방식">
  <button type="button" role="radio" aria-checked="true"  class="kium-viewseg-btn">과정별</button>
  <button type="button" role="radio" aria-checked="false" class="kium-viewseg-btn">일정순</button>
</div>
```

- `role="tablist"` 아님 — 콘텐츠가 아니라 **표현**이 바뀐다
- 좌우 화살표로 이동 가능, `tabIndex`는 선택된 항목만 `0`
- 전환은 크로스페이드 120ms. `prefers-reduced-motion` 시 0ms

**결과 0건**

```html
<p class="kium-empty">선택하신 조건에 맞는 회차가 없습니다.</p>
<button type="button" class="kium-chip">전체 회차 보기</button>
<!-- 인접 대안: 회차가 가장 많은 월을 안내 -->
<p class="kium-caption soft">11월에는 6개 회차가 열려 있습니다.</p>
```

**필터 결과 고지**: `<p class="kium-count" aria-live="polite">{n}개 회차</p>` — 기존 `.kium-count` 재사용

**캡션**: 일정 영역 하단에 `KIUM_CONTENT.open.scheduleCaption`을 `.kium-caption`으로 1회 렌더

### 5-4. `KiumScheduleMatrix` (신규 · ≥1024)

**시맨틱은 반드시 실제 `<table>`.** `role="grid"` 사용 금지.

```html
<div class="kium-mtx-wrap">
  <table class="kium-mtx">
    <caption class="kium-sr">10~12월 공개교육 개강 일정. 과정별로 월 회차를 표시합니다.</caption>
    <thead>
      <tr>
        <th scope="col">과정명</th>
        <th scope="col">10월</th><th scope="col">11월</th><th scope="col">12월</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row" class="kium-mtx-course">
          <span class="kium-lab cat" data-cat="ai"><span class="kium-dot" aria-hidden="true"></span>AI활용</span>
          <span class="kium-mtx-title">업무효율화: Agent 과정</span>
          <span class="kium-mtx-meta"><b>14</b>시간 · <b>2</b>일</span>
          <span class="kium-mtx-price num">700,000원 <i>1인 기준</i></span>
        </th>
        <td class="kium-mtx-cell">
          <button type="button" class="kium-ses" data-status="confirmed" aria-label="…">
            <span class="kium-ses-date">10.12(월) ~ 13(화)</span>
            <span class="kium-badge st" data-st="confirmed">개강확정</span>
          </button>
        </td>
        <td class="kium-mtx-cell is-empty"><span class="kium-sr">해당 월 개설 없음</span></td>
        …
      </tr>
    </tbody>
  </table>
</div>
```

| 규칙 | 내용 |
| --- | --- |
| **교육비 위치** | **행 헤더(`th[scope=row]`)**. 셀에 넣지 않는다 — 가격은 과정 단위 속성이며, 셀에 넣으면 3회 반복되고 셀이 과밀해진다 |
| 빈 셀 | `"-"` 문자 **렌더 금지**. `.is-empty` 배경 톤다운 + `.kium-sr` 텍스트만 |
| 다회차 셀 | `.kium-ses` 버튼 2개 세로 적층 (On-Powering 12월) |
| tbd 셀 | `<span class="kium-ses is-tbd">일정 조율 중</span>` — 버튼 아님, 클릭 불가 |
| 마감 셀 | `<button disabled>` + `aria-disabled` 대신 **활성 버튼 유지**하고 클릭 시 대안 안내(§7-3). `disabled`는 포커스를 못 받아 스크린리더가 존재를 놓친다 |
| 헤더 sticky | `thead th { position: sticky; top: <nav 72 + tabbar 높이>; }` — `KiumCourseGrid.stickyBottom()`과 같은 계산을 CSS 변수로 주입 |
| 셀 최소 높이 | 72px |

**셀 접근명 (필수 형식)**

```
`${titleMarketing}, ${displayMonth}월 회차, ${fmtRangeA11y(s)}, ${days}일 과정, ${fmtPrice(courseId)}, ${상태라벨}, 신청하기`
```

### 5-5. `KiumScheduleList` (신규 · <1024)

```html
<section class="kium-list" aria-label="일정순 회차 목록">
  <h3 class="kium-list-mh" id="m-10">10월 <span class="cnt">6개 회차</span></h3>
  <ul class="kium-list-ul" aria-labelledby="m-10">
    <li class="kium-scard" data-status="confirmed">
      <p class="kium-scard-date">10.12(월) ~ 13(화) <span class="kium-scard-days">2일</span></p>
      <p class="kium-lab cat" data-cat="ai"><span class="kium-dot" aria-hidden="true"></span>AI활용</p>
      <p class="kium-scard-title">업무효율화: Agent 과정</p>
      <p class="kium-scard-meta"><b>14</b>시간 · <span class="num">700,000원</span> <i>1인 기준</i></p>
      <div class="kium-scard-foot">
        <span class="kium-badge st" data-st="confirmed">개강확정</span>
        <button type="button" class="btn btn-ink kium-scard-cta" aria-label="…">신청하기</button>
      </div>
    </li>
  </ul>
</section>
```

| 규칙 | 내용 |
| --- | --- |
| 정렬 | `getSessionsByDate()` — 시작일 오름차순, 월 단위 그룹 |
| **날짜가 최상단·최대 위계** | 과정명보다 크게. 이 순서가 뒤집히면 매트릭스의 열화판이 된다 |
| 월 헤더 | `position: sticky` + 회차 수 병기 |
| 지난 회차 | 기본 숨김. `<button class="kium-chip">지난 회차 {n}건 보기</button>`로 펼침. `now === null`이면 숨김 처리 자체를 하지 않는다 |
| tbd | 리스트에서 **제외** (일자가 없어 정렬 위치가 없다) |
| 카드 CTA | 44px 이상 |

### 5-6. `KiumSessionStatus` (신규 · 배지)

```tsx
export const STATUS_LABEL: Record<KiumSessionStatus, string> = {
  open: '모집중', confirmed: '개강확정', closing: '마감임박', closed: '마감',
};
```

```html
<span class="kium-badge st" data-st="confirmed">개강확정</span>
```

- 기존 `.kium-badge` 클래스를 상속하고 `data-st`로 변주 — **신규 클래스 최소화**
- **색만으로 상태를 전달하지 않는다.** 텍스트 라벨 항상 동반. `aria-hidden` 금지

### 5-7. 과정 소개 섹션 — `KiumCourseGrid` 재사용

```tsx
<KiumCourseGrid
  courses={getOpenCourses()}
  categories={openCategoryCounts()}   // 9과정 기준 카운트
/>
```

`openCategoryCounts()`는 `lib/kium/sessions.ts`에 추가한다.

```ts
import { KIUM_CATEGORY_META, type KiumCategory } from './data';

/** 공개교육 9과정 기준 카테고리 카운트 (0건 카테고리는 칩 자체를 만들지 않는다) */
export function openCategoryCounts(): { key: KiumCategory; label: string; count: number }[] {
  const open = getOpenCourses();
  return (Object.keys(KIUM_CATEGORY_META) as KiumCategory[])
    .map((key) => ({ key, label: KIUM_CATEGORY_META[key].label, count: open.filter((c) => c.category === key).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => KIUM_CATEGORY_META[a.key].order - KIUM_CATEGORY_META[b.key].order);
}
```

> 결과 칩: 전체 9 · 신입·온보딩 1 · 리더십·관리자 1 · AI활용 3 · 비즈니스 역량 3 · CS·민원응대 1 — **요청 시안과 일치**

`KiumCourseGrid`는 `?cat=` 쿼리를 읽으므로, 공개교육 탭에서도 같은 쿼리를 공유한다. **이는 허용한다**(카테고리 체계가 동일하므로 충돌 없음).

### 5-7-1. `KiumFaq` 개정 — `items` 주입 + 칩 (OP-07)

**FAQ 컴포넌트를 새로 만들지 않는다.** 기존 `KiumFaq`가 `KIUM_CONTENT.faq`를 직접 읽던 것을 `items` prop 주입으로 바꾸고, `tag`가 있으면 칩을 렌더한다.

```tsx
// 수정 후
export default function KiumFaq({ items }: { items?: typeof KIUM_CONTENT.faq }) {
  const list = items ?? KIUM_CONTENT.faq;   // 미지정 시 기존 동작(전체) 그대로
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <div className="faq-list">
      {list.map((it, i) => {
        const isOpen = !!open[i];
        const tag = 'tag' in it ? it.tag : undefined;
        return (
          <div className={`faq-item${isOpen ? ' open' : ''}`} key={it.q} data-status={it.status}>
            <button type="button" className="faq-q" aria-expanded={isOpen}
                    onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}>
              <span className="qn">Q{i + 1}</span>
              <span className="qt">
                {tag && <span className="kium-badge open faq-tag">{tag}</span>}
                {it.q}
              </span>
              <svg className="chev" …/>
            </button>
            …
```

| 위치 | 전달값 | 렌더 결과 |
| --- | --- | --- |
| 사업소개 탭 (`#intro`) | `<KiumFaq />` (미지정) | **9문항 전체**. 3·4번에 `공개교육` 칩 |
| 공개교육 탭 (`#open`) | `<KiumFaq items={getOpenFaq()} />` | **2문항만**, Q1·Q2로 재번호. 칩 유지 |

| 규칙 | 내용 |
| --- | --- |
| 칩 스타일 | `.kium-badge.open`(§6-2, 공개교육 개설 배지와 동일 토큰) + `.faq-tag` 여백만 추가. 신규 색 금지 |
| 칩 위치 | 질문 텍스트 **앞**. 질문을 읽기 전에 맥락이 먼저 들어와야 한다 |
| 접근성 | 칩은 실제 텍스트 노드. `aria-hidden` 금지 — 스크린리더가 "공개교육 한 회사에서 1명만…"으로 읽어야 맥락이 전달된다 |
| 번호 | 목록 내 인덱스 기준(`i+1`). 두 화면에서 번호가 달라지는 것은 의도된 동작이다 — 각 화면 안에서의 순번이 사용자에게 자연스럽다 |
| 다중 열림 | 기존 정책 유지 |

**CSS 1줄 추가** (`styles/kium-open.css`)

```css
.faq-tag{margin-right:8px;vertical-align:middle}
```

**공개교육 탭 FAQ 섹션 배치** — `KiumOpenTab` 하단, 신청 CTA 앞

```tsx
<div className="kium-faq r">
  <KiumFaq items={getOpenFaq()} />
</div>
```

### 5-8. `KiumTabs` 개정 (2건)

**① `TABS` 3건화**

```ts
const TABS = [
  { id: 'intro', label: '사업소개' },
  { id: 'courses', label: '과정안내' },
  { id: 'open', label: '공개교육' },
] as const;
```

props를 `{ intro, courses, open }`으로 확장하고, 패널 렌더를 인덱스 분기에서 배열 참조로 바꾼다.

```tsx
export default function KiumTabs({ intro, courses, open }: { intro: ReactNode; courses: ReactNode; open: ReactNode }) {
  const panes = [intro, courses, open];
  …
  {TABS.map((t, i) => ( … {panes[i]} … ))}
```

**② 해시 폴백 결함 수정 (필수)**

현행:

```ts
const indexFromHash = () => {
  const id = window.location.hash.replace(/^#/, '');
  const i = TABS.findIndex((t) => t.id === id);
  return i < 0 ? 0 : i;   // ← 미등록 해시가 무조건 사업소개로 되돌림
};
```

`#inq` 앵커(FAQ 하단 CTA·공개교육 CTA)를 클릭하면 해시가 `inq`가 되어 **탭이 사업소개로 튄다**. 공개교육 탭의 신청 동선이 `#inq`를 쓰므로 이 결함은 반드시 먼저 고친다.

```ts
/** 미등록 해시(#inq 등)는 탭 전환 신호가 아니다 — null을 돌려 현재 탭을 유지한다 */
const indexFromHash = (): number | null => {
  const id = window.location.hash.replace(/^#/, '');
  const i = TABS.findIndex((t) => t.id === id);
  return i < 0 ? null : i;
};

useEffect(() => {
  const sync = () => {
    const i = indexFromHash();
    if (i !== null) setActive(i);          // 미등록 해시면 현재 탭 유지
  };
  sync();
  window.addEventListener('hashchange', sync);
  return () => window.removeEventListener('hashchange', sync);
}, []);
```

> 최초 마운트에서 해시가 없거나 미등록이면 `active`의 초기값 `0`이 그대로 유지되므로 기존 기본 동작(사업소개)은 변하지 않는다.

### 5-9. `HomeInquiry` 개정 (최소 변경)

**변경은 프리필 이벤트 핸들러 1곳뿐이다.** 다른 어떤 것도 건드리지 않는다.

```tsx
// 수정 전
const onPrefill = (e: Event) => {
  const text = (e as CustomEvent<{ text?: string }>).detail?.text;
  if (!text) return;
  setV((s) => {
    const rest = s.message.replace(/^\[관심 과정: [^\]]*\]\s*/, '');
    return { ...s, message: (text + rest).slice(0, INQ_MAX.message) };
  });
};

// 수정 후 — trainees 셀렉트 값도 함께 받는다(요구 ③ "셀렉트 상태로 진입")
const onPrefill = (e: Event) => {
  const d = (e as CustomEvent<{ text?: string; trainees?: string; strip?: RegExp[] }>).detail;
  if (!d) return;
  setV((s) => {
    let message = s.message;
    if (d.text) {
      // 기존 프리필 토큰(관심 과정 / 공개교육 신청)을 제거해 재클릭 시 누적을 막는다
      for (const re of d.strip ?? [/^\[관심 과정: [^\]]*\]\s*/]) message = message.replace(re, '');
      message = (d.text + message).slice(0, INQ_MAX.message);
    }
    return { ...s, message, ...(d.trainees ? { trainees: d.trainees } : {}) };
  });
};
```

**`data/home.ts` — `INQ.trainees` 옵션 1개 추가**

```ts
  trainees: [
    { value: 'none',  label: '해당없음' },
    { value: 'lte9',  label: '1~9명' },      // ← 신규. 공개교육(1명부터 신청) 대응
    { value: 'lte50', label: '~ 50명' },
    …
  ],
```

> **이것은 신규 수집 항목이 아니라 기존 셀렉트의 옵션 값 1개 추가다.** 폼 필드 수·`InquiryPayload` 스키마·동의 문구는 전부 그대로다. 위탁 문의에는 무해하다(선택하지 않으면 그만).
>
> **왜 필요한가**: 히어로와 FAQ에서 "1명부터 신청 가능"이라고 말한 직후, 폼의 최소 선택지가 `~ 50명`이면 사용자는 본인이 대상이 아니라고 판단하고 이탈한다. 공개교육 전환의 마지막 단계가 여기서 끊긴다.

### 5-10. `KiumCourseCard` 개정 — 배지 1종

```tsx
import { isOpenCourse } from '@/lib/kium/sessions';
…
{/* 정부지원 환급 배지 — 기존 */}
<span className="kium-badge gov">정부지원 환급</span>
{/* 공개교육 개설 배지 — 신규. 9과정에만 노출 */}
{isOpenCourse(course.id) && <span className="kium-badge open">공개교육 개설</span>}
```

### 5-11. `KiumCoursePanel` 개정 — 메타 pill 2종 (OP-06 · OP-11)

기존 pill 4종(교육 대상 / 교육 형태 / 교육 시간 / 정원) 뒤에 조건부 2종을 추가한다.

```tsx
import { getSessionsByDate, isOpenCourse, fmtRange } from '@/lib/kium/sessions';
import { fmtPrice } from '@/lib/kium/pricing';
…
{isOpenCourse(course.id) && (
  <>
    <span className="kium-pill">
      <b>교육 일정</b>
      {getSessionsByDate()
        .filter((s) => s.courseId === course.id)
        .map(fmtRange)
        .join(', ')}
    </span>
    <span className="kium-pill">
      <b>교육비</b>
      <span className="num">{fmtPrice(course.id)}</span>
      <i className="kium-pill-note">{KIUM_PRICE_NOTE}</i>
    </span>
  </>
)}
```

| 규칙 | 내용 |
| --- | --- |
| 적용 범위 | **공개교육 9과정만.** 나머지 10과정은 두 pill 자체를 렌더하지 않는다 (`"-"` 표기 금지) |
| 회차 4건 이상 | 3건까지 나열 후 `외 {n}건` |
| 기존 주석 갱신 | `KiumCoursePanel` 상단 주석 "교육 단가는 데이터에도 화면에도 없다(기존 원칙 유지)" → 공개교육 9과정 예외를 명시하도록 수정 |

### 5-12. `app/kium/page.tsx` 개정

```tsx
import '@/styles/kium-open.css';
import KiumOpenTab from '@/components/kium/KiumOpenTab';
import KiumApplySummary from '@/components/kium/KiumApplySummary';
…
const openPanel = (
  <section className="kium-sec" id="kium-open">
    <div className="wrap">
      <p className="eyebrow r">{KIUM_CONTENT.open.eyebrow}</p>
      <h2 className="kium-sec-title r" tabIndex={-1} data-panel-heading>
        {KIUM_CONTENT.open.title}
      </h2>
      <KiumOpenTab />
    </div>
  </section>
);
…
<KiumTabs intro={intro} courses={coursesPanel} open={openPanel} />

<div className="kium-cta-band">
  {/* 신청 요약 배너 — 공유 폼을 건드리지 않고 프리필 상태를 시각화한다(§7-2) */}
  <KiumApplySummary />
  <HomeInquiry
    presetInterests={['gov']}
    presetInterestSubs={['인재키움']}
    leadSource={KIUM_CONTENT.leadSource}
    prefillEventName="kium:inquiry-prefill"
  />
</div>
```

> `data-panel-heading`은 탭 전환 시 포커스 대상이다. 신규 패널에도 반드시 붙인다.

---

## 6. 반응형 명세

### 6-1. 브레이크포인트 × 보기

| 구간 | 기본 보기 | 일정 영역 | 과정 카드(`.kium-grid` 기존) |
| --- | --- | --- | --- |
| ≥1280 | 과정별 매트릭스 | 과정명 열 240px + 월 3열 균등 | 3열 |
| 1024~1279 | 과정별 매트릭스 | 과정명 열 200px, 셀 패딩 축소 | 3열 (1000px 이하 2열) |
| 768~1023 | **일정순 리스트** | 리스트 카드 **2열 그리드** | 2열 |
| 480~767 | 일정순 리스트 | 1열 | 1열 |
| 320~479 | 일정순 리스트 | 1열, 카드 내부 단일 컬럼 | 1열 |

**1024px에서 매트릭스를 버리는 근거**: 과정명 열 200px + 월 3열 × 160px = 680px가 표의 실질 최소 폭. 그 아래에서는 폰트 축소(11px 이하)나 가로 스크롤 외에 선택지가 없고, 둘 다 접근성 기준 위반이다.

**두 보기는 모든 뷰포트에서 전환 가능하다.** 뷰포트는 기본값만 결정한다.

### 6-2. `styles/kium-open.css` (신규 · 기존 토큰만)

```css
/* =========================================================================
   KEESS 공개교육 탭 — 기존 토큰만 사용. 신규 색·라운드·그림자 값 발명 금지.
   ========================================================================= */

/* ── 히어로 지표 ─────────────────────────────────────────────── */
.kium-open-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:22px 0 0}
.kium-open-stats>div{background:var(--surface);border:1px solid var(--line);border-radius:14px;
  padding:16px 18px;text-align:center}
.kium-open-stats b{display:block;font-size:18px;font-weight:800;color:var(--p1);letter-spacing:-.02em}
.kium-open-stats span{display:block;font-size:13px;color:var(--muted);margin-top:4px}
@media(max-width:560px){.kium-open-stats{grid-template-columns:1fr;gap:8px}
  .kium-open-stats>div{display:flex;align-items:baseline;gap:8px;text-align:left;padding:12px 16px}
  .kium-open-stats b{font-size:16px}.kium-open-stats span{margin-top:0}}

/* ── 가장 빠른 개강 ───────────────────────────────────────────── */
.kium-open-next{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:14px;
  padding:12px 16px;background:#fff;border:1px solid var(--line);border-radius:14px;
  box-shadow:var(--shadow-1);font-size:14px}
.kium-open-next .lb{font-weight:800;color:var(--p1)}
.kium-open-next button{min-height:44px}

/* ── 보기 전환 세그먼트 ───────────────────────────────────────── */
.kium-viewseg{display:inline-flex;background:var(--surface);border:1px solid var(--line);
  border-radius:999px;padding:3px}
.kium-viewseg-btn{border:0;background:transparent;border-radius:999px;padding:9px 16px;
  min-height:44px;font-size:13.5px;font-weight:700;color:var(--muted);
  transition:background .18s var(--ease),color .18s var(--ease)}
.kium-viewseg-btn[aria-checked="true"]{background:#fff;color:var(--ink);box-shadow:var(--shadow-1)}

/* ── 상태 배지 (기존 .kium-badge 상속 + data-st 변주) ─────────── */
.kium-badge.st[data-st="open"]{background:transparent;color:var(--p1);
  border:1px solid color-mix(in srgb,var(--p1) 32%,#fff)}
.kium-badge.st[data-st="confirmed"]{background:color-mix(in srgb,var(--p1) 10%,#fff);
  color:var(--p1);border:1px solid color-mix(in srgb,var(--p1) 26%,#fff);font-weight:800}
.kium-badge.st[data-st="closing"]{background:color-mix(in srgb,var(--p4) 16%,#fff);
  color:#8a4a05;border:1px solid color-mix(in srgb,var(--p4) 40%,#fff);font-weight:800}
.kium-badge.st[data-st="closed"]{background:var(--surface);color:var(--muted);
  border:1px solid var(--line)}
.kium-badge.open{background:color-mix(in srgb,var(--p3) 12%,#fff);color:var(--p3);
  border:1px solid color-mix(in srgb,var(--p3) 28%,#fff)}

/* ── 매트릭스 (≥1024) ─────────────────────────────────────────── */
.kium-mtx-wrap{overflow:visible}
.kium-mtx{width:100%;border-collapse:separate;border-spacing:0;
  background:#fff;border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
.kium-mtx thead th{position:sticky;top:var(--kium-sticky,72px);z-index:2;
  background:var(--p1);color:#fff;font-size:13.5px;font-weight:800;padding:13px 14px;text-align:center}
.kium-mtx thead th:first-child{text-align:left}
.kium-mtx tbody tr+tr th,.kium-mtx tbody tr+tr td{border-top:1px solid var(--line)}
.kium-mtx tbody tr:hover th,.kium-mtx tbody tr:hover td{background:var(--surface)}
.kium-mtx-course{width:240px;text-align:left;vertical-align:top;padding:14px;font-weight:400}
@media(max-width:1279px){.kium-mtx-course{width:200px;padding:12px}}
.kium-mtx-title{display:block;font-size:15px;font-weight:800;color:var(--ink);
  line-height:1.4;letter-spacing:-.01em;word-break:keep-all;margin-top:6px}
.kium-mtx-meta{display:block;font-size:12.5px;color:var(--muted);margin-top:4px}
.kium-mtx-price{display:block;font-size:13.5px;font-weight:800;color:var(--p1);margin-top:6px}
.kium-mtx-price i{font-style:normal;font-size:11.5px;font-weight:600;color:var(--muted);margin-left:4px}
.kium-mtx-cell{padding:10px;text-align:center;vertical-align:middle;min-height:72px}
.kium-mtx-cell.is-empty{background:var(--surface)}
.kium-mtx-cell.is-empty:hover{background:var(--surface)}

/* 회차 버튼 */
.kium-ses{display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;
  min-height:72px;justify-content:center;padding:10px 8px;border:1px solid var(--line);
  border-radius:12px;background:#fff;
  transition:border-color .18s var(--ease),box-shadow .18s var(--ease),transform .18s var(--ease)}
.kium-ses+.kium-ses{margin-top:8px}
.kium-ses:hover,.kium-ses:focus-visible{border-color:var(--p1);box-shadow:var(--shadow-1);transform:translateY(-1px)}
.kium-ses[data-status="closed"]{opacity:.5}
.kium-ses[data-status="closed"]:hover{transform:none;box-shadow:none;border-color:var(--line)}
.kium-ses-date{font-size:13.5px;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}
.kium-ses.is-tbd{color:var(--muted);font-size:13px;background:var(--surface);cursor:default}

/* ── 리스트 (<1024) ───────────────────────────────────────────── */
.kium-list-mh{position:sticky;top:var(--kium-sticky,72px);z-index:2;
  background:var(--bg);padding:12px 0 8px;margin-top:8px;
  font-size:15px;font-weight:800;letter-spacing:-.01em}
.kium-list-mh .cnt{font-size:12.5px;font-weight:700;color:var(--muted);margin-left:8px}
.kium-list-ul{list-style:none;display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:768px) and (max-width:1023px){.kium-list-ul{grid-template-columns:repeat(2,1fr)}}
.kium-scard{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 18px;
  box-shadow:var(--shadow-1)}
.kium-scard[data-status="closed"]{opacity:.55}
.kium-scard-date{font-size:17px;font-weight:800;color:var(--ink);letter-spacing:-.02em;
  font-variant-numeric:tabular-nums}
.kium-scard-days{font-size:12.5px;font-weight:700;color:var(--muted);margin-left:8px}
.kium-scard-title{font-size:15px;font-weight:800;color:var(--ink);margin-top:6px;word-break:keep-all}
.kium-scard-meta{font-size:13px;color:var(--muted);margin-top:4px}
.kium-scard-meta .num{font-weight:800;color:var(--p1)}
.kium-scard-meta i{font-style:normal;font-size:11.5px;margin-left:2px}
.kium-scard-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}
.kium-scard-cta{min-height:44px;padding:0 18px}

/* ── 신청 요약 배너 ───────────────────────────────────────────── */
.kium-apply-sum{display:flex;flex-wrap:wrap;align-items:center;gap:10px;
  margin:0 0 16px;padding:14px 18px;background:color-mix(in srgb,var(--p1) 6%,#fff);
  border:1px solid color-mix(in srgb,var(--p1) 20%,#fff);border-radius:14px;font-size:14px}
.kium-apply-sum b{color:var(--p1);font-weight:800}
.kium-apply-sum .chg{margin-left:auto;font-weight:700;text-decoration:underline;min-height:44px;
  display:inline-flex;align-items:center}

/* ── 보기 전환 페이드 ─────────────────────────────────────────── */
.kium-sched-body{transition:opacity 120ms var(--ease)}
.kium-sched-body.fading{opacity:0}

/* ── 모션 저감 ────────────────────────────────────────────────── */
@media(prefers-reduced-motion:reduce){
  .kium-sched-body{transition:none}
  .kium-ses:hover,.kium-ses:focus-visible{transform:none}
}

/* ── 320px 하한 안전장치 ──────────────────────────────────────── */
@media(max-width:479px){
  .kium-scard{padding:14px 16px}
  .kium-scard-date{font-size:16px}
  .kium-scard-foot{flex-wrap:wrap}
  .kium-scard-cta{width:100%}
}
```

**`--kium-sticky` 주입**: `KiumOpenTab` 마운트 시 `KiumCourseGrid.stickyBottom()`과 동일한 계산으로 `.kium-open` 루트에 CSS 변수를 세팅한다. 탭바 높이가 바뀌어도 따라간다.

```ts
useEffect(() => {
  const set = () => {
    const bar = document.querySelector('.kium-tabbar');
    if (!bar || !rootRef.current) return;
    const v = parseFloat(getComputedStyle(bar).top || '0') + bar.getBoundingClientRect().height;
    rootRef.current.style.setProperty('--kium-sticky', `${v}px`);
  };
  set();
  window.addEventListener('resize', set);
  return () => window.removeEventListener('resize', set);
}, []);
```

---

## 7. 신청 플로우 (OP-12)

### 7-1. `lib/kium/openBridge.ts` (신규 · 전문)

```ts
'use client';

import { KIUM_PREFILL_EVENT } from './inquiryBridge';
import { fmtRangePrefill, type KiumSession } from './sessions';
import { fmtPrice, KIUM_PRICE_NOTE } from './pricing';
import type { KiumCourse } from './data';

/** 공개교육 프리필 토큰 — 재클릭 시 누적되지 않도록 이 패턴을 교체한다 */
export const KIUM_OPEN_PREFILL_RE = /^\[공개교육 신청\][^\n]*\n(?:신청 인원:[^\n]*\n?)?/;
/** 기존 '관심 과정' 토큰도 함께 제거 대상에 넣는다 */
export const KIUM_COURSE_PREFILL_RE = /^\[관심 과정: [^\]]*\]\s*/;

/** 요약 배너가 구독하는 이벤트 */
export const KIUM_OPEN_SELECT_EVENT = 'kium:open-select';

export function openPrefillText(course: KiumCourse, session: KiumSession): string {
  const price = fmtPrice(course.id);
  return (
    `[공개교육 신청] ${course.titleMarketing} / ${session.displayMonth}월 회차 ` +
    `(${fmtRangePrefill(session)}, ${course.hours}시간·${course.days}일) / 교육비 ${price}(${KIUM_PRICE_NOTE})\n` +
    `신청 인원: `
  );
}

/**
 * 회차 선택 → 폼 프리필 + 이동.
 * 폼의 필드·동의 구조는 그대로 두고 '문의 내용'과 '예상 교육인원'만 채운다.
 * 개인정보 동의·마케팅 동의는 어떤 경우에도 자동 체크하지 않는다.
 */
export function applyForSession(course: KiumCourse, session: KiumSession) {
  window.dispatchEvent(
    new CustomEvent(KIUM_PREFILL_EVENT, {
      detail: {
        text: openPrefillText(course, session),
        trainees: 'lte9',                                    // 1~9명
        strip: [KIUM_OPEN_PREFILL_RE, KIUM_COURSE_PREFILL_RE],
      },
    })
  );
  window.dispatchEvent(
    new CustomEvent(KIUM_OPEN_SELECT_EVENT, { detail: { courseId: course.id, sessionId: session.id } })
  );

  const el = document.getElementById('inq');
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });

  // 스크롤 후 첫 빈 필수 필드로 포커스 — preventScroll로 스크롤을 두 번 흔들지 않는다
  window.setTimeout(() => {
    document.getElementById('f-company')?.focus({ preventScroll: true });
  }, reduce ? 0 : 480);
}
```

### 7-2. `KiumApplySummary` (신규 · 폼 상단 배너)

**공유 폼(`HomeInquiry`)을 건드리지 않고 프리필 상태를 시각화하기 위해 폼 바깥에 둔다.** 이것이 회귀 위험을 낮추는 핵심 설계다.

```tsx
'use client';
// KIUM_OPEN_SELECT_EVENT 구독 → 선택 회차 표시
```

```html
<div class="kium-apply-sum" role="status">
  신청 과정 <b>업무효율화: Agent 과정</b> · 10월 회차 (10.12~13) · 700,000원
  <a class="chg" href="#kium-open">변경</a>
</div>
```

| 항목 | 규칙 |
| --- | --- |
| 초기 상태 | 선택 없음 → **렌더하지 않는다** |
| `role="status"` | 자동으로 `aria-live="polite"` — 프리필 완료가 스크린리더에 고지된다 |
| `[변경]` | 공개교육 탭 상단으로 복귀 |
| 표시 정보 | 과정명 · 회차 · 일자 · 교육비 (프리필 문자열과 동일 근거) |

### 7-3. 상태별 클릭 동작

| 상태 | 동작 |
| --- | --- |
| `open` / `confirmed` / `closing` | `applyForSession()` 실행 |
| `closed` (또는 마운트 후 `isPast()` true) | 프리필하지 않는다. 대신 **인접 대안** 안내: `이 회차는 마감되었습니다. 가장 빠른 다음 회차: {fmtRange(next)} [신청하기]` — `.kium-caption` 인라인 노출, `aria-live="polite"` |
| `tbd` | 버튼이 아니므로 클릭 불가. `일정 조율 중` 텍스트만 |

> **막다른 길을 만들지 않는다.** 마감을 만난 사용자를 그대로 이탈시키는 것이 이 페이지의 가장 큰 손실이다.

### 7-4. 딥링크

| URL | 동작 |
| --- | --- |
| `/kium#open` | 공개교육 탭 (기본 보기 = 뷰포트 기준) |
| `/kium#open?view=date&month=11` | 11월 일정순 보기로 진입 |
| `/kium#open?course=kium-09&round=agent-r1` | 해당 회차 카드/셀 하이라이트 + 스크롤. 프리필 적용, 폼으로는 이동하지 않음 |
| `/kium#open?course=kium-09&round=agent-r1&apply=1` | 위 + 폼까지 이동(영업 메일용) |

- 하이라이트는 `.kium-ses.is-hl` / `.kium-scard.is-hl` 클래스 2.4초 후 자동 해제
- 유효하지 않은 `course`/`round`는 **무시**하고 기본 화면을 보여준다 (에러 화면 금지)
- 딥링크 처리는 마운트 후 1회. `history.replaceState`로 `course`/`round`/`apply`를 URL에서 제거해 새로고침 시 재실행되지 않게 한다

---

## 8. SSG · 하이드레이션 규칙 (필수)

`/kium`은 정적 생성 페이지다. 아래를 어기면 hydration mismatch 또는 "빌드 시점 날짜 고정" 사고가 난다.

| 항목 | 규칙 |
| --- | --- |
| `new Date()` | **서버 렌더 경로에서 절대 호출 금지.** `now` 상태를 `null`로 시작해 `useEffect`에서 세팅 |
| 지난 회차 판정 | `now !== null`일 때만 수행. `null`이면 데이터의 `status`를 그대로 신뢰 |
| 뷰포트 기반 기본 보기 | 서버 렌더는 `'date'` 고정. `useEffect`에서 `matchMedia`로 승격 |
| 쿼리 파싱 | 전부 `useEffect` 안에서. `window` 참조는 마운트 후에만 |
| `status` 필드 | **데이터에 수기 명시.** 날짜 기반 자동 추론 금지 |

**안전장치 (필수 구현)**: 데이터의 `status`가 무엇이든, 마운트 후 `isPast(s, now) === true`인 회차는 **`closed`로 강제 승격**한다.

```ts
function effectiveStatus(s: KiumSession, now: Date | null): KiumSessionStatus {
  if (now && isPast(s, now)) return 'closed';
  return s.status;
}
```

> 이 한 줄이 "운영 담당자가 배지를 못 바꿔서 지난 회차에 신청이 들어오는" 최악의 사고를 구조적으로 차단한다.

---

## 9. 접근성

| 영역 | 명세 |
| --- | --- |
| 매트릭스 | 실제 `<table>` + `<caption class="kium-sr">` + `th[scope=col/row]`. `role="grid"` 금지 |
| 빈 셀 | `<td>` 유지 + `<span class="kium-sr">해당 월 개설 없음</span>` |
| 셀 버튼 접근명 | §5-4 형식 그대로 (`aria-label`) |
| 리스트 | `<section aria-labelledby>` + 월 `<h3>` + `<ul>/<li>`. 월 헤딩에 회차 수 포함 |
| 보기 전환 | `role="radiogroup"` + `role="radio" aria-checked`. 좌우 화살표 이동 |
| 필터 | `.kium-chip` + `aria-pressed`. 결과 건수 `aria-live="polite"` |
| 프리필 고지 | `KiumApplySummary`의 `role="status"`로 자동 고지 |
| 포커스 | `focus({ preventScroll: true })` 후 스크롤 — 순서를 바꾸면 화면이 두 번 튄다 |
| 상태 배지 | 색 + 텍스트 병기. `aria-hidden` 금지 |
| 터치 타깃 | 전 인터랙티브 요소 **≥44×44px** |
| 모션 | 전환 120ms, `prefers-reduced-motion: reduce` 시 0ms. `transition: all` 금지 |
| 대비 | 배지 4종 × 배경 조합 전건 **WCAG AA 4.5:1**. `scripts/check-contrast.mjs`에 케이스 추가 |
| 포커스 링 | 전역 `:focus-visible` 규칙 상속 (별도 정의 금지) |

---

## 10. 금지사항

1. **데이터·문안 창작 금지** — 회차 20건·교육비 9건·FAQ 2문항·타이틀·캡션은 원문 그대로. 오탈자는 보고만
2. **금액 임의 산출·환산·반올림·할인 표기 금지**. `KIUM_PRICES` 외 출처 금지
3. **O열(총 훈련비) 사용 금지** — 개인 신청 화면에 노출할 값은 N열(1인 단가)뿐
4. **신규 폼 수집 필드·동의 문구 변경 금지**. 허용 변경은 `INQ.trainees` 옵션 1개 추가와 프리필 핸들러 확장뿐
5. **개인정보·마케팅 동의 자동 체크 절대 금지**
6. **신규 색·라운드·그림자 토큰 발명 금지** — `globals.css :root` 토큰과 `color-mix` 파생만
7. 위탁 10과정의 단가·`교육일정` pill 노출 금지
8. 강사·NCS·환급 소요기간 노출 금지 (기존 명세 유지)
9. **`transition: all` 금지**, `dangerouslySetInnerHTML` 금지
10. 실사·외부 이미지 신규 추가 금지 (썸네일은 듀얼 모드 기존 규칙 그대로)
11. GA4·GTM 코드 직접 삽입 금지 (`lead_source`는 폼 데이터 필드)
12. 신규 라우트 생성 금지 · GNB 정식 메뉴 승격 금지
13. **검토 전 commit·push 금지**

---

## 11. 회귀 위험과 롤백

### 11-1. 필수 회귀 테스트 (상담 폼)

| # | 시나리오 | 기대 |
| --- | --- | --- |
| R1 | `/` 홈에서 상담 폼 제출 | 기존과 동일. 프리필 미동작 |
| R2 | `/kium#intro` FAQ 하단 `신청 문의` 클릭 | 폼으로 스크롤. **탭이 사업소개에 머문다** |
| R3 | `/kium#courses`에서 `#inq` 앵커 클릭 | **탭이 과정안내에 머문다** (§5-8 ② 수정 확인) |
| R4 | `/kium#courses` 상세 패널 `이 과정으로 신청 문의` | 기존 `[관심 과정: …]` 프리필 정상 |
| R5 | 공개교육 회차 → 폼 → 다른 회차 재클릭 | 프리필 문자열이 **누적되지 않고 교체**됨 |
| R6 | `?interest=hrd`로 홈 진입 | 기존 쿼리 프리셀렉트 정상 |
| R7 | 폼 제출 성공 후 자동 복귀 | `trainees` 초기화 확인 |
| R8 | `INQ.trainees` 옵션 추가 후 기존 값 제출 | 페이로드 스키마 변화 없음 |

### 11-2. 롤백 기준

배포 후 아래 중 하나라도 발생하면 즉시 롤백한다.

- 일반 경로(공개교육 미경유) 상담 접수 실패
- 접수 메일 미수신 또는 형식 변형
- 교육비·일정 금액/일자 오노출

---

## 12. QA 체크리스트

**반응형**

- [ ] 320 / 375 / 768 / 1024 / 1440px 전 구간 **가로 스크롤 0**
- [ ] 1024px 경계에서 매트릭스 ↔ 리스트 기본값 전환
- [ ] 두 보기 모두 모든 뷰포트에서 전환 가능
- [ ] 768~1023px에서 리스트 2열 그리드
- [ ] 매트릭스 헤더·리스트 월 헤더 sticky가 탭바에 가리지 않음
- [ ] 전 인터랙티브 요소 44×44px 이상
- [ ] 320px에서 금액 문자열 줄바꿈·배지 절단 없음

**탐색·신청**

- [ ] 매트릭스 셀 / 리스트 CTA / 상세 패널 / 딥링크 **4경로 전부 탭 1회로 폼 도달**
- [ ] 마감 회차 클릭 시 다음 회차 대안 제시
- [ ] 필터 0건 시 리셋 버튼 + 대안 문구
- [ ] 딥링크 4종 정상, 무효 파라미터는 무시
- [ ] 지난 회차 기본 숨김 + 펼침 동작

**프리필**

- [ ] `문의 내용`에 `[공개교육 신청] …` 정확히 입력, 편집 가능
- [ ] `예상 교육인원`이 **1~9명 선택 상태**로 진입
- [ ] `관심 영역` = 정부 지원 + 인재키움 선택 상태 (기존 동작 유지)
- [ ] **동의 항목 자동 체크 0건**
- [ ] 요약 배너 표시 + `[변경]` 동작 + `role="status"` 고지
- [ ] 스크롤 후 `#f-company` 포커스, 화면 흔들림 없음
- [ ] 재클릭 시 프리필 교체(누적 아님)
- [ ] 제출 페이로드에 `lead_source: 'kium'` 포함, UI 미노출

**데이터**

- [ ] 회차 19건(+tbd 1건) 부록 A와 1:1 일치
- [ ] 교육비 9건 부록 B와 1:1 일치, 임의 산출 0건
- [ ] 요일 표기가 전부 `startDate` 파생 (데이터에 요일 문자열 0건)
- [ ] `relead-r3`가 매트릭스에서 `일정 조율 중`으로 비활성 렌더, 리스트·집계 제외
- [ ] 히어로 회차 수가 데이터 파생값

**기타**

- [ ] `npm run build` **경고 0건**
- [ ] 금지어 전역 검색 0건: `12,000,000` / `17,500,000` / 총 훈련비 계열 숫자
- [ ] 위탁 10과정 상세 패널에 `교육일정`·`교육비` pill 미렌더
- [ ] 대비 스크립트 통과 (배지 4종 추가)
- [ ] §11-1 회귀 R1~R8 전건 통과

---

## 13. Claude Code 빌드 프롬프트

```
당신은 KEESS_NEWSCOPE 저장소에 인재키움 프리미엄 '공개교육' 탭을 구현하는 시니어 프론트엔드 개발자입니다.
창작 금지 — 본 기술명세서(v1.0)와 저장소의 기존 코드만을 근거로 수행하세요.

[작업 0] 현행 확인
  app/kium/page.tsx / components/kium/*.tsx / lib/kium/*.ts / styles/kium.css /
  components/sections/home/HomeInquiry.tsx / data/home.ts / app/globals.css 를 읽고
  본 명세 §0의 실사 결과와 일치하는지 확인. 불일치가 있으면 중단하고 보고.

[작업 1] 데이터 계층
  lib/kium/sessions.ts, lib/kium/pricing.ts 를 명세 §4-1·§4-2 전문 그대로 생성.
  lib/kium/content.ts 에 §4-3 open 블록 추가(기존 필드 무변경).

[작업 2] KiumTabs 개정
  §5-8 ①TABS 3건화 ②해시 폴백 결함 수정. ②를 먼저 적용하고 R2·R3 회귀를 확인할 것.

[작업 3] 공개교육 탭 컴포넌트
  KiumOpenTab / KiumOpenHero / KiumSchedule / KiumScheduleMatrix / KiumScheduleList /
  KiumSessionStatus / KiumApplySummary 를 §5·§6·§9 명세대로 생성.
  FAQ는 신규 컴포넌트를 만들지 말고 KiumFaq를 §5-7-1 대로 개정(items prop + 칩).
  매트릭스는 반드시 실제 <table> 시맨틱. 빈 셀에 "-" 렌더 금지.
  교육비는 매트릭스에서 행 헤더(th[scope=row])에만, 셀에는 넣지 말 것.

[작업 4] 신청 브리지
  lib/kium/openBridge.ts 를 §7-1 전문 그대로 생성.
  HomeInquiry.tsx 는 §5-9의 프리필 핸들러 1곳만 수정. 그 외 어떤 줄도 건드리지 말 것.
  data/home.ts 는 INQ.trainees 에 { value:'lte9', label:'1~9명' } 1개만 추가.
  동의 항목 자동 체크는 어떤 경우에도 구현하지 말 것.

[작업 5] 기존 화면 개정
  KiumCourseCard: '공개교육 개설' 배지 조건부 1종(§5-10).
  KiumCoursePanel: '교육 일정'·'교육비' pill 조건부 2종(§5-11). 위탁 10과정은 미렌더.
  app/kium/page.tsx: §5-12.

[작업 6] 스타일
  styles/kium-open.css 를 §6-2 그대로 생성하고 app/kium/page.tsx 에서 import.
  기존 토큰과 color-mix 파생만 사용. 신규 색·라운드·그림자 값 금지.

[작업 7] SSG 규칙
  §8 전 항목 적용. 서버 렌더 경로에서 new Date()/window 참조 0건.
  effectiveStatus() 강제 마감 승격 구현.

[작업 8] 검증·보고
  npm run build 경고 0건. 아래를 표로 보고할 것:
  (1) 생성·수정 파일 목록
  (2) 회차 19건+tbd 1건 / 교육비 9건 — 부록 A·B 대조 결과
  (3) §11-1 회귀 R1~R8 확인 결과
  (4) §12 QA 체크리스트 결과
  (5) 금지어 전역 검색 결과(총 훈련비 계열 숫자·"대행"·NCS 등)
  (6) 명세와 달리 판단한 부분과 사유
  스크린샷 도구가 있으면 320/375/768/1024/1440 5뷰포트 캡처.
  commit·push 금지.

[금지] 본 명세 §10 전 항목.
```

---

## 부록 A — 회차 데이터 20건 (검증 완료본)

| # | 회차 ID | 과정 (id) | displayMonth | 시작 | 종료 | 화면 표기 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | agent-r1 | 업무효율화: Agent (kium-09) | 10 | 2026-10-12 | 2026-10-13 | 10.12(월) ~ 13(화) |
| 2 | agent-r2 | 〃 | 11 | 2026-11-02 | 2026-11-03 | 11.2(월) ~ 3(화) |
| 3 | agent-r3 | 〃 | 12 | 2026-11-30 | 2026-12-01 | 11.30(월) ~ 12.1(화) |
| 4 | data-r1 | 업무효율화: Data (kium-10) | 10 | 2026-10-14 | 2026-10-15 | 10.14(수) ~ 15(목) |
| 5 | data-r2 | 〃 | 11 | 2026-11-09 | 2026-11-10 | 11.9(월) ~ 10(화) |
| 6 | data-r3 | 〃 | 12 | 2026-12-07 | 2026-12-08 | 12.7(월) ~ 8(화) |
| 7 | aijob-r1 | AI 직무전문화 (kium-11) | 10 | 2026-10-19 | 2026-10-20 | 10.19(월) ~ 20(화) |
| 8 | aijob-r2 | 〃 | 11 | 2026-11-16 | 2026-11-17 | 11.16(월) ~ 17(화) |
| 9 | aijob-r3 | 〃 | 12 | 2026-12-14 | 2026-12-15 | 12.14(월) ~ 15(화) |
| 10 | nego-r1 | 전략적 비즈니스 협상 스킬 (kium-12) | 10 | 2026-10-27 | 2026-10-27 | 10.27(화) |
| 11 | speech-r1 | 스피치&프레젠테이션 클리닉 (kium-13) | 11 | 2026-11-12 | 2026-11-13 | 11.12(목) ~ 13(금) |
| 12 | report-r1 | 인정받는 직장인의 구두보고 스킬 (kium-14) | 12 | 2026-12-11 | 2026-12-11 | 12.11(금) |
| 13 | cs-r1 | CS 종합 솔루션 (kium-19) | 10 | 2026-10-26 | 2026-10-26 | 10.26(월) |
| 14 | cs-r2 | 〃 | 11 | 2026-11-17 | 2026-11-17 | 11.17(화) |
| 15 | cs-r3 | 〃 | 12 | 2026-12-21 | 2026-12-21 | 12.21(월) |
| 16 | relead-r1 | 진단 기반 팀장 리더십 Re-Lead (kium-04) | 10 | 2026-10-21 | 2026-10-22 | 10.21(수) ~ 22(목) |
| 17 | relead-r2 | 〃 | 11 | 2026-11-18 | 2026-11-19 | 11.18(수) ~ 19(목) |
| 18 | **relead-r3** | 〃 | 12 | **미확정** | **미확정** | **일정 조율 중** ⚠ |
| 19 | onpow-r1 | On-Powering 리텐션 (kium-03) | 12 | 2026-12-09 | 2026-12-10 | 12.9(수) ~ 10(목) |
| 20 | onpow-r2 | 〃 | 12 | 2026-12-16 | 2026-12-17 | 12.16(수) ~ 17(목) |

**요일 검증**: 18번을 제외한 19건 전부 2026년 실제 달력과 일치 확인 완료.
**원본 표 대조 완료(2026-09-03)**: 잘림 없는 원본 표를 재수령해 20건 전건 대조 완료. 역산 보완했던 3건(`11/30~12/1(화)`·`12/14~15(화)`·`12/16~17(목)`)이 원문과 **일치** 확인.

**18번 사유**: 원본 표기가 `12/17(수)~18(금)`으로 확인되었으나 **내부 불일치**가 있다. 2026-12-17은 **목요일**, 12-18은 금요일이다. 또한 수→금은 3일이나 이 과정은 2일 과정이다.
- **(a)** `12/17(목)~18(금)` — 일자 유지, 요일 라벨만 정정. 2일 유지, 다만 이 과정의 수~목 패턴에서 벗어남
- **(b)** `12/16(수)~17(목)` — 수~목 패턴 유지. 단 On-Powering `onpow-r2`와 동일 일자 개설
사업부 회신 전까지 `tbd: true`로 두어 **나머지 19건만으로 배포 가능**하게 한다.

## 부록 B — 교육비 9건

원천: 「2026_인재키움프리미엄_훈련과정_260804_HRD솔루션팀.xlsx」 시트 「2. 신청 훈련과정 정보」 **N열(훈련비 단가 · 1인 기준)**

| 과정 (사이트 표기) | id | 원천 시트 과정명(공식명) | 시간 | **N열 1인 단가** | (참고) O열 총액 |
| --- | --- | --- | --- | --- | --- |
| 업무효율화: Agent 과정 | kium-09 | AI 실무역량강화_업무효율화 Track_Agent 과정 | 14h·2일 | **700,000원** | 17,500,000 |
| 업무효율화: Data 과정 | kium-10 | AI 실무역량강화_업무효율화 Track_Data 과정 | 14h·2일 | **700,000원** | 17,500,000 |
| AI 직무전문화 과정 | kium-11 | AI 실무역량강화_직무전문화 Track_AI 직무 특화 과정 | 14h·2일 | **700,000원** | 17,500,000 |
| 전략적 비즈니스 협상 스킬 과정 | kium-12 | 전략적 비즈니스 협상 스킬 | 7h·1일 | **400,000원** | 12,000,000 |
| 스피치&프레젠테이션 클리닉 과정 | kium-13 | 스피치&프레젠테이션 클리닉 | 14h·2일 | **400,000원** | 12,000,000 |
| 인정받는 직장인의 구두보고 스킬 | kium-14 | 인정받는 직장인의 구두보고 스킬 | 7h·1일 | **400,000원** | 12,000,000 |
| CS 종합 솔루션 과정 | kium-19 | CS 종합 솔루션 | 6h·1일 | **250,000원** | 25,000,000 |
| 진단 기반 팀장 리더십 Re-Lead 과정 | kium-04 | Next Leadership: 팀장리더십 Re-Lead 과정 | 14h·2일 | **400,000원** | 8,000,000 |
| On-Powering 리텐션 과정 | kium-03 | 리텐션 On-Powering 과정 | 14h·2일 | **400,000원** | 12,000,000 |

> **O열은 화면에 절대 노출하지 않는다.** N열 × M열(훈련인원)로 계산된 과정 총액이며, 1명 단위 신청 화면에 쓰면 협상 스킬 과정 옆에 `12,000,000원`이 붙는다.

## 부록 C — 사업부 회신 대기 항목

| # | 항목 | 명세상 처리 | 회신 후 조치 |
| --- | --- | --- | --- |
| ~~C2~~ | ~~「공개교육 일자」 원본 파일~~ | **종결(2026-09-03)** — 원본 표 재수령·20건 전건 대조 완료 | — |
| **C8** | **모집 상태 초기값 20건** 🔴 | `sessions.ts`의 `status`는 **시안 기준 추정값**이며 원문 근거가 없다 | `sessions.ts` 값 교체. 전건 `'open'`도 유효 |
| C1 | Re-Lead 12월 회차 일자 (a)/(b) | `relead-r3`를 `tbd: true`로 두고 매트릭스에 `일정 조율 중` 렌더 | `sessions.ts` 1줄 수정 |
| C6 | `trainees` `1~9명` 옵션 승인 | §5-9로 구현 | 반려 시 프리필에서 `trainees` 제거하고 `신청 인원:` 줄로만 수집 |
| C3 | 교육비 VAT 포함/별도 | `KIUM_PRICE_NOTE = '1인 기준'` | 상수 1개 교체 |
| **C9** | **FAQ 문안 보완** — 기존 2번 문항("개인 자격 신청 불가")과 신규 문항("1명부터 신청 가능")의 인접 노출 | 삽입 위치를 기존 2번 문항 **직후**로 배치해 보완 설명으로 읽히게 함(§4-3 ②) | (a) 기존 답변 말미 보완 또는 (b) 신규 답변 앞 명시 — 문안 회신 후 반영 |
| C4 | 환급 전/후 금액 표기 | 환급 문구는 `facts` 게이트 통과분만 | 정책 확정 시 반영 |
| C5 | 회차 정원·최소 개강인원 | 미노출 (원천 M열은 '연간 예상 수요'라 전용 불가) | 노출 결정 시 `KiumSession`에 필드 추가 |
| C7 | 탭 라벨 확정 | `'공개교육'` | `content.ts open.tabLabel` 교체 |

---

**문서 끝**
