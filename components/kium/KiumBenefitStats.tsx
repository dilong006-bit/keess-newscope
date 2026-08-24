import { getFact } from '@/lib/kium/facts';
import { isAllRealtimeRemote } from '@/lib/kium/queries';

/**
 * 검증 완료 혜택 스탯 — [수정 1](히어로 하단) · [수정 3](신청절차 상단)에서 공유한다.
 *
 * 항목 구성 규칙:
 *  - 지원율·지원한도: content.ts facts를 **게이트 경유**로만 읽는다. verified=false면 자동 제외.
 *  - 운영 방식: data.ts `delivery` 19건 전수 확인에서 파생(19/19 충족 시에만 노출).
 * 어느 쪽도 임의 수치를 만들지 않으며, 소스가 바뀌면 렌더도 함께 사라진다.
 */
export function getBenefitStats(): { k: string; v: string }[] {
  const rate = getFact('supportRate');
  const limit = getFact('supportLimit');
  return [
    rate.verified ? { k: rate.label, v: rate.value } : null,
    limit.verified ? { k: limit.label, v: limit.value } : null,
    isAllRealtimeRemote() ? { k: '운영 방식', v: '대면 또는 비대면 선택\u00A0가능' } : null,
  ].filter(Boolean) as { k: string; v: string }[];
}

/** 출처 캡션 — 지시서 지정 문구 */
export const STATS_SOURCE = '한국산업인력공단 안내 기준';

export default function KiumBenefitStats({ variant = 'hero' }: { variant?: 'hero' | 'band' }) {
  const stats = getBenefitStats();
  if (stats.length === 0) return null;

  return (
    <>
      <dl className={variant === 'hero' ? 'kium-hero-stats r' : 'kium-stat-band r'}>
        {stats.map((s) => (
          <div className="kium-stat" key={s.k}>
            <dt className="k">{s.k}</dt>
            <dd className="v">{s.v}</dd>
          </div>
        ))}
      </dl>
      <p className="kium-stat-src r">{STATS_SOURCE}</p>
    </>
  );
}
