# KEESS 인재키움프리미엄 (/kium) 기술명세서 — 최종 v2.0

**작성일**: 2026-08-05
**문서 지위**: /kium 구현의 **최종 단일 기준**. 기술명세서 v1.0을 통합·대체한다. PRD v1.0 + upgrade-01의 F-ID를 구현 계약으로 구체화. 저장소 관례는 사회공헌 최종 v2.0 체계 승계.
**대상 저장소**: github.com/dilong006-bit/keess-newscope (Next.js App Router SSG)

## 0. 변경 이력

| 버전 | 내용 |
|---|---|
| v1.0 | 최초 명세 — FAQ·CTA 미확정 슬롯, 신청절차 추상 4스텝 |
| **최종 v2.0 (본 문서)** | + FAQ 7문항 탑재(draft 게이트) + CTA 확정안(정부 지원 칩·태깅·프리필) + 신청절차 실무 콘텐츠 확정 + 유의사항 캡션 + 공식 원천 링크 체계 + 수치 검증 게이트 + 빌드 프롬프트 갱신 |

## 1. 확정 요구사항 총정리

### 1-1. 노출 정보 화이트리스트

| 영역 | 노출 |
|---|---|
| 히어로 | 확정 카피 · 주관기관 텍스트(고용노동부·한국산업인력공단) · CTA 2종 |
| 탭1 | 지원개요 4항목 · 자격확인 3경로(공식 원천 링크) · 신청절차 4스텝(기업/KG 2행) · **유의사항 3종** · FAQ 7문항 |
| 탭2 | 카드: 썸네일(카테고리 메시+과정명)·카테고리/소분류 라벨·과정명·summary·대상·시간/일수·AI융합형 배지·정부지원 환급 배지 / 패널: 훈련목표·교육구성 표·특장점 3단계·슬로건·운영 메타·과정별 문의 CTA |
| CTA | 기존 도입문의 폼 + '정부 지원' 칩(총 6개) |

### 1-2. 명시적 미노출/금지 (오제공 방지 핵심)

| 항목 | 방침 |
|---|---|
| **미검증 제도 수치** — 환급율 지역·방식 세분(수도권 90/비수도권 95), 신청 기한 세부(4일 전/14일 전), 환급 소요기간(2주+7~10일) | **verified=false → 렌더 차단** (facts 게이트). 공고 2025-237호 원문 검증 후 해제. 대체 문구: "기업별 상이 — 상담 시 확인" |
| **경쟁 훈련기관 링크**(KPC·에이블런 등) | 게재 금지 — 외부 링크는 정부·공단 도메인만 (work24.go.kr, total.comwel.or.kr, hrdkorea.or.kr) |
| 단가(원)·강사 정보·NCS 분류 | 미노출 (v1.0 유지) |
| "환급 대행" 표현 | 금지 — 사업 확정 전 "안내·동행"만 (행정 지원 범위 미확정) |
| 검색·정렬 옵션·수강평·개별 상세 라우트·한도 계산기·실사 이미지 | 미구현/0장 (v1.0 유지) |

※ verified=true 전환 완료(260805, 공단 홍보자료 별첨5 근거): 지원율 90%(실 납부액 기준·비수도권 우대) / 지원한도 개산보험료 240%(최소 500만원) / 사업주 명의 계좌 환급 / 고용24 한도 조회 경로

## 2. IA / 라우팅 (v1.0 유지 + 링크 맵 확정)

```
app/kium/page.tsx   #intro(기본) | #courses — 해시 탭, ?cat= 필터 쿼리
홈(/) 히어로 캠페인 슬라이드 1장 · Nav 이벤트 칩 → /kium
```

**외부 링크 맵 (전건 새창 + rel + "새 창" 텍스트 고지)**
| 위치 | 링크 | 도메인 |
|---|---|---|
| 자격확인 방법1 | 고용24 | work24.go.kr |
| 자격확인 방법2 | 고용·산재보험 토탈서비스 | total.comwel.or.kr |
| 제도 근거 표기 | HRDK 공고 2025-237호 | hrdkorea.or.kr |

## 3. 데이터 모델

### 3-1. `lib/kium/data.ts` — KIUM_COURSES 19건 (v1.0 3장과 동일, 변경 없음. 사전 제작·소스 대조 완료 = ref/kium/build/data.ts)

### 3-2. `lib/kium/content.ts` — 콘텐츠 상수 (확정 구조, 실파일 = ref/kium/build/content.ts)

