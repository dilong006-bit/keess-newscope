'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * F2 탭 — 기술명세서 v1.0 §4 · 전략 §4-3
 *
 * - role=tablist/tab/tabpanel, 좌우 화살표 이동, aria-selected
 * - URL 해시 동기화(#intro 기본 / #courses) — 잘못된 해시는 #intro 폴백
 * - 전환 시 포커스는 패널 첫 헤딩으로 이동
 * - K1: 인디케이터 translateX+width morph 300ms / 패널 out 120ms → in 300ms(+8px)
 * - 두 패널 모두 DOM에 렌더하고 비활성 패널은 hidden — 정적 HTML에 전 콘텐츠 포함
 */

const TABS = [
  { id: 'intro', label: '사업소개' },
  { id: 'courses', label: '과정안내' },
] as const;

const OUT_MS = 120;

export default function KiumTabs({ intro, courses }: { intro: ReactNode; courses: ReactNode }) {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const outTimer = useRef<ReturnType<typeof setTimeout>>();
  /**
   * 패널 첫 헤딩으로 포커스를 옮길지 여부.
   * - 탭 클릭/Enter로 확정 전환할 때만 true (전략 §4-3 "전환 시 포커스는 패널 첫 헤딩으로")
   * - 좌우 화살표 이동에서는 false — WAI-ARIA tabs 패턴상 포커스는 탭 버튼에 남아야
   *   연속 화살표 탐색이 가능하다. 최초 마운트(딥링크 반영)에서도 이동하지 않는다.
   */
  const moveFocus = useRef(false);

  const indexFromHash = () => {
    const id = window.location.hash.replace(/^#/, '');
    const i = TABS.findIndex((t) => t.id === id);
    return i < 0 ? 0 : i; // 잘못된 해시 → #intro 폴백
  };

  // 해시 → 탭 (초기 딥링크 + 뒤로/앞으로 가기)
  useEffect(() => {
    const sync = () => setActive(indexFromHash());
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => () => clearTimeout(outTimer.current), []);

  // 인디케이터 좌표·폭 morph
  const syncIndicator = useCallback(() => {
    const btn = btnRefs.current[active];
    const list = listRef.current;
    if (!btn || !list) return;
    list.style.setProperty('--ind-x', `${btn.offsetLeft}px`);
    list.style.setProperty('--ind-w', `${btn.offsetWidth}px`);
  }, [active]);

  useEffect(() => {
    syncIndicator();
    window.addEventListener('resize', syncIndicator);
    return () => window.removeEventListener('resize', syncIndicator);
  }, [syncIndicator]);

  // 전환 완료(active 갱신) 후에만 포커스를 옮긴다.
  // ※ fading을 의존성에 넣으면 out 페이드 시작 시점(= 아직 이전 패널)에서 먼저 실행돼
  //    직후 hidden 처리되는 이전 패널에 포커스가 물려 body로 튕긴다.
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    const h = panelRefs.current[active]?.querySelector<HTMLElement>('[data-panel-heading]');
    h?.focus({ preventScroll: true });
  }, [active]);

  /**
   * [수정 6] 전환 시 탭바 바로 아래(콘텐츠 상단)로 스크롤.
   * 탭바는 nav(72px) 아래에 sticky이므로, 탭바 상단이 nav 바로 밑에 붙는 위치로 이동한다.
   */
  const scrollToContent = () => {
    const bar = barRef.current;
    if (!bar) return;
    const y = bar.getBoundingClientRect().top + window.scrollY - 72;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
  };

  const select = (i: number, focusPanel = true) => {
    if (i === active) return;
    moveFocus.current = focusPanel;
    setFading(true);
    clearTimeout(outTimer.current);
    outTimer.current = setTimeout(() => {
      setFading(false);
      // 해시로 상태를 옮긴다 — hashchange 리스너가 active를 갱신하고 뒤로가기도 자연 동작
      window.location.hash = TABS[i].id;
      // 해시가 이미 같은 값이면 hashchange가 발생하지 않으므로 직접 반영
      setActive(i);
      // 패널 교체로 높이가 바뀐 뒤 스크롤(다음 프레임)
      requestAnimationFrame(scrollToContent);
    }, OUT_MS);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (active + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    btnRefs.current[next]?.focus();
    select(next, false); // 포커스는 탭 버튼에 유지 — 연속 화살표 탐색 보장
  };

  return (
    <>
      <div className="kium-tabbar" ref={barRef}>
        <div className="wrap">
          <div className="kium-tablist" role="tablist" aria-label="인재키움프리미엄" ref={listRef} onKeyDown={onKeyDown}>
            {TABS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`kium-tab-${t.id}`}
                className="kium-tab"
                aria-selected={i === active}
                aria-controls={`kium-tabpanel-${t.id}`}
                tabIndex={i === active ? 0 : -1}
                ref={(el) => {
                  btnRefs.current[i] = el;
                }}
                onClick={() => select(i)}
              >
                {t.label}
              </button>
            ))}
            <span className="kium-tab-ind" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div style={{ opacity: fading ? 0 : 1, transition: `opacity ${OUT_MS}ms var(--ease)` }}>
        {TABS.map((t, i) => (
          <div
            key={t.id}
            role="tabpanel"
            id={`kium-tabpanel-${t.id}`}
            aria-labelledby={`kium-tab-${t.id}`}
            className="kium-panel"
            hidden={i !== active}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
          >
            {i === 0 ? intro : courses}
          </div>
        ))}
      </div>
    </>
  );
}
