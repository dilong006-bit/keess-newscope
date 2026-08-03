# KEESS 사회공헌 기술명세서 — 최종 v2.0

**작성일**: 2026-08-03
**작성자**: HRD사업지원팀 (Claude 협업)
**문서 지위**: 본 문서가 사회공헌 기능의 **최종 단일 기준**. 기술명세서 v1.0(260803)·업데이트전략 v2.0(260803)을 통합·대체한다. 1차 구현(v1.0 기준, 2026-08-03 완료)에 대한 **개정 작업 지시서**를 겸한다.

---

## 0. 변경 이력 및 근거 문서

| 버전 | 내용 |
|---|---|
| v1.0 | 최초 명세 — 42건 가정, 쌤플러스 수집, date 표기, 검색·조회수 미정 |
| 전략 v2.0 | 전수조사 반영 — 36건 확정, kggroup 원문 URL, 날짜 미표기, 계열사 배지 |
| **최종 v2.0 (본 문서)** | + 검색·조회수 미노출 확정, 조회수 백단 집계 방침, hover 모션 명세, 실데이터 적재 완료 반영, 최종 빌드 프롬프트 |

근거: `사회공헌_원문URL_전수조사결과_260803`, `사회공헌_업데이트전략_v2.0_260803`, 수집 완료 자산(`KEESS_NEWSCOPE\img\` — 이미지 81개 + `data.ts`)

## 1. 확정 요구사항 총정리

### 1-1. 노출 정보 화이트리스트 (이외 정보는 화면에 내지 않는다)

| 화면 | 노출 |
|---|---|
| 목록 카드 / 홈 밴드 카드 | **썸네일 · 계열사 배지 · 제목 · 본문 요약(2줄)** |
| 상세 페이지 | **계열사 배지 · 제목 · 본문 전체(문단+이미지) · 원문 링크** |

### 1-2. 명시적 미노출 항목

| 항목 | 방침 | 비고 |
|---|---|---|
| 게시글 검색 | **기능 자체 미구현** | 36건 고정 콘텐츠 + 더보기로 충분. 검색 UI·라우트·파라미터 일절 없음 |
| 조회수 | **UI 미노출** | 백단 집계는 1-3 참조 |
| 날짜 | **UI 미노출** | 실제활동일자 확정 불가. `sortDate`는 정렬 전용 |
| 등록일·조회수 등 게시판 잔재 | 미노출 | 원본 게시판(gnuboard)의 메타 표기를 이식하지 않는다 |

### 1-3. 조회수 백단 집계 방침 (개발자 전달용)

KEESS는 SSG 정적 사이트로 자체 서버·DB·ADMIN이 없다. 따라서 조회수는 **GA4 페이지뷰 집계로 갈음하는 것을 표준안으로 제안**한다.

- `/csr/[id]` 라우트가 게시글별 고유 URL이므로, GA4 `page_view` 이벤트가 곧 게시글별 조회수가 된다. **추가 개발 0** — 기존 `KEESS_GA4_최소적용범위_MVP` 설계(GTM 컨테이너)에 자동 포함되는 범위인지만 확인하면 됨
- GA4 탐색 보고서에서 "페이지 경로 시작값 = /csr/" 필터로 게시글별 조회수 집계/정렬 가능
- 별도 요구(실시간 카운터, DB 적재 등)가 나오면 그때 서버리스 함수+KV 방안을 검토하되, **현 단계 코드에는 조회수 관련 로직을 일절 넣지 않는다** (GA/GTM 코드 직접 삽입 금지 원칙 유지 — GTM은 별도 트랙)

## 2. IA / 라우팅 (변경 없음 + 명시 사항)

```
/                  홈 — 사회공헌 밴드(6건) 기존 반영분 유지
/csr               목록 — 36건, 더보기 12건×3
/csr/[id]          상세 — csr-001 ~ csr-036 (36개 정적 생성)
Footer             "사회공헌" 링크 유지
```

- 검색 라우트·쿼리 파라미터 없음. `generateStaticParams` 36건, `dynamicParams = false`
- GNB 편입 없음 (v1.0 유지)

## 3. 데이터 모델 — 확정 (실데이터 적재 완료)

`lib/csr/data.ts`는 **이미 36건 실데이터로 생성 완료**되어 `KEESS_NEWSCOPE\img\data.ts`에 있다. 빌드 작업은 이 파일을 검증 후 `lib/csr/data.ts`로 교체하는 것이지, 데이터를 새로 만드는 것이 아니다.

```ts
export type CsrPost = {
  id: string                 // 'csr-036' ~ 'csr-001'
  title: string
  affiliate: string          // 계열사 배지 (KG그룹/KG에듀원/KG스틸/KG이니시스/KG모빌리티/KG케미칼/KG에코솔루션/KG ETS/이데일리 등)
  sortDate: string           // 정렬 전용 — UI 미노출
  summary: string            // 본문 첫 문단 90자
  thumbnail?: { src: string; alt: string }
  body: CsrBodyBlock[]       // paragraph | image
  sourceUrl: string          // kggroup.co.kr 개별 원문 (전건 존재)
  collectedAt: string
}
```

쿼리 함수(`lib/csr/queries.ts`) 개정: `getAllCsrPosts()`(sortDate desc), `getCsrPostById(id)`, `getAdjacentCsrPosts(id)`, `getHomeBandCsrPosts(6)` — 기존 시그니처 유지하되 정렬 키를 `sortDate`로 변경.

이미지: 81개 파일이 `img/` 에 준비됨 → **`public/img/`로 이동 배치**. data.ts의 src가 `/img/...` 경로를 참조하므로 경로 일치 필수. 명명 규칙 `csr-{번호3자리}-{순번2자리}.{ext}`, 카드용 `-thumb` 접미사. 예외: `csr-017-01.jpg`는 원본 부재로 600px 단일본(썸네일·본문 겸용).

## 4. 컴포넌트 명세 (개정 델타)

### 4-1. CsrCard.tsx (개정)
- 구조: 썸네일(16:9, `overflow:hidden`, concentric radius) → 계열사 배지(`.badge-pill` 재사용) → 제목(2줄 클램프) → 요약(2줄 클램프)
- **날짜 표기 제거**, 조회수·검색 관련 없음
- 카드 전체가 상세로의 단일 링크 (`aria-label="{affiliate} 사회공헌 활동: {title}"`)
- 썸네일 없는 케이스: 현행 그라디언트 플레이스홀더 유지 (36건 전건 썸네일 보유이나 방어 로직 유지)

### 4-2. CsrListGrid.tsx (신규, 클라이언트 컴포넌트)
- `'use client'` + `useState`로 표시 수 관리: 초기 12 → 클릭당 +12 → 36 도달 시 버튼 미렌더
- 카운터: "전체 36건 중 {n}건 표시" (`aria-live="polite"`)
- 더보기로 새로 나타나는 카드에만 기존 stagger(90ms) 등장 모션 적용
- 페이지 라우팅·URL 파라미터 사용 금지 (스크롤 위치 보존)

### 4-3. app/csr/page.tsx (개정)
- 서버 컴포넌트 유지, 36건을 `CsrListGrid`에 전달
- 검색 폼·필터 UI 없음

### 4-4. app/csr/[id]/page.tsx (개정)
- 헤더: 계열사 배지 + 제목 (날짜 줄 삭제)
- 본문: `CsrBody` (변경 없음 — 연속 이미지 2열 그리드, dangerouslySetInnerHTML 금지)
- 출처 박스: **"출처: KG그룹 공식 사회공헌 페이지"** + "원문 보기" 버튼 → `sourceUrl` 새 탭(`rel="noopener noreferrer"`)
- 이전/다음 글 내비게이션 유지 (sortDate 순)

### 4-5. CsrHomeBand.tsx (개정)
- 타이틀: 무시제 — "KG그룹 사회공헌 활동" (날짜 미노출이므로 "최신" 표현 지양)
- 6건, 카드 스펙은 4-1과 동일

## 5. 모션 명세 (STEP 0 트렌드 검증 완료)

**트렌드 근거**: 2026 현재 카드 hover 주류 패턴 = ① 컨테이너 고정 + 이미지만 미세 줌(scale 1.03~1.05) ② 카드 리프트(translateY)+그림자 승격 ③ 링크 어포던스(화살표 슬라이드). linear easing·과한 줌(1.1+)·회전은 안티패턴. — 본 명세는 이 패턴을 **기존 코드베이스 토큰(300ms 전환, 90ms stagger, 브랜드 퍼플) 범위 내**로 번역한 것이며, 새 색상·새 easing 토큰 추가 금지 원칙을 유지한다.

| # | 대상 | 트리거 | 스펙 |
|---|---|---|---|
| M1 | 카드 썸네일 이미지 | 카드 hover / focus-visible | `transform: scale(1.04)` — 300ms, 기존 ease-out 계열 토큰. 부모 컨테이너 `overflow:hidden` + radius 유지(이미지가 모서리를 뚫지 않음) |
| M2 | 카드 전체 | hover / focus-visible | `translateY(-4px)` + 그림자 한 단계 승격(기존 shadow 토큰 상위 레벨 재사용). 300ms 동시 진행 |
| M3 | 카드 제목 | hover | 색상만 브랜드 퍼플 계열로 전환(기존 링크 hover 색 규칙 재사용). 밑줄 금지(카드 전체가 링크이므로 과잉 신호) |
| M4 | 상세 진입 어포던스 (카드 하단 "자세히 보기" 표기 또는 화살표) | hover | 화살표 `translateX(4px)` 300ms. 텍스트 표기 시 화살표만 이동, 텍스트는 고정 |
| M5 | 출처 박스 "원문 보기" 버튼 | hover / focus-visible | 배경 톤 1단계 상승 + 외부링크 아이콘 `translateX(2px)`. 300ms |
| M6 | 목록 카드 등장 | 최초 로드·더보기 클릭 | 기존 구현의 stagger 90ms + translateY(8px→0) + opacity 유지. 더보기 시 신규 12장에만 적용 |

**공통 규칙**
- `transition` 속성은 `transform, box-shadow, color, background-color`로 한정 — `all` 금지 (레이아웃 속성 전환 방지)
- `@media (prefers-reduced-motion: reduce)`: M1·M2·M4·M6의 transform 모션 제거, 색상 전환만 유지
- hover 전용 어포던스 금지 — 모든 hover 모션은 `:focus-visible`에도 동일 적용 (키보드 접근성)
- 터치 디바이스: hover 모션 미발동이어도 기능 손실 없음 (모션은 장식, 탐색은 탭)

## 6. 파일 배치 계획

```
[준비 완료 — KEESS_NEWSCOPE\img\]
img/csr-*.{jpg,png}      81개  →  public/img/ 로 이동
img/data.ts                    →  lib/csr/data.ts 로 교체(기존 샘플 데이터 대체)
img/csr-collected-260803.json  →  저장소에 포함하지 않음 (수집 원본 기록, 별도 보관)
```

- 미사용 여분 5개(`csr-021-02~06-thumb.*`)는 삭제 가능(본문은 원본 사용)
- 총 51MB — git LFS 불필요 범위이나, 커밋 전 용량 고지

## 7. 금지사항 (최종판)

1. 콘텐츠 창작·보강 금지 — data.ts의 본문을 임의 수정하지 않는다 (오탈자 발견 시 보고만)
2. `dangerouslySetInnerHTML` 금지
3. 외부 이미지 핫링크 금지 — 전건 `public/img/` 로컬 자산
4. GNB 추가 금지
5. 날짜·조회수·검색 UI 금지 (본 문서 1-2)
6. GA4/GTM 코드 직접 삽입 금지
7. 신규 색상·신규 디자인 토큰 추가 금지 — 기존 토큰 재사용
8. `transition: all` 금지
9. alt 없는 이미지 금지
10. 검토 전 git commit/push 금지

## 8. QA 체크리스트

- [ ] `/csr` 36건 정상 렌더, 더보기 12→24→36 후 버튼 소멸
- [ ] 상세 36개 라우트 빌드 성공 (`generateStaticParams`)
- [ ] 카드·상세 어디에도 날짜/조회수/검색 UI 없음
- [ ] 원문 링크 36건 새 탭 열림 + `rel` 속성
- [ ] 이미지 76개 참조 전건 로드 (404 없음), alt 전건 존재
- [ ] hover 모션: 썸네일 줌 시 모서리 오버플로 없음, focus-visible 동일 동작
- [ ] `prefers-reduced-motion` 시 transform 모션 비활성
- [ ] 모바일(375px)·태블릿(768px)·데스크톱(1280px) 그리드 확인
- [ ] `npm run build` 경고·에러 0
- [ ] Lighthouse 접근성 지표 기존 대비 하락 없음

## 9. Claude Code 빌드 프롬프트 (로컬 실행용 — 아래 전체를 복사해 사용)

```
당신은 KEESS(keess-newscope) 저장소에서 사회공헌(/csr) 기능을 최종 명세 v2.0으로 개정하는 시니어 프론트엔드 개발자입니다. 기존 1차 구현이 완료된 상태이며, 이번 작업은 "데이터 교체 + UI 개정"입니다. 창작하지 말고 지시된 범위만 수행하세요.

[작업 0 — 사전 확인]
- lib/csr/, components/csr/, app/csr/, styles/csr.css 존재 확인 (1차 구현물)
- 저장소 루트의 img/ 폴더 확인: csr-*.jpg/png 81개 + data.ts 가 있어야 함. 없으면 중단하고 보고

[작업 1 — 자산 배치]
- img/ 의 이미지 전부를 public/img/ 로 이동 (data.ts, csr-collected-260803.json 제외)
- img/data.ts 를 lib/csr/data.ts 로 교체 (기존 샘플 데이터 파일 덮어쓰기)
- img/csr-collected-260803.json 은 저장소에 포함하지 말 것 (필요 시 .gitignore 처리)
- csr-021-02-thumb ~ csr-021-06-thumb 5개 파일은 삭제
- 이동 후 img/ 빈 폴더 제거

[작업 2 — 타입·쿼리 개정]
- lib/csr/types.ts: 새 data.ts의 타입(CsrPost: affiliate, sortDate 추가 / date 제거)과 일치시킴. data.ts 안에 타입이 내장되어 있으므로 types.ts가 data.ts의 타입을 re-export 하거나, 타입 정의를 types.ts로 옮기고 data.ts가 import 하도록 정리 (한 곳에서만 정의)
- lib/csr/queries.ts: 정렬 키를 date → sortDate 로 변경. getAllCsrPosts / getCsrPostById / getAdjacentCsrPosts / getHomeBandCsrPosts(6) 시그니처 유지
- CSR_CATEGORY_LABEL 상수를 쓰는 곳이 있으면 affiliate 필드 사용으로 교체

[작업 3 — 카드 개정 (components/csr/CsrCard.tsx)]
- 날짜 표기를 완전히 제거
- 계열사 배지 추가: 기존 .badge-pill 스타일 재사용, 텍스트 = post.affiliate
- 구성: 썸네일(16:9, overflow hidden) → 배지 → 제목(2줄 클램프) → summary(2줄 클램프)
- 카드 전체 단일 링크, aria-label="{affiliate} 사회공헌 활동: {title}"
- 조회수·날짜·검색 관련 요소가 남아있다면 모두 제거

[작업 4 — 목록 더보기 (components/csr/CsrListGrid.tsx 신규)]
- 'use client' 컴포넌트. props로 전체 포스트 배열을 받아 useState로 표시 수 관리
- 초기 12건, "더보기" 클릭당 +12, 36 도달 시 버튼 미렌더
- 버튼 위 카운터: "전체 36건 중 {n}건 표시", aria-live="polite"
- URL 파라미터·라우팅 사용 금지
- app/csr/page.tsx 는 서버 컴포넌트 유지, getAllCsrPosts() 결과를 CsrListGrid에 전달. 검색 폼/필터 절대 추가하지 말 것

[작업 5 — 상세 개정 (app/csr/[id]/page.tsx)]
- 헤더에서 날짜 줄 제거, 계열사 배지 + 제목만
- 출처 박스 문구: "출처: KG그룹 공식 사회공헌 페이지" + "원문 보기" 링크(sourceUrl, target=_blank, rel="noopener noreferrer")
- CsrBody 로직은 유지 (dangerouslySetInnerHTML 금지 유지)
- 이전/다음 글 내비 유지 (sortDate 순)

[작업 6 — 홈 밴드 개정 (components/csr/CsrHomeBand.tsx)]
- 밴드 타이틀을 무시제로: "KG그룹 사회공헌 활동" ("최신" 등 시제 표현 제거)
- 카드 스펙은 작업 3과 동일 (같은 CsrCard 재사용 확인)

[작업 7 — 모션 (styles/csr.css)]
기존 토큰·기존 duration(300ms)·기존 easing만 사용. 새 토큰 추가 금지. transition 속성은 transform, box-shadow, color, background-color 로 한정(all 금지).
- 카드 hover/focus-visible: 카드 translateY(-4px) + 그림자 한 단계 승격(기존 shadow 토큰 상위 레벨), 썸네일 이미지 scale(1.04) — 부모 overflow:hidden으로 모서리 유지
- 카드 제목 hover: 기존 링크 hover 색 규칙의 브랜드 퍼플로 색만 전환, 밑줄 없음
- 상세 진입 화살표(카드에 있다면): hover 시 translateX(4px)
- 원문 보기 버튼 hover/focus-visible: 배경 톤 1단계 + 아이콘 translateX(2px)
- 더보기로 추가되는 카드에만 기존 stagger 등장 모션(90ms, translateY 8px→0 + opacity) 적용
- @media (prefers-reduced-motion: reduce) { transform 기반 모션 전부 제거, 색상 전환만 유지 }
- 모든 hover 모션은 :focus-visible 에도 동일 적용

[작업 8 — 빌드·검증·보고]
- npm run build 실행, 경고·에러 0 확인. /csr 상세 36개 라우트 생성 확인
- 다음을 표로 보고: (1) 파일 변경 목록 (2) 이미지 배치 결과(개수) (3) 날짜/조회수/검색 UI 부재 확인 (4) 빌드 결과 (5) 명세와 다르게 판단한 부분과 사유
- git commit/push 하지 말 것 — 검토 후 별도 지시

[금지사항]
콘텐츠 수정/창작 금지, dangerouslySetInnerHTML 금지, 외부 이미지 핫링크 금지, GNB 추가 금지, 날짜/조회수/검색 UI 금지, GA·GTM 코드 삽입 금지, 신규 색상·토큰 추가 금지, transition:all 금지, alt 누락 금지, 무단 커밋 금지
```

## 10. 남은 결정·후속 사항

- [ ] 조회수 백단 집계: GA4 표준안(1-3)을 개발 채널에 전달 — 임지홍 (추가 개발 없이 GTM 범위 확인이 핵심)
- [ ] 빌드 완료 후 로컬 확인 → git push → Vercel 프리뷰 → 검수 (기존 절차)
- [ ] kggroup 원문 링크 36건 분기 1회 생존 점검 (운영 체크리스트)
- [ ] 다운로드 폴더의 수집 임시 파일(csr-*) 정리 — 임지홍
