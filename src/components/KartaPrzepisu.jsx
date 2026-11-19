import { useState } from 'react'
import { czasPrzepisu, opisSkladnika } from '../bot/jednostki.js'
import Ilustracja from './Ilustracja.jsx'

const odmienPorcje = (n) => (n === 1 ? 'porcja' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'porcje' : 'porcji')

export default function KartaPrzepisu({ przepis: p, onListaZakupow }) {
  const [porcje, setPorcje] = useState(p.porcje || 1)
  const [otwarte, setOtwarte] = useState(false)
  const mnoznik = porcje / (p.porcje || 1)
  const czas = czasPrzepisu(p)

  return (
    <div className="karta-przepisu">
      <div className="karta-gora">
        <Ilustracja rodzaj={p.ilustracja} kategoria={p.kategoria} rozmiar={68} />
        <div>
          {p.kategoria && <div className="kategoria">{p.kategoria}</div>}
          <h3>{p.nazwa}</h3>
          <div className="etykiety">
            {czas != null && <span className="etykieta">{czas} min</span>}
            {p.trudnosc && <span className="etykieta">{p.trudnosc}</span>}
            {p.dieta.includes('wegańskie') ? (
              <span className="etykieta zielona">wegańskie</span>
            ) : p.dieta.includes('wegetariańskie') ? (
              <span className="etykieta zielona">wegetariańskie</span>
            ) : null}
          </div>
        </div>
      </div>
      {p.alergeny.length > 0 && <p className="alergeny">Alergeny: {p.alergeny.join(', ')}</p>}

      <div className="karta-akcje">
        <div className="licznik" aria-label="Liczba porcji">
          <button onClick={() => setPorcje((n) => Math.max(1, n - 1))} aria-label="Mniej porcji">
            −
          </button>
          <output>
            {porcje} {odmienPorcje(porcje)}
          </output>
          <button onClick={() => setPorcje((n) => Math.min(12, n + 1))} aria-label="Więcej porcji">
            +
          </button>
        </div>
        <button className="przycisk" onClick={() => setOtwarte((o) => !o)} aria-expanded={otwarte}>
          {otwarte ? 'Zwiń przepis' : 'Pokaż przepis'}
        </button>
        <button className="przycisk drugi" onClick={() => onListaZakupow?.(p, mnoznik, porcje)}>
          Lista zakupów
        </button>
      </div>

      {otwarte && (
        <div className="karta-szczegoly">
          <h4>Składniki</h4>
          <ul>
            {p.skladniki.map((s) => (
              <li key={s.n}>{opisSkladnika(s, mnoznik)}</li>
            ))}
          </ul>
          <h4>Kroki</h4>
          <ol>
            {p.kroki.map((k, i) => (
              <li key={i}>
                {k.t}
                {typeof k.min === 'number' && <span className="czas-kroku"> {String(k.min).replace('.', ',')} min</span>}
              </li>
            ))}
          </ol>
          {mnoznik !== 1 && <p className="uwaga-mala">Ilości w krokach dotyczą przepisu na {p.porcje} {odmienPorcje(p.porcje)}. Lista składników powyżej jest już przeliczona.</p>}
        </div>
      )}
    </div>
  )
}
