// Odczytywanie znaczników technicznych z odpowiedzi modelu i czyszczenie tekstu.

const RE_ZNACZNIK = /\[(PRZEPIS|BRAK|CZ[LŁ]OWIEK|PODPOWIEDZI|PAMI[EĘ]TAJ|ZAPOMNIJ)[^\]]*\]/gi

export function oczyscMarkdown(t) {
  return t
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/(^|\s)\*(\S.*?\S)\*(?=\s|$)/g, '$1$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
}

// Tekst w trakcie strumieniowania: bez znaczników i bez niedokończonego „[...”
export function tekstStrumienia(surowy) {
  let s = surowy.replace(RE_ZNACZNIK, '')
  const i = s.lastIndexOf('[')
  if (i >= 0 && !s.slice(i).includes(']')) s = s.slice(0, i)
  return oczyscMarkdown(s).trimEnd()
}

export function przetworzOdpowiedz(surowa, bazaPoId, kanarek) {
  const wyciek =
    (kanarek && surowa.includes(kanarek)) ||
    /znaczniki techniczne|#\s*zatwierdzone informacje|#\s*bezpieczeństwo|<wiadomosc>/i.test(surowa)
  const przepisy = [...new Set([...surowa.matchAll(/\[PRZEPIS:\s*([\w-]+)\s*\]/gi)].map((m) => m[1].toLowerCase()))].filter(
    (id) => bazaPoId[id],
  )
  const podp = surowa.match(/\[PODPOWIEDZI:([^\]]*)\]/i)
  const podpowiedzi = podp
    ? podp[1]
        .split('|')
        .map((s) => s.trim())
        .filter((s) => s && s.length <= 60)
        .slice(0, 3)
    : []
  const pary = (re) => [...surowa.matchAll(re)].map((m) => ({ typ: m[1].trim(), wartosc: m[2].trim() }))
  return {
    pamietaj: pary(/\[PAMI[EĘ]TAJ:([^\]|]*)\|([^\]]*)\]/gi),
    zapomnij: pary(/\[ZAPOMNIJ:([^\]|]*)\|([^\]]*)\]/gi),
    tekst: oczyscMarkdown(surowa.replace(RE_ZNACZNIK, '')).trim(),
    przepisy,
    podpowiedzi,
    brak: /\[BRAK\]/i.test(surowa),
    czlowiek: /\[CZ[LŁ]OWIEK\]/i.test(surowa),
    wyciek,
  }
}
