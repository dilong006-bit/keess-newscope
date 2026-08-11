// KEESS 인재키움프리미엄 — 과정 데이터 (KIUM_COURSES)
// 생성: 2026-08-05 · 소스: HRDK 신청원본 xlsx(시트2·3, 260804) + 과정개요서(260731)
// 규칙: 본 파일의 수치·문안은 소스 문서 외 수정 금지(기술명세서 최종 v2.0 6장)
//
// [modules 출처 전환 · 260811] 교육구성 표(modules)의 출처를 신청서 XLSX 시트3
// (교과목/단원(과제명)/편성시간)에서 **과정개요서 PDF의 「교육구성」 표**(영역/주요 학습내용/시간)로
// 교체했다. 근거: ref/kium/spec/KEESS_kium_교육구성_개요서전환_기술명세서_v1.0_260811.md
//   · 19개 과정 전건 · 88행 → 86행 (#1·#2·#3 각 −1행, #11 +1행, 나머지 15건 동일)
//   · 과정별 시간 합계는 공식 훈련시간(14/7/6H)과 19건 전건 일치 — 변동 없음
//   · 교체 전 XLSX 유래 modules 원본은 ref/kium/build/data.ts에 그대로 보존돼 있다(대조·롤백용).
//     그래서 이 파일에 죽은 상수로 중복 보관하지 않는다.

export type KiumCategory = 'onboarding'|'roleup'|'leadership'|'executive'|'ai'|'common'

export type KiumCourse = {
  id: string; category: KiumCategory; subCategory: string
  titleMarketing: string; titleOfficial: string
  target: string; hours: number; days: number
  type: '일반형' | 'AI융합형'; capacity: number; schedule: string; delivery: string
  summary: string; slogan: string; goals: string[]
  highlights: { no: string; title: string; desc: string }[]
  modules: { area: string; content: string; hours: number }[]
  /** 썸네일 이미지 자산 경로. 값이 있으면 이미지 모드, 없으면(undefined) 텍스트 모드로 렌더링된다. */
  thumbSrc?: string
}

export const KIUM_CATEGORY_META: Record<KiumCategory, { label: string; order: number }> = {
  onboarding: { label: '신입·온보딩', order: 1 },
  roleup:     { label: '승진자', order: 2 },
  leadership: { label: '리더십', order: 3 },
  executive:  { label: '임원', order: 4 },
  ai:         { label: 'AI 실무역량', order: 5 },
  common:     { label: '공통 직무역량', order: 6 },
}

