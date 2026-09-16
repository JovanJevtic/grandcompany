// =====================================================================
// GRAND COMPANY — core logic shared by every page
// State, pricing, cart math and the W111 calculator. No HTML lives here,
// so the same rules can later move to a backend unchanged.
// =====================================================================

'use strict';

const $ = (id) => document.getElementById(id);

const fmt2 = new Intl.NumberFormat('sr-Latn-BA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = new Intl.NumberFormat('sr-Latn-BA', { maximumFractionDigits: 0 });
const KM = (n) => `${fmt2.format(n)} KM`;
const qtyFmt = (n) => (Number.isInteger(n) ? fmt0.format(n) : fmt2.format(n));
const pct = (n) => `${Math.round(n * 100)}%`;

// Serbian plural forms: 1 artikal, 2–4 artikla, 5+ artikala (11–14 always take the "many" form)
function plural(n, one, few, many) {
  const d10 = n % 10, d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return one;
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return few;
  return many;
}

// Escape any string before inserting it into HTML
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const bySku = Object.fromEntries(PRODUCTS.map((p) => [p.sku, p]));
const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))];

// ---------------------------------------------------------------------
// State — persisted in localStorage so every page (and tab) shares it
// ---------------------------------------------------------------------
const STORAGE_KEY = 'gc_portal_v1';

const state = {
  partnerId: null,    // null => retail (B2C) prices
  cart: {},           // sku -> quantity in the product's sales unit
  delivery: 'pickup', // pickup | standard | kran
  zone: 'bl',
  orders: {},         // partnerId -> orders placed on the portal (not yet in the seed data)
  sites: {},          // partnerId -> construction sites added on the portal
};

const listeners = [];
const onChange = (fn) => listeners.push(fn);
const notify = () => listeners.forEach((fn) => fn());

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode or blocked storage — the page still works for this visit */
  }
}

function loadState() {
  state.partnerId = null;
  state.cart = {};
  state.orders = {};
  state.sites = {};
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    if (PARTNERS.some((p) => p.id === saved.partnerId)) state.partnerId = saved.partnerId;
    if (saved.cart && typeof saved.cart === 'object') {
      for (const [sku, qty] of Object.entries(saved.cart)) {
        if (bySku[sku] && qty > 0) state.cart[sku] = qty;
      }
    }
    if (['pickup', 'standard', 'kran'].includes(saved.delivery)) state.delivery = saved.delivery;
    if (DELIVERY_ZONES.some((z) => z.id === saved.zone)) state.zone = saved.zone;
    if (saved.orders && typeof saved.orders === 'object') state.orders = saved.orders;
    if (saved.sites && typeof saved.sites === 'object') state.sites = saved.sites;
  } catch {
    /* corrupted storage — start fresh */
  }
}

function commit() {
  saveState();
  notify();
}

// ---------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------
const partner = () => PARTNERS.find((p) => p.id === state.partnerId) || null;
const discount = () => (partner() ? partner().discount : 0);
const priceOf = (p) => p.price * (1 - discount());
const currentZone = () => DELIVERY_ZONES.find((z) => z.id === state.zone) || DELIVERY_ZONES[0];

const DELIVERY_LABELS = {
  pickup: 'Preuzimanje na stovarištu',
  standard: 'Standardna dostava',
  kran: 'Kamion sa kranom, istovar na etažu',
};

// Short forms for dense lists (order history, summaries)
const DELIVERY_SHORT = { pickup: 'Preuzimanje', standard: 'Dostava', kran: 'Istovar kranom' };

const stockLevel = (p) => (p.stock > 1000 ? 'high' : p.stock >= 300 ? 'mid' : 'low');
const minPrice = (categoryId) => Math.min(...PRODUCTS.filter((p) => p.category === categoryId).map(priceOf));
const defaultQty = (p) => (p.pack ? p.pack.size : 1);

// ---------------------------------------------------------------------
// Cart + crane logistics
// ---------------------------------------------------------------------
function cartItems() {
  return Object.entries(state.cart)
    .map(([sku, qty]) => ({ product: bySku[sku], qty }))
    .filter((i) => i.product && i.qty > 0);
}

const cartCount = () => cartItems().length;

function deliveryCostFor(subtotal, delivery = state.delivery) {
  if (delivery === 'pickup') return 0;
  const zone = currentZone();
  if (delivery === 'standard') return subtotal >= FREE_STANDARD_DELIVERY_OVER ? 0 : zone.standard;
  return zone.kranTransport + zone.kranWork;
}

function cartTotals() {
  const items = cartItems();
  const grossB2C = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const subtotal = items.reduce((s, i) => s + priceOf(i.product) * i.qty, 0);
  const rebate = grossB2C - subtotal;
  const weightKg = items.reduce((s, i) => s + i.product.weight * i.qty, 0);
  const deliveryCost = deliveryCostFor(subtotal);
  const total = subtotal + deliveryCost;
  const net = total / (1 + VAT_RATE); // catalogue prices already include PDV — extract the base
  const vat = total - net;
  return { items, grossB2C, subtotal, rebate, weightKg, deliveryCost, total, net, vat };
}

const roundQty = (q) => Math.round(q * 100) / 100;

function addToCart(sku, qty) {
  if (!bySku[sku] || !(qty > 0)) return;
  state.cart[sku] = roundQty((state.cart[sku] || 0) + qty);
  commit();
}

function setCartQty(sku, qty) {
  if (qty > 0) state.cart[sku] = roundQty(qty);
  else delete state.cart[sku];
  commit();
}

