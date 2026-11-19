// Logika rozmowy: łączenie wiadomości, reguły bezpieczeństwa, zapytania do modelu, limity sesji.
import { useCallback, useEffect, useRef, useState } from 'react'
import { KONFIG, LIMITY_TESTOWE } from '../config.js'
import { BladCzatu, KOMUNIKATY_BLEDOW, opisModelu, zapytajModel } from '../bot/model.js'
import { przetworzOdpowiedz, tekstStrumienia } from '../bot/odpowiedz.js'
import { zbudujPrompt } from '../bot/prompt.js'
import { jestAtakiem, jestWulgarne, maskujDane, prosiOCzlowieka } from '../bot/straznicy.js'

let licznikId = 0
const noweId = () => `m${Date.now().toString(36)}${(licznikId++).toString(36)}`
const losowy = () => Math.random().toString(36).slice(2, 10)
const KANAREK = 'KK-' + losowy().toUpperCase()

export const PODPOWIEDZI_STARTOWE = ['Co zrobić z tego, co mam?', 'Coś szybkiego do 15 minut', 'Co umiesz ugotować?']

export function powitanie() {
  return (
    'Cześć! Jestem Ania, Twoja asystentka kulinarna. Od razu uczciwie: jestem programem AI, a nie człowiekiem.\n' +
    'Podpowiem, co ugotować z tego, co masz w lodówce, albo dam przepis na konkretne danie. Przeliczę porcje, podsunę zamiennik składnika i poprowadzę Cię krok po kroku z minutnikiem.\n' +
    'Znam się tylko na gotowaniu, za to porządnie. Wybierz coś poniżej albo po prostu napisz, co dziś jemy.'
  )
}

