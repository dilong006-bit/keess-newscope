// P1 AX·AI 전환 — 카피/데이터 verbatim (keess_P1_AXAI_D_scenario_v7 · D 확정)
// 색·버튼변형은 이식하지 않음. 단계 색조는 --p1 파생(color-mix)만 사용.

export const HERO = {
  tag: 'End-to-End Partner',
  img: '/images/p1-hero.jpg',
  h1Lead: 'AI를 배우는 데서 멈추지 않습니다.',
  h1Emph: '일하는 방식을 바꿉니다.',
  sub: '진단부터 성과 창출까지, 맞춤형 교육과 실행을 연결하는 KG에듀원 End-to-End 기업 AX Transformation Partner.',
  cta: '교육 상담',
  strip: ['AI 성숙도 진단', 'AX Framework 5단계', 'End-to-End 5 Step', '사전-사후 성과 리포트'],
  floats: [
    { count: 5, label: 'AX Framework 단계' },
    { count: 8, label: '직무 Skill Matrix' },
  ],
  vlabel: { t: '진단 → 설계 → 학습 → 실행 → 성과', s: '데이터로 연결하는 전사 AX 전환 여정' },
};

export const BENTO = {
  eyebrow: 'AX 전환 교육',
  hero: {
    bk: 'End-to-End AX Transformation Partner',
    h3: ['교육이 아니라,', '전환을 설계합니다.'],
    p: '진단부터 성과 창출까지 하나로 연결합니다.',
    mini: ['진단', '설계', '학습', '실행', '성과'],
  },
  cards: [
    { icon: 'search', ok: '진단', h4: '현 위치부터 데이터로', p: '조직 AX 수준·직무 활용도·데이터 성숙도 진단.' },
    { icon: 'bar', ok: '설계', h4: '직무에 맞게 그립니다', p: 'AX Framework·직무별 Skill Map으로 설계.' },
    { icon: 'learn', ok: '학습', h4: '실전 중심 학습 경험', p: '시나리오 기반 학습·블렌디드 러닝으로 체득.' },
    { icon: 'gear', ok: '실행', h4: '현업 프로젝트로 체득', p: '실전 PBL·Agent 실습·현업 혁신 과제 적용.' },
    { icon: 'rise', ok: '성과', h4: '측정하고 확산합니다', p: '생산성·활용도 측정 후 조직 전체로 확산.' },
  ],
  stat: [
    { count: 5, unit: '단계', label: 'AX Framework 역량 체계' },
    { count: 8, unit: '직무', label: 'AI Skill Matrix' },
    { count: 5, unit: 'Step', label: 'End-to-End 전환 서비스' },
  ],
};

export const SCENARIO = {
  eyebrow: '목표별 맞춤 경로',
  title: '어떤 목표로 오셨나요?',
  sub: '조직의 목표를 선택하면, 가장 적합한 AX 교육 경로를 안내합니다.',
  opts: [
    { key: 'diag', badge: '추천', text: '잘 모르겠다면, 진단부터.' },
    { key: 'quick', text: '빠르게 실무 AI 역량을 확보하고 싶어요.' },
    { key: 'data', text: '현업 데이터로 문제를 해결하고 싶어요.' },
    { key: 'roadmap', text: '전사 AX 로드맵을 설계·확산하고 싶어요.' },
  ] as { key: string; badge?: string; text: string }[],
};

export const SCEN: Record<string, { k: string; t: string; p: string; chips: string[]; cta: string }> = {
  diag: { k: '추천 경로', t: '잘 모르겠다면, 진단부터.', p: 'AI 성숙도 진단으로 조직의 현 위치를 데이터로 파악하고, 가장 적합한 출발점을 함께 찾습니다.', chips: ['조직 AX 수준 진단', 'AX 역량 Gap 분석', '우선 육성 과제'], cta: '진단 상담받기' },
  quick: { k: '빠른 실무 적용', t: '바로 쓰는 실무 AI 역량을, 빠르게.', p: 'AI 리터러시부터 직무별 AI 활용까지, 현업에 곧장 적용할 수 있는 실무 역량을 빠르게 끌어올립니다.', chips: ['AI 리터러시 공통', 'AI 생산성 혁신가', '직무별 AI 활용'], cta: '실무 과정 상담받기' },
  data: { k: '현업 문제 해결', t: '현업 데이터로, 진짜 솔루션을.', p: '사내 과제와 데이터로 실전 PBL·Agent 실습을 운영해, 실제 업무에 적용 가능한 AI 포트폴리오를 만듭니다.', chips: ['시나리오 PBL', 'Agent 구축 실습', '현업 혁신 과제'], cta: '프로젝트형 상담받기' },
  roadmap: { k: '전사 AX 로드맵', t: '전사 역량 체계를, 문화로.', p: 'AX Framework 5단계로 전사 AX 역량 체계를 설계하고, 성과 측정·확산까지 연결합니다.', chips: ['AX Framework 5단계', '조직 확산 전략', 'AX 성과 리포트'], cta: '전사 로드맵 상담받기' },
};

