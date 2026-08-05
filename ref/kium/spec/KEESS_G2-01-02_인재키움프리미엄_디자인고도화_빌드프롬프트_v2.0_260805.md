# KEESS /kium 디자인 고도화 — 외부 서비스 통합 개정판 v2.0

| 항목 | 내용 |
|------|------|
| **작성일** | 2026-08-05 |
| **대상** | 클로드 코드 (keess-newscope, localhost:3001) |
| **선행 상태** | 1차 빌드 완료(29/29 PASS, 미커밋) — 본 문서는 고도화 개정 프롬프트 |
| **기준 문서** | 기술명세서 최종 v2.0 + UIUX 고도화전략 260805 (원칙 유지, 완화 항목은 3장에 명시) |

---

## 1. 외부 서비스별 적용 판정 (시니어 검토)

| 서비스 | 출력물 | 판정 | 사유 |
|---|---|---|---|
| **MagicPattern** | 메시/그레인 CSS·SVG 코드 | ✅ **채택 (코드 내장)** | 코드 산출형이라 결정성·라이선스 문제 0. 단 클로드 코드는 외부 웹 접근 불가 → 동일 기법(레이어드 메시 + feTurbulence 그레인)을 확정 코드로 프롬프트에 직접 내장 |
| **@firecms/neat** | WebGL 그라디언트 (npm/MIT) | ✅ **히어로 한정 승격** | 스펙 C2(Could)를 본 개정에서 적용으로 승격. 카드 금지·reduced-motion 강등·정적 CSS 폴백은 유지 |
| **pollo.ai / higgsfield.ai** | AI 생성 이미지·비디오 | ⚠️ **옵션 트랙 B (슬롯 예약)** | 클로드 코드가 호출 불가 + 생성 결과 비결정적 → 빌드 경로에 넣지 않음. 대신 히어로 한정 "추상 브랜드 아트웍 1장" 교체 슬롯을 코드에 예약. 에셋은 사용자가 직접 생성·배치(생성 프롬프트 4장 제공). 상업 이용 권리는 유료 플랜 계정 기준 — 계정 약관 확인 필요 |
| **Unsplash** | 실사 사진 | ❌ **미채택 권고** | /kium 실사 미사용은 확정 사항(정부사업 신뢰 프레임 + 과정별 실사 자산 부재로 인한 오연출 리스크). 라이선스 자체는 상업·무출처 가능하므로, 방침 변경 시에만 재검토(결정 플래그) |
| **iconscout** | 아이콘 | ❌ **미채택** | 무료 자산도 출처표기 없이 상업 이용 가능하나, lucide(MIT) 단일 소스 원칙이 이미 확립됨. 아이콘 패밀리 혼용은 획 굵기·모서리 스타일 불일치로 오히려 품질 저하 |
| **Figma MCP** | 팔레트 동기화 | 🔜 **빌드 후** | 확정 토큰 → [G2-03] 팔레트 시트 동기화 (기존 예약 작업) |
| **Chrome (실사 QA)** | localhost:3001 검수 | ✅ **빌드 후 즉시** | 고도화 반영 후 제가 브라우저로 직접 2차 실사 리뷰 |

**협업 파이프라인 원칙**: 외부 서비스 산출물은 반드시 ①결정적 정적 에셋으로 고정 ②라이선스 확인 ③`ref/kium/design/assets/`에 배치 후 클로드 코드가 소비. 빌드가 외부 서비스 가용성에 의존하지 않게 한다(옵션 트랙은 파일 존재 분기).

## 2. 옵션 트랙 B — AI 아트웍 생성 가이드 (사용자 실행분)

pollo.ai 또는 higgsfield.ai에서 아래 프롬프트로 생성 → 최적본 1장 선택 → WebP 변환:

