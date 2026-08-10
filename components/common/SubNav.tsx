'use client';

import { useEffect, useState } from 'react';
import type { SubNavItem } from '@/lib/types';

/** 페이지 내 서브내비 (스크롤스파이 · Design.md §4). */
export default function SubNav({ items }: { items: SubNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

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

  const onClick = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: rm ? 'auto' : 'smooth' });
    }
  };

  return (
    <div className="subnav">
      {/* overflow-x:auto로 가로 스크롤을 의도한 섹션 내비 — 모바일 계측(C2) 예외 표식 */}
      <div className="wrap subnav-in" data-hscroll>
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
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
