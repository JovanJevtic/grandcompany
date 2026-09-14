// =====================================================================
// GRAND COMPANY d.o.o. Banja Luka — data layer
// ---------------------------------------------------------------------
// In production this data comes from the Datalab PANTHEON ERP via API.
// The demo keeps it as static data so the rest of the app can be wired
// to a real backend later without touching any UI/logic code.
// =====================================================================

const COMPANY = {
  name: 'Grand Company d.o.o. Banja Luka',
  address: 'Ul. Nenada Kostića 151, 78000 Banja Luka (Zalužani / Lazarevo)',
  phoneLandline: '+387 (0)51 388-995',
  phoneMobile: '+387 (0)65 516-696',
  emailInfo: 'info@grandcompany.com',
  emailSales: 'prodaja@grandcompany.com',
  jib: '4403433180005',
  mbs: '57-01-0089-12',
  pib: '403433180005',
  director: 'Predrag Uzelac',
  workHours: 'Pon–Pet 07:00–17:00 · Sub 07:00–14:00 · Ned neradna',
};

const VAT_RATE = 0.17; // BiH PDV — catalog prices already include it

const CATEGORIES = [
  { id: 'sve', label: 'Sve kategorije' },
  { id: 'suha-gradnja', label: 'Suha gradnja' },
  { id: 'izolacija', label: 'Izolacija i fasade' },
  { id: 'veziva', label: 'Veziva i glet mase' },
  { id: 'oprema', label: 'Vijci i oprema' },
];

