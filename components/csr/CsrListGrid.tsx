'use client';

import { useState } from 'react';
import CsrCard from './CsrCard';
import type { CsrCardData } from '@/lib/csr/types';

const PAGE = 12;

/**
 * 목록 더보기 그리드 — 최종 명세 v2.0 §4-2
 * 초기 12건, 더보기 클릭당 +12. URL 파라미터·라우팅을 쓰지 않아 스크롤 위치가 보존된다.
 * 검색·필터 UI 없음(§1-2).
 */
export default function CsrListGrid({ posts }: { posts: CsrCardData[] }) {
  const [shown, setShown] = useState(PAGE);
  const visible = posts.slice(0, shown);
  const hasMore = shown < posts.length;

  return (
    <>
      <div className="csr-grid">
        {visible.map((p, i) => {
          // 더보기로 새로 들어온 배치에만 등장 모션(기존 stagger 90ms 규칙) 적용
          const isNew = shown > PAGE && i >= shown - PAGE;
          return (
            <CsrCard
              post={p}
              variant="list"
              className={isNew ? 'csr-appear' : ''}
              style={isNew ? { animationDelay: `${(i - (shown - PAGE)) * 0.09}s` } : undefined}
              key={p.id}
            />
          );
        })}
      </div>

      <div className="csr-more">
        <p className="csr-count" aria-live="polite">
          전체 {posts.length}건 중 {visible.length}건 표시
        </p>
        {hasMore && (
          <button
            type="button"
            className="btn-line-dark csr-more-btn"
            onClick={() => setShown((n) => Math.min(n + PAGE, posts.length))}
          >
            더보기
          </button>
        )}
      </div>
    </>
  );
}
