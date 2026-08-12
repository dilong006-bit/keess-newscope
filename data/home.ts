// 홈 카피 — keess_home_C_v18 정본 verbatim (하드코딩 금지 · 여기서 주입)

// ── 히어로 캐러셀 5슬라이드 (원본 535) ──
export interface HeroSlide {
  theme: 'brand' | 'event' | 'new' | 'gov' | 'case' | 'kium';
  /** 미지정 시 테마 그라디언트 배경만 사용(사진 슬롯 없음) */
  img?: string;
  tag?: string;
  eyebrow: string;
  title: string; // <br> 허용
  sub: string; // <br> 허용
  /** scroll = 같은 페이지 앵커 / href = 다른 라우트 이동 (둘 중 하나만) */
  cta: { label: string; scroll?: string; href?: string };
  eager?: boolean;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    theme: 'brand',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop',
    eyebrow: 'KG에듀원 기업교육 · B2B · B2G',
    title: '진단으로 설계하고, 효과로 증명합니다.',
    sub: '조직을 먼저 진단해 무엇을 키울지 특정하고, 효과를 숫자로 증명합니다.<br>AX·AI 전환·리더십·HRD 통합·콘텐츠까지, 진단부터 결과보고까지 직접 책임집니다.',
    cta: { label: '교육 상담 신청', scroll: '#inq' },
    eager: true,
  },
  // 인재키움 프리미엄 캠페인 — 카피는 lib/kium/content.ts hero 확정본의 축약형(재작성 아님).
  // 사진 슬롯 없이 테마 그라디언트만 사용하고, CTA는 스크롤이 아닌 /kium 라우팅이다.
  {
    theme: 'kium',
    // 이 슬라이드만 'EVENT ·' 접두를 뺀다 — 다른 슬라이드(EVENT·예시 / NEW·예시)는 현행 유지.
    tag: '정부지원',
    eyebrow: '2026 중소기업 인재 키움 프리미엄 훈련',
    title: '교육비 부담은 낮추고, 훈련비의 90~95%는 환급 받고',
    sub: '맞춤형 교육 설계부터 복잡한 환급 절차까지, KG에듀원이 함께합니다.',
    cta: { label: '자세히 보기', href: '/kium' },
  },
  {
    theme: 'event',
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop',
    tag: 'EVENT · 예시',
    eyebrow: '신규 도입 기업 대상',
    title: '지금 도입하면,<br>조직 진단 무료',
    sub: '오픈 기념, 신규 도입 기업에 조직 역량 진단을 무상 제공합니다. 진단 결과로 꼭 맞는 교육을 설계해 드립니다.',
    cta: { label: '이벤트 신청', scroll: '#inq' },
  },
  {
    theme: 'new',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop',
    tag: 'NEW · 예시',
    eyebrow: '2026 신규 과정',
    title: '생성형 AI 실무 과정,<br>새로 열렸습니다',
    sub: 'ChatGPT 업무 적용부터 데이터 분석·자동화까지. 현업에 바로 적용하는 AI 과정을 새롭게 선보입니다.',
    cta: { label: '과정 살펴보기', scroll: '#p1' },
  },
  {
    theme: 'gov',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop',
    tag: '정부지원 · 예시',
    eyebrow: '사업주훈련 환급 과정',
    title: '교육비 부담은 낮추고,<br>역량은 높이고',
    sub: '정부지원 요건을 충족하면 훈련비를 지원받을 수 있습니다. 필요한 절차는 담당 컨설턴트가 안내해 드립니다.',
    cta: { label: '지원 상담', scroll: '#inq' },
  },
  {
    theme: 'case',
    img: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000&auto=format&fit=crop',
    tag: 'CASE · 예시',
    eyebrow: '고객 성공 사례',
    title: '○○기업, AI 전환 교육으로<br>실무를 바꾸다',
    sub: '전 직원 AI 리터러시 교육 도입 후 업무 자동화가 확산됐습니다. 진단·설계·운영·성과까지 함께 만들었습니다.',
    cta: { label: '사례 문의', scroll: '#inq' },
  },
];

// ── 인트로 (원본 537-544) ──
export const INTRO = {
  eyebrow: 'KG에듀원 교육체계',
  lead: '과정을 고르기 전에,<br>조직을 먼저 진단합니다.',
  sub: '7대 교육체계 위에 8,000여 콘텐츠를 갖추고 매월 새 과정을 더합니다. 진단으로 설계하고, 운영으로 책임지고, 숫자로 증명합니다.',
};

