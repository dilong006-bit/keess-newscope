import type { Metadata } from 'next';
import '@/styles/home.css';
import '@/styles/kium.css';
import Nav from '@/components/common/Nav';
import RevealInit from '@/components/common/RevealInit';
import HomeInquiry from '@/components/sections/home/HomeInquiry';
import KiumHero from '@/components/kium/KiumHero';
import KiumBenefitStats from '@/components/kium/KiumBenefitStats';
import KiumTabs from '@/components/kium/KiumTabs';
import KiumOverviewTable from '@/components/kium/KiumOverviewTable';
import KiumEligibility from '@/components/kium/KiumEligibility';
import KiumProcess from '@/components/kium/KiumProcess';
import KiumCautions from '@/components/kium/KiumCautions';
import KiumFaq from '@/components/kium/KiumFaq';
import KiumCourseGrid from '@/components/kium/KiumCourseGrid';
import { KIUM_CONTENT } from '@/lib/kium/content';
import { getAllCourses, getCategoryCounts } from '@/lib/kium/queries';

export const metadata: Metadata = {
  title: '인재키움 프리미엄 | KEESS',
  description:
    '2026 중소기업 인재 키움 프리미엄 훈련 — 지원대상 확인부터 과정 설계·정부 신청·환급까지 KG에듀원이 함께합니다.',
};

/** 제도 근거 표기 — 기술명세서 최종 v2.0 §2 외부 링크 맵 3번(공단 공고) */
const NOTICE_LINK = KIUM_CONTENT.officialLinks[2];

export default function KiumPage() {
  const courses = getAllCourses();
  const categories = getCategoryCounts();

  // 탭1 — 사업소개
  const intro = (
    <>
      <section className="kium-sec" id="kium-overview">
        <div className="wrap">
          <p className="eyebrow r">지원개요</p>
          <h2 className="kium-sec-title r" tabIndex={-1} data-panel-heading>
            {KIUM_CONTENT.sectionLeads.overview}
          </h2>
          <div className="r">
            <KiumOverviewTable />
          </div>
          <p className="kium-caption r">
            제도 근거 ·{' '}
            <a href={NOTICE_LINK.url} target="_blank" rel="noopener noreferrer">
              {NOTICE_LINK.label}
              <span className="kium-sr">(새 창에서 열림)</span>
            </a>
          </p>
        </div>
      </section>

      <section className="kium-sec alt" id="kium-eligibility">
        <div className="wrap">
          <p className="eyebrow r">자격확인 가이드</p>
          <h2 className="kium-sec-title r">{KIUM_CONTENT.sectionLeads.eligibility}</h2>
          <div className="r">
            <KiumEligibility />
          </div>
        </div>
      </section>

      <section className="kium-sec" id="kium-process">
        <div className="wrap">
          <p className="eyebrow r">신청절차</p>
          <h2 className="kium-sec-title r">{KIUM_CONTENT.sectionLeads.process}</h2>
          {/* 고객 혜택 선제시 — 히어로와 동일한 검증 facts 재사용 */}
          <KiumBenefitStats variant="band" />
          <KiumProcess />
          <div className="r">
            <KiumCautions />
          </div>
        </div>
      </section>

      <section className="kium-sec alt" id="kium-faq">
        <div className="wrap">
          <p className="eyebrow r">자주 묻는 질문</p>
          <h2 className="kium-sec-title r">{KIUM_CONTENT.sectionLeads.faq}</h2>
          <div className="kium-faq r">
            <KiumFaq />
          </div>
          <div className="kium-faq-foot r">
            <span className="t">더 궁금한 점은 도입문의로 남겨 주세요.</span>
            <a className="btn btn-ink faq-cta" href="#inq">
              도입문의
            </a>
          </div>
        </div>
      </section>
    </>
  );

  // 탭2 — 과정안내
  const coursesPanel = (
    <section className="kium-sec" id="kium-courses">
      <div className="wrap">
        <p className="eyebrow r">과정안내</p>
        <h2 className="kium-sec-title r" tabIndex={-1} data-panel-heading>
          {KIUM_CONTENT.sectionLeads.courses}
        </h2>
        <KiumCourseGrid courses={courses} categories={categories} />
      </div>
    </section>
  );

  return (
    <main id="main" className="kium-page" tabIndex={-1}>
      {/* GNB 정식 메뉴는 추가하지 않는다(§6-8) — 진입은 홈 히어로 슬라이드·Nav 이벤트 칩 */}
      <Nav current="home" consultHref="#inq" forceSolid />
      <RevealInit />

      <KiumHero />
      <KiumTabs intro={intro} courses={coursesPanel} />

      {/* CTA 밴드 — 양 탭 하단 공통. 기존 도입문의 폼 그대로 재사용(필드·동의 구조 무변경).
          /kium 경유 진입이므로 '정부 지원' 칩을 선택된 상태로 시작하고(해제 가능),
          제출 페이로드에는 lead_source를 비노출 필드로 싣는다. */}
      <div className="kium-cta-band">
        <HomeInquiry
          presetInterests={['gov']}
          presetInterestSubs={['인재키움']}
          leadSource={KIUM_CONTENT.leadSource}
          prefillEventName="kium:inquiry-prefill"
        />
      </div>
    </main>
  );
}
