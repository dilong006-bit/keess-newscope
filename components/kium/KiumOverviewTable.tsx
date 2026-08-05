import { KIUM_CONTENT } from '@/lib/kium/content';

/**
 * F3 지원개요표 — 2열 정의표 (기술명세서 v1.0 §4 · 전략 §4-4)
 *
 * 문안은 content.ts overview 원문. 값 강조는 지원율 1건(퍼플)만.
 * "(지원 한도는 기업별 상이)" 괄호절은 원문 그대로 두고 보조 문장으로 톤만 낮춘다.
 */

/** 강조 대상 행 — 지원율·지원한도 1건 */
const HL_LABEL = '지원율·지원한도';

export default function KiumOverviewTable() {
  return (
    <>
      <div className="kium-overview">
        <dl>
          {KIUM_CONTENT.overview.map((row) => {
            const hl = row.label === HL_LABEL;
            // 괄호절 분리 — 구분 공백까지 보조 문장 쪽에 포함시켜, 두 노드를 이으면
            // content.ts 원문과 문자 단위로 완전히 동일해진다(보조 문장은 block이라 선행 공백은 시각적으로 무시).
            const m = hl ? row.value.match(/^(.*?)(\s*\(.*\))$/) : null;
            return (
              <div key={row.label} style={{ display: 'contents' }}>
                <dt>{row.label}</dt>
                <dd>
                  {m ? (
                    <>
                      <span className="kium-hl">{m[1]}</span>
                      <span className="kium-dd-note">{m[2]}</span>
                    </>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
        {/* C1 슬롯 — 지원율 금액 환산 다이어그램(사업 확인 후 삽입).
            레이아웃 재편 없이 이 자리에 1행만 추가하면 되도록 예약해 둔다. */}
        <div className="kium-overview-slot" />
      </div>

      {/* 불확실성(한도 기업별 상이)을 행동으로 전환 — 자격확인 섹션 앵커 */}
      <a className="kium-inline-link" href="#kium-eligibility">
        {KIUM_CONTENT.sectionLeads.limitLink}
        <span aria-hidden="true">→</span>
      </a>
    </>
  );
}
