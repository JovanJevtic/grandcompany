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
| `js/core.js` | **Logika** — stanje (localStorage), cijene i rabat, korpa, težina, W111 normativ. Bez HTML-a. |
| `js/art.js` | SVG ilustracije proizvoda iz recepta `product.art` u `data.js` |
| `js/ui.js` | Zajednički **izgled** — header, footer, korpa, modali, prijava, kartica proizvoda, `initPage()` |
| `js/pages/*.js` | Logika pojedinačne stranice |
| `js/motion.js` | GSAP + Lenis animacije (sajt radi i bez njih) |
| `css/site.css`, `js/tw-config.js` | Fontovi, bazni stilovi i paleta boja |

## Demo partnerski nalozi

Bilo koja lozinka prolazi:

1. ZR „GipsMont" — Nivo 1, rabat 10%, limit 15.000 KM, valuta 30 dana
2. Gradnja-Mont d.o.o. — Nivo 2, rabat 15%, limit 30.000 KM, valuta 60 dana
3. Integral Inženjering a.d. — Nivo 3, rabat 18%, limit 50.000 KM, valuta 90 dana

## Scroll hero

Početna koristi lokalni Three.js r170 (`vendor/three.module.min.js`, MIT licenca).
Nema build koraka ni vanjskog CDN-a za 3D scenu.

- `js/crane-scene.js`: geometrija krana, palete i četiri zgrade; kontinuirana kamera i koreografija.
- `js/crane-details.js`: vijci, ljestve, kabina, kuka, oplata, stepenice, bager i detalji gradilišta.
- `js/crane-hero.js`: prirodni scroll tri sadržajne sekcije upravlja zasebnom sticky ilustracijom; tekst nema pinovanje ni zamjenu naslova.
- Prvo se prikazuju samo kran i paleta. Gradilište se pojavljuje nakon 46% scene.
- Završni kadar spušta paletu na ploču četvrte etaže (visina 9,6 jedinica).
- Tri sekcije (uvod, materijali, dostava) normalno prolaze kroz stranicu. Samo 3D ilustracija je sticky: u sredini na desktopu, iznad teksta na manjim ekranima. Link „Upoznajte našu ponudu” vodi na sadržaj o materijalima.
- Reduced motion i nedostupan WebGL prikazuju statičnu ilustraciju i kompaktne sekcije bez sticky efekta.
- Ako WebGL nije dostupan, prikazuje se prvi kadar generisanog storyboarda. Renderovanje miruje kada nema promjene ili je scena van ekrana.

Vizuelna referenca: [storyboard sa 12 kadrova](design/crane-storyboard-v5-twelve-frames.png), generisan Image Gen alatom. Animacija je proceduralna 3D interpretacija, ne animirana verzija samih raster slika; materijali i detalji se razlikuju od storyboarda.

Provjera fizičkog položaja palete, kasnog otkrivanja gradilišta i kontinuiteta kamere:

```bash
node --test tests/crane-scene.test.mjs
```

## Fotografije i koncepti

Fotografije su sa Unsplash-a. Raniji crveni kran u `img/crane-*.png` ostaje kao arhiva; početna ga više ne koristi.
Prompt posljednjeg storyboarda: [crane-storyboard-v5.md](design/crane-storyboard-v5.md).

## Objavljivanje trenutne verzije

```bash
python3 scripts/build-vercel.py
vercel deploy --prebuilt --prod --yes
```

Uvijek prvo obnoviti paket: `--prebuilt` objavljuje postojeći sadržaj `.vercel/output`, a ne promijenjene izvorne fajlove. `/build.json` na objavljenom sajtu sadrži oznaku verzije i kontrolne sume ključnih fajlova za poređenje s lokalnom verzijom.

Detaljna scena koristi PMREM studijsko osvjetljenje, teksture betona i drveta, pokretna kolica i dvostruku sajlu. Poslije sastavljanja zgrada geometrija gradilišta se objedinjuje u instancirane grupe; test provjerava da prelaz zadržava položaj svakog dijela. Renderovanje se zaustavlja kada se scroll smiri.

Koreografija v3: kontrolisan luk kamere bez punog obilaska (ukupno manje od 30°), jedan mali zakret krana, raniji prikaz gradilišta i bliži završni kadar. Gradilište uključuje radnike, označenu zonu istovara, alat i djelimično postavljene zaštitne mreže.