// ── 4필러 (원본 546-614) ──
export interface PillarStep {
  num: string;
  title: string;
  desc: string;
}
export interface Pillar {
  id: string;
  ac: string; // --ac 변수값
  pg: string; // --pg 그라디언트
  img: string;
  badge: string;
  idx: string;
  name: string;
  headLines: string[]; // 줄 단위
  steps: PillarStep[];
  close?: string;
  reverse?: boolean;
  dot: string; // pdots aria-label
}

export const PILLARS: Pillar[] = [
  {
    id: 'p1',
    ac: 'var(--p1)',
    pg: 'linear-gradient(135deg,#2E1A6B,#5a3fb0)',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop',
    badge: 'AI Transformation',
    idx: '01',
    name: 'AX·AI 전환',
    headLines: ['AI 교육을 진단에서 시작해,', '성과로 끝냅니다.'],
    steps: [
      { num: '01', title: '현 수준 진단', desc: 'AI·데이터 활용 수준과 직무별 역량 Gap 진단' },
      { num: '02', title: '직무별 맞춤 설계', desc: '5단계 AX Framework·Skill Map 기반 맞춤 교육 설계' },
      { num: '03', title: '성과 측정·확산', desc: '업무 생산성·활용도 측정과 사전·사후 성과 리포트' },
    ],
    dot: 'AX·AI',
  },
  {
    id: 'p2',
    ac: 'var(--p2)',
    pg: 'linear-gradient(135deg,#E91E63,#ff7aa8)',
    img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop',
    badge: 'Leadership Development',
    idx: '02',
    name: '리더십·조직',
    headLines: ['리더십은 감이 아닌', '체계로 설계합니다.'],
    steps: [
      { num: '01', title: '현 수준 진단', desc: '리더십·조직문화 진단 기반 핵심 성장 과제 도출' },
      { num: '02', title: '단계별 역량 개발', desc: '6대 역량 체계와 6단계 성장 여정 기반 맞춤 육성' },
      { num: '03', title: '조직문화 정착', desc: '현업 적용·조직 확산·조직문화 정착의 5단계 체계' },
    ],
    reverse: true,
    dot: '리더십',
  },
  {
    id: 'p3',
    ac: 'var(--p3)',
    pg: 'linear-gradient(135deg,#8B27A8,#c44fd8)',
    img: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1600&auto=format&fit=crop',
    badge: 'Customized HRD Solution',
    idx: '03',
    name: 'HRD 통합 솔루션',
    headLines: ['LMS 구축부터 운영·제작까지,', 'HRD를 한 곳에서 연결합니다.'],
    steps: [
      { num: '01', title: '맞춤형 학습 플랫폼', desc: 'LMS·전용 APP·온오프 통합·ISMS 기반 학습환경' },
      { num: '02', title: '통합 교육 운영', desc: '교육 운영·모니터링·AI 학습지원·성과관리 통합' },
      { num: '03', title: '콘텐츠 자체 제작', desc: '3개 자체 스튜디오와 전담 제작조직 기반 콘텐츠 제작' },
    ],
    close: '국민건강보험공단과 한국전기안전공사가 선택한 교육 운영 파트너, KG에듀원',
    dot: 'HRD 통합',
  },
  {
    id: 'p4',
    ac: 'var(--p4)',
    pg: 'linear-gradient(135deg,#F58220,#ffb15e)',
    img: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?q=80&w=1600&auto=format&fit=crop',
    badge: 'Content Solution',
    idx: '04',
    name: '콘텐츠 솔루션',
    headLines: ['기업에 필요한 모든 교육을,', '한 곳에서 찾고 만듭니다.'],
    steps: [
      { num: '01', title: '8,000여 개 과정', desc: '직무·어학·IT·자격·비즈니스·리더십·법정 콘텐츠' },
      { num: '02', title: '6개 교육체계', desc: '학습 목적과 역량에 따라 탐색하는 체계적 콘텐츠 구성' },
      { num: '03', title: '제작·파트너 확장', desc: '자체 제작·파트너 도입과 매월 100+ 신규 콘텐츠 업데이트' },
    ],
    close: '필요한 콘텐츠는 직접 제작하고, 매월 새 과정을 더합니다.',
    reverse: true,
    dot: '콘텐츠',
  },
];

