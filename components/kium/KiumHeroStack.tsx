import KiumThumb from './KiumThumb';
import { getCourseById } from '@/lib/kium/queries';

/**
 * [수정 1 ②] 히어로 중층 — KiumThumb 카드 스택 3장
 *
 * 카테고리 표면이 서로 다른 3개 과정으로 "성장 단계 전 구간"을 한눈에 보여준다.
 * 새 시각 요소가 아니라 탭2 썸네일 컴포넌트를 그대로 재사용하므로 표면 토큰도 동일하다.
 * 배경 장식이므로 aria-hidden — 과정 정보는 탭2에 텍스트로 온전히 존재한다.
 */
const STACK_IDS = ['kium-01', 'kium-04', 'kium-09'];

export default function KiumHeroStack() {
  const courses = STACK_IDS.map(getCourseById).filter(Boolean);
  if (courses.length === 0) return null;

  return (
    <div className="kium-hero-stack" aria-hidden="true">
      {courses.map((c) => (
        <div className="kium-stack-card" key={c!.id}>
          <KiumThumb category={c!.category} title={c!.titleMarketing} />
        </div>
      ))}
    </div>
  );
}
