'use client';

import { useEffect, useState } from 'react';
import { Building2, Check, ChevronDown, ExternalLink, Hash, KeyRound } from 'lucide-react';
import { KIUM_CONTENT } from '@/lib/kium/content';

/**
 * F4 자격확인 3경로 — 기술명세서 최종 v2.0 §4(개정) · 전략 §4-5
 *
 * 외부 링크는 content.ts officialLinks(정부·공단 도메인)만 사용한다.
 * 경쟁 훈련기관(KPC·에이블런 등) URL 삽입 금지 — 링크 맵 밖의 URL은 이 파일에 존재하지 않는다.
 * 데스크톱 3열 / 모바일(<=900px) 아코디언 3단(기본 첫 항목 펼침).
 */

/** 경로 key → officialLinks 인덱스 (0=고용24, 1=고용·산재보험 토탈서비스) */
const PATH_LINK: Record<string, number | undefined> = { cert: 0, mgmtno: 1, bizno: 0 };

/** 경로 key → lucide 아이콘 */
const PATH_ICON: Record<string, typeof KeyRound> = { cert: KeyRound, mgmtno: Building2, bizno: Hash };

/**
 * [수정 2] 방법3은 content.ts paths 대신 이 직접 확인 스텝을 렌더한다.
 * content.ts facts의 검증 항목
 * `limitCheckPath`('고용24 로그인 → 직업 능력 개발 → 사업주훈련 → 지원한도 조회')와 동일 경로다.
 * 보조 라벨('고용24에서 직접 확인')은 사업 지시로 삭제 — 카드 3장 헤더를 1줄로 통일한다.
 */
const BIZNO_DIRECT = {
  steps: ['고용24 기업회원 가입·로그인', '직업 능력 개발 → 사업주훈련', '지원한도 조회'],
};

/** 결과 문구(초록 체크 강조) 판별 — 데이터 기반이라 문안이 바뀌어도 오작동하지 않는다 */
const isResult = (s: string) => s.includes('참여 가능');

export default function KiumEligibility() {
  const { intro, paths } = KIUM_CONTENT.eligibility;
  const [accordion, setAccordion] = useState(false);
  const [openKey, setOpenKey] = useState<string>(paths[0].key);

  useEffect(() => {
    const mq = window.matchMedia('(max-width:900px)');
    const sync = () => setAccordion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <>
      <p className="kium-sec-sub">{intro}</p>

      <div className="kium-elig-grid">
        {paths.map((p, i) => {
          const open = !accordion || openKey === p.key;
          const linkIdx = PATH_LINK[p.key];
          const link = linkIdx === undefined ? null : KIUM_CONTENT.officialLinks[linkIdx];
          const bodyId = `kium-elig-body-${p.key}`;

          const Icon = PATH_ICON[p.key];
          const direct = p.key === 'bizno' ? BIZNO_DIRECT : null;

          const head = (
            <>
              <span className="kium-elig-ic" aria-hidden="true">
                <Icon size={17} />
              </span>
              <span className="kium-elig-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="kium-elig-t">{p.title}</span>
              <ChevronDown className="kium-elig-chev" size={18} aria-hidden="true" />
            </>
          );

          const stepList = (steps: readonly string[]) => (
            <ol className="kium-elig-steps">
              {steps.map((s, si) => (
                <li key={s} className={isResult(s) ? 'is-result' : undefined}>
                  <span className="n">{String(si + 1).padStart(2, '0')}</span>
                  <span className="t">
                    {isResult(s) && <Check className="ok" size={15} aria-hidden="true" />}
                    {s}
                  </span>
                </li>
              ))}
            </ol>
          );

          const body = (
            <div className="kium-elig-body" id={bodyId}>
              {stepList(direct ? direct.steps : p.steps)}
              {link && (
                <a
                  className="kium-elig-link"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={15} aria-hidden="true" />
                  {link.label} 바로가기
                  <span className="kium-sr">(새 창에서 열림)</span>
                </a>
              )}
              {/*
                [수정 16] 03 카드의 점선 구분선 + 상담 유도 푸터는 렌더에서 제거했다.
                03만 길어져 카드 3장의 시각 균형이 깨졌기 때문이다.
                세 카드 모두 아이콘 → 스텝 → 바로가기 버튼으로 동일하게 종결된다.
              */}
            </div>
          );

          return (
            <div className="kium-elig" key={p.key} data-open={open}>
              {accordion ? (
                <>
                  <button
                    type="button"
                    className="kium-elig-head"
                    aria-expanded={open}
                    aria-controls={bodyId}
                    onClick={() => setOpenKey(open ? '' : p.key)}
                  >
                    {head}
                  </button>
                  <div className="kium-elig-wrap">
                    <div>{body}</div>
                  </div>
                </>
              ) : (
                <>
                  <p className="kium-elig-head">{head}</p>
                  {body}
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
