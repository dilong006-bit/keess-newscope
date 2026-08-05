import { KIUM_CATEGORY_META, type KiumCategory } from '@/lib/kium/data';

/**
 * F8 썸네일 — 기술명세서 v1.0 §4-1 · [수정 12](F17) 타이포 스케일 상향
 *
 * 전 표면 CSS(3겹 그라디언트 + 스크림 + 그레인). 이미지 태그·이미지 파일 없음.
 * 카테고리별 표면은 결정적(같은 카테고리 = 같은 표면) — 시각적 그룹핑이 곧 정보 설계.
 *
 * 텍스트 모드 단일 구현: 과정명 텍스트 자체가 썸네일이므로 22px/700로 키운다.
 * 배경(그라디언트·스크림·그레인)만 장식이고 과정명은 실제 텍스트 노드로,
 * 카드 버튼의 접근가능한 이름에 과정명이 포함된다(본문 중복 타이틀 제거 후에도 유지).
 * 카테고리 미니 라벨은 카드 본문에 같은 값이 있어 보조기술에는 숨긴다.
 *
 * 썸네일 이미지 자산 도입 시(이미지 모드): 배경 텍스트 제거 + 본문 타이틀 복원
 * — 분기 코드는 두지 않는다(현재는 텍스트 모드 단일).
 */
export default function KiumThumb({
  category,
  title,
}: {
  category: KiumCategory;
  title: string;
}) {
  return (
    <div className="kium-thumb" data-cat={category}>
      {/* 배경 레이어 — 장식 */}
      <span className="kium-grain" aria-hidden="true" />
      <span className="kium-thumb-cat" aria-hidden="true">
        {KIUM_CATEGORY_META[category].label}
      </span>
      <span className="kium-thumb-title">{title}</span>
    </div>
  );
}
