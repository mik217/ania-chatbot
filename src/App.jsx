import { useEffect, useMemo, useRef, useState } from 'react'
import AniaAvatar from './components/AniaAvatar.jsx'
import Wiadomosc from './components/Wiadomosc.jsx'
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

  const wyslij = (t = tekst, odRazu = false) => {
    if (!t.trim()) return
    czat.wyslij(t, { odRazu })
    if (t === tekst) setTekst('')
    pole.current?.focus()
  }

  const ostatnia = czat.wiadomosci[czat.wiadomosci.length - 1]
  const podpowiedzi = ostatnia?.kto === 'ania' && !ostatnia.strumien && !czat.pisanie ? ostatnia.podpowiedzi || [] : []

  return (
    <div className="aplikacja">
      <header className="naglowek">
        <AniaAvatar rozmiar={44} />
        <div className="tytul">
          <h1>Ania</h1>
          <span className="znaczek-ai">asystentka AI · nie człowiek</span>
        </div>
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
    </div>
  )
}