export function useCzat({ ustawienia, klucz, baza }) {
  const [wiadomosci, setWiadomosci] = useState([])
  const [pisanie, setPisanie] = useState(null) // null | 'czeka' | 'model'
  const r = useRef(null)
  if (!r.current) {
    r.current = {
      historia: [], bufor: [], timer: null, zajety: false, niepowodzenia: 0, wulgaryzmy: 0,
      start: Date.now(), aktywnosc: Date.now(), licznik: 0, ostrzezenie: false, idRozmowy: losowy(), log: [],
    }
  }
  const aktualne = useRef({})
  aktualne.current = { ustawienia, klucz, baza }
  const bazaPoId = useRef({})
  bazaPoId.current = Object.fromEntries(baza.przepisy.map((p) => [p.id, p]))

  const limity = () => (aktualne.current.ustawienia.trybTestowy ? LIMITY_TESTOWE : KONFIG)

  const dodaj = useCallback((w) => {
    const m = { id: noweId(), czas: new Date().toISOString(), rozmowa: r.current.idRozmowy, ...w }
    r.current.log.push({ ...m })
    setWiadomosci((a) => [...a, m])
    return m.id
  }, [])

  const zmien = useCallback((id, zmiany) => {
    const wpis = r.current.log.find((w) => w.id === id)
    if (wpis) Object.assign(wpis, zmiany)
    setWiadomosci((a) => a.map((m) => (m.id === id ? { ...m, ...zmiany } : m)))
  }, [])

  const dodajAnie = useCallback(
    (tekst, extra = {}) => dodaj({ kto: 'ania', tekst, zrodlo: 'reguła aplikacji', ocenialna: false, ...extra }),
    [dodaj],
  )
  const dodajSystem = useCallback((tekst, extra = {}) => dodaj({ kto: 'system', tekst, ...extra }), [dodaj])

  const nowaRozmowa = useCallback(
    (powod = 'uzytkownik') => {
      const s = r.current
      clearTimeout(s.timer)
      Object.assign(s, {
        historia: [], bufor: [], niepowodzenia: 0, wulgaryzmy: 0, start: Date.now(), aktywnosc: Date.now(),
        licznik: 0, ostrzezenie: false, idRozmowy: losowy(),
      })
      setPisanie(null)
      if (powod !== 'bezczynnosc') setWiadomosci([])
      if (powod === 'bezczynnosc')
        dodajSystem(`Rozmowa zakończyła się po ${limity().bezczynnoscMin} min bez aktywności i Ania już jej nie pamięta. Zaczynamy od nowa, a Twoje preferencje zostały.`)
      dodajAnie(powitanie(), { zrodlo: 'powitanie', start: true })
    },
    [dodajAnie, dodajSystem],
  )

  // koniec rozmowy po bezczynności
  useEffect(() => {
    const t = setInterval(() => {
      const s = r.current
      if (s.licznik > 0 && !s.zajety && Date.now() - s.aktywnosc > limity().bezczynnoscMin * 60000) nowaRozmowa('bezczynnosc')
    }, 10000)
    return () => clearInterval(t)
  }, [nowaRozmowa])

  const pokazKatalog = useCallback(() => {
    r.current.niepowodzenia = 0
    dodajAnie('Chyba dziś nie trafiam w to, czego szukasz. Zobacz, co na pewno umiem ugotować, i kliknij danie, które Ci pasuje. Możesz też napisać, jakie masz składniki.', {
      zrodlo: 'reguła: 3 nieudane odpowiedzi',
      katalog: true,
    })
  }, [dodajAnie])

  const zarejestrujNiepowodzenie = useCallback(() => {
    r.current.niepowodzenia++
    if (r.current.niepowodzenia >= KONFIG.limitNiepowodzen) pokazKatalog()
  }, [pokazKatalog])

  const zapytaj = useCallback(
    async (tresc) => {
      const s = r.current
      s.zajety = true
      setPisanie('model')
      s.historia.push({ role: 'user', content: `<wiadomosc>\n${tresc}\n</wiadomosc>` })
      let idOdp = null
      try {
        const kontekst = s.historia.slice(-KONFIG.maksWiadomosciWKontekscie)
        while (kontekst.length && kontekst[0].role !== 'user') kontekst.shift()
        const { ustawienia: u, klucz: k, baza: b } = aktualne.current
        const systemPrompt = zbudujPrompt({
          baza: b,
          preferencje: u.preferencje,
          ostatnieWiadomosci: s.historia.slice(-4).map((m) => m.content),
          kanarek: KANAREK,
        })
        const { dostawca, model } = opisModelu(u)
        const surowa = await zapytajModel({
          ustawienia: u,
          klucz: k,
          systemPrompt,
          wiadomosci: kontekst,
          onTekst: (caly) => {
            const widoczny = tekstStrumienia(caly)
            if (!widoczny) return
            if (!idOdp) {
              setPisanie(null)
              idOdp = dodaj({ kto: 'ania', tekst: widoczny, strumien: true, zrodlo: `model: ${dostawca.nazwa} / ${model}`, ocenialna: true })
            } else zmien(idOdp, { tekst: widoczny })
          },
        })
        const o = przetworzOdpowiedz(surowa, bazaPoId.current, KANAREK)
        if (o.wyciek) {
          s.historia.pop()
          const tekst = 'Moich instrukcji nie zdradzę, to tajemnica kuchni. Ale chętnie pomogę coś ugotować: co masz w lodówce?'
          if (idOdp) zmien(idOdp, { tekst, strumien: false, zrodlo: 'filtr odpowiedzi: wyciek instrukcji', ocenialna: false })
          else dodajAnie(tekst, { zrodlo: 'filtr odpowiedzi: wyciek instrukcji' })
          return
        }
        s.historia.push({ role: 'assistant', content: surowa })
        const koncowe = {
          tekst: o.tekst || 'Hmm, nie umiem na to odpowiedzieć. Zapytasz inaczej?',
          strumien: false,
          przepisy: o.przepisy,
          podpowiedzi: o.podpowiedzi,
          czlowiek: o.czlowiek,
          brak: o.brak,
        }
        if (idOdp) zmien(idOdp, koncowe)
        else dodaj({ kto: 'ania', zrodlo: `model: ${dostawca.nazwa} / ${model}`, ocenialna: true, ...koncowe })
        if (o.brak) zarejestrujNiepowodzenie()
        else if (o.przepisy.length) s.niepowodzenia = 0
      } catch (e) {
        s.historia.pop()
        const rodzaj = e instanceof BladCzatu ? e.rodzaj : 'siec'
        if (idOdp) zmien(idOdp, { strumien: false })
        console.warn('Błąd modelu:', rodzaj, e.szczegoly || e)
        dodaj({ kto: 'blad', rodzaj, tekst: KOMUNIKATY_BLEDOW[rodzaj] || KOMUNIKATY_BLEDOW.siec, ponow: tresc })
      } finally {
        s.zajety = false
        setPisanie(s.bufor.length ? 'czeka' : null)
      }
    },
    [dodaj, dodajAnie, zmien, zarejestrujNiepowodzenie],
  )

  const wyslijBufor = useCallback(async () => {
    const s = r.current
    if (s.zajety || !s.bufor.length) return
    const tresc = s.bufor.join('\n')
    s.bufor = []
    await zapytaj(tresc)
    if (s.bufor.length) zaplanuj(KONFIG.opoznienieLaczeniaMs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zapytaj])

  const zaplanuj = useCallback(
    (ms) => {
      const s = r.current
      clearTimeout(s.timer)
      if (!s.zajety) setPisanie(ms ? 'czeka' : 'model')
      s.timer = setTimeout(wyslijBufor, ms)
    },
    [wyslijBufor],
  )

  const wyslij = useCallback(
    (tekstOryginalny, { odRazu = false, dopisek = '' } = {}) => {
      const s = r.current
      s.aktywnosc = Date.now()
      const { tekst, usunieto } = maskujDane(tekstOryginalny.trim())
      if (!tekst) return
      dodaj({ kto: 'ty', tekst })
      s.licznik++
      if (usunieto)
        dodajSystem('Usunęłam z wiadomości dane osobowe (np. telefon albo adres). Do gotowania nie są potrzebne i nie trafiły do modelu AI.')

      if (jestWulgarne(tekst)) {
        s.wulgaryzmy++
        const tekstOdp =
          s.wulgaryzmy >= KONFIG.limitWulgaryzmow
            ? 'Widzę, że jest nerwowo. Rozumiem, ale bez wulgaryzmów nie pójdziemy dalej. Jeśli coś się nie udało, napisz spokojnie co, a pomogę to uratować.'
            : 'Rozumiem, że coś Cię zdenerwowało. Chętnie pomogę, tylko proszę bez wulgaryzmów. Co się stało albo co chcesz ugotować?'
        dodajAnie(tekstOdp, { zrodlo: 'reguła: wulgaryzmy' })
        return
      }
      if (jestAtakiem(tekst)) {
        dodajAnie('Nie zmienię swojej roli ani zasad, jestem Anią od gotowania i tak zostanie. Za to chętnie podpowiem, co dziś zjeść: co masz w lodówce?', {
          zrodlo: 'reguła: próba zmiany roli / wydobycia instrukcji',
          podpowiedzi: PODPOWIEDZI_STARTOWE,
        })
        return
      }
      if (prosiOCzlowieka(tekst)) {
        dodajAnie(
          `Jestem asystentką AI w wersji prototypowej, więc nie połączę Cię z człowiekiem. ${KONFIG.kontakt ? `Możesz napisać do zespołu, który mnie stworzył: ${KONFIG.kontakt}.` : 'Możesz napisać do zespołu, który mnie stworzył (adres e-mail do uzupełnienia).'} A jeśli chodzi o gotowanie, pomogę od ręki.`,
          { zrodlo: 'reguła: prośba o człowieka' },
        )
        return
      }
      const L = limity()
      if (!s.ostrzezenie && (s.licznik >= L.limitWiadomosciSesji || (Date.now() - s.start) / 60000 >= L.limitCzasuSesjiMin)) {
        s.ostrzezenie = true
        dodajSystem('Rozmowa trwa już długo i najstarsze wiadomości Ania może pamiętać gorzej. Jeśli gotujesz coś nowego, zacznij nową rozmowę.', {
          akcja: 'nowa-rozmowa',
        })
      }
      s.bufor.push(dopisek ? `${tekst}\n${dopisek}` : tekst)
      zaplanuj(odRazu ? 0 : KONFIG.opoznienieLaczeniaMs)
    },
    [dodaj, dodajAnie, dodajSystem, zaplanuj],
  )

  // pisanie w polu tekstowym przedłuża czekanie na kolejną część pytania
  const piszeUzytkownik = useCallback(() => {
    const s = r.current
    s.aktywnosc = Date.now()
    if (s.bufor.length && !s.zajety) zaplanuj(KONFIG.opoznienieLaczeniaMs)
  }, [zaplanuj])

  const ponow = useCallback(
    (idBledu, tresc) => {
      if (r.current.zajety) return
      setWiadomosci((a) => a.filter((m) => m.id !== idBledu))
      zapytaj(tresc)
    },
    [zapytaj],
  )

  const ocen = useCallback(
    (id, ocena) => {
      zmien(id, { ocena })
      if (ocena === 'zła') zarejestrujNiepowodzenie()
      else r.current.niepowodzenia = 0
    },
    [zmien, zarejestrujNiepowodzenie],
  )

  const metadane = () => {
    const { ustawienia: u, baza: b } = aktualne.current
    const { dostawca, model } = opisModelu(u)
    return { aplikacja: 'Ania – asystentka kulinarna AI (prototyp)', eksport: new Date().toISOString(), dostawca: dostawca.nazwa, model, preferencje: u.preferencje, wersjaBazy: b.wersja }
  }
  const log = () => r.current.log

  return { wiadomosci, pisanie, wyslij, piszeUzytkownik, nowaRozmowa, ponow, ocen, dodajSystem, log, metadane }
}