// ── 성과 지표 (원본 616-625) ──
export interface StatRing {
  ac: string;
  pct: number;
  count: number;
  suffix?: string;
  label: string;
}
export const STATS: StatRing[] = [
  { ac: '#8a6bff', pct: 0.82, count: 8000, suffix: '+', label: '보유 교육 콘텐츠' },
  { ac: '#ff5e92', pct: 0.55, count: 100, suffix: '+', label: '매월 신규 과정' },
  { ac: '#c067e0', pct: 0.7, count: 4146, label: '외국어 콘텐츠' },
  { ac: '#ffa24d', pct: 0.9, count: 2, suffix: '만', label: '동시접속 · ISMS' },
];

// ── 매니페스토 (원본 627-632) ──
export const MANIFESTO = {
  img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2400&auto=format&fit=crop',
  heading: '교육의 효과를, 이제 숫자로 증명합니다.',
};

// ── References — 고객사 CI 무한 롤링(마퀴) ──
// 실제 CI 이미지 수급 전에는 사명 텍스트 로고 칩(placeholder)으로 노출한다.
// 이미지 경로 규칙: /public/logos/{순번}.png (수급 후 파일만 추가·매핑하면 교체).
// ▶ 단일 배열: 아래 REF_LOGOS에 사명을 추가하기만 하면 롤링에 자동 반영된다.
export const REF_LOGO_BASE = '/logos';
// 목록 정본: HRD사업팀 「KEESS_고객사 레퍼런스 정리260806.xlsx」 (2026-08-06) — 순번 순서·표기 그대로. 임의 교정 금지.
export const REF_LOGOS: string[] = [
  '농협', '저축은행중앙회', 'KG그룹', '신용협동조합', '신협중앙회',
  '한국공인중개사협회', 'KG모빌리티', '한국교직원공제회', '한국교육방송공사(EBS)', '수협은행',
  '하이케어솔루션', '미래엔', '동국제약', '모아주택산업', '교보증권',
  '한국해양진흥공사', 'SM그룹', '아주대학교의료원', '더케이저축은행', 'BNK금융그룹',
  '삼성생명', '씨젠의료재단', '산업연구원', '전북은행', '인천공항시설관리',
  '독립기념관', '대한소화기내시경학회', '다우데이타', '한일시멘트', '교보DTS',
  '서흥', '한국투자증권', '동원그룹', 'CJ', '롯데지주',
  '아주그룹', 'LS그룹', '웅진', 'KB금융그룹', '신한은행',
  '우리은행', '포스코', '벽산', '금호석유화학', 'Haatz',
  '도레이첨단소재', 'SK증권', 'IBK투자증권', '한샘', '미래에셋',
  '롯데카드', '한화생명', 'KB증권', 'KB국민은행', 'KB카드',
];

export const REFERENCES = {
  eyebrow: 'References',
  title: '국내의 수많은 기업들이 저희와 함께 해오고 있습니다.',
  cap: '레퍼런스·사례 (노출 협의 기준)',
};

// ── 인증 (원본 658-669) ──
export const CERTS = {
  eyebrow: '정부지원 · 인증',
  title: '정부가 인증하고, 보안으로 지킵니다.',
  items: [
    { main: '정부 3년 인증 훈련기관', small: '2026.01 ~ 2028.12' },
    { main: 'ISMS', small: '정보보호 관리체계 인증' },
    { main: '국무총리 표창', small: '정부 표창' },
    { main: '고용노동부장관 표창', small: '정부 표창' },
  ],
};

