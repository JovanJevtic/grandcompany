// =====================================================================
// GRAND COMPANY d.o.o. Banja Luka — data layer
// ---------------------------------------------------------------------
// In production this data comes from the Datalab PANTHEON ERP via API.
// The demo keeps it static so the UI can later be wired to a real
// backend without touching page code.
// =====================================================================

const COMPANY = {
  name: 'Grand Company d.o.o. Banja Luka',
  address: 'Ul. Nenada Kostića 151, 78000 Banja Luka',
  phoneLandline: '051 388-995',
  phoneLandlineHref: 'tel:+38751388995',
  phoneMobile: '065 516-696',
  phoneMobileHref: 'tel:+38765516696',
  emailInfo: 'info@grandcompany.com',
  emailSales: 'prodaja@grandcompany.com',
  jib: '4403433180005',
  mbs: '57-01-0089-12',
  pib: '403433180005',
  founder: 'Predrag Uzelac',
  founded: 2012,
};

const VAT_RATE = 0.17; // BiH PDV — catalogue prices already include it

const CATEGORIES = [
  {
    id: 'suha-gradnja',
    label: 'Suha gradnja',
    lead: 'Gips-kartonske ploče i pocinčani profili',
    image: 'img/interior.jpg',
    gallery: ['img/interior.jpg', 'img/hall.jpg'],
    color: '#4F6D8F',
    usage:
      'Knauf sistemi suhe gradnje za pregradne zidove, obloge i spuštene plafone. Ploče se razlikuju po boji kartona: bijela je standardna, zelena vlagootporna, crvena vatrootporna, a plava ojačana Diamant ploča. Profili se biraju prema debljini zida i sistemu.',
  },
  {
    id: 'izolacija',
    label: 'Izolacija i fasade',
    lead: 'Kamena i staklena vuna, stiropor i stirodur',
    image: 'img/facade.jpg',
    gallery: ['img/facade.jpg', 'img/office.jpg'],
    color: '#C08A2E',
    usage:
      'Toplotna i zvučna izolacija za pregradne zidove, potkrovlja, podove i kontaktne fasade. Kamena vuna je negoriva i dobro prigušuje zvuk, staklena vuna u rolni je lakša za kose krovove, a grafitni stiropor daje istu izolaciju sa tanjom pločom.',
  },
  {
    id: 'veziva',
    label: 'Veziva i ljepila',
    lead: 'Mase za spojeve, ljepila, glet i cement',
    image: 'img/concrete-curves.jpg',
    gallery: ['img/concrete-curves.jpg', 'img/site-aerial.jpg'],
    color: '#5E7F5B',
    usage:
      'Gipsane mase za fugovanje, ljepila za fasadne sisteme i keramiku, glet mase i cement. Vreće čuvajte na paleti, na suhom i zaštićene od vlage, i koristite ih unutar roka trajanja otisnutog na pakovanju.',
  },
  {
    id: 'oprema',
    label: 'Vijci i oprema',
    lead: 'Samourezni vijci, trake i ovjesi',
    image: 'img/steel-frame.jpg',
    gallery: ['img/steel-frame.jpg', 'img/cranes.jpg'],
    color: '#B5472F',
    usage:
      'Pribor za montažu sistema suhe gradnje: vijci za jednostruku i dvostruku oblogu, trake za ojačanje spojeva, akustične trake ispod vodećih profila i direktni ovjesi za plafone.',
  },
];

