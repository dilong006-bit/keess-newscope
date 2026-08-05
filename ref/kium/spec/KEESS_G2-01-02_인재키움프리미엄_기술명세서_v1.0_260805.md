# KEESS 인재키움프리미엄 (/kium) 기술명세서 v1.0

**작성일**: 2026-08-05
**작성자**: HRD사업지원팀 (시니어 풀스택 관점, Claude 협업)
**문서 지위**: /kium 기능 구현의 단일 기준. PRD v1.0의 F-ID를 구현 계약으로 구체화. 사회공헌 기술명세서 최종 v2.0의 저장소 관례(구조·토큰·금지사항 체계)를 승계한다.
**※ 최종 v2.0(260805)이 본 문서를 통합·대체함. 단, 4-1 썸네일 토큰·5장 모션 명세는 v2.0이 본 문서를 참조하므로 보존본으로 유지.**
**대상 저장소**: github.com/dilong006-bit/keess-newscope (Next.js App Router SSG)

---

## 0. 선행 조건 (빌드 착수 게이트)

| # | 항목 | 담당 | 상태 |
|---|---|---|---|
| P1 | `lib/kium/data.ts` 19건 실데이터 사전 제작·소스 대조 검증 | 기획 세션(Claude)·임지홍 | 완료(260805) — build/data.ts·content.ts·소스대조표 |
| P2 | 썸네일 6종 토큰 AA 검증(팔레트 목업) | 기획 세션 | 완료(260805) — 전건 AA 통과(최저 6.19:1, 스크림 시 AAA) |
| P3 | FAQ·CTA 문안 사업 회신 | 지예정 대리 | 대기 — 미회신 시 초안(draft 표기)으로 진행 |
| P4 | 라우트명 확정 | 임지홍 | `/kium` 가칭 — 확정 공지 후 착수 |

## 1. 확정 요구사항 총정리

### 1-1. 노출 정보 화이트리스트

| 화면 | 노출 |
|---|---|
| 히어로 | 확정 카피(메인+하단 2문장) · 주관기관 텍스트 · CTA 2종 |
| 탭1 | 지원개요 4항목 · 자격확인 3경로 · 신청절차 4스텝(주체 2행) · FAQ |
| 탭2 카드 | 썸네일(카테고리 메시+과정명) · 카테고리 라벨 · 소분류 라벨 · 과정명 · summary 1줄 · 대상 · 시간/일수 · AI융합형 배지 · 정부지원 환급 배지 |
| 상세 패널 | 공식 신청명(확정 시) · 훈련목표 · 교육구성 표 · 특장점 3단계 · 슬로건 · 정원/일정/형태 · 과정별 문의 CTA |

### 1-2. 명시적 미노출/미구현

| 항목 | 방침 |
|---|---|
| 단가(원) | 미노출 — "정부지원 환급 대상" 배지로 갈음(B2B 환급 구조) |
| 지원한도 금액·신청 마감·선착순 | 소스 부재 — "기업별 상이→상담 확인" 문구만 |
| 강사 정보 | 1차 미노출(익명 데이터뿐, 웹 게시 동의 별도) |
| NCS 분류 | 미노출(경쟁사 관행 일치 확인) |
| 검색·정렬 옵션·수강평·조회수·개별 상세 라우트·한도 계산기 | 미구현 |
| 실사·외부 이미지 | 0장 — 전 표면 CSS |

## 2. IA / 라우팅

```
app/kium/page.tsx        서버 컴포넌트(정적) — 히어로 + <KiumTabs>
  #intro (기본)          탭1: 개요표 → 자격확인 → 신청절차 → FAQ
  #courses               탭2: 필터 칩 + 그리드 + 인라인 패널
홈(/)                    히어로 캠페인 슬라이드 1장 추가
공통 레이아웃(Nav)        GNB 우측 이벤트 칩 → /kium
```
- 개별 상세 라우트 없음. 해시 라우팅은 클라이언트(`KiumTabs`)에서 처리, 잘못된 해시 → #intro 폴백
- 탭2 필터 상태는 `?cat=` 쿼리 유지(공유 가능), 히스토리 replace

## 3. 데이터 모델 — `lib/kium/data.ts` (F13)

