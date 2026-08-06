# [KEESS] 개인정보처리방침 모달 — UI/UX 시각 고도화 기술 명세서 v1.0

**작성일**: 2026-08-06
**기준**: keess-newscope 소스 실사 — `components/common/PrivacyModal.tsx`(신설 3), `components/common/Modal.tsx`, `components/common/ReportModal.tsx`, `styles/components.css`(`.pv-*` 전 규칙), `ref/design/Design.md`(디자인 헌법), 실제 렌더 스크린샷(2026-08-06, 데스크톱)
**콘텐츠 원본**: `data/privacy.ts` — **본 건은 순수 프레젠테이션 계층 개선이며 조항 문구·수치·순서는 1바이트도 변경하지 않는다.**
**전제**: 개인정보처리방침은 오늘(8/6) 정보보호팀 최종 검토가 진행 중인 법적 문서다. 아래 모든 개선은 "다르게 보이게" 할 뿐 "다르게 읽히게" 하지 않는다 — 이 원칙이 본 건의 최상위 제약이다.

---

## 1. UI/UX 진단 (현재 렌더 스크린샷 기준)

실물 렌더(첨부 스크린샷)를 시니어 UI/UX 관점에서 검토한 결과, 콘텐츠 자체는 정확하나 **"법적 문서를 그대로 흘려보낸 상태"**에 가깝다. 구체적 문제:

1. **컬럼 폭 배분이 콘텐츠 밀도와 반대다.** `제1조` 표에서 "처리 업무"(예: "교육 상담 신청" — 6~7글자)가 전체 폭의 44%를 차지하는 반면, 실제로 줄바꿈이 반복되며 읽기 어려운 "처리 목적"·"수집 항목"(가장 텍스트가 긴 컬럼)은 남은 56%를 3분할해 나눠 쓴다. 스크린샷에서 "상담신청 및 안내: KEESS 직원 교육…" 문장과 "(필수) 담당자명, 회사·기관명, 직급/직책…" 목록이 5~6줄로 쪼개져 세로로 길게 늘어지는 반면, 첫 컬럼은 텍스트 대비 여백이 과다하다. `styles/components.css:277`의 `.pv-table tbody td:first-child{width:44%}`가 원래 2컬럼 표(부정훈련 예방 pane의 "학습 단계|확인 방식")를 염두에 둔 규칙인데, 4컬럼 표(제1·2조)에 그대로 상속되면서 발생한 구조적 문제다.
2. **10개 조항 문서에 목차·현재 위치 인지 수단이 전혀 없다.** 스크롤만으로 제1조~제10조를 탐색해야 하고, 특정 조항(예: 제8조 보호책임자, 제6조 철회)을 다시 찾으려면 처음부터 다시 훑어야 한다. 법적 검토·재확인 목적의 문서일수록 목차의 부재가 체감 품질을 가장 크게 깎는다.
3. **조항 제목의 시각적 리듬이 밋밋하다.** `제1조`·`제2조`… 모두 동일한 굵기·크기의 텍스트로만 구분되어, 스크롤 중 "지금 몇 번째 조항을 보고 있는지"를 텍스트를 읽어야만 알 수 있다.
4. **필수/선택 구분이 괄호 텍스트에 묻혀 있다.** "(필수) 담당자명…(선택) 회사 규모…"가 문장 속에 녹아 있어, 정보주체가 "내가 반드시 줘야 하는 정보가 뭔지"를 빠르게 스캔하기 어렵다. 사이트 내 폼 UI(ReportModal 등)에서는 이미 `*` 필수 표시·배지 패턴이 있는데 처리방침 문서에는 이 관용구가 없다.
5. **`【 】` 미확정 표기가 본문에 섞여 눈에 띄지 않는다.** 명세서 v1.0/v1.1의 의도("검토자가 확정 필요 지점을 화면에서 인지")가 현재 렌더에서는 잘 달성되지 않는다 — 일반 텍스트와 동일한 굵기·색상이라 훑어보면 놓치기 쉽다.
6. **모바일에서 표가 가로 스크롤된다.** `overflow-x:auto` + `minWidth:560` 조합은 좁은 화면에서 표를 통째로 옆으로 밀어버려, 법적 문서를 읽는 사용자가 좌우 스크롤까지 해야 한다. 법률 문서는 스캔형 카드 레이아웃이 훨씬 접근성이 좋다.
7. **10개 조항을 다 읽고 나면 그냥 끝난다.** 문서가 끝나는 지점을 시각적으로 표시하는 요소나 최상단으로 돌아가는 수단이 없어, 특히 모바일에서 다시 위로 스크롤하는 물리적 비용이 크다.

