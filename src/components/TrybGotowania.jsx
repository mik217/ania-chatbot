// Pełnoekranowe gotowanie krok po kroku: duży tekst, minutniki, ekran nie gaśnie.
import { useEffect, useRef, useState } from 'react'
import { opisSkladnika } from '../bot/jednostki.js'
import Ilustracja from './Ilustracja.jsx'

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, '0')}`

let audio
function dzwiek(razy) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)()
    for (let r = 0; r < razy; r++) {
      const o = audio.createOscillator()
      const g = audio.createGain()
      const t = audio.currentTime + r * 0.55
      o.frequency.value = r % 2 ? 1046 : 880
      o.connect(g)
      g.connect(audio.destination)
      g.gain.setValueAtTime(0.25, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
      o.start(t)
      o.stop(t + 0.5)
    }
  } catch {
    /* dźwięk niedostępny */
  }
}

export default function TrybGotowania({ dane, onZamknij, onZapytaj }) {
  const [krok, setKrok] = useState(0)
  const [odhaczone, setOdhaczone] = useState([])
  const [minutniki, setMinutniki] = useState([]) // {id, krok, etykieta, koniec, zadzwonil}
  const [, setTik] = useState(0)
  const blokada = useRef(null)

  const p = dane?.przepis
  const otwarte = !!p

  useEffect(() => {
    if (!otwarte) return
    setKrok(0)
    setOdhaczone([])
    setMinutniki([])
    navigator.wakeLock
      ?.request('screen')
      .then((b) => (blokada.current = b))
      .catch(() => {})
    const onEsc = (e) => e.key === 'Escape' && onZamknij()
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('keydown', onEsc)
      blokada.current?.release?.().catch?.(() => {})
      blokada.current = null
    }
  }, [otwarte, onZamknij])

  // odliczanie minutników
  useEffect(() => {
    if (!minutniki.some((m) => !m.zadzwonil)) return
    const t = setInterval(() => {
      setTik((x) => x + 1)
      setMinutniki((lista) =>
        lista.map((m) => {
          if (!m.zadzwonil && Date.now() >= m.koniec) {
            dzwiek(4)
            try {
              navigator.vibrate?.([300, 150, 300, 150, 300])
            } catch {
              /* brak wibracji */
            }
            return { ...m, zadzwonil: true }
          }
          return m
        }),
      )
    }, 250)
    return () => clearInterval(t)
  }, [minutniki])

  if (!otwarte) return null
  const { mnoznik, porcje } = dane
  const n = p.kroki.length
  const k = krok > 0 ? p.kroki[krok - 1] : null
  const minutnikKroku = minutniki.find((m) => m.krok === krok)

  const wlaczMinutnik = () => {
    dzwiek(0) // odblokowanie dźwięku w przeglądarce po kliknięciu
    setMinutniki((l) => [
      ...l.filter((m) => m.krok !== krok),
      { id: Date.now(), krok, etykieta: `Krok ${krok}`, koniec: Date.now() + k.min * 60000, zadzwonil: false },
    ])
  }
  const usunMinutnik = (id) => setMinutniki((l) => l.filter((m) => m.id !== id))

  return (
    <div className="gotowanie" role="dialog" aria-modal="true" aria-label={`Gotowanie: ${p.nazwa}`}>
      <div className="gotowanie-gora">
        <Ilustracja rodzaj={p.ilustracja} kategoria={p.kategoria} rozmiar={40} />
        <h2>{p.nazwa}</h2>
        <button className="ikona" aria-label="Zakończ gotowanie" onClick={onZamknij}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <div className="kropki-krokow" aria-hidden="true">
        {Array.from({ length: n + 1 }, (_, i) => (
          <span key={i} className={i < krok ? 'zrobione' : i === krok ? 'teraz' : ''} />
        ))}
      </div>

      {minutniki.length > 0 && (
        <div className="minutniki">
          {minutniki.map((m) => {
            const zostalo = (m.koniec - Date.now()) / 1000
            return (
              <button key={m.id} className={`minutnik-chip${m.zadzwonil ? ' dzwoni' : ''}`} onClick={() => (m.zadzwonil ? usunMinutnik(m.id) : setKrok(m.krok))}>
                {m.etykieta}: {m.zadzwonil ? 'gotowe! (zamknij)' : fmt(zostalo)}
              </button>
            )
          })}
        </div>
      )}

      <div className="gotowanie-srodek" key={krok}>
        {krok === 0 ? (
          <>
            <div className="numer-kroku">Najpierw przygotuj składniki{porcje ? ` (${porcje} porc.)` : ''}</div>
            <ul className="lista-do-odhaczenia">
              {p.skladniki.map((s) => {
                const t = opisSkladnika(s, mnoznik)
                const on = odhaczone.includes(t)
                return (
                  <li key={t}>
                    <label>
                      <input type="checkbox" checked={on} onChange={() => setOdhaczone((o) => (on ? o.filter((x) => x !== t) : [...o, t]))} />
                      <span>{t}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
            {mnoznik !== 1 && <p className="uwaga-mala">Ilości są przeliczone. W krokach mogą pojawić się ilości z przepisu bazowego.</p>}
          </>
        ) : (
          <>
            <div className="numer-kroku">
              Krok {krok} z {n}
            </div>
            <p className="tekst-kroku">{k.t}</p>
            {typeof k.min === 'number' && (
              <div className="minutnik-kroku">
                {minutnikKroku ? (
                  <>
                    <span className={`czas-duzy${minutnikKroku.zadzwonil ? ' koniec' : ''}`}>
                      {minutnikKroku.zadzwonil ? 'Czas minął!' : fmt((minutnikKroku.koniec - Date.now()) / 1000)}
                    </span>
                    <button className="przycisk drugi" onClick={() => usunMinutnik(minutnikKroku.id)}>
                      {minutnikKroku.zadzwonil ? 'OK' : 'Zatrzymaj'}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="czas-duzy">{fmt(k.min * 60)}</span>
                    <button className="przycisk" onClick={wlaczMinutnik}>
                      Włącz minutnik
                    </button>
                  </>
                )}
              </div>
            )}
            <button className="link-przycisk" onClick={() => onZapytaj(`Nie rozumiem kroku ${krok} w przepisie „${p.nazwa}”: „${k.t}”. Wytłumacz mi to prościej.`)}>
              Nie rozumiem tego kroku, zapytaj Anię
            </button>
          </>
        )}
      </div>

      <div className="gotowanie-dol">
        <button className="przycisk drugi duzy" disabled={krok === 0} onClick={() => setKrok((x) => x - 1)}>
          Wstecz
        </button>
        {krok < n ? (
          <button className="przycisk duzy" onClick={() => setKrok((x) => x + 1)}>
            {krok === 0 ? 'Zaczynam!' : 'Dalej'}
          </button>
        ) : (
          <button className="przycisk duzy zielony" onClick={() => onZamknij('koniec')}>
            Gotowe, smacznego!
          </button>
        )}
      </div>
    </div>
  )
}
