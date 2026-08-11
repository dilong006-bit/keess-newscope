import type { Metadata } from 'next';
import '@/styles/axai.css';
import Nav from '@/components/common/Nav';
import RevealInit from '@/components/common/RevealInit';
import Sections from '@/components/sections/axai/Sections';

export const metadata: Metadata = {
  title: 'AX·AI 전환 | KEESS · 진단부터 성과까지 End-to-End AX Partner',
  description:
    'AI를 배우는 데서 멈추지 않습니다. 일하는 방식을 바꿉니다. AI 성숙도 진단·AX Framework 5단계·직무별 Skill Matrix·End-to-End 5 Step으로 조직의 AX 전환을 설계합니다.',
};

export default function AxAiPage() {
  // P1은 자체 문의 폼이 없다 — 모든 상담 CTA는 홈 신청 폼(/#inq)으로 일원화 (기술명세서 §C-1)
  return (
    // hero-shell — 모바일에서 헤더(sticky)와 히어로를 한 흐름에 담는 껍데기.
    // 사유·구조는 styles/components.css의 .hero-shell 블록 주석 참조.
    <div className="tint-p1 hero-shell">
      <Nav current="ax-ai" consultHref="/#inq" />
      <RevealInit />
      <Sections />
    </div>
  );
}
