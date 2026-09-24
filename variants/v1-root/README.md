# GRAND COMPANY — landing i prodavnica

Sajt firme **GRAND COMPANY d.o.o.** iz Banje Luke (veleprodaja i maloprodaja građevinskog materijala).
Live: https://grand-root.vercel.app

- **Landing** — vodoravna traka od pet poglavlja (Zašto, Ko, Šta, Kako, Kontakt): na desktopu se pomjera uz skrol točkićem, na mobilnom je običan vertikalni tok.
- **Prodavnica** — okomiti nastavak ispod landinga: novo, katalog sa filterima, radovi, materijali, cijene, dostava, pitanja, prijava, podnožje. Korpa, sačuvano, poređenje i pretraga rade u pregledniku.
- **Pravne i servisne stranice** — dostava, povrat, uslovi kupovine, privatnost i ostale (vidi `/sve-politike`).

Stack: Next.js (App Router) · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis.

## Pokretanje

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # produkcijski build
```

## Gdje se mijenja sadržaj

| Šta | Fajl |
|---|---|
| Podaci o firmi (adresa, JIB, PDV, telefon, e-pošta) i poslovni uslovi (rok isporuke, prag besplatne dostave) | `src/lib/company.ts` |
| Artikli, cijene, kategorije, tekstovi sekcija, pitanja, podnožje | `src/lib/shop.ts` |
| Pravne i servisne stranice | `src/lib/legal.ts` |
| Boje poglavlja i sive ploče (do slika) | `src/lib/content.ts` |

> Artikli, cijene i uslovi su **primjer** dok firma ne dostavi stvarnu ponudu, a pravni tekstovi su **nacrt** koji mora pregledati pravnik.
> Traka „Demo prodavnica" i napomena „Nacrt" gase se u `src/lib/company.ts` (`SITE.demo`, `SITE.legalDraft`).
> Nepoznati podaci firme prikazuju se u tekstu kao istaknute oznake, npr. `[sjedište]`, dok se ne dopune.

## Objava

Repozitorijum je povezan sa Vercelom: svaki push na `main` automatski objavljuje sajt na https://grand-root.vercel.app.