// ── FAQ (원본 672-684) ──
export interface FaqItem {
  type: string;
  qn: string;
  qt: string;
  a: string;
  acta?: { label: string; href: string };
}
export const FAQ_TABS = [
  { type: '1', label: '교육 도입' },
  { type: '2', label: '교육과정' },
  { type: '3', label: 'LMS·운영' },
  { type: '4', label: '비용·지원' },
  { type: '5', label: 'KG에듀원 강점' },
];
export const FAQ = {
  eyebrow: 'FAQ · 자주 묻는 질문',
  title: '궁금한 점을 미리 확인하세요.',
  sub: '도입 전 담당자가 가장 많이 묻는 질문을 모았습니다.<br>더 궁금한 점은 바로 문의해 주세요.',
  foot: '필요한 답을 못 찾으셨나요?',
  items: [
    { type: '1', qn: 'Q01', qt: 'KG에듀원에서는 어떤 기업교육 서비스를 제공하나요?', a: '온라인 기업교육을 콘텐츠부터 운영까지 한 곳에서 지원합니다. AI·AX, 직무, 리더십, 법정의무, OA, 어학 과정에 기업 맞춤 제작과 LMS 운영을 더합니다.' },
    { type: '1', qn: 'Q02', qt: '우리 회사도 온라인 기업교육을 도입할 수 있나요?', a: '규모나 업종과 무관하게 도입할 수 있습니다. 소규모 기업부터 중견·대기업, 공공기관까지 운영해 왔고, 목적과 예산에 맞춰 방안을 제안해 드립니다.' },
    { type: '1', qn: 'Q03', qt: '우리 회사에 맞는 교육과정을 추천받을 수 있나요?', a: '네. 업종·직무·직급·목적을 확인해 맞는 과정을 추천해 드립니다. 필요하시면 연간 교육체계와 로드맵까지 함께 설계해 드립니다.', acta: { label: '맞춤 추천 상담', href: '#inq' } },
    { type: '1', qn: 'Q04', qt: 'KG에듀원의 교육 운영 절차는 어떻게 되나요?', a: '상담 → 과정 제안 → 계약 → 개설 → 운영 → 결과 리포트 순으로 진행됩니다. 전담 운영 담당자가 시작부터 종료까지 함께합니다.' },
    { type: '1', qn: 'Q05', qt: '교육과정 리스트를 받아볼 수 있나요?', a: '네. 아래로 문의를 남겨 주시면 최신 전체 과정 리스트를 보내드립니다.', acta: { label: '과정 리스트 요청', href: '#inq' } },
    { type: '2', qn: 'Q06', qt: '어떤 교육 콘텐츠를 운영하고 있나요?', a: 'AI·AX, DX, 직무, 리더십, 법정의무, OA, 어학, ESG, 인문·교양까지 8,400여 개 과정을 운영합니다.' },
    { type: '2', qn: 'Q07', qt: 'AI·AX 교육도 운영하나요?', a: '네. 생성형 AI 활용, ChatGPT 업무 적용, AI 업무 생산성 등 최신 과정을 운영합니다. 조직 진단을 바탕으로 현업에 맞는 AI 활용 과정을 설계해 드립니다.' },
    { type: '2', qn: 'Q08', qt: '법정의무교육도 함께 운영할 수 있나요?', a: '네. 성희롱 예방, 개인정보보호, 장애인 인식개선, 퇴직연금 등을 온라인으로 운영합니다. 매년 새 시리즈로 제작해 이수율과 몰입을 높입니다.' },
    { type: '2', qn: 'Q09', qt: '직급별 또는 직무별 교육도 가능한가요?', a: '가능합니다. 신입부터 팀장·관리자까지 직급별 과정과 영업·기획·생산·서비스 등 직무별 체계를 제공합니다.' },
    { type: '2', qn: 'Q10', qt: '우리 회사 맞춤형 교육 콘텐츠도 제작할 수 있나요?', a: '가능합니다. 조직문화·업무 프로세스·사내 규정을 반영해 맞춤 콘텐츠를 제작합니다. 자체 스튜디오와 AI 제작으로 기획부터 제작까지 직접 진행합니다.', acta: { label: '맞춤 제작 문의', href: '#inq' } },
    { type: '3', qn: 'Q11', qt: '기업 전용 LMS도 제공하나요?', a: '네. 운영·진도 관리·시험·설문·수료 관리를 지원하는 기업 전용 LMS를 제공합니다.' },
    { type: '3', qn: 'Q12', qt: '교육 진행 현황을 확인할 수 있나요?', a: '네. 관리자 페이지에서 진도·수료율·시험·설문 결과를 실시간으로 확인할 수 있습니다.' },
    { type: '3', qn: 'Q13', qt: 'PC와 모바일 모두 수강할 수 있나요?', a: '네. PC와 모바일 어디서든 수강할 수 있고, 기기를 바꿔도 이어보기가 됩니다.' },
    { type: '3', qn: 'Q14', qt: '교육 종료 후 수료증 발급이 가능한가요?', a: '네. 수료 기준을 충족하면 과정 종료 시점에 온라인으로 수료증을 발급받을 수 있습니다.' },
    { type: '4', qn: 'Q15', qt: '기업교육 비용은 어떻게 산정되나요?', a: '교육 인원·과정 수·운영 방식에 따라 맞춤 견적으로 안내해 드립니다. 상담을 남겨 주시면 예산에 맞는 운영 방안을 제안해 드립니다.', acta: { label: '견적 상담', href: '#inq' } },
    { type: '4', qn: 'Q16', qt: '사업주훈련 과정과 일반 교육과정의 차이는 무엇인가요?', a: '사업주훈련은 기준을 충족하면 제도에 따라 훈련비를 지원받을 수 있는 과정입니다. 일반 과정은 지원과 무관하게 자유롭게 운영합니다. 지원 대상·기준은 관련 법령과 제도에 따라 달라질 수 있습니다.' },
    { type: '4', qn: 'Q17', qt: '사업주훈련은 어떻게 신청하나요?', a: '상담 후 과정 선정 → 일정 협의 → 서류 제출 순으로 진행됩니다. 필요한 행정 절차는 담당 컨설턴트가 안내해 드립니다.' },
    { type: '4', qn: 'Q18', qt: '교육 종료 후 지원 절차도 안내받을 수 있나요?', a: '네. 교육 운영뿐 아니라 지원 관련 절차까지 안내해, 담당자의 행정 부담을 덜어 드립니다.' },
    { type: '5', qn: 'Q19', qt: '온라인 기업교육의 장점은 무엇인가요?', a: '시간과 장소에 매이지 않고 운영할 수 있고, 학습 이력과 수료 현황을 한눈에 관리할 수 있습니다. 집합교육보다 운영 부담과 비용이 적어 더 많은 임직원에게 교육을 제공할 수 있습니다.' },
    { type: '5', qn: 'Q20', qt: '왜 KG에듀원을 선택해야 하나요?', a: '콘텐츠, 맞춤 설계, LMS 운영, 학습관리, 성과 분석까지 한 곳에서 지원합니다. 8,400여 개 과정과 자체 제작 역량, 전담 운영으로 기업의 인재 성장을 함께합니다.', acta: { label: '도입 문의', href: '#inq' } },
  ] as FaqItem[],
};