Koreografija v4: početak je bliski kadar samo gornjeg dijela krana i palete. Jedan kratak zakret završava u prvoj petini animacije; potom kamera monotono silazi i udaljava se, otkriva zgrade i završava širokim prikazom cijelog gradilišta.

Koreografija v5: stvarni zakret gornjeg sklopa krana od oko 66° u prvoj petini animacije, uz fiksan azimut kamere. Canvas seže do dna viewporta; komande su uz naslov (na telefonu iznad 3D prikaza) i ne odsijecaju toranj.

Vizuelna dorada v6: kontaktne sjenke (SSAO), toplije bočno osvjetljenje i refleksije metala, zaobljeni rubovi krana te 22% veći teret. Gradilište dobija ulaznu kapiju, raznovrsne palete, betonske cijevi i iskop. Kratak oblak prašine prati završetak istovara. `js/crane-renderer.js` vodi lokalni postprocessing s povećanom rezolucijom rendera i FXAA zaglađivanjem, a `js/crane-effects.js` efekte vezane za scroll; nema stalne animacije u mirovanju.

## Redizajn sajta v7

Svih devet stranica koristi zajednički vizuelni sistem: grafit, topla bijela, prigušena zelena i žuti akcent vezan za kran. `css/design.css` uređuje navigaciju, raspored stranica, kartice proizvoda, forme, podnožje i mobilni prikaz. `js/ui.js` dijeli navigaciju i kartice između početne, kataloga, korpe i povezanih proizvoda.

Početna sada vodi kroz materijale, isporuku, kalkulator, partnerstvo i kontakt sa stovarištem. Three.js scena i njena koreografija su zadržane. Fontovi su lokalni; statičnim fontovima ispravljene su deklaracije težine kako bi naslovi koristili postojeći bold font.

Provjereno u Chromiumu: svih devet stranica na 1440 i 390 px, pretraga i sortiranje kataloga, količine i korpa, galerija i kartice proizvoda, partnerska prijava, promjena dimenzija i prenos specifikacije iz kalkulatora, mobilni meni i filteri, demo kontakt forma te završni kadar 3D scene. Ispravljen je i izgubljeni prvi klik na dugme kalkulatora poslije promjene dimenzija.

Lokalno pokretanje tačno ovog projekta:

```bash
python3 -m http.server 8644 --bind 127.0.0.1 --directory /Users/petrospektiva/grandcompany
```

Otvoriti `http://127.0.0.1:8644/`.

## Scena i prirodni scroll v8

`css/construction-story.css` definiše prostor ilustracije odvojen od `.story-content`. Svaki naslov, pasus i link ostaje u normalnom toku dokumenta. Uklonjen je stari pinovani naslov sa brojačem; animacija sada prati stvarnu dužinu tri sadržajne sekcije. Na desktopu sticky kadar prati sekcije s desne strane, a na telefonu ima odvojen gornji prostor. Povratni scroll vraća koreografiju, a renderovanje staje kad se pomjeranje smiri.

Kran koristi manje metalan lak, neutralnije betonske materijale, dorađene sjenke i Grand Company oznaku. Telefon dobija širi kadar kada se gradilište otkriva. Provjereni su prirodno pomjeranje naslova pri wheel scrollu, početak/kraj i povratak animacije, sidro ponude, statični reduced-motion prikaz i fallback bez WebGL-a.

## Centralna scena v9

3D kadar je centriran između dvije kolone. Lijeva sadrži uvod i glavne poruke, desna prednosti, izdvojene zalihe i korake dostave. Obje se normalno pomjeraju sa stranicom. Pozadina scene koristi tamnu prigušenu zelenu, s toplijim osvjetljenjem u sredini i žutim akcentima. Kamera pri otkrivanju gradilišta ostavlja dodatni prostor za bočne kolone. Ispod 1024 px ilustracija ima zaseban gornji prostor; tekst je u dvije kolone na tabletu i jednoj na telefonu.

## Raznovrsnije gradilište v10

Četiri zgrade sada imaju različite faze i karakter: prijemna ploča, otvorena konstrukcija s jezgrom i oplatom, poslovna fasada sa staklom i vertikalnim lamelama te stambeni toranj s balkonima i uvučenim završnim etažama. `js/crane-architecture.js` dodaje i pravi otvor u terenu, temeljnu ploču s armaturom, podgradu i pristupne ljestve.

