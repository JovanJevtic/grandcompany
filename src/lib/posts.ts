import type { PostArtKind } from '@/components/art/PostArt'
import { calcW111 } from './shop'

export type PostTag = 'Vodič' | 'Sistemi' | 'Isporuka' | 'Materijal'
export type Block =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'list'; items: string[] }
  | { t: 'spec'; rows: [string, string][] }
  | { t: 'note'; text: string }
export type Post = {
  slug: string
  title: string
  lead: string
  tag: PostTag
  date: string
  read: number
  art: PostArtKind
  body: Block[]
  skus?: string[]
}

export const POST_TAGS: PostTag[] = ['Vodič', 'Sistemi', 'Isporuka', 'Materijal']
export const postDate = (iso: string) => `${iso.split('-').reverse().join('.')}.`

const w111 = calcW111({
  L: 4,
  H: 2.5,
  cladding: 'single',
  plateSku: 'KNF-001',
  cwSku: 'PRF-075',
  woolSku: 'ISO-001',
  fillerSku: 'CHM-001',
  soundTape: true,
})

export const POSTS: Post[] = [
  {
    slug: 'pregradni-zid-w111-korak-po-korak',
    title: 'Pregradni zid W111, korak po korak',
    lead: 'Redoslijed montaže standardnog zida sa jednom pločom sa svake strane.',
    tag: 'Sistemi',
    date: '2026-09-18',
    read: 7,
    art: 'wall-section',
    skus: ['KNF-001', 'PRF-075', 'PRF-UW75', 'ISO-001', 'ACC-001', 'ACC-003'],
    body: [
      { t: 'h', text: 'Prije montaže' },
      {
        t: 'p',
        text: 'Prenesite osu zida na pod, zidove i plafon. Provjerite instalacije i završnu visinu poda prije rezanja profila.',
      },
      { t: 'h', text: 'Potkonstrukcija' },
      {
        t: 'list',
        items: [
          'Na UW profil postavite zvučno-izolacionu traku.',
          'UW pričvrstite za pod i plafon, a CW profile postavite na osni razmak 62,5 cm.',
          'Otvor CW profila usmjerite na istu stranu; spoj ploča mora pasti na profil.',
        ],
      },
      { t: 'h', text: 'Obloga i ispuna' },
      {
        t: 'p',
        text: 'Prvu stranu obložite GKB pločama, provedite instalacije, zatim potpuno ispunite šupljinu kamenom vunom. '
          + 'Spojeve druge strane pomjerite u odnosu na prvu.',
      },
      {
        t: 'note',
        text: 'Ploče ne oslanjajte direktno na pod. Ostavite mali razmak i zatvorite ga prema zahtjevu sistema.',
      },
      {
        t: 'spec',
        rows: [
          ['Sistem', 'W111'],
          ['Profil', 'CW 75 + UW 75'],
          ['Gotova debljina', '100 mm'],
          ['Deklarisana zvučna izolacija sistema', 'Rw 47 dB'],
        ],
      },
    ],
  },
  {
    slug: 'gkb-gkbi-gkf-ili-diamant',
    title: 'GKB, GKBI, GKF ili Diamant — koju ploču gdje',
    lead: 'Četiri ploče izgledaju slično, ali nisu zamjenjive u svakoj prostoriji.',
    tag: 'Materijal',
    date: '2026-08-26',
    read: 5,
    art: 'pallet',
    skus: ['KNF-001', 'KNF-002', 'KNF-003', 'KNF-004'],
    body: [
      { t: 'h', text: 'Birajte prema zahtjevu' },
      {
        t: 'p',
        text: 'GKB je standard za suhe prostorije. GKBI je impregnirana ploča za kupatila, kuhinje i vešernice. '
          + 'GKF se koristi kada sistem mora imati definisanu otpornost na požar, a Diamant kada su uz to važni udar, nosivost i zvuk.',
      },
      {
        t: 'spec',
        rows: [
          ['GKB', 'Standardni zidovi i plafoni'],
          ['GKBI', 'Prostorije sa povremenom vlagom'],
          ['GKF', 'Protivpožarne obloge'],
          ['Diamant DFH2IR', 'Čvrstoća, zvuk, vlaga i požar'],
        ],
      },
      {
        t: 'note',
        text: 'Sama ploča ne određuje klasu zida. Rezultat zavisi od kompletnog, ispitanog sistema i tačne montaže.',
      },
    ],
  },
  {
    slug: 'kamena-ili-staklena-vuna',
    title: 'Kamena ili staklena vuna',
    lead: 'Gustoća, format i mjesto ugradnje određuju praktičan izbor.',
    tag: 'Materijal',
    date: '2026-07-21',
    read: 5,
    art: 'attic',
    skus: ['ISO-001', 'ISO-002', 'ISO-003'],
    body: [
      { t: 'h', text: 'Za pregradni zid' },
      {
        t: 'p',
        text: 'Polutvrda kamena vuna u pločama jednostavno se uklapa između CW profila i dobro prigušuje zvuk. '
          + 'Režite je malo šire od polja da ostane bez zazora.',
      },
      { t: 'h', text: 'Za kosi krov' },
      {
        t: 'p',
        text: 'Staklena vuna u rolni je lagana i pogodna za duga polja između rogova. '
          + 'Dva sloja sa pomjerenim spojevima smanjuju toplotne mostove.',
      },
      {
        t: 'list',
        items: [
          'Ne sabijajte vunu: sabijanjem gubi projektovanu debljinu.',
          'Popunite cijelo polje bez pukotina.',
          'Zaštitite materijal od kiše i trajne vlage.',
        ],
      },
    ],
  },
  {
    slug: 'demit-fasada-redoslijed-slojeva',
    title: 'Demit fasada: redoslijed slojeva',
    lead: 'Od pripreme podloge do armiranog sloja — gdje nastaju najčešće greške.',
    tag: 'Vodič',
    date: '2026-06-30',
    read: 6,
    art: 'facade-layers',
    skus: ['ISO-004', 'ISO-006', 'CHM-003', 'CHM-004'],
    body: [
      { t: 'h', text: 'Podloga i lijepljenje' },
      {
        t: 'p',
        text: 'Podloga mora biti nosiva, čista i ravna. EPS ploče lijepite vezano, '
          + 'bez poklapanja vertikalnih spojeva i bez ljepila u spojevima.',
      },
      { t: 'h', text: 'Armirani sloj' },
      {
        t: 'list',
        items: [
          'Nakon vezivanja ljepila slijedi mehaničko pričvršćenje prema projektu.',
          'Mrežica se utapa u svježu masu, sa preklopom na spojevima.',
          'Uglove otvora dodatno armirajte dijagonalnim trakama.',
        ],
      },
      {
        t: 'note',
        text: 'CT 83 je ljepilo za lijepljenje EPS-a. CT 85 je ljepilo i masa za armiranje; koristite proizvod prema sloju sistema.',
      },
    ],
  },
  {
    slug: 'obracun-materijala-za-10-m2-zida',
    title: 'Kako se obračunava materijal za 10 m² zida',
    lead: 'Primjer W111 zida dimenzija 4 × 2,5 m, sa uračunatim otpadom.',
    tag: 'Vodič',
    date: '2026-05-19',
    read: 6,
    art: 'calculator',
    skus: w111.items.map((item) => item.sku),
    body: [
      { t: 'h', text: 'Ulazne mjere' },
      {
        t: 'p',
        text: 'Površina je dužina puta visina: 4 × 2,5 m = 10 m². '
          + 'Otvore treba obračunati prema stvarnom načinu oblaganja i ojačanjima oko njih.',
      },
      { t: 'h', text: 'Orijentaciona lista' },
      { t: 'spec', rows: w111.items.map((item) => [item.sku, `${item.need} — ${item.note}`]) },
      {
        t: 'note',
        text: 'Ovo je norma za zadati primjer, ne statički ni protivpožarni proračun. '
          + 'Konačnu količinu provjerite prema nacrtu i izabranom sistemu.',
      },
    ],
  },
  {
    slug: 'istovar-kranom-priprema-gradilista',
    title: 'Istovar kranom: šta pripremiti na gradilištu',
    lead: 'Pet provjera prije dolaska kamiona štedi vrijeme i čuva materijal.',
    tag: 'Isporuka',
    date: '2026-04-15',
    read: 4,
    art: 'crane',
    body: [
      { t: 'h', text: 'Pristup i pozicija' },
      {
        t: 'list',
        items: [
          'Potvrdite širinu prilaza i nosivost podloge.',
          'Oslobodite mjesto za stabilizatore i radnu zonu krana.',
          'Provjerite kablove, grane, balkone i druge prepreke iznad vozila.',
          'Odredite ravnu, suhu podlogu za palete.',
          'Imenujte osobu koja preuzima robu i provjerava otpremnicu.',
        ],
      },
      {
        t: 'note',
        text: 'Kran spušta paletu na dogovoreno dostupno mjesto. Unutrašnji prenos i zaštitu materijala od vremena organizuje gradilište.',
      },
    ],
  },
  {
    slug: 'spusteni-plafon-na-cd-profilima',
    title: 'Spušteni plafon na CD profilima',
    lead: 'Osnovni redoslijed za D112 potkonstrukciju i ravnu oblogu.',
    tag: 'Sistemi',
    date: '2026-03-11',
    read: 6,
    art: 'ceiling-grid',
    skus: ['KNF-001', 'PRF-CD60', 'PRF-UD28', 'ACC-001', 'ACC-006'],
    body: [
      { t: 'h', text: 'Nivelacija' },
      {
        t: 'p',
        text: 'Laserom označite donju ravan plafona. UD profil postavite po obodu, uz odgovarajuću razdvojnu traku.',
      },
      { t: 'h', text: 'Rešetka i ovjesi' },
      {
        t: 'p',
        text: 'Direktne ovjese i CD profile rasporedite prema tehničkom listu sistema i masi obloge. '
          + 'Spojevi ploča moraju imati oslonac, a instalacije ne smiju opterećivati oblogu.',
      },
      {
        t: 'note',
        text: 'Rasponi i razmaci zavise od klase sistema, broja slojeva i dodatnog opterećenja. '
          + 'Prije montaže provjerite projekt i tehnički list.',
      },
    ],
  },
  {
    slug: 'podovi-eps-100-ili-xps',
    title: 'Podovi: EPS 100 ili XPS',
    lead: 'Pritisna čvrstoća i vlaga su važnije od boje izolacione ploče.',
    tag: 'Materijal',
    date: '2026-02-17',
    read: 4,
    art: 'floor-layers',
    skus: ['ISO-005', 'ISO-007'],
    body: [
      { t: 'h', text: 'EPS 100 ispod estriha' },
      {
        t: 'p',
        text: 'EPS 100 je namijenjen izolaciji uobičajenih podova ispod estriha. Ploče polažite ravno, tijesno i sa pomjerenim spojevima.',
      },
      { t: 'h', text: 'XPS u zahtjevnijim zonama' },
      {
        t: 'p',
        text: 'XPS birajte gdje se očekuju vlaga, kontakt sa tlom ili veće lokalno opterećenje, uz provjeru projektovane klase proizvoda.',
      },
      {
        t: 'spec',
        rows: [
          ['EPS 100', 'Standardni pod ispod estriha'],
          ['XPS', 'Cokla, temelj i vlažnije zone'],
          ['Preklopni rub', 'Smanjuje otvorene spojeve'],
        ],
      },
    ],
  },
]

/** Fotografija vodiča (krupni plan materijala ili rada, generisano za ovaj sajt), u /public/editorial/posts. */
export const postPhoto = (slug: string) => `/editorial/posts/${slug}.webp`

export const postBySlug = (slug: string) => POSTS.find((post) => post.slug === slug)