---

## 2. 개선 전략 (문제 → 개선안 → 근거)

| # | 문제(1장) | 개선안 | Design.md 근거 |
| --- | --- | --- | --- |
| I1 | 표 컬럼 폭 불균형 | 3열 이상 표에 한해 첫 컬럼 폭 44%→26%로 재분배(스코프 오버라이드) + 셀 내 필수/선택 배지 분리 렌더 | §5 Badge/Chip("pill, 저대비 배경") 재사용, 신규 색상 0 |
| I2 | 목차·위치 인지 수단 없음 | 조항 퀵점프 칩바(스크롤스파이, sticky) 신설 | §0.5 원칙4 "스크롤 스파이"는 명시적으로 허용된 인터랙션 고도화 |
| I3 | 조항 제목 리듬 밋밋 | 원형 번호 배지(01~10) | §5 "Journey Step — 01·02·03 + 명사구" 패턴 차용 |
| I4 | 필수/선택 구분 약함 | 표 셀 텍스트를 파싱해 필수/선택 태그 + 목록으로 분리 렌더(원본 문자열 무변경, 렌더링 시점 파싱만) | 기존 폼의 `*`/req 배지 관용구 확장 |
| I5 | 【 】 표기 눈에 안 띔 | `<mark>` 하이라이트(앰버 톤, 기존 `.pv-badge.s1` 배색 재사용) | 신규 색상 0 원칙 — 기존 톤 재사용 |
| I6 | 모바일 표 가로 스크롤 | ≤640px에서 표→카드형(라벨:값) 반응형 전환 | 웹 표준 반응형 표 패턴, 신규 컴포넌트 발명 아님 |
| I7 | 문서 끝 마무리 부재 | 스크롤-투-톱 미니 FAB(모달 내부 스코프) | §5 "Floating CTA/To-top(`.to-top`)" 패턴의 모달 내부 버전 |
| I8 | 조항 간 리듬 부재 | 조항 사이 `border-top:1px solid var(--line)` | §4 "섹션 구분은 border-top 또는 배경 톤 전환" |

**이번 라운드 범위 제외** (검토 결과 효과 대비 리스크가 커서 보류): 상하단 스크롤 페이드 마스크(구현 난이도 대비 체감 효과 낮음), 문서 마무리 요약 카드(신규 문장을 만들면 법적 텍스트로 오인될 소지가 있어 배제 — 대신 I7의 FAB로 종결감을 대체).

---

## 3. 구현 명세

### 3-0. 절대 원칙 (모든 항목에 선행)

1. `data/privacy.ts`는 무변경. 파싱은 **렌더링 시점에만** 일어나며, 정규식 매치 실패 시 원본 문자열을 그대로 출력하는 폴백을 반드시 둔다(파싱으로 인한 문자 손실 0건이 QA 조건).
2. `Modal.tsx`·`ReportModal.tsx`·`useModal` 훅 무변경. `.pv-h`·`.pv-table`·`.pv-lead`·`.pv-body`·`.pv-dialog` 등 **기존 `.pv-*` 선언은 1줄도 수정하지 않는다** — 이 클래스들은 ReportModal(부정훈련 예방/신고/조회)·ISMS 모달과 공유된다. 확장은 전부 `.priv-*` 신규 클래스이거나, `.priv-doc`(PrivacyModal 전용 래퍼) 스코프 하위 선택자로만 한다.
3. 신규 색상 토큰 0. `color-mix(in srgb, var(--p1) …)` 파생이거나 이미 사이트에 존재하는 톤(`#FBF0D8`/`#8A6314` 등 `.pv-badge.s1`에서 이미 쓰는 배색)만 재사용한다.

### 3-1. `components/common/PrivacyModal.tsx` — 전면 리라이트(로직 추가)

**구조 변경**: 최상위 반환 `<div ref={rootRef}>` → `<div ref={rootRef} className="priv-doc">`로 스코프 클래스 부여. 이 클래스가 3-2의 모든 스코프 오버라이드의 앵커가 된다.

**I1+I4 — 표 렌더 개선** (`Block` 컴포넌트의 `table` 분기 교체):

