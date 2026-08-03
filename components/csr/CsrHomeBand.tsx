import Link from 'next/link';
import CsrCard from './CsrCard';
import { getHomeBandCsrPosts } from '@/lib/csr/queries';

/**
 * 홈 하단 사회공헌 밴드 — 최종 명세 v2.0 §4-5
 * 타이틀은 무시제("최신" 등 시제 표현 금지 — 날짜 미노출이므로 최신성 주장 불가).
 * 카드는 목록과 동일한 CsrCard 재사용. 0건이면 섹션 자체를 노출하지 않는다.
 * 리빌은 홈의 RevealInit이 .r/.stagger를 관찰해 처리(신규 옵저버 미생성).
 */
export default function CsrHomeBand() {
  const posts = getHomeBandCsrPosts(6);
  if (posts.length === 0) return null;

  return (
    <section className="section" id="csr">
      <div className="wrap">
        <div className="csr-band-head r">
          <div>
            <p className="eyebrow">KG그룹 사회공헌</p>
            <h2 className="csr-band-title">KG그룹 사회공헌 활동</h2>
            <p className="csr-band-sub">
              KG그룹이 이어온 사회공헌 활동 소식을 전합니다.
            </p>
          </div>
          <div className="csr-band-aside">
            <Link className="btn-line-dark" href="/csr">
              전체 보기 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="csr-grid stagger">
          {posts.map((p) => (
            <CsrCard post={p} variant="band" key={p.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
