import type { Metadata } from 'next';
import './globals.css';
import '@/styles/components.css';
import { pretendard, gowun } from './fonts';
import Footer from '@/components/common/Footer';
import ToTop from '@/components/common/ToTop';
import TeaserSnackbar from '@/components/common/TeaserSnackbar';

// OG 이미지(상대경로)의 절대 URL 해석 기준. 정본 도메인 미확정이라 값을 임의로 정하지 않고,
// Vercel이 빌드 시 주입하는 VERCEL_URL을 쓰고 로컬은 dev 포트로 폴백한다.
// 정본 도메인 확정 시 이 한 줄만 교체하면 된다.
const siteUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3001';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'KEESS · KG에듀원 기업교육',
  description: '진단으로 설계하고, 효과로 증명합니다. KG에듀원 HRD사업본부 기업·기관 교육 도입 채널.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${gowun.variable}`}>
      <body>
        <a href="#main" className="skip-link">본문 바로가기</a>
        {children}
        <Footer />
        <ToTop />
        <TeaserSnackbar />
      </body>
    </html>
  );
}
