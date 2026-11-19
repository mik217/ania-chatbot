// Połączenie z modelem AI (Gemini albo API zgodne z OpenAI) ze strumieniowaniem odpowiedzi.
import { DOSTAWCY, KONFIG } from '../config.js'

export class BladCzatu extends Error {
  constructor(rodzaj, szczegoly = '') {
    super(rodzaj)
    this.rodzaj = rodzaj
    this.szczegoly = szczegoly
  }
}

export const KOMUNIKATY_BLEDOW = {
  'brak-klucza': 'Żeby Ania mogła odpowiadać, wklej darmowy klucz API w ustawieniach.',
  'brak-modelu': 'Nie wybrano modelu AI. Uzupełnij nazwę modelu i adres API w ustawieniach.',
  klucz: 'Klucz API nie działa. Sprawdź, czy skopiowano go w całości i czy pasuje do wybranego dostawcy.',
  limit: 'Wyczerpał się limit darmowego klucza API albo wysłano zbyt wiele wiadomości naraz. Odczekaj minutę i spróbuj ponownie albo wybierz innego dostawcę w ustawieniach.',
  model: 'Wybrany model AI nie jest dostępny pod tą nazwą. Sprawdź nazwę modelu w ustawieniach.',
  niedostepny: 'Model AI jest chwilowo niedostępny. Spróbuj ponownie za chwilę.',
  siec: 'Nie udało się połączyć z modelem AI. Sprawdź internet i spróbuj ponownie.',
  czas: 'Model AI zbyt długo nie odpowiadał. Spróbuj ponownie.',
  pusta: 'Model AI nie zwrócił odpowiedzi. Spróbuj zapytać trochę inaczej.',
}

export function klasyfikujBlad(status, dane) {
  const msg = JSON.stringify(dane ?? '').toLowerCase()
  if (status === 401 || status === 403 || msg.includes('api key not valid') || msg.includes('api_key_invalid') || msg.includes('invalid api key'))
    return new BladCzatu('klucz', msg)
  if (status === 429 || status === 402 || msg.includes('quota') || msg.includes('rate limit') || msg.includes('resource_exhausted'))
    return new BladCzatu('limit', msg)
  if (status === 404 || (msg.includes('model') && (msg.includes('not found') || msg.includes('does not exist') || msg.includes('decommissioned'))))
    return new BladCzatu('model', msg)
  return new BladCzatu('niedostepny', `HTTP ${status} ${msg}`)
}

async function* linieSSE(res) {
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let i
    while ((i = buf.indexOf('\n')) >= 0) {
      const linia = buf.slice(0, i).trim()
      buf = buf.slice(i + 1)
      if (linia.startsWith('data:')) yield linia.slice(5).trim()
    }
  }
  const reszta = buf.trim()
  if (reszta.startsWith('data:')) yield reszta.slice(5).trim()
}

export function opisModelu(ustawienia) {
  const d = DOSTAWCY[ustawienia.dostawca] || DOSTAWCY.gemini
  return { dostawca: d, model: (ustawienia.modele?.[ustawienia.dostawca] ?? d.model ?? '').trim() }
}

/**
 * Wysyła rozmowę do modelu. onTekst(caly) jest wywoływane z każdym nowym kawałkiem odpowiedzi.
 */
export async function zapytajModel({ ustawienia, klucz, systemPrompt, wiadomosci, onTekst }) {
  const { dostawca: d, model } = opisModelu(ustawienia)
  if (!klucz) throw new BladCzatu('brak-klucza')
  const url = ustawienia.dostawca === 'wlasny' ? (ustawienia.urlWlasny || '').trim() : d.url
  if (!model || (d.typ === 'openai' && !url)) throw new BladCzatu('brak-modelu')

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), KONFIG.limitCzasuOdpowiedziMs)
  try {
    let res
    if (d.typ === 'gemini') {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(klucz)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ctrl.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: wiadomosci.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
            generationConfig: { temperature: KONFIG.temperatura, maxOutputTokens: KONFIG.maksTokenow },
          }),
        },
      )
    } else {
      res = await fetch(url, {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + klucz,
          ...(ustawienia.dostawca === 'openrouter' ? { 'X-Title': 'Ania - asystentka kulinarna (prototyp)' } : {}),
        },
        body: JSON.stringify({
          model,
          stream: true,
          messages: [{ role: 'system', content: systemPrompt }, ...wiadomosci],
          temperature: KONFIG.temperatura,
          max_tokens: KONFIG.maksTokenow,
        }),
      })
    }

    if (!res.ok) {
      const surowe = await res.text()
      let dane
      try {
        dane = JSON.parse(surowe)
      } catch {
        dane = surowe.slice(0, 300)
      }
      throw klasyfikujBlad(res.status, dane)
    }

    let caly = ''
    for await (const dane of linieSSE(res)) {
      if (dane === '[DONE]') break
      let j
      try {
        j = JSON.parse(dane)
      } catch {
        continue
      }
      if (j.error) throw klasyfikujBlad(j.error.code || 500, j)
      const kawalek =
        d.typ === 'gemini'
          ? (j.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || '').join('')
          : j.choices?.[0]?.delta?.content || ''
      if (kawalek) {
        caly += kawalek
        onTekst?.(caly)
      }
    }
    if (!caly.trim()) throw new BladCzatu('pusta')
    return caly
  } catch (e) {
    if (e instanceof BladCzatu) throw e
    if (e.name === 'AbortError') throw new BladCzatu('czas')
    throw new BladCzatu('siec', String(e))
  } finally {
    clearTimeout(timer)
  }
}
