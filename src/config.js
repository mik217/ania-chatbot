// Ustawienia prototypu. Tu zespół zmienia limity, kontakt i domyślne modele.

export const KONFIG = {
  kontakt: '', // e-mail zespołu podawany, gdy użytkownik prosi o człowieka, np. 'zespol@przyklad.pl'
  opoznienieLaczeniaMs: 2500, // tyle Ania czeka, czy użytkownik dopisze kolejną wiadomość do tego samego pytania
  maksWiadomosciWKontekscie: 20,
  limitWiadomosciSesji: 30, // po tylu wiadomościach Ania proponuje nową rozmowę
  limitCzasuSesjiMin: 45, // albo po tylu minutach
  bezczynnoscMin: 20, // po tylu minutach bezczynności rozmowa zaczyna się od nowa
  limitCzasuOdpowiedziMs: 45000,
  temperatura: 0.6,
  maksTokenow: 2048,
  limitWulgaryzmow: 3,
  limitNiepowodzen: 3, // po tylu nieudanych odpowiedziach Ania pokazuje katalog dań
}

// Skrócone limity do testów (włączane w ustawieniach)
export const LIMITY_TESTOWE = { bezczynnoscMin: 1, limitWiadomosciSesji: 6, limitCzasuSesjiMin: 5 }

export const DOSTAWCY = {
  gemini: {
    nazwa: 'Google Gemini',
    typ: 'gemini',
    model: 'gemini-2.5-flash',
    link: 'https://aistudio.google.com/apikey',
    linkOpis: 'Darmowy klucz: Google AI Studio',
  },
  groq: {
    nazwa: 'Groq',
    typ: 'openai',
    model: 'llama-3.3-70b-versatile',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    link: 'https://console.groq.com/keys',
    linkOpis: 'Darmowy klucz: konsola Groq',
  },
  openrouter: {
    nazwa: 'OpenRouter (darmowe modele)',
    typ: 'openai',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    link: 'https://openrouter.ai/keys',
    linkOpis: 'Darmowy klucz: OpenRouter',
  },
  wlasny: { nazwa: 'Inny dostawca (API zgodne z OpenAI)', typ: 'openai', model: '', url: '' },
}

// Klucz z pliku .env.local działa tylko w trybie deweloperskim (npm run dev).
// W zbudowanej stronie ta wartość jest zawsze pusta, więc klucz nie trafia do kodu.
export const KLUCZ_DEWELOPERSKI = import.meta.env.DEV ? import.meta.env.VITE_DEV_GEMINI_KEY || '' : ''
