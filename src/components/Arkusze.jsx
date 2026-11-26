// Wysuwane panele: lodówka (wybór składników) i książka przepisów.
import { useEffect, useMemo, useRef, useState } from 'react'
import { GRUPY_SKLADNIKOW, dopasujPrzepisy } from '../data/lodowka.js'
import { czasPrzepisu } from '../bot/jednostki.js'
import { TYPY } from '../bot/pamiec.js'
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

export function Lodowka({ otwarte, onZamknij, przepisy, pasuje, onSzukaj }) {
  const [wybrane, setWybrane] = useState([])
  const dopasowane = useMemo(() => dopasujPrzepisy(przepisy, wybrane).filter((w) => pasuje(w.p)), [przepisy, wybrane, pasuje])
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

const KATEGORIE = ['wszystkie', 'śniadanie', 'zupa', 'obiad', 'kolacja', 'przekąska', 'deser']

export function KsiazkaPrzepisow({ otwarte, onZamknij, przepisy, pasuje, opisOgraniczen, onWybierz }) {
  const [szukaj, setSzukaj] = useState('')
  const [kategoria, setKategoria] = useState('wszystkie')
  const [szybkie, setSzybkie] = useState(false)
  const lista = przepisy.filter((p) => {
    const tekst = (p.nazwa + ' ' + p.skladniki.map((s) => s.n).join(' ')).toLowerCase()
    const czas = czasPrzepisu(p)
    return (
      (!szukaj || tekst.includes(szukaj.toLowerCase())) &&
      (kategoria === 'wszystkie' || p.kategoria === kategoria) &&
      (!szybkie || (czas != null && czas <= 15)) &&
      pasuje(p)
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
      {opisOgraniczen && <p className="opis-arkusza">Pokazuję tylko dania, które pasują do: {opisOgraniczen}.</p>}
      <p className="opis-arkusza">
        {lista.length} z {przepisy.length} przepisów
      </p>
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

export function PanelPamieci({ otwarte, onZamknij, pamiec, bazaPoId, onUsunWpis, onZgoda, onWyczysc }) {
  const [potwierdz, setPotwierdz] = useState(false)
  const zamknij = () => {
    setPotwierdz(false)
    onZamknij()
  }
  const pusta = !pamiec.wpisy.length && !pamiec.ugotowane.length && !pamiec.ulubione.length
  return (
    <Arkusz otwarte={otwarte} onZamknij={zamknij} tytul="Co Ania o mnie pamięta">
      <p className="opis-arkusza">
        Pamięć jest zapisana tylko w tej przeglądarce na tym urządzeniu. Nie trafia na serwer zespołu. Do modelu AI Ania wysyła ją tylko jako
        krótką notatkę, żeby dopasować przepisy.
      </p>
      <label className="wybor-pamieci">
        <input type="checkbox" checked={pamiec.zgoda === true} onChange={(e) => onZgoda(e.target.checked)} />
        <span>Ania może zapamiętywać informacje z rozmów (zawsze pyta przed zapisaniem)</span>
      </label>
      {pusta && <p className="opis-arkusza">Na razie Ania nic o Tobie nie pamięta.</p>}
      {Object.entries(TYPY).map(([typ, etykieta]) => {
        const w = pamiec.wpisy.filter((x) => x.typ === typ)
        if (!w.length) return null
        return (
          <section key={typ} className="grupa-pamieci">
            <h3>{etykieta}</h3>
            <div className="skladniki-siatka">
              {w.map((x) => (
                <span key={x.wartosc} className="wpis-pamieci">
                  {x.wartosc}
                  <button aria-label={`Usuń: ${x.wartosc}`} title="Usuń" onClick={() => onUsunWpis(x)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </section>
        )
      })}
      {pamiec.ugotowane.length > 0 && (
        <section className="grupa-pamieci">
          <h3>Ostatnio ugotowane</h3>
          <ul className="lista-pamieci">
            {pamiec.ugotowane.slice(0, 8).map((u) => (
              <li key={u.id}>
                {u.nazwa} <small>{new Date(u.data).toLocaleDateString('pl-PL')}</small>
              </li>
            ))}
          </ul>
        </section>
      )}
      {pamiec.ulubione.length > 0 && (
        <section className="grupa-pamieci">
          <h3>Ulubione (kciuk w górę)</h3>
          <ul className="lista-pamieci">
            {pamiec.ulubione.map((id) => bazaPoId[id] && <li key={id}>{bazaPoId[id].nazwa}</li>)}
          </ul>
        </section>
      )}
      {!pusta && (
        <div className="karta-akcje">
          {potwierdz ? (
            <>
              <span className="opis-arkusza">Na pewno usunąć całą pamięć?</span>
              <button className="przycisk maly" onClick={() => { onWyczysc(); setPotwierdz(false) }}>
                Tak, usuń
              </button>
              <button className="przycisk drugi maly" onClick={() => setPotwierdz(false)}>
                Anuluj
              </button>
            </>
          ) : (
            <button className="przycisk drugi maly" onClick={() => setPotwierdz(true)}>
              Usuń całą pamięć
            </button>
          )}
        </div>
      )}
    </Arkusz>
  )
}