```ts
export type KiumCategory = 'onboarding'|'roleup'|'leadership'|'executive'|'ai'|'common'

export type KiumCourse = {
  id: string                    // 'kium-01'~'kium-19' (HRDK 연번 순)
  category: KiumCategory
  subCategory: string           // 개요서 10종 라벨 (예: '신입사원', '승진자 과정')
  titleMarketing: string        // 개요서 표기 (카드·썸네일용)
  titleOfficial: string         // HRDK 신청명 (패널 caption — 노출은 P3 확정 후 플래그)
  target: string                // 시트3 훈련대상
  hours: number; days: number   // 시트2=개요서 교차검증값
  type: '일반형' | 'AI융합형'
  capacity: number              // 연간 예상 인원
  schedule: string              // '연중상시'
  delivery: string              // '대면·실시간 비대면'
  summary: string               // 시트3 '과정 소개(요약)' 1문장 압축 — 원문 기반, 창작 금지
  slogan: string                // 개요서 하단 슬로건 원문
  goals: string[]               // 시트3 훈련목표
  highlights: {no:string; title:string; desc:string}[]  // 개요서 특장점 3단계
  modules: {area:string; content:string; hours:number}[] // 개요서 교육구성 표
}

export const KIUM_CATEGORY_META: Record<KiumCategory, {label:string; order:number}> = {
  onboarding:{label:'신입·온보딩',order:1}, roleup:{label:'승진자',order:2},
  leadership:{label:'리더십',order:3}, executive:{label:'임원',order:4},
  ai:{label:'AI 실무역량',order:5}, common:{label:'공통 직무역량',order:6},
}
```
- 카테고리 매핑: onboarding=1~3 / roleup=5~7 / leadership=4,18 / executive=8 / ai=9~11 / common=12~17,19
- `lib/kium/queries.ts`: `getAllCourses()`(category order→연번), `getCoursesByCategory(cat)`, `getCourseById(id)`
- 콘텐츠 상수 분리: `lib/kium/content.ts` — 히어로 카피·개요표·자격확인 3경로·스텝 4단계·FAQ(`status:'draft'|'confirmed'` 플래그). **문안 교체 시 컴포넌트 수정 0**이 계약

## 4. 컴포넌트 명세

```
components/kium/
  KiumHero.tsx          F1  서버 — 확정 카피, 90~95% 강조(tabular-nums, 자간 -0.03em), CTA 2종
  KiumTabs.tsx          F2  'use client' — role=tablist, 언더라인 인디케이터 morph, 해시 동기화, 좌우 화살표 키, 전환 시 패널 첫 헤딩 포커스
  KiumOverviewTable.tsx F3  2열 정의표, 값 강조 1건(퍼플), C1 삽입 슬롯 주석 예약
  KiumEligibility.tsx   F4  3경로 카드(01/02/03 미니 스텝) — 데스크톱 3열/모바일 아코디언, 외부링크 새창+rel+"새 창" 텍스트, 하단 대규모기업 제외 caption
  KiumProcess.tsx       F5  4스텝 원형 스텝퍼 — 스텝별 퍼플 심도 4단(기존 퍼플의 opacity/명도 단계, 신규 색 아님), '기업'/'KG에듀원' 2행 칩, 모바일 세로 타임라인
  KiumFaq.tsx           F6  기존 FAQ 아코디언 컴포넌트 재사용(신규 제작 금지), content.ts 참조, draft 상태 시 관리 주석
  KiumCourseGrid.tsx    F7  'use client' — 필터 칩([전체]+6, 카운트 병기), fade 120ms out→stagger in, ?cat= 동기화
  KiumCourseCard.tsx    F7/F8  썸네일+라벨+과정명(2줄 클램프)+summary(1줄)+메타 행. 카드=button, aria-expanded
  KiumThumb.tsx         F8  CSS 메시 표면(4-1 토큰) + 과정명 + 카테고리 미니 라벨. 이미지 태그 없음
  KiumCoursePanel.tsx   F9  데스크톱: 행 아래 전폭 인라인 확장(height morph, 열린 카드 top-stripe 2px) / 모바일(<768px): 바텀시트(포커스 트랩, ESC/스와이프 닫기, dim 40%)
  KiumCtaBand.tsx       F10 기존 도입문의 폼 재사용 — 관심 과정 프리셀렉트, 동의 구조 기존 그대로(신규 수집 항목 추가 금지 — 추가는 G2-11 재검토 트리거)
홈/레이아웃:
  HomeHeroKiumSlide     F11 확정 카피 축약형, 기존 히어로 문법 상속
  NavKiumChip           F12 pill, 퍼플 배경, 모션 금지, 히트영역 44px
```

### 4-1. 썸네일 토큰 (F8) — AA 검증 완료(260805 팔레트 목업)

```css
.kium-thumb{ aspect-ratio:4/3; background:
  radial-gradient(120% 90% at 85% 12%, var(--mesh-b) 0%, transparent 55%),
  radial-gradient(110% 100% at 68% 78%, var(--mesh-a) 0%, transparent 60%),
  linear-gradient(150deg, var(--mesh-base) 0%, var(--mesh-dark) 100%); }
/* 공통: --mesh-base:#2E1A6B; --mesh-dark:#1B0F45 (최암부, 좌하단 도달 — 텍스트 앵커) */
/* onboarding --mesh-a:#2451B8 --mesh-b:#5B8DEF | roleup #6D28D9/#A78BFA | leadership #312E81/#6366F1
   executive #1E2A5E/#C9A227(15% 미량) | ai #0E7490/#22D3EE | common #4B4B63/#9CA3AF */
```
- 과정명: 좌하단, 흰색 600, 15~17px. 하단 40% 스크림 `linear-gradient(transparent, rgba(20,10,50,.35))` — 스크림 포함 시 전건 7:1(AAA)
- 호버: 그라디언트 변화 금지 — 카드 공통 모션만

