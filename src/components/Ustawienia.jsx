import { useEffect, useRef, useState } from 'react'
import { DOSTAWCY } from '../config.js'

export default function Ustawienia({ otwarte, ustawienia, klucz, onZapisz, onZamknij }) {
  const ref = useRef(null)
  const [f, setF] = useState(null)
  const [pokaz, setPokaz] = useState(false)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (otwarte) {
      setF({ ...ustawienia, modele: { ...ustawienia.modele }, klucz })
      setPokaz(false)
      if (!d.open) d.showModal()
    } else if (d.open) d.close()
  }, [otwarte, ustawienia, klucz])

  const dostawca = f ? DOSTAWCY[f.dostawca] : null
  const ustaw = (zmiany) => setF((s) => ({ ...s, ...zmiany }))

  return (
    <dialog ref={ref} className="okno" onClose={onZamknij} onCancel={onZamknij}>
      {f && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const { klucz: k, ...u } = f
            onZapisz(u, k.trim())
          }}
        >
          <h2>Ustawienia</h2>
          <p className="opis">
            Ania działa na darmowym modelu AI. Wybierz dostawcę i wklej własny klucz API. Klucz nie jest zapisany w kodzie i trafia tylko do wybranego dostawcy.
          </p>

          <label htmlFor="dostawca">Dostawca modelu AI</label>
          <select id="dostawca" value={f.dostawca} onChange={(e) => ustaw({ dostawca: e.target.value })}>
            {Object.entries(DOSTAWCY).map(([id, d]) => (
              <option key={id} value={id}>
                {d.nazwa}
              </option>
            ))}
          </select>
          {dostawca.link && (
            <p className="opis">
              <a href={dostawca.link} target="_blank" rel="noopener noreferrer">
                {dostawca.linkOpis}
              </a>
            </p>
          )}

          <label htmlFor="model">Model</label>
          <input
            id="model"
            type="text"
            spellCheck="false"
            autoComplete="off"
            value={f.modele[f.dostawca] ?? dostawca.model}
            onChange={(e) => ustaw({ modele: { ...f.modele, [f.dostawca]: e.target.value } })}
          />

          {f.dostawca === 'wlasny' && (
            <>
              <label htmlFor="url">Adres API (kończy się na /chat/completions)</label>
              <input id="url" type="url" spellCheck="false" value={f.urlWlasny || ''} onChange={(e) => ustaw({ urlWlasny: e.target.value })} />
            </>
          )}

          <label htmlFor="klucz">Klucz API</label>
          <div className="rzad">
            <input
              id="klucz"
              type={pokaz ? 'text' : 'password'}
              spellCheck="false"
              autoComplete="off"
              placeholder="Wklej klucz API"
              value={f.klucz}
              onChange={(e) => ustaw({ klucz: e.target.value })}
            />
            <button type="button" className="przycisk drugi" onClick={() => setPokaz((p) => !p)}>
              {pokaz ? 'Ukryj' : 'Pokaż'}
            </button>
          </div>
          <label className="wybor">
            <input type="checkbox" checked={f.pamietajKlucz !== false} onChange={(e) => ustaw({ pamietajKlucz: e.target.checked })} />
            <span>Pamiętaj klucz na tym urządzeniu (nie trzeba go wpisywać ponownie). Odznacz na cudzym komputerze.</span>
          </label>
          {f.klucz && (
            <button type="button" className="link-przycisk" onClick={() => ustaw({ klucz: '' })}>
              Zapomnij klucz
            </button>
          )}

          <h4>Wygląd</h4>
          <label className="wybor">
            <input type="checkbox" checked={!!f.ciemny} onChange={(e) => ustaw({ ciemny: e.target.checked })} />
            <span>Ciemny motyw</span>
          </label>

          <h4>Testy</h4>
          <label className="wybor">
            <input type="checkbox" checked={!!f.trybTestowy} onChange={(e) => ustaw({ trybTestowy: e.target.checked })} />
            <span>Tryb testowy: rozmowa kończy się po 1 min bezczynności, ostrzeżenie o długiej rozmowie po 6 wiadomościach</span>
          </label>

          <div className="stopka">
            <button type="button" className="przycisk drugi" onClick={onZamknij}>
              Anuluj
            </button>
            <button type="submit" className="przycisk">
              Zapisz
            </button>
          </div>
        </form>
      )}
    </dialog>
  )
}
