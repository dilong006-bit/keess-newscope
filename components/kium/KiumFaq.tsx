'use client';

import { useState } from 'react';
import { KIUM_CONTENT } from '@/lib/kium/content';
import type { KiumFaqItem } from '@/lib/kium/queries';

/**
 * F6 FAQ — 기존 KEESS FAQ 아코디언을 그대로 재사용한다.
 * 마크업·클래스(.faq-list/.faq-item/.faq-q/.faq-a)와 CSS(styles/home.css)는 홈 정본과 동일하며,
 * 이 컴포넌트는 데이터 소스(content.ts faq)와 다중 열림 정책(전략 §4-7)만 다르다.
 *
 * ※ 관리 표기: content.ts의 초안 7문항은 전건 status='draft'(사업 검수 대기)다.
 *   검수 완료 시 content.ts의 status만 'confirmed'로 바꾸면 되고 이 파일은 수정하지 않는다.
 *   화면 노출 문구는 draft/confirmed 여부와 무관하게 동일하다(초안 문구 그대로 노출).
 *   DOM에는 data-status로만 남긴다 — 사용자에게는 보이지 않는 관리용 표기.
 *
 * [공개교육 §5-7-1] items 미지정 시 기존 동작(전체 목록) 그대로다.
 *   공개교육 탭만 getOpenFaq()를 주입해 태그된 2문항으로 좁힌다. FAQ 컴포넌트는 하나만 유지한다.
 *   tag가 있으면 질문 텍스트 '앞'에 칩을 렌더한다 — 질문을 읽기 전에 맥락이 먼저 들어와야 한다.
 *   칩은 실제 텍스트 노드다(aria-hidden 금지). 번호는 목록 내 인덱스 기준이라
 *   두 화면에서 달라지는 것이 의도된 동작이다.
 */
export default function KiumFaq({ items }: { items?: readonly KiumFaqItem[] }) {
  const list = items ?? KIUM_CONTENT.faq;
  // 다중 열림 허용 — 기본 전부 닫힘
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <div className="faq-list">
      {list.map((it, i) => {
        const isOpen = !!open[i];
        const tag = 'tag' in it ? it.tag : undefined;
        return (
          <div className={`faq-item${isOpen ? ' open' : ''}`} key={it.q} data-status={it.status}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
            >
              <span className="qn">Q{i + 1}</span>
              <span className="qt">
                {tag && <span className="kium-badge open faq-tag">{tag}</span>}
                {it.q}
              </span>
              <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className="faq-a" style={{ maxHeight: isOpen ? 500 : 0 }}>
              <div className="faq-a-inner">
                <p>{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
