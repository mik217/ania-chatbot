import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AniaAvatar from './components/AniaAvatar.jsx'
import Wiadomosc, { nastrojWiadomosci } from './components/Wiadomosc.jsx'
import { KsiazkaPrzepisow, Lodowka } from './components/Arkusze.jsx'
import TrybGotowania from './components/TrybGotowania.jsx'
import Ustawienia from './components/Ustawienia.jsx'
import { ListaZakupow, ZapisRozmowy } from './components/Okna.jsx'
import { useCzat } from './hooks/useCzat.js'
import { PREFERENCJE } from './bot/prompt.js'
import { KLUCZ_DEWELOPERSKI } from './config.js'
import bazaDomyslna from './data/przepisy.json'

const pamiec = {
  get(k, d) {
    try {
      const v = localStorage.getItem(k)
      return v == null ? d : JSON.parse(v)
    } catch {
      return d
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v))
    } catch {
      /* brak dostępu do pamięci przeglądarki */
    }
  },
}
const kluczSesji = {
  get() {
    try {
      return sessionStorage.getItem('ania.klucz') || ''
    } catch {
      return ''
    }
  },
  set(v) {
    try {
      if (v) sessionStorage.setItem('ania.klucz', v)
      else sessionStorage.removeItem('ania.klucz')
    } catch {
      /* brak dostępu do pamięci przeglądarki */
    }
  },
}

const USTAWIENIA_DOMYSLNE = { dostawca: 'gemini', modele: {}, urlWlasny: '', preferencje: [], zapamietajKlucz: false, trybTestowy: false, ciemny: false }

function Ikona({ d }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {d.map((p) => (
        <path key={p} d={p} />
      ))}
    </svg>
  )
}

