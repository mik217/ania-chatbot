// Składniki do wyboru w trybie „Co mam w lodówce?”.
// klucze: początki słów, po których składnik rozpoznajemy w przepisach.

export const GRUPY_SKLADNIKOW = [
  {
    nazwa: 'Nabiał i jajka',
    skladniki: [
      { n: 'jajka', ikona: '🥚', klucze: ['jajk'] },
      { n: 'mleko', ikona: '🥛', klucze: ['mleko'] },
      { n: 'masło', ikona: '🧈', klucze: ['masło'] },
      { n: 'śmietana 18%', ikona: '🥛', klucze: ['śmietana'] },
      { n: 'śmietanka 30%', ikona: '🥛', klucze: ['śmietanka'] },
      { n: 'jogurt naturalny', ikona: '🥛', klucze: ['jogurt naturalny'] },
      { n: 'jogurt grecki', ikona: '🥛', klucze: ['jogurt grecki'] },
      { n: 'twaróg', ikona: '🥣', klucze: ['twaróg'] },
      { n: 'serek kremowy', ikona: '🥣', klucze: ['serek kremowy'] },
    ],
  },
  {
    nazwa: 'Sery',
    skladniki: [
      { n: 'ser żółty (gouda, edam)', ikona: '🧀', klucze: ['ser żółty'] },
      { n: 'mozzarella', ikona: '🧀', klucze: ['mozzarell'] },
      { n: 'parmezan', ikona: '🧀', klucze: ['parmezan'] },
      { n: 'cheddar', ikona: '🧀', klucze: ['cheddar'] },
      { n: 'feta', ikona: '🧀', klucze: ['feta'] },
      { n: 'halloumi', ikona: '🧀', klucze: ['halloumi'] },
      { n: 'mascarpone', ikona: '🧀', klucze: ['mascarpone'] },
      { n: 'ser pleśniowy', ikona: '🧀', klucze: ['ser pleśniowy'] },
      { n: 'ser topiony', ikona: '🧀', klucze: ['ser topiony'] },
      { n: 'ementaler / gruyère', ikona: '🧀', klucze: ['ementaler'] },
    ],
  },
  {
    nazwa: 'Warzywa',
    skladniki: [
      { n: 'cebula', ikona: '🧅', klucze: ['cebul'] },
      { n: 'czosnek', ikona: '🧄', klucze: ['czosn'] },
      { n: 'pomidory', ikona: '🍅', klucze: ['pomidor'] },
      { n: 'papryka', ikona: '🫑', klucze: ['papryka'] },
      { n: 'cukinia', ikona: '🥒', klucze: ['cukini'] },
      { n: 'ogórek', ikona: '🥒', klucze: ['ogórek'] },
      { n: 'ogórki kiszone', ikona: '🥒', klucze: ['ogórki kiszone'] },
      { n: 'ziemniaki', ikona: '🥔', klucze: ['ziemniak'] },
      { n: 'marchew', ikona: '🥕', klucze: ['marchew', 'włoszczyzn'] },
      { n: 'brokuł', ikona: '🥦', klucze: ['brokuł'] },
      { n: 'pieczarki', ikona: '🍄', klucze: ['pieczark'] },
      { n: 'szpinak', ikona: '🥬', klucze: ['szpinak'] },
      { n: 'sałata', ikona: '🥬', klucze: ['sałat'] },
      { n: 'awokado', ikona: '🥑', klucze: ['awokado'] },
      { n: 'dynia', ikona: '🎃', klucze: ['dynia'] },
      { n: 'kapusta kiszona', ikona: '🥬', klucze: ['kapusta'] },
      { n: 'rzodkiewka', ikona: '🌱', klucze: ['rzodkiew'] },
      { n: 'mrożone warzywa', ikona: '🧊', klucze: ['mrożon'] },
    ],
  },
  {
    nazwa: 'Owoce',
    skladniki: [
      { n: 'banan', ikona: '🍌', klucze: ['banan'] },
      { n: 'jabłka', ikona: '🍎', klucze: ['jabł'] },
      { n: 'gruszka', ikona: '🍐', klucze: ['grusz'] },
      { n: 'cytryna / limonka', ikona: '🍋', klucze: ['cytryn', 'limonk'] },
      { n: 'truskawki / maliny / borówki', ikona: '🍓', klucze: ['truskaw', 'malin', 'borów', 'owoce'] },
    ],
  },
  {
    nazwa: 'Mięso i ryby',
    skladniki: [
      { n: 'kurczak', ikona: '🍗', klucze: ['kurczak'] },
      { n: 'mięso mielone', ikona: '🥩', klucze: ['mięso mielone'] },
      { n: 'schab / wieprzowina', ikona: '🥩', klucze: ['schab', 'wieprzow'] },
      { n: 'boczek', ikona: '🥓', klucze: ['boczek'] },
      { n: 'szynka', ikona: '🍖', klucze: ['szynk'] },
      { n: 'kiełbasa', ikona: '🌭', klucze: ['kiełbas'] },
      { n: 'łosoś', ikona: '🐟', klucze: ['łoso'] },
      { n: 'dorsz', ikona: '🐟', klucze: ['dorsz'] },
      { n: 'tuńczyk z puszki', ikona: '🐟', klucze: ['tuńczyk'] },
      { n: 'krewetki', ikona: '🦐', klucze: ['krewet'] },
      { n: 'tofu', ikona: '⬜', klucze: ['tofu'] },
    ],
  },
  {
    nazwa: 'Spiżarnia',
    skladniki: [
      { n: 'makaron', ikona: '🍝', klucze: ['makaron', 'spaghetti', 'penne', 'tagliatelle', 'płaty lasagne'] },
      { n: 'ryż', ikona: '🍚', klucze: ['ryż'] },
      { n: 'kasza', ikona: '🌾', klucze: ['kasza'] },
      { n: 'chleb / bagietka', ikona: '🍞', klucze: ['chleb', 'bagietk', 'bułk'] },
      { n: 'tortille', ikona: '🌯', klucze: ['tortill'] },
      { n: 'płatki owsiane', ikona: '🥣', klucze: ['płatki owsiane', 'granol'] },
      { n: 'mąka', ikona: '🌾', klucze: ['mąka pszenna', 'mąka'] },
      { n: 'pomidory z puszki / passata', ikona: '🥫', klucze: ['krojone pomidory', 'passata', 'koncentrat'] },
      { n: 'fasola z puszki', ikona: '🫘', klucze: ['fasol'] },
      { n: 'ciecierzyca', ikona: '🫘', klucze: ['ciecierzyc'] },
      { n: 'soczewica', ikona: '🫘', klucze: ['soczewic'] },
      { n: 'kukurydza z puszki', ikona: '🌽', klucze: ['kukurydza z puszki'] },
      { n: 'mleczko kokosowe', ikona: '🥥', klucze: ['mleczko kokos'] },
      { n: 'bulion', ikona: '🍲', klucze: ['bulion'] },
      { n: 'czekolada / kakao', ikona: '🍫', klucze: ['czekolad', 'kakao'] },
      { n: 'orzechy', ikona: '🌰', klucze: ['orzech'] },
      { n: 'miód', ikona: '🍯', klucze: ['miód'] },
      { n: 'ciasto francuskie', ikona: '🥐', klucze: ['ciasto francuskie'] },
      { n: 'drożdże', ikona: '🧫', klucze: ['drożdże'] },
    ],
  },
]

// Składniki, które prawie każdy ma w domu – nie liczą się jako brakujące.
const PODSTAWOWE = ['sól', 'pieprz', 'olej', 'oliw', 'woda', 'ciepła woda', 'zimna woda', 'cukier', 'cynamon', 'oregano', 'zioła', 'papryka słodka', 'papryka wędzona', 'płatki chili', 'chili w proszku', 'curry', 'kumin', 'majeranek', 'tymianek', 'natka', 'szczypior', 'koperek', 'bazylia', 'ketchup', 'sok z cytryny', 'ocet', 'proszek do pieczenia', 'cukier puder', 'cukier wanilinowy', 'liść laurowy', 'ziele angielskie', 'gałka muszkatołowa', 'czosnek granulowany', 'mąka ziemniaczana', 'musztarda', 'majonez', 'koncentrat']

const jestPodstawowy = (nazwa) => PODSTAWOWE.some((p) => nazwa.toLowerCase().startsWith(p) || nazwa.toLowerCase().includes(' ' + p))

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
