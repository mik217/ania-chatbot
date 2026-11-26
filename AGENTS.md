# Wskazówki dla asystentów AI (Codex, Claude itp.)

Projekt: prototyp chatbota „Ania – asystentka kulinarna AI”. Vite + React 19, czysty JavaScript (bez TypeScriptu).

## Zasady
- Cały tekst widoczny dla użytkownika i odpowiedzi chatbota są **po polsku**. Nazwy w kodzie też są po polsku.
- Klucz API wpisuje użytkownik w ustawieniach. **Nigdy** nie wpisuj klucza do kodu ani do repozytorium.
- Przepisy chatbot podaje wyłącznie z `src/data/przepisy.json`. Nowy przepis musi mieć pola: `id`, `nazwa`, `kategoria`,
  `porcje`, `trudnosc`, `dieta`, `alergeny`, `skladniki` (`n`, `q`, `u`) i `kroki` (`t`, `min`).
- Model oznacza odpowiedzi znacznikami `[PRZEPIS:id]`, `[BRAK]`, `[CZLOWIEK]`, `[PODPOWIEDZI: a | b]`, `[PAMIETAJ: typ | wartość]`, `[ZAPOMNIJ: typ | wartość]`
  (opis w `src/bot/prompt.js`, odczyt w `src/bot/odpowiedz.js`). Zmieniając jedno, zmień drugie.
- Reguły bezpieczeństwa (`src/bot/straznicy.js`) są częścią kryteriów oceny. Nie usuwaj ich bez zastąpienia.

## Sprawdzanie zmian
- `npm test` – testy jednostkowe (vitest)
- `npm run build` – musi przejść bez błędów
- Pamięć użytkownika (`src/bot/pamiec.js`) zapisuje się tylko w przeglądarce i tylko po zgodzie użytkownika. Nie zapisuj w niej danych osobowych.