export const KIUM_COURSES: KiumCourse[] = 
[
  {
    "id": "kium-01",
    // [샘플] 디자인 참조용 Unsplash 썸네일 — 실제 자산 입고 시 교체, 미입고 시 오픈 전 이 줄 삭제
    "thumbSrc": "/images/kium/kium-01.sample.jpg",
    "category": "onboarding",
    "subCategory": "신입사원",
    "titleMarketing": "신입사원 On-Syncing 온보딩 과정",
    "titleOfficial": "신입사원 On-Syncing 과정",
    "target": "신입사원",
    "hours": 14,
    "days": 2,
    "type": "일반형",
    "capacity": 30,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "신입사원이 조직에 빠르게 적응하고 직무 역량을 갖추도록 설계된 통합 온보딩 프로그램",
    "slogan": "입사 초기 적응부터 실무 몰입과 미래 성장까지 연결하는 통합 온보딩 과정",
    "goals": [
      "신입사원의 조직 이해도 및 안정감 향상",
      "직무 기본 역량 습득 및 자신감 강화",
      "팀 내 관계 형성 및 조직 소속감 강화",
      "성장 및 경력개발을 위한 로드맵 수립",
      "생성형 AI 도구 활용을 통한 업무 능력 향상"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "조직 연결",
        "desc": "핵심가치·비전을 통해 조직 이해와 소속감 형성"
      },
      {
        "no": "02",
        "title": "실무 적용",
        "desc": "업무 기본기·관계 형성·자기관리 역량을 통합적으로 강화"
      },
      {
        "no": "03",
        "title": "미래 성장",
        "desc": "AI 활용과 셀프리더십을 통해 자기주도적 성장 기반 마련"
      }
    ],
    "modules": [
      {
        "area": "조직 이해",
        "content": "조직 가치 및 비전 내재화, 경영 시뮬레이션",
        "hours": 2
      },
      {
        "area": "업무 역량",
        "content": "기획·보고서 작성, 비즈니스 매너, OA/프레젠테이션",
        "hours": 3
      },
      {
        "area": "관계 형성",
        "content": "소통/감정 리터러시, 커뮤니케이션",
        "hours": 3
      },
      {
        "area": "자기 관리",
        "content": "셀프 리더십, 강점 발견, 스트레스 관리",
        "hours": 3
      },
      {
        "area": "AI 역량",
        "content": "AI 리터러시, AI 실무 및 활용 실습",
        "hours": 3
      }
    ]
  },
  {
    "id": "kium-02",
    // [샘플] 디자인 참조용 Unsplash 썸네일 — 실제 자산 입고 시 교체, 미입고 시 오픈 전 이 줄 삭제
    "thumbSrc": "/images/kium/kium-02.sample.jpg",
    "category": "onboarding",
    "subCategory": "신입사원",
    "titleMarketing": "경력 신입사원 On-Performing 온보딩 과정",
    "titleOfficial": "경력신입 On-Performing 과정",
    "target": "경력 신입사원",
    "hours": 14,
    "days": 2,
    "type": "일반형",
    "capacity": 30,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "경력입사자가 새로운 조직에 빠르게 적응하고, 강점을 발휘해 성과로 연결하는 온보딩 과정",
    "slogan": "경력직의 조직 적응과 관계 형성을 넘어 실무 성과 창출로 직결되는 경력 맞춤 온보딩 과정",
    "goals": [
      "경력사원의 자기 역할 이해 및 새로운 환경에 주도적으로 적응하도록 독려",
      "새로운 조직의 업무 역할과 프로세스 이해",
      "다양한 갈등상황 이해 및 문제해결 방법 학습",
      "업무 수행에 필요한 역량을 강화하여 장기적인 경력개발 계획 수립"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "역할 정렬",
        "desc": "강점과 기대 역할을 점검하고 조직의 업무방식 이해"
      },
      {
        "no": "02",
        "title": "관계 구축",
        "desc": "핵심 네트워크 형성 및 협업 역량 강화"
      },
      {
        "no": "03",
        "title": "성과 전환",
        "desc": "업무 우선순위 설정 및 초기 성장계획 수립"
      }
    ],
    "modules": [
      {
        "area": "자기 이해",
        "content": "자기 진단(강점 및 역량), 기대 역할 인식",
        "hours": 2
      },
      {
        "area": "조직 이해",
        "content": "핵심 가치, 문화 및 업무 프로세스",
        "hours": 3
      },
      {
        "area": "관계 형성",
        "content": "인적 네트워크 이해 및 형성 전략 수립",
        "hours": 3
      },
      {
        "area": "갈등 관리",
        "content": "갈등 유형 이해 및 해결 방법 학습/실습",
        "hours": 3
      },
      {
        "area": "성과 목표 수립",
        "content": "업무 프레임 분석, 우선순위 결정 실습",
        "hours": 3
      }
    ]
  },
  {
    "id": "kium-03",
    // [샘플] 디자인 참조용 Unsplash 썸네일 — 실제 자산 입고 시 교체, 미입고 시 오픈 전 이 줄 삭제
    "thumbSrc": "/images/kium/kium-03.sample.jpg",
    "category": "onboarding",
    "subCategory": "신입사원",
    "titleMarketing": "On-Powering 리텐션 과정",
    "titleOfficial": "리텐션 On-Powering 과정",
    "target": "1~5년차 사원",
    "hours": 14,
    "days": 2,
    "type": "일반형",
    "capacity": 30,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "직장 생활 속에서 마주하는 스트레스와 고민들을 건강하게 극복하고, 조직에 대한 자발적 몰입을 강화하는 맞춤형 리텐션 과정",
    "slogan": "연차별 고민을 회복과 성장의 동력으로 전환하는 맞춤형 리텐션 과정",
    "goals": [
      "조직에서 자신의 역할을 명확하게 인식",
      "조직과 업무에 대한 개인의 적응 상태 점검",
      "조직 내에서 자신의 성장 방향성을 설정하고 동기부여를 강화",
      "조직 몰입도 향상 및 중장기 커리어 로드맵 설계"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "진단",
        "desc": "1·3·5년차별 스트레스 요인과 성장과제 진단"
      },
      {
        "no": "02",
        "title": "회복",
        "desc": "예술 활동을 통한 부정 감정 해소와 에너지 회복"
      },
      {
        "no": "03",
        "title": "성장",
        "desc": "강점 기반의 역할 및 커리어 성장 방향 설계"
      }
    ],
    "modules": [
      {
        "area": "자기 성찰",
        "content": "연차별 조직 경험 돌아보기, 성장 과제 인식",
        "hours": 2
      },
      {
        "area": "스트레스 관리",
        "content": "직무 스트레스 및 감정 상태 진단 활동",
        "hours": 3
      },
      {
        "area": "에너지 회복",
        "content": "예술 활동을 통한 감정 해소와 에너지 회복",
        "hours": 3
      },
      {
        "area": "의미 재발견",
        "content": "일의 의미 탐색, 연차별 관계와 역할 확장",
        "hours": 3
      },
      {
        "area": "성장 방향 설계",
        "content": "강점 기반 커리어·역할 성장 로드맵 수립",
        "hours": 3
      }
    ]
  },
  {
    "id": "kium-04",
    "category": "leadership",
    "subCategory": "리더십",
    "titleMarketing": "진단 기반 팀장 리더십 Re-Lead 과정",
    "titleOfficial": "Next Leadership: 팀장리더십 Re-Lead 과정",
    "target": "팀장급 리더",
    "hours": 14,
    "days": 2,
    "type": "일반형",
    "capacity": 20,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "팀장 역할과 리더십 스타일을 진단하고, 사람·갈등·성과를 이끄는 리더십을 강화하는 과정",
    "slogan": "진단을 통해 우리 조직의 리더십 이슈를 발견하고, 팀장의 현업 실행방안까지 설계하는 과정",
    "goals": [
      "팀장의 역할을 명확히 인식하고 리더로서의 정체성 확립",
      "상황에 따라 구성원을 효율적으로 이끄는 리더십 스킬 함양",
      "팀 내 갈등을 효과적으로 관리",
      "명확한 목표 설정과 체계적인 성과 관리를 통한 팀의 성과 극대화",
      "전략적 사고를 통해 변화하는 환경에 대응하는 역량 강화"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "사전진단",
        "desc": "팀장의 역할 수행 수준과 조직 내 주요 리더십 이슈 파악"
      },
      {
        "no": "02",
        "title": "맞춤설계",
        "desc": "진단 결과를 바탕으로 핵심 모듈·사례 및 실습 맞춤구성"
      },
      {
        "no": "03",
        "title": "현업적용",
        "desc": "실제 팀 운영 상황을 활용한 토의·실습 및 실행방안 도출"
      }
    ],
    "modules": [
      {
        "area": "역할 재정립",
        "content": "팀장 역할과 책임 인식, 기대 리더상 도출",
        "hours": 2
      },
      {
        "area": "구성원 관리",
        "content": "다양성 이해, 동기부여, 소통 및 코칭 피드백",
        "hours": 3
      },
      {
        "area": "팀 운영",
        "content": "신뢰·심리적 안전감, 협업 촉진, 갈등 관리",
        "hours": 3
      },
      {
        "area": "성과 창출",
        "content": "목표설정, 업무지시 및 점검, 성과평가 면담",
        "hours": 3
      },
      {
        "area": "변화 주도",
        "content": "변화관리, 전략적 사고, 문제해결 의사결정",
        "hours": 3
      }
    ]
  },
  {
    "id": "kium-05",
    "category": "roleup",
    "subCategory": "승진자 과정",
    "titleMarketing": "승진자 과정 Role Up [사원~대리]",
    "titleOfficial": "Role Up(승진자): 사원~대리",
    "target": "승진자 (사원 및 대리급)",
    "hours": 14,
    "days": 2,
    "type": "일반형",
    "capacity": 40,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "숙련된 실무자로서 업무의 전문성과 주도성을 발휘하여 업무를 리딩하는 '셀프 리더'로서의 역량을 강화하는 과정",
    "slogan": "주어진 업무에 반응하는 실무자를 넘어 주도적으로 실행하는 셀프리더로 성장하는 과정",
    "goals": [
      "승진으로 변화된 역할과 책임을 명확히 이해",
      "새로운 역할 수행을 위한 업무 프레임 재정립",
      "현업에 즉시 적용 가능한 역량을 갖춤으로써 일의 효율성 증대"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "역할 인식",
        "desc": "승진으로 달라진 역할과 책임을 인식하고 셀프리더로서의 정체성과 가치관 정립"
      },
      {
        "no": "02",
        "title": "역량 강화",
        "desc": "AI·Work·People 영역을 중심으로 주도적인 업무수행에 필요한 핵심 역량 강화"
      },
      {
        "no": "03",
        "title": "실행 전환",
        "desc": "학습내용을 실제 업무와 연결하여 업무 효율화 및 자기성장을 위한 실행계획 수립"
      }
    ],
    "modules": [
      {
        "area": "역할 인식",
        "content": "셀프 리더의 R&R, 역할의 변화 이해 및 가치관 정립",
        "hours": 2
      },
      {
        "area": "AI 역량",
        "content": "생성형 AI를 활용한 업무자동화",
        "hours": 3
      },
      {
        "area": "업무 역량",
        "content": "시간 및 업무 관리, 자기주도적 업무수행",
        "hours": 3
      },
      {
        "area": "소통 역량",
        "content": "커뮤니케이션 및 협업 역량 강화",
        "hours": 3
      },
      {
        "area": "실행 계획",
        "content": "잡 크래프팅을 통한 업무 가치와 성장계획 수립",
        "hours": 3
      }
    ]
  },
  {
    "id": "kium-06",
    "category": "roleup",
    "subCategory": "승진자 과정",
    "titleMarketing": "승진자 과정 Role Up [과장~차장]",
    "titleOfficial": "Role Up(승진자): 과장~차장",
    "target": "승진자 (과장 및 차장급)",
    "hours": 14,
    "days": 2,
    "type": "일반형",
    "capacity": 30,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "팀의 중간 관리자로서 상·하를 연결하는 소통의 매개체이자 실무 전문가인 '브릿지 리더'로서의 역량을 강화하는 과정",
    "slogan": "개인 성과자를 넘어 조직의 업무와 사람을 연결하는 브릿지 리더로 성장하는 과정",
    "goals": [
      "승진으로 변화된 역할과 책임을 명확히 이해",
      "새로운 역할 수행을 위한 업무 프레임 재정립",
      "현업에 즉시 적용 가능한 역량을 갖춤으로써 일의 효율성 증대"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "역할 인식",
        "desc": "승진으로 달라진 역할과 책임을 인식하고 상·하를 연결하는 브릿지 리더의 정체성 확립"
      },
      {
        "no": "02",
        "title": "역량 강화",
        "desc": "AI·Work·People 영역을 중심으로 업무 조율과 관계 연결에 필요한 핵심 역량 강화"
      },
      {
        "no": "03",
        "title": "실행 전환",
        "desc": "학습내용을 실제 조직 상황과 연결하여 협업 촉진과 후배 육성을 위한 현업 실천계획 수립"
      }
    ],
    "modules": [
      {
        "area": "역할 인식",
        "content": "브릿지 리더의 R&R, 역할의 변화 이해 및 가치관 정립",
        "hours": 2
      },
      {
        "area": "AI 역량",
        "content": "생성형 AI를 활용한 업무 고도화",
        "hours": 3
      },
      {
        "area": "업무 역량",
        "content": "문제해결 및 프로젝트 관리 역량 강화",
        "hours": 3
      },
      {
        "area": "육성 역량",
        "content": "후배 육성을 위한 코칭·피드백 학습 및 실습",
        "hours": 3
      },
      {
        "area": "실행 계획",
        "content": "중간관리자의 역할 수행을 위한 현업 실천계획 수립",
        "hours": 3
      }
    ]
  },
  {
    "id": "kium-07",
    "category": "roleup",
    "subCategory": "승진자 과정",
    "titleMarketing": "승진자 과정 Role Up [부장]",
    "titleOfficial": "Role Up(승진자): 부장",
    "target": "승진자 (부장급)",
    "hours": 14,
    "days": 2,
    "type": "일반형",
    "capacity": 30,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "차기 리더 또는 팀 내 시니어로서 팀의 리더를 도와 후배를 육성하는 '임파워링 리더'로서의 역량을 강화하는 과정",
    "slogan": "실무 전문가를 넘어 조직의 방향을 제시하고 사람의 성장을 이끄는 임파워링 리더로 도약하는 과정",
    "goals": [
      "승진으로 변화된 역할과 책임을 명확히 이해",
      "새로운 역할 수행을 위한 업무 프레임 재정립",
      "현업에 즉시 적용 가능한 역량을 갖춤으로써 일의 효율성 증대"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "역할 인식",
        "desc": "차기 리더이자 팀 내 시니어로서 조직의 방향과 사람의 성장을 이끄는 역할 정립"
      },
      {
        "no": "02",
        "title": "역량 강화",
        "desc": "AI·Work·People 영역을 중심으로 전략적 판단과 성과·변화관리 핵심 역량 강화"
      },
      {
        "no": "03",
        "title": "실행 전환",
        "desc": "학습내용을 조직의 실제 과제와 연결하여 성과 창출과 후배 육성을 위한 리더십 실행계획 수립"
      }
    ],
    "modules": [
      {
        "area": "역할 인식",
        "content": "임파워링 리더의 R&R. 업무 패러다임 전환 및 역할 정립",
        "hours": 2
      },
      {
        "area": "AI 역량",
        "content": "생성형 AI를 활용한 전략적 의사결정",
        "hours": 3
      },
      {
        "area": "성과 관리",
        "content": "목표·성과관리 및 효과적 의사결정 역량 강화",
        "hours": 3
      },
      {
        "area": "변화 리더십",
        "content": "세대공감, 변화관리, 협상·설득 역량 강화",
        "hours": 3
      },
      {
        "area": "실행 계획",
        "content": "조직의 방향과 후배 육성을 위한 리더십 실행계획 수립",
        "hours": 3
      }
    ]
  },
  {
    "id": "kium-08",
    "category": "executive",
    "subCategory": "임원교육",
    "titleMarketing": "임원 역량개발 과정",
    "titleOfficial": "임원 역량개발 과정",
    "target": "신임 임원 및 기존 임원. 임원 승진을 앞둔 예비경영자",
    "hours": 7,
    "days": 1,
    "type": "일반형",
    "capacity": 50,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "경영자로서 갖춰야 할 임원의 R&R 학습 및 핵심역량을 강화하는 과정",
    "slogan": "조직의 방향을 제시하고 성과를 이끄는 경영자로 전환하는 임원 역량개발 과정",
    "goals": [
      "임원이 경영을 올바르게 이해하고 경영자로서 수행해야 할 R&R 인식",
      "임원이 갖춰야 할 핵심역량을 진단하고 강점과 약점 파악",
      "임원 리더십의 구성요소와 자신의 리더십 유형을 이해하고 올바르게 구사"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "역할 정립",
        "desc": "임원의 정체성과 R&R을 이해하고 핵심가치와 업(業)에 대한 관점 확립"
      },
      {
        "no": "02",
        "title": "핵심 역량 진단",
        "desc": "개인별 경영역량과 리더십 수준을 진단하고 강점·보완영역 및 개발 방향 도출"
      },
      {
        "no": "03",
        "title": "성과 실행 연결",
        "desc": "업무·사람 관점의 리더십과 성과관리 방법을 학습하고 현업 Action Plan 수립"
      }
    ],
    "modules": [
      {
        "area": "정체성, 핵심 가치",
        "content": "임원의 R&R, 비전·핵심가치, 업(業) 이해",
        "hours": 1
      },
      {
        "area": "핵심 역량",
        "content": "개인별 핵심 역량 진단, 강·약점 분석 및 적용사례 학습",
        "hours": 2
      },
      {
        "area": "리더십",
        "content": "업무·사람 관점의 리더십과 최신 리더십 동향",
        "hours": 2
      },
      {
        "area": "성과관리",
        "content": "효과적인 조직과 성과관리 코칭",
        "hours": 2
      }
    ]
  },
  {
    "id": "kium-09",
    "category": "ai",
    "subCategory": "AI 활용",
    "titleMarketing": "업무효율화: Agent 과정",
    "titleOfficial": "AI 실무역량강화_업무효율화 Track_Agent 과정",
    "target": "전체 임직원",
    "hours": 14,
    "days": 2,
    "type": "AI융합형",
    "capacity": 25,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "생성형 AI를 활용하여 업무의 효율화 및 자동화 구축을 목적으로 단계별 학습을 제공하는 과정",
    "slogan": "개인의 업무를 지원하는 AI 비서와 자동화 프로세스를 직접 구축하는 과정",
    "goals": [
      "생성형 AI의 기본개념과 활용 트렌드 이해",
      "업무 효율화를 위한 AI 활용방법 이해",
      "현업 AI 적용방법 이해 및 RPAI 기반의 고도화된 업무 자동화 구축"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "기본기 확보",
        "desc": "AI 기본 원리와 활용 유의점을 이해하고 효과적인 프롬프트 활용역량 확보"
      },
      {
        "no": "02",
        "title": "AI 비서 구축",
        "desc": "실제 업무를 분석하여 업무 맞춤형 AI 챗봇 직접 제작"
      },
      {
        "no": "03",
        "title": "자동화 구현",
        "desc": "RPAI를 활용해 AI Agent가 판단·실행하는 업무자동화 워크플로우 구현"
      }
    ],
    "modules": [
      {
        "area": "AI 리터러시",
        "content": "최신 AI 트렌드, 윤리·보안, 프롬프트 원리",
        "hours": 2
      },
      {
        "area": "업무 효율화 실습",
        "content": "문서 작성·요약, 데이터 분석 및 시각화",
        "hours": 3
      },
      {
        "area": "AI 챗봇 제작",
        "content": "업무 맞춤형 프롬프트 설계 및 챗봇 구현",
        "hours": 3
      },
      {
        "area": "자동화 설계",
        "content": "AI 연동 업무 자동화 개념 및 워크플로우 설계",
        "hours": 3
      },
      {
        "area": "자동화 구현",
        "content": "RPAI 기반 업무 자동화 프로젝트 실습",
        "hours": 3
      }
    ]
  },
  {
    "id": "kium-10",
    "category": "ai",
    "subCategory": "AI 활용",
    "titleMarketing": "업무효율화: Data 과정",
    "titleOfficial": "AI 실무역량강화_업무효율화 Track_Data 과정",
    "target": "전체 임직원",
    "hours": 14,
    "days": 2,
    "type": "AI융합형",
    "capacity": 25,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "생성형 AI를 활용하여 데이터를 분석하고, 데이터 분석 자동화를 목적으로 단계별 학습을 제공하는 과정",
    "slogan": "데이터 기반 문제해결부터 AI Agent를 활용한 분석 자동화까지 구현하는 실전 과정",
    "goals": [
      "데이터 분석의 기본 개념 이해와 실무 데이터 분석 역량 함양",
      "업무 효율화를 위한 AI 활용방법 이해",
      "현업 AI 적용방법 이해 및 데이터분석 자동화 프로세스 구축"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "데이터 이해",
        "desc": "데이터 리터러시를 바탕으로 현업 문제를 데이터 관점에서 정의"
      },
      {
        "no": "02",
        "title": "분석·시각화",
        "desc": "실무 데이터의 수집·전처리·분석을 통해 의사결정에 필요한 인사이트 도출"
      },
      {
        "no": "03",
        "title": "분석 자동화",
        "desc": "AI Agent와 자동화 도구를 연계하여 반복적인 데이터 분석 워크플로우 구축"
      }
    ],
    "modules": [
      {
        "area": "데이터 리터러시",
        "content": "데이터 기본 개념과 데이터 기반 문제 정의",
        "hours": 2
      },
      {
        "area": "데이터 수집·전처리",
        "content": "실무 데이터 수집, 정제 및 구조화 실습",
        "hours": 3
      },
      {
        "area": "데이터 분석·시각화",
        "content": "데이터 분석 시각화를 통한 인사이트 도출",
        "hours": 3
      },
      {
        "area": "자동화 설계",
        "content": "데이터 분석 업무의 워크플로우 분석 및 설계",
        "hours": 3
      },
      {
        "area": "자동화 구현",
        "content": "AI Agent 기반 데이터 분석 자동화 구축 실습",
        "hours": 3
      }
    ]
  },
  {
    "id": "kium-11",
    "category": "ai",
    "subCategory": "AI 활용",
    "titleMarketing": "AI 직무전문화 과정",
    "titleOfficial": "AI 실무역량강화_직무전문화 Track_AI 직무 특화 과정",
    "target": "전체 임직원",
    "hours": 14,
    "days": 2,
    "type": "AI융합형",
    "capacity": 25,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "직무 단위에서 필요한 업무 유형 및 현업 과제를 중심으로 AI 활용 교육 및 해커톤 실습으로 구성된 과정",
    "slogan": "직무별 현업과제를 AI 맞춤화 솔루션으로 구현하는 과정",
    "goals": [
      "직무 및 업무별 워크플로우 분석",
      "AI 적용을 통한 자동화 프로세스 구축"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "직무 맞춤화",
        "desc": "직무별 AI 스킬 매트릭스를 기반으로 핵심역량과 현업 적용과제 도출"
      },
      {
        "no": "02",
        "title": "워크플로우 혁신",
        "desc": "실제 업무 프로세스를 분석하여 AI 적용 영역과 자동화 솔루션 설계"
      },
      {
        "no": "03",
        "title": "솔루션 구현",
        "desc": "세미 해커톤과 해커톤을 통해 프로토타입부터 실제 현업 솔루션까지 구현"
      }
    ],
    "modules": [
      {
        "area": "직무역량 진단",
        "content": "직무별 AI 핵심 역량 이해 및 활용계획 수립",
        "hours": 2
      },
      {
        "area": "워크플로우 분석",
        "content": "업무 프로세스 분석 및 AI 적용 가능 영역 발굴",
        "hours": 3
      },
      {
        "area": "솔루션 설계",
        "content": "직무별 AI 활용 시나리오와 자동화 프로세스 설계",
        "hours": 3
      },
      {
        "area": "세미 해커톤",
        "content": "현업과제 아이디에이션 및 프로토타입 도출",
        "hours": 3
      },
      {
        "area": "해커톤",
        "content": "AI 솔루션 구현·검증 및 현업 적용방안 수립",
        "hours": 3
      }
    ]
  },
  {
    "id": "kium-12",
    "category": "common",
    "subCategory": "비즈니스 역량",
    "titleMarketing": "전략적 비즈니스 협상 스킬 과정",
    "titleOfficial": "전략적 비즈니스 협상 스킬",
    "target": "전체 임직원",
    "hours": 7,
    "days": 1,
    "type": "일반형",
    "capacity": 30,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "협상의 핵심 원리와 전략을 익히고, 실전 시뮬레이션으로 Win-Win 합의를 이끄는 과정",
    "slogan": "협상 전략 수립부터 실전 시뮬레이션까지 경험하며 Win-Win 협상 역량을 체득하는 과정",
    "goals": [
      "협상의 기본 개념과 프로세스를 이해하여 현업에 적용",
      "협상을 위해 필요한 전술 및 역량 습득",
      "협상 상황에 맞는 리더십 발휘"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "스타일 진단",
        "desc": "나의 협상 스타일과 강·약점을 진단하고 협상 상황별 대응 특성 파악"
      },
      {
        "no": "02",
        "title": "전략 수립",
        "desc": "BATNA·ZOPA 등 핵심 개념과 사례를 바탕으로 Win-Win 협상 전략 및 계획 수립"
      },
      {
        "no": "03",
        "title": "시뮬레이션",
        "desc": "실제 협상 상황 기반 협상 수행과 결과·과정 피드백을 통해 현업 적용력 강화"
      }
    ],
    "modules": [
      {
        "area": "기본 이해",
        "content": "협상의 구성요소와 유형, 전략 이해",
        "hours": 1
      },
      {
        "area": "협상 탐구",
        "content": "성공적인 협상가의 특징 탐구 및 진단 실습",
        "hours": 2
      },
      {
        "area": "사례 학습",
        "content": "협상에 대한 사례 탐구 및 계획 수립 실습",
        "hours": 2
      },
      {
        "area": "시뮬레이션",
        "content": "협상 시뮬레이션 및 결과 도출, 피드백",
        "hours": 2
      }
    ]
  },
  {
    "id": "kium-13",
    "category": "common",
    "subCategory": "비즈니스 역량",
    "titleMarketing": "스피치&프레젠테이션 클리닉 과정",
    "titleOfficial": "스피치&프레젠테이션 클리닉",
    "target": "전체 임직원",
    "hours": 14,
    "days": 2,
    "type": "일반형",
    "capacity": 30,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "스피치 습관을 진단하고 음성·비언어·내용 구성 역량을 강화해 설득력을 높이는 과정",
    "slogan": "개별 밀착 클리닉으로 스피치 습관을 개선하고, 나만의 강점을 극대화하는 실전 스피치 과정",
    "goals": [
      "일상에서 자주 사용하는 언어 습관을 점검하고 설득력 있는 표현방식 향상",
      "자신의 현재 스피치 수준을 객관적으로 점검하고 개선영역 구체화",
      "음성, 비언어, 내용구성의 3가지 요소 학습"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "영상 진단",
        "desc": "1분 스피치 시연과 모니터링을 통해 개인별 강점·보완점과 훈련 방향 도출"
      },
      {
        "no": "02",
        "title": "집중 훈련",
        "desc": "음성·비언어·콘텐츠 구성의 3대 스킬을 개인별 개선 포인트에 맞춰 반복 훈련"
      },
      {
        "no": "03",
        "title": "시연·코칭",
        "desc": "Final Speech 촬영과 개인별 피드백을 통해 변화 정도를 확인하고 실전 전달력 완성"
      }
    ],
    "modules": [
      {
        "area": "수준 진단",
        "content": "1분 시연을 통한 개인별 스피치 수준 진단",
        "hours": 2
      },
      {
        "area": "음성 스킬",
        "content": "호흡과 발성 훈련, 말의 전달력 강화 훈련",
        "hours": 3
      },
      {
        "area": "비언어 스킬",
        "content": "시선 처리와 자세, 동선 처리, 제스처 훈련",
        "hours": 3
      },
      {
        "area": "언어 스킬",
        "content": "스피치 핵심 메시지 정리, 스피치 구조화",
        "hours": 3
      },
      {
        "area": "스피치 완성",
        "content": "개인별 스피치 시연 코칭",
        "hours": 3
      }
    ]
  },
  {
    "id": "kium-14",
    "category": "common",
    "subCategory": "비즈니스 역량",
    "titleMarketing": "인정받는 직장인의 구두보고 스킬",
    "titleOfficial": "인정받는 직장인의 구두보고 스킬",
    "target": "전체 임직원",
    "hours": 7,
    "days": 1,
    "type": "일반형",
    "capacity": 30,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "자신의 보고 습관을 진단하고, 보고의 기본부터 상황/상사 스타일별 기법을 습득하여 효과적인 구두 보고자로 성장하는 과정",
    "slogan": "상황과 상사의 스타일을 읽어 핵심을 빠르고 명확하게 전달하는 실전 구두보고 과정",
    "goals": [
      "보고의 핵심 흐름과 구조를 이해하여 효율적으로 자료를 준비하는 역량 강화",
      "상황에 맞는 맞춤형 보고 전략 수립 역량 강화",
      "구두보고 시나리오를 통해 실전 감각 익히기"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "보고 점검",
        "desc": "실제 업무지시 상황을 통해 나의 보고 습관과 개선점 확인"
      },
      {
        "no": "02",
        "title": "맞춤 전략",
        "desc": "중간·문제·정보보고의 상황별 기법과 상사의 커뮤니케이션 스타일별 보고 전략 습득"
      },
      {
        "no": "03",
        "title": "시나리오 실전",
        "desc": "핵심을 구조화한 6단계 보고 시나리오를 작성하고 실전 구두보고 및 피드백 진행"
      }
    ],
    "modules": [
      {
        "area": "실력 점검하기",
        "content": "보고 습관 진단 및 개선방향 설정",
        "hours": 1
      },
      {
        "area": "기본 다지기",
        "content": "보고의 기본 원칙과 핵심 요소 이해",
        "hours": 1
      },
      {
        "area": "스킬 익히기",
        "content": "보고 유형별 맞춤 기법 습득 (중간보고 – 문제보고 – 정보보고)",
        "hours": 1
      },
      {
        "area": "유형 파악하기",
        "content": "성격 유형 및 상사 스타일에 따른 보고 방법과 기술 습득",
        "hours": 2
      },
      {
        "area": "시나리오 실습",
        "content": "시나리오 실습 및 피드백",
        "hours": 2
      }
    ]
  },
  {
    "id": "kium-15",
    "category": "common",
    "subCategory": "커뮤니케이션",
    "titleMarketing": "AI 시대, 감성 지능 소통역량",
    "titleOfficial": "AI시대 감성 지능 소통역량",
    "target": "전체 임직원",
    "hours": 7,
    "days": 1,
    "type": "일반형",
    "capacity": 30,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "감성지능을 진단하고 5가지 감성 요소를 강화해 공감과 신뢰의 소통 역량을 높이는 과정",
    "slogan": "나의 감성을 이해하고 조절하여 신뢰와 공감을 만드는 감성 소통역량을 강화하는 과정",
    "goals": [
      "개인의 감성지능지수(EQ) 수준을 진단",
      "타인과의 관계에서 감성 소통의 개념과 중요성 이해",
      "5가지 감성지능지수 향상을 통한 커뮤니케이션 심화 전략 습득"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "EQ 진단",
        "desc": "감성지능 5대 요소를 진단하여 개인별 강점과 보완영역 파악"
      },
      {
        "no": "02",
        "title": "감성 활용",
        "desc": "자기인식·자기조절·감정이입 등 개인별 감성지능 향상전략 수립"
      },
      {
        "no": "03",
        "title": "표현 훈련",
        "desc": "개인 사례와 문제상황을 활용하여 감정을 효과적으로 표현하는 감성 대화법 실습"
      }
    ],
    "modules": [
      {
        "area": "이해하기",
        "content": "감성의 개념과 감성 커뮤니케이션 이해",
        "hours": 1
      },
      {
        "area": "인지하기",
        "content": "감성지능지수(EQ) 진단 및 자기분석",
        "hours": 2
      },
      {
        "area": "활용하기",
        "content": "감성지능 향상 전략 이해와 활용",
        "hours": 2
      },
      {
        "area": "표현하기",
        "content": "감성 커뮤니케이션 실전훈련 및 심화 전략",
        "hours": 2
      }
    ]
  },
  {
    "id": "kium-16",
    "category": "common",
    "subCategory": "커뮤니케이션",
    "titleMarketing": "AI 시대, 사람을 움직이는 공감 대화의 기술",
    "titleOfficial": "AI 시대, 사람을 움직이는 공감 대화의 기술",
    "target": "전체 임직원",
    "hours": 7,
    "days": 1,
    "type": "일반형",
    "capacity": 30,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "AI 시대에 더욱 소중해진 인간의 감정과 공감 능력을 개발하여 공감 소통 리더로 성장하는 과정",
    "slogan": "AI 시대 더욱 중요해진 감정과 공감의 힘을 실제 대화기술로 전환하는 실전 소통 과정",
    "goals": [
      "감정을 다루고 신뢰를 만드는 매개체로서 공감 언어의 기술 습득",
      "나의 생각을 표현하고 상대의 생각을 파악하는 역량 강화",
      "감성지능(EQ)와 공감역량(EI)를 실제 대화에 녹여낼 수 있는 방법 학습"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "공감기반 이해",
        "desc": "AI와 차별화되는 인간 고유의 감성·공감 역량을 이해하고 신뢰 형성의 원리 학습"
      },
      {
        "no": "02",
        "title": "NVC 모델 체득",
        "desc": "관찰→느낌→욕구→부탁의 비폭력대화 4단계 구조를 단계별로 연습"
      },
      {
        "no": "03",
        "title": "상황 적용",
        "desc": "일상 및 갈등 상황을 활용하여 상대의 마음을 읽고 표현하는 공감대화 실습"
      }
    ],
    "modules": [
      {
        "area": "고유 가치 이해",
        "content": "AI와 다른 인간의 감성과 공감 역량 이해",
        "hours": 1
      },
      {
        "area": "공감 지능 이해",
        "content": "감성지능과 공감지능 이해",
        "hours": 2
      },
      {
        "area": "기법 학습",
        "content": "비폭력 대화모델 구조 이해 및 표현 연습",
        "hours": 2
      },
      {
        "area": "적용 실습",
        "content": "시나리오 기반 공감대화 적용 실습",
        "hours": 2
      }
    ]
  },
  {
    "id": "kium-17",
    "category": "common",
    "subCategory": "조직활성화",
    "titleMarketing": "세대와 직급별 소통 백과사전",
    "titleOfficial": "세대와 직급별 소통 백과사전",
    "target": "전체 임직원",
    "hours": 6,
    "days": 1,
    "type": "일반형",
    "capacity": 100,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "세대·직급별 소통 차이를 이해하고, 심리적 안전감 속에서 함께 성장하는 문화를 만드는 과정",
    "slogan": "세대와 직급의 차이를 이해하는 데서 끝나지 않고 우리 조직의 소통 행동원칙까지 도출하는 과정",
    "goals": [
      "조직 내 세대 및 직급별 차이를 인식하고 효과적인 소통 방식을 습득",
      "강점을 기반으로 '심리적 안전감'을 확보하여 함께 성장하는 조직 구성"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "유형 진단",
        "desc": "소통유형 진단을 통해 나와 타인의 소통유형을 이해하고 유형별 특징과 대응전략 파악"
      },
      {
        "no": "02",
        "title": "관점 전환",
        "desc": "직급별 실제 갈등상황을 재구성하여 상대 계층의 입장과 감정을 직접 경험"
      },
      {
        "no": "03",
        "title": "행동원칙 도출",
        "desc": "심리적 안전감의 핵심요소를 바탕으로 우리 조직의 상호존중·소통 행동원칙 수립"
      }
    ],
    "modules": [
      {
        "area": "유형 진단",
        "content": "소통 유형 진단, 유형별 특징과 대응 전략 모색",
        "hours": 2
      },
      {
        "area": "조직문화 이해",
        "content": "직급별 상황 재구성 및 워크숍",
        "hours": 2
      },
      {
        "area": "심리적 안전감 만들기",
        "content": "다양한 사례 탐구, 우리 조직 행동원칙 수립",
        "hours": 2
      }
    ]
  },
  {
    "id": "kium-18",
    "category": "leadership",
    "subCategory": "현장 관리자",
    "titleMarketing": "현장 플레잉 코치 과정",
    "titleOfficial": "현장 플레잉 코치 과정",
    "target": "전체 임직원",
    "hours": 7,
    "days": 1,
    "type": "일반형",
    "capacity": 30,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "현장 플레잉 코치로서의 역할을 정립하고, 필요한 역량을 학습하여 현장 리더로서의 역량을 강화하기 위한 과정",
    "slogan": "현장 리더의 역할과 실전 코칭 역량을 강화하는 플레잉 코치 과정",
    "goals": [
      "리더로서의 역할 및 정체성을 확립하고, 현장 플레잉 코치로서 실행 가능한 리더십 개발",
      "구성원의 성장과 역량 강화를 이끌어내는 코칭과 피드백 능력 향상",
      "조직의 협업과 신뢰를 강화하는 소통 및 갈등 관리 역량 확보",
      "팀의 성과 극대화를 위한 업무 효율화 방안 모색"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "현장 진단",
        "desc": "현장 리더 경험과 업무추진 스타일을 진단하여 나의 역할과 리더십 행동 점검"
      },
      {
        "no": "02",
        "title": "실전 연습",
        "desc": "실제 코칭·갈등 사례를 활용한 Role Play와 피드백으로 현장 대응력 강화"
      },
      {
        "no": "03",
        "title": "실행 전환",
        "desc": "업무습관을 점검하고 시작·계속·조정할 행동계획 수립"
      }
    ],
    "modules": [
      {
        "area": "역할 정립",
        "content": "리더십 경험 공유, 역할 정립 토론",
        "hours": 1
      },
      {
        "area": "역량 강화",
        "content": "실전 코칭 프로세스 적용 연습",
        "hours": 2
      },
      {
        "area": "협업/갈등관리",
        "content": "협업 및 갈등관리 실행 전략 모색",
        "hours": 2
      },
      {
        "area": "업무 효율화",
        "content": "업무 효율화 사례연구 실습",
        "hours": 2
      }
    ]
  },
  {
    "id": "kium-19",
    "category": "common",
    "subCategory": "민원응대",
    "titleMarketing": "CS 종합 솔루션 과정",
    "titleOfficial": "CS 종합 솔루션",
    "target": "전체 임직원",
    "hours": 6,
    "days": 1,
    "type": "일반형",
    "capacity": 100,
    "schedule": "연중상시",
    "delivery": "대면·실시간 비대면",
    "summary": "고객경험(CX)을 진단하고, AI 시대에 맞는 서비스 전략으로 고객 만족도를 높이는 과정",
    "slogan": "우리 기관의 고객경험을 진단하고 AI를 활용한 민원서비스 혁신방안을 직접 설계하는 과정",
    "goals": [
      "민원응대 서비스에서 이미지메이킹의 필요성에 대해 이해",
      "효과적인 이미지메이킹을 위한 언어적/비언어적 스킬 습득",
      "AI 시대 공공서비스 환경과 고객의 변화 이해",
      "우리 기관의 CX 현황을 진단하여 서비스 전략 수립"
    ],
    "highlights": [
      {
        "no": "01",
        "title": "CX 진단",
        "desc": "우리 기관의 고객경험을 점검하고 민원서비스의 주요 Pain Point 발굴"
      },
      {
        "no": "02",
        "title": "AI 기회 탐색",
        "desc": "반복업무와 고객접점을 분석하여 AI를 활용할 수 있는 서비스 개선영역 도출"
      },
      {
        "no": "03",
        "title": "혁신안 설계",
        "desc": "우리 기관의 미래 고객경험을 설계하고 차별화된 민원서비스 혁신 아이디어 구체화"
      }
    ],
    "modules": [
      {
        "area": "서비스 접점 이해",
        "content": "민원응대 이미지·태도와 고객경험(CX)의 중요성 이해",
        "hours": 2
      },
      {
        "area": "CX 현황 진단",
        "content": "우리 기관 고객경험 진단, Pain Point 및 AI 활용 가능영역 탐색",
        "hours": 2
      },
      {
        "area": "CX 혁신 설계",
        "content": "To-Be 고객경험 설계, AI 활용 민원서비스 개선 및 차별화 아이디어 도출",
        "hours": 2
      }
    ]
  }
]
