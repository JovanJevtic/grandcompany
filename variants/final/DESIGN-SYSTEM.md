# Design system — Grand Company

Kratak doc koji se čita **prvi**, prije svakog dizajnerskog prolaza.
Reference: `design/references/REFERENCES.md`. Workflow: `design-workflow` skill.

Kuća je **MT Ponos** (`design/references/ponos-hero.png`) — isti tim, ista škola.
Ali Grand Company je **prodavnica**, ne portfolio: svaki ekran mora voditi ka artiklu
sa cijenom.

---

## Boje

| Token | Hex | Gdje |
|---|---|---|
| `canvas` | `#F1ECE4` | podloga stranice, gypsum cream |
| `surface` | `#FBF8F3` | kartice i paneli, nijansu toplije |
| `well` | `#E6E0D5` | podloga iza crteža proizvoda |
| `ink` | `#191817` | tekst, puna dugmad |
| `deep` | `#262320` | tamne sekcije |
| `deeper` | `#100F0E` | footer i preklopi preko fotografija |
| `muted` | `#6B655D` | sekundarni tekst |
| `steel` | `#274C77` | **samo** partnerske cijene i B2B signali |

Materijalne boje (`ochre`, `sage`, `brick`) žive **isključivo** u crtežima proizvoda.
Nikad kao pozadina sekcije. Nema gradijenata osim preklopa preko fotografije.

## Tipografija

| Uloga | Font | Pravilo |
|---|---|---|
| Cover linija | Montserrat **900**, caps | **Samo h1 na naslovnoj.** Nigdje drugdje. |
| Jedna rukopisna riječ | Pinyon Script | **Jedna riječ, jednom na stranici**, unutar cover linije. |
| Naslovi sekcija | Montserrat **500**, `.s-head` | Lijevo, jedan red, rečenično slovo. Nikad caps, nikad centrirano. |
| Sve ostalo | Instrument Sans 400–500 | Imena artikala, cijene, spec linije, navigacija. |
| Brojevi | `.tnum` | Tabularne cifre svuda gdje stoji cijena ili količina. |

`.eyebrow` (caps, `0.14em`) je **funkcionalna mikro-oznaka** — zaglavlje tabele, `dt`
u listi podataka, oznaka u kartici. **Nije** ukras iznad naslova sekcije. Ako stoji
iznad `<h2>`, briše se.

## Ritam

- Sekcija: `py-16 lg:py-24`. Veće samo ako postoji razlog koji se može napisati.
- Naslov → sadržaj: `mt-8` do `mt-10`.
- Sticky header se poslije 300 px skrola kondenzuje (gubi red kategorija).

## Komponente

**Kartica artikla** — kanon, ne mijenjati bez razloga:
crtež na `well` podlozi → ime → `BREND · SPEC` caps mikro-linija → cijena sa jedinicom
→ tačka stanja → polje za količinu + `U KORPU`.

**Kartica kategorije** — crtež stvarnog artikla iz te kategorije, ime, kratak opis,
broj artikala i `od X KM`. **Nikad fotografija majstora.**

**Dugmad** — `.btn-line` (outline, caps, `→`) i `.btn-solid` (ink). Kvadratni uglovi.

**Čipovi** — `.chip` za filtere, `aria-pressed` nosi stanje.

## Fotografija

- **Samo vlastite fotografije** stovarišta, robe i mehanizacije.
- Stock fotografije majstora u pozi su zabranjene — to je `baumit-hero.png` obrazac.
- Fotografija ide preko cijele širine ili izlazi iz kadra na jednu stranu.
- Svaka fotografija u galeriji nosi potpis koji kaže šta se vidi.
- Kategorijska ili ambijentalna fotka **nikad** ne stoji na kartici artikla kao da je
  taj artikal. Vidi `photo-policy` pravilo; bez packshota ide crtež iz `js/art.js`.

## Copy

- Naslov kaže **šta jeste ili šta radi**, ne kako se osjećaš.
  ✅ „Zone i cijene istovara" ❌ „Materijal koji drži konstrukciju"
- Nema izmišljenih testimoniala, cijena, logotipa ni brojeva.
- Demo podaci se **označavaju** kao demo.
- Brojevi u rečenici umjesto stats trake.

## Tvrde zabrane

Sve navedeno je već jednom odbijeno na ovom projektu:

- Stats traka (`2012 / 17 / 30 / A+`)
- Centriran višeredni caps naslov u sekciji
- Eyebrow iznad svakog naslova
- Italic ili script kao ponavljajući uređaj
- Vodeni žig rukopisom preko sekcije
- Rotirano vertikalno pravilo kao ukras
- Tamna tema sa zlatnim gradijentima, emoji
- Swiss/mono hairline grid sa `01 / 02 / 03` oznakama
- Dvije pretrage na istom ekranu
- Dugme koje treći put poziva na isti katalog