// weight = approx. kg per sales unit (drives crane-transport logistics)
// stock  = simulated real-time PANTHEON warehouse quantity
// pack   = physical package a customer picks up (used for default quantity)
// art    = recipe for the product illustration drawn by js/art.js
const PRODUCTS = [
  // ------------------- SUHA GRADNJA -------------------
  { sku: 'KNF-001', name: 'Knauf gips-kartonska ploča GKB 12,5 mm', brand: 'Knauf', spec: '2000 × 1250 × 12,5 mm, ploča 2,5 m²', desc: 'Standardna ploča za zidove i plafone u suhim prostorijama.', price: 5.20, unit: 'm²', category: 'suha-gradnja', stock: 4850, weight: 10.0, featured: true, pack: { size: 2.5, name: 'ploča' }, art: { kind: 'board', face: '#EDE7DA', label: 'GKB 12,5' } },
  { sku: 'KNF-002', name: 'Knauf impregnirana ploča GKBI 12,5 mm', brand: 'Knauf', spec: '2000 × 1250 × 12,5 mm, ploča 2,5 m²', desc: 'Vlagootporna zelena ploča za kupatila, kuhinje i vešernice.', price: 7.40, unit: 'm²', category: 'suha-gradnja', stock: 2600, weight: 10.0, featured: true, pack: { size: 2.5, name: 'ploča' }, art: { kind: 'board', face: '#8DB596', label: 'GKBI 12,5' } },
  { sku: 'KNF-003', name: 'Knauf vatrootporna ploča GKF 12,5 mm', brand: 'Knauf', spec: '2000 × 1250 × 12,5 mm, ploča 2,5 m²', desc: 'Crvena ploča za protivpožarne obloge, klasa reakcije na požar A2-s1,d0.', price: 8.80, unit: 'm²', category: 'suha-gradnja', stock: 1450, weight: 10.5, pack: { size: 2.5, name: 'ploča' }, art: { kind: 'board', face: '#D9867A', label: 'GKF 12,5' } },
  { sku: 'KNF-004', name: 'Knauf Diamant tvrda ploča DFH2IR 12,5 mm', brand: 'Knauf', spec: '2000 × 1250 × 12,5 mm, ploča 2,5 m²', desc: 'Ekstra čvrsta ploča sa boljom zvučnom izolacijom i otpornošću na vatru i udarce.', price: 14.50, unit: 'm²', category: 'suha-gradnja', stock: 780, weight: 12.5, pack: { size: 2.5, name: 'ploča' }, art: { kind: 'board', face: '#7F9DC2', label: 'DFH2IR 12,5' } },
  { sku: 'PRF-050', name: 'Pocinčani zidni profil CW 50', brand: 'Ostali proizvođači', spec: '3000 × 50 × 50 mm, lim 0,6 mm', desc: 'Vertikalni profil za pregradne zidove debljine 7,5 cm.', price: 3.60, unit: 'kom', category: 'suha-gradnja', stock: 3200, weight: 1.7, art: { kind: 'profile', web: 34, flange: 32, lips: true, label: 'CW 50' } },
  { sku: 'PRF-075', name: 'Pocinčani zidni profil CW 75', brand: 'Ostali proizvođači', spec: '3000 × 75 × 50 mm, lim 0,6 mm', desc: 'Vertikalni profil za pregradne zidove debljine 10 cm.', price: 4.10, unit: 'kom', category: 'suha-gradnja', stock: 2800, weight: 2.1, featured: true, art: { kind: 'profile', web: 46, flange: 32, lips: true, label: 'CW 75' } },
  { sku: 'PRF-100', name: 'Pocinčani zidni profil CW 100', brand: 'Ostali proizvođači', spec: '3000 × 100 × 50 mm, lim 0,6 mm', desc: 'Vertikalni profil za deblje pregradne zidove i veće visine.', price: 4.80, unit: 'kom', category: 'suha-gradnja', stock: 1900, weight: 2.6, art: { kind: 'profile', web: 58, flange: 32, lips: true, label: 'CW 100' } },
  { sku: 'PRF-UW75', name: 'Pocinčani vodeći profil UW 75', brand: 'Ostali proizvođači', spec: '4000 × 75 × 40 mm, lim 0,6 mm', desc: 'Horizontalni vodeći profil koji se pričvršćuje za pod i plafon.', price: 3.80, unit: 'kom', category: 'suha-gradnja', stock: 2400, weight: 2.3, art: { kind: 'profile', web: 46, flange: 26, lips: false, label: 'UW 75' } },
  { sku: 'PRF-CD60', name: 'Pocinčani plafonski profil CD 60/27', brand: 'Ostali proizvođači', spec: '4000 × 60 × 27 mm, lim 0,6 mm', desc: 'Noseći i montažni profil za spuštene plafone.', price: 3.20, unit: 'kom', category: 'suha-gradnja', stock: 5100, weight: 2.4, art: { kind: 'profile', web: 40, flange: 18, lips: true, label: 'CD 60/27' } },
  { sku: 'PRF-UD28', name: 'Pocinčani obodni profil UD 28/27', brand: 'Ostali proizvođači', spec: '3000 × 28 × 27 mm, lim 0,6 mm', desc: 'Obodni profil koji se montira uz zid kod spuštenih plafona.', price: 2.10, unit: 'kom', category: 'suha-gradnja', stock: 3600, weight: 0.9, art: { kind: 'profile', web: 22, flange: 18, lips: false, label: 'UD 28' } },

  // ------------------- IZOLACIJA I FASADE -------------------
  { sku: 'ISO-001', name: 'Kamena vuna Knauf Insulation NaturBoard 50 mm', brand: 'Knauf Insulation', spec: 'Debljina 50 mm, ploča 1000 × 600 mm', desc: 'Za pregradne zidove: toplotna i zvučna izolacija, negoriva.', price: 6.90, unit: 'm²', category: 'izolacija', stock: 1820, weight: 2.5, featured: true, pack: { size: 0.6, name: 'ploča' }, art: { kind: 'slab', material: 'stonewool', thick: 22, count: 4, label: 'NaturBoard 50' } },
  { sku: 'ISO-002', name: 'Kamena vuna Knauf Insulation NaturBoard 100 mm', brand: 'Knauf Insulation', spec: 'Debljina 100 mm, ploča 1000 × 600 mm', desc: 'Za zidove visoke izolacije i potkrovlja.', price: 12.80, unit: 'm²', category: 'izolacija', stock: 960, weight: 5.0, pack: { size: 0.6, name: 'ploča' }, art: { kind: 'slab', material: 'stonewool', thick: 32, count: 3, label: 'NaturBoard 100' } },
  { sku: 'ISO-003', name: 'Staklena mineralna vuna Unifit 035 u rolni', brand: 'Knauf Insulation', spec: 'Debljina 100 mm, rolna oko 6 m², λ = 0,035 W/mK', desc: 'Lagana vuna u rolni za kose krovove i potkrovlja.', price: 5.50, unit: 'm²', category: 'izolacija', stock: 2400, weight: 1.5, pack: { size: 6, name: 'rolna' }, art: { kind: 'roll', label: 'Unifit 035' } },
  { sku: 'ISO-004', name: 'Fasadni stiropor EPS 70, bijeli', brand: 'Ostali proizvođači', spec: 'Debljina 80 mm, ploča 1000 × 500 mm', desc: 'Za standardne kontaktne fasade (demit).', price: 8.20, unit: 'm²', category: 'izolacija', stock: 3100, weight: 1.2, pack: { size: 0.5, name: 'ploča' }, art: { kind: 'slab', material: 'eps', thick: 30, count: 3, label: 'EPS 70' } },
  { sku: 'ISO-005', name: 'Podni stiropor EPS 100', brand: 'Ostali proizvođači', spec: 'Debljina 50 mm, ploča 1000 × 500 mm', desc: 'Za izolaciju podova ispod estriha.', price: 6.10, unit: 'm²', category: 'izolacija', stock: 2700, weight: 1.0, pack: { size: 0.5, name: 'ploča' }, art: { kind: 'slab', material: 'eps', thick: 20, count: 4, label: 'EPS 100' } },
  { sku: 'ISO-006', name: 'Grafitni stiropor EPS Neopor, sivi', brand: 'Ostali proizvođači', spec: 'Debljina 100 mm, λ = 0,031 W/mK', desc: 'Nisko-energetska fasadna izolacija sa tanjom pločom.', price: 14.20, unit: 'm²', category: 'izolacija', stock: 1150, weight: 1.6, featured: true, art: { kind: 'slab', material: 'graphite', thick: 32, count: 3, label: 'Neopor 100' } },
  { sku: 'ISO-007', name: 'Stirodur XPS, ekstrudirani polistiren', brand: 'Ostali proizvođači', spec: 'Debljina 30 mm, preklopni rub', desc: 'Za temelje, cokle i zone ispod nivoa tla.', price: 7.90, unit: 'm²', category: 'izolacija', stock: 890, weight: 1.0, art: { kind: 'slab', material: 'xps', thick: 17, count: 5, label: 'XPS 30' } },

  // ------------------- VEZIVA I LJEPILA -------------------
  { sku: 'CHM-001', name: 'Knauf Uniflott masa za spojeve', brand: 'Knauf', spec: 'Vreća 5 kg', desc: 'Masa visoke čvrstoće za ispunu spojeva gips-kartonskih ploča bez trake.', price: 14.50, unit: 'kom', category: 'veziva', stock: 640, weight: 5, featured: true, art: { kind: 'bag', body: '#F4F1EA', band: '#2F5FA7', label: 'Uniflott', weight: '5 kg', small: true } },
  { sku: 'CHM-002', name: 'Knauf Fugenfüller Leicht', brand: 'Knauf', spec: 'Vreća 25 kg', desc: 'Standardna gipsana masa za fugovanje sa trakom.', price: 28.00, unit: 'kom', category: 'veziva', stock: 380, weight: 25, art: { kind: 'bag', body: '#F4F1EA', band: '#2F5FA7', label: 'Fugenfüller', weight: '25 kg' } },
  { sku: 'CHM-003', name: 'Ceresit CT 83 ljepilo za stiropor', brand: 'Ceresit', spec: 'Vreća 25 kg', desc: 'Ljepilo za lijepljenje polistirenskih ploča na fasadu.', price: 11.50, unit: 'kom', category: 'veziva', stock: 520, weight: 25, art: { kind: 'bag', body: '#F4F1EA', band: '#C0392B', label: 'CT 83', weight: '25 kg' } },
  { sku: 'CHM-004', name: 'Ceresit CT 85 ljepilo i masa za armiranje', brand: 'Ceresit', spec: 'Vreća 25 kg', desc: 'Za lijepljenje ploča i armiranje fasadne mrežice, sa vlaknima.', price: 16.20, unit: 'kom', category: 'veziva', stock: 470, weight: 25, featured: true, art: { kind: 'bag', body: '#F4F1EA', band: '#C0392B', label: 'CT 85', weight: '25 kg' } },
  { sku: 'CHM-005', name: 'Ceresit CM 16 fleksibilno ljepilo za keramiku', brand: 'Ceresit', spec: 'Vreća 25 kg', desc: 'Za unutrašnju i vanjsku keramiku i gres pločice.', price: 22.50, unit: 'kom', category: 'veziva', stock: 350, weight: 25, art: { kind: 'bag', body: '#F4F1EA', band: '#C0392B', label: 'CM 16', weight: '25 kg' } },
  { sku: 'CHM-006', name: 'Cement Lukavac CEM II 42,5N', brand: 'Cement Lukavac', spec: 'Vreća 50 kg', desc: 'Za klasičnu gradnju, betoniranje i malterisanje.', price: 13.80, unit: 'kom', category: 'veziva', stock: 1200, weight: 50, art: { kind: 'bag', body: '#BDB7AA', band: '#D9A62E', bandText: '#221C14', label: 'CEM II 42,5N', weight: '50 kg' } },
  { sku: 'CHM-007', name: 'Ceresit IN 52 glet masa', brand: 'Ceresit', spec: 'Vreća 20 kg', desc: 'Fina unutrašnja glet masa za zidove i plafone.', price: 18.00, unit: 'kom', category: 'veziva', stock: 290, weight: 20, art: { kind: 'bag', body: '#F4F1EA', band: '#C0392B', label: 'IN 52', weight: '20 kg' } },

  // ------------------- VIJCI I OPREMA -------------------
  { sku: 'ACC-001', name: 'Knauf TN samourezni vijci 3,5 × 25 mm', brand: 'Knauf', spec: 'Kutija 1000 komada', desc: 'Za montažu jednog sloja gips ploča na metalne profile.', price: 12.50, unit: 'kut', category: 'oprema', stock: 850, weight: 3.5, featured: true, art: { kind: 'box', label: 'TN 3,5 × 25', sub: '1000 kom' } },
  { sku: 'ACC-002', name: 'Knauf TN samourezni vijci 3,5 × 35 mm', brand: 'Knauf', spec: 'Kutija 1000 komada', desc: 'Za montažu dvostruke obloge gips ploča.', price: 15.80, unit: 'kut', category: 'oprema', stock: 610, weight: 4.5, art: { kind: 'box', label: 'TN 3,5 × 35', sub: '1000 kom' } },
  { sku: 'ACC-003', name: 'Staklena bandaž traka za spojeve', brand: 'Ostali proizvođači', spec: 'Rolna 25 m', desc: 'Samoljepljiva mrežica za ojačanje spojeva gips ploča.', price: 2.50, unit: 'kom', category: 'oprema', stock: 1400, weight: 0.2, art: { kind: 'tape', material: 'mesh', label: '25 m' } },
  { sku: 'ACC-004', name: 'Knauf Kurt papirna bandaž traka', brand: 'Knauf', spec: 'Rolna 75 m', desc: 'Izuzetno jaka papirna traka za uglove i spojeve.', price: 11.00, unit: 'kom', category: 'oprema', stock: 320, weight: 0.6, art: { kind: 'tape', material: 'paper', label: '75 m' } },
  { sku: 'ACC-005', name: 'Zvučno-izolaciona traka za UW i UD profile', brand: 'Ostali proizvođači', spec: 'Rolna 30 m × 75 mm', desc: 'Odvaja profile od poda i zidova i prigušuje prenos zvuka.', price: 9.50, unit: 'kom', category: 'oprema', stock: 540, weight: 0.5, art: { kind: 'tape', material: 'foam', label: '30 m' } },
  { sku: 'ACC-006', name: 'Direktni ovjes za CD profil 120 mm', brand: 'Ostali proizvođači', spec: 'Pakovanje 100 komada', desc: 'Za montažu plafonske konstrukcije od CD 60/27 profila.', price: 24.00, unit: 'pak', category: 'oprema', stock: 410, weight: 3.0, art: { kind: 'hanger', label: '120 mm' } },
];

