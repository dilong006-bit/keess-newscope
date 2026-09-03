'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import KiumOpenHero from './KiumOpenHero';
import KiumSchedule, { type KiumScheduleView } from './KiumSchedule';
import KiumCourseGrid from './KiumCourseGrid';
import KiumFaq from './KiumFaq';
import { KIUM_CONTENT } from '@/lib/kium/content';
import { getCourseById, getOpenFaq } from '@/lib/kium/queries';
import type { KiumCategory } from '@/lib/kium/data';
import {
  KIUM_SESSIONS,
  effectiveStatus,
  fmtRange,
  getOpenCourses,
  getSessionById,
  getSessionsByDate,
  isPast,
  openCategoryCounts,
  type KiumSession,
} from '@/lib/kium/sessions';
import {
  KIUM_OPEN_SELECT_EVENT,
  applyForSession,
  openPrefillText,
} from '@/lib/kium/openBridge';
import { KIUM_PREFILL_EVENT } from '@/lib/kium/inquiryBridge';

/** 딥링크 하이라이트 유지 시간 */
const HL_MS = 2400;

type Month = 'all' | 10 | 11 | 12;

/**
 * 공개교육 탭 루트 (명세 §5-1)
 *
 * 책임
 *  1. 필터 상태(month / cat / confirmedOnly)와 보기 상태(view) 보유
 *  2. URL 쿼리 동기화 — ?view= ?month= (history.replaceState · 뒤로가기 스택 미오염)
 *  3. 딥링크 처리(§7-4)
 *  4. 히어로 / 일정 / 과정 소개(KiumCourseGrid 재사용) / FAQ(KiumFaq 재사용) 조립
 *
 * §8 SSG 규칙: 서버 렌더 경로에서 new Date()·window를 참조하지 않는다.
 *   now는 null로 시작해 마운트 후 세팅하고, 기본 보기는 서버에서 'date' 고정 후 마운트에서 승격한다.
 */
