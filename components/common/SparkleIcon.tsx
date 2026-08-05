/**
 * GNB 이벤트 칩 아이콘 — 자체 인라인 SVG 3D풍 스파클 (기술명세서 upgrade-03 §2-1)
 *
 * 외부 래스터·아이콘 라이브러리를 쓰지 않는다(무료 자산의 출처표기 의무·소형 스케일 품질 저하).
 * 색은 전부 기존 mesh 토큰(#7C3AED → #C4B5FD)과 브랜드 퍼플(#2E1A6B)의 재조합이며 신규 색은 없다.
 *
 * 구성: 4-point 스파클(본체) + 우상단 미니 스파클,
 *       좌상단 화이트 40% 하이라이트 / 하단 #2E1A6B 20% 셰이드로 유사 입체감.
 *
 * 장식 요소이므로 aria-hidden — 의미는 칩의 "인재키움 프리미엄" 텍스트가 전달한다.
 *
 * gradient id는 페이지에 칩이 2개(데스크톱 nav + 모바일 메뉴) 렌더되므로 접미어로 분리한다.
 */
export default function SparkleIcon({ idSuffix = '' }: { idSuffix?: string }) {
  const gid = `spk-g${idSuffix}`;
  const sid = `spk-s${idSuffix}`;
  return (
    <svg
      className="spark"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gid} x1="2" y1="2" x2="13" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#C4B5FD" />
        </linearGradient>
        <linearGradient id={sid} x1="11" y1="1.5" x2="15" y2="5.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4B5FD" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      {/* 본체 4-point 스파클 */}
      <path
        d="M6.6 1.5c.15-.5.85-.5 1 0l.86 2.9a3.4 3.4 0 0 0 2.24 2.24l2.9.86c.5.15.5.85 0 1l-2.9.86a3.4 3.4 0 0 0-2.24 2.24l-.86 2.9c-.15.5-.85.5-1 0l-.86-2.9a3.4 3.4 0 0 0-2.24-2.24l-2.9-.86c-.5-.15-.5-.85 0-1l2.9-.86A3.4 3.4 0 0 0 5.74 4.4z"
        fill={`url(#${gid})`}
      />
      {/* 하단 셰이드 — #2E1A6B 20% */}
      <path
        d="M7.1 10.6a3.4 3.4 0 0 0-1.36-1.36l-2.9-.86c-.5-.15-.5-.85 0-1l.2-.06c1.9 1.3 3.5 3.1 4.36 5.24l-.16.54c-.15.5-.85.5-1 0z"
        fill="#2E1A6B"
        opacity=".2"
      />
      {/* 좌상단 하이라이트 — 화이트 40% */}
      <path
        d="M6.75 2.6 6.2 4.45A3.9 3.9 0 0 1 4.4 6.25l-1.85.55"
        stroke="#fff"
        strokeOpacity=".4"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* 우상단 미니 스파클 */}
      <path
        d="M12.9 1.2c.07-.24.4-.24.47 0l.3 1.02c.1.33.36.59.69.69l1.02.3c.24.07.24.4 0 .47l-1.02.3c-.33.1-.59.36-.69.69l-.3 1.02c-.07.24-.4.24-.47 0l-.3-1.02a1.15 1.15 0 0 0-.69-.69l-1.02-.3c-.24-.07-.24-.4 0-.47l1.02-.3c.33-.1.59-.36.69-.69z"
        fill={`url(#${sid})`}
      />
    </svg>
  );
}
