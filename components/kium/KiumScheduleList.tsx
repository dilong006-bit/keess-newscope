'use client';

import { KIUM_CATEGORY_META } from '@/lib/kium/data';
import { getCourseById } from '@/lib/kium/queries';
import { fmtPrice, KIUM_PRICE_NOTE } from '@/lib/kium/pricing';
import { effectiveStatus, fmtRange, fmtRangeA11y, isPast, type KiumSession } from '@/lib/kium/sessions';
import { STATUS_LABEL } from './KiumSessionStatus';

/**
 * 일정순 리스트 (명세 §5-5 · <1024 기본)
 *
 * - 정렬은 시작일 오름차순(getSessionsByDate)이고 월 단위로 그룹한다.
 * - 날짜가 최상단·최대 위계다. 이 순서가 뒤집히면 매트릭스의 열화판이 된다.
 * - tbd 회차는 정렬 위치가 없으므로 리스트에서 제외한다(매트릭스에서만 비활성 렌더).
 * - 지난 회차는 기본 숨김. now === null(서버·마운트 전)이면 숨김 처리 자체를 하지 않는다(§8).
 */
export default function KiumScheduleList({
  sessions,
  now,
  showPast,
  onShowPast,
  highlightId,
  onApply,
}: {
  sessions: KiumSession[];
  now: Date | null;
  showPast: boolean;
  onShowPast: (b: boolean) => void;
  highlightId: string | null;
  onApply: (s: KiumSession) => void;
}) {
  // 정렬은 getSessionsByDate()와 같은 기준(시작일 오름차순)이다.
  // 넘겨받는 sessions는 KIUM_SESSIONS(과정별) 순서라 여기서 반드시 다시 정렬해야
  // 월 그룹이 연속으로 묶인다.
  const dated = sessions
    .filter((s) => !s.tbd)
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const pastCount = now ? dated.filter((s) => isPast(s, now)).length : 0;
  const visible = now && !showPast ? dated.filter((s) => !isPast(s, now)) : dated;

  // 시작일 오름차순 목록을 훑으며 displayMonth가 바뀌는 지점에서 그룹을 끊는다.
  const groups: { month: number; items: KiumSession[] }[] = [];
  for (const s of visible) {
    const last = groups[groups.length - 1];
    if (last && last.month === s.displayMonth) last.items.push(s);
    else groups.push({ month: s.displayMonth, items: [s] });
  }

  return (
    <>
      {groups.map((g) => {
        const hid = `m-${g.month}`;
        return (
          <section className="kium-list" aria-label="일정순 회차 목록" key={g.month}>
            <h3 className="kium-list-mh" id={hid}>
              {g.month}월 <span className="cnt">{g.items.length}개 회차</span>
            </h3>
            <ul className="kium-list-ul" aria-labelledby={hid}>
              {g.items.map((s) => {
                const c = getCourseById(s.courseId);
                if (!c) return null;
                const st = effectiveStatus(s, now);
                return (
                  <li
                    className={`kium-scard${highlightId === s.id ? ' is-hl' : ''}`}
                    data-status={st}
                    key={s.id}
                  >
                    <p className="kium-scard-date">
                      {fmtRange(s)} <span className="kium-scard-days">{c.days}일</span>
                    </p>
                    <p className="kium-lab cat" data-cat={c.category}>
                      <span className="kium-dot" aria-hidden="true" />
                      {KIUM_CATEGORY_META[c.category].label}
                    </p>
                    <p className="kium-scard-title">{c.titleMarketing}</p>
                    <p className="kium-scard-meta">
                      <b>{c.hours}</b>시간 · <span className="num">{fmtPrice(c.id)}</span>{' '}
                      <i>{KIUM_PRICE_NOTE}</i>
                    </p>
                    <div className="kium-scard-foot">
                      <span className="kium-badge st" data-st={st}>
                        {STATUS_LABEL[st]}
                      </span>
                      <button
                        type="button"
                        className="btn btn-ink kium-scard-cta"
                        aria-label={`${c.titleMarketing}, ${s.displayMonth}월 회차, ${fmtRangeA11y(s)}, ${c.days}일 과정, ${fmtPrice(c.id)}, ${STATUS_LABEL[st]}, 신청하기`}
                        onClick={() => onApply(s)}
                      >
                        신청하기
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {pastCount > 0 && (
        <p className="kium-caption">
          <button type="button" className="kium-chip" onClick={() => onShowPast(!showPast)}>
            {showPast ? `지난 회차 ${pastCount}건 접기` : `지난 회차 ${pastCount}건 보기`}
          </button>
        </p>
      )}
    </>
  );
}
