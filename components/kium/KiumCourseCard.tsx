'use client';

import KiumThumb from './KiumThumb';
import { KIUM_CATEGORY_META, type KiumCourse } from '@/lib/kium/data';

/**
 * F7/F8 과정 카드 — 기술명세서 v1.0 §4
 *
 * 카드 = button 시맨틱(aria-expanded로 상세 패널 연동). 노출 필드는 화이트리스트(§1-1) 한정:
 * 썸네일 · 카테고리/소분류 라벨 · 과정명 · summary · 대상 · 시간/일수 · AI융합형 · 정부지원 환급.
 * 단가·강사·NCS·정원은 카드에 노출하지 않는다.
 */
export default function KiumCourseCard({
  course,
  open,
  panelId,
  onToggle,
}: {
  course: KiumCourse;
  open: boolean;
  panelId: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="kium-card"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
    >
      <KiumThumb category={course.category} title={course.titleMarketing} />

      <span className="kium-card-body">
        <span className="kium-card-labels">
          <span className="kium-lab cat" data-cat={course.category}>
            {/* 카테고리 컬러 dot — 썸네일 표면과 같은 --mesh-a로 그리드 스캔 시 그룹핑을 돕는다 */}
            <span className="kium-dot" aria-hidden="true" />
            {KIUM_CATEGORY_META[course.category].label}
          </span>
          <span className="kium-lab sub">{course.subCategory}</span>
        </span>

        {/*
          [수정 12] 본문 과정명 행 제거 — 과정명은 썸네일 텍스트가 담당한다(중복 노출 제거).
          썸네일 이미지 자산 도입 시(이미지 모드): 배경 텍스트 제거 + 본문 타이틀 복원.
        */}
        <span className="kium-card-summary">{course.summary}</span>

        <span className="kium-card-meta">
          <span className="kium-meta-t">
            대상 <b>{course.target}</b>
          </span>
          <span className="kium-meta-t">
            <b>{course.hours}</b>시간 · <b>{course.days}</b>일
          </span>
          {course.type === 'AI융합형' && <span className="kium-badge ai">AI융합형</span>}
          {/* 정부지원 환급 배지 — 단가(원) 미노출을 갈음하는 B2B 환급 구조 표기 */}
          <span className="kium-badge gov">정부지원 환급</span>
        </span>
      </span>
    </button>
  );
}