> **생성 프롬프트(영문)**: Abstract 3D render, flowing translucent glass ribbons and soft gradient orbs, deep royal purple (#2E1A6B) to indigo and soft cyan accents, dark elegant background, premium corporate hero background, soft studio lighting, no text, no people, no logos, wide composition with clear negative space on the left half, 4:3
>
> **금지**: 인물·손·건물·텍스트·로고·화폐 등 사실 묘사 일체 (오제공 0 원칙 — 추상만 허용)

- **파일 계약**: `ref/kium/design/assets/hero/hero-art.webp` — 1600×1200(4:3), 300KB 이하, sRGB
- 배치되면 클로드 코드에 "hero-art 반영" 한 줄만 지시 → [수정 1]의 교체 슬롯이 처리
- **스펙 개정 수반**: 기술명세서 "이미지 파일 0" → "히어로 한정 추상 아트웍 1장 허용(실사·인물 금지 유지)"로 개정 필요. 미배치 시에도 카드 스택 안이 그대로 유효하므로 일정 리스크 0

## 3. 스펙 완화 항목 (본 개정으로 공식화)

1. C2(@firecms/neat) → 히어로 한정 적용 승격 (카드 WebGL 금지 유지)
2. 그레인 텍스처 data-URI SVG 1종 추가 — 이미지 "파일" 0 원칙과 양립(인라인 코드)
3. 히어로 아트웍 교체 슬롯 예약 (에셋 미존재 시 무영향)
4. 그 외 전 원칙 유지: 임의 수치·문안 생성 금지 / verified facts 게이트 / 경쟁사 URL 금지 / 신규 강조색 금지(썸네일=콘텐츠 표면 예외) / 필러 컬러 금지

---

## 4. 클로드 코드 전달 프롬프트 (전문)

```
KEESS /kium 디자인 고도화 개정 작업입니다. 구조·데이터·폼 로직은 유지하고 아래 0~8만
수정하세요. 기준: ref/kium/spec 기술명세서 최종 v2.0 + UIUX 고도화전략.
창작 금지 원칙 유지(신규 문안·수치는 본 프롬프트에 지정된 것만, verified facts 외 수치 금지).

[수정 0 — 그레인 텍스처 토큰 (신규 공통 에셋)]
styles/kium.css에 아래 노이즈 SVG를 data-URI로 정의(:root 커스텀 프로퍼티 --kium-grain):
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">
    <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9"
      numOctaves="2" seed="7" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.05"/></feComponentTransfer></filter>
    <rect width="240" height="240" filter="url(#n)"/></svg>
· URL-인코딩하여 background-image로 사용, background-repeat: repeat
· 적용처: 히어로 배경 최상층 오버레이 + KiumThumb 표면 오버레이(::after, opacity .5)
  — 플랫한 그라디언트에 미세 질감을 더해 프리미엄 표면감 부여
· 외부 요청 0(인라인), 결정적 렌더(seed 고정)

[수정 1 — 히어로 전면 고도화]
· 버그: 텍스트가 회색(washed)으로 고착 — reveal 초기 상태(opacity/색)가 완료되지 않는
  문제 점검·수정. 본문 잉크 컬러로 선명하게
· 타이포: 메인 카피 중 "90~95%"만 KG 퍼플 + 1.3~1.4em 디스플레이 강조 + tabular-nums
· 아이브로 칩 추가: "2026 정부지원 훈련 · 한국산업인력공단 공고 제2025-237호"
· 배경(3층 구성):
  ① 베이스: @firecms/neat(이미 package.json 의존성 확인, 없으면 npm i @firecms/neat)로
     WebGL 그라디언트 — 색은 기존 토큰만(#2E1A6B 계열 퍼플 + 저채도 시안 #0891B2 20% 이하),
     저속·저채도, dynamic import로 코드 스플릿, 히어로 1곳 한정(카드 금지).
     prefers-reduced-motion 또는 WebGL 불가 시: 정적 메시 블롭 2개
     (브랜드 퍼플·시안, blur 100px+, 화면 우측 배치)로 강등 — 이 폴백 CSS를 먼저 구현
  ② 중층: KiumThumb 카드 스택 3장(kium-01 신입 On-Syncing / kium-04 팀장 Re-Lead /
     kium-09 AI Agent — 회전 -6°/0°/6° 겹침, sh2, 호버 시 간격 살짝 펼침).
     단, public/kium/hero-art.webp 파일이 존재하면 카드 스택 대신 해당 아트웍을
     <Image>로 렌더(4:3, 우측 배치, 로딩 priority 아님 — LCP는 텍스트 유지).
     파일 존재 여부는 빌드 타임 fs 체크(SSG이므로 가능). 현재는 파일 없음 → 카드 스택
  ③ 상층: --kium-grain 오버레이(수정 0)
· 히어로 하단 verified 혜택 스탯 3개(content.ts facts에서만):
  "실 납부 훈련비의 90% 지원" · "기업당 한도: 개산보험료의 240%(최소 500만원)" ·
  "전 과정 실시간 비대면 가능" + 출처 캡션("한국산업인력공단 안내 기준")

[수정 2 — 자격확인 가이드]
· '사업자등록번호만 안다면' 카드: 기존 상담 유도 유지하되 그 위에
  "고용24에서 직접 확인" 스텝 추가 — ①고용24 기업회원 가입·로그인
  ②직업 능력 개발 → 사업주훈련 ③지원한도 조회 (링크는 officialLinks의 work24만)
· 디자인: 카드별 lucide 아이콘(key-round / building-2 / hash), 스텝 번호 배지
  01→02→03 + 연결 화살표, "'비해당'이면 참여 가능" 결과 문구에 초록 체크 강조,
  카드 호버 lift(sh1→sh2)

[수정 3 — 신청절차 시각화 고도화]
· 섹션 상단 혜택 스탯 밴드(수정 1과 동일 facts 3종 재사용 — 고객 혜택 선제시)
· 스텝퍼: 스텝 간 연결선 추가(퍼플 20%→100% 그라디언트 진행선),
  넘버 서클을 채움형으로(심도 4단: 퍼플 20/45/70/100% — 현재 아웃라인만이라 진행감 없음),
  스텝별 lucide 아이콘(message-circle/clipboard-list/landmark/badge-check)
· '기업' 행 칩 = 뉴트럴, 'KG에듀원' 행 칩 = 퍼플 틴트 — 두 주체 대비 강화
· 유의사항 3종(KiumCautions) 렌더 여부 확인, 없으면 스펙대로 추가

[수정 4 — 썸네일 카테고리 구분 강화]
styles의 메시 토큰을 아래로 교체(1휴 변주 원칙 유지, 보조색 채도·커버리지 상향):
  onboarding: --mesh-a:#2563EB --mesh-b:#60A5FA
  roleup:     --mesh-a:#7C3AED --mesh-b:#C4B5FD
  leadership: --mesh-a:#3730A3 --mesh-b:#818CF8
  executive:  --mesh-a:#172554 --mesh-b:#D4A72C
  ai:         --mesh-a:#0891B2 --mesh-b:#67E8F9
  common:     --mesh-a:#52525B --mesh-b:#D4D4D8
그라디언트 커버리지 확대: mesh-a transparent 60%→85%, mesh-b 55%→70%
(베이스 #2E1A6B·최암부 #1B0F45·좌하단 텍스트 앵커는 유지)
· 썸네일 표면에 --kium-grain 오버레이(수정 0) — 스크림과 텍스트 사이 레이어
· 카드 본문 카테고리 라벨 앞 8px 컬러 dot(해당 카테고리 --mesh-a) 추가
· 변경 후 scripts/check-contrast.mjs 재실행 — 전 카테고리 AA(4.5:1) 통과 필수,
  미달 시 스크림 알파를 .35→.45로 올려 재검증(그레인 slope 0.05는 대비 계산상 무시 가능
  수준이나, 실측 스크린샷 스팟 체크 1회 포함)

[수정 5 — FAQ]
· 답변 텍스트가 박스 우측 끝까지 차도록 max-width 제한 제거(컨테이너 풀폭)
· 답변 15px/line-height 1.7, 상하 패딩 대칭, 열림 항목 좌측 2px 퍼플 인디케이터

[수정 6 — 탭 전환 스크롤]
· 탭 클릭 시 화면이 그대로인 문제: 전환 시 탭바 바로 아래(콘텐츠 상단)로
  스크롤 이동(behavior: 'smooth', reduced-motion 시 instant)

[수정 7 — 전반 폴리시]
· 섹션 배경 교차(white ↔ #fafafc)로 리듬, 섹션 상하 여백 96px(모바일 64px)로 통일
· 카드 그림자 2겹(sh1/sh2 토큰 확인), hairline 보더 rgba 0.08~0.12
· 전 reveal 모션이 완료 상태로 안착하는지 전수 확인(수정 1 버그의 전역 점검)

[수정 8 — 성능 가드]
· @firecms/neat는 히어로 컴포넌트에서만 dynamic import(ssr: false), 초기 번들 미포함
· LCP 요소가 히어로 텍스트로 유지되는지 확인(WebGL 캔버스·아트웍은 lazy)
· /kium 라우트 First Load JS 증가폭 보고(수정 전/후)

[검증·보고]
npm run build 0경고 · check-contrast.mjs 결과표 · 수정 전/후 스크린샷(히어로·자격확인·
신청절차·그리드·FAQ) · 금지어 재검색("대행"/경쟁사 URL/미검증 수치) 0건 확인 ·
reduced-motion 에뮬레이션에서 히어로 폴백 정상 렌더 스크린샷 1장.
commit/push 금지 — 검토 후 지시.
```