export const STEP5 = {
  eyebrow: 'KG에듀원 AX Transformation Service',
  title: '진단부터 성과까지, End-to-End 5 Step',
  sub: '조직의 AX 수준을 진단하고, 맞춤형 설계부터 현업 실행·성과 측정까지 단계별로 연결합니다.',
  steps: [
    { k: 'STEP 1', n: '1', title: 'AI·데이터 활용 수준 진단', items: ['조직 AX 수준 진단', '직무별 AI 활용도 진단', '데이터 활용 성숙도 진단', 'AX 역량 Gap 분석'], deliver: ['AX 역량 진단 리포트', '조직별 우선 육성 과제'] },
    { k: 'STEP 2', n: '2', title: '기업 맞춤형 AX 역량 설계', items: ['직군별 AX 역량 정의', 'AI 활용 업무 분석', '직무별 AX Skill Map 설계', '교육 로드맵 설계'], deliver: ['AX Skill Framework', '직무별 학습 로드맵'] },
    { k: 'STEP 3', n: '3', title: '실전 중심 학습 경험 제공', items: ['AI 기반 실습', '시나리오 기반 PBL', '블렌디드 러닝', 'Agent 구축 실습'], deliver: ['조직 맞춤형 AI 포트폴리오'] },
    { k: 'STEP 4', n: '4', title: '성과 창출 중심 실행', items: ['현업 문제 해결 프로젝트', 'AI 업무 혁신 과제 수행', '부서별 AX 사례 발굴', 'AI 활용 우수사례 공유'], deliver: ['AX 혁신 과제 결과물', '우수사례·인사이트'] },
    { k: 'STEP 5', n: '5', title: '성과 측정 및 확산', items: ['업무 생산성 측정', '활용도 분석', '조직 확산 전략 수립'], deliver: ['AX 성과 리포트'] },
  ],
};

export const FRAMEWORK = {
  eyebrow: 'KG에듀원 AX Framework',
  title: 'AI 활용부터 혁신 리딩까지, 5단계 역량 체계',
  sub: '생산성 향상·직무 적용·업무 자동화·조직 혁신으로 확장하도록 설계된 AX 역량 모델입니다.\n단계마다 길러야 할 역량 영역이 다릅니다.',
  dxTitle: '이런 고민이라면, 이 단계부터 시작하세요',
  dxChips: [
    { dx: 1, text: '내 직무에 AI가 필요한지 모르겠어요' },
    { dx: 2, text: 'AI를 쓰는데 결과가 아쉬워요' },
    { dx: 3, text: 'AI를 써도 업무가 줄지 않아요' },
    { dx: 4, text: 'AI가 직원처럼 일했으면 해요' },
    { dx: 5, text: '새로운 혁신·가치를 만들고 싶어요' },
  ],
  // 계단 높이는 시안 유지, 배경은 --p1 파생(color-mix)로 라이트→다크
  stages: [
    { stage: 1, lv: 'Lv1', name: 'AI 리터러시 공통', h: 112, mix: 40 },
    { stage: 2, lv: 'Lv2', name: 'AI 생산성 혁신가', h: 142, mix: 55 },
    { stage: 3, lv: 'Lv3', name: 'AI 실무 적용 전문가', h: 172, mix: 70 },
    { stage: 4, lv: 'Lv4', name: 'AI 자동화 설계자', h: 202, mix: 85 },
    { stage: 5, lv: 'Lv5', name: 'AX 혁신 리더', h: 232, mix: 100 },
  ],
};

