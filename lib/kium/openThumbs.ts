/**
 * 공개교육 탭 전용 썸네일 맵 (고도화 명세 §4-3)
 *
 * **data.ts의 `thumbSrc`를 건드리지 않는다.** 과정 카드는 과정안내 탭과 공유되므로
 * 데이터에 직접 넣으면 과정안내 탭 19장 중 9장이 함께 이미지 모드로 바뀐다.
 * 공개교육 탭만 이 맵을 `KiumCourseGrid`의 `thumbs` prop으로 주입한다.
 *
 * 규격: 1200×900 (4:3) · JPG · 300KB 이내 · 원격 URL 직결(핫링크) 금지 → 저장소 동봉
 * 출처·라이선스: public/images/kium/open/README.md (Unsplash License · 인물 식별 컷 배제)
 */
export const KIUM_OPEN_THUMBS: Record<string, string> = {
  'kium-03': '/images/kium/open/kium-03.jpg',
  'kium-04': '/images/kium/open/kium-04.jpg',
  'kium-09': '/images/kium/open/kium-09.jpg',
  'kium-10': '/images/kium/open/kium-10.jpg',
  'kium-11': '/images/kium/open/kium-11.jpg',
  'kium-12': '/images/kium/open/kium-12.jpg',
  'kium-13': '/images/kium/open/kium-13.jpg',
  'kium-14': '/images/kium/open/kium-14.jpg',
  'kium-19': '/images/kium/open/kium-19.jpg',
};