export default function KiumOpenTab() {
  const rootRef = useRef<HTMLDivElement>(null);

  const [month, setMonth] = useState<Month>('all');
  // 과정 소개 섹션(KiumCourseGrid)의 카테고리 필터와 공유하지 않는다 — 일정 필터와 카탈로그 필터를 분리
  const [cat, setCat] = useState<'all' | KiumCategory>('all');
  const [confirmedOnly, setConfirmedOnly] = useState(false);
  const [view, setView] = useState<KiumScheduleView>('date');
  const [showPast, setShowPast] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  /** 마감 회차 클릭 시의 인접 대안 안내(§7-3) */
  const [closedNotice, setClosedNotice] = useState<{ sessionId: string; nextId: string | null } | null>(null);

  /** 쿼리 동기화 — replace라 뒤로가기 스택을 늘리지 않는다(KiumCourseGrid.changeCat과 동일 패턴) */
  const syncQuery = useCallback((next: { view?: KiumScheduleView; month?: Month }) => {
    const url = new URL(window.location.href);
    if (next.view !== undefined) {
      if (next.view === 'date') url.searchParams.delete('view');
      else url.searchParams.set('view', next.view);
    }
    if (next.month !== undefined) {
      if (next.month === 'all') url.searchParams.delete('month');
      else url.searchParams.set('month', String(next.month));
    }
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const changeView = (v: KiumScheduleView) => {
    setView(v);
    syncQuery({ view: v });
  };
  const changeMonth = (m: Month) => {
    setMonth(m);
    syncQuery({ month: m });
  };
  const reset = () => {
    setMonth('all');
    setCat('all');
    setConfirmedOnly(false);
    syncQuery({ month: 'all' });
  };

  /* ── 마운트 후 1회: 딥링크 정규화 · 쿼리 파싱 · now · 기본 보기 승격 ───── */
  useEffect(() => {
    // 명세 §7-4 표기(`/kium#open?view=date&month=11`)는 표준 URL에서 해시 안에 쿼리가 갇힌다.
    // 파라미터를 표준 위치(search)로 옮기고 해시는 탭 id만 남긴다 — KiumTabs는 수정하지 않는다.
    const hash = window.location.hash;
    const qi = hash.indexOf('?');
    if (qi > -1) {
      const url = new URL(window.location.href);
      new URLSearchParams(hash.slice(qi + 1)).forEach((v, k) => url.searchParams.set(k, v));
      url.hash = hash.slice(1, qi);
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      window.dispatchEvent(new Event('hashchange'));
    }

    const n = new Date();
    setNow(n);

    const q = new URLSearchParams(window.location.search);

    // 기본 보기 — 뷰포트가 기본값만 결정한다(사용자는 어느 뷰포트에서도 전환 가능)
    const qView = q.get('view');
    if (qView === 'course' || qView === 'date') setView(qView);
    else if (window.matchMedia('(min-width:1024px)').matches) setView('course');

    const qMonth = Number(q.get('month'));
    const hasQMonth = qMonth === 10 || qMonth === 11 || qMonth === 12;
    if (hasQMonth) setMonth(qMonth as 10 | 11 | 12);

    // ── 회차 딥링크(§7-4) — 유효하지 않으면 무시하고 기본 화면. 에러 화면은 만들지 않는다
    const course = getCourseById(q.get('course') ?? '');
    const session = getSessionById(q.get('round') ?? '');
    const apply = q.get('apply') === '1';
    let dispatchTimer: ReturnType<typeof setTimeout> | undefined;

    if (course && session && session.courseId === course.id && !session.tbd) {
      setHighlightId(session.id);
      // 명시된 month가 없을 때만 회차의 월로 좁힌다 — 명시 파라미터를 덮어쓰지 않는다
      if (!hasQMonth) setMonth(session.displayMonth);

      // ★ 한 틱 미룬다. 이 효과는 형제인 HomeInquiry·KiumApplySummary의 구독 등록보다
      //   먼저 실행되므로, 즉시 dispatch하면 아무도 듣지 못하고 프리필이 유실된다.
      dispatchTimer = setTimeout(() => {
        if (apply) {
          applyForSession(course, session);
          return;
        }
        // 프리필은 적용하되 폼으로 이동하지는 않는다
        window.dispatchEvent(
          new CustomEvent(KIUM_PREFILL_EVENT, {
            detail: { text: openPrefillText(course, session), trainees: 'lte9' },
          })
        );
        window.dispatchEvent(
          new CustomEvent(KIUM_OPEN_SELECT_EVENT, {
            detail: { courseId: course.id, sessionId: session.id },
          })
        );
      }, 0);
    }

    // 새로고침 시 재실행되지 않도록 딥링크 파라미터를 URL에서 제거한다
    if (q.has('course') || q.has('round') || q.has('apply')) {
      const url = new URL(window.location.href);
      ['course', 'round', 'apply'].forEach((k) => url.searchParams.delete(k));
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }

    return () => clearTimeout(dispatchTimer);
  }, []);

  /* ── 하이라이트 자동 해제 + 대상으로 스크롤 ───────────────────────── */
  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), HL_MS);
    const raf = requestAnimationFrame(() => {
      const el = rootRef.current?.querySelector('.is-hl');
      if (!el) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [highlightId]);

  /* ── --kium-sticky 주입 — 탭바 높이가 바뀌어도 따라간다(§6-2) ─────── */
  useEffect(() => {
    const set = () => {
      const bar = document.querySelector('.kium-tabbar');
      if (!bar || !rootRef.current) return;
      const v = parseFloat(getComputedStyle(bar).top || '0') + bar.getBoundingClientRect().height;
      rootRef.current.style.setProperty('--kium-sticky', `${v}px`);
    };
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, []);

  /* ── 필터링 ───────────────────────────────────────────────────────── */
  const filtered = KIUM_SESSIONS.filter((s) => {
    if (month !== 'all' && s.displayMonth !== month) return false;
    if (cat !== 'all') {
      const c = getCourseById(s.courseId);
      if (!c || c.category !== cat) return false;
    }
    if (confirmedOnly && effectiveStatus(s, now) !== 'confirmed') return false;
    return true;
  });

  /* ── 신청 — 마감 회차는 프리필하지 않고 인접 대안을 안내한다(§7-3) ── */
  const handleApply = (s: KiumSession) => {
    const course = getCourseById(s.courseId);
    if (!course) return;
    if (effectiveStatus(s, now) === 'closed') {
      const next = getSessionsByDate().find(
        (o) => o.id !== s.id && effectiveStatus(o, now) !== 'closed' && (!now || !isPast(o, now))
      );
      setClosedNotice({ sessionId: s.id, nextId: next?.id ?? null });
      return;
    }
    setClosedNotice(null);
    applyForSession(course, s);
  };

  const noticeSession = closedNotice?.nextId ? getSessionById(closedNotice.nextId) : undefined;

  return (
    <div className="kium-open" ref={rootRef}>
      <KiumOpenHero now={now} onApply={handleApply} />

      <h3 className="kium-detail-h r">{KIUM_CONTENT.open.scheduleHeading}</h3>
      <KiumSchedule
        sessions={filtered}
        view={view}
        onView={changeView}
        month={month}
        onMonth={changeMonth}
        cat={cat}
        onCat={setCat}
        confirmedOnly={confirmedOnly}
        onConfirmedOnly={setConfirmedOnly}
        showPast={showPast}
        onShowPast={setShowPast}
        now={now}
        highlightId={highlightId}
        onApply={handleApply}
        onReset={reset}
      />

      {/* 마감 회차 인접 대안 — 막다른 길을 만들지 않는다(§7-3) */}
      {closedNotice && (
        <p className="kium-caption" aria-live="polite">
          이 회차는 마감되었습니다.
          {noticeSession ? (
            <>
              {' '}가장 빠른 다음 회차: {fmtRange(noticeSession)}{' '}
              <button
                type="button"
                className="kium-chip"
                onClick={() => {
                  setClosedNotice(null);
                  handleApply(noticeSession);
                }}
              >
                신청하기
              </button>
            </>
          ) : null}
        </p>
      )}

      <h3 className="kium-detail-h r">{KIUM_CONTENT.open.coursesHeading}</h3>
      <KiumCourseGrid
        courses={getOpenCourses()}
        categories={openCategoryCounts()}
        idPrefix="open-"
      />

      <h3 className="kium-detail-h r">{KIUM_CONTENT.open.faqHeading}</h3>
      <div className="kium-faq r">
        <KiumFaq items={getOpenFaq()} />
      </div>
    </div>
  );
}
