# Reference — Grand Company

Snimljeno 2026-09-19, viewport 1440×900, cookie baneri odbijeni prije snimka.
Svaka referenca ima **jednu rečenicu zašto je tu**. Ako se ne može napisati — ne pripada ovdje.

Grand Company nije galerija materijala i nije jeftin DIY marketplace. On je **distributer
koji stvarno prodaje** (katalog, korpa, kalkulator potrošnje, dostava, partnerske cijene).
Zato je set podijeljen: prva grupa rješava **kako materijal izgleda skupo**, druga
**kako izgleda kad se stvarno prodaje**. Druga grupa je važnija — to je rupa u svih
pet dosadašnjih verzija.

---

## A. Art direction — kako materijal izgleda skupo

### `ponos-hero.png` — ponos-layout.vercel.app
**Kućni model.** Naš vlastiti projekat, ista firma iza njega. Sve ostalo se mjeri prema
ovome: cream/espresso smjena, caps eyebrow iznad naslova, jedna script-italic riječ u
liniji, kvadratna outline dugmad sa `→`, fotografija koja izlazi iz kadra.

### `mandarinstone-hero.png` — mandarinstone.com
**Najbliža referenca cijelom projektu.** Pravi šop (pretraga, nalog, korpa, 1064 artikla)
sa editorial herojem: eyebrow `MATERIAL`, naslov `Real Terrazzo` u serifu sa jednom
italic riječju, tri rečenice koje govore **šta materijal jeste** a ne kako se osjećaš,
outline `SHOP NOW`. Dokazuje da premium i katalog nisu suprotnosti.

### `bertandmay-hero.png` — bertandmay.com
Materijal snimljen **u prostoru u kojem se koristi**, preko cijelog ekrana, tekst dolje
lijevo, jedno dugme. I nav koji nam treba doslovno: `Shop / Design / Inspiration / Trade /
Clearance` — `Trade` je njihov ekvivalent naše partnerske stranice.

### `dinesen-hero.png` — dinesen.com
Drvo kao jedini sadržaj hero fotografije, naslov kaže kategoriju proizvoda
(`Wall and ceiling cladding`), podnaslov jednu činjenicu. Nav: `Floors / Floor Planner /
Inspiration / Shop` — brend + alat + prodavnica pod istim krovom, tačno naša struktura.

### `vitsoe-hero.png` — vitsoe.com
**Referenca za disciplinu, ne za ljepotu.** Nula dekoracije. Naslov je ime proizvoda,
ispod dvije rečenice šta radi, `Learn more →`. Ovdje se gleda kad se pojavi napast da
se doda floating kartica ili nakrivljeni mockup.

---

## B. Mehanika prodavnice — kako izgleda kad se stvarno prodaje

### `bertandmay-katalog.png` — bertandmay.com/collections/all
**Odgovor na problem kartica proizvoda.** Kartica bez okvira: packshot **samog materijala**
na neutralnoj podlozi, ime u serifu, tip materijala sitno ispod, badge `In Stock` /
`On its way`. Nikad kategorijska fotka kao da je artikal — oni snime svaku pločicu.
Vidi `photo-policy` pravilo: ovo je kako se to radi pošteno.

### `mandarinstone-katalog.png` — mandarinstone.com/shop
**Filteri kakvi nam trebaju.** `MATERIAL / EFFECTS / COLOUR / STYLE / DISCOUNT / ALL FILTERS`,
brojač `1064 Items`, `SORT`, i prekidač `Room | Product` koji mijenja da li kartica pokazuje
materijal u prostoru ili packshot. Naslov kategorije ostaje editorial dok je sve ispod
čista mehanika.

### `dinesen-shop.png` — dinesen.com/en/shop
Kategorije kao kartice bez okvira: fotografija, ime, ništa treće. Referenca za
`katalog.html` na nivou kategorija.

---

## C. Kontekst i ograde

### `knauf-hero.png` — knauf.com (BA-HR)
**Brend dobavljača, ne vizuelni cilj.** Ovdje se gleda zbog imenovanja proizvoda i
sustava, i zbog `Proizvodi i sustavi / Dokumentacija` strukture — naš katalog mora
govoriti istim jezikom kao njihov tehnički list. Plavi korporativni izgled i karusel
**ne** preuzimati.

### `baumit-hero.png` — baumit.com (BA)
**Anti-referenca.** Regionalni standard za građevinski materijal: karusel, stock fotke
majstora u pozi, crveni blok, sve u prvom ekranu. Ovo je nivo koji nadmašujemo. Kad se
neka odluka svede na "ali svi to rade ovdje" — pogledaj ovu sliku.

---

## Odbijeno i zašto

| Sajt | Zašto ne |
|---|---|
| solidnature.com | Prelijepo, ali čista galerija/izložba. Tačno zamka koju je Petar već odbio — "premalo sekcija, fali ecomm". |
| rockwool.com | Korektno ali generički korporativno (velika fotka + slogan + dugme). Dinesen radi isto, bolje. |
| kerakoll.com | Zaustavlja se na biraču države, nema šta da se snimi. |
| gutex.de | 404 na engleskoj verziji. |
| tarkett.com | Ništa što ostatak seta već ne pokriva bolje. |

---

## Kako se ovo obnavlja

```
node ~/.claude/skills/design-workflow/shoot-refs.js design/references \
  ime=https://sajt.com
```

Skripta odbija kolačiće i sklanja overlay prije snimka (bez toga je pola snimaka
cookie baner).
