// Proste ilustracje dań (własne rysunki SVG). Klucz: pole „ilustracja” w przepisie.

const TALERZ = (
  <>
    <ellipse cx="40" cy="50" rx="32" ry="14" fill="#fff" />
    <ellipse cx="40" cy="48" rx="24" ry="9" fill="#f4ede6" />
  </>
)
const MISKA_TLO = <path d="M10 38h60c0 16-13 28-30 28S10 54 10 38z" fill="#fff" />

const RYSUNKI = {
  makaron: (
    <>
      {TALERZ}
      <g fill="none" stroke="#f2c14e" strokeWidth="3" strokeLinecap="round">
        <path d="M22 46c6-8 12 4 18-4s12 6 18-2" />
        <path d="M24 50c6-6 10 4 16-2s12 4 16-2" />
        <path d="M28 42c5-6 9 2 14-2s9 3 12 0" />
      </g>
      <circle cx="40" cy="43" r="7" fill="#e4572e" />
      <circle cx="37" cy="41" r="1.6" fill="#f5876a" />
      <path d="M44 37c2-3 5-3 7-2-1 2-4 4-7 2z" fill="#4c9a5f" />
    </>
  ),
  jajko: (
    <>
      <path d="M26 50h28l-3 14H29z" fill="#fff" />
      <rect x="24" y="48" width="32" height="4" rx="2" fill="#f4ede6" />
      <path d="M40 18c9 0 15 13 15 22s-7 12-15 12-15-3-15-12 6-22 15-22z" fill="#fff4e2" stroke="#ead7bd" />
      <path d="M27 36l4-4 4 4 5-4 5 4 4-4 4 4" fill="none" stroke="#ead7bd" strokeWidth="1.5" />
      <ellipse cx="40" cy="42" rx="7" ry="5" fill="#ffb627" />
    </>
  ),
  patelnia: (
    <>
      <rect x="54" y="44" width="22" height="5" rx="2.5" fill="#5b4a42" transform="rotate(-12 54 46)" />
      <ellipse cx="34" cy="46" rx="26" ry="15" fill="#3d322c" />
      <ellipse cx="34" cy="44" rx="22" ry="12" fill="#57473f" />
      <path d="M18 44c3-7 10-10 16-9s15 3 16 9-8 9-16 9-18-2-16-9z" fill="#fff" />
      <circle cx="30" cy="43" r="5" fill="#ffb627" />
      <circle cx="40" cy="45" r="4.5" fill="#ffb627" />
      <path d="M24 39l2 1M44 38l1 2M35 50l2-1" stroke="#4c9a5f" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  miska: (
    <>
      <ellipse cx="40" cy="38" rx="30" ry="7" fill="#f4ede6" />
      <circle cx="30" cy="35" r="7" fill="#9fd36b" />
      <circle cx="44" cy="33" r="6" fill="#ffd166" />
      <circle cx="52" cy="37" r="5" fill="#e4572e" />
      <circle cx="37" cy="38" r="4" fill="#fff" />
      <path d="M22 37c2-3 5-3 7 0" stroke="#4c9a5f" strokeWidth="2" fill="none" />
      {MISKA_TLO}
      <path d="M14 46h52" stroke="#f4ede6" strokeWidth="2" />
    </>
  ),
  zupa: (
    <>
      <path d="M32 16c-3 4 3 6 0 10M42 14c-3 4 3 6 0 10M52 16c-3 4 3 6 0 10" stroke="#d9c8b8" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="40" cy="38" rx="30" ry="7" fill="#e4572e" />
      <circle cx="32" cy="37" r="2" fill="#fff" opacity=".7" />
      <path d="M44 36c2-2 4-2 6 0" stroke="#4c9a5f" strokeWidth="2" fill="none" />
      {MISKA_TLO}
    </>
  ),
  kanapka: (
    <>
      {TALERZ}
      <path d="M20 46c0-10 6-16 20-16s20 6 20 16z" fill="#e8b36b" />
      <path d="M23 44c0-8 5-11 17-11s17 3 17 11z" fill="#f7dcae" />
      <path d="M22 44h36" stroke="#9fd36b" strokeWidth="4" strokeLinecap="round" />
      <path d="M24 40h32" stroke="#ffd166" strokeWidth="3" strokeLinecap="round" />
      <circle cx="33" cy="37" r="3" fill="#e4572e" />
      <circle cx="46" cy="37" r="3" fill="#e4572e" />
    </>
  ),
  nalesniki: (
    <>
      {TALERZ}
      <ellipse cx="40" cy="46" rx="20" ry="6" fill="#e8b36b" />
      <ellipse cx="40" cy="42" rx="20" ry="6" fill="#f2c88a" />
      <ellipse cx="40" cy="38" rx="20" ry="6" fill="#e8b36b" />
      <ellipse cx="40" cy="34" rx="20" ry="6" fill="#f2c88a" />
      <path d="M30 32c4 4 16 4 20 0 0 4-2 8-4 9-1-3-3-3-4 0-2-2-4-2-5 0-2-1-5-4-7-9z" fill="#c2410c" opacity=".85" />
      <circle cx="45" cy="29" r="3" fill="#e63946" />
      <circle cx="37" cy="29" r="2.5" fill="#6d4c9b" />
    </>
  ),
  kurczak: (
    <>
      {TALERZ}
      <ellipse cx="33" cy="47" rx="13" ry="5" fill="#fff8e7" />
      <circle cx="29" cy="46" r="1" fill="#e8dcc4" />
      <circle cx="35" cy="48" r="1" fill="#e8dcc4" />
      <path d="M40 46c0-8 7-12 13-10s6 8 2 11-15 4-15-1z" fill="#d98a3a" />
      <path d="M44 42c2-2 6-2 8 0" stroke="#b86a24" strokeWidth="1.5" fill="none" />
      <path d="M23 42c2-2 4-2 5 0M27 40c1-2 3-2 4 0" stroke="#4c9a5f" strokeWidth="2" fill="none" />
    </>
  ),
  wrap: (
    <>
      {TALERZ}
      <path d="M18 48l26-20 14 14-24 12z" fill="#f2d49b" />
      <path d="M44 28l14 14-6 3-14-13z" fill="#e8b36b" />
      <path d="M40 31c3 3 7 6 11 9" stroke="#9fd36b" strokeWidth="4" strokeLinecap="round" />
      <circle cx="44" cy="35" r="2.5" fill="#e4572e" />
      <circle cx="48" cy="39" r="2" fill="#ffd166" />
    </>
  ),
  ziemniaki: (
    <>
      {TALERZ}
      <ellipse cx="30" cy="44" rx="8" ry="6" fill="#e8a33c" />
      <ellipse cx="44" cy="46" rx="9" ry="6" fill="#d98a2b" />
      <ellipse cx="50" cy="40" rx="7" ry="5" fill="#e8a33c" />
      <ellipse cx="38" cy="38" rx="7" ry="5" fill="#f0b552" />
      <path d="M30 42l2 1M44 44l2 1M38 37l2 0M50 39l1 1" stroke="#4c9a5f" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  salatka: (
    <>
      <ellipse cx="40" cy="38" rx="30" ry="7" fill="#f4ede6" />
      <path d="M18 36c4-8 10-9 14-5M34 34c4-9 12-9 16-3M48 36c3-6 8-6 12-1" fill="#7cc36b" />
      <rect x="27" y="32" width="7" height="7" rx="1.5" fill="#fff" />
      <circle cx="42" cy="34" r="4" fill="#e4572e" />
      <circle cx="51" cy="36" r="2.5" fill="#3d322c" />
      <circle cx="24" cy="36" r="2.5" fill="#3d322c" />
      {MISKA_TLO}
    </>
  ),
  jablko: (
    <>
      {TALERZ}
      <path d="M40 26c10-4 18 4 16 14s-8 14-16 12c-8 2-14-2-16-12s6-18 16-14z" fill="#e63946" />
      <path d="M40 26c-1-4 0-8 2-10" stroke="#5b4a42" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M42 20c4-3 8-2 10 0-3 3-7 3-10 0z" fill="#4c9a5f" />
      <ellipse cx="33" cy="34" rx="3" ry="5" fill="#fff" opacity=".35" />
    </>
  ),
  pizza: (
    <>
      {TALERZ}
      <circle cx="40" cy="44" r="22" fill="#e8b36b" />
      <circle cx="40" cy="44" r="18" fill="#e4572e" />
      <circle cx="33" cy="40" r="5" fill="#fff4dc" />
      <circle cx="46" cy="38" r="4.5" fill="#fff4dc" />
      <circle cx="44" cy="50" r="5" fill="#fff4dc" />
      <circle cx="33" cy="51" r="3.5" fill="#fff4dc" />
      <path d="M37 45c2-2 4-2 5 0M48 44c1-2 3-2 4 0" stroke="#4c9a5f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </>
  ),
  pierogi: (
    <>
      {TALERZ}
      <path d="M18 48c2-10 20-10 22 0z" fill="#f7e2b8" stroke="#e8c98c" strokeWidth="1.2" />
      <path d="M38 46c2-10 20-10 22 0z" fill="#f7e2b8" stroke="#e8c98c" strokeWidth="1.2" />
      <path d="M28 40c2-10 20-10 22 0z" fill="#f7e2b8" stroke="#e8c98c" strokeWidth="1.2" />
      <path d="M22 44l1 2M28 43l1 2M42 42l1 2M48 41l1 2M32 36l1 2M38 35l1 2" stroke="#e8c98c" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="30" cy="50" r="2" fill="#c98a3a" />
      <circle cx="50" cy="49" r="2" fill="#c98a3a" />
    </>
  ),
  kotlet: (
    <>
      {TALERZ}
      <path d="M20 46c0-9 8-14 16-12s10 8 7 14-23 7-23-2z" fill="#d98a3a" />
      <path d="M24 42l3-2M30 39l3-1M27 46l3-2M35 43l3-2" stroke="#b86a24" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="52" cy="46" rx="8" ry="5" fill="#f0b552" />
      <ellipse cx="52" cy="40" rx="6" ry="4" fill="#fff8e7" />
      <path d="M50 38l2 1" stroke="#4c9a5f" strokeWidth="2" strokeLinecap="round" />
      <circle cx="47" cy="52" r="3" fill="#9fd36b" />
      <circle cx="56" cy="51" r="3" fill="#9fd36b" />
    </>
  ),
  ryba: (
    <>
      {TALERZ}
      <path d="M18 45c6-9 20-11 30-4l10-6v16l-10-6c-10 7-24 5-30-4z" fill="#f2a07b" />
      <circle cx="25" cy="43" r="1.8" fill="#3d322c" />
      <path d="M32 38c2 4 2 10 0 14M38 37c2 5 2 11 0 15" stroke="#e08a63" strokeWidth="1.5" fill="none" />
      <path d="M54 52c3-1 6 0 8 2" stroke="#4c9a5f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="42" r="4" fill="#ffd166" />
    </>
  ),
  burger: (
    <>
      {TALERZ}
      <path d="M22 38c0-9 8-14 18-14s18 5 18 14z" fill="#e8a33c" />
      <circle cx="33" cy="30" r="1" fill="#fff4dc" />
      <circle cx="41" cy="28" r="1" fill="#fff4dc" />
      <circle cx="47" cy="32" r="1" fill="#fff4dc" />
      <path d="M20 40h40" stroke="#7cc36b" strokeWidth="4" strokeLinecap="round" />
      <path d="M22 43h36l-2 3H24z" fill="#ffd166" />
      <rect x="21" y="45" width="38" height="5" rx="2.5" fill="#6b3b22" />
      <path d="M22 51h36c0 3-3 5-6 5H28c-3 0-6-2-6-5z" fill="#e8a33c" />
    </>
  ),
  ciasto: (
    <>
      {TALERZ}
      <path d="M20 48l20-22 22 22z" fill="#f2d49b" />
      <path d="M20 48h42v6H20z" fill="#e8b36b" />
      <path d="M20 48l20-22 22 22" fill="none" stroke="#c98a3a" strokeWidth="2" />
      <path d="M26 42h30" stroke="#f7a1b8" strokeWidth="3" />
      <circle cx="40" cy="27" r="3.5" fill="#e63946" />
      <path d="M40 24c1-3 3-4 5-4" stroke="#4c9a5f" strokeWidth="1.5" fill="none" />
    </>
  ),
}

export const KOLORY_KATEGORII = {
  śniadanie: '#ffe8b0',
  zupa: '#ffe0b8',
  obiad: '#ffd6c7',
  kolacja: '#d8ecd9',
  przekąska: '#e3ddf5',
  deser: '#fbd5e2',
}

export default function Ilustracja({ rodzaj, kategoria, rozmiar = 72 }) {
  return (
    <svg
      className="ilustracja"
      width={rozmiar}
      height={rozmiar}
      viewBox="0 0 80 80"
      aria-hidden="true"
      style={{ background: KOLORY_KATEGORII[kategoria] || '#f6ede3' }}
    >
      {RYSUNKI[rodzaj] || RYSUNKI.miska}
    </svg>
  )
}