```ts
export const KIUM_CONTENT = {
  hero: { copyMain, copySub, agencies: ['고용노동부','한국산업인력공단'] },   // 확정 카피 원문
  overview: [ {label, value} ],                                            // 지원개요 4항목
  eligibility: { paths: [...3경로], exclusion: '대규모기업 환급 불가 고지' },
  steps: [ { title, corp, kg } ],       // 4스텝 — 문안은 부록 A 표 그대로, 임의 수정 금지
  cautions: [ ...3종 ],                 // 부록 B 그대로
  faq: [ { q, a, status: 'draft'|'confirmed' } ],   // 7문항 — FAQ 초안 v1.0 xlsx 그대로
  officialLinks: [ { label, url } ],    // 2장 링크 맵만
  facts: [ { key, value, verified: boolean, source } ],  // 검증 게이트 — verified=false는 렌더 금지
  leadSource: 'kium',
}
```
- **facts 게이트 구현 계약**: 렌더 컴포넌트는 `facts.filter(f => f.verified)`만 소비. 미검증 항목 접근 시 개발 모드 콘솔 경고 + 대체 문구 출력
- **부록 A(스텝 문안)·부록 B(유의 문안)는 본 문서 하단에 원문 고정** — 빌드 시 그대로 이식

## 4. 컴포넌트 명세 (v1.0 대비 델타)

| 컴포넌트 | 상태 | 내용 |
|---|---|---|
| KiumHero / KiumTabs / KiumOverviewTable / KiumCourseGrid / KiumCourseCard / KiumThumb / KiumCoursePanel | 유지 | v1.0 4장 명세 그대로 (썸네일 토큰 4-1 포함) |
| KiumEligibility | **개정** | 외부 링크를 2장 링크 맵으로 교체(KPC 링크 사용 금지) |
| KiumProcess | **개정** | 스텝 2행 문안 = content.ts steps(부록 A). "대행" 표현 금지 |
| **KiumCautions** | **신설** | 신청절차 하단 caution 3종 — surface 배경 박스, 아이콘(lucide `alert-circle`), 12~13px, 리스트 시맨틱(ul) |
| KiumFaq | **개정** | content.ts faq 7문항 렌더. status='draft' 항목에 개발 모드 주석·관리 표기 |
| KiumCtaBand | **개정(확정)** | ①기존 폼 재사용 ②관심 영역 칩 '정부 지원' 추가(총 6) ③/kium 경유 진입 시 칩 프리셀렉트(해제 가능) ④제출 페이로드에 `lead_source:'kium'` 비노출 필드 ⑤패널 CTA 경유 시 문의 내용 `[관심 과정: {titleMarketing}]` 프리필(편집 가능). 신규 수집 필드·동의 변경 절대 금지 |

- 썸네일 시스템·모션(K1~K6)·반응형·접근성 체크리스트는 v1.0 4-1·5장·UIUX 고도화전략 그대로 승계

## 5. 빌드 리소스 체인 (v1.0 6장 유지 + 추가)
- 추가: (C3 승인 시) `public/docs/` 에 고용24 비용신청 매뉴얼 PDF 배치 + 출처 표기("한국산업인력공단 배포") — 승인 전 미배치
- lucide-react 유일 아이콘 / 썸네일 CSS 토큰 원본 / 히어로 neat 옵션 / check-contrast.mjs / full-page-screenshot QA — 전부 유지

## 6. 금지사항 (최종판)
1. 데이터·문안 창작 금지 — data.ts·content.ts(부록 A·B 포함) 원문 외 출처 금지, 오탈자는 보고만
2. **verified=false 수치 렌더 금지** — facts 게이트 우회 금지
3. **경쟁 훈련기관 URL 게재 금지** — 외부 링크는 2장 맵 3종만
4. **"대행" 표현 금지** — "안내·동행"만
5. 단가·강사·NCS·환급 소요기간 노출 금지
6. 신규 수집 폼 필드·동의 문구 변경 금지 (CTA는 칩 옵션+비노출 태깅+프리필만)
7. 실사·외부 이미지·이미지 파일 썸네일 금지 / 카드 WebGL 금지
8. 신규 색·토큰 금지 / 필러 컬러 금지 / GNB 정식 메뉴 금지
9. GA4·GTM 코드 직접 삽입 금지 (lead_source는 폼 데이터 필드)
10. dangerouslySetInnerHTML·transition:all 금지 / 검토 전 commit·push 금지

## 7. QA 체크리스트 (오제공 0 검증 중심)
- [ ] **수치-소스 대조표 전건 일치**: 화면의 모든 숫자(90~95%·19과정 메타·시간/일수)를 소스 문서와 1:1 대조, 불일치 0
- [ ] **미검증 수치 렌더 0건**: facts에서 verified=false 항목이 화면 어디에도 없음
- [ ] **외부 링크 전건 정부·공단 도메인** + 새창·rel·텍스트 고지
- [ ] "대행"·소요기간·단가·강사·NCS 문자열 전역 검색 0건
- [ ] FAQ 7문항 렌더·문안 xlsx 일치, 스텝 2행·유의 3종 부록 원문 일치
- [ ] CTA: '정부 지원' 칩 동작(프리셀렉트+해제), lead_source 페이로드 포함·UI 미노출, 프리필 편집 가능, 동의 구조 무변경
- [ ] v1.0 8장 항목 전건(빌드 0경고·썸네일 AA 스크립트·탭 접근성·반응형 3뷰포트·reduced-motion)