export default function App() {
  const [ustawienia, setUstawienia] = useState(() => ({ ...USTAWIENIA_DOMYSLNE, ...pamiec.get('ania.ustawienia', {}) }))
  const [klucz, setKlucz] = useState(() => kluczSesji.get() || KLUCZ_DEWELOPERSKI)
  const baza = bazaDomyslna
  const bazaPoId = useMemo(() => Object.fromEntries(baza.przepisy.map((p) => [p.id, p])), [baza])
  const czat = useCzat({ ustawienia, klucz, baza })
  const [okno, setOkno] = useState(null) // 'ustawienia' | 'zapis'
  const [zakupy, setZakupy] = useState(null)
  const [gotowanie, setGotowanie] = useState(null)
  const [tekst, setTekst] = useState('')
  const lista = useRef(null)
  const pole = useRef(null)
  const wystartowano = useRef(false)

  useEffect(() => {
    if (wystartowano.current) return
    wystartowano.current = true
    czat.nowaRozmowa('start')
    if (!klucz) czat.dodajSystem('Żeby porozmawiać z Anią, wklej darmowy klucz API w ustawieniach.', { akcja: 'ustawienia' })
  }, [czat, klucz])

  useEffect(() => {
    document.documentElement.dataset.motyw = ustawienia.ciemny ? 'ciemny' : 'jasny'
  }, [ustawienia.ciemny])

  useEffect(() => {
    const el = lista.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [czat.wiadomosci, czat.pisanie])

  const zapiszUstawienia = (u, k) => {
    setUstawienia(u)
    pamiec.set('ania.ustawienia', u)
    const mialKlucz = !!klucz
    setKlucz(k)
    kluczSesji.set(u.zapamietajKlucz ? k : '')
    setOkno(null)
    if (!mialKlucz && k) czat.dodajSystem('Klucz zapisany. Możesz pisać do Ani!')
  }

  const przelaczPreferencje = (id) => {
    const nowe = ustawienia.preferencje.includes(id) ? ustawienia.preferencje.filter((x) => x !== id) : [...ustawienia.preferencje, id]
    const u = { ...ustawienia, preferencje: nowe }
    setUstawienia(u)
    pamiec.set('ania.ustawienia', u)
    const nazwy = PREFERENCJE.filter((p) => nowe.includes(p.id)).map((p) => p.nazwa)
    czat.dodajSystem(nazwy.length ? `Zapamiętane: dieta ${nazwy.join(', ')}. Ania zaproponuje tylko pasujące dania.` : 'Usunięto preferencje dietetyczne.')
  }

  const wyslij = (t = tekst, odRazu = false, dopisek = '') => {
    if (!t.trim()) return
    czat.wyslij(t, { odRazu, dopisek })
    if (t === tekst) setTekst('')
    pole.current?.focus()
  }

  const zamknijGotowanie = useCallback(
    (powod) => {
      setGotowanie(null)
      if (powod === 'koniec') czat.dodajSystem('Smacznego! Jeśli przepis się udał, daj kciuk w górę pod odpowiedzią Ani.')
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const ostatnia = czat.wiadomosci[czat.wiadomosci.length - 1]
  const ostatniaAni = [...czat.wiadomosci].reverse().find((m) => m.kto === 'ania')
  const nastroj = czat.pisanie === 'model' ? 'mysli' : ostatniaAni ? nastrojWiadomosci(ostatniaAni) : 'wita'
  const bezPytan = !czat.wiadomosci.some((m) => m.kto === 'ty')
  const KAFELKI = [
    { ikona: '🧊', tytul: 'Co mam w lodówce?', opis: 'zaznacz składniki', akcja: () => setOkno('lodowka') },
    { ikona: '⚡', tytul: 'Szybko, do 15 minut', opis: 'gdy burczy w brzuchu', akcja: () => wyslij('Chcę coś szybkiego, najlepiej do 15 minut.', true) },
    { ikona: '🍰', tytul: 'Coś na słodko', opis: 'deser albo śniadanie', akcja: () => wyslij('Mam ochotę na coś słodkiego.', true) },
    { ikona: '🎲', tytul: 'Zaskocz mnie', opis: 'Ania wybierze za Ciebie', akcja: () => wyslij('Zaskocz mnie! Wybierz dla mnie jakieś danie.', true) },
  ]
  const startowe = (
    <div className="kafelki-startowe">
      {KAFELKI.map((k) => (
        <button key={k.tytul} className="kafelek-start" onClick={k.akcja}>
          <span className="emoji" aria-hidden="true">
            {k.ikona}
          </span>
          <b>{k.tytul}</b>
          <small>{k.opis}</small>
        </button>
      ))}
      <button className="kafelek-start szeroki" onClick={() => setOkno('ksiazka')}>
        <span className="emoji" aria-hidden="true">
          📖
        </span>
        <b>Przeglądaj wszystkie przepisy ({baza.przepisy.length})</b>
      </button>
    </div>
  )
  const podpowiedzi = ostatnia?.kto === 'ania' && !ostatnia.strumien && !czat.pisanie ? ostatnia.podpowiedzi || [] : []

  return (
    <div className="aplikacja">
      <header className="naglowek">
        <AniaAvatar rozmiar={44} nastroj={nastroj} />
        <div className="tytul">
          <h1>Ania</h1>
          <span className="znaczek-ai">asystentka AI · nie człowiek</span>
        </div>
        <button className="ikona" title="Książka przepisów" aria-label="Książka przepisów" onClick={() => setOkno('ksiazka')}>
          <Ikona d={['M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z', 'M4 21V5', 'M8 7h7', 'M8 11h5']} />
        </button>
        <button className="ikona" title="Nowa rozmowa" aria-label="Nowa rozmowa" onClick={() => czat.nowaRozmowa('uzytkownik')}>
          <Ikona d={['M3 12a9 9 0 1 0 3-6.7', 'M3 3v6h6']} />
        </button>
        <button className="ikona" title="Zapis rozmowy" aria-label="Zapis rozmowy" onClick={() => setOkno('zapis')}>
          <Ikona d={['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14']} />
        </button>
        <button className="ikona" title="Ustawienia" aria-label="Ustawienia" onClick={() => setOkno('ustawienia')}>
          <Ikona d={['M4 7h10', 'M18 7h2', 'M4 17h2', 'M10 17h10', 'M16 5v4', 'M8 15v4']} />
        </button>
      </header>

      <nav className="preferencje" aria-label="Preferencje dietetyczne">
        <span>Moja dieta:</span>
        {PREFERENCJE.map((p) => (
          <button key={p.id} className="przelacznik" aria-pressed={ustawienia.preferencje.includes(p.id)} onClick={() => przelaczPreferencje(p.id)}>
            {p.nazwa}
          </button>
        ))}
      </nav>

      <main className="czat" ref={lista} aria-live="polite">
        {czat.wiadomosci.map((m) => (
          <Wiadomosc
            key={m.id}
            m={m}
            bazaPoId={bazaPoId}
            przepisy={baza.przepisy}
            onOcena={czat.ocen}
            onPonow={czat.ponow}
            onUstawienia={() => setOkno('ustawienia')}
            onNowa={() => czat.nowaRozmowa('uzytkownik')}
            onWyslij={(t) => wyslij(t, true)}
            onListaZakupow={(przepis, mnoznik, porcje) => setZakupy({ przepis, mnoznik, porcje })}
            onGotuj={(przepis, mnoznik, porcje) => setGotowanie({ przepis, mnoznik, porcje })}
            start={m.start && bezPytan ? startowe : null}
          />
        ))}
        {czat.pisanie === 'model' && (
          <div className="wiersz ania">
            <AniaAvatar rozmiar={32} nastroj="mysli" />
            <div className="dymek kropki" aria-label="Ania pisze">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </main>

      <div className="pod-czatem">
        {czat.pisanie === 'czeka' && <p className="czeka">Ania czeka, czy dopiszesz coś jeszcze…</p>}
        {podpowiedzi.length > 0 && (
          <div className="podpowiedzi">
            {podpowiedzi.map((p) => (
              <button key={p} className="podpowiedz" onClick={() => wyslij(p, true)}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <footer className="stopka-czatu">
        <form
          className="pole"
          onSubmit={(e) => {
            e.preventDefault()
            wyslij()
          }}
        >
          <button type="button" className="lodowka-przycisk" title="Co mam w lodówce?" aria-label="Wybierz składniki z lodówki" onClick={() => setOkno('lodowka')}>
            🧊
          </button>
          <textarea
            ref={pole}
            rows={1}
            maxLength={1500}
            value={tekst}
            placeholder="Napisz, co masz w lodówce albo co chcesz ugotować…"
            aria-label="Twoja wiadomość"
            onChange={(e) => {
              setTekst(e.target.value)
              czat.piszeUzytkownik()
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                wyslij()
                e.target.style.height = 'auto'
              }
            }}
          />
          <button className="wyslij" type="submit" aria-label="Wyślij" disabled={!tekst.trim()}>
            <Ikona d={['M5 12h14', 'm13 6 6 6-6 6']} />
          </button>
        </form>
        <p className="uwaga">Ania to program AI, a nie człowiek, i może się mylić. Alergeny sprawdzaj na etykietach. Nie podawaj danych osobowych.</p>
      </footer>

      <Ustawienia otwarte={okno === 'ustawienia'} ustawienia={ustawienia} klucz={klucz} onZapisz={zapiszUstawienia} onZamknij={() => setOkno(null)} />
      <ZapisRozmowy otwarte={okno === 'zapis'} onZamknij={() => setOkno(null)} meta={czat.metadane} log={czat.log} />
      <ListaZakupow dane={zakupy} onZamknij={() => setZakupy(null)} />
      <Lodowka
        otwarte={okno === 'lodowka'}
        onZamknij={() => setOkno(null)}
        przepisy={baza.przepisy}
        preferencje={ustawienia.preferencje}
        onSzukaj={(t, dopisek) => wyslij(t, true, dopisek)}
      />
      <KsiazkaPrzepisow
        otwarte={okno === 'ksiazka'}
        onZamknij={() => setOkno(null)}
        przepisy={baza.przepisy}
        preferencje={ustawienia.preferencje}
        onWybierz={(p) => {
          setOkno(null)
          wyslij(`Poproszę przepis: ${p.nazwa}`, true)
        }}
      />
      <TrybGotowania
        dane={gotowanie}
        onZamknij={zamknijGotowanie}
        onZapytaj={(t) => {
          setGotowanie(null)
          wyslij(t, true)
        }}
      />
    </div>
  )
}
