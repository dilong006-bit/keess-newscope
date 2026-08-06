# [KEESS] 개인정보처리방침 모달 + 푸터 정리 — 기술 명세서 v1.0

**작성일**: 2026-08-06
**기준**: keess-newscope 소스 실사(2026-08-06) — `components/common/Footer.tsx`, `components/common/Modal.tsx`, `components/common/ReportModal.tsx`(예방 안내 pane 스타일), `data/footer.ts`
**콘텐츠 원본(단일 소스)**: `ref/protection/KEESS_개인정보처리방침_전문_v1.0_260806.md` — 정보보호팀 검토 회신(8/6) 반영 확정 전문. **임의 수정·축약·윤문 금지** (동의 문구와 동일한 컴플라이언스 원칙)
**연계**: [G2-11-01] 정보보호팀 회신 반영 (업무번호 23884) — 본 건 완료 시 "푸터 처리방침 게시" 트랙 종결, 정보보호팀 최종 확인 발송 가능 상태

---

## 1. 목적 및 요구

1. Footer의 `개인정보처리방침` 링크(현재 `href="#"` placeholder)를 살려, 클릭 시 **부정훈련 예방 안내와 동일한 모달 경험**으로 처리방침 전문을 제공한다.
2. Footer의 `이용약관` 링크는 **삭제**한다 (8/6 확정 — 이용약관 페이지 미제작).
3. 결과물은 정보보호팀 최종 확인용 기획안의 실물 근거가 되므로, 전문 md의 【 】 미확정 표기는 **그대로 렌더**한다(검토자가 확정 필요 지점을 화면에서 인지하는 것이 의도된 상태).

## 2. 반영 전략 (아키텍처 결정)

| # | 결정 | 근거 |
| --- | --- | --- |
| A | **콘텐츠·프레젠테이션 분리** — 전문을 `data/privacy.ts` 구조화 데이터로 전사하고 렌더러는 데이터를 순회만 한다 | CONSENT_TEXTS와 동일한 단일 소스 원칙. 정보보호팀 확인 후 문구 수정이 데이터 파일 1곳에서 끝남 |
| B | **기존 모달 인프라 재사용** — `common/Modal.tsx`(포커스 트랩·ESC·스크림·배경 스크롤 잠금·포커스 복귀 내장) + 예방 안내 pane의 기존 클래스(`pv-lead`·`pv-h`·`pv-table`·`pv-list`·`pv-note`) | Footer는 이미 ISMS 모달을 같은 방식으로 띄운다(기허용 패턴). 신규 스타일 0 목표 |
| C | **Footer 앵커 → 버튼 전환** | 모달 트리거는 `<a href="#">`가 아니라 `<button>`이 맞다(스크롤 점프·a11y). 부정훈련 예방 안내·신고 버튼(`report-link`)과 동일 패턴 |
| D | **제8조 보호책임자 프리필** — `data/footer.ts` COMPANY_INFO 기기재 값("개인정보책임: 임근성 · privacy_eduone@kggroup.co.kr")과 정합하게 성명·이메일을 채우고, 담당 부서만 【 】 유지 | 푸터에 이미 공개 중인 정보와 방침 본문이 어긋나면 그 자체가 지적 대상. 정보보호팀 발송 시 "제8조 기재 확인 요청" 명시 |

## 3. 파일별 구현 명세

### 3-1. `data/privacy.ts` (신규)

```ts
// KEESS 개인정보처리방침 — 단일 소스(Single Source of Truth)
// 원본: ref/protection/KEESS_개인정보처리방침_전문_v1.0_260806.md (정보보호팀 회신 8/6 반영)
// 문구는 임의 수정 금지. 【 】 표기는 게시 전 확정 대상이며 검토 단계에서는 그대로 렌더한다.

export interface PrivacyBlock {
  type: 'p' | 'table' | 'list' | 'note';   // note = ※ 보충 문구
  text?: string;                            // p·note
  items?: string[];                         // list
  columns?: string[]; rows?: string[][];    // table
}
export interface PrivacySection { id: string; title: string; blocks: PrivacyBlock[]; }

export const PRIVACY_TITLE = '개인정보처리방침';
export const PRIVACY_INTRO = '주식회사 KG에듀원(이하 "회사")은 …'; // 원문 md 서문 그대로
export const PRIVACY_SECTIONS: PrivacySection[] = [ /* 제1조~제10조, 원문 순서·문구 그대로 전사 */ ];
```

**전사 규칙 (엄수)**
1. 원문 md의 **서문 + 제1조~제10조**를 순서·문구 그대로 옮긴다. 말미의 "[작성 근거 대조 — 게시 전 삭제할 내부 메모]" 섹션은 **전사 대상에서 제외**한다.
2. 표(제1조·제2조·제8조)는 `table` 블록으로, ※ 문구는 `note` 블록으로, 번호·불릿 항목(제7조·제9조)은 `list` 블록으로 전사한다. 조항 내 ①②③ 항은 `p` 블록 개행 유지.
3. **제8조만 예외적으로 다음 값을 반영**한다(전략 D — footer.ts 기기재 정보와 정합):
   - 개인정보 보호책임자: `임근성` / 연락처: `privacy_eduone@kggroup.co.kr` / 담당 부서: `【부서명 — 정보보호팀 확인 후 기입】`
4. 그 외 【 】 표기(제10조 시행일 【2026-08-13】 등)는 원문 그대로 둔다.
5. URL(제4조 GA 옵트아웃, 제9조 기관 사이트)은 `text` 내 문자열로 두고 렌더러에서 자동 링크 처리하지 않아도 된다(외부 링크 신설은 선택 사항 — 적용 시 `target="_blank" rel="noopener"`).

