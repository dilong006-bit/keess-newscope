import { REFERENCES, REF_LOGOS } from '@/data/home';

// 단일 배열(REF_LOGOS)을 2개 행으로 분할 — 홀짝 분배로 행 길이 균형.
// 항목을 배열에 추가하면 자동으로 행에 배분되어 롤링에 반영된다.
const rows: string[][] = [[], []];
REF_LOGOS.forEach((name, i) => rows[i % 2].push(name));

/**
 * 고객사 CI 무한 롤링(마퀴).
 * - 트랙을 2회 복제해 translateX(-50%)로 이음새 없는 루프
 * - 1행 좌→우, 2행 우→좌(방향 교차), hover 시 일시정지
 * - prefers-reduced-motion: 롤링 정지 + 정적 그리드 폴백(복제분 숨김)
 * - 순수 CSS 애니메이션이라 클라이언트 JS 불필요(서버 컴포넌트)
 */
export default function HomeReferences() {
  return (
    <section className="section ref-sec">
      <div className="wrap">
        <p className="eyebrow r">{REFERENCES.eyebrow}</p>
        <h2 className="sec-title r" style={{ marginTop: 12 }}>{REFERENCES.title}</h2>
      </div>

      <div className="ref-roll r" role="group" aria-label="고객사 레퍼런스">
        {rows.map((row, ri) => (
          // 무한 루프 마퀴 — 트랙이 뷰포트보다 넓은 것이 설계 의도다(모바일 계측 C2/C5 예외 표식)
          <div className={`ref-row${ri % 2 === 1 ? ' rev' : ''}`} key={ri} data-hscroll>
            <div className="ref-track">
              {[...row, ...row].map((name, i) => {
                const dup = i >= row.length;
                return (
                  <span className={`ref-chip${dup ? ' ref-dup' : ''}`} key={`${ri}-${i}`} aria-hidden={dup || undefined}>
                    {name}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="wrap"><p className="ref-cap r">{REFERENCES.cap}</p></div>
    </section>
  );
}
