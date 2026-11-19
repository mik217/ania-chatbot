// Maskotka Ani: ilustracja SVG z kilkoma nastrojami.
// nastroj: 'wita' (uśmiech) | 'mysli' (pisze odpowiedź) | 'radosc' (podała przepis) | 'oops' (nie umiała pomóc)
export default function AniaAvatar({ rozmiar = 40, nastroj = 'wita' }) {
  const oczy = {
    wita: (
      <g stroke="#3A2A22" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M24.5 37c1.2-1.6 3.6-1.6 4.8 0" />
        <path d="M34.7 37c1.2-1.6 3.6-1.6 4.8 0" />
      </g>
    ),
    radosc: (
      <g stroke="#3A2A22" strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M24.3 37.5c1.3-2.2 3.9-2.2 5.2 0" />
        <path d="M34.5 37.5c1.3-2.2 3.9-2.2 5.2 0" />
      </g>
    ),
    mysli: (
      <g fill="#3A2A22">
        <circle cx="28" cy="35" r="1.9" />
        <circle cx="38.5" cy="35" r="1.9" />
      </g>
    ),
    oops: (
      <g fill="#3A2A22">
        <circle cx="27" cy="36.5" r="1.9" />
        <circle cx="37" cy="36.5" r="1.9" />
        <path d="M24 32.5l4.5 1M40 32.5l-4.5 1" stroke="#7A3E26" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ),
  }
  const usta = {
    wita: <path d="M27.5 43.5c2.5 3 6.5 3 9 0" stroke="#B4533A" strokeWidth="2" strokeLinecap="round" fill="none" />,
    radosc: <path d="M26.5 42.5c3 5 8 5 11 0z" fill="#B4533A" />,
    mysli: <path d="M30 45c1.5-.8 3-.8 4.5 0" stroke="#B4533A" strokeWidth="2" strokeLinecap="round" fill="none" />,
    oops: <ellipse cx="32" cy="45" rx="2.2" ry="2.6" fill="#B4533A" />,
  }
  const n = oczy[nastroj] ? nastroj : 'wita'
  return (
    <svg className={`ania-avatar ania-${n}`} width={rozmiar} height={rozmiar} viewBox="0 0 64 64" role="img" aria-label="Ania, asystentka AI">
      <circle cx="32" cy="32" r="32" fill="#FFE3D3" />
      <path d="M14 36c0-12 8-20 18-20s18 8 18 20c0 6-2 11-4 14H18c-2-3-4-8-4-14z" fill="#7A3E26" />
      <ellipse cx="32" cy="37" rx="13" ry="14" fill="#FFD2B3" />
      <path d="M19 33c3-7 9-10 13-10s11 2 13 10c-5-3-9-4-13-4s-9 1-13 4z" fill="#7A3E26" />
      <path d="M18 22c-4-1-6-5-4-8 2-3 6-4 8-2 1-5 5-7 10-7s9 2 10 7c2-2 6-1 8 2 2 3 0 7-4 8v4H18z" fill="#fff" stroke="#F0D9CB" strokeWidth="1" />
      <rect x="18" y="23" width="28" height="5" rx="1.5" fill="#fff" stroke="#F0D9CB" strokeWidth="1" />
      {oczy[n]}
      <circle cx="23.5" cy="42" r="2.4" fill="#F7A99A" opacity={n === 'radosc' ? 1 : 0.7} />
      <circle cx="40.5" cy="42" r="2.4" fill="#F7A99A" opacity={n === 'radosc' ? 1 : 0.7} />
      {usta[n]}
      {n === 'radosc' && (
        <g fill="#FFC23D">
          <path d="M53 14l1.5 3.5L58 19l-3.5 1.5L53 24l-1.5-3.5L48 19l3.5-1.5z" />
          <path d="M9 44l1 2.2 2.2 1-2.2 1L9 50.4l-1-2.2-2.2-1 2.2-1z" />
        </g>
      )}
      {n === 'mysli' && (
        <g fill="#C9B6A8">
          <circle cx="50" cy="20" r="2" />
          <circle cx="55" cy="14" r="2.8" />
        </g>
      )}
    </svg>
  )
}
