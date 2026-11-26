// Reguły działające w przeglądarce, zanim wiadomość trafi do modelu AI.
// Dzięki nim trudne sytuacje są obsłużone zawsze tak samo, niezależnie od modelu.

export const RE_WULGARYZMY =
  /(?:^|[^\p{L}])(?:kurw|chuj|huj[aeouiy]|(?:za|wy|od|roz|s|przy|na|po|do|u)?(?:jeb|pierdol|pierdal)|spierdal|skurw|pizd|cip[aeyo]|debil|idiot|kretyn|dure[nń]|matoł|g[oó]wn|g[oó]wie|fuck|shit|bitch)/iu

const RE_ATAK = [
  // „zapomnij o zasadach”, „ignore previous instructions”
  /(zignoruj|zapomnij|pomiń|pomin|olej|porzuć|porzuc|anuluj|wyłącz|wylacz|ignore|disregard|forget)\p{L}*\b.{0,50}(zasad|instrukc|polece|reguł|regul|ogranicz|instructions|rules|prompt)/iu,
  // „pokaż swój prompt systemowy”
  /(prompt\p{L}* systemow|system ?prompt|instrukcj\p{L}* systemow|(twoje|swoje|twoich|swoich) (instrukcj|polecen|konfiguracj|wytyczn)|(pokaż|pokaz|wypisz|podaj|zdradź|zdradz|ujawnij|powtórz|powtorz|przetłumacz|przetlumacz)\p{L}*.{0,30}(instrukcj|prompt|konfiguracj|wytyczn|tekst powyżej|wszystko powyżej))/iu,
  /(tryb\p{L}* (dewelopera|developera|deweloperski|administratora|debug|bez ograniczeń)|developer mode|jailbreak|(^|\s)DAN(\s|$))/iu,
  /(udawaj|wciel się|wciel sie|odegraj rolę|odegraj role|zachowuj się jak|od teraz jesteś|od teraz jestes|jesteś teraz|jestes teraz|pretend|act as|you are now|roleplay)/iu,
  // podrabianie znaczników aplikacji
  /<\/?\s*(system|wiadomosc|instrukcje|assistant|user)\s*>|\[(PRZEPIS|BRAK|CZLOWIEK|PODPOWIEDZI|PAMIETAJ|PAMIĘTAJ|ZAPOMNIJ)/i,
]

const RE_CZLOWIEK =
  /((chcę|chce|chciał\p{L}*|chcial\p{L}*|mogę|moge|poproszę|poprosze|proszę o|prosze o|daj|dajcie|połącz|polacz|przekaż|przekaz|potrzebuję|potrzebuje|wolę|wole)\p{L}*\b.{0,30}(człowiek|czlowiek|konsultant|pracownik|żyw\p{L}* osob|zyw\p{L}* osob|prawdziw\p{L}* osob|obsług\p{L}* klienta|obslug\p{L}* klienta|kimś żywym|kims zywym|kimś prawdziwym)|(porozmawiać|porozmawiac|pogadać|pogadac|rozmawiać|rozmawiac|kontakt|kontaktu|skontaktować|skontaktowac) z (człowiekiem|czlowiekiem|konsultantem|pracownikiem|kimś|kims|osobą|osoba))/iu

export const jestWulgarne = (t) => RE_WULGARYZMY.test(t)
export const jestAtakiem = (t) => RE_ATAK.some((re) => re.test(t))
export const prosiOCzlowieka = (t) => RE_CZLOWIEK.test(t)

// Usuwa dane osobowe, zanim wiadomość zostanie wyświetlona i wysłana do modelu.
export function maskujDane(tekst) {
  let t = tekst
  let usunieto = false
  const zamien = (re) => {
    t = t.replace(re, () => {
      usunieto = true
      return '[dane usunięte]'
    })
  }
  zamien(/\bPL ?\d{2}(?: ?\d{4}){6}\b/gi) // numer konta
  zamien(/\b(?:\d[ -]?){12,18}\d\b/g) // numer karty
  zamien(/\b\d{11}\b/g) // PESEL
  zamien(/(?:\+?48[ -]?)?\b\d{3}[ -]?\d{3}[ -]?\d{3}\b/g) // telefon
  zamien(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) // e-mail
  zamien(/\b(?:ul\.|ulica|al\.|aleja|os\.)\s*\p{Lu}[\p{L}.-]*(?:\s+\p{Lu}[\p{L}.-]*)?\s+\d+[a-zA-Z]?(?:\/\d+)?/gu) // adres
  return { tekst: t, usunieto }
}
