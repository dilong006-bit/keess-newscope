import type { Metadata } from 'next';
import '@/styles/leadership.css';
import Nav from '@/components/common/Nav';
import RevealInit from '@/components/common/RevealInit';
import LdModalProvider from '@/components/sections/leadership/LdModal';
import Sections from '@/components/sections/leadership/Sections';

export const metadata: Metadata = {
  title: '리더십·조직 | KEESS · 리더십은 감이 아니라, 체계입니다',
  description:
    'KG에듀원 고유의 6대 리더십 역량 체계로 무엇을 기를지 정의하고, 성장단계 로드맵·리더십 오빗·Growth-Fit 조직진단으로 진단에서 조직문화 정착까지 설계합니다.',
};

export default function LeadershipPage() {
  return (
    // hero-shell — 사유·구조는 styles/components.css의 .hero-shell 블록 주석 참조.
    <div className="tint-p2 hero-shell">
      <Nav current="leadership" consultHref="#inq" />
      <RevealInit />
      <LdModalProvider>
        <Sections />
      </LdModalProvider>
    </div>
  );
}
