# Ania – asystentka kulinarna AI

Prototyp chatbota na zajęcia „Systemy chatbot oparte na sztucznej inteligencji” (Politechnika Lubelska).
Ania podpowiada początkującym, co ugotować z tego, co mają w lodówce, i prowadzi przez przepis krok po kroku.
Odpowiada tylko po polsku i tylko na podstawie zatwierdzonej bazy przepisów.

## Uruchomienie

Potrzebny jest [Node.js](https://nodejs.org) w wersji 20 lub nowszej.

```bash
npm install
npm run dev
```

Otwórz adres z terminala (zwykle http://localhost:5173), kliknij ikonę ustawień i wklej darmowy klucz API
(np. z [Google AI Studio](https://aistudio.google.com/apikey)).

Inne polecenia:

| Polecenie | Co robi |
|---|---|
| `npm test` | testy reguł bezpieczeństwa i odczytu odpowiedzi |
| `npm run build` | buduje gotową stronę do folderu `dist/` |
| `npm run preview` | uruchamia zbudowaną stronę lokalnie |

### Klucz API podczas pracy lokalnej

Żeby nie wklejać klucza za każdym razem, skopiuj `.env.example` jako `.env.local` i wpisz w nim klucz.
Działa to tylko przy `npm run dev`. Plik `.env.local` nie trafia do repozytorium, a klucz nie trafia do zbudowanej strony.

## Jak to działa

```
wiadomość → reguły w przeglądarce (dane osobowe, wulgaryzmy, próby ataku, prośba o człowieka)
          → łączenie kilku wiadomości w jedno pytanie
          → prompt systemowy + baza przepisów → model AI (Gemini / Groq / OpenRouter)
          → odczyt znaczników [PRZEPIS], [BRAK], [PODPOWIEDZI] → karta przepisu, przyciski podpowiedzi
```

| Plik | Zawartość |
|---|---|
| `src/data/przepisy.json` | baza wiedzy: przepisy, zamienniki składników, porady |
| `src/bot/prompt.js` | prompt systemowy Ani |
| `src/bot/straznicy.js` | reguły bezpieczeństwa działające przed modelem |
| `src/bot/model.js` | połączenie z modelami AI i komunikaty błędów |
| `src/hooks/useCzat.js` | logika rozmowy i limity sesji |
| `src/config.js` | limity, kontakt do zespołu, domyślne modele |
| `src/components/` | interfejs |

## Trudne sytuacje (kryteria oceny prototypu)

| Sytuacja | Reakcja |
|---|---|
| sesja trwa zbyt długo | ostrzeżenie i propozycja nowej rozmowy; po 20 min bezczynności rozmowa zaczyna się od nowa |
| 3 nieudane odpowiedzi | Ania pokazuje katalog dań, które na pewno umie |
| kilka wiadomości jako jedno pytanie | Ania czeka 2,5 s i łączy je w jedno pytanie |
| prompt injection | reguła w przeglądarce + zasady w prompcie + filtr wycieku instrukcji |
| pytanie spoza zakresu | uprzejma odmowa i powrót do gotowania |
| brak informacji w bazie | Ania mówi, że nie wie, i proponuje najbliższe danie |
| prośba o człowieka | informacja, że to prototyp AI, i kontakt do zespołu |
| dane osobowe | usuwane z wiadomości, zanim trafią do modelu |
| wulgaryzmy | spokojna prośba o rozmowę bez wulgaryzmów |
| model niedostępny / limit klucza | zrozumiały komunikat i przycisk „Spróbuj ponownie” |

W ustawieniach jest **tryb testowy** ze skróconymi limitami sesji, a ikona pobierania zapisuje rozmowę do pliku
(załącznik do raportu z ewaluacji).

## Użycie narzędzi AI

Kod prototypu i część bazy przepisów przygotowano z pomocą asystenta AI (Claude), a zespół je sprawdził.
