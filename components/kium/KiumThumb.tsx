import Img from '@/components/common/Img';
import { KIUM_CATEGORY_META, type KiumCategory } from '@/lib/kium/data';

/**
 * F8 썸네일 — 기술명세서 v1.0 §4-1 · [수정 12](F17) 타이포 스케일 상향
 *
 * 카테고리별 CSS 표면은 결정적(같은 카테고리 = 같은 표면) — 시각적 그룹핑이 곧 정보 설계.
 *
 * 이미지/텍스트 듀얼 모드(썸네일 듀얼 모드 명세서 §3) — thumbSrc 유무 단일 기준으로 분기한다.
 * 과정별 이미지 자산 생산 시점이 제각각이라 두 모드는 영구 공존한다.
 *
 * - 이미지 모드(thumbSrc 있음): 이미지 단독 노출. 배경 텍스트(카테고리 라벨·과정명) 제거 —
 *   과정명은 카드 본문 타이틀이 담당한다(KiumCourseCard §4).
 * - 텍스트 모드(thumbSrc 없음): 과정명 텍스트 자체가 썸네일이므로 22px/700.
 *   배경(그라디언트·스크림·그레인)만 장식이고 과정명은 실제 텍스트 노드로,
 *   카드 버튼의 접근가능한 이름에 과정명이 포함된다(본문 중복 타이틀 제거 후에도 유지).
 *   카테고리 미니 라벨은 카드 본문에 같은 값이 있어 보조기술에는 숨긴다.
 */
export default function KiumThumb({
  category,
  title,
  thumbSrc,
}: {
  category: KiumCategory;
  title: string;
  thumbSrc?: string;
}) {
  return (
    <div className="kium-thumb" data-cat={category}>
      {/* 배경 레이어 — 장식. 이미지 모드에서도 유지: 이미지 로드 실패 시 폴백 화면이 된다 */}
      <span className="kium-grain" aria-hidden="true" />

      {thumbSrc ? (
        <Img className="kium-thumb-img" src={thumbSrc} alt={title} />
      ) : (
        <>
          <span className="kium-thumb-cat" aria-hidden="true">
            {KIUM_CATEGORY_META[category].label}
          </span>
          <span className="kium-thumb-title">{title}</span>
        </>
      )}
    </div>
  );
}
