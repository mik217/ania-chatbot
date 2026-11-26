import { describe, expect, it } from 'vitest'
import baza from '../data/przepisy.json'
import { PAMIEC_PUSTA, dodajWpisy, niezgodnosci, normalizujAlergen, przygotujWpis, zapomnijWpisy } from './pamiec.js'
import { przetworzOdpowiedz } from './odpowiedz.js'
import { zbudujPrompt } from './prompt.js'

const P = Object.fromEntries(baza.przepisy.map((p) => [p.id, p]))

describe('pamięć użytkownika', () => {
  it('rozpoznaje alergeny z rozmowy', () => {
    expect(normalizujAlergen('orzechy włoskie')).toBe('orzechy')
    expect(normalizujAlergen('orzeszki ziemne')).toBe('orzeszki ziemne')
    expect(normalizujAlergen('nietolerancja laktozy')).toBe('laktoza')
    expect(normalizujAlergen('ziemniaki')).toBe(null)
  })
  it('odrzuca nieznany typ i dane osobowe', () => {
    expect(przygotujWpis('imie', 'Marta')).toBe(null)
    expect(przygotujWpis('lubi', 'tel 600 123 456')).toBe(null)
    expect(przygotujWpis('alergia', 'jajka')).toEqual({ typ: 'alergia', wartosc: 'jajka' })
  })
  it('alergia wyklucza przepisy z alergenem, nielubiany składnik też', () => {
    let p = dodajWpisy({ ...PAMIEC_PUSTA }, [{ typ: 'alergia', wartosc: 'jajka' }, { typ: 'nie_lubi', wartosc: 'pieczarki' }])
    expect(niezgodnosci(P['carbonara'], p)).toContain('alergen: jajka')
    expect(niezgodnosci(P['zupa-pieczarkowa'], p)).toContain('nie lubi: pieczarki')
    expect(niezgodnosci(P['makaron-pomidorowy'], p)).toEqual([])
    p = zapomnijWpisy(p, [{ typ: 'alergia', wartosc: 'jajka' }])
    expect(niezgodnosci(P['carbonara'], p)).toEqual([])
  })
  it('brak piekarnika wyklucza pieczenie', () => {
    const p = dodajWpisy({ ...PAMIEC_PUSTA }, [{ typ: 'sprzet', wartosc: 'brak piekarnika' }])
    expect(niezgodnosci(P['szarlotka'], p)).toContain('wymaga piekarnika')
    expect(niezgodnosci(P['omlet-z-cebula'], p)).toEqual([])
  })
  it('odczytuje znaczniki PAMIETAJ i ZAPOMNIJ', () => {
    const o = przetworzOdpowiedz('Jasne! [PAMIETAJ: alergia | orzechy] [ZAPOMNIJ: nie_lubi | grzyby] [PODPOWIEDZI: ok]', P)
    expect(o.pamietaj).toEqual([{ typ: 'alergia', wartosc: 'orzechy' }])
    expect(o.zapomnij).toEqual([{ typ: 'nie_lubi', wartosc: 'grzyby' }])
    expect(o.tekst).toBe('Jasne!')
  })
  it('prompt zawiera pamięć tylko za zgodą i mieści się w limicie', () => {
    const pm = dodajWpisy({ ...PAMIEC_PUSTA }, [{ typ: 'alergia', wartosc: 'orzechy' }])
    const z = zbudujPrompt({ baza, preferencje: [], pamiec: pm, ostatnieWiadomosci: ['mam jajka'], kanarek: 'KK' })
    expect(z).toContain('Alergie i nietolerancje: orzechy')
    expect(z).toContain('NIEZGODNY')
    expect(z.length).toBeLessThan(40000)
    const bez = zbudujPrompt({ baza, preferencje: [], pamiec: { ...pm, zgoda: false }, ostatnieWiadomosci: [], kanarek: 'KK' })
    expect(bez).not.toContain('Alergie i nietolerancje: orzechy')
  })
})

describe('baza przepisów', () => {
  it('ma co najmniej 100 przepisów z kompletnymi polami', () => {
    expect(baza.przepisy.length).toBeGreaterThanOrEqual(100)
    for (const p of baza.przepisy) {
      for (const k of ['id', 'nazwa', 'kategoria', 'porcje', 'trudnosc', 'dieta', 'alergeny', 'skladniki', 'kroki']) expect(p, `${p.id}.${k}`).toHaveProperty(k)
      expect(p.kroki.length).toBeGreaterThan(0)
    }
  })
  it('dania z makaronem pszennym mają gluten, a z serem laktozę', () => {
    for (const p of baza.przepisy) {
      const nazwy = p.skladniki.map((s) => s.n.toLowerCase()).join(' ')
      if (/spaghetti|penne|tagliatelle|lasagne/.test(nazwy)) expect(p.alergeny, p.id).toContain('gluten')
      if (/mozzarell|parmezan|cheddar|feta|mascarpone/.test(nazwy)) expect(p.alergeny, p.id).toContain('laktoza')
      if (/kurczak|wołow|wieprzow|boczek|szynk|łoso|dorsz/.test(nazwy)) expect(p.dieta, p.id).not.toContain('wegetariańskie')
    }
  })
})
