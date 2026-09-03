'use client';

import { useEffect, useRef, useState } from 'react';
import SessionListView from './SessionListView';
import CourseListView, { coursesWithSessions } from './CourseListView';
import {
  IconAlarmClock,
  IconCalendarDays,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleSlash,
} from './kiumIcons';
import { KIUM_CONTENT } from '@/lib/kium/content';
import type { KiumCategory, KiumCourse } from '@/lib/kium/data';
import {
  KIUM_SESSION_META,
  KIUM_STATUS_ORDER,
  countByMonth,
  countByStatus,
  getOpenCourses,
  openCategoryCounts,
  type KiumSession,
  type KiumSessionStatus,
} from '@/lib/kium/sessions';

const MONTHS = [10, 11, 12] as const;

/** 상태 필터 칩 아이콘 — SessionBadge와 같은 Lucide 심볼. 색은 CSS(data-st)가 준다 */
const STATUS_ICON: Record<KiumSessionStatus, (p: { size?: 14 }) => JSX.Element> = {
  recruiting: IconCircleDashed,
  confirmed: IconCircleCheck,
  closing: IconAlarmClock,
  closed: IconCircleSlash,
};
/** 보기 전환 크로스페이드 — reduced-motion 시 0ms */
const FADE_MS = 120;

export type KiumScheduleView = 'date' | 'course';

interface Props {
  /** 월·카테고리 필터까지 적용된 목록(상태 칩 카운트의 모수) */
  scoped: KiumSession[];
  /** 상태 필터까지 적용된 최종 목록 */
  sessions: KiumSession[];
  view: KiumScheduleView;
  onView: (v: KiumScheduleView) => void;
  month: 'all' | 10 | 11 | 12;
  onMonth: (m: 'all' | 10 | 11 | 12) => void;
  cat: 'all' | KiumCategory;
  onCat: (c: 'all' | KiumCategory) => void;
  status: 'all' | KiumSessionStatus;
  onStatus: (s: 'all' | KiumSessionStatus) => void;
  now: Date | null;
  onReset: () => void;
  onConsultSession: (s: KiumSession) => void;
  onConsultCourse: (c: KiumCourse) => void;
  onConsultMonth: (m: 10 | 11 | 12) => void;
}

/**
 * 일정 영역 (명세 STEP 3)
 *
 * 월=열 매트릭스 테이블은 **제거**됐다. 헤더 겹침(D1)·필터 시 행 붕괴(D2)·빈 열(D3)이
 * 전부 "월을 열로 잡은 구조"에서 나왔기 때문에 부분 수정이 아니라 교체가 조치다.
 * 같은 데이터를 일정순 리스트(기본)와 과정별 리스트 두 보기로 표현한다.
 *
 * 필터 바는 기존 `.kium-filters` / `.kium-chip`을 그대로 재사용한다.
 */
export default function KiumSchedule({
  scoped, sessions, view, onView, month, onMonth, cat, onCat, status, onStatus,
  now, onReset, onConsultSession, onConsultCourse, onConsultMonth,
}: Props) {
  const [fading, setFading] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout>>();
  const segRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => () => clearTimeout(fadeTimer.current), []);

  const changeView = (next: KiumScheduleView) => {
    if (next === view) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
    { key: 'date', label: '일정순' },
    { key: 'course', label: '과정별' },
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
  const stCount = countByStatus(scoped, now);
  const rows = coursesWithSessions(getOpenCourses(), sessions);

  return (
    <div className="kium-schedule">
      {/* ── 필터 바 — 3줄 모두 [행 라벨] + [칩 목록] 동일 구조 ── */}
      <div className="kium-frow">
        <span className="kium-frow-lb" id="kium-fl-month">기간</span>
        <div className="kium-filters" role="group" aria-labelledby="kium-fl-month">
          <button type="button" className="kium-chip" aria-pressed={month === 'all'} onClick={() => onMonth('all')}>
            전체 <span className="cnt">{countByMonth(10) + countByMonth(11) + countByMonth(12)}</span>
          </button>
          {MONTHS.map((m) => (
            <button key={m} type="button" className="kium-chip" aria-pressed={month === m} onClick={() => onMonth(m)}>
              {m}월 <span className="cnt">{countByMonth(m)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="kium-frow">
        <span className="kium-frow-lb" id="kium-fl-cat">분야</span>
        <div className="kium-filters" role="group" aria-labelledby="kium-fl-cat">
          <button type="button" className="kium-chip" aria-pressed={cat === 'all'} onClick={() => onCat('all')}>
            전체 <span className="cnt">{cats.reduce((n, c) => n + c.count, 0)}</span>
          </button>
          {cats.map((c) => (
            <button key={c.key} type="button" className="kium-chip" aria-pressed={cat === c.key} onClick={() => onCat(c.key)}>
              {c.label} <span className="cnt">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/*
        모집 상태 칩 — 월·분야 칩과 **완전히 같은 플레인 칩**이다.
        컬러 배경 pill(SessionBadge)을 필터에 쓰면 세 줄의 시각 무게가 어긋나고,
        "선택됨"과 "상태색"이 같은 축(배경색)을 다투게 된다.
        상태 구분은 아이콘 stroke 색 한 축으로만 하고(배경·보더에 상태색 금지),
        선택 표시는 다른 두 줄과 동일한 네이비 반전이 전담한다.
        SessionBadge는 일정 행·회차 pill·회차 카드·카드 최근접 배지에서 종전 그대로 쓰인다.
      */}
      <div className="kium-frow">
        <span className="kium-frow-lb" id="kium-fl-st">모집 상태</span>
        <div className="kium-filters" role="group" aria-labelledby="kium-fl-st">
          <button type="button" className="kium-chip" aria-pressed={status === 'all'} onClick={() => onStatus('all')}>
            전체 <span className="cnt">{scoped.length}</span>
          </button>
          {KIUM_STATUS_ORDER.map((st) => {
            const Icon = STATUS_ICON[st];
            return (
              <button
                key={st}
                type="button"
                className="kium-chip kium-chip-st"
                data-st={st}
                aria-pressed={status === st}
                onClick={() => onStatus(st)}
              >
                <Icon size={14} />
                {KIUM_SESSION_META[st].label} <span className="cnt">{stCount[st]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 결과 건수 + 보기 전환 ── */}
      <div className="kium-sched-head">
        <p className="kium-count" aria-live="polite">
          {sessions.length}개 회차
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
        {sessions.length === 0 ? (
          <div className="kium-empty2">
            <IconCalendarDays size={20} />
            <p>해당 조건의 회차가 없습니다.</p>
            <button type="button" className="kium-chip" onClick={onReset}>
              필터 초기화
            </button>
          </div>
        ) : view === 'date' ? (
          <SessionListView
            sessions={sessions}
            now={now}
            onConsultSession={onConsultSession}
            onConsultMonth={onConsultMonth}
          />
        ) : (
          <CourseListView
            courses={rows}
            sessions={sessions}
            now={now}
            onConsultSession={onConsultSession}
            onConsultCourse={onConsultCourse}
          />
        )}
      </div>

      <p className="kium-caption">{KIUM_CONTENT.open.scheduleCaption}</p>
    </div>
  );
}
