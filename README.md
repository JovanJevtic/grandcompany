# Grand Company d.o.o. Banja Luka — web portal (demo)

Višestranični B2B/B2C portal za građevinski materijal: klasičan ecomm katalog, partnerske cijene
i kreditni limit (Pantheon ERP simulacija), Knauf W111 kalkulator i dostava kamionom sa kranom.

## Pokretanje

Nema build koraka — HTML + Tailwind (lokalno u `vendor/`) + vanilla JavaScript:

```bash
python3 -m http.server 8642
# → http://localhost:8642
```

## Stranice

| Stranica | Sadržaj |
|---|---|
| `index.html` | Početna: naslovnica, zalihe uživo, kategorije, izdvojeni artikli, kran, kalkulator, partneri, savjeti, stovarište |
| `katalog.html` | Katalog sa filterima (kategorija, proizvođač, zalihe, cijena), pretragom i sortiranjem; stanje filtera je u URL-u |
| `proizvod.html?sku=KNF-001` | Artikal: galerija, cijena i rabat, količina, tabovi (opis, podaci, dokumentacija, dostava), povezani artikli |
| `kalkulator.html` | W111 kalkulator uživo, presjek zida, tabela normativa |
| `korpa.html` | Korpa, dostava po zonama, provjera kreditnog limita, forma i potvrda narudžbe |
| `partneri.html` | Pregled partnerskog naloga, nivoi, koraci, zahtjev za partnerstvo, pitanja |
| `dostava.html` | Načini dostave, cjenovnik zona, proces istovara kranom, težine, pitanja |
| `o-nama.html` | Priča, brojke, principi rada, podaci o firmi |
| `kontakt.html` | Telefoni, radno vrijeme, mapa, forma za upit |

## Struktura koda

| Fajl | Uloga |
|---|---|
| `js/data.js` | **Podaci** — 30 artikala, kategorije, partneri, zone dostave. U produkciji ovo daje Pantheon API. |
| `js/core.js` | **Logika** — stanje (localStorage), cijene i rabat, korpa, težina, kreditni limit, fakture/nalozi/gradilišta, W111 normativ. Bez HTML-a. |
| `js/pantheon.js` | **Pantheon gateway (demo)** — prijava, nalog, slanje narudžbe i čuvanje gradilišta. Sve funkcije su `async`; u produkciji tijelo postaje `fetch()` na backend koji priča sa Datalab PANTHEON-om. |
| `js/art.js` | SVG ilustracije proizvoda iz recepta `product.art` u `data.js` |
| `js/ui.js` | Zajednički **izgled** — header, footer, korpa, modali, prijava, kartica proizvoda, `initPage()` |
| `js/pages/*.js` | Logika pojedinačne stranice |
| `js/motion.js` | GSAP + Lenis animacije (sajt radi i bez njih) |
| `css/site.css`, `js/tw-config.js` | Fontovi, bazni stilovi i paleta boja |

## Demo partnerski nalozi

Prijava ide preko `Pantheon.login(email, lozinka)` sa podacima ispod:

| Nalog | E-pošta | Lozinka | Nivo | Rabat | Limit | Valuta |
|---|---|---|---|---|---|---|
| ZR „GipsMont" | `nabavka@gipsmont.demo` | `gipsmont2026` | Nivo 1 | 10% | 15.000 KM | 30 dana |
| Gradnja-Mont d.o.o. | `nabavka@gradnjamont.demo` | `gradnjamont2026` | Nivo 2 | 15% | 30.000 KM | 60 dana |
| Lazarevo Inženjering a.d. | `nabavka@lazarevo.demo` | `lazarevo2026` | Nivo 3 | 18% | 50.000 KM | 90 dana |

Svaki nalog ima i demo fakture (otvorene i plaćene), istoriju naloga i gradilišta — vidljive u pregledu naloga na `partneri.html`.

## Fotografije

Fotografije u `img/` su besplatne fotografije sa Unsplash-a (Unsplash licenca). Za produkciju ih zamijeniti
fotografijama stovarišta, voznog parka i gradilišta Grand Company.