`js/crane-activity.js` animira bager i vanjski gradilišni lift; kamion prilazi cestom uz rotaciju točkova. Sve zavisi isključivo od scrolla i vraća se unazad bez vremenskih petlji. Pokretni objekti ostaju odvojeni od instancirane statične geometrije. Uredi su pomjereni iza prilazne ceste. Kamera pri završetku otkrivanja automatski uklapa teren i vrh krana u kadar, uključujući telefon.

Provjereno: devet testova geometrije, koreografije, instanciranja, putanje vozila i granica kadra; Chromium na 1440 i 390 px, obični scroll naslova, povratak animacije, sidra, reduced-motion i fallback bez WebGL-a. Centralni raspored i zelena pozadina iz v9 ostaju aktivni.

## Materijali i render v11

Smanjena je zaobljenost obojenih dijelova; glavni stubovi krana koriste kvadratne čelične profile. Lak je prigušeniji i manje sjajan, staklo tamnije, a beton, cigla i zemlja imaju manje zasićene tonove. `js/crane-surfaces.js` dodaje varijacije boje i hrapavosti u koordinatama scene, tragove oplate i točkova bez dodatnih teksturnih preuzimanja ili draw callova. Usmjerenije osvjetljenje i manje dopunskog svjetla naglašavaju dubinu konstrukcije.

Kašika bagera ima otvorenu zakrivljenu čeličnu školjku, bočne ploče i zube. Paleta ima blagu zaštitnu foliju i otpremnu etiketu. To je i dalje proceduralni 3D model; ova dorada mijenja materijale i oblikovanje prema arhitektonskom renderu. Raspored, prirodni scroll i postojeća koreografija su sačuvani.

## Kran, teret i režija v12

Uvod prikazuje gornji sklop iz višeg ugla. Kratak zakret krana prelazi u pogled uz krak, zatim kamera prilazi paleti i pokazuje blokove i opremu za dizanje. Tek potom slijedi spuštanje, udaljavanje i otkrivanje gradilišta. Ukupan luk kamere ostaje manji od 60°, zakret krana završava rano, a cijela koreografija je reverzibilna i prati obični scroll.

`js/crane-rig.js` dodaje pogone i rebrasta kućišta, operatera, radne lampe, instalacije i pomični kablovski vod uz kolica. Nova glavna paleta nosi glinene blokove s modeliranim otvorenim ćelijama, ambalažne trake, zaštitne uglove, otpremne etikete i foliju. Metalni okvir, donje nosive šine i četiri kraka prenose teret do kuke.

Provjereni su početni, prelazni, bliski i završni kadar na 1440 i 390 px, konzola bez grešaka, pomjeranje naslova običnim scrollom i devet testova geometrije/koreografije. Test kadriranja sada uključuje prošireni okvir i cijelu visinu kuke.

## Gradilište preko cijele širine v13

Canvas sada pokriva cijeli viewport bez bočne maske. Time je uklonjeno zeleno prekrivanje krana uz rub nekadašnjeg centralnog prikaza. Uvodni kadar se drži između sadržajnih kolona položajem kamere; tekst i dalje normalno prolazi scrollom.

Teren se nastavlja daleko izvan kadra, cesta i pločnik prolaze kroz scenu, a okolne zgrade i dodatne radne zone daju dubinu. Udaljeni teren prelazi u atmosferu iste boje, bez vidljivog ruba postolja. Kamera prvo otkriva gradilište, zatim silazi i prilazi paleti i radnicima na prijemnoj ploči. Završni kadar namjerno prikazuje unutrašnjost gradilišta, pa se više ne pokušava uklopiti čitav kran i svaka zgrada u mali zajednički okvir.

Desktop dobija završni prostor bez teksta za prilazak kamere. Na telefonu i u reduced-motion/fallback prikazu taj dodatni prostor se ne prikazuje. Provjereno: širina canvasa i odsustvo maske, obični scroll, početni/prilazni/završni kadrovi na desktopu i telefonu, fallback i deset testova geometrije i kretanja. Paleta ostaje vidljiva tokom prilaska i završava na ploči.
