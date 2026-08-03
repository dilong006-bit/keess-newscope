import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import '@/styles/csr.css';
import Nav from '@/components/common/Nav';
import RevealInit from '@/components/common/RevealInit';
import CsrBody from '@/components/csr/CsrBody';
import { getAllCsrPosts, getCsrPostById, getAdjacentCsrPosts } from '@/lib/csr/queries';

/** 목록에 있는 id만 정적 생성 — 그 외 경로는 dynamicParams=false로 기존 404 처리 */
export function generateStaticParams() {
  return getAllCsrPosts().map((p) => ({ id: p.id }));
}

export const dynamicParams = false;

interface Props {
  params: { id: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getCsrPostById(params.id);
  if (!post) return { title: '사회공헌 | KEESS' };
  return {
    title: `${post.title} | KEESS 사회공헌`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.thumbnail ? [post.thumbnail.src] : undefined,
    },
  };
}

export default function CsrDetailPage({ params }: Props) {
  const post = getCsrPostById(params.id);
  if (!post) notFound();

  const { prev, next } = getAdjacentCsrPosts(post.id);

  return (
    <main id="main" className="csr-page" tabIndex={-1}>
      <Nav current="home" consultHref="/#inq" forceSolid />
      <RevealInit />

      <div className="wrap">
        <article className="csr-detail csr-head">
          <Link className="csr-back" href="/csr">
            <span aria-hidden="true">←</span> 목록으로
          </Link>

          {/* 헤더 = 계열사 배지 + 제목. 날짜·조회수 표기 없음(명세 v2.0 §1-2) */}
          <div className="csr-detail-meta">
            <span className="badge-pill">{post.affiliate}</span>
          </div>

          <h1>{post.title}</h1>

          <CsrBody blocks={post.body} />

          <aside className="csr-source">
            <span className="csr-source-t">출처: KG그룹 공식 사회공헌 페이지</span>
            <a
              className="csr-source-link"
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              원문 보기
              <span className="csr-source-ic" aria-hidden="true">↗</span>
              <span className="sr-only">(새 창에서 열림)</span>
            </a>
          </aside>

          {/* 인접 글이 없으면 빈 내비 영역을 만들지 않는다 */}
          {(prev || next) && (
            <nav className="csr-nav" aria-label="이전글 다음글">
              {prev ? (
                <Link className="csr-nav-item prev" href={`/csr/${prev.id}`}>
                  <span className="dir">← 이전글</span>
                  <span className="t">{prev.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link className="csr-nav-item next" href={`/csr/${next.id}`}>
                  <span className="dir">다음글 →</span>
                  <span className="t">{next.title}</span>
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </article>
      </div>

      <div style={{ height: 100 }} />
    </main>
  );
}