```tsx
const REQ_OPT_RE = /^\(필수\)\s*([^]*?)(?:\s*\(선택\)\s*([^]*))?$/;

function renderCollectionCell(text: string) {
  const m = text.match(REQ_OPT_RE);
  if (!m) return <>{renderBrackets(text)}</>; // 패턴 불일치 시 원문 그대로 — 폴백 필수
  const [, req, opt] = m;
  return (
    <div className="priv-items">
      <div className="priv-item">
        <span className="priv-tag req">필수</span>
        <span>{renderBrackets(req.trim())}</span>
      </div>
      {opt && (
        <div className="priv-item">
          <span className="priv-tag opt">선택</span>
          <span>{renderBrackets(opt.trim())}</span>
        </div>
      )}
    </div>
  );
}

// table 블록:
const wide = (b.columns?.length ?? 0) >= 3;
return (
  <div style={{ overflowX: wide ? undefined : 'auto' }}>
    <table className={`pv-table${wide ? ' priv-table--wide' : ''}`}>
      <thead><tr>{b.columns?.map((c) => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {b.rows?.map((r, i) => (
          <tr key={i}>
            {r.map((cell, j) => (
              <td key={j} data-label={b.columns?.[j]}>
                {j === 2 && wide ? renderCollectionCell(cell) : renderBrackets(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
```

- `j === 2`(수집 항목 컬럼)에만 필수/선택 파싱을 적용한다 — 제1조 표 기준 인덱스. 다른 표(제2조 제공 항목 등)는 패턴이 없으므로 정규식이 자연히 미스매치되어 `renderBrackets`로만 렌더된다(폴백 경로 재사용, 별도 분기 불필요하지만 안전을 위해 컬럼 인덱스로 1차 가드).
- `wide` 표는 이제 `overflowX` 래퍼를 씌우지 않는다(I6에서 카드형으로 전환하므로 가로 스크롤 자체가 불필요해짐). 2열 표(부정훈련 예방 pane 등, 이 컴포넌트 밖의 이야기지만 원칙 확인차)는 이 컴포넌트가 관여하지 않으므로 영향 없음.

**I5 — `【 】` 하이라이트** (모든 텍스트 출력에 공통 적용):

```tsx
function renderBrackets(text: string) {
  const parts = text.split(/(【[^】]*】)/g);
  return parts.map((p, i) =>
    /^【[^】]*】$/.test(p) ? <mark key={i} className="priv-bracket">{p}</mark> : p
  );
}
```

- `p`/`note`/`list` 블록의 `{b.text}` / `{it}` 출력을 전부 `renderBrackets(...)`를 통과시킨다.

**I3 — 조항 번호 배지** (섹션 렌더 부분):

```tsx
{PRIVACY_SECTIONS.map((s, idx) => (
  <section key={s.id} id={s.id} className={idx > 0 ? 'priv-article' : undefined}>
    <h4 className="pv-h">
      <span className="priv-num">{String(idx + 1).padStart(2, '0')}</span>
      {s.title}
    </h4>
    {s.blocks.map((b, i) => <Block key={i} b={b} />)}
  </section>
))}
```

- `idx`는 배열 순서에서 직접 산출(제목 문자열 정규식 추출 방식보다 안전 — `PRIVACY_SECTIONS`가 항상 제1조~제10조 순서라는 기존 전제와 정합).
- `.priv-article`(2번째 조항부터) 클래스가 I8의 구분선 앵커.
- `<section id={s.id}>`의 `id`는 I2 스크롤스파이·앵커 이동의 타깃이 된다(기존 `PrivacySection.id`가 이미 `art1`~`art10`로 존재 — 신규 필드 불필요).

**I2 — 조항 퀵점프 칩바** (`PRIVACY_INTRO` 앞에 신설, `priv-doc` 최상단):

```tsx
const [active, setActive] = useState(PRIVACY_SECTIONS[0].id);
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  if (!open) return;
  const body = rootRef.current?.closest('.pv-body') as HTMLElement | null;
  if (!body) return;
  const onScroll = () => setScrolled(body.scrollTop > 320);
  body.addEventListener('scroll', onScroll, { passive: true });

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    },
    { root: body, rootMargin: '-10% 0px -70% 0px', threshold: 0 }
  );
  PRIVACY_SECTIONS.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) io.observe(el);
  });
  return () => { body.removeEventListener('scroll', onScroll); io.disconnect(); };
}, [open]);

const jump = (id: string) => {
  const body = rootRef.current?.closest('.pv-body') as HTMLElement | null;
  const el = document.getElementById(id);
  if (!body || !el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  body.scrollTo({ top: el.offsetTop - 8, behavior: reduce ? 'auto' : 'smooth' });
};
```

```tsx
<div className="priv-toc" role="tablist" aria-label="조항 목차">
  {PRIVACY_SECTIONS.map((s, idx) => (
    <button
      key={s.id}
      type="button"
      className={`priv-toc-chip${active === s.id ? ' on' : ''}`}
      onClick={() => jump(s.id)}
    >
      {idx + 1}
    </button>
  ))}
</div>
<button
  type="button"
  className={`priv-totop${scrolled ? ' show' : ''}`}
  aria-label="문서 맨 위로"
  onClick={() => jump(PRIVACY_SECTIONS[0].id)}
>
  ↑
</button>
```

