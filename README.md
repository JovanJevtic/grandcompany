# Grand Company d.o.o. Banja Luka — B2B/B2C Web Portal (demo)

Hibridni veleprodajno-maloprodajni portal za građevinski materijal, sa naglaskom na
**B2B Partner Portal** (ugovoreni rabati, kreditni limiti, Pantheon ERP simulacija).

## Pokretanje

Nema build koraka — čisti HTML + Tailwind CDN + vanilla JavaScript:

```bash
# opcija 1: otvori direktno
open index.html

# opcija 2: lokalni server (preporučeno)
python3 -m http.server 8642
# → http://localhost:8642
```

## Struktura

| Fajl | Uloga |
|---|---|
| `index.html` | Struktura stranice i izgled (Tailwind CSS preko CDN-a) |
| `js/data.js` | **Data sloj** — katalog (30 SKU), B2B partneri, cjenovnik dostave. U produkciji ovo zamjenjuje Pantheon ERP API. |
| `js/app.js` | Sva logika — B2B login, rabati, kreditni limit, katalog, W111 kalkulator, korpa i narudžbe |

## Ključne funkcionalnosti

- **B2C/B2B preklopnik** u zaglavlju — B2B otvara login sa 3 demo partnera (rabat 10/15/18%)
- **Partner bar** — ugovoreni rabat, mjerač kreditnog limita (uključuje tekuću korpu), valuta plaćanja, Pantheon sync badge
- **Katalog** — pretraga + filter po kategorijama, stanje zaliha, B2B cijene sa precrtanom maloprodajnom
- **Knauf W111 kalkulator** — normativ materijala (+5% otpada), BOM tabela, „dodaj sve u korpu"
- **Korpa** — proračun težine pošiljke, kran-transport logistika po zonama, kreditna provjera pri odgođenom plaćanju, test narudžba

## Demo B2B nalozi

Bilo koja lozinka je prihvaćena (demo režim):

1. ZR „GipsMont" — Nivo 1, rabat 10%, limit 15.000 KM, valuta 30 dana
2. Gradnja-Mont d.o.o. — Nivo 2, rabat 15%, limit 30.000 KM, valuta 60 dana
3. Integral Inženjering a.d. — Nivo 3, rabat 18%, limit 50.000 KM, valuta 90 dana
