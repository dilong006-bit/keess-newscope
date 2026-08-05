import { BadgeCheck, ClipboardList, Landmark, MessageCircle } from 'lucide-react';
import { KIUM_CONTENT } from '@/lib/kium/content';

/**
 * F5 신청절차 4스텝 — 기술명세서 최종 v2.0 §4(개정) · 부록 A 원문 고정
 * 디자인 고도화 [수정 3]: 진행선 + 넘버 서클 채움형(심도 4단) + 스텝별 lucide 아이콘
 *
 * '기업' / 'KG에듀원' 2행 문안은 content.ts steps 원문 그대로(가공·요약 금지).
 * 스텝 색은 기존 퍼플 var(--p1)의 심도 4단 파생(20/45/70/100%) — 신규 색 아님.
 * 진입 stagger 90ms는 기존 .stagger 규칙, 모바일은 세로 타임라인(CSS 분기).
 */
const STEP_ICONS = [MessageCircle, ClipboardList, Landmark, BadgeCheck];

export default function KiumProcess() {
  return (
    <ol className="kium-steps stagger">
      {KIUM_CONTENT.steps.map((s, i) => {
        const Icon = STEP_ICONS[i];
        return (
          <li
            className="kium-step"
            key={s.title}
            data-i={i}
            style={{ '--i': i } as React.CSSProperties}
          >
            <div className="kium-step-head">
              <span className="kium-step-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="kium-step-ic" aria-hidden="true">
                <Icon size={16} />
              </span>
            </div>
            <p className="kium-step-t">{s.title}</p>
            <div className="kium-step-rows">
              <div className="kium-step-row">
                <span className="kium-step-tag corp">기업</span>
                <p>{s.corp}</p>
              </div>
              <div className="kium-step-row">
                <span className="kium-step-tag kg">KG에듀원</span>
                <p>{s.kg}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
