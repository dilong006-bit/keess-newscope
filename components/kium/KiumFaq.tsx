'use client';

import { useState } from 'react';
import { KIUM_CONTENT } from '@/lib/kium/content';

/**
 * F6 FAQ — 기존 KEESS FAQ 아코디언을 그대로 재사용한다.
 * 마크업·클래스(.faq-list/.faq-item/.faq-q/.faq-a)와 CSS(styles/home.css)는 홈 정본과 동일하며,
 * 이 컴포넌트는 데이터 소스(content.ts faq 7문항)와 다중 열림 정책(전략 §4-7)만 다르다.
 *
 * ※ 관리 표기: content.ts의 7문항은 전건 status='draft'(사업 검수 대기)다.
 *   검수 완료 시 content.ts의 status만 'confirmed'로 바꾸면 되고 이 파일은 수정하지 않는다.
 *   화면 노출 문구는 draft/confirmed 여부와 무관하게 동일하다(초안 문구 그대로 노출).
 *   DOM에는 data-status로만 남긴다 — 사용자에게는 보이지 않는 관리용 표기.
 */
export default function KiumFaq() {
  // 다중 열림 허용 — 기본 전부 닫힘
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <div className="faq-list">
      {KIUM_CONTENT.faq.map((it, i) => {
        const isOpen = !!open[i];
        return (
          <div className={`faq-item${isOpen ? ' open' : ''}`} key={it.q} data-status={it.status}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
            >
              <span className="qn">Q{i + 1}</span>
              <span className="qt">{it.q}</span>
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
