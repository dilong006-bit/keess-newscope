# AGENTS.md — KEESS B안 빌드·코딩 규칙

> KG에듀원 HRD사업본부 **KEESS**(B2B·B2G 인바운드 채널)의 **B안 5페이지** 통합 빌드. 실운영 배포 가능 수준의 정적 사이트.
> 상위 기준: [`ref/design/Design.md`](ref/design/Design.md) · [`ref/prd/PRD_KEESS_B_v1.0.md`](ref/prd/PRD_KEESS_B_v1.0.md) · [`ref/spec/TECHSPEC_KEESS_B_v1.0.md`](ref/spec/TECHSPEC_KEESS_B_v1.0.md) · [`ref/prototype/*`](ref/prototype)(확정 원본 = source of truth).
> ref 구조: `ref/prototype`(단일 .html 프로토타입) · `ref/prd`(PRD) · `ref/spec`(기술명세서·SPEC) · `ref/design`(Design.md). 스킬: `.Codex/skills`.

## 0. 절대 원칙 (위반 금지)
1. **발명 금지**: 새 UX·IA·컬러·폰트·컴포넌트·그림자·라운드·브레이크포인트를 만들지 않는다. 확정 원본·Design.md에 있는 것만 이식.
2. **토큰 1:1**: 색·간격·라운드·그림자·이징은 `var(--*)`/Tailwind 토큰 경유. 하드코딩 신규 금지.
3. **카피 = 확정본 그대로**: `ref/prototype` 원본 문구 그대로. 재작성 금지.
4. **P1(/ax-ai, D 확정)은 구성 변경 금지**. 표현 조정만.
5. **하나의 사이트 = 일관된 디자인**. 필러 정체성은 틴트(`--bg/--surface/--ink/--line` 4값)로만. 필러색은 포인트에만.
6. **백엔드 없음**: 회원/로그인/결제/DB/API 미구현. 폼·다운로드는 상태 UI + 정적 자산(추후 연동 슬롯).
7. **충돌 시 우선순위**: 홈 확정본 > 코퍼레이트 > P1~P4. 단 §0.5 6대 원칙은 세부 규칙보다 우선. 애매하면 질문.

## 0.5 B안 필수 준수 6대 원칙 (★ Design.md §0.5 · A안 이슈 재발 방지 · 최우선)
1. **GNB = 실제 페이지 라우팅**: 상단 메뉴(AX·AI 전환/리더십·조직/HRD 통합/콘텐츠/정부지원) 클릭 시 각 페이지 이동(`/ax-ai` `/leadership` `/hrd` `/content`, 정부지원=`/hrd#gov`). Next `<Link>` 사용, 현재 페이지 `aria-current="page"`. **무동작·placeholder 링크 금지.**
2. **좌측 상단 KEESS 로고 = 홈(`/`)**: 로고 클릭 시 항상 홈 랜딩(홈에서는 최상단 스크롤).
3. **그라데이션 = 원래 있던 영역이면 톤 정합 하에 허용**: 확정 프로토타입이 이미 그라데이션을 쓰던 영역(히어로 배경·미디어 스크림·강조 CTA·데이터 시각화 바/노드)은 필러색(`--p1~--p4`)·중립(`--ink`) 파생 톤 정합 그라데이션 허용. **신규 다색 그라데이션 발명·대형 텍스트 배경 채색 금지.** (§0-1 "발명 금지"의 예외 명확화 — A안 전면 플랫과 달라지는 지점)
4. **인터랙션 고도화 허용**: 구성·카피 불변, §4 모션 토큰·타이밍 내에서 hover/focus/전환/스크롤 스파이/스켈레톤 등 체감 품질 향상 가능. reduced-motion 유지, 바운스·1s 초과 금지.
5. **푸터 = 전 페이지 공통**: 홈 다크 Footer(부정훈련 예방/신고 포함) 전 페이지 재사용. 페이지별 미니 푸터 금지(§5-1).
6. **'교육 상담' CTA = 최상의 UI/UX로 "누르고 싶게"**: nav 고정 CTA·각 페이지 최종 CTA를 고대비 pill+아이콘, hover 상승, active 눌림, (원래 그라데이션 영역이면 톤 정합 그라데이션)으로 강화. 1차 CTA는 하나, 최종 행동은 상담/진단/가이드/다운로드 수렴, 터치 44px+·포커스 링 명확.