// ---------------------------------------------------------------------
// Real product photography
// Map SKU -> path to a real packshot. Any SKU missing here keeps the SVG
// drawing as a fallback, so the catalogue works while photos are added.
// ---------------------------------------------------------------------
const PRODUCT_PHOTOS = {
  // Suha gradnja — ploče (drywall)
  'KNF-001': 'img/interior.jpg',
  'KNF-002': 'img/interior.jpg',
  'KNF-003': 'img/interior.jpg',
  'KNF-004': 'img/interior.jpg',
  // Suha gradnja — profili (steel framing)
  'PRF-050': 'img/steel-frame.jpg',
  'PRF-075': 'img/steel-frame.jpg',
  'PRF-100': 'img/steel-frame.jpg',
  'PRF-UW75': 'img/steel-frame.jpg',
  'PRF-CD60': 'img/steel-frame.jpg',
  'PRF-UD28': 'img/steel-frame.jpg',
  // Izolacija — vune i stiropor (facade insulation)
  'ISO-001': 'img/facade.jpg',
  'ISO-002': 'img/facade.jpg',
  'ISO-003': 'img/facade.jpg',
  'ISO-004': 'img/facade.jpg',
  'ISO-005': 'img/facade.jpg',
  'ISO-006': 'img/facade.jpg',
  'ISO-007': 'img/facade.jpg',
  // Veziva — mase, ljepila, cement (concrete)
  'CHM-001': 'img/concrete-curves.jpg',
  'CHM-002': 'img/concrete-curves.jpg',
  'CHM-003': 'img/concrete-curves.jpg',
  'CHM-004': 'img/concrete-curves.jpg',
  'CHM-005': 'img/concrete-curves.jpg',
  'CHM-006': 'img/concrete-curves.jpg',
  'CHM-007': 'img/concrete-curves.jpg',
  // Oprema — vijci, trake, ovjesi (steel detail)
  'ACC-001': 'img/steel-frame.jpg',
  'ACC-002': 'img/steel-frame.jpg',
  'ACC-003': 'img/interior.jpg',
  'ACC-004': 'img/interior.jpg',
  'ACC-005': 'img/interior.jpg',
  'ACC-006': 'img/steel-frame.jpg',
};

