// Pamięć Ani o użytkowniku: zapisywana tylko w bazie przeglądarki (localStorage) na urządzeniu użytkownika.
// Nic nie trafia na serwer zespołu. Użytkownik może ją przejrzeć i usunąć w panelu „Pamięć”.
import { maskujDane } from './straznicy.js'

const KLUCZ = 'ania.pamiec.v1'

export const ALERGENY_ZNANE = ['gluten', 'jajka', 'laktoza', 'orzechy', 'orzeszki ziemne', 'ryby', 'skorupiaki', 'sezam', 'soja', 'seler', 'gorczyca']

export const TYPY = {
  alergia: 'Alergie i nietolerancje',
  nie_lubi: 'Czego nie lubi',
  lubi: 'Co lubi',
  sprzet: 'Sprzęt w kuchni',
  poziom: 'Doświadczenie w gotowaniu',
}

export const PAMIEC_PUSTA = { zgoda: null, wpisy: [], ugotowane: [], ulubione: [] }

export function wczytajPamiec() {
  try {
    const p = JSON.parse(localStorage.getItem(KLUCZ) || 'null')
    return p ? { ...PAMIEC_PUSTA, ...p } : { ...PAMIEC_PUSTA }
  } catch {
    return { ...PAMIEC_PUSTA }
  }
}

export function zapiszPamiec(p) {
  try {
    localStorage.setItem(KLUCZ, JSON.stringify(p))
  } catch {
    /* pamięć przeglądarki niedostępna: działa tylko do odświeżenia strony */
  }
  return p
}

export function usunPamiec() {
  try {
    localStorage.removeItem(KLUCZ)
  } catch {
    /* brak dostępu */
  }
  return { ...PAMIEC_PUSTA }
}

// Zamienia opis alergii z rozmowy na alergen z listy (albo null, gdy nie rozpoznamy).
export function normalizujAlergen(tekst) {
  const t = tekst.toLowerCase()
  const mapa = [
    ['orzeszki ziemne', ['orzeszk', 'arachid', 'ziemne']],
    ['orzechy', ['orzech', 'migdał', 'nerkow', 'laskow', 'pistacj']],
    ['gluten', ['gluten', 'pszen', 'celiak', 'żyt', 'jęczmie']],
    ['laktoza', ['laktoz', 'mlek', 'mleczn', 'nabiał', 'kazein']],
    ['jajka', ['jaj']],
    ['ryby', ['ryb']],
    ['skorupiaki', ['krewet', 'skorupiak', 'owoce morza', 'krab', 'homar']],
    ['sezam', ['sezam', 'tahini']],
    ['soja', ['soj', 'tofu']],
    ['seler', ['seler']],
    ['gorczyca', ['gorczyc', 'musztard']],
  ]
  for (const [nazwa, klucze] of mapa) if (klucze.some((k) => t.includes(k))) return nazwa
  return null
}

