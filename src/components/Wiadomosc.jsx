import { useState } from 'react'
import AniaAvatar from './AniaAvatar.jsx'
import KartaPrzepisu from './KartaPrzepisu.jsx'
import Ilustracja from './Ilustracja.jsx'
import { czasPrzepisu } from '../bot/jednostki.js'

const godz = (iso) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })

function Kciuk({ dol, ...props }) {
  return (
    <button className="ocena" {...props}>
      <svg viewBox="0 0 24 24" aria-hidden="true" style={dol ? { transform: 'rotate(180deg)' } : undefined}>
        <path d="M7 10v11H3V10z" />
        <path d="M7 10l4-8a3 3 0 0 1 3 3v4h5.5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.1 21H7" />
      </svg>
    </button>
  )
}

export const nastrojWiadomosci = (m) => (m.przepisy?.length ? 'radosc' : m.brak || m.katalog ? 'oops' : 'wita')

function WpiszKlucz({ onZapisz, onUstawienia }) {
  const [k, setK] = useState('')
  return (
    <form
      className="wpisz-klucz"
      onSubmit={(e) => {
        e.preventDefault()
        if (k.trim()) onZapisz(k.trim())
      }}
    >
      <input type="password" placeholder="Wklej klucz API (np. AIza…)" value={k} onChange={(e) => setK(e.target.value)} autoComplete="off" spellCheck="false" aria-label="Klucz API" />
      <button className="przycisk maly" type="submit" disabled={!k.trim()}>
        Zapisz
      </button>
      <span className="uwaga-mala">
        Nie masz klucza? Darmowy weźmiesz w{' '}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
          Google AI Studio
        </a>{' '}
        (aistudio.google.com/apikey). Inny dostawca?{' '}
        <button type="button" className="link-przycisk" onClick={onUstawienia}>
          Ustawienia
        </button>
      </span>
    </form>
  )
}

function PropozycjaPamieci({ m, onDecyzja, onPokazPamiec }) {
  const opis = m.propozycje.map((w) => `${m.etykiety?.[w.typ] || w.typ}: ${w.wartosc}`)
  return (
    <div className="wiersz ania">
      <span className="ikona-pamieci" aria-hidden="true">
        🧠
      </span>
      <div className="karta-pamieci">
        <b>Zapamiętać na kolejne rozmowy?</b>
        <ul>
          {opis.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {m.stan === 'czeka' ? (
          <>
            {m.pierwszyRaz && (
              <p className="uwaga-mala">
                Ania zapisze to tylko w tej przeglądarce, nie na serwerze. W każdej chwili możesz to przejrzeć i usunąć w panelu pamięci (ikona 🧠 u góry).
              </p>
            )}
            <div className="karta-akcje">
              <button className="przycisk maly" onClick={() => onDecyzja(m, 'tak')}>
                Zapamiętaj
              </button>
              <button className="przycisk drugi maly" onClick={() => onDecyzja(m, 'nie')}>
                Nie teraz
              </button>
              <button className="link-przycisk maly" onClick={() => onDecyzja(m, 'nigdy')}>
                Nie zapamiętuj niczego
              </button>
            </div>
          </>
        ) : (
          <p className="uwaga-mala">
            {m.stan === 'tak' ? (
              <>
                Zapamiętane.{' '}
                <button className="link-przycisk" onClick={onPokazPamiec}>
                  Zobacz pamięć
                </button>
              </>
            ) : m.stan === 'nigdy' ? (
              'Dobrze, Ania nie będzie niczego zapamiętywać. Możesz to zmienić w panelu pamięci.'
            ) : (
              'Nie zapisano.'
            )}
          </p>
        )}
      </div>
    </div>
  )
}

export default function Wiadomosc({ m, bazaPoId, przepisy, onOcena, onPonow, onUstawienia, onNowa, onWyslij, onListaZakupow, onGotuj, start, onDecyzjaPamieci, onPokazPamiec, onZapiszKlucz }) {
  if (m.kto === 'pamiec') return <PropozycjaPamieci m={m} onDecyzja={onDecyzjaPamieci} onPokazPamiec={onPokazPamiec} />

  if (m.kto === 'system')
    return (
      <div className="systemowa">
        {m.tekst}
        {m.akcja === 'nowa-rozmowa' && (
          <div>
            <button className="przycisk drugi maly" onClick={onNowa}>
              Nowa rozmowa
            </button>
          </div>
        )}
        {m.akcja === 'klucz' && <WpiszKlucz onZapisz={(k) => onZapiszKlucz(k, m.id)} onUstawienia={onUstawienia} />}
        {m.akcja === 'ustawienia' && (
          <div>
            <button className="przycisk maly" onClick={onUstawienia}>
              Otwórz ustawienia
            </button>
          </div>
        )}
      </div>
    )

  if (m.kto === 'blad')
    return (
      <div className="blad" role="alert">
        <p>{m.tekst}</p>
        <div className="karta-akcje">
          {['brak-klucza', 'brak-modelu', 'klucz', 'model', 'limit'].includes(m.rodzaj) && (
            <button className="przycisk drugi maly" onClick={onUstawienia}>
              Ustawienia
            </button>
          )}
          {m.rodzaj !== 'brak-klucza' && (
            <button className="przycisk maly" onClick={() => onPonow(m.id, m.ponow)}>
              Spróbuj ponownie
            </button>
          )}
        </div>
      </div>
    )

  if (m.kto === 'ty')
    return (
      <div className="wiersz ty">
        <div className="dymek">{m.tekst}</div>
        <div className="podpis">{godz(m.czas)}</div>
      </div>
    )

  return (
    <div className="wiersz ania">
      <AniaAvatar rozmiar={32} nastroj={nastrojWiadomosci(m)} />
      <div className="tresc-ani">
        <div className={`dymek${m.strumien ? ' pisze-teraz' : ''}`}>{m.tekst}</div>
        {(m.przepisy || []).map((id) =>
          bazaPoId[id] ? <KartaPrzepisu key={id} przepis={bazaPoId[id]} onListaZakupow={onListaZakupow} onGotuj={onGotuj} /> : null,
        )}
        {start}
        {m.katalog && (
          <div className="katalog">
            {przepisy.map((p) => (
              <button key={p.id} className="kafelek" onClick={() => onWyslij(`Poproszę przepis: ${p.nazwa}`)}>
                <Ilustracja rodzaj={p.ilustracja} kategoria={p.kategoria} rozmiar={44} />
                <span>
                  <b>{p.nazwa}</b>
                  <small>
                    {p.kategoria}
                    {czasPrzepisu(p) != null ? ` · ${czasPrzepisu(p)} min` : ''}
                  </small>
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="podpis">
          Ania (AI) · {godz(m.czas)}
          {m.ocenialna && !m.strumien && (
            <>
              <Kciuk aria-label="Dobra odpowiedź" title="Dobra odpowiedź" aria-pressed={m.ocena === 'dobra'} disabled={!!m.ocena} onClick={() => onOcena(m.id, 'dobra')} />
              <Kciuk dol aria-label="Zła odpowiedź" title="Zła odpowiedź" aria-pressed={m.ocena === 'zła'} disabled={!!m.ocena} onClick={() => onOcena(m.id, 'zła')} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
