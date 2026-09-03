'use client';

import SessionBadge, { SessionCta } from './SessionBadge';
import { IconBadgePercent, IconCalendarDays, IconUsers } from './kiumIcons';
import { KIUM_CONTENT } from '@/lib/kium/content';
import { getFact } from '@/lib/kium/facts';
import { getCourseById } from '@/lib/kium/queries';
import {
  KIUM_SESSION_TOTAL,
  effectiveStatus,
  fmtRange,
  getSessionsByDate,
  type KiumSession,
} from '@/lib/kium/sessions';

/**
 * 공개교육 히어로
 *
 * eyebrow·타이틀은 app/kium/page.tsx의 패널 헤더가 이미 렌더한다.
 * 이 컴포넌트는 그 아래 리드문 · 신뢰 지표 3종 · 가장 빠른 개강 줄만 담당한다.
 *
 * 지표 수치는 전부 파생값이다 — 수기 숫자를 쓰지 않는다.
 *   · 회차 수 = KIUM_SESSION_TOTAL
 *   · '정부지원 환급 과정' 타일은 getFact('supportRate').verified가 true일 때만 렌더하고,
 *     false면 타일 자체를 빼고 2칸 그리드로 축소한다.
 *   · '가장 빠른 개강'은 now가 null(서버·마운트 전)이면 줄 전체를 렌더하지 않는다(SSG 규칙).
 */
export default function KiumOpenHero({
  now,
  onConsultSession,
}: {
  now: Date | null;
  onConsultSession: (s: KiumSession) => void;
}) {
  const govVerified = getFact('supportRate').verified;
  const next = now
    ? getSessionsByDate().find((s) => effectiveStatus(s, now) !== 'closed')
    : undefined;
  const nextCourse = next ? getCourseById(next.courseId) : undefined;

  return (
    <div className="kium-open-hero">
      <p className="kium-sec-sub r">{KIUM_CONTENT.open.sub}</p>

      <div
        className="kium-open-stats r"
        style={govVerified ? undefined : { gridTemplateColumns: 'repeat(2,1fr)' }}
      >
        <div>
          <IconUsers size={20} />
          <b>1명부터</b>
          <span>신청 가능</span>
        </div>
        <div>
          <IconCalendarDays size={20} />
          <b>10~12월</b>
          <span>{KIUM_SESSION_TOTAL}개 회차</span>
        </div>
        {govVerified && (
          <div>
            <IconBadgePercent size={20} />
            <b>정부지원</b>
            <span>환급 과정</span>
          </div>
        )}
      </div>

      {next && nextCourse && (
        <div className="kium-open-next r">
          <span className="lb">가장 빠른 개강</span>
          <span className="dt">{fmtRange(next)}</span>
          <span className="nm">{nextCourse.titleMarketing}</span>
          <SessionBadge status={effectiveStatus(next, now)} seatsLeft={next.seatsLeft} />
          <SessionCta
            status={effectiveStatus(next, now)}
            label={`${nextCourse.titleMarketing} ${fmtRange(next)}`}
            onClick={() => onConsultSession(next)}
          />
        </div>
      )}
    </div>
  );
}