export const FW: Record<number, { d: string; areas: { n: string; caps: [string, string][] }[] }> = {
  1: { d: '<b>AI 리터러시 공통</b> · 생성형 AI 기본 개념과 활용·윤리·보안으로 전사 공통 기반을 갖춥니다.', areas: [
    { n: 'AI 이해 및 활용', caps: [['AI 기초 이해', '기본'], ['생성형 AI 활용', '심화'], ['AI 정보검색 및 리서치', '응용']] },
    { n: 'AI 활용 기술', caps: [['프롬프트 설계', '심화']] },
    { n: 'AI 윤리 및 보안', caps: [['AI 윤리', '기본'], ['AI 보안', '기본'], ['AI 결과 검증 및 평가', '응용']] }] },
  2: { d: '<b>AI 생산성 혁신가</b> · 문서·콘텐츠·정보 분석·협업에 AI를 적용해 개인 생산성을 끌어올립니다.', areas: [
    { n: '문서·콘텐츠 생산성', caps: [['AI 문서 작성', '기본'], ['AI 프레젠테이션 제작', '기본'], ['AI 콘텐츠 제작', '응용']] },
    { n: '정보 탐색 및 분석', caps: [['AI 리서치', '심화']] },
    { n: '협업 및 커뮤니케이션', caps: [['AI 회의 활용', '응용'], ['AI 커뮤니케이션', '응용']] }] },
  3: { d: '<b>AI 실무 적용 전문가</b> · 직무 워크플로우와 데이터에 AI를 심어 현업 솔루션을 도출합니다.', areas: [
    { n: '직무별 AI 활용', caps: [['AI 마케팅', '심화'], ['AI 영업', '심화'], ['AI 인사관리', '심화'], ['AI 교육설계', '심화']] },
    { n: '고객·서비스 혁신', caps: [['AI 고객경험 관리', '응용']] },
    { n: '데이터 분석·활용', caps: [['AI 데이터 분석', '심화'], ['비즈니스 데이터 분석', '응용']] },
    { n: '데이터 기반 의사소통', caps: [['데이터 스토리텔링', '응용']] }] },
  4: { d: '<b>AI 자동화 설계자</b> · 자동화와 AI Agent로 업무 프로세스를 재설계합니다.', areas: [
    { n: '업무 자동화', caps: [['노코드 자동화', '심화'], ['업무 프로세스 자동화', '응용']] },
    { n: 'AI 에이전트 구축', caps: [['AI 에이전트 활용', '기본'], ['AI 에이전트 설계', '심화'], ['멀티 에이전트 협업', '응용']] },
    { n: '시스템 연계·확장', caps: [['RPA 연계 활용', '응용']] },
    { n: '프로세스 혁신', caps: [['업무 프로세스 최적화', '응용']] }] },
  5: { d: '<b>AX 혁신 리더</b> · 전략·거버넌스·변화관리로 AI를 조직 문화·경영으로 정착시킵니다.', areas: [
    { n: 'AX 전략·거버넌스', caps: [['AX 리더십', '기본'], ['AI 거버넌스', '심화'], ['AX 전략 수립', '응용']] },
    { n: '조직 변화관리', caps: [['AI 활용 조직문화 구축', '기본'], ['AI 변화관리', '심화'], ['AI 조직 설계', '응용']] },
    { n: '데이터 기반 경영', caps: [['데이터 기반 문제해결', '기본'], ['AI 기반 의사결정', '응용']] },
    { n: '디지털·비즈니스 혁신', caps: [['디지털 전환', '심화'], ['AI 비즈니스 혁신', '응용']] }] },
};

export const LV_CLASS: Record<string, string> = { 기본: 'b1', 심화: 'b2', 응용: 'b3' };

export const JOBS = {
  eyebrow: '직무별 한눈에 보기',
  title: '우리 직무는 단계별로 무엇을 하나요?',
  sub: '먼저 포지셔닝 맵에서 직무의 AI 활용 위치를 확인하고, 직무를 선택하면 AX 5단계별 역량을 한눈에 볼 수 있습니다.',
  note: '* 단계별 역량은 직무 적용 예시이며, AI 성숙도 진단 후 조직 맞춤으로 확정됩니다.',
  qLabels: { yTop: '비즈니스 혁신 ↑', yBot: '↓ 업무 생산성', xLeft: 'AI 활용', xRight: 'AI 구축·개발' },
  quads: [
    { cls: 'qq-tl', label: '활용 · 혁신' },
    { cls: 'qq-tr', label: '구축 · 혁신' },
    { cls: 'qq-bl', label: '활용 · 생산성' },
    { cls: 'qq-br', label: '구축 · 생산성' },
  ],
};

export const JOBLV: Record<string, string[]> = {
  '전략/기획': ['AI 기초·리서치 이해', '보고서·자료 자동 작성', '마켓 인텔리전스·데이터 분석', '분석 파이프라인 자동화', 'AI 기반 의사결정·전략 수립'],
  '경영지원/관리': ['AI 기초·보안 이해', '문서·규정 자동 작성', '비용·계약 데이터 분석', '행정 프로세스·챗봇 자동화', 'AI 기반 운영 거버넌스'],
  '인사(HR)': ['AI 기초·윤리 이해', '공고·평가 문서 자동화', '채용·조직 데이터 분석', 'HR 응답 챗봇·설문 자동화', 'AI 기반 인재·조직 설계'],
  '생산/제조': ['AI 기초 이해', '점검·작업 리포트 자동화', '공정·품질 데이터 분석', '수율 예측·설비 자동화', 'AI 기반 생산 혁신'],
  '영업/CS': ['AI 기초·프롬프트 이해', '미팅 녹취·제안서 초안', '고객 데이터 분석·맞춤 제안', '응대 챗봇·콜드메일 자동화', 'AI 기반 영업·CX 혁신'],
  '연구(R&D)': ['AI 기초·리서치 이해', '문헌·특허 요약 자동화', '실험 데이터 분석·시각화', '연구 파이프라인 자동화', 'AI 기반 R&D 전략'],
  '개발/IT': ['AI 기초·프롬프트 이해', '코드·문서 작성 보조', '로그·데이터 분석·리팩토링', 'AI Agent·워크플로우 설계', 'AI 기반 아키텍처·기술 전략'],
  '마케팅': ['AI 기초·생성형 이해', 'SNS 카피·콘텐츠 자동 생성', '캠페인 분석·A/B 최적화', '고객여정 자동화 설계', 'AI 기반 브랜드 경험 전략'],
};

