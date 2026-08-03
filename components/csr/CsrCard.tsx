import Link from 'next/link';
import Image from 'next/image';
import type { CsrCardData } from '@/lib/csr/types';

interface CsrCardProps {
  /** 카드 노출 필드만 받는다(본문·sortDate 등은 받지 않음) */
  post: CsrCardData;
  variant: 'band' | 'list';
  /** 더보기로 새로 들어온 카드의 등장 모션용 (CsrListGrid에서만 사용) */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 사회공헌 카드 (홈 밴드·목록 공용) — 최종 명세 v2.0 §4-1
 * 노출 정보는 썸네일·계열사 배지·제목·요약 4종으로 한정한다.
 * 날짜(sortDate)·조회수·검색 관련 요소는 노출하지 않는다(§1-2).
 */
export default function CsrCard({ post, variant, className = '', style }: CsrCardProps) {
  return (
    <Link
      className={`card csr-card csr-card--${variant} ${className}`.trim()}
      href={`/csr/${post.id}`}
      style={style}
      aria-label={`${post.affiliate} 사회공헌 활동: ${post.title}`}
    >
      {/* 16:9 시각 슬롯 — overflow:hidden으로 hover 확대 시 모서리 라운드 유지 */}
      <div className="csr-thumb">
        {post.thumbnail ? (
          <Image
            src={post.thumbnail.src}
            alt={post.thumbnail.alt}
            width={640}
            height={360}
            sizes="(max-width:560px) 100vw, (max-width:860px) 50vw, 33vw"
          />
        ) : (
          // 썸네일 결측 방어 — 브랜드 퍼플 파생 그라디언트 + KEESS 마크(빈 여백 방지)
          <span className="csr-thumb-ph" aria-hidden="true">KEESS</span>
        )}
      </div>
      <div className="csr-card-body">
        <span className="badge-pill csr-cat">{post.affiliate}</span>
        <h3 className="csr-title">{post.title}</h3>
        <p className="csr-summary">{post.summary}</p>
      </div>
    </Link>
  );
}
