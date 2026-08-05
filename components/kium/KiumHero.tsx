import fs from 'node:fs';
import path from 'node:path';
import { BadgeCheck } from 'lucide-react';
import { KIUM_CONTENT } from '@/lib/kium/content';
import KiumBenefitStats from './KiumBenefitStats';
import KiumHeroStack from './KiumHeroStack';
import KiumHeroNeat from './KiumHeroNeat';

/**
 * F1 히어로 — 기술명세서 v1.0 §4 · 전략 §4-2 · 디자인 고도화 [수정 1]
 *
 * 카피는 content.ts hero 원문(탭구성상세 260804 확정본). 재작성 금지.
 * 배경 3층: ①정적 메시 블롭(폴백, 항상 렌더) + WebGL 캔버스(조건부) → ②카드 스택/아트웍 → ③그레인
 */

/** 강조 토큰 — 원문에 포함된 문자열. 분할 렌더해도 표기 결과는 원문과 동일하다 */
const RATE = '90~95%';

/** 옵션 트랙 B 교체 슬롯 — 파일이 배치되면 카드 스택 대신 아트웍을 렌더(빌드 타임 확인) */
const HERO_ART = '/kium/hero-art.webp';
function heroArtExists() {
  try {
    return fs.existsSync(path.join(process.cwd(), 'public', 'kium', 'hero-art.webp'));
  } catch {
    return false;
  }
}

export default function KiumHero() {
  const { copyMain, copySub, agencies } = KIUM_CONTENT.hero;
  const [before, after] = copyMain.split(RATE);
  const hasArt = heroArtExists();

  return (
    <section className="kium-hero">
      <div className="kium-hero-bg" aria-hidden="true">
        <span className="kium-blob b1" />
        <span className="kium-blob b2" />
        <KiumHeroNeat />
        <span className="kium-grain" />
      </div>

      <div className="wrap">
        <div className="kium-hero-grid">
          <div>
            <p className="kium-eyebrow-chip r">
              <BadgeCheck size={15} aria-hidden="true" />
              2026 정부지원 훈련 · 한국산업인력공단 공고 제2025-237호
            </p>
            <h1 className="r">
              {before}
              <span className="kium-rate">{RATE}</span>
              {after}
            </h1>
            <p className="kium-hero-sub r">
              {copySub.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </p>

            <div className="kium-agencies r">
              <span className="lab">주관</span>
              {agencies.map((a) => (
                <span className="org" key={a}>
                  {a}
                </span>
              ))}
            </div>

            <div className="kium-hero-cta r">
              <a className="btn btn-ink" href="#inq">
                도입문의
              </a>
              <a className="kium-btn-ghost" href="#kium-eligibility">
                지원대상 확인
              </a>
            </div>
          </div>

          <div className="kium-hero-art r">
            {hasArt ? (
              <div className="kium-hero-artwork">
                {/* 추상 브랜드 아트웍(옵션 트랙 B). LCP는 히어로 텍스트로 유지 — priority 없음 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={HERO_ART} alt="" width={1600} height={1200} loading="lazy" decoding="async" />
              </div>
            ) : (
              <KiumHeroStack />
            )}
          </div>
        </div>

        <KiumBenefitStats variant="hero" />
      </div>
    </section>
  );
}