export const STAGE_NAMES = ['AI 리터러시', 'AI 생산성', 'AI 실무 적용', 'AI 자동화', 'AX 혁신 리더'];
// 단계 색조: --p1 파생(라이트→다크) — 신규 hex 없이 color-mix
export const STAGE_MIX = [42, 58, 72, 86, 100];
export const JOBPOS: Record<string, [number, number]> = {
  '전략/기획': [35, 82], '마케팅': [30, 66], '영업/CS': [27, 40], '인사(HR)': [43, 50],
  '경영지원/관리': [24, 28], '생산/제조': [58, 33], '연구(R&D)': [68, 72], '개발/IT': [82, 60],
};

export const WHY = {
  eyebrow: '무엇이 다른가',
  title: '대체 불가능한 AX 교육은 기준부터 다릅니다.',
  head: ['기준', '일반 AI 교육', 'KG에듀원 AX'],
  rows: [
    ['시작', '진단 없이 과정부터 시작', 'AI 성숙도 진단으로 현 위치부터'],
    ['설계', '기존 커리큘럼 재사용', '직무별 Skill Map 맞춤 설계'],
    ['강사', '유명세·고정 강사 위주', '검증된 강사 + 컨설턴트 공동 설계'],
    ['결과물', '수료증 발급', 'AI 포트폴리오·AX 성과 리포트(산출물)'],
    ['성과', '만족도 설문', '사전-사후 GAP 정량 증명'],
  ],
};

export const GAP = {
  eyebrow: '성과 증거',
  title: '교육 효과를 숫자로 보고합니다.',
  boxTitle: '사전-사후 GAP 분석',
  rows: [
    { label: 'AI 활용 역량', pre: 42, post: 86 },
    { label: '현업 적용도', pre: 35, post: 78 },
    { label: '업무 생산성', pre: 48, post: 82 },
  ],
  cap: '* 개념 도식, 실제 수치는 AX 성과 리포트로 제공됩니다.',
};

export const COURSES = {
  eyebrow: '과정 라인업',
  title: '입문부터 실무·자격까지',
  items: [
    { badge: '입문', title: '선을 넘는 AI, 선을 긋는 인간', img: '/images/course1.jpg' },
    { badge: '활용', title: '미드저니와 캡컷으로 완성하는 시네마틱 AI 영상 제작 바이블', img: '/images/course2.jpg' },
    { badge: '실무', title: '[리더의 AI 워크북] 배치하라-팀 최적화 6단계 프롬프팅', img: '/images/course3.jpg' },
    { badge: '심화', title: '[구글 올인원 AI] 아날로그 업무 현장, AI 자동화로 시스템 구축하기', img: '/images/course4.jpg' },
    { badge: '일잘러', title: '[AI Class] 일잘러 장피엠과 ChatGPT 업무 300% 활용하기', img: '/images/course5.jpg' },
    { badge: '자격', title: '[AI Class] 노코드 RAG 끝판왕, 노트북LM으로 지식관리 마스터하기', img: '/images/course6.jpg' },
  ],
};

export const FINAL = {
  title: 'AX, 진단부터 시작하세요.',
  sub: '조직 상황에 맞는 AX 전환 여정을 함께 설계해 드립니다.',
  cta: '교육 상담',
};

// 상담/가이드 모달 필드
export const SUBNAV = [
  // 첫 항목 = 히어로 직후 최상단 콘텐츠 섹션 (형제 페이지 #pain·#arch·#ax1과 동일 규칙, C1)
  // 라벨은 해당 섹션의 확정 eyebrow(BENTO.eyebrow) 그대로 사용 — 신규 카피 없음
  { id: 'offer', label: 'AX 전환 교육' },
  { id: 'scenario', label: '목표 경로' },
  { id: 'service', label: '5 Step' },
  { id: 'framework', label: 'Framework' },
  { id: 'jobs', label: '직무맵' },
  { id: 'why', label: '차별성' },
  { id: 'proof', label: '성과' },
  { id: 'courses', label: '과정' },
  { id: 'inq', label: '문의' },
];
