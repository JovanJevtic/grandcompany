// Tekstovi pravnih i servisnih stranica prodavnice (NACRT — potreban pregled pravnika prije objave).
// Oznake u vitičastim zagradama ({naziv}, {email}, {rokOdustanka} ...) popunjavaju se iz company.ts.
// Nigdje se ne navode brojevi članova zakona niti konkretni pružaoci usluga: to je namjerno.

import type { LegalDoc } from './legal-types'

const UPDATED = '24. septembar 2026.'

export const LEGAL_DOCS: LegalDoc[] = [
  // ───────────────────────────── 1. DOSTAVA ─────────────────────────────
  {
    slug: 'dostava',
    title: 'Dostava',
    group: 'kupovina',
    kicker: 'Isporuka',
    lead: 'Robu dostavljamo na području {zonaDostave}, uobičajeno u roku od {rokIsporuke}. Možete je i preuzeti lično, a za izvođače radova isporuku na gradilište dogovaramo pojedinačno.',
    updated: UPDATED,
    sections: [
      {
        id: 'podrucje-i-rok',
        title: 'Područje i rok isporuke',
        blocks: [
          {
            t: 'p',
            text: 'Dostavu vršimo na području: {zonaDostave}. Uobičajeni rok isporuke je {rokIsporuke}, računajući od potvrde narudžbe.',
          },
          {
            t: 'p',
            text: 'Rok je okviran i zavisi od raspoloživosti artikala i obima narudžbe. Ako se plaća unaprijed po predračunu, robu otpremamo nakon što evidentiramo uplatu. Ako neki artikal nije na stanju, javit ćemo vam i dogovoriti novi termin prije isporuke.',
          },
          {
            t: 'p',
            text: 'Za adrese izvan područja dostave isporuku dogovaramo pojedinačno. Javite nam se prije naručivanja.',
          },
        ],
      },
      {
        id: 'troskovi',
        title: 'Troškovi dostave',
        blocks: [
          {
            t: 'p',
            text: 'Dostava je besplatna za narudžbe od {besplatnaDostava}. Za manje narudžbe trošak dostave, ako se obračunava, saopštavamo vam prije potvrde narudžbe, tako da ga znate prije nego što se obavežete na plaćanje.',
          },
          {
            t: 'p',
            text: 'Za robu koja zahtijeva posebno vozilo, više prevoza ili dodatnu uslugu (na primjer istovar mehanizacijom) trošak određujemo pojedinačno i navodimo ga u potvrdi narudžbe ili ponudi.',
          },
        ],
      },
      {
        id: 'teska-roba-i-istovar',
        title: 'Teška roba, paletna isporuka i istovar',
        blocks: [
          {
            t: 'p',
            text: 'Ploče, profili, kamena vuna, građa i slična roba često se isporučuju na paletama ili u većim količinama. Način isporuke, vrstu vozila i termin dogovaramo s vama unaprijed, obično telefonom ili e-poštom.',
          },
          {
            t: 'p',
            text: 'Osim ako je drugačije dogovoreno, kupac obezbjeđuje slobodan pristup vozilu do mjesta istovara te ljude ili opremu za istovar (radnike, viljuškar, dizalicu). Ako je istovar posebno dogovoren i naveden u potvrdi narudžbe ili ponudi, vršimo ga prema dogovoru.',
          },
          { t: 'p', text: 'Prije isporuke javite nam:' },
          {
            t: 'ul',
            items: [
              'tačnu adresu i eventualna ograničenja pristupa (uska ulica, ograničena visina ili nosivost, neuređen prilaz);',
              'gdje se roba može odložiti nakon istovara;',
              'kontakt osobu koja će biti dostupna telefonom u dogovoreno vrijeme.',
            ],
          },
        ],
      },
      {
        id: 'preuzimanje-i-provjera',
        title: 'Preuzimanje i provjera robe',
        blocks: [
          {
            t: 'p',
            text: 'Pri preuzimanju provjerite je li isporuka potpuna i u ispravnom stanju.',
          },
          {
            t: 'ol',
            items: [
              'Uporedite broj paketa ili paleta i artikala s otpremnicom.',
              'Pregledajte ambalažu i vidljivo stanje robe prije potpisa.',
              'Vidljivo oštećenje ili nedostatak upišite na otpremnicu ili dostavnicu i fotografišite ga.',
              'Obavijestite nas bez odlaganja, uz broj narudžbe.',
            ],
          },
          {
            t: 'p',
            text: 'Nedostatke koje pri preuzimanju nije bilo moguće uočiti rješavamo postupkom opisanim na stranici „Garancija i reklamacije“.',
          },
          {
            t: 'note',
            text: 'Potpis na otpremnici potvrđuje prijem pošiljke, zato napomenu o oštećenju upišite prije potpisivanja.',
          },
        ],
      },
      {
        id: 'licno-preuzimanje',
        title: 'Lično preuzimanje',
        blocks: [
          {
            t: 'p',
            text: 'Narudžbu možete preuzeti lično na adresi {sjediste}, nakon što vas obavijestimo da je spremna. Termin preuzimanja dogovorite s nama, a uz sebe imajte broj narudžbe i lični dokument.',
          },
          {
            t: 'p',
            text: 'Za veće količine robe unaprijed dogovorite utovar i vozilo odgovarajuće nosivosti.',
          },
        ],
      },
      {
        id: 'nema-nikoga-na-adresi',
        title: 'Ako nikoga nema na adresi',
        blocks: [
          {
            t: 'p',
            text: 'Ako u dogovoreno vrijeme nema nikoga ko bi preuzeo robu, dostavljač će vas pokušati kontaktirati telefonom. Novi termin isporuke dogovaramo s vama.',
          },
          {
            t: 'p',
            text: 'Ako isporuka ne uspije zbog razloga na vašoj strani, trošak ponovljene dostave možemo naplatiti, o čemu vas prethodno obavještavamo. Ako isporuka ne uspije ni u novom dogovorenom terminu, narudžba se može otkazati, a uplaćeni iznos vraćamo prema stranici „Povrat novca“.',
          },
        ],
      },
      {
        id: 'gradilista',
        title: 'Isporuka na gradilište',
        blocks: [
          {
            t: 'p',
            text: 'Izvođačima radova isporuku na gradilište dogovaramo pojedinačno: lokaciju, termine, isporuku po fazama radova i način istovara. Za veće projekte pogledajte stranicu „Upit za izvođače i projekte“.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── 2. POVRAT ROBE ─────────────────────────────
  {
    slug: 'povrat-robe',
    title: 'Povrat robe',
    group: 'kupovina',
    kicker: 'Povrat',
    lead: 'Robu možete vratiti u skladu s propisima o zaštiti potrošača i uslovima navedenim ovdje. Javite nam se prije nego što robu pošaljete, da povrat prođe bez zastoja.',
    updated: UPDATED,
    sections: [
      {
        id: 'kako-vratiti',
        title: 'Kako vratiti robu',
        blocks: [
          {
            t: 'ol',
            items: [
              'Javite nam se e-poštom ({email}) ili telefonom ({telefon}) i navedite broj narudžbe te artikle koje vraćate.',
              'Sačekajte našu potvrdu i dogovorite način vraćanja, posebno ako se radi o teškoj ili paletnoj robi.',
              'Zapakujte robu u originalnu ambalažu, s priborom i pripadajućim dokumentima, ili u ambalažu koja je štiti pri prevozu.',
              'Pošaljite ili donesite robu u dogovorenom roku.',
              'Po prijemu pregledamo robu i obavještavamo vas o ishodu.',
            ],
          },
          {
            t: 'p',
            text: 'Ako vraćate robu jer odustajete od ugovora, pravila, rokovi i model obrasca nalaze se na stranici „Odustanak od ugovora“. Ova stranica opisuje praktičnu stranu vraćanja.',
          },
        ],
      },
      {
        id: 'stanje-robe',
        title: 'U kakvom stanju roba treba biti',
        blocks: [
          {
            t: 'ul',
            items: [
              'neoštećena i nekorištena, u stanju u kojem ste je primili;',
              'kompletna, s priborom, uputstvima i garantnim listom (ako ga je bilo);',
              'po mogućnosti u originalnoj, neoštećenoj ambalaži.',
            ],
          },
          {
            t: 'p',
            text: 'Zakon dopušta da robu pregledate u mjeri u kojoj je to potrebno da biste utvrdili njena svojstva i funkcionisanje. Ako je vrijednost robe umanjena zbog drugačijeg postupanja s njom, iznos povrata može se umanjiti srazmjerno tom umanjenju.',
          },
        ],
      },
      {
        id: 'izuzeci',
        title: 'Roba koja se ne može vratiti',
        blocks: [
          {
            t: 'p',
            text: 'Zbog prirode građevinskog materijala povrat nije moguć ili je ograničen za:',
          },
          {
            t: 'ul',
            items: [
              'robu koja je rezana, miješana ili izrađena po mjeri ili prema specifikaciji kupca (na primjer ploče, profili ili građa rezani na traženu dimenziju);',
              'robu koja je ugrađena ili obrađena tako da se ne može vratiti u originalnom stanju;',
              'otvorenu higijenski osjetljivu robu, na primjer dijelove sanitarne opreme čija je higijenska ambalaža otvorena;',
              'oštećenu ili korištenu robu čija je vrijednost umanjena preko mjere potrebne za pregled.',
            ],
          },
          {
            t: 'p',
            text: 'Ova ograničenja ne umanjuju vaša prava kada roba ima nedostatak. Za to pogledajte stranicu „Garancija i reklamacije“.',
          },
        ],
      },
      {
        id: 'prevoz-i-troskovi',
        title: 'Prevoz i troškovi vraćanja',
        blocks: [
          {
            t: 'p',
            text: 'Troškove vraćanja snosi potrošač, osim ako je prodavac naveo drugačije. Ako vraćate robu zato što smo isporučili pogrešan artikal ili zato što ima nedostatak, troškove vraćanja snosimo mi.',
          },
          {
            t: 'p',
            text: 'Za tešku i paletnu robu prevoz se dogovara unaprijed. Takvu robu ne šaljite bez našeg dogovora: troškovi mogu biti znatni, a nepravilno pakovanje povećava rizik od oštećenja tokom prevoza. Robu zaštitite tako da do nas stigne neoštećena.',
          },
        ],
      },
      {
        id: 'pregled-pri-prijemu',
        title: 'Pregled pri prijemu',
        blocks: [
          {
            t: 'p',
            text: 'Po prijemu provjeravamo odgovara li vraćena roba narudžbi, je li kompletna i u kakvom je stanju. O rezultatu vas obavještavamo. Ako roba nije u stanju koje povrat zahtijeva, javit ćemo vam razloge i dogovoriti dalji postupak, uključujući moguće umanjenje iznosa povrata.',
          },
          {
            t: 'p',
            text: 'Kada se povrat prihvati, novac vraćamo prema stranici „Povrat novca“.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── 3. POVRAT NOVCA ─────────────────────────────
  {
    slug: 'povrat-novca',
    title: 'Povrat novca',
    group: 'kupovina',
    kicker: 'Novac',
    lead: 'Novac vraćamo istim načinom plaćanja kojim je narudžba plaćena, bez nepotrebnog odlaganja i u zakonom propisanom roku.',
    updated: UPDATED,
    sections: [
      {
        id: 'kada-i-kako',
        title: 'Kada i kako vraćamo novac',
        blocks: [
          {
            t: 'p',
            text: 'Iznos vraćamo istim načinom plaćanja koji ste koristili pri kupovini, osim ako se izričito dogovorimo drugačije, i to bez dodatnih troškova za vas.',
          },
          {
            t: 'p',
            text: 'Kod odustanka od ugovora povrat vršimo bez nepotrebnog odlaganja, a najkasnije u roku od {rokOdustanka} od dana kada smo primili vašu izjavu o odustanku. Ako roba još nije vraćena, povrat možemo odložiti do prijema robe ili do dokaza da ste je poslali.',
          },
          {
            t: 'p',
            text: 'Kod raskida ugovora zbog nedostatka na robi povrat vršimo u zakonom propisanom roku.',
          },
        ],
      },
      {
        id: 'prema-nacinu-placanja',
        title: 'Povrat prema načinu plaćanja',
        blocks: [
          {
            t: 'dl',
            items: [
              {
                k: 'Gotovinom pri isporuci',
                v: 'Iznos vraćamo na transakcijski račun koji nam navedete ili, po dogovoru, gotovinom pri preuzimanju na adresi {sjediste}.',
              },
              {
                k: 'Bankovnim prenosom po predračunu',
                v: 'Iznos vraćamo na račun s kojeg je uplata izvršena ili na račun koji nam pisano navedete.',
              },
              {
                k: 'Karticom (kada bude aktivirano)',
                v: 'Kada plaćanje karticom bude aktivirano, iznos vraćamo na istu karticu preko platnog procesora. Vrijeme knjiženja na računu kartice zavisi od banke izdavaoca kartice i može biti duže od našeg roka obrade.',
              },
            ],
          },
        ],
      },
      {
        id: 'troskovi-dostave',
        title: 'Povrat troškova dostave',
        blocks: [
          {
            t: 'p',
            text: 'Kod odustanka od ugovora vraćamo i trošak standardne dostave koji ste platili pri narudžbi. Dodatni troškovi nastali zato što ste izabrali drugačiji, skuplji način dostave od standardnog ne vraćaju se.',
          },
          {
            t: 'p',
            text: 'Trošak vraćanja robe nismo dužni nadoknaditi, osim u slučajevima navedenim na stranici „Povrat robe“.',
          },
        ],
      },
      {
        id: 'umanjenje-vrijednosti',
        title: 'Umanjena vrijednost i djelimičan povrat',
        blocks: [
          {
            t: 'p',
            text: 'Ako vraćate samo dio narudžbe, vraćamo cijenu tog dijela. Ako je vrijednost vraćene robe umanjena zbog rukovanja koje nije bilo potrebno da se utvrde njena svojstva, iznos povrata umanjujemo srazmjerno tom umanjenju.',
          },
          {
            t: 'p',
            text: 'O svakom umanjenju obavještavamo vas pisano, s obrazloženjem, prije isplate.',
          },
        ],
      },
      {
        id: 'nakon-reklamacije',
        title: 'Povrat nakon reklamacije',
        blocks: [
          {
            t: 'p',
            text: 'Ako je ugovor raskinut zbog nedostatka na robi (v. „Garancija i reklamacije“), vraćamo cijenu robe, a troškove vraćanja robe snosimo mi.',
          },
        ],
      },
      {
        id: 'ako-novac-kasni',
        title: 'Ako novac kasni',
        blocks: [
          {
            t: 'p',
            text: 'Ako niste primili novac u očekivanom roku, provjerite kod banke, jer knjiženje može potrajati. Ako novca i dalje nema, javite nam se na {email} ili {telefon} i navedite broj narudžbe.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── 4. NAČINI PLAĆANJA ─────────────────────────────
  {
    slug: 'nacini-placanja',
    title: 'Načini plaćanja',
    group: 'kupovina',
    kicker: 'Plaćanje',
    lead: 'Cijene su u KM i uključuju PDV. Trenutno se može platiti gotovinom pri isporuci ili bankovnim prenosom po predračunu ili ponudi; plaćanje karticom preko sajta bit će dostupno kada bude aktivirano.',
    updated: UPDATED,
    sections: [
      {
        id: 'dostupni-nacini',
        title: 'Dostupni načini plaćanja',
        blocks: [
          {
            t: 'ul',
            items: [
              'gotovinom pri isporuci ili preuzimanju;',
              'bankovnim prenosom po predračunu ili ponudi;',
              'platnom karticom preko sajta (kada bude aktivirano);',
              'po posebnom dogovoru, za izvođače radova i veće narudžbe.',
            ],
          },
          {
            t: 'p',
            text: 'Način plaćanja birate pri narudžbi. Ako neki način nije dostupan za vašu narudžbu, to ćemo navesti prije potvrde.',
          },
        ],
      },
      {
        id: 'gotovina',
        title: 'Gotovinom pri isporuci',
        blocks: [
          {
            t: 'p',
            text: 'Iznos plaćate dostavljaču pri preuzimanju robe ili na prodajnom mjestu pri ličnom preuzimanju. Ako je moguće, pripremite tačan iznos. Račun dobijate uz robu.',
          },
        ],
      },
      {
        id: 'bankovni-prenos',
        title: 'Bankovni prenos po predračunu ili ponudi',
        blocks: [
          {
            t: 'ol',
            items: [
              'Nakon prijema narudžbe šaljemo predračun ili ponudu s ukupnim iznosom.',
              'Uplatu vršite na žiro račun {racun}, uz navedenu svrhu uplate (broj predračuna ili narudžbe).',
              'Robu otpremamo nakon što evidentiramo uplatu, osim ako je drugačije dogovoreno.',
            ],
          },
        ],
      },
      {
        id: 'kartica',
        title: 'Plaćanje karticom preko sajta',
        blocks: [
          {
            t: 'p',
            text: 'Plaćanje karticom preko sajta trenutno nije aktivno. Kada bude aktivirano, plaćanje će se obavljati kod platnog procesora, na njegovoj zaštićenoj stranici, a ova stranica bit će dopunjena.',
          },
        ],
      },
      {
        id: 'cijene-pdv-racun',
        title: 'Cijene, PDV i račun',
        blocks: [
          {
            t: 'p',
            text: 'Sve cijene iskazane su u konvertibilnim markama (KM) i uključuju PDV. Za svaku narudžbu izdajemo račun. Ako vam je račun potreban na pravno lice, navedite naziv, adresu, JIB i PDV broj pri narudžbi.',
          },
        ],
      },
      {
        id: 'izvodjaci',
        title: 'Uslovi za izvođače radova',
        blocks: [
          {
            t: 'p',
            text: 'Za izvođače radova i veće narudžbe uslovi plaćanja mogu se dogovoriti posebno. Takav dogovor važi samo ako je naveden u pisanoj ponudi ili ugovoru. Više o tome na stranici „Upit za izvođače i projekte“.',
          },
        ],
      },
      {
        id: 'sigurnost-podataka',
        title: 'Sigurnost podataka o plaćanju',
        blocks: [
          {
            t: 'p',
            text: 'Kada plaćanje karticom bude aktivirano, podatke o kartici unosite isključivo kod platnog procesora. Prodavac ih ne vidi i ne čuva. Podatke o kartici nikada ne šaljite e-poštom, porukom ili telefonom: nikada ih ne tražimo tim putem.',
          },
          {
            t: 'p',
            text: 'Lične podatke koje ostavite pri narudžbi obrađujemo prema stranici „Politika privatnosti“.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── 5. GARANCIJA I REKLAMACIJE ─────────────────────────────
  {
    slug: 'garancija-i-reklamacije',
    title: 'Garancija i reklamacije',
    group: 'kupovina',
    kicker: 'Reklamacije',
    lead: 'Prodavac odgovara za saobraznost robe ugovoru u zakonom propisanom roku, a za dio artikala postoji i garancija proizvođača. Reklamaciju možete podnijeti e-poštom, telefonom ili lično.',
    updated: UPDATED,
    sections: [
      {
        id: 'kako-podnijeti',
        title: 'Kako podnijeti reklamaciju',
        blocks: [
          {
            t: 'ol',
            items: [
              'Obavijestite nas o nedostatku bez odlaganja nakon što ga primijetite: e-poštom ({email}), telefonom ({telefon}) ili lično na adresi {sjediste}.',
              'Navedite broj narudžbe ili računa, naziv artikla, količinu i opis nedostatka.',
              'Priložite fotografije nedostatka i, ako postoje, oznake s ambalaže (na primjer broj serije).',
              'Sačuvajte robu i ambalažu do rješavanja reklamacije. Ako ste nedostatak uočili prije ugradnje, ne ugrađujte robu dok vam ne odgovorimo.',
            ],
          },
          {
            t: 'p',
            text: 'Prijem reklamacije evidentiramo i potvrđujemo. Na reklamaciju odgovaramo u najkraćem mogućem roku, a najkasnije u zakonom propisanom roku.',
          },
          {
            t: 'p',
            text: 'Ako je potrebno, zatražit ćemo dodatne informacije ili fotografije, a po potrebi i pregled robe. Zatim vas obavještavamo o predloženom rješenju i roku za njegovo izvršenje. Kod osnovane reklamacije troškove otklanjanja nedostatka, uključujući prevoz robe u vezi s reklamacijom, snosi prodavac.',
          },
        ],
      },
      {
        id: 'odgovornost-prodavca',
        title: 'Odgovornost prodavca za saobraznost',
        blocks: [
          {
            t: 'p',
            text: 'Prodavac odgovara da isporučena roba odgovara ugovoru: opisu, količini, kvalitetu i namjeni. Za nedostatke koji su postojali u trenutku prelaska rizika na potrošača odgovaramo u zakonom propisanom roku.',
          },
          {
            t: 'p',
            text: 'Ta odgovornost postoji bez obzira na garanciju proizvođača i ne može se ugovorom isključiti na štetu potrošača. Za kupce koji nisu potrošači, na primjer izvođače radova koji robu kupuju za svoju djelatnost, primjenjuju se ugovor i Zakon o obligacionim odnosima, uključujući obavezu da se nedostatak prijavi bez odlaganja.',
          },
        ],
      },
      {
        id: 'garancija-proizvodjaca',
        title: 'Garancija proizvođača',
        blocks: [
          {
            t: 'p',
            text: 'Za dio artikala proizvođač izdaje garanciju. Ako je izdata, uz robu dobijate garantni list ili je garancija navedena u dokumentaciji artikla. Trajanje, obim i način ostvarivanja garancije određuje proizvođač.',
          },
          {
            t: 'p',
            text: 'Garancija proizvođača je dodatna i ne isključuje vaša prava prema prodavcu. Sačuvajte garantni list, račun i uputstvo za ugradnju i upotrebu. Po potrebi vam pomažemo da zahtjev proslijedite proizvođaču ili ovlaštenom servisu.',
          },
        ],
      },
      {
        id: 'sta-mozete-zahtijevati',
        title: 'Šta možete zahtijevati',
        blocks: [
          {
            t: 'ul',
            items: [
              'popravku, odnosno otklanjanje nedostatka;',
              'zamjenu robe;',
              'sniženje cijene;',
              'raskid ugovora i povrat novca.',
            ],
          },
          {
            t: 'p',
            text: 'Redoslijed i uslove ostvarivanja ovih prava određuje zakon. U odgovoru na reklamaciju objašnjavamo šta je moguće u vašem slučaju. Povrat novca nakon raskida ugovora opisan je na stranici „Povrat novca“.',
          },
          {
            t: 'p',
            text: 'Kod robe koja se prodaje po dimenziji ili količini (na primjer ploče, građa ili rolne) nedostatak je najbolje prijaviti prije rezanja ili ugradnje cijele količine.',
          },
        ],
      },
      {
        id: 'steta-pri-dostavi',
        title: 'Vidljivo oštećenje pri dostavi',
        blocks: [
          {
            t: 'p',
            text: 'Ako ste pri preuzimanju uočili oštećenje, upišite ga na otpremnicu i javite nam se odmah, uz fotografije ambalaže i robe (v. „Dostava“). Za oštećenja nastala prije preuzimanja robe odgovara prodavac, a prijava odmah po preuzimanju znatno ubrzava rješavanje.',
          },
        ],
      },
      {
        id: 'sta-nije-obuhvaceno',
        title: 'Šta nije obuhvaćeno',
        blocks: [
          { t: 'p', text: 'Reklamacija nije osnovana kada je nedostatak posljedica:' },
          {
            t: 'ul',
            items: [
              'nepravilnog skladištenja nakon preuzimanja (na primjer vlaga, izlaganje suncu, neodgovarajuće slaganje paleta);',
              'nestručne ili neodgovarajuće ugradnje ili upotrebe suprotne uputstvu proizvođača;',
              'uobičajenog habanja i starenja;',
              'oštećenja nastalih nakon prelaska rizika na kupca, uključujući mehanička oštećenja i neovlaštene izmjene ili preradu robe.',
            ],
          },
          {
            t: 'p',
            text: 'Ako ocijenimo da reklamacija nije osnovana, dobijate pisano obrazloženje s razlozima.',
          },
        ],
      },
      {
        id: 'ako-se-ne-slazete',
        title: 'Ako se ne slažete s odgovorom',
        blocks: [
          {
            t: 'p',
            text: 'Ako niste zadovoljni odgovorom, možete zatražiti vansudsko rješavanje spora ili se obratiti nadležnom organu za zaštitu potrošača. Više na stranicama „Uslovi kupovine“ i „Podaci o prodavcu“.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── 6. STATUS NARUDŽBE ─────────────────────────────
  {
    slug: 'status-narudzbe',
    title: 'Status narudžbe',
    group: 'kupovina',
    kicker: 'Narudžba',
    lead: 'Status narudžbe trenutno provjeravate kontaktom s prodavcem, uz broj narudžbe. Praćenje narudžbe preko sajta bit će dostupno kada bude aktivirano.',
    updated: UPDATED,
    sections: [
      {
        id: 'provjera-statusa',
        title: 'Kako provjeriti status',
        blocks: [
          {
            t: 'p',
            text: 'Javite nam se e-poštom ({email}) ili telefonom ({telefon}) i navedite broj narudžbe. Ako ga nemate pri ruci, navedite ime i kontakt koje ste ostavili pri narudžbi.',
          },
          {
            t: 'p',
            text: 'Praćenje narudžbe preko sajta i korisnički nalozi bit će dostupni kada budu aktivirani. Ova stranica bit će tada dopunjena.',
          },
          {
            t: 'p',
            text: 'Pri naručivanju dobijate broj narudžbe. Sačuvajte ga: potreban je za sve upite, izmjene, odustanak od ugovora i reklamacije.',
          },
        ],
      },
      {
        id: 'faze-narudzbe',
        title: 'Faze narudžbe',
        blocks: [
          {
            t: 'ol',
            items: [
              '*Primljena.* Narudžba je zaprimljena; ugovor još nije zaključen.',
              '*Potvrđena.* Prodavac je potvrdio artikle, cijenu i uslove isporuke; ugovor je zaključen.',
              '*U pripremi.* Roba se priprema, pakuje ili sprema za utovar.',
              '*Isporučena ili preuzeta.* Roba je predata dostavljaču ili preuzeta lično.',
              '*Zatvorena.* Narudžba je završena, uključujući plaćanje.',
            ],
          },
          {
            t: 'p',
            text: 'Trajanje pojedinih faza zavisi od artikala, načina isporuke i plaćanja. Kod plaćanja po predračunu narudžba prelazi u pripremu nakon što evidentiramo uplatu.',
          },
        ],
      },
      {
        id: 'potvrda-narudzbe',
        title: 'Potvrda narudžbe',
        blocks: [
          {
            t: 'p',
            text: 'Nakon prijema narudžbe kontaktiramo vas e-poštom ili telefonom radi potvrde artikala, cijene i termina isporuke. Ugovor je zaključen tek kada vam potvrdu pošaljemo (v. „Uslovi kupovine“).',
          },
          {
            t: 'p',
            text: 'Ako potvrdu ne primite u razumnom roku, provjerite mapu s neželjenom poštom i javite nam se.',
          },
        ],
      },
      {
        id: 'izmjena-i-otkazivanje',
        title: 'Izmjena i otkazivanje prije otpreme',
        blocks: [
          {
            t: 'p',
            text: 'Narudžbu možete izmijeniti ili otkazati dok nije predata dostavljaču. Javite nam se što prije, uz broj narudžbe.',
          },
          {
            t: 'p',
            text: 'Ako je narudžba već otpremljena, primjenjuju se pravila o odustanku od ugovora i povratu robe. Za robu koja se reže, miješa ili priprema po vašoj specifikaciji izmjena ili otkazivanje možda neće biti moguće nakon početka pripreme.',
          },
        ],
      },
      {
        id: 'nedostupan-artikal',
        title: 'Ako artikal nije dostupan',
        blocks: [
          {
            t: 'p',
            text: 'Ako neki artikal iz narudžbe nije raspoloživ, obavještavamo vas bez odlaganja i nudimo mogućnosti:',
          },
          {
            t: 'ul',
            items: [
              'da sačekate isporuku artikla, uz novi rok;',
              'da prihvatite zamjenski artikal, uz vašu saglasnost;',
              'da vam isporučimo ostatak narudžbe;',
              'da nedostupni dio, ili cijelu narudžbu, otkažete.',
            ],
          },
          {
            t: 'p',
            text: 'Ako ste već platili, povrat se vrši prema stranici „Povrat novca“.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── 7. USLOVI KUPOVINE ─────────────────────────────
  {
    slug: 'uslovi-kupovine',
    title: 'Uslovi kupovine',
    group: 'pravno',
    kicker: 'Opšti uslovi',
    lead: 'Ovi uslovi uređuju kupovinu u internet prodavnici firme {naziv}. Slanjem narudžbe potvrđujete da ste ih pročitali i da ih prihvatate.',
    updated: UPDATED,
    sections: [
      {
        id: 'prodavac-i-pojmovi',
        title: 'Prodavac, područje primjene i pojmovi',
        blocks: [
          {
            t: 'p',
            text: 'Prodavac je {naziv} iz Banje Luke (u daljem tekstu: *prodavac* ili „mi“), sjedište: {sjediste}, JIB: {jib}, PDV broj: {pdv}, registracija: {registracija}. Firmu zastupa direktor {direktor}. Potpuni podaci nalaze se na stranici „Podaci o prodavcu“.',
          },
          {
            t: 'p',
            text: 'Ovi uslovi primjenjuju se na sve narudžbe robe poslate putem internet prodavnice, kao i na narudžbe poslate telefonom ili e-poštom, ako nije drugačije dogovoreno. Za izvođače radova i veće projekte mogu se pisano dogovoriti posebni uslovi; oni imaju prednost nad ovim uslovima u dijelu u kojem se razlikuju.',
          },
          { t: 'p', text: 'U ovim uslovima:' },
          {
            t: 'ul',
            items: [
              '*kupac* je svako fizičko ili pravno lice koje naručuje robu od prodavca;',
              '*potrošač* je fizičko lice koje robu kupuje izvan svoje trgovačke, poslovne, zanatske ili profesionalne djelatnosti;',
              '*izvođač radova* je kupac koji robu kupuje za potrebe svoje djelatnosti ili za izvođenje radova za treća lica;',
              '*narudžba* je ponuda kupca za zaključenje ugovora o kupoprodaji robe;',
              '*ugovor na daljinu* je ugovor zaključen putem sajta, telefona ili e-pošte, bez istovremenog fizičkog prisustva obje strane;',
              '*roba* su artikli prikazani u prodavnici.',
            ],
          },
          {
            t: 'p',
            text: 'Odredbe koje su namijenjene isključivo potrošačima, poput prava na odustanak od ugovora, ne primjenjuju se na kupce koji nisu potrošači.',
          },
          {
            t: 'p',
            text: 'Robu mogu naručivati punoljetna i poslovno sposobna lica. Ove uslove možete u svakom trenutku pročitati na sajtu, sačuvati ih ili odštampati.',
          },
        ],
      },
      {
        id: 'narucivanje',
        title: 'Naručivanje i zaključenje ugovora',
        blocks: [
          { t: 'p', text: 'Narudžba putem internet prodavnice odvija se u sljedećim koracima:' },
          {
            t: 'ol',
            items: [
              'Odaberite artikle i dodajte ih u korpu.',
              'Provjerite sadržaj korpe: artikle, količine i cijene.',
              'Unesite podatke potrebne za isporuku i kontakt (ime, adresu, telefon, e-poštu).',
              'Odaberite način isporuke i način plaćanja.',
              'Pregledajte cjelokupnu narudžbu i ispravite eventualne greške u unosu prije slanja.',
              'Pošaljite narudžbu završnim dugmetom, koje je jasno označeno i navodi da narudžba obavezuje na plaćanje.',
            ],
          },
          {
            t: 'p',
            text: 'Narudžbu možete uputiti i telefonom ili e-poštom; tada se primjenjuju isti uslovi.',
          },
          {
            t: 'p',
            text: 'Slanjem narudžbe dajete ponudu za zaključenje ugovora. Ugovor je zaključen tek kada prodavac potvrdi narudžbu, e-poštom ili telefonom. Do potvrde prodavac nije obavezan da isporuči robu.',
          },
          {
            t: 'p',
            text: 'Ako narudžbu ne potvrdimo u razumnom roku, možete nas kontaktirati, a do potvrde možete i povući narudžbu. Prodavac može odbiti ili izmijeniti narudžbu, naročito zbog nedostupnosti artikla, očigledne greške u cijeni ili opisu ili nemogućnosti isporuke na traženu adresu. O tome vas obavještavamo bez odlaganja, a ako ste već platili, iznos vraćamo prema stranici „Povrat novca“. Postupak kod nedostupnog artikla opisan je na stranici „Status narudžbe“.',
          },
          {
            t: 'p',
            text: 'Fotografije i opisi artikala su informativni, a boje na ekranu mogu odstupati od stvarnih. Za tehničke pojedinosti obratite nam se prije naručivanja.',
          },
          {
            t: 'p',
            text: 'Kupac odgovara za tačnost podataka unesenih pri narudžbi. Pogrešna adresa ili neispravan kontakt mogu odložiti isporuku, a dodatni troškovi koji zbog toga nastanu mogu pasti na kupca. Uz potvrdu narudžbe šaljemo vam ove uslove ili vezu do njih, kao i podatke o narudžbi.',
          },
        ],
      },
      {
        id: 'cijene-i-placanje',
        title: 'Cijene, PDV i plaćanje',
        blocks: [
          {
            t: 'p',
            text: 'Sve cijene iskazane su u konvertibilnim markama (KM) i uključuju porez na dodatu vrijednost (PDV). Mjerodavna je cijena prikazana u trenutku slanja narudžbe i navedena u potvrdi narudžbe.',
          },
          {
            t: 'p',
            text: 'Trošak dostave, ako se obračunava, saopštava se prije nego što se obavežete na plaćanje. Za narudžbe od {besplatnaDostava} dostava je besplatna.',
          },
          {
            t: 'p',
            text: 'Prodavac može promijeniti cijene u bilo kom trenutku, ali promjena ne utiče na narudžbe koje su već potvrđene. Ako uočimo očiglednu grešku u cijeni, obavijestit ćemo vas prije potvrde i ponuditi da narudžbu potvrdite po ispravnoj cijeni ili da je otkažete bez ikakvih obaveza.',
          },
          {
            t: 'p',
            text: 'Plaćanje je moguće gotovinom pri isporuci ili bankovnim prenosom po predračunu ili ponudi. Plaćanje karticom preko sajta bit će dostupno kada bude aktivirano. Pojedinosti su na stranici „Načini plaćanja“. Za svaku narudžbu izdaje se račun.',
          },
          {
            t: 'p',
            text: 'Račun se izdaje na ime kupca navedenog u narudžbi. Za račun na pravno lice navedite naziv, adresu, JIB i PDV broj pri narudžbi.',
          },
          {
            t: 'p',
            text: 'Ako uplata po predračunu ne stigne u roku navedenom u predračunu, prodavac može otkazati narudžbu i osloboditi rezervisanu robu, o čemu vas obavještava. Kod plaćanja po posebnom dogovoru, na primjer za izvođače radova, važe uslovi navedeni u pisanoj ponudi ili ugovoru.',
          },
        ],
      },
      {
        id: 'isporuka-odustanak-reklamacije',
        title: 'Isporuka, odustanak i reklamacije',
        blocks: [
          {
            t: 'p',
            text: '*Isporuka.* Područje dostave, rokovi, troškovi, istovar i preuzimanje opisani su na stranici „Dostava“. Uobičajeni rok isporuke je {rokIsporuke}, a područje dostave: {zonaDostave}.',
          },
          {
            t: 'p',
            text: '*Odustanak od ugovora.* Potrošač ima pravo da u roku od {rokOdustanka} odustane od ugovora zaključenog na daljinu, bez navođenja razloga, osim za robu za koju to pravo zbog njene prirode ne postoji. Postupak i model obrasca nalaze se na stranici „Odustanak od ugovora“, a uslovi vraćanja robe i novca na stranicama „Povrat robe“ i „Povrat novca“.',
          },
          {
            t: 'p',
            text: '*Saobraznost i reklamacije.* Prodavac odgovara za saobraznost robe ugovoru u zakonom propisanom roku. Kako se podnosi reklamacija, objašnjeno je na stranici „Garancija i reklamacije“. Garancija proizvođača, kada je izdata, dodatna je i ne isključuje odgovornost prodavca.',
          },
          {
            t: 'p',
            text: '*Prelazak rizika.* Rizik od oštećenja ili propasti robe prelazi na kupca u trenutku preuzimanja robe. Robu pri preuzimanju pregledajte kako je opisano na stranici „Dostava“.',
          },
          {
            t: 'p',
            text: '*Izuzeci.* Zbog prirode građevinskog materijala povrat robe i odustanak od ugovora nisu mogući ili su ograničeni za robu koja je rezana, miješana ili izrađena po mjeri, za ugrađenu ili obrađenu robu, za otvorenu higijenski osjetljivu robu te za oštećenu ili korištenu robu. Detaljan opis nalazi se na stranici „Odustanak od ugovora“.',
          },
        ],
      },
      {
        id: 'odgovornost-i-sadrzaj',
        title: 'Odgovornost i sadržaj sajta',
        blocks: [
          {
            t: 'p',
            text: 'Prodavac odgovara u skladu sa zakonom. Ništa u ovim uslovima ne isključuje niti ograničava odgovornost koja se prema važećim propisima ne može isključiti ili ograničiti, niti prava koja su potrošaču zakonom zagarantovana.',
          },
          {
            t: 'p',
            text: 'Prodavac ne odgovara za štetu nastalu nepravilnom ugradnjom ili upotrebom robe suprotno uputstvu proizvođača, kao ni za štetu nastalu okolnostima na koje nije mogao uticati, u mjeri u kojoj je to zakonom dopušteno.',
          },
          {
            t: 'p',
            text: 'Tehničke i savjetodavne informacije na sajtu imaju informativni karakter. Za izbor materijala za konkretan objekat obratite se našem stručnom timu ili projektantu.',
          },
          {
            t: 'p',
            text: 'Sadržaj sajta (tekstovi, fotografije, grafike, logotipi i dizajn) zaštićen je autorskim i srodnim pravima i pripada prodavcu ili licima od kojih je pribavljeno pravo korištenja. Preuzimanje, umnožavanje ili objavljivanje bez prethodne pisane saglasnosti nije dozvoljeno. Nazivi i oznake proizvođača pripadaju njihovim vlasnicima.',
          },
          {
            t: 'p',
            text: 'Prodavac ne garantuje da će sajt raditi neprekidno i bez grešaka i može ga privremeno obustaviti radi održavanja. Sajt može sadržavati veze ka sajtovima trećih lica, za čiji sadržaj prodavac ne odgovara.',
          },
        ],
      },
      {
        id: 'licni-podaci',
        title: 'Lični podaci',
        blocks: [
          {
            t: 'p',
            text: 'Lične podatke koje ostavite pri narudžbi ili upitu obrađujemo u mjeri potrebnoj za ispunjenje ugovora i u skladu s važećim propisima o zaštiti ličnih podataka u Bosni i Hercegovini. Lične podatke ne prodajemo i ne koristimo ih za slanje reklamnih poruka bez vaše saglasnosti. Imate pravo na pristup, ispravku, brisanje i druga prava opisana u politici; zahtjeve šaljite na {email}.',
          },
          {
            t: 'p',
            text: 'Svrhe obrade, pravni osnovi, rokovi čuvanja i vaša prava opisani su na stranici „Politika privatnosti“.',
          },
        ],
      },
      {
        id: 'sporovi-i-pravo',
        title: 'Rješavanje sporova i mjerodavno pravo',
        blocks: [
          {
            t: 'p',
            text: 'Ako imate primjedbu, prvo se obratite prodavcu (e-pošta {email}, telefon {telefon}). Trudimo se da svaki prigovor riješimo sporazumno.',
          },
          {
            t: 'p',
            text: 'Prigovor možete uputiti i pisano, na adresu ili e-poštu prodavca, a na pisani prigovor odgovaramo u najkraćem mogućem roku. Većinu nesporazuma moguće je riješiti razgovorom, zato vas molimo da nam se obratite prije pokretanja bilo kakvog postupka.',
          },
          {
            t: 'p',
            text: 'Potrošač može zatražiti i vansudsko rješavanje spora u skladu sa zakonom kojim se uređuje zaštita potrošača, kao i obratiti se nadležnom organu za zaštitu potrošača.',
          },
          {
            t: 'p',
            text: 'Sporove koji se ne riješe sporazumno rješava nadležni sud u Banjoj Luci, ako zakonom nije određeno drugačije.',
          },
          {
            t: 'p',
            text: 'Na ove uslove i na ugovor primjenjuje se pravo Republike Srpske i Bosne i Hercegovine, a posebno Zakon o zaštiti potrošača Republike Srpske i Zakon o obligacionim odnosima.',
          },
        ],
      },
      {
        id: 'izmjene-i-kontakt',
        title: 'Izmjene uslova i kontakt',
        blocks: [
          {
            t: 'p',
            text: 'Prodavac može izmijeniti ove uslove. Izmjene važe od objave na sajtu i ne primjenjuju se na narudžbe koje su potvrđene prije izmjene. Datum posljednje izmjene naveden je na vrhu stranice.',
          },
          {
            t: 'p',
            text: 'Za narudžbu važe uslovi koji su bili objavljeni u trenutku slanja narudžbe. Ako je neka odredba ovih uslova ništava ili neprimjenjiva, ostale odredbe ostaju na snazi.',
          },
          {
            t: 'dl',
            items: [
              { k: 'Prodavac', v: '{naziv}' },
              { k: 'Adresa', v: '{sjediste}' },
              { k: 'E-pošta', v: '{email}' },
              { k: 'Telefon', v: '{telefon}' },
            ],
          },
        ],
      },
    ],
  },

  // ───────────────────────────── 8. POLITIKA PRIVATNOSTI ─────────────────────────────
  {
    slug: 'politika-privatnosti',
    title: 'Politika privatnosti',
    group: 'pravno',
    kicker: 'Lični podaci',
    lead: 'Ovdje objašnjavamo koje lične podatke prikupljamo, zašto, koliko dugo ih čuvamo i koja prava imate. Podatke koristimo samo u mjeri potrebnoj za rad prodavnice i ne prodajemo ih.',
    updated: UPDATED,
    sections: [
      {
        id: 'ko-obradjuje-podatke',
        title: 'Ko obrađuje vaše podatke',
        blocks: [
          {
            t: 'p',
            text: 'Kontrolor (voditelj obrade) je onaj ko odlučuje zašto i kako se lični podaci obrađuju. Za podatke prikupljene putem ovog sajta to je {naziv} iz Banje Luke (u daljem tekstu: *mi*).',
          },
          {
            t: 'dl',
            items: [
              { k: 'Kontrolor', v: '{naziv}' },
              { k: 'Sjedište', v: '{sjediste}' },
              { k: 'JIB', v: '{jib}' },
              { k: 'Pitanja o ličnim podacima', v: '{email}' },
              { k: 'Telefon', v: '{telefon}' },
            ],
          },
          {
            t: 'p',
            text: 'Ova politika odnosi se na podatke koje ostavite pri kupovini, slanju upita ili zahtjeva za uzorke, prijavi na newsletter i pri korištenju sajta. Podatke obrađujemo u skladu s važećim propisima o zaštiti ličnih podataka u Bosni i Hercegovini.',
          },
          {
            t: 'p',
            text: 'Lični podatak je svaka informacija na osnovu koje se možete prepoznati, na primjer ime, adresa, telefon ili e-pošta. Obrada je svaka radnja s podacima: prikupljanje, čuvanje, korištenje, prosljeđivanje ili brisanje.',
          },
        ],
      },
      {
        id: 'koje-podatke-obradjujemo',
        title: 'Koje podatke obrađujemo i kada',
        blocks: [
          { t: 'p', text: 'Podaci koje obrađujemo zavise od toga šta radite na sajtu:' },
          {
            t: 'ul',
            items: [
              '*Narudžbe:* ime i prezime (ili naziv firme), adresa isporuke, telefon, e-pošta, za pravna lica JIB i PDV broj, sadržaj narudžbe te izabrani način isporuke i plaćanja.',
              '*Upiti i kontakt:* podaci koje unesete u obrazac ili pošaljete e-poštom ili telefonom, i sadržaj vaše poruke.',
              '*Zahtjevi za uzorke:* kontakt podaci, adresa za slanje i popis željenih materijala.',
              '*Upiti za izvođače i projekte:* naziv firme ili ime, kontakt, lokacija gradilišta, popis materijala i rok.',
              '*Newsletter:* adresa e-pošte i, ako ga navedete, ime.',
              '*Tehnički podaci:* IP adresa, vrsta preglednika, datum i vrijeme pristupa te zapisi servera, koji su nužni za rad i sigurnost sajta.',
            ],
          },
          {
            t: 'p',
            text: 'Podatke uglavnom dobijamo direktno od vas. Od dostavljača možemo dobiti obavijest o stanju isporuke. Ako nas pozovete telefonom ili pišete e-poštom, možemo zabilježiti ime, broj telefona i sadržaj upita radi rješavanja vašeg zahtjeva. Za firme obrađujemo i podatke o kontakt osobi.',
          },
          {
            t: 'p',
            text: 'Tehničke zapise servera koristimo samo za rad i sigurnost sajta i ne povezujemo ih s vašim narudžbama radi profilisanja.',
          },
          {
            t: 'p',
            text: 'Ako nam dostavljate podatke trećeg lica, na primjer kontakt osobe na gradilištu ili primaoca isporuke, molimo vas da to činite samo ako je to lice s tim upoznato.',
          },
          {
            t: 'p',
            text: 'Podatke dajete dobrovoljno, ali bez podataka nužnih za narudžbu, poput adrese isporuke, ne možemo je ispuniti. Ne prikupljamo posebne kategorije ličnih podataka i ne vršimo profilisanje niti automatizovano odlučivanje o vama. Podatke o platnoj kartici ne tražimo i ne čuvamo.',
          },
        ],
      },
      {
        id: 'svrhe-i-osnovi',
        title: 'Svrhe i pravni osnovi',
        blocks: [
          {
            t: 'dl',
            items: [
              {
                k: 'Obrada narudžbi, isporuka, naplata, odustanak i reklamacije',
                v: 'Izvršenje ugovora i radnje koje preduzimamo na vaš zahtjev prije zaključenja ugovora.',
              },
              {
                k: 'Obavijesti o narudžbi (potvrda, promjena termina isporuke, stanje narudžbe)',
                v: 'Izvršenje ugovora.',
              },
              {
                k: 'Računovodstvo, porezi i čuvanje isprava',
                v: 'Zakonska obaveza.',
              },
              {
                k: 'Vođenje evidencije upita, prigovora i zahtjeva',
                v: 'Naš legitimni interes da dokažemo šta je traženo i dogovoreno, te, gdje je primjenjivo, zakonska obaveza.',
              },
              {
                k: 'Odgovor na upite, zahtjeve za uzorke i priprema ponuda',
                v: 'Radnje na vaš zahtjev i naš legitimni interes da odgovorimo na vaš upit.',
              },
              {
                k: 'Slanje newslettera',
                v: 'Vaša saglasnost, koju možete povući u svakom trenutku.',
              },
              {
                k: 'Sigurnost sajta, sprečavanje zloupotreba, zaštita pravnih zahtjeva',
                v: 'Legitimni interes.',
              },
            ],
          },
          {
            t: 'p',
            text: 'Kada se obrada zasniva na legitimnom interesu, vodimo računa da on ne prevlada nad vašim pravima i slobodama.',
          },
          {
            t: 'p',
            text: 'Kada se obrada zasniva na saglasnosti, saglasnost je dobrovoljna i njeno uskraćivanje ne utiče na mogućnost kupovine. Podaci koji su nam potrebni za izvršenje ugovora ili zbog zakonske obaveze ne mogu se obrisati dok ta obaveza traje.',
          },
        ],
      },
      {
        id: 'cuvanje-podataka',
        title: 'Koliko dugo čuvamo podatke',
        blocks: [
          {
            t: 'p',
            text: 'Podatke čuvamo onoliko koliko je potrebno za svrhu radi koje su prikupljeni, odnosno onoliko koliko zakon nalaže:',
          },
          {
            t: 'ul',
            items: [
              '*narudžbe i računi:* onoliko koliko zakon nalaže za računovodstvene isprave;',
              '*odustanak i reklamacije:* dok traju rokovi za ostvarivanje prava i za eventualne zahtjeve iz ugovora;',
              '*upiti i prepiska:* dok je potrebno za odgovor i, ako ugovor nije zaključen, još razumno vrijeme nakon toga;',
              '*newsletter:* do odjave ili povlačenja saglasnosti;',
              '*tehnički zapisi:* kraće, onoliko koliko je potrebno za sigurnost i rad sajta.',
            ],
          },
          {
            t: 'p',
            text: 'Kada svrha prestane, podatke brišemo ili anonimizujemo, osim ako zakon nalaže duže čuvanje.',
          },
          {
            t: 'p',
            text: 'Ako se vodi spor ili postupak pred nadležnim organom, podatke potrebne za taj postupak čuvamo do njegovog okončanja. Ako zatražite brisanje podataka koje moramo čuvati po zakonu, obavijestit ćemo vas zašto ih ne možemo odmah obrisati.',
          },
        ],
      },
      {
        id: 'primaoci-i-prenos',
        title: 'Kome otkrivamo podatke i prenos van BiH',
        blocks: [
          {
            t: 'p',
            text: 'Podatke ne prodajemo. Dijelimo ih samo s licima koja su nam potrebna za pružanje usluge, u mjeri u kojoj je to nužno:',
          },
          {
            t: 'ul',
            items: [
              'dostavljači, radi isporuke robe;',
              'računovodstvo, radi vođenja poslovnih knjiga i poreskih obaveza;',
              'pružalac usluge hostinga, koji održava sajt;',
              'platni procesor, kada plaćanje karticom bude aktivirano;',
              'državni organi (na primjer poreski organi, inspekcije, sudovi), kada je to zakonom obavezno.',
            ],
          },
          {
            t: 'p',
            text: 'Dostavljačima dajemo samo podatke potrebne da isporuka bude izvršena (ime, adresu, telefon i sadržaj pošiljke). Računovodstvo dobija podatke sadržane u računima i drugim poslovnim knjigama. S ostalim licima vaše podatke ne dijelimo u reklamne svrhe.',
          },
          {
            t: 'p',
            text: 'Lica koja podatke obrađuju u naše ime smiju ih koristiti samo prema našim uputstvima i za svrhe navedene ovdje.',
          },
          {
            t: 'p',
            text: 'Pružalac usluge hostinga može obrađivati podatke, na primjer tehničke zapise, na serverima izvan Bosne i Hercegovine. U tom slučaju prenos se vrši uz odgovarajuće zaštitne mjere, u skladu s važećim propisima. Tražimo da podaci budu zaštićeni na nivou koji propisi zahtijevaju, na primjer kroz ugovorne obaveze o zaštiti podataka. Na vaš zahtjev možemo vam dati više informacija o tome.',
          },
        ],
      },
      {
        id: 'vasa-prava',
        title: 'Vaša prava',
        blocks: [
          { t: 'p', text: 'U vezi s vašim podacima imate sljedeća prava:' },
          {
            t: 'ul',
            items: [
              '*pristup*: da saznate obrađujemo li vaše podatke i da dobijete kopiju podataka koje o vama obrađujemo;',
              '*ispravka*: da netačne ili nepotpune podatke ispravimo ili dopunimo;',
              '*brisanje*: da podatke obrišemo kada za njihovu obradu više nema osnova;',
              '*ograničenje obrade*: da se podaci privremeno samo čuvaju, na primjer dok provjeravamo njihovu tačnost;',
              '*prigovor* na obradu koja se zasniva na legitimnom interesu;',
              '*prenosivost*: da podatke koje ste nam dali dobijete u uobičajenom, čitljivom obliku, gdje je primjenjivo;',
              '*povlačenje saglasnosti* u svakom trenutku, bez uticaja na zakonitost obrade prije povlačenja.',
            ],
          },
          {
            t: 'p',
            text: 'Zahtjev možete poslati na {email} ili poštom na {sjediste}. Odgovaramo u zakonom propisanom roku, a radi zaštite vaših podataka možemo tražiti potvrdu identiteta.',
          },
          {
            t: 'p',
            text: 'Zahtjeve razmatramo bez naknade, osim ako je zahtjev očigledno neosnovan ili pretjeran, u skladu s propisima. Ako zahtjev odbijemo, obavijestit ćemo vas o razlozima.',
          },
          {
            t: 'p',
            text: 'Ako smatrate da se vaši podaci obrađuju suprotno propisima, možete podnijeti žalbu Agenciji za zaštitu ličnih podataka u Bosni i Hercegovini.',
          },
        ],
      },
      {
        id: 'sigurnost-i-newsletter',
        title: 'Sigurnost, maloljetnici i newsletter',
        blocks: [
          {
            t: 'p',
            text: 'Primjenjujemo tehničke i organizacione mjere zaštite srazmjerne prirodi podataka: pristup je ograničen na lica kojima je potreban za rad, prenos podataka između vašeg preglednika i sajta zaštićen je šifrovanom vezom, a saradnike i pružaoce usluga biramo pažljivo. Nijedan sistem nije potpuno siguran; u slučaju povrede podataka koja može ugroziti vaša prava postupit ćemo u skladu s propisima, uključujući obavještavanje nadležnog organa i, gdje je potrebno, vas.',
          },
          {
            t: 'p',
            text: 'Papirnu dokumentaciju s ličnim podacima, na primjer otpremnice i račune, čuvamo tako da je neovlaštena lica ne mogu dobiti na uvid.',
          },
          {
            t: 'p',
            text: 'Sajt nije namijenjen osobama mlađim od 16 godina i svjesno ne prikupljamo njihove podatke. Ako smatrate da nam je lice mlađe od 16 godina dostavilo podatke, javite nam se pa ćemo ih izbrisati.',
          },
          {
            t: 'p',
            text: 'Newsletter dobijate samo ako ste se prijavili. Odjaviti se možete u svakom trenutku vezom za odjavu u poruci ili porukom na {email}. Adresu e-pošte za newsletter koristimo samo za slanje obavijesti na koje ste pristali i ne spajamo je s podacima o vašim narudžbama radi ciljanog oglašavanja.',
          },
        ],
      },
      {
        id: 'izmjene-i-kontakt',
        title: 'Izmjene politike i kontakt',
        blocks: [
          {
            t: 'p',
            text: 'Ovu politiku možemo mijenjati, na primjer zbog promjene propisa ili novih funkcija sajta. Važeća verzija uvijek je objavljena na ovoj stranici, a datum posljednje izmjene naveden je na vrhu. Prethodne verzije možete dobiti na zahtjev. Ako vam nešto u ovoj politici nije jasno, pitajte nas prije nego što ostavite podatke. Ako budemo uvodili obradu za koju je potrebna vaša saglasnost, tražit ćemo je prije početka obrade.',
          },
          {
            t: 'p',
            text: 'Pitanja o zaštiti ličnih podataka možete uputiti na {email} ili telefonom na {telefon}.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── 10. ODUSTANAK OD UGOVORA ─────────────────────────────
  {
    slug: 'odustanak-od-ugovora',
    title: 'Odustanak od ugovora',
    group: 'pravno',
    kicker: 'Odustanak',
    lead: 'Ako ste potrošač i robu ste naručili na daljinu, od ugovora možete odustati u roku od {rokOdustanka}, bez navođenja razloga. Ispod je postupak i model obrasca.',
    updated: UPDATED,
    sections: [
      {
        id: 'pravo-na-odustanak',
        title: 'Pravo na odustanak',
        blocks: [
          {
            t: 'p',
            text: 'Potrošač ima pravo da u roku od {rokOdustanka} odustane od ugovora zaključenog na daljinu (putem sajta, telefona ili e-pošte), bez navođenja razloga i bez ugovorne kazne.',
          },
          {
            t: 'p',
            text: 'Odustati možete i prije nego što robu primite: dovoljno je da nam to javite. Odustankom se obje strane oslobađaju obaveza iz ugovora, a sve što je primljeno vraća se.',
          },
          {
            t: 'p',
            text: 'Rok teče od dana kada ste vi, ili lice koje ste odredili (a koje nije dostavljač), preuzeli robu. Ako je više artikala naručeno odjednom, a isporučeni su odvojeno, rok teče od preuzimanja posljednjeg artikla ili posljednje pošiljke.',
          },
          {
            t: 'p',
            text: 'Pravo na odustanak imaju samo potrošači. Ne odnosi se na pravna lica i izvođače radova koji robu kupuju za svoju djelatnost.',
          },
        ],
      },
      {
        id: 'kako-odustati',
        title: 'Kako odustati',
        blocks: [
          {
            t: 'ol',
            items: [
              'Pošaljite nam jasnu izjavu da odustajete od ugovora: e-poštom na {email} ili poštom na {sjediste}. Odustanak možete saopštiti i telefonom ({telefon}), ali ga radi dokaza potvrdite i pisano.',
              'Navedite broj narudžbe, artikle i datum kada ste robu primili.',
              'Možete koristiti model obrasca ispod, ali to nije obavezno.',
              'Izjavu je dovoljno poslati prije isteka roka od {rokOdustanka}.',
            ],
          },
          {
            t: 'p',
            text: 'Prijem vaše izjave potvrđujemo bez odlaganja.',
          },
        ],
      },
      {
        id: 'vracanje-robe',
        title: 'Vraćanje robe',
        blocks: [
          {
            t: 'p',
            text: 'Robu vratite bez nepotrebnog odlaganja, a najkasnije u roku od {rokOdustanka} od dana kada ste nam saopštili odustanak. Rok je ispoštovan ako robu pošaljete prije njegovog isteka.',
          },
          {
            t: 'p',
            text: 'Robu vraćate u stanju u kojem ste je primili, po mogućnosti u originalnoj ambalaži, s priborom i dokumentima. Troškove vraćanja snosite vi, osim ako smo naveli drugačije. Za tešku i paletnu robu prevoz dogovorite s nama unaprijed (v. „Povrat robe“).',
          },
        ],
      },
      {
        id: 'povrat-novca',
        title: 'Povrat novca',
        blocks: [
          {
            t: 'p',
            text: 'Vraćamo sve uplate koje smo od vas primili, uključujući trošak standardne dostave, istim načinom plaćanja kojim ste platili. To činimo bez nepotrebnog odlaganja, a najkasnije u roku od {rokOdustanka} od dana kada smo primili vašu izjavu o odustanku. Možemo sačekati da robu primimo ili da dokažete da ste je poslali.',
          },
          {
            t: 'p',
            text: 'Dodatni troškovi izabranog skupljeg načina dostave ne vraćaju se. Ako je vrijednost robe umanjena zbog rukovanja koje nije bilo potrebno da se utvrde njena svojstva, odgovarate za to umanjenje. Pojedinosti su na stranici „Povrat novca“.',
          },
        ],
      },
      {
        id: 'izuzeci',
        title: 'Kada odustanak nije moguć',
        blocks: [
          {
            t: 'p',
            text: 'Zbog prirode robe pravo na odustanak ne postoji ili je ograničeno za:',
          },
          {
            t: 'ul',
            items: [
              'robu koja je rezana, miješana ili izrađena po mjeri ili prema specifikaciji kupca;',
              'robu koja je ugrađena ili obrađena tako da se ne može vratiti u originalnom stanju;',
              'otvorenu higijenski osjetljivu robu, na primjer dijelove sanitarne opreme čija je higijenska ambalaža otvorena;',
              'oštećenu ili korištenu robu čija je vrijednost umanjena preko mjere potrebne za pregled.',
            ],
          },
          {
            t: 'p',
            text: 'Kada roba ima nedostatak, vaša prava ostaju ista. Pogledajte „Garancija i reklamacije“.',
          },
        ],
      },
      {
        id: 'model-obrasca',
        title: 'Model obrasca',
        blocks: [
          {
            t: 'box',
            title: 'Model obrasca za odustanak od ugovora',
            lines: [
              '(Popunite i pošaljite ovaj obrazac samo ako želite odustati od ugovora.)',
              'Prima: {naziv}, {sjediste}, e-pošta: {email}',
              'Ovim izjavljujem da odustajem od ugovora o kupovini sljedeće robe: ______________________________',
              'Naručeno dana: ______________ / Primljeno dana: ______________ (broj narudžbe: ______________)',
              'Ime i prezime potrošača: ______________________________',
              'Adresa potrošača: ______________________________',
              'Potpis potrošača (samo ako se obrazac dostavlja na papiru): ______________________________',
              'Datum: ______________',
            ],
          },
          {
            t: 'note',
            text: 'Korištenje obrasca nije obavezno; dovoljna je bilo koja jasna izjava o odustanku.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── 11. PODACI O PRODAVCU ─────────────────────────────
  {
    slug: 'o-prodavcu',
    title: 'Podaci o prodavcu',
    group: 'pravno',
    kicker: 'Impressum',
    lead: 'Ko je prodavac, kako nas možete kontaktirati i kome se možete obratiti kao potrošač.',
    updated: UPDATED,
    sections: [
      {
        id: 'podaci',
        title: 'Podaci o prodavcu',
        blocks: [
          {
            t: 'p',
            text: '{naziv} bavi se trgovinom na veliko i malo građevinskim materijalom: sistemima suhe gradnje, kamenom vunom, drvom i sanitarnom opremom. Prodavnica je namijenjena privatnim kupcima i izvođačima radova.',
          },
          {
            t: 'dl',
            items: [
              { k: 'Naziv', v: '{naziv}' },
              { k: 'Sjedište', v: '{sjediste}' },
              {
                k: 'Djelatnost',
                v: 'Trgovina na veliko drvom, građevinskim materijalom i sanitarnom opremom, šifra G 46.73',
              },
              { k: 'JIB', v: '{jib}' },
              { k: 'PDV broj', v: '{pdv}' },
              { k: 'Registracija', v: '{registracija}' },
              { k: 'Direktor', v: '{direktor}' },
              { k: 'Žiro račun', v: '{racun}' },
              { k: 'E-pošta', v: '{email}' },
              { k: 'Telefon', v: '{telefon}' },
              { k: 'Web', v: '{web}' },
              { k: 'Posluje od', v: '23. aprila 2012.' },
            ],
          },
        ],
      },
      {
        id: 'kontakt',
        title: 'Kontakt',
        blocks: [
          {
            t: 'p',
            text: 'Za narudžbe, isporuke, reklamacije i upite koristite e-poštu {email} ili telefon {telefon}. Uz poruku navedite broj narudžbe, ako postoji. Poruke primljene e-poštom evidentiramo i odgovaramo na njih u najkraćem mogućem roku, a za brži odgovor ostavite i kontakt telefon.',
          },
          {
            t: 'p',
            text: 'Izvođačima radova i za veće projekte namijenjena je stranica „Upit za izvođače i projekte“.',
          },
        ],
      },
      {
        id: 'pravni-tekstovi',
        title: 'Pravni tekstovi i pomoć',
        blocks: [
          {
            t: 'ul',
            items: [
              '„Uslovi kupovine“: kako se naručuje, cijene, plaćanje i mjerodavno pravo;',
              '„Politika privatnosti“: koje podatke obrađujemo i zašto;',
              '„Odustanak od ugovora“, „Povrat robe“ i „Povrat novca“: vaša prava kao potrošača;',
              '„Garancija i reklamacije“: šta učiniti kada roba ima nedostatak.',
            ],
          },
        ],
      },
      {
        id: 'zastita-potrosaca',
        title: 'Zaštita potrošača',
        blocks: [
          {
            t: 'p',
            text: 'Ako imate primjedbu na robu ili uslugu, prvo se obratite prodavcu. Postupak reklamacije opisan je na stranici „Garancija i reklamacije“.',
          },
          {
            t: 'p',
            text: 'Ako se problem ne riješi sporazumno, potrošač se može obratiti nadležnom organu za zaštitu potrošača ili tržišnoj inspekciji, odnosno zatražiti vansudsko rješavanje spora, u skladu sa zakonom. Prava potrošača koja proizlaze iz propisa nisu ograničena ničim što je navedeno na ovom sajtu.',
          },
        ],
      },
      {
        id: 'sadrzaj-sajta',
        title: 'Sadržaj sajta',
        blocks: [
          {
            t: 'p',
            text: 'Trudimo se da opisi, cijene i dostupnost artikala budu tačni i ažurni, ali greške su moguće. Mjerodavna je potvrda narudžbe. Ako uočite grešku u opisu, cijeni ili dostupnosti, javite nam da je ispravimo.',
          },
          {
            t: 'p',
            text: 'Tekstovi, fotografije, grafike i dizajn sajta zaštićeni su autorskim pravima (v. „Uslovi kupovine“). Nazivi i oznake proizvođača pripadaju njihovim vlasnicima. Primjedbe na sadržaj možete poslati na {email}.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── 12. UZORCI MATERIJALA ─────────────────────────────
  {
    slug: 'uzorci-materijala',
    title: 'Uzorci materijala',
    group: 'usluge',
    kicker: 'Uzorci',
    lead: 'Uzorke materijala možete zatražiti bez obaveze kupovine. Jednim zahtjevom moguće je tražiti najviše pet artikala.',
    updated: UPDATED,
    sections: [
      {
        id: 'kako-zatraziti',
        title: 'Kako zatražiti uzorke',
        blocks: [
          {
            t: 'ol',
            items: [
              'Odaberite do pet artikala za koje želite uzorak.',
              'Ispunite zahtjev: ime, kontakt, adresu za slanje i, po želji, napomenu o namjeni.',
              'Pošaljite zahtjev. Odgovaramo e-poštom ili telefonom.',
            ],
          },
          {
            t: 'p',
            text: 'Zahtjev možete poslati i e-poštom na {email} ili se javiti telefonom na {telefon}.',
          },
          {
            t: 'p',
            text: 'U zahtjevu navedite naziv artikla i, ako postoji izbor, željenu varijantu (na primjer boju, debljinu ili dimenziju). Ako vam treba više od pet uzoraka, javite nam se pa ćemo zahtjev razmotriti pojedinačno.',
          },
        ],
      },
      {
        id: 'sta-je-moguce',
        title: 'Šta je moguće',
        blocks: [
          {
            t: 'p',
            text: 'Priroda građevinskog materijala ograničava šta se može poslati kao uzorak. Gdje proizvođač isporučuje male komade, isječke ili demonstracione uzorke, takve uzorke možemo obezbijediti.',
          },
          {
            t: 'p',
            text: 'Za teške, obimne ili teško izvodljive uzorke (na primjer ploče, građu ili kamenu vunu) uzorak možda nije moguć. Tada vam nudimo alternativu, na primjer opis materijala i savjet našeg stručnog tima.',
          },
        ],
      },
      {
        id: 'cijena-i-uslovi',
        title: 'Cijena i uslovi',
        blocks: [
          {
            t: 'p',
            text: 'Uslovi (besplatno ili uz naknadu) potvrđuju se pri odgovoru na zahtjev. Naknadu ne naplaćujemo bez vaše saglasnosti.',
          },
          {
            t: 'p',
            text: 'Raspoloživost uzoraka zavisi od zaliha i mogućnosti proizvođača. Slanje uzoraka ne obavezuje vas na kupovinu.',
          },
        ],
      },
      {
        id: 'isporuka-uzoraka',
        title: 'Isporuka uzoraka',
        blocks: [
          {
            t: 'p',
            text: 'Uzorke šaljemo na adresu koju navedete ili ih, po dogovoru, možete preuzeti lično. Način i rok slanja navodimo u odgovoru na zahtjev; rokovi isporuke za redovne narudžbe ne odnose se na uzorke. Uzorke ne morate vraćati. Ako uzorak stigne oštećen, javite nam se pa ćemo, ako je moguće, poslati novi.',
          },
        ],
      },
      {
        id: 'namjena-uzoraka',
        title: 'Namjena uzoraka',
        blocks: [
          {
            t: 'p',
            text: 'Uzorci služe isključivo za procjenu izgleda, boje, teksture ili sastava materijala. Izgled uzorka može se razlikovati od isporučene serije, pa uzorak ne predstavlja ponudu niti obavezu isporuke robe istih svojstava. Za konačan izbor materijala obratite se našem stručnom timu.',
          },
        ],
      },
      {
        id: 'vasi-podaci',
        title: 'Vaši podaci',
        blocks: [
          {
            t: 'p',
            text: 'Podatke iz zahtjeva koristimo samo za obradu tog zahtjeva, odnosno za slanje uzoraka i odgovor. Za slanje newslettera koristimo ih samo uz vašu posebnu saglasnost. Više na stranici „Politika privatnosti“.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── 13. UPIT ZA IZVOĐAČE ─────────────────────────────
  {
    slug: 'upit-za-izvodjace',
    title: 'Upit za izvođače i projekte',
    group: 'usluge',
    kicker: 'Izvođačima',
    lead: 'Za izvođače radova i veće projekte pripremamo individualnu ponudu, a stručan tim pomaže pri izboru materijala. Pošaljite upit s količinama i rokom, a mi odgovaramo ponudom.',
    updated: UPDATED,
    sections: [
      {
        id: 'sta-poslati',
        title: 'Šta poslati u upitu',
        blocks: [
          {
            t: 'ul',
            items: [
              'naziv firme ili ime i prezime;',
              'kontakt osobu, telefon i e-poštu;',
              'lokaciju gradilišta (adresu i opis pristupa);',
              'popis materijala s količinama ili predmjer radova;',
              'željeni rok isporuke ili početka radova;',
              'napomene: tehničke zahtjeve i projektnu dokumentaciju, ako je imate.',
            ],
          },
          {
            t: 'p',
            text: 'Što je upit potpuniji, to je odgovor brži i tačniji. Upit možete poslati putem obrasca na sajtu, e-poštom ({email}) ili telefonom ({telefon}).',
          },
        ],
      },
      {
        id: 'sta-nudimo',
        title: 'Šta nudimo',
        blocks: [
          {
            t: 'p',
            text: 'Uslovi se određuju pojedinačno, zavisno od vrste i obima posla. Moguće je dogovoriti:',
          },
          {
            t: 'ul',
            items: [
              'individualnu ponudu prema predmjeru;',
              'količinske uslove;',
              'dogovor o isporuci na gradilište (termine, isporuku po fazama, način istovara);',
              'uslove plaćanja po posebnom dogovoru.',
            ],
          },
          {
            t: 'p',
            text: 'Ovo su mogućnosti koje se potvrđuju u pisanoj ponudi. Nisu unaprijed utvrđene i ne važe automatski.',
          },
        ],
      },
      {
        id: 'kako-tece-saradnja',
        title: 'Kako teče saradnja',
        blocks: [
          {
            t: 'ol',
            items: [
              '*Upit.* Šaljete podatke o poslu, količinama i roku.',
              '*Ponuda.* Pripremamo pisanu ponudu s cijenama i uslovima isporuke.',
              '*Potvrda.* Prihvatate ponudu, a mi je potvrđujemo. Ugovor je zaključen kada se obje strane saglase o ponudi.',
              '*Isporuka.* Robu isporučujemo u dogovorenim terminima, na gradilište ili za lično preuzimanje.',
            ],
          },
        ],
      },
      {
        id: 'strucni-savjet',
        title: 'Stručni savjet',
        blocks: [
          {
            t: 'p',
            text: 'Stručan tim pomaže pri izboru materijala, na primjer sistema suhe gradnje, izolacije od kamene vune, drveta ili sanitarne opreme. Ako niste sigurni šta odgovara vašem poslu, opišite zadatak i pomoći ćemo.',
          },
          {
            t: 'p',
            text: 'Savjet je informativan. Projektno rješenje i odgovornost za projekat ostaju na projektantu i izvođaču radova.',
          },
        ],
      },
      {
        id: 'placanje-i-dokumenti',
        title: 'Plaćanje i dokumenti',
        blocks: [
          {
            t: 'p',
            text: 'Uslovi plaćanja za izvođače radova i veće projekte dogovaraju se pojedinačno i važe samo ako su navedeni u pisanoj ponudi ili ugovoru. Uobičajeni načini plaćanja opisani su na stranici „Načini plaćanja“.',
          },
          {
            t: 'p',
            text: 'Račun se izdaje na firmu. U upitu navedite podatke za fakturisanje: naziv, adresu, JIB i PDV broj.',
          },
        ],
      },
      {
        id: 'kontakt',
        title: 'Kontakt',
        blocks: [
          {
            t: 'dl',
            items: [
              { k: 'E-pošta', v: '{email}' },
              { k: 'Telefon', v: '{telefon}' },
              { k: 'Adresa', v: '{sjediste}' },
            ],
          },
          {
            t: 'p',
            text: 'Podatke iz upita koristimo samo za pripremu ponude i saradnju. Više na stranici „Politika privatnosti“.',
          },
        ],
      },
    ],
  },
]

export const legalBySlug = (slug: string) => LEGAL_DOCS.find((d) => d.slug === slug)