// weight = approx kg per sales unit (used for crane-transport logistics)
// stock  = simulated real-time PANTHEON warehouse quantity
const PRODUCTS = [
  // ------------------- SUHA GRADNJA -------------------
  { sku: 'KNF-001', name: 'Knauf Gips-Kartonska Ploča GKB 12.5mm', spec: '2000×1250×12.5 mm (ploča = 2,5 m²)', desc: 'Standardna ploča za zidove i plafone', price: 5.20, unit: 'm²', category: 'suha-gradnja', stock: 4850, weight: 10.0 },
  { sku: 'KNF-002', name: 'Knauf Impregnirana Ploča GKBI 12.5mm', spec: '2000×1250×12.5 mm (ploča = 2,5 m²)', desc: 'Vlagootporna (zelena), za kupatila i kuhinje', price: 7.40, unit: 'm²', category: 'suha-gradnja', stock: 2600, weight: 10.0 },
  { sku: 'KNF-003', name: 'Knauf Vatrootporna Ploča GKF 12.5mm', spec: '2000×1250×12.5 mm (ploča = 2,5 m²)', desc: 'Vatrootporna (crvena), klasa gorivosti A2-s1,d0', price: 8.80, unit: 'm²', category: 'suha-gradnja', stock: 1450, weight: 10.5 },
  { sku: 'KNF-004', name: 'Knauf Diamant Tvrda Ploča DFH2IR 12.5mm', spec: '2000×1250×12.5 mm (ploča = 2,5 m²)', desc: 'Ekstra čvrsta, zvučno izolativna i vatrootporna', price: 14.50, unit: 'm²', category: 'suha-gradnja', stock: 780, weight: 12.5 },
  { sku: 'PRF-050', name: 'Pocinčani Zidni Profil CW 50', spec: '3000×50×50 mm, lim 0,6 mm', desc: 'Vertikalni profil za konstrukciju pregrada', price: 3.60, unit: 'kom', category: 'suha-gradnja', stock: 3200, weight: 1.7 },
  { sku: 'PRF-075', name: 'Pocinčani Zidni Profil CW 75', spec: '3000×75×50 mm, lim 0,6 mm', desc: 'Vertikalni profil za pregradne zidove 10 cm', price: 4.10, unit: 'kom', category: 'suha-gradnja', stock: 2800, weight: 2.1 },
  { sku: 'PRF-100', name: 'Pocinčani Zidni Profil CW 100', spec: '3000×100×50 mm, lim 0,6 mm', desc: 'Vertikalni profil za debele pregradne zidove', price: 4.80, unit: 'kom', category: 'suha-gradnja', stock: 1900, weight: 2.6 },
  { sku: 'PRF-UW75', name: 'Pocinčani Vodeći Profil UW 75', spec: '4000×75×40 mm, lim 0,6 mm', desc: 'Horizontalni vodilni profil za pod i plafon', price: 3.80, unit: 'kom', category: 'suha-gradnja', stock: 2400, weight: 2.3 },
  { sku: 'PRF-CD60', name: 'Pocinčani Plafonski Profil CD 60/27', spec: '4000×60×27 mm, lim 0,6 mm', desc: 'Noseći i montažni profil za spuštene plafone', price: 3.20, unit: 'kom', category: 'suha-gradnja', stock: 5100, weight: 2.4 },
  { sku: 'PRF-UD28', name: 'Pocinčani Obodni Profil UD 28/27', spec: '3000×28×27 mm, lim 0,6 mm', desc: 'Zidni obodni profil za plafone', price: 2.10, unit: 'kom', category: 'suha-gradnja', stock: 3600, weight: 0.9 },

  // ------------------- IZOLACIJA I FASADE -------------------
  { sku: 'ISO-001', name: 'Kamena Vuna Knauf Insulation NaturBoard 50mm', spec: 'd=50 mm, ploča 1000×600 mm (0,6 m²)', desc: 'Pregradni zidovi, zvučna i toplotna izolacija', price: 6.90, unit: 'm²', category: 'izolacija', stock: 1820, weight: 2.5 },
  { sku: 'ISO-002', name: 'Kamena Vuna Knauf Insulation NaturBoard 100mm', spec: 'd=100 mm, ploča 1000×600 mm (0,6 m²)', desc: 'Zidovi visoke izolacije i potkrovlja', price: 12.80, unit: 'm²', category: 'izolacija', stock: 960, weight: 5.0 },
  { sku: 'ISO-003', name: 'Mineralna Staklena Vuna Unifit 035 u rolni', spec: 'd=100 mm, rolna ~6 m², λ=0,035 W/mK', desc: 'Kosi krovovi i potkrovlja', price: 5.50, unit: 'm²', category: 'izolacija', stock: 2400, weight: 1.5 },
  { sku: 'ISO-004', name: 'Fasadni Stiropor EPS 70 (Bijeli)', spec: 'd=80 mm, ploča 1000×500 mm', desc: 'Standardne kontaktne fasade (DEMIT)', price: 8.20, unit: 'm²', category: 'izolacija', stock: 3100, weight: 1.2 },
  { sku: 'ISO-005', name: 'Fasadni Stiropor EPS 100 (Podni)', spec: 'd=50 mm, ploča 1000×500 mm', desc: 'Izolacija podova i estriha', price: 6.10, unit: 'm²', category: 'izolacija', stock: 2700, weight: 1.0 },
  { sku: 'ISO-006', name: 'Grafitni Stiropor EPS Neopor (Sivi)', spec: 'd=100 mm, λ=0,031 W/mK', desc: 'Vrhunska nisko-energetska fasadna izolacija', price: 14.20, unit: 'm²', category: 'izolacija', stock: 1150, weight: 1.6 },
  { sku: 'ISO-007', name: 'Stirodur XPS (Ekstrudirani polistiren)', spec: 'd=30 mm, preklopni rub', desc: 'Temelji, cokle, podzemne zone', price: 7.90, unit: 'm²', category: 'izolacija', stock: 890, weight: 1.0 },

  // ------------------- VEZIVA, LEPKOVI, GLET MASE -------------------
  { sku: 'CHM-001', name: 'Knauf Uniflott Ispuna Spojeva', spec: 'Vreća 5 kg', desc: 'Ispuna spojeva gipsanih ploča visoke čvrstoće', price: 14.50, unit: 'kom', category: 'veziva', stock: 640, weight: 5 },
  { sku: 'CHM-002', name: 'Knauf Fugenfüller Leicht', spec: 'Vreća 25 kg', desc: 'Standardna gipsana masa za fugovanje', price: 28.00, unit: 'kom', category: 'veziva', stock: 380, weight: 25 },
  { sku: 'CHM-003', name: 'Ceresit CT 83 Ljepilo za Stiropor', spec: 'Vreća 25 kg', desc: 'Ljepljenje polistirenskih ploča', price: 11.50, unit: 'kom', category: 'veziva', stock: 520, weight: 25 },
  { sku: 'CHM-004', name: 'Ceresit CT 85 Ljepilo i Mrežica za Fasadu', spec: 'Vreća 25 kg', desc: 'Ljepljenje i armiranje mrežice (sa vlaknima)', price: 16.20, unit: 'kom', category: 'veziva', stock: 470, weight: 25 },
  { sku: 'CHM-005', name: 'Ceresit CM 16 Fleksibilno Ljepilo za Keramiku', spec: 'Vreća 25 kg', desc: 'Unutrašnja i vanjska keramika i gres pločice', price: 22.50, unit: 'kom', category: 'veziva', stock: 350, weight: 25 },
  { sku: 'CHM-006', name: 'Cement Lukavac CEM II 42.5N', spec: 'Vreća 50 kg', desc: 'Klasična gradnja, betoniranje i malterisanje', price: 13.80, unit: 'kom', category: 'veziva', stock: 1200, weight: 50 },
  { sku: 'CHM-007', name: 'Glet Masa Ceresit IN 52', spec: 'Vreća 20 kg', desc: 'Fina unutrašnja glet masa za zidove', price: 18.00, unit: 'kom', category: 'veziva', stock: 290, weight: 20 },

  // ------------------- VIJCI, TRAKE I OPREMA -------------------
  { sku: 'ACC-001', name: 'Knauf TN Samourezni Vijci 3.5×25mm', spec: 'Kutija 1000 kom', desc: 'Montaža gips ploča na metalne profile', price: 12.50, unit: 'kut', category: 'oprema', stock: 850, weight: 3.5 },
  { sku: 'ACC-002', name: 'Knauf TN Samourezni Vijci 3.5×35mm', spec: 'Kutija 1000 kom', desc: 'Montaža dvostruke obloge gips ploča', price: 15.80, unit: 'kut', category: 'oprema', stock: 610, weight: 4.5 },
  { sku: 'ACC-003', name: 'Staklena Bandaž Traka za Spojeve', spec: 'Rola 25 m', desc: 'Ojačanje spojeva gips-kartonskih ploča', price: 2.50, unit: 'kom', category: 'oprema', stock: 1400, weight: 0.2 },
  { sku: 'ACC-004', name: 'Papirna Bandaž Traka Knauf Kurt', spec: 'Rola 75 m', desc: 'Izuzetno jaka traka za uglove i spojeve', price: 11.00, unit: 'kom', category: 'oprema', stock: 320, weight: 0.6 },
  { sku: 'ACC-005', name: 'Zvučno-izolaciona Traka za UW/UD', spec: 'Rola 30 m × 75 mm', desc: 'Akustična izolacija profila od podova/zidova', price: 9.50, unit: 'kom', category: 'oprema', stock: 540, weight: 0.5 },
  { sku: 'ACC-006', name: 'Direktni Ovjes za CD Profil 120mm', spec: 'Pakovanje 100 kom', desc: 'Montaža plafonske konstrukcije CD 60/27', price: 24.00, unit: 'pak', category: 'oprema', stock: 410, weight: 3.0 },
];

