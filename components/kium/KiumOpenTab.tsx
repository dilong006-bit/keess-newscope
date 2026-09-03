'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import KiumOpenHero from './KiumOpenHero';
import KiumSchedule, { type KiumScheduleView } from './KiumSchedule';
import KiumCourseGrid from './KiumCourseGrid';
import KiumFaq from './KiumFaq';
import BadgeShowcase from './BadgeShowcase';
import { KIUM_CONTENT } from '@/lib/kium/content';
import { getCourseById, getOpenFaq } from '@/lib/kium/queries';
import { KIUM_OPEN_THUMBS } from '@/lib/kium/openThumbs';
import type { KiumCategory, KiumCourse } from '@/lib/kium/data';
import {
  KIUM_SESSIONS,
  effectiveStatus,
  getOpenCourses,
  getSessionById,
  openCategoryCounts,
  type KiumSession,
  type KiumSessionStatus,
} from '@/lib/kium/sessions';
import {
  consultCourse,
  consultMonth,
  consultSession,
  dispatchPrefill,
  prefillTextA,
  prefillTextB,
  prefillTextC,
  scrollToInquiry,
} from '@/lib/kium/openBridge';

type Month = 'all' | 10 | 11 | 12;

/**
 * 공개교육 탭 루트 (명세 STEP 3·5·7)
 *
 * 책임
 *  1. 필터 상태(month / cat / status)와 보기 상태(view) 보유 — 기본 보기는 '일정순'
 *  2. URL 쿼리 동기화 — `?view=` `?month=` (history.replaceState · 뒤로가기 스택 미오염)
 *  3. 상담 프리필 딥링크 `?consult=1&course=&session=` 처리(새로고침·공유 유지)
 *  4. 히어로 / 일정 / 과정 소개(KiumCourseGrid 재사용) / FAQ(KiumFaq 재사용) 조립
 *  5. `?preview=badges` 쇼케이스 게이트
 *
 * SSG 규칙: 서버 렌더 경로에서 new Date()·window를 참조하지 않는다.
 *   now는 null로 시작해 마운트 후 세팅하고, 기본 보기는 서버에서 'date' 고정이다
 *   (일정순이 기본값이라 뷰포트 승격 자체가 필요 없어졌다).
 */
