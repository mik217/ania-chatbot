// Maskotka Ani: ilustracja SVG. nastroj: 'wita' | 'mysli'
export default function AniaAvatar({ rozmiar = 40, nastroj = 'wita' }) {
  return (
    <svg
      className={`ania-avatar ania-${nastroj}`}
      width={rozmiar}
      height={rozmiar}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Ania, asystentka AI"
    >
      <circle cx="32" cy="32" r="32" fill="#FFE3D3" />
      {/* włosy */}
      <path d="M14 36c0-12 8-20 18-20s18 8 18 20c0 6-2 11-4 14H18c-2-3-4-8-4-14z" fill="#7A3E26" />
      {/* twarz */}
      <ellipse cx="32" cy="37" rx="13" ry="14" fill="#FFD2B3" />
      {/* grzywka */}
      <path d="M19 33c3-7 9-10 13-10s11 2 13 10c-5-3-9-4-13-4s-9 1-13 4z" fill="#7A3E26" />
      {/* czapka kucharska */}
      <path d="M18 22c-4-1-6-5-4-8 2-3 6-4 8-2 1-5 5-7 10-7s9 2 10 7c2-2 6-1 8 2 2 3 0 7-4 8v4H18z" fill="#fff" stroke="#F0D9CB" strokeWidth="1" />
      <rect x="18" y="23" width="28" height="5" rx="1.5" fill="#fff" stroke="#F0D9CB" strokeWidth="1" />
      {/* oczy */}
      {nastroj === 'mysli' ? (
        <g fill="#3A2A22">
          <circle cx="27" cy="36" r="1.8" />
          <circle cx="37.5" cy="35" r="1.8" />
        </g>
      ) : (
        <g stroke="#3A2A22" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M24.5 37c1.2-1.6 3.6-1.6 4.8 0" />
          <path d="M34.7 37c1.2-1.6 3.6-1.6 4.8 0" />
        </g>
      )}
      {/* policzki */}
      <circle cx="23.5" cy="42" r="2.4" fill="#F7A99A" opacity=".7" />
      <circle cx="40.5" cy="42" r="2.4" fill="#F7A99A" opacity=".7" />
      {/* usta */}
      {nastroj === 'mysli' ? (
        <path d="M29 45h6" stroke="#B4533A" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M27.5 43.5c2.5 3 6.5 3 9 0" stroke="#B4533A" strokeWidth="2" strokeLinecap="round" fill="none" />
      )}
    </svg>
  )
}