// ---------------------------------------------------------------------
// B2B demo partners — in production the login goes against PANTHEON
// customer records (contracted rebate, credit limit, payment terms).
// creditUsed = open (unpaid) invoices synced from the ERP.
// ---------------------------------------------------------------------
const PARTNERS = [
  {
    id: 'gipsmont',
    name: 'Zanatska radnja "GipsMont" Banja Luka',
    tier: 'B2B Nivo 1 — Zanatlije i manji izvođači',
    discount: 0.10,
    creditLimit: 15000,
    creditUsed: 4230,
    paymentDays: 30,
  },
  {
    id: 'gradnjamont',
    name: 'Gradnja-Mont d.o.o. Laktaši',
    tier: 'B2B Nivo 2 — Srednje građevinske firme',
    discount: 0.15,
    creditLimit: 30000,
    creditUsed: 11350,
    paymentDays: 60,
  },
  {
    id: 'integral',
    name: 'Integral Inženjering a.d.',
    tier: 'B2B Nivo 3 — Veliki ugovorni partneri',
    discount: 0.18,
    creditLimit: 50000,
    creditUsed: 18750,
    paymentDays: 90,
  },
];

// ---------------------------------------------------------------------
// Delivery / crane-truck logistics price list (demo values)
// kran = transport + hydraulic crane work (unload onto floors/scaffold)
// ---------------------------------------------------------------------
const DELIVERY_ZONES = [
  { id: 'bl',  label: 'Banja Luka — grad (do 10 km)', standard: 30, kranTransport: 30,  kranWork: 60 },
  { id: 'z25', label: 'Regija do 25 km (Laktaši, Čelinac...)', standard: 50, kranTransport: 70,  kranWork: 60 },
  { id: 'z50', label: 'Regija do 50 km (Prijedor, Gradiška...)', standard: 80, kranTransport: 110, kranWork: 70 },
];

const FREE_STANDARD_DELIVERY_OVER = 3000; // KM — free standard delivery threshold
const CRANE_RECOMMEND_OVER_KG = 1000;     // above ~1 t we recommend the crane truck
