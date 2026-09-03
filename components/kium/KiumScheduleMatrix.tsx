'use client';

import { KIUM_CATEGORY_META, type KiumCourse } from '@/lib/kium/data';
import { fmtPrice, KIUM_PRICE_NOTE } from '@/lib/kium/pricing';
import { effectiveStatus, fmtRange, fmtRangeA11y, type KiumSession } from '@/lib/kium/sessions';
import { STATUS_LABEL } from './KiumSessionStatus';

const MONTHS = [10, 11, 12] as const;

/**
 * 과정별 매트릭스 (명세 §5-4 · ≥1024 기본)
 *
 * - 시맨틱은 반드시 실제 <table>. role="grid"는 쓰지 않는다.
 * - 교육비는 행 헤더(th[scope=row])에만 둔다 — 가격은 과정 단위 속성이라 셀에 넣으면 3회 반복된다.
 * - 빈 셀에 "-"를 렌더하지 않는다. .is-empty 톤다운 + .kium-sr 텍스트만.
 * - 마감 회차도 disabled로 만들지 않는다(포커스를 못 받아 스크린리더가 존재를 놓친다).
 *   클릭 시 §7-3의 인접 대안 안내로 넘긴다.
 */
export default function KiumScheduleMatrix({
  courses,
  sessions,
  now,
  highlightId,
  onApply,
}: {
  courses: KiumCourse[];
  sessions: KiumSession[];
  now: Date | null;
  highlightId: string | null;
  onApply: (s: KiumSession) => void;
}) {
  return (
    <div className="kium-mtx-wrap">
      <table className="kium-mtx">
        <caption className="kium-sr">
          10~12월 공개교육 개강 일정. 과정별로 월 회차를 표시합니다.
        </caption>
        <thead>
          <tr>
            <th scope="col">과정명</th>
            {MONTHS.map((m) => (
              <th scope="col" key={m}>
                {m}월
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id}>
              <th scope="row" className="kium-mtx-course">
                <span className="kium-lab cat" data-cat={c.category}>
                  <span className="kium-dot" aria-hidden="true" />
                  {KIUM_CATEGORY_META[c.category].label}
                </span>
                <span className="kium-mtx-title">{c.titleMarketing}</span>
                <span className="kium-mtx-meta">
                  <b>{c.hours}</b>시간 · <b>{c.days}</b>일
                </span>
                <span className="kium-mtx-price num">
                  {fmtPrice(c.id)} <i>{KIUM_PRICE_NOTE}</i>
                </span>
              </th>

              {MONTHS.map((m) => {
                const cells = sessions.filter((s) => s.courseId === c.id && s.displayMonth === m);
                if (cells.length === 0) {
                  return (
                    <td className="kium-mtx-cell is-empty" key={m}>
                      <span className="kium-sr">해당 월 개설 없음</span>
                    </td>
                  );
                }
                return (
                  <td className="kium-mtx-cell" key={m}>
                    {cells.map((s) => {
                      if (s.tbd) {
                        return (
                          <span className="kium-ses is-tbd" key={s.id}>
                            {fmtRange(s)}
                          </span>
                        );
                      }
                      const st = effectiveStatus(s, now);
                      return (
                        <button
                          type="button"
                          key={s.id}
                          className={`kium-ses${highlightId === s.id ? ' is-hl' : ''}`}
                          data-status={st}
                          aria-label={`${c.titleMarketing}, ${s.displayMonth}월 회차, ${fmtRangeA11y(s)}, ${c.days}일 과정, ${fmtPrice(c.id)}, ${STATUS_LABEL[st]}, 신청하기`}
                          onClick={() => onApply(s)}
                        >
                          <span className="kium-ses-date">{fmtRange(s)}</span>
                          <span className="kium-badge st" data-st={st}>
                            {STATUS_LABEL[st]}
                          </span>
                        </button>
                      );
                    })}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
