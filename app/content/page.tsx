import type { Metadata } from 'next';
import '@/styles/content.css';
import Nav from '@/components/common/Nav';
import RevealInit from '@/components/common/RevealInit';
import ContentModalProvider from '@/components/sections/content/ContentModals';
import Sections from '@/components/sections/content/Sections';

export const metadata: Metadata = {
  title: '콘텐츠 솔루션 | KEESS · 기업에 필요한 모든 교육을, 한 곳에서',
  description:
    // 규모 표기는 화면과 동일하게 '8,000여 개'로 통일(DF-021-B) — 실수치는 매월 바뀌므로 메타에 박지 않는다
    '직무·어학·IT·리더십·법정·제작까지 8,000여 개 과정을 6개 체계에서 찾습니다. 대표 과정 탐색기·전체 과정 리스트 다운로드(환급 과정 495개 포함)·맞춤 제작까지.',
};

export default function ContentPage() {
  return (
    <div className="tint-p4">
      <Nav current="content" consultHref="#download" />
      <RevealInit />
      <ContentModalProvider>
        <Sections />
      </ContentModalProvider>
    </div>
  );
}