// Sprawdza propozycję zapisu z odpowiedzi modelu. Zwraca wpis albo null, gdy jest niepoprawna.
export function przygotujWpis(typ, wartosc) {
  const t = (typ || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (!TYPY[t]) return null
  const sprawdzone = maskujDane((wartosc || '').trim())
  if (sprawdzone.usunieto) return null // dane osobowe nie trafiają do pamięci
  let w = sprawdzone.tekst
  if (!w || w.length > 60) return null
  if (t === 'alergia') {
    w = normalizujAlergen(w) || w // nieznany alergen (np. truskawki) zostaje jako składnik do omijania
  }
  return { typ: t, wartosc: w.toLowerCase() }
}

export const takiSam = (a, b) => a.typ === b.typ && a.wartosc === b.wartosc

export function dodajWpisy(p, nowe) {
  const wpisy = [...p.wpisy]
  for (const n of nowe) {
    if (n.typ === 'poziom') {
      const i = wpisy.findIndex((w) => w.typ === 'poziom')
      if (i >= 0) wpisy.splice(i, 1)
    }
    if (!wpisy.some((w) => takiSam(w, n))) wpisy.push({ ...n, data: new Date().toISOString() })
  }
  return { ...p, zgoda: true, wpisy }
}

export function usunWpis(p, wpis) {
  return { ...p, wpisy: p.wpisy.filter((w) => !takiSam(w, wpis)) }
}

export function zapomnijWpisy(p, doUsuniecia) {
  return { ...p, wpisy: p.wpisy.filter((w) => !doUsuniecia.some((d) => d.typ === w.typ && (w.wartosc.includes(d.wartosc) || d.wartosc.includes(w.wartosc)))) }
}

export function dodajUgotowane(p, przepis) {
  if (p.zgoda !== true) return p
  const ugotowane = [{ id: przepis.id, nazwa: przepis.nazwa, data: new Date().toISOString() }, ...p.ugotowane.filter((u) => u.id !== przepis.id)].slice(0, 20)
  return { ...p, ugotowane }
}

export function dodajUlubiony(p, id) {
  if (p.zgoda !== true || p.ulubione.includes(id)) return p
  return { ...p, ulubione: [id, ...p.ulubione].slice(0, 30) }
}

export const wartosci = (p, typ) => p.wpisy.filter((w) => w.typ === typ).map((w) => w.wartosc)

// czy przepis zawiera składnik (porównanie po rdzeniu słowa, np. „grzyby” → „grzyb”, „pieczarki” → „pieczark”)
function zawiera(przepis, nazwa) {
  const rdzenie = nazwa.split(/[^\p{L}]+/u).filter((x) => x.length >= 3).map((x) => x.slice(0, Math.max(4, x.length - 2)))
  if (!rdzenie.length) return false
  return przepis.skladniki.some((s) => rdzenie.every((r) => s.n.toLowerCase().includes(r)))
}

const wymagaPiekarnika = (przepis) => przepis.kroki.some((k) => /piekarnik/i.test(k.t))

// Lista powodów, dla których przepis NIE pasuje do pamięci i preferencji (pusta = pasuje).
export function niezgodnosci(przepis, pamiec, preferencje = []) {
  const powody = []
  for (const pr of preferencje) if (!pr.pasuje(przepis)) powody.push(`dieta: ${pr.nazwa}`)
  for (const a of wartosci(pamiec, 'alergia')) {
    if (ALERGENY_ZNANE.includes(a)) {
      if (przepis.alergeny.includes(a)) powody.push(`alergen: ${a}`)
    } else if (zawiera(przepis, a)) powody.push(`alergia: ${a}`)
  }
  for (const n of wartosci(pamiec, 'nie_lubi')) {
    if (zawiera(przepis, n)) powody.push(`nie lubi: ${n}`)
  }
  if (wartosci(pamiec, 'sprzet').some((s) => /(brak|nie ma).*piekarnik/.test(s)) && wymagaPiekarnika(przepis)) powody.push('wymaga piekarnika')
  return powody
}

export function opisPamieciDlaPromptu(pamiec, bazaPoId) {
  const linie = []
  for (const [typ, etykieta] of Object.entries(TYPY)) {
    const w = wartosci(pamiec, typ)
    if (w.length) linie.push(`- ${etykieta}: ${w.join(', ')}.`)
  }
  if (pamiec.ugotowane.length)
    linie.push(`- Ostatnio ugotował z Tobą: ${pamiec.ugotowane.slice(0, 5).map((u) => `${u.nazwa} (${new Date(u.data).toLocaleDateString('pl-PL')})`).join(', ')}.`)
  if (pamiec.ulubione.length)
    linie.push(`- Ulubione przepisy: ${pamiec.ulubione.slice(0, 8).map((id) => bazaPoId[id]?.nazwa).filter(Boolean).join(', ')}.`)
  return linie
}

export function powitanieZPamiecia(pamiec) {
  if (pamiec.zgoda !== true) return ''
  const czesci = []
  const al = wartosci(pamiec, 'alergia')
  if (al.length) czesci.push(`omijam: ${al.join(', ')}`)
  const nl = wartosci(pamiec, 'nie_lubi')
  if (nl.length) czesci.push(`nie lubisz: ${nl.join(', ')}`)
  const sp = wartosci(pamiec, 'sprzet')
  if (sp.length) czesci.push(sp.join(', '))
  const ost = pamiec.ugotowane[0]
  if (!czesci.length && !ost) return ''
  return (
    '\nMiło Cię znowu widzieć!' +
    (czesci.length ? ` Pamiętam: ${czesci.join('; ')}.` : '') +
    (ost ? ` Ostatnio gotowaliśmy razem: ${ost.nazwa}.` : '')
  )
}
