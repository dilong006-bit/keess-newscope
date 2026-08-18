'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NAV_ITEMS, LOGO, EVENT_CHIP, type NavKey } from '@/data/nav';
import { useNoticeFlag } from '@/hooks/useNoticeFlag';
import NewBadge from './NewBadge';
import SparkleIcon from './SparkleIcon';

/** 드로어 내 신규 항목 글로우 유지+페이드 길이. CSS 의 mm-glow 와 동일해야 한다(§2 M2). */
const HIGHLIGHT_MS = 3500;

// 교육 상담 아이콘 (§0.5-6 · 말풍선 · 인터랙션 강화만, 구성·카피 불변)
function ChatIcon() {
  return (
    <svg className="btn-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-8.9 8.4 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.5a8.4 8.4 0 0 1-.8-3.6A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
    </svg>
  );
}

interface NavProps {
  current: NavKey;
  /** 교육 상담 CTA 목적지 (기본: 현재 페이지 #inq) */
  consultHref?: string;
  /** 히어로 없는 밝은 배경(예: 404)에서 항상 solid 상태로 고정 */
  forceSolid?: boolean;
}

export default function Nav({ current, consultHref = '#inq', forceSolid = false }: NavProps) {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const isSolid = solid || forceSolid;
  const [menuOpen, setMenuOpen] = useState(false);
  /**
   * 8px만 스크롤해도 켜지는 상태 플래그.
   * solid(=히어로를 다 지난 뒤 흰 배경)와 별개로, 히어로 구간을 지나는 동안에도
   * 헤더가 콘텐츠와 섞이지 않게 배경을 깔 수 있는 훅을 열어 둔다.
   * 이 클래스만으로는 어떤 스타일도 붙지 않는다 — 현재 P1·P2 모바일에서만
   * (styles/axai.css · styles/leadership.css) 유리판 배경을 입힌다.
   */
  const [scrolled, setScrolled] = useState(false);
  const thresholdRef = useRef(40);

  // 신규 메뉴 알림 (기술명세서 v1.0 §2 M1·M2)
  const { unseen: badgeUnseen, dismiss: dismissBadge } = useNoticeFlag('kiumBadgeSeen', { mobileOnly: true });
  const [highlightKium, setHighlightKium] = useState(false);
  const hambRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  // 스크롤 solid 전환 (원본 859: hero 높이 기준, hero 없으면 40px)
  useEffect(() => {
    const hero = document.getElementById('hero');
    thresholdRef.current = hero ? hero.offsetHeight - 90 : 40;
    const onScroll = () => {
      setSolid(window.scrollY > thresholdRef.current);
      setScrolled(window.scrollY > 8);
    };
    const onResize = () => {
      const h = document.getElementById('hero');
      thresholdRef.current = h ? h.offsetHeight - 90 : 40;
      onScroll();
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [pathname]);

  /**
   * 드로어 열림 처리 — 스크롤 락 · ESC · 포커스 트랩 (기술명세서 v1.0 §2 M4)
   *
   * [overflow:hidden 만으로는 부족한 이유]
   * iOS Safari 는 body overflow:hidden 을 무시하고 배경을 계속 스크롤한다. 그래서
   * body 를 position:fixed 로 들어올리고 top 에 현재 스크롤을 음수로 박는다. 대신 이 방식은
   * 문서 스크롤을 0 으로 리셋하므로, 닫을 때 저장해 둔 y 로 되돌려야 화면이 튀지 않는다.
   * 복원 시 html{scroll-behavior:smooth} 가 살아 있으면 되돌아가는 과정이 애니메이션으로
   * 보이므로 그 순간만 auto 로 내린다.
   *
   * [포커스 트랩 범위에 햄버거를 포함하는 이유]
   * 닫기 버튼(X)은 드로어가 아니라 헤더에 있다. 트랩을 .mmenu 내부로만 좁히면
   * 키보드 사용자가 닫기 수단에 영원히 닿지 못한다 → 햄버거를 트랩 순환의 첫 항목으로 넣는다.
   */
  useEffect(() => {
    if (!menuOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const y = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    // 열자마자 컨테이너로 포커스를 옮긴다(개별 메뉴 항목으로 밀지 않는다 — §2 M2 강제 포커스 금지).
    // 한 프레임 미루는 이유: visibility:hidden 요소의 focus() 는 브라우저가 조용히 무시하는데,
    // 이 이펙트 시점에는 .open 의 visibility 가 아직 계산되지 않았을 수 있다.
    // (근본 처방은 .mmenu 의 `visibility 0s` 전환 — styles/components.css 참조. 여기는 이중 안전장치)
    const focusRaf = requestAnimationFrame(() => drawer.focus({ preventScroll: true }));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = [
        hambRef.current,
        ...Array.from(drawer.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')),
      ].filter((el): el is HTMLElement => !!el);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === drawer)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(focusRaf);
      document.removeEventListener('keydown', onKey);
      Object.assign(body.style, prev);
      const html = document.documentElement;
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      html.style.scrollBehavior = prevBehavior;
      // 포커스가 드로어 안(또는 아무데도 아님)에 있을 때만 회수한다 —
      // 사용자가 의도적으로 다른 곳을 잡았다면 빼앗지 않는다.
      const active = document.activeElement;
      if (!active || active === document.body || drawer.contains(active)) {
        hambRef.current?.focus({ preventScroll: true });
      }
      // 지목은 "이번에 연 그 한 번"에 묶인다. 3.5s 안에 닫았다 다시 열어도 다시 빛나지 않게
      // 닫는 시점에 함께 걷어낸다(§2 M2 "1회 실행").
      setHighlightKium(false);
    };
  }, [menuOpen]);

  // 신규 항목 글로우는 1회성 — 유지+페이드가 끝나면 클래스를 걷어낸다
  useEffect(() => {
    if (!highlightKium) return;
    const t = window.setTimeout(() => setHighlightKium(false), HIGHLIGHT_MS);
    return () => window.clearTimeout(t);
  }, [highlightKium]);

  /**
   * 드로어 열기 — 배지 소멸의 유일한 트리거.
   * "노출됐을 때"가 아니라 "열었을 때" 꺼야 신호로서 의미가 남는다(§5-6).
   * 배지가 살아 있던 채로 연 경우에만 드로어 안 신규 항목을 지목한다(§2 M2).
   */
  const openMenu = () => {
    if (badgeUnseen) {
      dismissBadge();
      setHighlightKium(true);
    }
    setMenuOpen(true);
  };

  const rm = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 로고: 홈에서는 최상단 스크롤 (§0.5-2)
  const onLogo = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: rm() ? 'auto' : 'smooth' });
    }
  };

  // 교육 상담: 같은 페이지 #inq 이면 스크롤, 아니면 라우팅
  const onConsult = (e: React.MouseEvent) => {
    if (consultHref.startsWith('#')) {
      const el = document.querySelector(consultHref);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: rm() ? 'auto' : 'smooth' });
        setMenuOpen(false);
      }
    } else {
      setMenuOpen(false);
    }
  };

  return (
    <>
      <header className={`nav${isSolid ? ' solid' : ''}${scrolled ? ' scrolled' : ''}${menuOpen ? ' menu-open' : ''}`} id="nav">
        <div className="wrap nav-in">
          {/* data-probe — tests/hero-collision.spec.ts가 로고/배지 겹침을 상시 감시하는 앵커.
              임시 속성이 아니므로 제거하지 말 것. */}
          <Link className="logo" data-probe="logo" href={LOGO.href} onClick={onLogo} aria-label="KEESS 홈">
            {LOGO.label}
          </Link>
          <nav className="menu" aria-label="주요 메뉴">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={item.key === current ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {/* 우측 그룹 — 기존 space-between 배치를 유지하기 위해 칩과 CTA를 한 항목으로 묶는다 */}
          <div className="nav-right">
            {/* 이벤트 칩 — 정식 메뉴 아님. 전 페이지 유일 캠페인 진입점이라
                절제된 주기 모션(7s shimmer·트윙클)을 허용한다(F12′ 개정).
                배경·텍스트·문안·크기·이동 기능은 불변, 시각 강조만 추가. */}
            <Link className="nav-chip" href={EVENT_CHIP.href}>
              <span className="shimmer" aria-hidden="true" />
              <SparkleIcon />
              {/* 신규 오픈 사실 표기 — 장식이 아니라 정보이므로 보조기술에도 노출한다 */}
              <span className="chip-new">NEW</span>
              {EVENT_CHIP.label}
            </Link>
            <a
              className="btn btn-glass nav-cta"
              href={consultHref}
              onClick={onConsult}
            >
              <ChatIcon />
              교육 상담
            </a>
          </div>
          <button
            className={`hamb${menuOpen ? ' open' : ''}`}
            id="hamb"
            ref={hambRef}
            data-ga-id="gnb-hamburger"
            /* 배지는 aria-hidden 이므로, 같은 사실을 버튼 이름으로 스크린리더에 전달한다 */
            aria-label={menuOpen ? '메뉴 닫기' : badgeUnseen ? '메뉴 열기 (새로운 메뉴 있음)' : '메뉴 열기'}
            aria-expanded={menuOpen}
            aria-controls="mmenu"
            onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
          >
            <span />
            <span />
            <span />
            <NewBadge show={badgeUnseen} />
          </button>
        </div>
      </header>

      <nav
        className={`mmenu${menuOpen ? ' open' : ''}`}
        id="mmenu"
        ref={drawerRef}
        tabIndex={-1}
        aria-label="모바일 메뉴"
        aria-hidden={!menuOpen}
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.key === current ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        {/* 모바일 메뉴 칩 — 데스크톱 칩과 같은 신호(스파클·NEW)를 쓴다. 주기 모션은 없음 */}
        <Link
          className={`mmenu-chip${highlightKium ? ' is-new-hl' : ''}`}
          href={EVENT_CHIP.href}
          data-ga-id="drawer-kium"
          onClick={() => setMenuOpen(false)}
        >
          <SparkleIcon idSuffix="-m" />
          <span className="chip-new">NEW</span>
          {EVENT_CHIP.label}
        </Link>
        <a className="btn btn-ink" href={consultHref} onClick={onConsult}>
          <ChatIcon />
          교육 상담
        </a>
      </nav>
    </>
  );
}