- `priv-toc`는 가로 스크롤 가능한 칩 행(모바일에서 10개 칩이 한 줄에 다 안 들어올 수 있음 — `overflow-x:auto` 허용, 세로 표 스크롤과는 무관하므로 6번 문제 재발 아님).
- `priv-totop`은 `.priv-doc`의 첫 번째 자식으로 배치하고 `position:sticky;bottom:14px;align-self:flex-end`로 스타일링해 스크롤 중 항상 우측 하단에 붙어 있게 한다(3-2 참조). `scrolled` 상태로 문서 최상단에서는 숨김.
- 스크롤 리셋 `useEffect`(기존 로직)는 그대로 유지 — 이번 신설 로직과 별개의 훅으로 공존시킨다(기존 훅 삭제 금지).

### 3-2. `styles/components.css` — 신규 선택자만 추가 (파일 최하단에 새 블록으로)

```css
/* ===== 개인정보처리방침 모달 전용 (.priv-doc 스코프 — 기존 .pv-* 규칙 무변경) ===== */
.priv-doc{display:flex;flex-direction:column}

/* I2: 목차 퀵점프 칩바 */
.priv-toc{position:sticky;top:-24px;z-index:3;display:flex;gap:6px;overflow-x:auto;
  padding:10px 0 12px;margin:-24px 0 14px;background:#fff;border-bottom:1px solid var(--line)}
.priv-toc-chip{flex:none;width:28px;height:28px;border-radius:50%;border:1px solid var(--line);
  background:#fff;color:var(--muted);font-size:12px;font-weight:700;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s,border-color .2s}
.priv-toc-chip:hover{border-color:var(--p1);color:var(--p1)}
.priv-toc-chip.on{background:var(--p1);border-color:var(--p1);color:#fff}

/* I3: 조항 번호 배지 */
.priv-num{flex:none;width:26px;height:26px;border-radius:50%;margin-right:9px;
  background:color-mix(in srgb,var(--p1) 10%,#fff);color:var(--p1);
  font-size:12px;font-weight:800;display:inline-flex;align-items:center;justify-content:center}

/* I8: 조항 간 구분선 */
.priv-article{border-top:1px solid var(--line);padding-top:6px}

/* I4: 필수/선택 배지 */
.priv-items{display:flex;flex-direction:column;gap:5px}
.priv-item{display:flex;gap:7px;align-items:flex-start}
.priv-tag{flex:none;font-size:11px;font-weight:800;padding:2px 8px;border-radius:999px;line-height:1.5}
.priv-tag.req{background:color-mix(in srgb,var(--ink) 8%,#fff);color:var(--ink)}
.priv-tag.opt{background:var(--surface);color:var(--muted)}

/* I5: 【 】 하이라이트 (기존 .pv-badge.s1 배색 재사용 — 신규 색상 0) */
.priv-bracket{background:#FBF0D8;color:#8A6314;padding:1px 6px;border-radius:6px;
  font-weight:700;font-style:normal}

/* I1: 표 컬럼 재분배 (3열 이상에서만, 스코프 오버라이드로 .pv-table 원 규칙 무영향) */
.priv-doc .pv-table.priv-table--wide td:first-child{width:26%;font-weight:600;color:#33333c}

/* I6: 모바일 카드형 전환 (≤640px) */
@media(max-width:640px){
  .priv-doc .pv-table.priv-table--wide{border:none}
  .priv-doc .pv-table.priv-table--wide thead{display:none}
  .priv-doc .pv-table.priv-table--wide,
  .priv-doc .pv-table.priv-table--wide tbody,
  .priv-doc .pv-table.priv-table--wide tr,
  .priv-doc .pv-table.priv-table--wide td{display:block;width:auto}
  .priv-doc .pv-table.priv-table--wide tr{border:1px solid var(--line);border-radius:12px;
    padding:12px 14px;margin-bottom:10px}
  .priv-doc .pv-table.priv-table--wide td{border-bottom:none;padding:6px 0}
  .priv-doc .pv-table.priv-table--wide td:before{content:attr(data-label);display:block;
    font-size:11px;font-weight:800;color:var(--p1);margin-bottom:3px}
}

/* I7: 스크롤-투-톱 미니 FAB (모달 내부 스코프 — 전역 .to-top과 별개) */
.priv-totop{position:sticky;bottom:14px;align-self:flex-end;z-index:4;
  width:38px;height:38px;border-radius:50%;border:1px solid var(--line);
  background:#fff;color:var(--muted);box-shadow:var(--shadow-2);cursor:pointer;
  display:flex;align-items:center;justify-content:center;font-size:15px;
  opacity:0;pointer-events:none;transform:translateY(6px);
  transition:opacity .25s var(--ease),transform .25s var(--ease)}
.priv-totop.show{opacity:1;pointer-events:auto;transform:none}
.priv-totop:hover{background:var(--ink);color:#fff;border-color:var(--ink)}
@media(prefers-reduced-motion:reduce){.priv-totop{transition:none}}
```

