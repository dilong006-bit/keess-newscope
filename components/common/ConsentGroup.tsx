'use client';

import { useState } from 'react';
import { CONSENT_TEXTS, CONSENT_REQUIRED_ERR, type ConsentClause } from '@/data/consent';

/**
 * 개인정보 동의 컴포넌트 (도입문의·다운로드 폼 공용)
 *
 * 홈 교육상담 폼의 동의 UI 구조(.consent-group / .consent / .consent-main /
 * .consent-view / .consent-text / .ct-inner)와 클래스를 그대로 재사용한다.
 * 신규 스타일을 만들지 않으며, 홈 폼·부정훈련 신고 모달의 기존 동의 구조는 건드리지 않는다.
 *
 * 선택 동의는 CONSENT_TEXTS[formKey].optional 이 null 이면 렌더하지 않는다.
 * 다운로드 모달의 안내 배너도 같은 값에 종속되므로(호출부에서 hasOptional 사용),
 * 배너만 남고 동의만 사라지는 상태가 구조적으로 발생하지 않는다.
 */

interface ConsentGroupProps {
  /** CONSENT_TEXTS 키 */
  formKey: keyof typeof CONSENT_TEXTS;
  /** 체크박스 id 접두어 — 페이지/모달 간 전역 유일성 보장 (ld- / hrd- / dl- / ct-) */
  idPrefix: string;
  /** 필수 동의 체크 상태 */
  required: boolean;
  onRequiredChange: (v: boolean) => void;
  /** 필수 미체크 제출 시 true → 에러 표기 */
  error?: boolean;
  /** 선택 동의 체크 상태 (optional 이 null 이면 사용되지 않음) */
  optional?: boolean;
  onOptionalChange?: (v: boolean) => void;
}

/**
 * 펼침 시 아코디언 상한(px). 전문이 잘리지 않도록 최장 전문(모바일 375px 실측 617px)보다
 * 크게 잡는다. 실제 높이는 내용에 따라 결정되며 이 값은 전개 애니메이션의 상한일 뿐이다.
 */
const CONSENT_TEXT_MAXH = 700;

/**
 * 전문 도입부 법적 근거 기본 문장(필수 동의 = 「개인정보 보호법」 제15조).
 * 선택 동의처럼 근거가 다른 절은 ConsentClause.legalBasis 로 개별 지정한다.
 * ※ 이 문장은 정보보호팀 승인 문구이므로 변경 금지.
 */
const DEFAULT_LEGAL_BASIS =
  'KG에듀원 KEESS는 「개인정보 보호법」 제15조에 의거하여 아래와 같이 개인정보를 수집·이용하고자 하오니, 이에 동의하여 주시기를 부탁드립니다.';

function ClauseText({ c, open }: { c: ConsentClause; open: boolean }) {
  return (
    <div className="consent-text" style={{ maxHeight: open ? CONSENT_TEXT_MAXH : 0 }}>
      <div className="ct-inner">
        <p><b>{c.title}</b></p>
        <p>{c.legalBasis ?? DEFAULT_LEGAL_BASIS}</p>
        <p><b>1. 수집·이용 목적</b><br />{c.purpose}</p>
        <p><b>2. 수집 항목</b><br />{c.items}</p>
        <p><b>3. 보유 및 이용 기간</b><br />{c.period}</p>
        <p><b>4. 동의 거부 권리</b><br />{c.refusal}</p>
        {c.note && <p>{c.note}</p>}
      </div>
    </div>
  );
}

export default function ConsentGroup({
  formKey, idPrefix, required, onRequiredChange, error = false, optional = false, onOptionalChange,
}: ConsentGroupProps) {
  const entry = CONSENT_TEXTS[formKey];
  const [open, setOpen] = useState<{ req: boolean; opt: boolean }>({ req: false, opt: false });
  const reqId = `${idPrefix}agree1`;
  const optId = `${idPrefix}agree2`;

  return (
    <div className="consent-group">
      {/* 필수 동의 */}
      <div className={`consent${error ? ' invalid' : ''}`}>
        <label className="consent-main" htmlFor={reqId}>
          <input id={reqId} type="checkbox" name="agreePrivacy" checked={required} onChange={(e) => onRequiredChange(e.target.checked)} aria-required="true" aria-invalid={error} />
          <span><b className="c-tag req-tag">필수</b> {entry.required.label}</span>
        </label>
        <button type="button" className="consent-view" aria-expanded={open.req} aria-controls={`${reqId}-text`} onClick={() => setOpen((s) => ({ ...s, req: !s.req }))}>{open.req ? '접기' : '전문 보기'}</button>
      </div>
      {error && <span className="err" style={{ display: 'block', marginTop: 0 }} aria-live="polite">{CONSENT_REQUIRED_ERR}</span>}
      <div id={`${reqId}-text`}><ClauseText c={entry.required} open={open.req} /></div>

      {/* 선택 동의 — optional 이 null 이면 행 자체를 렌더하지 않는다 */}
      {entry.optional && (
        <>
          <div className="consent">
            <label className="consent-main" htmlFor={optId}>
              <input id={optId} type="checkbox" name="agreeMarketing" checked={optional} onChange={(e) => onOptionalChange?.(e.target.checked)} />
              <span><b className="c-tag opt-tag">선택</b> {entry.optional.label}</span>
            </label>
            <button type="button" className="consent-view" aria-expanded={open.opt} aria-controls={`${optId}-text`} onClick={() => setOpen((s) => ({ ...s, opt: !s.opt }))}>{open.opt ? '접기' : '전문 보기'}</button>
          </div>
          <div id={`${optId}-text`}><ClauseText c={entry.optional} open={open.opt} /></div>
        </>
      )}
    </div>
  );
}