### 3-2. `components/common/PrivacyModal.tsx` (신규)

```tsx
'use client';
import Modal from './Modal';
import { PRIVACY_TITLE, PRIVACY_INTRO, PRIVACY_SECTIONS } from '@/data/privacy';

interface Props { open: boolean; onClose: () => void; }
export default function PrivacyModal({ open, onClose }: Props) { … }
```

- `Modal` 사용: `labelledBy="privacy-modal-title"`, `title={PRIVACY_TITLE}`, **`maxWidth={720}`** (제1조 4열 표 가독 — ISMS 460·문의 480보다 넓게. 모바일은 기존 `pv-overlay` 반응형 규칙 상속).
- 본문 렌더: `.pv-body` 내부에서 섹션 순회 — 조 제목은 `h4.pv-h`, `p` 블록은 `<p>`, `note`는 기존 보충 문구 스타일(`p.pv-note`), `list`는 `ul.pv-list`, `table`은 `table.pv-table`(`<thead>` + `<tbody>`).
- 예방 안내 pane과 동일한 룩을 위해 신규 클래스를 만들지 않는다. 표가 5열(제1조: 처리 업무·목적·항목·기간 = 4열)로 좁은 화면에서 넘칠 경우에 한해 래퍼 `div`에 `overflow-x:auto` 인라인 처리 허용(스타일 시트 신규 선언 없이).
- 모달 열림 시 본문 스크롤 최상단 초기화(ReportModal의 `bodyRef.scrollTop = 0` 패턴 재사용).

### 3-3. `components/common/Footer.tsx` (수정 2곳)

**① 정책 링크 행 교체** — 현행:

```tsx
<a className="priv" href="#">개인정보처리방침</a>
<span>·</span>
<a href="#">이용약관</a>
<span>·</span>
```

변경:

```tsx
<button className="report-link priv" type="button" aria-haspopup="dialog"
        onClick={() => setPrivacyOpen(true)}>개인정보처리방침</button>
<span>·</span>
```

- `이용약관` 앵커와 **구분점 `<span>·</span>` 1개**를 함께 삭제해 결과가 "개인정보처리방침 · KG그룹 사회공헌 · 부정훈련 예방 안내 · 부정훈련 신고"가 되게 한다 (구분점 2개 연속 금지).
- 기존 `.priv` 클래스의 시각 강조가 있으면 유지(버튼에 병기). `report-link` 기존 버튼 스타일 재사용으로 앵커→버튼 전환에 따른 시각 변화가 없어야 한다.

**② 모달 마운트** — `const [privacyOpen, setPrivacyOpen] = useState(false);` 추가 후 ReportModal·ISMS Modal 옆에:

```tsx
<PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
```

## 4. 변경 금지 (회귀 조건)

- Footer의 나머지 항목 전부: FAMILY SITE 드롭다운, SNS, COMPANY_INFO(dl), KG그룹 사회공헌 링크, 부정훈련 예방 안내·신고 버튼, ISMS 버튼·모달, COPYRIGHT
- `data/footer.ts` 무변경 (보호책임자 값은 **참조**만 — footer 데이터를 privacy로 옮기거나 수정하지 않는다)
- `Modal.tsx`·`ReportModal.tsx`·`useModal` 훅 무변경
- G2-11-01 폼·동의 빌드 파일(HomeInquiry·ReportModal·consent.ts·ConsentGroup)과 충돌 없음 — 본 건은 Footer.tsx 수정 + 신규 2파일이 전부
- 처리방침 전문 문구 임의 수정 금지 (전사 규칙 3항의 제8조 프리필만 허용된 변형)

## 5. 완료 조건 / QA 체크리스트

**콘텐츠**
- [ ] 렌더된 모달 전문이 원본 md(내부 메모 제외)와 글자 단위 일치 — 서문+10개 조, 표 3개, ※ 문구, 【 】 표기 유지
- [ ] 제8조: 임근성 · privacy_eduone@kggroup.co.kr 표기, 부서만 【 】 — footer COMPANY_INFO와 정합
- [ ] 내부 메모 섹션 미노출

**푸터·모달 동작**
- [ ] '개인정보처리방침' 클릭 → 모달 오픈, '이용약관' 미노출 + 구분점 연속 없음
- [ ] ESC·스크림 클릭·닫기 버튼으로 닫힘, 닫힌 뒤 포커스가 트리거 버튼으로 복귀
- [ ] 열림 시 배경 스크롤 잠금, 본문 스크롤 최상단, 긴 본문 내부 스크롤 정상
- [ ] 부정훈련 모달·ISMS 모달과 상태 독립(각각 정상 동작, 스타일 간섭 없음)
- [ ] 모바일(≤560px): 표 가로 넘침 없이 열람 가능(필요 시 overflow-x 래퍼), 폰트·여백 기존 pv-* 규칙 상속

**품질**
- [ ] `aria-haspopup="dialog"`·`aria-labelledby` 정상, 탭 순서 트랩 확인
- [ ] 빌드 0경고, 기존 회귀 스위트 통과, Footer 스냅샷 외 타 페이지 diff 0

## 6. 후속 (본 빌드 외)

- 정보보호팀 발송 기획안에 명기할 확인 요청 2건: ① 제8조 보호책임자·담당 부서 기재 확정 ② 시행일(【2026-08-13】) 확정
- 확정 회신 수신 시 `data/privacy.ts`의 해당 값만 교체(【 】 제거) — 다른 파일 무변경
- 철회 메일함(kg11_kg6030@kggroup.co.kr) 모니터링 담당 확정은 운영 트랙에서 별도 진행