- `.priv-toc`의 `position:sticky;top:-24px`는 `.pv-body`의 상단 패딩(24px, `styles/components.css:262`)을 상쇄해 실제로는 `.pv-body`의 스크롤 상단에 딱 붙게 하기 위한 값이다. 로컬 빌드 시 실측하여 24px가 아니면 그 값에 맞춰 보정한다(원 패딩 값을 변경하는 것이 아니라 이 신규 규칙의 오프셋만 조정).
- `priv-num`은 `.pv-h`의 **자식**으로만 추가되므로 ReportModal의 `.pv-h > svg.pvi` 패턴과 무관하게 공존한다(선택자 충돌 없음 — 확인 필요 시 ReportModal 렌더 스냅샷 diff 0으로 검증).

### 3-3. `data/privacy.ts` — 무변경

이 파일은 손대지 않는다. `PrivacySection.id`(`art1`~`art10`)가 이미 존재하므로 앵커 이동에 추가 필드가 필요 없다.

---

## 4. 변경 금지 (회귀 조건)

- `data/privacy.ts` 조항 문구·표 데이터·순서 무변경. 렌더링 파싱은 시각적 표현일 뿐 원본 문자열을 변형하지 않는다(폴백 경로 필수).
- `Modal.tsx`·`ReportModal.tsx`·`useModal` 훅 무변경.
- 기존 `.pv-overlay`·`.pv-dialog`·`.pv-head`·`.pv-body`·`.pv-lead`·`.pv-h`·`.pv-table`·`.pv-note`·`.pv-list`·`.pv-cta` 등 **기존 선언 1줄도 수정 금지** — 전부 `.priv-*` 신규 클래스 또는 `.priv-doc` 스코프 하위 선택자로 확장.
- ReportModal(부정훈련 예방 안내·신고 접수·신고 조회 3탭)·ISMS 인증서 모달의 렌더·인터랙션에 영향 0(공유 클래스 스타일 diff 0).
- 신규 색상 토큰 0. Footer·다른 페이지 diff 0.
- 포커스 트랩·ESC·스크림 클릭·배경 스크롤 잠금 등 기존 `Modal`/`useModal` 동작 그대로 유지.

## 5. 완료 조건 / QA 체크리스트

**콘텐츠 무결성 (최우선)**
- [ ] 렌더된 전문 텍스트를 이어 붙이면 `data/privacy.ts` 원본과 글자 단위 일치 — 필수/선택 파싱·【】하이라이트로 인한 문자 손실·중복 0건
- [ ] 정규식 미스매치 케이스(제2조 제공 항목 등)가 원문 그대로 렌더되는지 확인(폴백 경로 실동작 검증)

**시각 개선**
- [ ] 목차 칩바: 클릭 시 해당 조항으로 스크롤 이동, 스크롤 중 현재 조항 칩이 `.on` 상태로 자동 갱신(스크롤스파이)
- [ ] 제1·2조 표: 데스크톱에서 컬럼 폭 재분배 후 처리목적·수집항목 줄바꿈이 기존 대비 완화됨을 스크린샷 대조
- [ ] 필수/선택 배지가 제1조 4개 행(상담·신고·문의·다운로드) 전부에서 정상 분리 렌더
- [ ] 【 】 표기(제8조 담당부서, 제10조 시행일) 하이라이트 렌더 확인
- [ ] 모바일(≤640px): 표가 카드형으로 전환되어 가로 스크롤 없이 전체 열람 가능, `data-label` 라벨 정상 노출
- [ ] 스크롤-투-톱 FAB: 320px 이상 스크롤 시 노출, 클릭 시 최상단(제1조)으로 부드럽게 이동, `prefers-reduced-motion`에서 즉시 이동

**회귀**
- [ ] ReportModal 3탭(예방 안내·신고 접수·신고 조회) 렌더·동작 diff 0
- [ ] ISMS 모달 렌더 diff 0
- [ ] 포커스 트랩·ESC·스크림 클릭·배경 스크롤 잠금 정상
- [ ] 빌드 0경고
