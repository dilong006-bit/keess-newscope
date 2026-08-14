'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SubNavItem } from '@/lib/types';

/** 활성 칩 좌변을 컨테이너 폭의 이 비율 지점에 맞춘다 — 뒤쪽 항목을 더 많이 노출한다 */
const ALIGN_RATIO = 0.3;
/** 이 여백을 두고 이미 완전히 보이면 재정렬하지 않는다 (.wrap 의 --gut 과 동일) */
const SAFE_PAD = 24;
/** 사용자가 직접 가로 스크롤한 뒤 자동 정렬을 멈추는 시간 */
const USER_LOCK_MS = 1500;
/** 칩 탭 후 세로 스무스 스크롤이 끝날 때까지 중간 정렬을 억제하는 시간 */
const TAP_LOCK_MS = 800;
/** 양끝점 scrollLeft 대비 여유값 */
const EDGE_EPS = 2;

/** 페이지 내 서브내비 (스크롤스파이 · Design.md §4). */
export default function SubNav({ items }: { items: SubNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const lockUntilRef = useRef(0);
  const didInitRef = useRef(false);

  /* ── 스크롤스파이 (기존 로직 그대로 — 판정식 변경 금지) ─────────────── */
  useEffect(() => {
    const sections = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  /* ── 오버플로 엣지 페이드: 스크롤 가능한 방향만 표시 ────────────────── */
  const syncEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const canLeft = el.scrollLeft > EDGE_EPS;
    const canRight = el.scrollLeft < el.scrollWidth - el.clientWidth - EDGE_EPS;
    el.dataset.fade = canLeft ? (canRight ? 'both' : 'left') : canRight ? 'right' : 'none';
  }, []);

  /* ── 활성 칩을 가시 영역으로 (가로 스크롤만 제어) ───────────────────── */
  const align = useCallback((id: string, opts?: { instant?: boolean; force?: boolean }) => {
    const el = scrollerRef.current;
    if (!el || !id) return;
    // 오버플로가 없으면(데스크톱) 아무것도 하지 않는다 → PC 동작 변화 0이 코드로 보장된다
    if (el.scrollWidth - el.clientWidth <= EDGE_EPS) return;

    const chip = el.querySelector<HTMLElement>(`[data-nav-id="${id}"]`);
    if (!chip) return;

    // 좌표는 rect 차분으로만 계산한다. .subnav 가 position:sticky(=positioned)라
    // offsetLeft 의 기준이 .subnav-in 이 아니라 .subnav 가 되어 .wrap 의 24px 만큼 어긋난다.
    const box = el.getBoundingClientRect();
    const rect = chip.getBoundingClientRect();

    // 이미 여유를 두고 완전히 보이면 움직이지 않는다 (불필요한 흔들림 방지)
    const settled = rect.left >= box.left + SAFE_PAD && rect.right <= box.right - SAFE_PAD;
    if (!opts?.force && settled) return;

    const max = el.scrollWidth - el.clientWidth;
    const next = Math.max(
      0,
      Math.min(max, el.scrollLeft + (rect.left - box.left) - el.clientWidth * ALIGN_RATIO)
    );
    if (Math.abs(next - el.scrollLeft) < 1) return;

    // 감소 모션은 JS에서 직접 분기해야 한다.
    // globals.css 의 *{scroll-behavior:auto!important} 는 명시적 behavior:'smooth' 호출을 막지 못한다.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: next, behavior: opts?.instant || reduce ? 'auto' : 'smooth' });
  }, []);

  /* ── 활성 변경 시 정렬 — 사용자가 방금 밀었으면 개입하지 않는다 ─────── */
  useEffect(() => {
    const first = !didInitRef.current;
    didInitRef.current = true;
    if (!first && Date.now() < lockUntilRef.current) return;
    align(active, { instant: first });
    syncEdges();
  }, [active, align, syncEdges]);

  /* ── 사용자 조작 감지 · 페이드 동기화 · 해시 직입 정렬 ──────────────── */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const lock = () => { lockUntilRef.current = Date.now() + USER_LOCK_MS; };
    const opt: AddEventListenerOptions = { passive: true };

    // scroll 이벤트로 사용자 조작을 판별하지 않는다 → 자기 스무스 스크롤에 자기가 잠긴다.
    el.addEventListener('pointerdown', lock, opt);
    el.addEventListener('pointerup', lock, opt);
    el.addEventListener('touchstart', lock, opt);
    el.addEventListener('touchend', lock, opt);
    el.addEventListener('wheel', lock, opt);
    el.addEventListener('scroll', syncEdges, opt);

    const ro = new ResizeObserver(syncEdges);
    ro.observe(el);
    syncEdges();

    // 해시로 직접 진입한 경우 그 칩을 즉시 보이는 위치로
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash && items.some((it) => it.id === hash)) {
      align(hash, { instant: true, force: true });
    }

    return () => {
      el.removeEventListener('pointerdown', lock);
      el.removeEventListener('pointerup', lock);
      el.removeEventListener('touchstart', lock);
      el.removeEventListener('touchend', lock);
      el.removeEventListener('wheel', lock);
      el.removeEventListener('scroll', syncEdges);
      ro.disconnect();
    };
  }, [items, align, syncEdges]);

  const onClick = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: rm ? 'auto' : 'smooth' });
      // 탭한 칩을 즉시 정렬하고, 세로 이동 중 중간 활성 변화로 가로가 딸리는 것을 막는다.
      align(id, { force: true });
      lockUntilRef.current = Date.now() + TAP_LOCK_MS;
    }
  };

  return (
    <div className="subnav">
      {/* overflow-x:auto로 가로 스크롤을 의도한 섹션 내비 — 모바일 계측(C2) 예외 표식 */}
      <div className="wrap subnav-in" data-hscroll ref={scrollerRef}>
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            data-nav-id={it.id}
            className={active === it.id ? 'on' : undefined}
            aria-current={active === it.id ? 'true' : undefined}
            onClick={(e) => onClick(e, it.id)}
          >
            {it.label}
          </a>
        ))}
      </div>
    </div>
  );
}