// ── 문의 #inq (원본 686-731) ──
export const INQ = {
  side: {
    lead: '교육 도입, 진단부터 상담해 드립니다.',
    sub: '기업·기관 교육 도입 문의를 남겨 주시면, 담당자가 영업일 기준 1일 내 회신드립니다. 제안서·요건 자료가 있으시면 첨부해 주세요.',
    trust: ['정부 3년 인증', 'ISMS', '동시접속 2만 운영'],
  },
  // 이메일 도메인 프리셋 — A안 정본 1:1 (순서 고정)
  emailDomains: ['naver.com', 'gmail.com', 'hanmail.net', 'daum.net', 'kakao.com', 'nate.com'],
  // 회사 규모 (임직원 수) — 선택 · A안 정본 1:1
  companySizes: [
    { value: 'lt50', label: '50인 미만' },
    { value: '50-300', label: '50~300인 미만' },
    { value: '300-1000', label: '300~1,000인 미만' },
    { value: 'gte1000', label: '1,000인 이상' },
  ],
  // 예상 교육인원 — 선택 · A안 정본 1:1 (회사 규모와 별도 필드)
  trainees: [
    { value: 'none', label: '해당없음' },
    { value: 'lte50', label: '~ 50명' },
    { value: 'lte100', label: '~ 100명' },
    { value: 'lte500', label: '~ 500명' },
    { value: 'lte1000', label: '~ 1000명' },
    { value: 'gt1000', label: '~ 1000명 이상' },
  ],
  // 관심 영역(선택·다중) — 6칩. value는 A안과 동일 유지, 4번째 라벨만 '콘텐츠 제작·도입'으로 변경
  // 6번째 '정부 지원'은 /kium(인재키움프리미엄) 도입에 따른 추가 (기술명세서 최종 v2.0 §4)
  interests: [
    { value: 'ax-ai', label: 'AX·AI 전환' },
    { value: 'leadership', label: '리더십·조직' },
    { value: 'hrd', label: 'HRD 통합 솔루션' },
    { value: 'content', label: '콘텐츠 제작·도입' },
    { value: 'compliance', label: '법정 필수' },
    { value: 'gov', label: '정부 지원' },
  ],
  // '정부 지원' 선택 시에만 노출되는 세부 분야 칩 (v3.0 §2-1 지정 라벨 — 임의 변경 금지).
  // 값 = 라벨 그대로. 제출 시 별도 필드를 만들지 않고 관심 영역 'gov' 값에 병합한다.
  interestSubs: {
    parent: 'gov',
    parentLabel: '정부 지원',
    options: ['인재키움', '아카이브', 'AI기초', '내일배움카드'],
  },
  success: {
    title: '상담 신청이 접수되었습니다.',
    msg: '담당자가 영업일 기준 1일 내 회신드립니다.',
  },
};