// ---------------------------------------------------------------------
// B2B demo partners — in production the login, invoices, order history
// and construction sites all come from PANTHEON customer records.
// Dates are stored as "days ago", so the demo never goes stale.
//
// DEMO ONLY: real passwords never live in frontend code. A production
// login posts to a backend that checks a hashed password and returns a
// session cookie.
// ---------------------------------------------------------------------
const PARTNERS = [
  {
    id: 'gipsmont',
    name: 'Zanatska radnja „GipsMont" Banja Luka',
    tier: 'Nivo 1, zanatlije i manji izvođači',
    discount: 0.10,
    creditLimit: 15000,
    paymentDays: 30,
    email: 'nabavka@gipsmont.demo',
    password: 'gipsmont2026',
    sites: [
      { id: 'gm-1', name: 'Stan, Borik', address: 'Ul. Slavka Rodića 12, Banja Luka', note: 'Treći sprat, lift za teret' },
    ],
    invoices: [
      { no: 'IF-26-00714', issuedDaysAgo: 72, amount: 3120.0, paid: true },
      { no: 'IF-26-00871', issuedDaysAgo: 41, amount: 2610.4, paid: false },
      { no: 'IF-26-00932', issuedDaysAgo: 18, amount: 1619.6, paid: false },
    ],
    orders: [
      { no: 'GC-2026-04418', daysAgo: 19, siteId: 'gm-1', status: 'Isporučena', payment: 'odgodjeno', delivery: 'kran', deliveryCost: 90, items: [['KNF-001', 150], ['PRF-075', 36], ['PRF-UW75', 12], ['CHM-001', 8], ['ACC-001', 3]] },
    ],
  },
  {
    id: 'gradnjamont',
    name: 'Gradnja-Mont d.o.o. Laktaši',
    tier: 'Nivo 2, srednje građevinske firme',
    discount: 0.15,
    creditLimit: 30000,
    paymentDays: 60,
    email: 'nabavka@gradnjamont.demo',
    password: 'gradnjamont2026',
    sites: [
      { id: 'gd-1', name: 'Stambeni objekat, Laktaši', address: 'Ul. Karađorđeva 45, Laktaši', note: 'Kran sa ulične strane' },
      { id: 'gd-2', name: 'Poslovni prostor, Gradiška', address: 'Vidovdanska 8, Gradiška', note: 'Prizemlje, istovar pored objekta' },
    ],
    invoices: [
      { no: 'IF-26-00655', issuedDaysAgo: 95, amount: 6400.0, paid: true },
      { no: 'IF-26-00802', issuedDaysAgo: 52, amount: 7240.5, paid: false },
      { no: 'IF-26-00901', issuedDaysAgo: 24, amount: 4109.5, paid: false },
    ],
    orders: [
      { no: 'GC-2026-04302', daysAgo: 26, siteId: 'gd-1', status: 'Isporučena', payment: 'odgodjeno', delivery: 'kran', deliveryCost: 130, items: [['KNF-002', 250], ['KNF-001', 400], ['PRF-100', 80], ['PRF-UW75', 30], ['ISO-002', 120], ['CHM-002', 12]] },
      { no: 'GC-2026-04477', daysAgo: 6, siteId: 'gd-2', status: 'U pripremi', payment: 'odgodjeno', delivery: 'standard', deliveryCost: 80, items: [['CHM-003', 40], ['CHM-004', 60], ['ISO-004', 180]] },
    ],
  },
  {
    id: 'lazarevo',
    name: 'Lazarevo Inženjering a.d.',
    tier: 'Nivo 3, veliki ugovorni partneri',
    discount: 0.18,
    creditLimit: 50000,
    paymentDays: 90,
    email: 'nabavka@lazarevo.demo',
    password: 'lazarevo2026',
    sites: [
      { id: 'lz-1', name: 'Lamela B, Starčevica', address: 'Ul. Vojvode Stepe Stepanovića 110, Banja Luka', note: 'Ulaz iz dvorišta, kran sa sjeverne strane' },
      { id: 'lz-2', name: 'Poslovni objekat, Prijedor', address: 'Ul. Nikole Pašića 21, Prijedor', note: 'Najava vozača 30 minuta ranije' },
    ],
    invoices: [
      { no: 'IF-26-00588', issuedDaysAgo: 110, amount: 12480.0, paid: true },
      { no: 'IF-26-00731', issuedDaysAgo: 64, amount: 9870.3, paid: false },
      { no: 'IF-26-00845', issuedDaysAgo: 38, amount: 5412.7, paid: false },
      { no: 'IF-26-00955', issuedDaysAgo: 9, amount: 3467.0, paid: false },
    ],
    orders: [
      { no: 'GC-2026-04211', daysAgo: 34, siteId: 'lz-1', status: 'Isporučena', payment: 'odgodjeno', delivery: 'kran', deliveryCost: 90, items: [['KNF-001', 600], ['KNF-003', 200], ['PRF-075', 140], ['PRF-UW75', 45], ['ISO-001', 480], ['ACC-001', 12], ['ACC-003', 20]] },
      { no: 'GC-2026-04390', daysAgo: 21, siteId: 'lz-2', status: 'Isporučena', payment: 'odgodjeno', delivery: 'kran', deliveryCost: 180, items: [['ISO-006', 320], ['CHM-003', 30], ['CHM-004', 45]] },
      { no: 'GC-2026-04502', daysAgo: 2, siteId: 'lz-1', status: 'Potvrđena', payment: 'odgodjeno', delivery: 'kran', deliveryCost: 90, items: [['KNF-004', 150], ['PRF-100', 60], ['ACC-002', 6], ['ACC-005', 8]] },
    ],
  },
];