export default function KiumOpenTab() {
  const rootRef = useRef<HTMLDivElement>(null);

  const [month, setMonth] = useState<Month>('all');
  // 과정 소개 섹션(KiumCourseGrid)의 카테고리 필터와 공유하지 않는다 — 일정 필터와 카탈로그 필터를 분리
  const [cat, setCat] = useState<'all' | KiumCategory>('all');
  const [status, setStatus] = useState<'all' | KiumSessionStatus>('all');
  const [view, setView] = useState<KiumScheduleView>('date');
  const [now, setNow] = useState<Date | null>(null);
  const [showcase, setShowcase] = useState(false);

  /** 쿼리 동기화 — replace라 뒤로가기 스택을 늘리지 않는다 */
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
    setStatus('all');
    syncQuery({ month: 'all' });
  };

  /* ── 마운트 후 1회: 딥링크 정규화 · 쿼리 파싱 · now · 상담 프리필 ───────── */
  useEffect(() => {
    // `/kium#open?view=date` 표기는 표준 URL에서 쿼리가 해시 안에 갇힌다.
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
    setShowcase(q.get('preview') === 'badges');

    const qView = q.get('view');
    if (qView === 'course' || qView === 'date') setView(qView);

    const qMonth = Number(q.get('month'));
    const hasQMonth = qMonth === 10 || qMonth === 11 || qMonth === 12;
    if (hasQMonth) setMonth(qMonth as 10 | 11 | 12);

    /* ── 상담 프리필 딥링크(§5-1) ─────────────────────────────────
       `?consult=1&course=&session=`. 잘못된 id는 조용히 무시하고 폼 기본 상태로 둔다.
       구 링크(`round`/`apply`)도 별칭으로 받아 이미 배포된 URL을 깨뜨리지 않는다. */
    const consult = q.get('consult') === '1' || q.get('apply') === '1';
    const course = getCourseById(q.get('course') ?? '');
    const session = getSessionById(q.get('session') ?? q.get('round') ?? '');
    const valid = course && session && session.courseId === course.id ? session : undefined;

    if (consult || course || session) {
      // ★ 한 틱 미룬다. 이 효과는 형제인 HomeInquiry·KiumApplySummary의 구독 등록보다
      //   먼저 실행되므로, 즉시 dispatch하면 아무도 듣지 못하고 프리필이 유실된다.
      const t = window.setTimeout(() => {
        if (course && valid) {
          if (effectiveStatus(valid, n) === 'closed') {
            // 마감 가드 — 그 회차로 프리필하지 않고 다음 회차 상담(경로 B)으로 넘긴다
            dispatchPrefill(prefillTextB(course, valid), {
              route: 'B',
              courseId: course.id,
              fromClosedSessionId: valid.id,
            });
          } else {
            dispatchPrefill(prefillTextA(course, valid, n), {
              route: 'A',
              courseId: course.id,
              sessionId: valid.id,
            });
          }
        } else if (course) {
          dispatchPrefill(prefillTextB(course), { route: 'B', courseId: course.id });
        } else if (hasQMonth && consult) {
          const m = qMonth as 10 | 11 | 12;
          dispatchPrefill(prefillTextC(m), { route: 'C', month: m });
        } else {
          return; // 유효한 대상 없음 → 프리필 없음, 에러 화면도 없음
        }
        if (consult) scrollToInquiry();
      }, 0);
      return () => window.clearTimeout(t);
    }
  }, []);

  /* ── --kium-sticky 주입 — 탭바 높이가 바뀌어도 따라간다 ───────────────── */
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

  /* ── 필터링 ───────────────────────────────────────────────────────────
     scoped = 월·카테고리까지 적용(상태 칩 카운트의 모수)
     visible = 상태 필터까지 적용(최종 렌더 대상) */
  const scoped = KIUM_SESSIONS.filter((s) => {
    if (month !== 'all' && s.displayMonth !== month) return false;
    if (cat !== 'all') {
      const c = getCourseById(s.courseId);
      if (!c || c.category !== cat) return false;
    }
    return true;
  });
  const visible = status === 'all' ? scoped : scoped.filter((s) => effectiveStatus(s, now) === status);

  /* ── 상담 진입점 ─────────────────────────────────────────────────────── */
  const onConsultSession = (s: KiumSession) => {
    const c = getCourseById(s.courseId);
    if (c) consultSession(c, s, now);
  };
  const onConsultCourse = (c: KiumCourse) => consultCourse(c);
  const onConsultMonth = (m: 10 | 11 | 12) => consultMonth(m);

  return (
    <div className="kium-open" ref={rootRef}>
      <KiumOpenHero now={now} onConsultSession={onConsultSession} />

      <h3 className="kium-detail-h r">{KIUM_CONTENT.open.scheduleHeading}</h3>
      <KiumSchedule
        scoped={scoped}
        sessions={visible}
        view={view}
        onView={changeView}
        month={month}
        onMonth={changeMonth}
        cat={cat}
        onCat={setCat}
        status={status}
        onStatus={setStatus}
        now={now}
        onReset={reset}
        onConsultSession={onConsultSession}
        onConsultCourse={onConsultCourse}
        onConsultMonth={onConsultMonth}
      />

      <h3 className="kium-detail-h r">{KIUM_CONTENT.open.coursesHeading}</h3>
      <KiumCourseGrid
        courses={getOpenCourses()}
        categories={openCategoryCounts()}
        idPrefix="open-"
        variant="open"
        thumbs={KIUM_OPEN_THUMBS}
        now={now}
        onConsultSession={onConsultSession}
        onConsultCourse={onConsultCourse}
      />

      <h3 className="kium-detail-h r">{KIUM_CONTENT.open.faqHeading}</h3>
      <div className="kium-faq r">
        <KiumFaq items={getOpenFaq()} />
      </div>

      {/* 쿼리가 없으면 이 블록 자체가 DOM에 만들어지지 않는다(명세 STEP 7) */}
      {showcase && <BadgeShowcase />}
    </div>
  );
}
