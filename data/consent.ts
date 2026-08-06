// 개인정보 수집·이용 동의 전문 — 단일 출처(Single Source of Truth)
//
// 「개인정보 보호법」 제15조 제1항에 따라 개인정보를 수집하는 폼에 동의 절차를 제공한다.
// 아래 문구는 2026-08-06 정보보호팀 승인 반영(G2-11)본이다. 문구를 바꿀 때 이 파일만 수정하면
// 4개 폼 전체에 반영된다. 컴포넌트·페이지에는 동의 문구를 중복 기재하지 않는다.
//
// 홈 교육상담 폼과 부정훈련 신고 모달의 기존 동의 구조는 이 상수를 쓰지 않는다(변경 금지 대상).

export interface ConsentClause {
  /** 체크박스 옆 한 줄 라벨 */
  label: string;
  /** 전문 최상단 제목 */
  title: string;
  /**
   * 전문 도입부 법적 근거 문장. 미지정 시 기본(제15조) 문장 사용.
   * 필수 동의는 제15조(정보보호팀 승인 문구)를 그대로 쓰므로 지정하지 않는다.
   */
  legalBasis?: string;
  /** 수집·이용 목적 */
  purpose: string;
  /** 수집 항목 */
  items: string;
  /** 보유 및 이용 기간 */
  period: string;
  /** 동의 거부 권리 */
  refusal: string;
  /** 전문 말미 보충 문구(선택 동의의 철회·수신거부 안내 등) */
  note?: string;
}

export interface ConsentEntry {
  required: ConsentClause;
  /**
   * 선택 동의. null이면 선택 동의 행을 렌더하지 않으며,
   * 그에 연동된 안내 배너(다운로드 모달)도 함께 사라진다.
   * → 매월 발송 업무 미운영 확정 시 download.optional 을 null 로 바꾸는 한 줄로 히든 처리.
   *   배너만 남고 동의만 사라지는 조합은 구조적으로 발생할 수 없다.
   */
  optional: ConsentClause | null;
}

const PERIOD_1Y = '동의일로부터 1년간(보유목적 달성) 또는 삭제 요청 시 지체 없이 파기';
const REFUSAL = (svc: string) =>
  `동의를 거부할 권리가 있습니다. 다만 거부 시 ${svc} 이용이 제한될 수 있습니다.`;

export const CONSENT_TEXTS: Record<'leadership' | 'hrd' | 'download' | 'content', ConsentEntry> = {
  // A. /leadership 도입문의
  leadership: {
    required: {
      label: '개인정보 수집·이용 동의',
      title: '개인정보 수집·이용 안내 (필수)',
      purpose: '리더십·조직 솔루션 도입 문의의 접수·상담 및 회신',
      items: '(필수) 담당자명, 연락처, 회사명',
      period: PERIOD_1Y,
      refusal: REFUSAL('도입 문의 서비스'),
    },
    optional: null,
  },

  // B. /hrd 도입문의
  hrd: {
    required: {
      label: '개인정보 수집·이용 동의',
      title: '개인정보 수집·이용 안내 (필수)',
      purpose: 'HRD 통합 솔루션 도입 문의의 접수·상담 및 회신',
      items: '(필수) 담당자명, 연락처, 회사명',
      period: PERIOD_1Y,
      refusal: REFUSAL('도입 문의 서비스'),
    },
    optional: null,
  },

  // C. /content 전체 과정 리스트 다운로드 모달 (필수 + 선택 2단)
  download: {
    required: {
      label: '개인정보 수집·이용 동의',
      title: '개인정보 수집·이용 안내 (필수)',
      purpose: '전체 과정 리스트 파일 제공 및 관련 안내',
      items: '(필수) 담당자명, 회사/기관, 이메일',
      period: PERIOD_1Y,
      refusal: REFUSAL('리스트 다운로드'),
    },
    optional: {
      label: '매월 최신 과정 리스트 이메일 수신 동의',
      title: '매월 최신 과정 리스트 이메일 수신 동의 (선택)',
      // 선택(마케팅성) 동의의 근거는 제15조가 아니다 — 정보보호팀 회신(G2-11) 지적 반영.
      legalBasis:
        'KG에듀원 KEESS는 「개인정보 보호법」 제22조 및 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제50조에 의거하여 아래와 같이 개인정보를 수집·이용하고자 하오니, 이에 동의하여 주시기를 부탁드립니다.',
      purpose: '매월 갱신되는 KEESS 전체 과정 리스트의 이메일 발송',
      items: '이메일',
      period: '수신 동의 철회 시까지',
      refusal: '동의하지 않아도 리스트 다운로드는 이용하실 수 있습니다.',
      note: '발송되는 이메일에서 언제든 수신을 거부할 수 있습니다.',
    },
  },

  // D. /content 콘텐츠 도입 문의 모달
  content: {
    required: {
      label: '개인정보 수집·이용 동의',
      title: '개인정보 수집·이용 안내 (필수)',
      purpose: '콘텐츠 솔루션 도입 문의의 접수·상담 및 회신',
      items: '(필수) 담당자명, 회사/기관, 이메일',
      period: PERIOD_1Y,
      refusal: REFUSAL('도입 문의 서비스'),
    },
    optional: null,
  },
};

/** 필수 동의 미체크 제출 시 동의 행 직하단에 표기 */
export const CONSENT_REQUIRED_ERR = '필수 동의 항목을 확인해 주세요.';

/**
 * 다운로드 모달 상단 안내 배너.
 * CONSENT_TEXTS.download.optional 이 존재할 때만 렌더한다(§3-3 히든 스위치).
 */
export const DOWNLOAD_OPTIN_BANNER =
  '아래 수신 동의(선택)에 체크하시면 매월 갱신되는 최신 리스트를 이메일로 보내드립니다.';
