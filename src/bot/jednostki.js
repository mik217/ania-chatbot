// Odmiana jednostek i formatowanie ilości (np. „1,5 puszki”, „3 ząbki”).

const FORMY = {
  puszka: ['puszka', 'puszki', 'puszek', 'puszki'],
  'ząbek': ['ząbek', 'ząbki', 'ząbków', 'ząbka'],
  'łyżka': ['łyżka', 'łyżki', 'łyżek', 'łyżki'],
  'łyżeczka': ['łyżeczka', 'łyżeczki', 'łyżeczek', 'łyżeczki'],
  szczypta: ['szczypta', 'szczypty', 'szczypt', 'szczypty'],
  szklanka: ['szklanka', 'szklanki', 'szklanek', 'szklanki'],
  plaster: ['plaster', 'plastry', 'plastrów', 'plastra'],
  kromka: ['kromka', 'kromki', 'kromek', 'kromki'],
  'liście': ['liść', 'liście', 'liści', 'liścia'],
  szt: ['szt.', 'szt.', 'szt.', 'szt.'],
}

export function formaJednostki(u, q) {
  const f = FORMY[u]
  if (!f || q == null) return u
  if (!Number.isInteger(q)) return f[3]
  if (q === 1) return f[0]
  const r10 = q % 10
  const r100 = q % 100
  return r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14) ? f[1] : f[2]
}

export const zaokraglij = (q) => (q >= 20 ? Math.round(q) : Math.round(q * 4) / 4)

export const fmtIlosc = (q) => zaokraglij(q).toLocaleString('pl-PL', { maximumFractionDigits: 2 })

export function opisSkladnika(s, mnoznik = 1) {
  if (s.q == null) return `${s.n} (${s.u})`
  const q = zaokraglij(s.q * mnoznik)
  return `${s.n}: ${fmtIlosc(q)} ${formaJednostki(s.u, q)}`.trim()
}

export function czasPrzepisu(p) {
  const znane = p.kroki.filter((k) => typeof k.min === 'number')
  const suma = znane.reduce((s, k) => s + k.min, 0)
  if (!znane.length) return null
  return suma
}