## 5. 모션 명세
사회공헌 최종 v2.0 5장 공통 규칙 전면 승계: **기존 저장소 토큰(300ms 전환·90ms stagger·기존 easing)만 사용, 신규 토큰 금지**, `transition: all` 금지, 전 hover=focus-visible 동일, `prefers-reduced-motion` 시 transform 제거.

| # | 대상 | 스펙 |
|---|---|---|
| K1 | 탭 인디케이터 | translateX morph 300ms, 패널 교체 out 120ms→in 300ms(+8px) |
| K2 | 카드 hover | translateY(-4px)+그림자 승격 (사회공헌 M2 동일) |
| K3 | 패널 열림 | grid-template-rows 0fr→1fr(height morph), 내부 stagger 90ms |
| K4 | 바텀시트 | translateY 100%→0 300ms, 배경 dim fade |
| K5 | 스텝퍼 진입 | 좌→우 stagger 90ms |
| K6 | 필터 교체 | out fade 120ms → in stagger(FLIP 금지) |

## 6. 빌드 리소스 체인

| 용도 | 도구 | 방침 |
|---|---|---|
| 아이콘 | `lucide-react`(npm, MIT) | 유일 아이콘 소스. Flaticon류 다운로드 금지(출처표기 의무) |
| 썸네일 | 자체 CSS 토큰(원본) | MagicPattern·learnui는 시안 탐색 전용, 산출물 커밋 금지 |
| 히어로 오브젝트 | 정적 CSS 기본, C2 시 `@firecms/neat` 1곳 한정 | 카드 19개 WebGL 금지(컨텍스트 상한) |
| 대비 검증 | 빌드 스크립트(`scripts/check-contrast.mjs`) — 6카테고리×스크림 유무 WCAG 계산 | CI성 검증, QA 체크리스트 연동 |
| Figma 동기화 | Figma MCP(확정 토큰 → [G2-03] 파일 팔레트 시트) | 빌드 후 별도 태스크 |
| QA | 저장소 스킬(full-page-screenshot·playwright-skill — 부재 시 KEESS_B-Type/.claude/skills에서 복사) | 3뷰포트 회귀 스크린샷 |

## 7. 금지사항
1. 데이터 창작·보강 금지 — data.ts 수치·문안은 소스 문서 외 출처 금지, 오탈자는 보고만
2. 단가·지원한도 금액·마감·강사 정보 노출 금지 (1-2)
3. 실사·외부 이미지·이미지 파일 썸네일 금지 — 전 표면 CSS
4. 신규 색상·신규 디자인 토큰 추가 금지 — 메시 변수는 `styles/kium.css` 스코프 한정, 전역 토큰 오염 금지
5. 필러 컬러(P1~P4) 사용 금지
6. GNB 정식 메뉴 추가 금지(이벤트 칩만)
7. GA4/GTM 코드 직접 삽입 금지
8. `dangerouslySetInnerHTML`·`transition:all` 금지
9. 카드 WebGL/Canvas 렌더 금지
10. FAQ 확정 전 draft 표기 제거 금지 / 검토 전 git commit·push 금지

## 8. QA 체크리스트
- [ ] `npm run build` 경고·에러 0, /kium 정적 생성
- [ ] data.ts 19건 ↔ 소스 대조표 전건 일치(시간·일수·대상·유형·정원)
- [ ] 썸네일: 이미지 요청 0, 6카테고리 표면 스냅샷 일치, 과정명 대비 스크립트 통과(AA)
- [ ] 탭: #courses 딥링크·뒤로가기·화살표 키·포커스 이동
- [ ] 필터: 칩 6+전체, 카운트(3/3/2/1/3/7), ?cat= 공유 재현
- [ ] 패널: 19건 전 필드 렌더, 데스크톱 인라인/모바일 바텀시트 분기(768px), 포커스 트랩·ESC
- [ ] CTA: 패널→폼 프리셀렉트, 기존 동의 구조 변형 없음
- [ ] 미노출 검증: 단가·한도금액·강사·NCS·검색 UI 부재
- [ ] reduced-motion 시 transform 0, hover=focus-visible 동일
- [ ] 375/768/1280 스크린샷(스킬), Lighthouse 접근성 기존 대비 하락 없음

## 9. Claude Code 빌드 프롬프트
※ 최종 v2.0 8장으로 대체됨 — 본 문서의 프롬프트는 사용하지 않는다.

## 10. 남은 결정·후속
- 최종 v2.0 9장 참조