const PARTNER_TIERS = [
  { name: 'Maloprodaja', who: 'Fizička lica i investitori bez ugovora', rebate: '0%', limit: 'Bez kreditnog limita', days: 'Plaćanje pri preuzimanju ili predračun' },
  { name: 'Nivo 1', who: 'Zanatlije i manji izvođači', rebate: '10%', limit: 'Okvirno do 15.000 KM', days: 'Valuta 30 dana' },
  { name: 'Nivo 2', who: 'Srednje građevinske firme', rebate: '15%', limit: 'Okvirno do 30.000 KM', days: 'Valuta 60 dana' },
  { name: 'Nivo 3', who: 'Veliki ugovorni partneri', rebate: '18–22%', limit: 'Od 50.000 KM', days: 'Valuta 90 dana' },
];

// ---------------------------------------------------------------------
// Delivery / crane-truck price list (demo values)
// ---------------------------------------------------------------------
const DELIVERY_ZONES = [
  { id: 'bl', label: 'Banja Luka, do 10 km', standard: 30, kranTransport: 30, kranWork: 60 },
  { id: 'z25', label: 'Regija do 25 km (Laktaši, Čelinac…)', standard: 50, kranTransport: 70, kranWork: 60 },
  { id: 'z50', label: 'Regija do 50 km (Prijedor, Gradiška…)', standard: 80, kranTransport: 110, kranWork: 70 },
];

const FREE_STANDARD_DELIVERY_OVER = 3000; // KM
const CRANE_RECOMMEND_OVER_KG = 1000;     // above ~1 t we recommend the crane truck
