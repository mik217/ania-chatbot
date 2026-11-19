// Wysuwane panele: lodówka (wybór składników) i książka przepisów.
import { useEffect, useMemo, useRef, useState } from 'react'
import { GRUPY_SKLADNIKOW, dopasujPrzepisy } from '../data/lodowka.js'
import { czasPrzepisu } from '../bot/jednostki.js'
import { PREFERENCJE } from '../bot/prompt.js'
import Ilustracja from './Ilustracja.jsx'

export function Arkusz({ otwarte, onZamknij, tytul, children, stopka }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (otwarte && !d.open) d.showModal()
    if (!otwarte && d.open) d.close()
  }, [otwarte])
  return (
    <dialog
      ref={ref}
      className="arkusz"
      onClose={onZamknij}
      onCancel={onZamknij}
      onClick={(e) => {
        if (e.target === ref.current) onZamknij()
      }}
    >
      {otwarte && (
        <div className="arkusz-wnetrze">
          <div className="arkusz-gora">
            <h2>{tytul}</h2>
            <button className="ikona" aria-label="Zamknij" onClick={onZamknij}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <div className="arkusz-tresc">{children}</div>
          {stopka && <div className="arkusz-stopka">{stopka}</div>}
        </div>
      )}
    </dialog>
  )
}

export function Lodowka({ otwarte, onZamknij, przepisy, preferencje, onSzukaj }) {
  const [wybrane, setWybrane] = useState([])
  const prefs = PREFERENCJE.filter((p) => preferencje.includes(p.id))
  const dopasowane = useMemo(
    () => dopasujPrzepisy(przepisy, wybrane).filter((w) => prefs.every((pr) => pr.pasuje(w.p))),
    [przepisy, wybrane, prefs],
  )
  const przelacz = (n) => setWybrane((w) => (w.includes(n) ? w.filter((x) => x !== n) : [...w, n]))
  const zamknij = () => {
    setWybrane([])
    onZamknij()
  }
  return (
    <Arkusz
      otwarte={otwarte}
      onZamknij={zamknij}
      tytul="Co masz w lodówce?"
      stopka={
        <>
          <span className="licznik-dopasowan">
            {wybrane.length === 0
              ? 'Zaznacz, co masz w domu'
              : dopasowane.length
                ? `Pasuje do ${dopasowane.length} ${dopasowane.length === 1 ? 'przepisu' : 'przepisów'}`
                : 'Jeszcze nic nie pasuje, dodaj coś'}
          </span>
          <button
            className="przycisk duzy"
            disabled={!wybrane.length}
            onClick={() => {
              const lista = wybrane.join(', ')
              const nazwy = dopasowane.slice(0, 3).map((w) => w.p.nazwa)
              onSzukaj(
                `Mam w domu: ${lista}. Co mogę z tego ugotować?`,
                nazwy.length ? `(Informacja od aplikacji, niewidoczna dla rozmówcy: z tych składników najlepiej pasują przepisy: ${nazwy.join(', ')}.)` : '',
              )
              zamknij()
            }}
          >
            Zapytaj Anię
          </button>
        </>
      }
    >
      <p className="opis-arkusza">Sól, pieprz, olej i przyprawy zakładamy, że masz.</p>
      {GRUPY_SKLADNIKOW.map((g) => (
        <section key={g.nazwa} className="grupa-skladnikow">
          <h3>{g.nazwa}</h3>
          <div className="skladniki-siatka">
            {g.skladniki.map((s) => (
              <button key={s.n} className="skladnik" aria-pressed={wybrane.includes(s.n)} onClick={() => przelacz(s.n)}>
                <span className="emoji" aria-hidden="true">
                  {s.ikona}
                </span>
                {s.n}
              </button>
            ))}
          </div>
        </section>
      ))}
    </Arkusz>
  )
}

const KATEGORIE = ['wszystkie', 'śniadanie', 'obiad', 'kolacja', 'przekąska', 'deser']

export function KsiazkaPrzepisow({ otwarte, onZamknij, przepisy, preferencje, onWybierz }) {
  const [szukaj, setSzukaj] = useState('')
  const [kategoria, setKategoria] = useState('wszystkie')
  const [szybkie, setSzybkie] = useState(false)
  const prefs = PREFERENCJE.filter((p) => preferencje.includes(p.id))
  const lista = przepisy.filter((p) => {
    const tekst = (p.nazwa + ' ' + p.skladniki.map((s) => s.n).join(' ')).toLowerCase()
    const czas = czasPrzepisu(p)
    return (
      (!szukaj || tekst.includes(szukaj.toLowerCase())) &&
      (kategoria === 'wszystkie' || p.kategoria === kategoria) &&
      (!szybkie || (czas != null && czas <= 15)) &&
      prefs.every((pr) => pr.pasuje(p))
    )
  })
  return (
    <Arkusz otwarte={otwarte} onZamknij={onZamknij} tytul="Książka przepisów">
      <input className="szukajka" type="search" placeholder="Szukaj dania albo składnika…" value={szukaj} onChange={(e) => setSzukaj(e.target.value)} />
      <div className="filtry">
        {KATEGORIE.map((k) => (
          <button key={k} className="przelacznik" aria-pressed={kategoria === k} onClick={() => setKategoria(k)}>
            {k}
          </button>
        ))}
        <button className="przelacznik" aria-pressed={szybkie} onClick={() => setSzybkie((s) => !s)}>
          do 15 min
        </button>
      </div>
      {prefs.length > 0 && <p className="opis-arkusza">Pokazuję tylko dania pasujące do diety: {prefs.map((p) => p.nazwa).join(', ')}.</p>}
      <div className="katalog">
        {lista.map((p) => (
          <button key={p.id} className="kafelek" onClick={() => onWybierz(p)}>
            <Ilustracja rodzaj={p.ilustracja} kategoria={p.kategoria} rozmiar={44} />
            <span>
              <b>{p.nazwa}</b>
              <small>
                {p.kategoria}
                {czasPrzepisu(p) != null ? ` · ${czasPrzepisu(p)} min` : ''} · {p.trudnosc}
              </small>
            </span>
          </button>
        ))}
        {!lista.length && <p className="opis-arkusza">Nic nie znalazłam. Zmień filtry albo zapytaj Anię w czacie.</p>}
      </div>
    </Arkusz>
  )
}