## 1. 디자인 토큰 (Design.md §3, `globals.css :root` 1:1)
```css
--bg:#FAFAFB; --ink:#14141A; --muted:#54585f; --line:#E6E8EC; --surface:#F3F5F8;
--p1:#2E1A6B; --p2:#E91E63; --p3:#8B27A8; --p4:#F58220; --gov:#F4B83A;
--ease:cubic-bezier(.22,.61,.36,1); --ease-out:cubic-bezier(.2,0,0,1);
--maxw:1200px; --gut:24px; --serif:"Gowun Batang",serif; --r:20px;
--shadow-1..3 (Design.md 값)
```
**필러 틴트**(페이지 wrapper, 4값만): P1 `.tint-p1`(bg#FCFCFE surface#F4F2FB ink#15131D line#EAE8F2) · P2 `.tint-p2`(bg#FDFBFC surface#FCEBF2 ink#181318 line#F0E3EA) · P3 `.tint-p3`(surface#F4EAFA line#ECE0F4 ink#1A1420) · P4 `.tint-p4`(surface#F7F4EF ink#15131D). 홈=중립. 필러 `--maxw:1180px`.

## 2. 폰트 정책 (★ 일관성 — 프리텐다드 기준)
- **전 페이지 통일**: 본문·UI = **Pretendard Variable**, `next/font/local`로 **self-host**(`public/fonts/PretendardVariable.woff2`, weight `45 920`). CSS 변수 `--font-pretendard`로 노출, `body`·모든 컴포넌트가 이를 상속.
- **원본 불일치 정규화(중요)**: `ref/prototype`의 P2 B·P3 B는 `"Pretendard","맑은 고딕"` 스택 + 웹폰트 미로드(머신 의존)로 렌더가 달라짐. 홈·P1·P4는 `Pretendard Variable`+CDN. → **빌드 시 5페이지 모두 self-host Pretendard Variable로 통일**. CDN 링크·Malgun 폴백 스택을 그대로 옮기지 말 것.
- **serif(Gowun Batang)**: 홈 매니페스토 등 **선언형 대형 문구에만** `--serif`로 제한 사용(확정 홈 한정). 필러 페이지는 Pretendard 단일. 신규 서체 추가 금지.

## 3. 라우트 · 원본 매핑
| route | wrapper | 원본 | tint |
|---|---|---|---|
| `/` | — | keess_home_C_v18_최종확정 | 중립 |
| `/ax-ai` | .tint-p1 | keess_P1_AXAI_D_scenario_v7 | 보라 |
| `/leadership` | .tint-p2 | keess_P2_leadership_B_framework_v1.0 | 마젠타 |
| `/hrd` | .tint-p3 | keess_P3_hrd_B_platform_v2.0 | 바이올렛 |
| `/content` | .tint-p4 | keess_P4_content_solution_B_v2.0 | 웜 |

## 4. 모션 (Design.md §6)
- 스크롤 리빌 `.r`/`.stagger` → `IntersectionObserver({threshold:.16})` **통일**(원본 P3/P4의 .12는 .16으로 정규화) 1회, 등장 .7~.9s, hover translateY(-2~3px)+shadow. 1s 초과·바운스 금지. `prefers-reduced-motion` 대응 필수.

## 5. B안 특화 (PRD F7·F9·F13)
- **P3 `#gov` 정부지원 환급**(#trust 뒤·#inq 앞): 이해→대상→환급(우선지원기업 기준 최대 90%, **상담 시 산정**·단정 금지)→절차 4스텝→상담 CTA(문의 '정부지원' 프리셀렉트).
- **P4 `#download` 과정 리스트**(#ax6 뒤·문의 앞): 엑셀 실측 통계 + **라이트 게이트**(회사·담당자·이메일→제출 시 xlsx 다운로드). 플로팅 다운로드 신설 금지.
- **크로스링크**: `/hrd#gov` ↔ `/content#download`.
- 다운로드 자산: `public/downloads/KG에듀원_과정리스트.xlsx`.

## 5-1. 홈 고정 요소 (A/B 공통 · 필수 구현 · 무동작 금지) ★★ 빌드 범위에서 절대 누락 금지
> A안 홈 빌드에서 이 요소가 **작업 범위에서 누락**되어 사후 추가 작업이 발생했다. B안에서는 **홈 빌드 시 반드시 함께 구현**한다. 누락 시 홈은 미완성으로 간주.
- **부정훈련 예방/신고**: 홈 Footer의 `부정훈련 예방 안내`·`부정훈련 신고` 버튼 → 모달 「부정훈련 예방 및 신고」 **3탭**(예방 안내 / 신고 접수 / 신고 조회). 신고 폼(신고자 정보·신고 내용·개인정보 동의 2건)→성공 상태, 조회(이름·연락처+비밀번호)는 클라이언트 데모. **확정 홈의 고정 기능이므로 no-op 금지.** 원본 홈(`ref/prototype/keess_home_C_v18_최종확정`)의 모달 마크업·시드 데이터·JS 로직을 그대로 이식.
- 원본 버그 수정: 모달 heading과 신고 '제목' input이 같은 id(`pv-title`)를 공유 → 빌드 시 **고유 id로 분리**.
- 백엔드 없음: 접수·조회는 성공/데모 상태 UI(추후 연동 슬롯).

## 6. 카피·보이스·채널 (Design.md §7·§10)
- 선언형 평서문·대구, 숫자·기관·산출물 증거. 최종 CTA=상담/진단/가이드/다운로드 수렴. 금지: 과장·가격·이모지·AI 상투어.
- **채널 분리**: 전사 인증·수상·고객사 = 홈 전용. P1~P4는 여정 근거만.

## 7. 설치된 스킬 활용 (`.Codex/skills/`, 설치 시)
- 검증: `full-page-screenshot`/`playwright-skill`로 각 페이지를 `ref/prototype` 원본과 대조. 디버깅 `root-cause-tracing`. 커밋 `git-pushing`. 격리 `using-git-worktrees`.

## 8. 검수 기준 (DoD)
- `next build` 무오류, 5경로 정적 구동. 확정 원본과 섹션·카피 일치, 신규 토큰 0.
- **전 페이지 Pretendard 통일 렌더**(CDN/Malgun 잔재 없음).
- **§0.5 6대 원칙 충족**: GNB 각 항목이 실제 페이지로 이동(무동작 0)·`aria-current` 표기, 로고 클릭 시 홈 이동, 그라데이션은 원래 영역만 톤 정합, 공통 Footer 전 페이지 동일, 교육 상담 CTA 강화.
- **홈 Footer 부정훈련 예방/신고 3탭 모달 동작(누락 0, no-op 0)** — 별도 필수 체크.
- P3 정부지원 프리셀렉트·P4 다운로드 게이트·크로스링크 동작.
- 3디바이스 정상, 키보드 포커스·모달 트랩·reduced-motion 대응.

## 9. 작업 태도
- 원본 우선, 추측 금지, 애매하면 질문. 지시 범위만 구현. 각 빌드 단계 끝에서 확인.
