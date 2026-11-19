// Okna pomocnicze: lista zakupów i zapis rozmowy.
import { useEffect, useRef, useState } from 'react'
import { opisSkladnika } from '../bot/jednostki.js'

function Okno({ otwarte, onZamknij, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (otwarte && !d.open) d.showModal()
    if (!otwarte && d.open) d.close()
  }, [otwarte])
  return (
    <dialog ref={ref} className="okno" onClose={onZamknij} onCancel={onZamknij}>
      {otwarte && children}
    </dialog>
  )
}

async function kopiuj(tekst, setInfo, ok) {
  try {
    await navigator.clipboard.writeText(tekst)
    setInfo(ok)
  } catch {
    setInfo('Nie udało się skopiować. Zaznacz tekst i skopiuj go ręcznie.')
  }
}

export function ListaZakupow({ dane, onZamknij }) {
  const [info, setInfo] = useState('')
  if (!dane) return <Okno otwarte={false} onZamknij={onZamknij} />
  const { przepis: p, mnoznik, porcje } = dane
  const pozycje = p.skladniki.map((s) => opisSkladnika(s, mnoznik))
  const tekst = `Lista zakupów – ${p.nazwa} (${porcje} porc.)\n` + pozycje.map((t) => '- ' + t).join('\n')
  return (
    <Okno otwarte onZamknij={() => { setInfo(''); onZamknij() }}>
      <h2>Lista zakupów</h2>
      <p className="opis">
        {p.nazwa}, {porcje} porc.
      </p>
      <ul className="lista-zakupow">
        {pozycje.map((t) => (
          <li key={t}>
            <label>
              <input type="checkbox" /> <span>{t}</span>
            </label>
          </li>
        ))}
      </ul>
      {info && <p className="opis">{info}</p>}
      <div className="stopka">
        <button className="przycisk drugi" onClick={() => kopiuj(tekst, setInfo, 'Skopiowano listę.')}>
          Kopiuj listę
        </button>
        <button className="przycisk" onClick={onZamknij}>
          Zamknij
        </button>
      </div>
    </Okno>
  )
}

export function zapisTxt(meta, log) {
  let ostatnia = null
  const linie = log.map((w) => {
    const sep = w.rozmowa !== ostatnia ? `\n--- rozmowa ${w.rozmowa} ---\n` : ''
    ostatnia = w.rozmowa
    const kto = w.kto === 'ty' ? 'Użytkownik' : w.kto === 'ania' ? `Ania [${w.zrodlo}]` : w.kto === 'blad' ? `BŁĄD [${w.rodzaj}]` : 'System'
    const przepisy = w.przepisy?.length ? `  (karta przepisu: ${w.przepisy.join(', ')})` : ''
    return `${sep}[${new Date(w.czas).toLocaleTimeString('pl-PL')}] ${kto}: ${w.tekst}${przepisy}${w.ocena ? `  (ocena: ${w.ocena})` : ''}`
  })
  return (
    `Zapis rozmowy – ${meta.aplikacja}\nData eksportu: ${new Date().toLocaleString('pl-PL')}\n` +
    `Dostawca: ${meta.dostawca}, model: ${meta.model}\nPreferencje: ${meta.preferencje.join(', ') || 'brak'}\n` +
    linie.join('\n') +
    '\n'
  )
}

function pobierz(nazwa, tresc, typ) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([tresc], { type: typ }))
  a.download = nazwa
  document.body.append(a)
  a.click()
  a.remove()
}

export function ZapisRozmowy({ otwarte, onZamknij, meta, log }) {
  const [info, setInfo] = useState('')
  const nazwa = (ext) => `rozmowa_ania_${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.${ext}`
  return (
    <Okno otwarte={otwarte} onZamknij={() => { setInfo(''); onZamknij() }}>
      <h2>Zapis rozmowy</h2>
      <p className="opis">
        Wiadomości, oceny odpowiedzi i model AI. Dane osobowe zostały usunięte już przy wysyłaniu. Przyda się jako załącznik do raportu z ewaluacji.
      </p>
      <div className="rzad zawijaj">
        <button className="przycisk" onClick={() => pobierz(nazwa('txt'), zapisTxt(meta(), log()), 'text/plain;charset=utf-8')}>
          Pobierz .txt
        </button>
        <button className="przycisk drugi" onClick={() => pobierz(nazwa('json'), JSON.stringify({ ...meta(), wiadomosci: log() }, null, 2), 'application/json')}>
          Pobierz .json
        </button>
        <button className="przycisk drugi" onClick={() => kopiuj(zapisTxt(meta(), log()), setInfo, 'Skopiowano zapis.')}>
          Kopiuj
        </button>
      </div>
      {info && <p className="opis">{info}</p>}
      <div className="stopka">
        <button className="przycisk drugi" onClick={onZamknij}>
          Zamknij
        </button>
      </div>
    </Okno>
  )
}
