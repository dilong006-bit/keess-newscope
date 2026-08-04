import type { Metadata } from 'next';
import '@/styles/home.css';
import '@/styles/csr.css';
import Nav from '@/components/common/Nav';
import RevealInit from '@/components/common/RevealInit';
import HeroCarousel from '@/components/sections/home/HeroCarousel';
import HomePillars from '@/components/sections/home/HomePillars';
import HomeStats from '@/components/sections/home/HomeStats';
import HomeManifesto from '@/components/sections/home/HomeManifesto';
import HomeFaq from '@/components/sections/home/HomeFaq';
import HomeInquiry from '@/components/sections/home/HomeInquiry';
import HomeReferences from '@/components/sections/home/HomeReferences';
// 8/4 홈 노출 보류, 진입은 푸터로 일원화 — 담당자 확정
// import CsrHomeBand from '@/components/csr/CsrHomeBand';
import { INTRO, CERTS } from '@/data/home';

export const metadata: Metadata = {
  title: 'KEESS | KG에듀원 기업교육 · 진단으로 설계하고, 효과로 증명합니다',
  description:
    '진단으로 설계하고, 효과로 증명합니다. KG에듀원 HRD사업본부의 기업·기관 교육 도입 채널, AX·AI 전환·리더십·HRD 통합·콘텐츠 솔루션.',
};

export default function HomePage() {
  return (
    <main>
      <Nav current="home" consultHref="#inq" />
      <RevealInit />

      <div id="main" tabIndex={-1} />
      <HeroCarousel />

      {/* 인트로 — 조직을 먼저 진단 */}
      <section className="section intro">
        <div className="wrap">
          <p className="eyebrow r" style={{ marginBottom: 22 }}>{INTRO.eyebrow}</p>
          <p className="lead r" dangerouslySetInnerHTML={{ __html: INTRO.lead }} />
          <p className="leadsub r">{INTRO.sub}</p>
          <div className="midrule" />
        </div>
      </section>

      <HomePillars />

      <HomeStats />

      <HomeManifesto />

      {/* References — 고객사 CI 무한 롤링(마퀴) */}
      <HomeReferences />

      {/* 인증 */}
      <section className="section" id="cert" style={{ background: 'var(--surface)' }}>
        <div className="wrap">
          <p className="eyebrow r">{CERTS.eyebrow}</p>
          <h2 className="sec-title r" style={{ marginTop: 12 }}>{CERTS.title}</h2>
          <div className="cert-grid stagger">
            {CERTS.items.map((c) => (
              <div className="cert" key={c.main}>
                {c.main}
                <small>{c.small}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeFaq />

      {/* 사회공헌 밴드 — FAQ와 #inq 사이. 최종 CTA(상담 폼)가 페이지 마지막에 남도록 앞에 배치 */}
      {/* 8/4 홈 노출 보류, 진입은 푸터로 일원화 — 담당자 확정. 재노출 대비해 제거하지 않고 주석 유지 */}
      {/* <CsrHomeBand /> */}

      <HomeInquiry />
    </main>
  );
}