## 8. Claude Code 빌드 프롬프트 (선행 조건 P1·P2 충족 — 사용 가능)

```
당신은 keess-newscope 저장소에 인재키움프리미엄(/kium)을 구현하는 시니어 프론트엔드 개발자입니다. 창작 금지, 본 명세(최종 v2.0)와 v1.0 4-1 썸네일 토큰·5장 모션만 근거로 수행하세요.

[작업 0] /csr 구현·기존 토큰 확인. **ref/kium/build/ 에 사전 제작본 data.ts·content.ts 존재 확인** — 없으면 중단·보고. (lib/kium/은 아직 없음이 정상)
[작업 1] ref/kium/build/data.ts·content.ts 를 **lib/kium/ 으로 복사 배치**(원본은 ref에 보존, 내용 수정 금지) + queries.ts 작성 (getAllCourses: 카테고리 order→연번). facts 게이트 유틸 작성: verified=false 접근 시 대체 문구 반환 + dev 경고.
[작업 2] app/kium/page.tsx — 히어로+KiumTabs(#intro/#courses 해시, role=tablist, 화살표 키, 폴백).
[작업 3] 탭1 — KiumOverviewTable / KiumEligibility(외부 링크는 content.ts officialLinks 3종만 — KPC 등 다른 URL 삽입 금지) / KiumProcess(steps 2행 원문 그대로, 퍼플 심도 4단, 모바일 타임라인) / KiumCautions 신설(3종, lucide alert-circle) / KiumFaq(7문항, 기존 아코디언 재사용).
[작업 4] 탭2 — v1.0 작업 5와 동일(필터 칩·카드·KiumThumb CSS 토큰·인라인 패널/바텀시트). 패널 CTA → 폼 이동 시 문의 내용에 "[관심 과정: {titleMarketing}]" 프리필.
[작업 5] CTA — 기존 도입문의 폼 재사용. 관심 영역 칩 '정부 지원' 추가(총 6). /kium 경유 진입 시 칩 프리셀렉트(해제 가능) + 제출 페이로드 lead_source:'kium'(비노출). 폼 필드·동의 구조 절대 변경 금지.
[작업 6] 진입 — 홈 히어로 캠페인 슬라이드 1장(확정 카피 축약) + Nav 이벤트 칩(pill, 모션 금지, 44px).
[작업 7] styles/kium.css — v1.0 5장 K1~K6, 기존 토큰만, transition 속성 한정, reduced-motion, hover=focus-visible.
[작업 8] lucide-react 설치. scripts/check-contrast.mjs(6카테고리×스크림, AA 미달 exit 1).
[작업 9] 검증·보고 — npm run build 0경고. 다음 표 보고: (1)파일 목록 (2)data 19건 소스 대조 확인 (3)대비 스크립트 결과 (4)금지어 전역 검색 결과("대행"/KPC URL/단가/NCS 등 0건 확인) (5)verified=false 렌더 0건 확인 (6)명세와 달리 판단한 부분·사유. 스킬 있으면 375/768/1280 스크린샷. commit/push 금지.
[금지] 본 문서 6장 전 항목.
```

## 9. 남은 결정·후속
- [x] P1: data.ts·content.ts 제작(소스 대조표 포함) — 완료(260805)
- [x] P2: 썸네일 팔레트 목업 AA 확정 — 완료(260805, 전건 AA·스크림 시 AAA)
- [ ] 공고 2025-237호 원문(HWP→PDF 변환본) 검증 → facts 잔여 3건 verified 전환
- [ ] 사업 확인 4건: FAQ 검수 / CTA 추가 항목 / 찾아가는 훈련 운영 여부 / KPC 참고 링크 대체 고지 (+C3 매뉴얼 게재 승인)
- [ ] 정보보호팀 2차 회신(8/12) 반영 확인

---

## 부록 A — 신청절차 스텝 확정 문안 (원문 고정)

| 스텝 | 기업이 할 일 | KG에듀원이 함께하는 일 |
|---|---|---|
| 1. 상담 신청 | 도입문의 접수 | 지원대상 여부·예상 규모 확인 지원 |
| 2. 과정 설계 | 교육 니즈 협의 | 사전진단 기반 모듈 맞춤 구성 |
| 3. 정부 신청·선납 | 고용24 기업회원 가입 → 교육시작일 전 훈련생 등록 → 교육비 선납 | 등록 절차·필요 정보 안내 |
| 4. 교육 진행·환급 | 수료(출석 80% 이상) → 고용24 비용신청(납입 영수증·수료증 첨부) | 수료증·납입 영수증 발급, 신청 방법 안내 |

## 부록 B — 유의사항 확정 문안 (원문 고정)
1. 훈련생 등록은 교육시작일 전까지 완료되어야 하며, 소급 적용되지 않습니다.
2. 환급을 위해서는 전체 훈련시간의 80% 이상 출석(수료)이 필요합니다.
3. 기업별 지원한도를 초과하여 지급된 금액은 추후 환수될 수 있습니다.
