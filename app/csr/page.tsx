import type { Metadata } from 'next';
import Link from 'next/link';
import '@/styles/csr.css';
import Nav from '@/components/common/Nav';
import RevealInit from '@/components/common/RevealInit';
import CsrListGrid from '@/components/csr/CsrListGrid';
import { getAllCsrPosts } from '@/lib/csr/queries';

export function generateMetadata(): Metadata {
  return {
    title: '사회공헌 | KEESS',
    description: 'KG그룹이 이어온 사회공헌 활동 소식을 모았습니다.',
  };
}

export default function CsrListPage() {
  // 카드 노출 필드만 클라이언트로 전달 — 본문·sortDate·sourceUrl이 RSC 페이로드에 실리지 않도록 투영
  const posts = getAllCsrPosts().map(({ id, title, affiliate, summary, thumbnail }) => ({
    id,
    title,
    affiliate,
    summary,
    thumbnail,
  }));

  return (
    <main id="main" className="csr-page" tabIndex={-1}>
      {/* GNB 메뉴는 추가하지 않음 — 상단 네비게이션은 기존 5개 라우트 그대로 */}
      <Nav current="home" consultHref="/#inq" forceSolid />
      <RevealInit />

      <div className="wrap">
        <header className="csr-head">
          <p className="eyebrow r">KG그룹 사회공헌</p>
          <h1 className="csr-head-title r">함께 성장하는 사회공헌</h1>
          <p className="csr-head-sub r">
            KG그룹이 이어온 사회공헌 활동 소식을 모았습니다.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="csr-empty r">
            <p>곧 소식을 전해드리겠습니다</p>
            <p className="sub">등록된 사회공헌 소식이 준비되는 대로 이곳에 안내드립니다.</p>
            <Link className="btn-line-dark" href="/">
              홈으로 돌아가기
            </Link>
          </div>
        ) : (
          // 검색 폼·필터 없음 (명세 v2.0 §1-2). 더보기 12건 단위 점증만 제공
          <CsrListGrid posts={posts} />
        )}
      </div>

      <div style={{ height: 100 }} />
    </main>
  );
}
