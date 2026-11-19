// Składniki do wyboru w trybie „Co mam w lodówce?”.
// klucze: początki słów, po których składnik rozpoznajemy w przepisach.

export const GRUPY_SKLADNIKOW = [
  {
    nazwa: 'Nabiał i jajka',
    skladniki: [
      { n: 'jajka', ikona: '🥚', klucze: ['jajk'] },
      { n: 'mleko', ikona: '🥛', klucze: ['mleko'] },
      { n: 'ser żółty', ikona: '🧀', klucze: ['ser żółty', 'tarty ser'] },
      { n: 'twaróg', ikona: '🥣', klucze: ['twaróg'] },
      { n: 'feta', ikona: '🧀', klucze: ['feta'] },
      { n: 'jogurt naturalny', ikona: '🥛', klucze: ['jogurt'] },
      { n: 'masło', ikona: '🧈', klucze: ['masło'] },
      { n: 'śmietanka', ikona: '🥛', klucze: ['śmietank'] },
    ],
  },
  {
    nazwa: 'Warzywa i owoce',
    skladniki: [
      { n: 'cebula', ikona: '🧅', klucze: ['cebul'] },
      { n: 'czosnek', ikona: '🧄', klucze: ['czosn'] },
      { n: 'pomidory', ikona: '🍅', klucze: ['pomidor'] },
      { n: 'papryka', ikona: '🫑', klucze: ['papryka'] },
      { n: 'cukinia', ikona: '🥒', klucze: ['cukini'] },
      { n: 'ogórek', ikona: '🥒', klucze: ['ogór'] },
      { n: 'ziemniaki', ikona: '🥔', klucze: ['ziemniak'] },
      { n: 'pieczarki', ikona: '🍄', klucze: ['pieczark'] },
      { n: 'awokado', ikona: '🥑', klucze: ['awokado'] },
      { n: 'sałata', ikona: '🥬', klucze: ['sałat'] },
      { n: 'rzodkiewka', ikona: '🌱', klucze: ['rzodkiew'] },
      { n: 'mrożone warzywa', ikona: '🥕', klucze: ['mrożon'] },
      { n: 'banan', ikona: '🍌', klucze: ['banan'] },
      { n: 'jabłka', ikona: '🍎', klucze: ['jabł'] },
      { n: 'cytryna', ikona: '🍋', klucze: ['cytryn'] },
    ],
  },
  {
    nazwa: 'Mięso i ryby',
    skladniki: [
      { n: 'kurczak', ikona: '🍗', klucze: ['kurczak'] },
      { n: 'boczek', ikona: '🥓', klucze: ['boczek'] },
      { n: 'szynka', ikona: '🍖', klucze: ['szynk'] },
      { n: 'tuńczyk', ikona: '🐟', klucze: ['tuńczyk'] },
    ],
  },
  {
    nazwa: 'Spiżarnia',
    skladniki: [
      { n: 'makaron', ikona: '🍝', klucze: ['makaron', 'spaghetti'] },
      { n: 'ryż', ikona: '🍚', klucze: ['ryż'] },
      { n: 'chleb', ikona: '🍞', klucze: ['chleb', 'bagietk', 'bułk'] },
      { n: 'tortille', ikona: '🌯', klucze: ['tortill'] },
      { n: 'płatki owsiane', ikona: '🥣', klucze: ['płatki owsiane', 'granol'] },
      { n: 'mąka', ikona: '🌾', klucze: ['mąka'] },
      { n: 'pomidory z puszki', ikona: '🥫', klucze: ['krojone pomidory', 'passata'] },
      { n: 'soczewica', ikona: '🫘', klucze: ['soczewic'] },
      { n: 'ciecierzyca', ikona: '🫘', klucze: ['ciecierzyc'] },
      { n: 'fasola z puszki', ikona: '🫘', klucze: ['fasol'] },
      { n: 'mleczko kokosowe', ikona: '🥥', klucze: ['mleczko kokos'] },
      { n: 'miód', ikona: '🍯', klucze: ['miód'] },
    ],
  },
]

// Składniki, które prawie każdy ma w domu – nie liczą się jako brakujące.
const PODSTAWOWE = ['sól', 'pieprz', 'olej', 'oliw', 'woda', 'zimna woda', 'cukier', 'cynamon', 'oregano', 'zioła', 'papryka słodka', 'płatki chili', 'curry', 'natka', 'szczypior', 'bazylia', 'ketchup', 'sok z cytryny']

const jestPodstawowy = (nazwa) => PODSTAWOWE.some((p) => nazwa.toLowerCase().startsWith(p) || nazwa.toLowerCase().includes(p + ' '))

const WSZYSTKIE = GRUPY_SKLADNIKOW.flatMap((g) => g.skladniki)

function pasuje(nazwaSkladnika, wybrane) {
  const n = nazwaSkladnika.toLowerCase()
  return WSZYSTKIE.filter((s) => wybrane.includes(s.n)).some((s) => s.klucze.some((k) => n.includes(k)))
}

// Zwraca przepisy, które da się zrobić z wybranych składników (najwyżej 1 brakujący), od najlepiej pasujących.
export function dopasujPrzepisy(przepisy, wybrane) {
  if (!wybrane.length) return []
  return przepisy
    .map((p) => {
      const glowne = p.skladniki.filter((s) => !jestPodstawowy(s.n))
      const masz = glowne.filter((s) => pasuje(s.n, wybrane))
      return { p, masz: masz.length, brakuje: glowne.filter((s) => !pasuje(s.n, wybrane)).map((s) => s.n), wszystkich: glowne.length }
    })
    .filter((w) => w.masz > 0 && w.brakuje.length <= 1)
    .sort((a, b) => a.brakuje.length - b.brakuje.length || b.masz - a.masz)
}