function clearCart() {
  state.cart = {};
  commit();
}

function setPartner(id) {
  state.partnerId = PARTNERS.some((p) => p.id === id) ? id : null;
  commit();
}

// ---------------------------------------------------------------------
// Partner account — invoices, orders, sites and credit exposure
// ---------------------------------------------------------------------
const DAY_MS = 86400000;
const daysAgo = (days) => new Date(Date.now() - days * DAY_MS);
const fmtDate = (d) => d.toLocaleDateString('sr-Latn-BA', { day: '2-digit', month: '2-digit', year: 'numeric' });

function partnerInvoices(p) {
  return p.invoices
    .map((inv) => {
      const issued = daysAgo(inv.issuedDaysAgo);
      const due = new Date(issued.getTime() + p.paymentDays * DAY_MS);
      const daysToDue = Math.ceil((due.getTime() - Date.now()) / DAY_MS);
      const status = inv.paid ? 'paid' : daysToDue < 0 ? 'overdue' : 'open';
      return { ...inv, issued, due, daysToDue, status };
    })
    .sort((a, b) => b.issued - a.issued);
}

function partnerOrders(p) {
  const seeded = p.orders.map((o) => {
    const items = o.items.map(([sku, qty]) => ({ sku, qty, price: bySku[sku].price * (1 - p.discount) }));
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    return { ...o, date: daysAgo(o.daysAgo), items, subtotal, total: subtotal + o.deliveryCost, source: 'pantheon' };
  });
  const placed = (state.orders[p.id] || []).map((o) => ({ ...o, date: new Date(o.date) }));
  return [...placed, ...seeded].sort((a, b) => b.date - a.date);
}

const partnerSites = (p) => [...p.sites, ...(state.sites[p.id] || [])];

const openInvoicesTotal = (p) => partnerInvoices(p).filter((i) => !i.paid).reduce((s, i) => s + i.amount, 0);

// Deferred orders placed on the portal reserve credit until Pantheon invoices them
const reservedCredit = (p) => (state.orders[p.id] || []).filter((o) => o.payment === 'odgodjeno').reduce((s, o) => s + o.total, 0);

const creditUsed = (p) => openInvoicesTotal(p) + reservedCredit(p);
const creditFree = (p) => Math.max(0, p.creditLimit - creditUsed(p));

function recordOrder(order) {
  (state.orders[order.customerId] ||= []).push(order);
  commit();
}

function recordSite(partnerId, site) {
  (state.sites[partnerId] ||= []).push(site);
  commit();
}

function setDelivery(delivery) {
  state.delivery = delivery;
  commit();
}

function setZone(zone) {
  state.zone = zone;
  commit();
}

// ---------------------------------------------------------------------
// Knauf W111 calculator — material norm per m² of wall, +5% waste,
// rounded up to whole packages
// ---------------------------------------------------------------------
function calcW111({ L, H, cladding, plateSku, cwSku, woolSku, fillerSku, soundTape }) {
  const P = L * H;
  const items = [];

  const plateM2 = P * (cladding === 'double' ? 4.1 : 2.05);
  const boards = Math.ceil(plateM2 / 2.5);
  items.push({ sku: plateSku, need: `${fmt2.format(plateM2)} m²`, qty: boards * 2.5, note: `${boards} ploča po 2,5 m²` });

  const cwM = (L / 0.6) * H * 1.05;
  const cwPieces = Math.ceil(cwM / 3);
  items.push({ sku: cwSku, need: `${fmt2.format(cwM)} m`, qty: cwPieces, note: `${cwPieces} komada po 3 m` });

  const uwM = L * 2 * 1.05;
  const uwPieces = Math.ceil(uwM / 4);
  items.push({ sku: 'PRF-UW75', need: `${fmt2.format(uwM)} m`, qty: uwPieces, note: `${uwPieces} komada po 4 m` });

  if (woolSku) {
    const woolM2 = P * 1.05;
    const panels = Math.ceil(woolM2 / 0.6);
    items.push({ sku: woolSku, need: `${fmt2.format(woolM2)} m²`, qty: roundQty(panels * 0.6), note: `${panels} ploča po 0,6 m²` });
  }

  const fillerKg = P * 0.6;
  const bagSize = fillerSku === 'CHM-001' ? 5 : 25;
  const bags = Math.ceil(fillerKg / bagSize);
  items.push({ sku: fillerSku, need: `${fmt2.format(fillerKg)} kg`, qty: bags, note: `${bags} vreća po ${bagSize} kg` });

  const screws = Math.ceil(P * 25);
  const boxes = Math.ceil(screws / 1000);
  items.push({ sku: 'ACC-001', need: `${fmt0.format(screws)} kom`, qty: boxes, note: `${boxes} kutija po 1000 komada` });

  const tapeM = L * 1.5;
  const rolls = Math.ceil(tapeM / 25);
  items.push({ sku: 'ACC-003', need: `${fmt2.format(tapeM)} m`, qty: rolls, note: `${rolls} rola po 25 m` });

  if (soundTape) {
    const stRolls = Math.ceil(uwM / 30);
    items.push({ sku: 'ACC-005', need: `${fmt2.format(uwM)} m`, qty: stRolls, note: `${stRolls} rola po 30 m` });
  }

  return { P, items };
}

const bomTotal = (bom) => bom.items.reduce((s, it) => s + priceOf(bySku[it.sku]) * it.qty, 0);
