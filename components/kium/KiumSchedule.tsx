'use client';

import { useEffect, useRef, useState } from 'react';
import KiumScheduleMatrix from './KiumScheduleMatrix';
import KiumScheduleList from './KiumScheduleList';
import { KIUM_CONTENT } from '@/lib/kium/content';
import type { KiumCategory } from '@/lib/kium/data';
import {
  countByMonth,
  getOpenCourses,
  openCategoryCounts,
  type KiumSession,
} from '@/lib/kium/sessions';

const MONTHS = [10, 11, 12] as const;
/** 보기 전환 크로스페이드 — 명세 §5-3 (reduced-motion 시 0ms) */
const FADE_MS = 120;

export type KiumScheduleView = 'course' | 'date';

interface Props {
  sessions: KiumSession[];
  view: KiumScheduleView;
  onView: (v: KiumScheduleView) => void;
  month: 'all' | 10 | 11 | 12;
  onMonth: (m: 'all' | 10 | 11 | 12) => void;
  cat: 'all' | KiumCategory;
  onCat: (c: 'all' | KiumCategory) => void;
  confirmedOnly: boolean;
  onConfirmedOnly: (b: boolean) => void;
  showPast: boolean;
  onShowPast: (b: boolean) => void;
  now: Date | null;
  highlightId: string | null;
  onApply: (s: KiumSession) => void;
  onReset: () => void;
}

/**
 * 일정 영역 (명세 §5-3)
 *
 * 필터 바는 기존 `.kium-filters` / `.kium-chip`을 그대로 재사용한다(신규 클래스 없음).
 * 보기 전환은 role="tablist"가 아니라 radiogroup이다 — 콘텐츠가 아니라 표현이 바뀐다.
 */
export default function KiumSchedule({
  sessions, view, onView, month, onMonth, cat, onCat,
  confirmedOnly, onConfirmedOnly, showPast, onShowPast,
  now, highlightId, onApply, onReset,
}: Props) {
  const [fading, setFading] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>();
  const segRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => () => clearTimeout(fadeTimer.current), []);

  const changeView = (next: KiumScheduleView) => {
    if (next === view) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      onView(next);
      return;
    }
    setFading(true);
    clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => {
      onView(next);
      setFading(false);
    }, FADE_MS);
  };

  const VIEWS: { key: KiumScheduleView; label: string }[] = [
    { key: 'course', label: '과정별' },
    { key: 'date', label: '일정순' },
  ];

  const onSegKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = VIEWS.findIndex((v) => v.key === view);
    const n = (i + (e.key === 'ArrowRight' ? 1 : VIEWS.length - 1)) % VIEWS.length;
    segRefs.current[n]?.focus();
    changeView(VIEWS[n].key);
  };

  const cats = openCategoryCounts();
  const dated = sessions.filter((s) => !s.tbd);
  // 매트릭스 행 — 필터 결과에 회차가 남아 있는 과정만(빈 행을 만들지 않는다)
  const rows = getOpenCourses().filter((c) => sessions.some((s) => s.courseId === c.id));

  /** 결과 0건일 때 안내할 인접 대안 — 회차가 가장 많은 월 */
  const busiest = MONTHS.map((m) => ({ m, n: countByMonth(m) })).sort((a, b) => b.n - a.n)[0];

  return (
    <div className="kium-schedule">
      {/* ── 필터 바 ── */}
      <div className="kium-filters" role="group" aria-label="공개교육 일정 필터">
        <button type="button" className="kium-chip" aria-pressed={month === 'all'} onClick={() => onMonth('all')}>
          전체 <span className="cnt">{countByMonth(10) + countByMonth(11) + countByMonth(12)}</span>
        </button>
        {MONTHS.map((m) => (
          <button key={m} type="button" className="kium-chip" aria-pressed={month === m} onClick={() => onMonth(m)}>
            {m}월 <span className="cnt">{countByMonth(m)}</span>
          </button>
        ))}
      </div>

      <div className="kium-filters" role="group" aria-label="공개교육 과정 카테고리 필터">
        <button type="button" className="kium-chip" aria-pressed={cat === 'all'} onClick={() => onCat('all')}>
          전체 <span className="cnt">{cats.reduce((n, c) => n + c.count, 0)}</span>
        </button>
        {cats.map((c) => (
          <button key={c.key} type="button" className="kium-chip" aria-pressed={cat === c.key} onClick={() => onCat(c.key)}>
            {c.label} <span className="cnt">{c.count}</span>
          </button>
        ))}
        <button
          type="button"
          className="kium-chip"
          aria-pressed={confirmedOnly}
          onClick={() => onConfirmedOnly(!confirmedOnly)}
        >
          개강확정만
        </button>
      </div>

      {/* ── 결과 건수 + 보기 전환 ── */}
      <div className="kium-sched-head">
        <p className="kium-count" aria-live="polite">
          {dated.length}개 회차
        </p>
        <div className="kium-viewseg" role="radiogroup" aria-label="일정 보기 방식" onKeyDown={onSegKey}>
          {VIEWS.map((v, i) => (
            <button
              key={v.key}
              type="button"
              role="radio"
              aria-checked={view === v.key}
              tabIndex={view === v.key ? 0 : -1}
              className="kium-viewseg-btn"
              ref={(el) => {
                segRefs.current[i] = el;
              }}
              onClick={() => changeView(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className={`kium-sched-body${fading ? ' fading' : ''}`}>
        {/* 일정순 뷰는 tbd를 제외하므로 '남은 게 tbd뿐'이면 리스트가 통째로 빈다 → 같은 안내로 받는다 */}
        {sessions.length === 0 || (view === 'date' && dated.length === 0) ? (
          <>
            <p className="kium-empty">선택하신 조건에 맞는 회차가 없습니다.</p>
            <p className="kium-caption">
              <button type="button" className="kium-chip" onClick={onReset}>
                전체 회차 보기
              </button>
            </p>
            <p className="kium-caption soft">
              {busiest.m}월에는 {busiest.n}개 회차가 열려 있습니다.
            </p>
          </>
        ) : view === 'course' ? (
          <KiumScheduleMatrix
            courses={rows}
            sessions={sessions}
            now={now}
            highlightId={highlightId}
            onApply={onApply}
          />
        ) : (
          <KiumScheduleList
            sessions={sessions}
            now={now}
            showPast={showPast}
            onShowPast={onShowPast}
            highlightId={highlightId}
            onApply={onApply}
          />
        )}
      </div>

      <p className="kium-caption">{KIUM_CONTENT.open.scheduleCaption}</p>
    </div>
  );
}
