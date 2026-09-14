// =====================================================================
// GRAND COMPANY — B2B/B2C portal logic (vanilla JS, no framework)
// Data comes from js/data.js (simulated PANTHEON ERP layer).
// =====================================================================

'use strict';

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
const $ = (id) => document.getElementById(id);

const fmt2 = new Intl.NumberFormat('sr-Latn-BA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = new Intl.NumberFormat('sr-Latn-BA', { maximumFractionDigits: 0 });
const KM = (n) => `${fmt2.format(n)} KM`;
const qtyFmt = (n) => (Number.isInteger(n) ? fmt0.format(n) : fmt2.format(n));
const pct = (n) => `${Math.round(n * 100)}%`;

const bySku = Object.fromEntries(PRODUCTS.map((p) => [p.sku, p]));

// Escape user-provided strings before inserting them into HTML
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Shared editorial design-system classes
const FIELD = 'mt-1 w-full border-0 border-b border-espresso/30 bg-transparent pl-0 pr-2 text-[15px] text-espresso placeholder-umber/60 focus:border-espresso focus:ring-0';
const LABEL = 'text-[13px] text-umber';
const BTN_PRIMARY = 'bg-espresso text-[14px] font-medium text-cream transition-colors hover:bg-oxide';
const BTN_GHOST = 'border border-espresso/40 text-[14px] font-medium text-espresso transition-colors hover:bg-espresso hover:text-cream';

// ---------------------------------------------------------------------
// Application state (persisted to localStorage)
// ---------------------------------------------------------------------
const STORAGE_KEY = 'gc_portal_v1';

const state = {
  partnerId: null, // null => B2C (retail) mode
  cart: {},        // sku -> quantity (in the product's sales unit)
  category: 'sve',
  search: '',
  delivery: 'pickup', // pickup | standard | kran
  zone: 'bl',
};

function saveState() {
  const { partnerId, cart, delivery, zone } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ partnerId, cart, delivery, zone }));
}

function loadState() {
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
  } catch {
    /* corrupted storage — start fresh */
  }
}

const partner = () => PARTNERS.find((p) => p.id === state.partnerId) || null;
const discount = () => (partner() ? partner().discount : 0);
const priceOf = (p) => p.price * (1 - discount());

// ---------------------------------------------------------------------
// Cart math + crane logistics
// ---------------------------------------------------------------------
function cartItems() {
  return Object.entries(state.cart)
    .map(([sku, qty]) => ({ product: bySku[sku], qty }))
    .filter((i) => i.product && i.qty > 0);
}

function deliveryCostFor(subtotal) {
  if (state.delivery === 'pickup') return 0;
  const zone = DELIVERY_ZONES.find((z) => z.id === state.zone) || DELIVERY_ZONES[0];
  if (state.delivery === 'standard') {
    return subtotal >= FREE_STANDARD_DELIVERY_OVER ? 0 : zone.standard;
  }
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
  const net = total / (1 + VAT_RATE); // prices already include PDV — extract the base
  const vat = total - net;
  return { items, grossB2C, subtotal, rebate, weightKg, deliveryCost, total, net, vat };
}

function addToCart(sku, qty) {
  if (!bySku[sku] || !(qty > 0)) return;
  state.cart[sku] = Math.round(((state.cart[sku] || 0) + qty) * 100) / 100;
  saveState();
  renderAll();
}

function setCartQty(sku, qty) {
  if (qty > 0) state.cart[sku] = Math.round(qty * 100) / 100;
  else delete state.cart[sku];
  saveState();
  renderAll();
}

// ---------------------------------------------------------------------
// Toast notifications
// ---------------------------------------------------------------------
function toast(msg) {
  const el = document.createElement('div');
  el.className =
    'pointer-events-auto mb-2 bg-espresso px-5 py-3 text-[14px] text-cream shadow-lg transition-opacity duration-500';
  el.textContent = msg;
  $('toast').appendChild(el);
  setTimeout(() => (el.style.opacity = '0'), 2200);
  setTimeout(() => el.remove(), 2800);
}

// ---------------------------------------------------------------------
// Header: mode toggle + partner bar (credit meter)
// ---------------------------------------------------------------------
function renderModeToggle() {
  const base = 'px-3 py-1.5 text-[13px] transition-colors';
  const active = `${base} bg-espresso text-cream`;
  const idle = `${base} text-umber hover:text-espresso`;
  $('mode-b2c').className = partner() ? idle : active;
  $('mode-b2b').className = partner() ? active : idle;
}

function renderPartnerBar() {
  const bar = $('partner-bar');
  const p = partner();
  if (!p) {
    bar.classList.add('hidden');
    bar.innerHTML = '';
    return;
  }
  const { subtotal } = cartTotals();
  const used = p.creditUsed + subtotal;
  const usedPct = Math.min(100, (used / p.creditLimit) * 100);
  const barColor = usedPct < 85 ? 'bg-espresso' : 'bg-oxide';
  const free = Math.max(0, p.creditLimit - used);
  const syncTime = new Date().toLocaleTimeString('sr-Latn-BA', { hour: '2-digit', minute: '2-digit' });

  bar.innerHTML = `
    <div class="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-2 px-6 py-2.5 text-[13px] lg:px-12">
      <span class="font-bold">${esc(p.name)}</span>
      <span class="text-umber">${esc(p.tier)}</span>
      <span class="text-umber">Rabat <strong class="text-oxide">−${pct(p.discount)}</strong></span>
      <span class="text-umber">Valuta ${p.paymentDays} dana</span>
      <div class="flex min-w-[240px] max-w-md flex-1 items-center gap-3">
        <span class="whitespace-nowrap text-umber">Limit</span>
        <div class="h-1 flex-1 overflow-hidden bg-espresso/15">
          <div class="h-full ${barColor} transition-all" style="width:${usedPct}%"></div>
        </div>
        <span class="whitespace-nowrap text-umber">${KM(used)} od ${KM(p.creditLimit)}, slobodno <strong class="text-espresso">${KM(free)}</strong></span>
      </div>
      <span class="text-umber">Pantheon ${syncTime}</span>
      <button id="btn-logout" class="border border-espresso/30 px-3 py-1 transition-colors hover:bg-espresso hover:text-cream">Odjava</button>
    </div>`;
  bar.classList.remove('hidden');
  $('btn-logout').addEventListener('click', logout);
}

function logout() {
  state.partnerId = null;
  saveState();
  renderAll();
  toast('Odjavljeni ste, prikazane su maloprodajne cijene');
}

// ---------------------------------------------------------------------
// B2B login modal
// ---------------------------------------------------------------------
function openLoginModal() {
  const options = PARTNERS.map(
    (p, i) => `
    <label class="flex cursor-pointer items-start gap-4 border border-espresso/20 p-4 transition-colors hover:border-espresso has-[:checked]:border-espresso has-[:checked]:bg-bone">
      <input type="radio" name="login-partner" value="${p.id}" ${i === 2 ? 'checked' : ''} class="mt-1 rounded-none border-espresso/40 bg-transparent text-espresso focus:ring-espresso" />
      <span>
        <span class="block font-serif text-[18px] leading-snug">${esc(p.name)}</span>
        <span class="mt-0.5 block text-[13px] text-umber">${esc(p.tier)}</span>
        <span class="mt-1 block text-[13px] text-umber">Rabat <strong class="text-oxide">−${pct(p.discount)}</strong>, limit ${KM(p.creditLimit)}, valuta ${p.paymentDays} dana</span>
      </span>
    </label>`
  ).join('');

  openModal(`
    <div class="p-7">
      <h3 class="font-serif text-[30px] leading-tight">Prijava na partnerski portal</h3>
      <p class="mt-2 text-[14px] text-umber">Demonstracija: odaberite test nalog. U produkciji se prijava provjerava kroz Pantheon šifarnik kupaca.</p>
      <form id="login-form" class="mt-6 space-y-3">
        ${options}
        <label class="block pt-3">
          <span class="${LABEL}">Lozinka</span>
          <input type="password" value="demo1234" class="${FIELD}" />
          <span class="mt-1 block text-[12px] text-umber/80">U demo režimu prolazi bilo koja lozinka.</span>
        </label>
        <div class="flex gap-3 pt-4">
          <button type="submit" class="${BTN_PRIMARY} flex-1 py-3">Prijavi se</button>
          <button type="button" data-close-modal class="${BTN_GHOST} px-6 py-3">Otkaži</button>
        </div>
      </form>
    </div>`);

  $('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const chosen = document.querySelector('input[name="login-partner"]:checked');
    if (!chosen) return;
    state.partnerId = chosen.value;
    saveState();
    closeModal();
    renderAll();
    toast(`Prijavljeni ste kao ${partner().name}, rabat −${pct(partner().discount)}`);
  });
}

// ---------------------------------------------------------------------
// Generic modal plumbing
// ---------------------------------------------------------------------
function openModal(innerHtml, { wide = false } = {}) {
  $('modal-root').innerHTML = `
    <div id="modal-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-espresso/40 p-4 backdrop-blur-[2px]">
      <div class="max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} overflow-y-auto border border-espresso/40 bg-cream text-espresso">
        ${innerHtml}
      </div>
    </div>`;
  document.body.classList.add('no-scroll');
  document.querySelectorAll('[data-close-modal]').forEach((b) => b.addEventListener('click', closeModal));
  $('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
}

function closeModal() {
  $('modal-root').innerHTML = '';
  document.body.classList.remove('no-scroll');
}

// ---------------------------------------------------------------------
// Catalog: filters + product grid
// ---------------------------------------------------------------------
function stockBadge(p) {
  const badge = (dotColor, label) =>
    `<span class="whitespace-nowrap text-[12px] text-umber"><span class="${dotColor}">●</span> ${label}, ${fmt0.format(p.stock)} ${p.unit}</span>`;
  if (p.stock > 1000) return badge('text-[#4a6741]', 'na stanju');
  if (p.stock >= 300) return badge('text-[#a67b2e]', 'ograničeno');
  return badge('text-oxide', 'niske zalihe');
}

function renderCategoryFilters() {
  $('category-filters').innerHTML = CATEGORIES.map((c) => {
    const active = state.category === c.id;
    return `<button data-category="${c.id}" class="pb-1 text-[15px] transition-colors ${
      active ? 'border-b-2 border-oxide text-espresso' : 'text-umber hover:text-espresso'
    }">${c.label}</button>`;
  }).join('');
}

function visibleProducts() {
  const q = state.search.trim().toLowerCase();
  return PRODUCTS.filter((p) => {
    if (state.category !== 'sve' && p.category !== state.category) return false;
    if (!q) return true;
    return [p.name, p.sku, p.spec, p.desc].some((t) => t.toLowerCase().includes(q));
  });
}

function renderCatalog() {
  renderCategoryFilters();
  const products = visibleProducts();
  const b2b = !!partner();

  if (!products.length) {
    $('product-grid').innerHTML =
      '<p class="col-span-full py-16 text-center font-serif italic text-[18px] text-umber">Nema artikala za ovu pretragu.</p>';
    return;
  }

  $('product-grid').innerHTML = products.map((p) => {
    const priceHtml = b2b
      ? `<div>
           <div class="text-[12px] text-umber"><span class="line-through">${KM(p.price)}</span> <span class="ml-1 font-bold text-oxide">−${pct(discount())}</span></div>
           <div class="font-serif text-[26px] leading-none">${KM(priceOf(p))}<span class="ml-1 text-[12px] text-umber">po ${p.unit}</span></div>
         </div>`
      : `<div class="font-serif text-[26px] leading-none">${KM(p.price)}<span class="ml-1 text-[12px] text-umber">po ${p.unit}</span></div>`;

    return `
    <article class="flex flex-col border-t border-espresso/25 pt-4">
      <div class="flex items-baseline justify-between gap-2">
        <span class="text-[12px] text-umber">${p.sku}</span>
        ${stockBadge(p)}
      </div>
      <h3 class="mt-3 font-serif text-[21px] leading-snug">${esc(p.name)}</h3>
      <p class="mt-1 text-[13px] text-umber">${esc(p.spec)}</p>
      <p class="mt-2 flex-1 text-[14px] leading-relaxed text-espresso/75">${esc(p.desc)}</p>
      <div class="mt-5 flex items-end justify-between gap-3">
        ${priceHtml}
        <div class="flex items-center gap-2">
          <input type="number" value="1" min="0.5" step="any" data-qty-for="${p.sku}"
                 class="w-14 border-0 border-b border-espresso/30 bg-transparent px-0 py-1 text-center text-[14px] focus:border-espresso focus:ring-0" />
          <button data-add="${p.sku}" class="${BTN_PRIMARY} px-3.5 py-2" title="Dodaj u korpu">Dodaj</button>
        </div>
      </div>
    </article>`;
  }).join('');
}

// ---------------------------------------------------------------------
// Cart drawer
// ---------------------------------------------------------------------
function openCart() {
  $('cart-drawer').classList.remove('translate-x-full');
  $('cart-overlay').classList.remove('hidden');
  document.body.classList.add('no-scroll');
}

function closeCart() {
  $('cart-drawer').classList.add('translate-x-full');
  $('cart-overlay').classList.add('hidden');
  document.body.classList.remove('no-scroll');
}

function renderCart() {
  const t = cartTotals();
  const countEl = $('cart-count');
  if (t.items.length) {
    countEl.textContent = t.items.length;
    countEl.classList.remove('hidden');
    countEl.classList.add('flex');
  } else {
    countEl.classList.add('hidden');
    countEl.classList.remove('flex');
  }

  // --- items ---
  if (!t.items.length) {
    $('cart-body').innerHTML = `
      <div class="flex h-full flex-col justify-center py-16 text-center">
        <p class="font-serif italic text-[19px] text-umber">Korpa je prazna.</p>
        <p class="mt-3 text-[14px] text-umber">Dodajte artikle iz kataloga ili prenesite specifikaciju iz kalkulatora.</p>
      </div>`;
    $('cart-footer').innerHTML = '';
    return;
  }

  $('cart-body').innerHTML = t.items.map(({ product: p, qty }) => `
    <div class="border-b border-espresso/15 py-4">
      <div class="flex items-start justify-between gap-2">
        <div>
          <div class="font-serif text-[17px] leading-snug">${esc(p.name)}</div>
          <div class="mt-0.5 text-[12px] text-umber">${p.sku}, ${KM(priceOf(p))} po ${p.unit}</div>
        </div>
        <button data-remove="${p.sku}" class="text-umber/60 transition-colors hover:text-oxide" title="Ukloni">✕</button>
      </div>
      <div class="mt-3 flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <button data-dec="${p.sku}" class="flex h-7 w-7 items-center justify-center border border-espresso/25 transition-colors hover:bg-espresso hover:text-cream">−</button>
          <input type="number" value="${qty}" min="0" step="any" data-cart-qty="${p.sku}"
                 class="w-20 border-0 border-b border-espresso/30 bg-transparent px-0 py-0.5 text-center text-[14px] focus:border-espresso focus:ring-0" />
          <button data-inc="${p.sku}" class="flex h-7 w-7 items-center justify-center border border-espresso/25 transition-colors hover:bg-espresso hover:text-cream">+</button>
          <span class="ml-1 text-[12px] text-umber">${p.unit}</span>
        </div>
        <div class="font-serif text-[18px]">${KM(priceOf(p) * qty)}</div>
      </div>
    </div>`).join('');

  // --- footer: delivery + totals ---
  const zone = DELIVERY_ZONES.find((z) => z.id === state.zone) || DELIVERY_ZONES[0];
  const standardFree = t.subtotal >= FREE_STANDARD_DELIVERY_OVER;
  const craneHint =
    t.weightKg >= CRANE_RECOMMEND_OVER_KG && state.delivery !== 'kran'
      ? `<p class="mt-2 border border-oxide/50 px-3 py-2 text-[13px] text-oxide">Pošiljka teži ${fmt0.format(t.weightKg)} kg — preporučujemo kamion sa kranom.</p>`
      : '';

  const deliveryOptions = [
    { id: 'pickup', label: 'Preuzimanje na stovarištu', sub: 'Nenada Kostića 151, pon–pet 7–17h, sub 7–14h', cost: 'besplatno' },
    { id: 'standard', label: 'Standardna dostava', sub: standardFree ? `Besplatna za narudžbe preko ${KM(FREE_STANDARD_DELIVERY_OVER)}` : zone.label, cost: standardFree ? 'besplatno' : KM(zone.standard) },
    { id: 'kran', label: 'Kamion sa kranom, istovar na etažu', sub: `Transport ${KM(zone.kranTransport)} i rad krana ${KM(zone.kranWork)}`, cost: KM(zone.kranTransport + zone.kranWork) },
  ].map((o) => `
    <label class="flex cursor-pointer items-center justify-between gap-2 border p-3 text-[14px] transition-colors ${
      state.delivery === o.id ? 'border-espresso bg-bone' : 'border-espresso/20 hover:border-espresso/50'
    }">
      <span class="flex items-center gap-3">
        <input type="radio" name="delivery" value="${o.id}" ${state.delivery === o.id ? 'checked' : ''} class="rounded-none border-espresso/40 bg-transparent text-espresso focus:ring-espresso" />
        <span><span class="font-medium">${o.label}</span><br /><span class="text-[12px] text-umber">${o.sub}</span></span>
      </span>
      <span class="whitespace-nowrap text-[13px] font-medium">${o.cost}</span>
    </label>`).join('');

  const zoneSelect =
    state.delivery === 'pickup'
      ? ''
      : `<select id="zone-select" class="mt-2 w-full border-0 border-b border-espresso/30 bg-transparent pl-0 pr-8 text-[13px] text-espresso focus:border-espresso focus:ring-0">
          ${DELIVERY_ZONES.map((z) => `<option value="${z.id}" ${z.id === state.zone ? 'selected' : ''}>${z.label}</option>`).join('')}
        </select>`;

  const rebateRow = t.rebate > 0
    ? `<div class="flex justify-between text-[14px] text-oxide"><span>Partnerski rabat, −${pct(discount())}</span><span class="font-medium">−${KM(t.rebate)}</span></div>`
    : '';

  $('cart-footer').innerHTML = `
    <div class="space-y-1.5">${deliveryOptions}</div>
    ${zoneSelect}
    <p class="mt-3 text-[13px] text-umber">Procijenjena težina pošiljke: ${fmt0.format(t.weightKg)} kg</p>
    ${craneHint}
    <div class="mt-3 space-y-1.5 border-t border-espresso/25 pt-3">
      ${t.rebate > 0 ? `<div class="flex justify-between text-[14px] text-umber"><span>Vrijednost po cjenovniku</span><span class="line-through">${KM(t.grossB2C)}</span></div>` : ''}
      ${rebateRow}
      <div class="flex justify-between text-[14px]"><span>Roba sa PDV-om</span><span class="font-medium">${KM(t.subtotal)}</span></div>
      <div class="flex justify-between text-[14px]"><span>Dostava</span><span class="font-medium">${t.deliveryCost ? KM(t.deliveryCost) : 'besplatno'}</span></div>
      <div class="flex justify-between text-[12px] text-umber"><span>Osnovica i PDV 17%</span><span>${KM(t.net)} + ${KM(t.vat)}</span></div>
      <div class="flex items-baseline justify-between border-t border-espresso/25 pt-2.5"><span class="text-[14px]">Ukupno</span><span class="font-serif text-[26px]">${KM(t.total)}</span></div>
    </div>
    <button id="btn-checkout" class="${BTN_PRIMARY} mt-4 w-full py-3.5">Kreiraj narudžbu</button>`;

  $('btn-checkout').addEventListener('click', openCheckoutModal);
  document.querySelectorAll('input[name="delivery"]').forEach((r) =>
    r.addEventListener('change', () => {
      state.delivery = r.value;
      saveState();
      renderCart();
      renderPartnerBar();
    })
  );
  const zoneEl = $('zone-select');
  if (zoneEl)
    zoneEl.addEventListener('change', () => {
      state.zone = zoneEl.value;
      saveState();
      renderCart();
    });
}

// ---------------------------------------------------------------------
// Checkout + order confirmation (simulated PANTHEON order)
// ---------------------------------------------------------------------
function openCheckoutModal() {
  const t = cartTotals();
  if (!t.items.length) return;
  const p = partner();

  // Credit check: deferred payment must fit inside the remaining limit
  const creditFree = p ? Math.max(0, p.creditLimit - p.creditUsed) : 0;
  const deferredOk = p && t.total <= creditFree;

  const paymentOptions = p
    ? `<option value="avans">Avansno plaćanje virmanom</option>
       <option value="odgodjeno" ${deferredOk ? 'selected' : 'disabled'}>
         Odgođeno plaćanje ${p.paymentDays} dana${deferredOk ? '' : ' — nedovoljan kreditni limit'}
       </option>`
    : `<option value="preuzimanje">Plaćanje pri preuzimanju</option>
       <option value="predracun">Predračun i uplata na žiro račun</option>`;

  const creditWarning =
    p && !deferredOk
      ? `<p class="border border-oxide/50 px-3 py-2 text-[13px] text-oxide">Narudžba od ${KM(t.total)} prelazi slobodan limit od ${KM(creditFree)}. Odaberite avans ili kontaktirajte komercijalistu za povećanje limita.</p>`
      : '';

  const needsAddress = state.delivery !== 'pickup';

  openModal(`
    <div class="p-7">
      <h3 class="font-serif text-[30px] leading-tight">Narudžba</h3>
      <p class="mt-1 text-[14px] text-umber">${t.items.length} artikala, ukupno ${KM(t.total)} sa PDV-om i dostavom</p>
      <form id="checkout-form" class="mt-6 space-y-5">
        ${p ? `
        <div class="border border-espresso/20 bg-bone px-3 py-2.5 text-[14px]">
          <span class="text-umber">Kupac iz Pantheona:</span> <strong>${esc(p.name)}</strong>
          <span class="ml-2 font-medium text-oxide">rabat −${pct(p.discount)}</span>
        </div>` : ''}
        <div class="grid gap-5 sm:grid-cols-2">
          <label class="block">
            <span class="${LABEL}">${p ? 'Kontakt osoba' : 'Ime i prezime'}</span>
            <input type="text" id="co-name" required class="${FIELD}" />
          </label>
          <label class="block">
            <span class="${LABEL}">Telefon</span>
            <input type="tel" id="co-phone" required placeholder="065 000 000" class="${FIELD}" />
          </label>
        </div>
        <label class="block">
          <span class="${LABEL}">Adresa e-pošte</span>
          <input type="email" id="co-email" class="${FIELD}" />
        </label>
        ${needsAddress ? `
        <label class="block">
          <span class="${LABEL}">Adresa gradilišta za istovar</span>
          <input type="text" id="co-address" required placeholder="Ulica i broj, mjesto, sprat i pristup za kran" class="${FIELD}" />
        </label>` : ''}
        <label class="block">
          <span class="${LABEL}">Način plaćanja</span>
          <select id="co-payment" class="${FIELD}">${paymentOptions}</select>
        </label>
        ${creditWarning}
        <label class="block">
          <span class="${LABEL}">Napomena</span>
          <textarea id="co-note" rows="2" class="${FIELD}"></textarea>
        </label>
        <div class="flex gap-3 pt-2">
          <button type="submit" class="${BTN_PRIMARY} flex-1 py-3.5">Pošalji narudžbu</button>
          <button type="button" data-close-modal class="${BTN_GHOST} px-6 py-3.5">Nazad</button>
        </div>
      </form>
    </div>`);

  $('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const paymentEl = $('co-payment');
    submitOrder({
      name: $('co-name').value,
      phone: $('co-phone').value,
      email: $('co-email').value,
      address: needsAddress ? $('co-address').value : 'Preuzimanje na stovarištu',
      payment: paymentEl.options[paymentEl.selectedIndex].text.trim(),
      note: $('co-note').value,
    });
  });
}

function submitOrder(form) {
  const t = cartTotals();
  const p = partner();
  const now = new Date();
  const orderNo = `GC-${now.getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  const deliveryLabels = { pickup: 'preuzimanje na stovarištu', standard: 'standardna dostava', kran: 'kamion sa kranom, istovar na etažu' };

  const rows = t.items.map(({ product: pr, qty }) => `
    <tr class="border-b border-espresso/10">
      <td class="py-2 pr-2 text-[12px] text-umber">${pr.sku}</td>
      <td class="py-2 pr-2 text-[14px]">${esc(pr.name)}</td>
      <td class="whitespace-nowrap py-2 pr-2 text-right text-[13px]">${qtyFmt(qty)} ${pr.unit}</td>
      <td class="whitespace-nowrap py-2 text-right text-[13px] font-medium">${KM(priceOf(pr) * qty)}</td>
    </tr>`).join('');

  closeModal();
  openModal(`
    <div class="p-7">
      <p class="text-[13px] text-oxide">Narudžba je poslata u Pantheon (simulacija)</p>
      <h3 class="mt-1 font-serif text-[30px] leading-tight">Narudžba ${orderNo}</h3>
      <p class="mt-1 text-[13px] text-umber">${now.toLocaleDateString('sr-Latn-BA')}</p>
      <div class="mt-5 border border-espresso/20 bg-bone p-4 text-[14px] leading-relaxed">
        <p><span class="text-umber">Kupac:</span> <strong>${esc(p ? p.name : form.name)}</strong>${p ? `, ${esc(form.name)}` : ''}</p>
        <p class="mt-1"><span class="text-umber">Dostava:</span> ${deliveryLabels[state.delivery]}, ${esc(form.address)}</p>
        <p class="mt-1"><span class="text-umber">Plaćanje:</span> ${esc(form.payment)}</p>
        <p class="mt-1"><span class="text-umber">Težina:</span> oko ${fmt0.format(t.weightKg)} kg</p>
      </div>
      <table class="mt-5 w-full"><tbody>${rows}</tbody></table>
      <div class="mt-4 space-y-1.5">
        ${t.rebate > 0 ? `<div class="flex justify-between text-[14px] text-oxide"><span>Partnerski rabat</span><span>−${KM(t.rebate)}</span></div>` : ''}
        <div class="flex justify-between text-[14px]"><span>Dostava</span><span>${t.deliveryCost ? KM(t.deliveryCost) : 'besplatno'}</span></div>
        <div class="flex items-baseline justify-between border-t border-espresso/25 pt-2.5"><span class="text-[14px]">Ukupno sa PDV-om</span><span class="font-serif text-[26px]">${KM(t.total)}</span></div>
      </div>
      <p class="mt-5 border-t border-espresso/15 pt-4 text-[13px] leading-relaxed text-umber">Komercijalista potvrđuje narudžbu i šalje zvaničan predračun iz Pantheona. Atesti i deklaracije stižu uz robu.</p>
      <button data-close-modal class="${BTN_PRIMARY} mt-5 w-full py-3.5">U redu</button>
    </div>`, { wide: true });

  state.cart = {};
  saveState();
  renderAll();
  closeCart();
}

// ---------------------------------------------------------------------
// Knauf W111 calculator — BOM per the official material norm (+5% waste)
// ---------------------------------------------------------------------
let lastBom = null;

function calcW111({ L, H, cladding, plateSku, cwSku, woolSku, fillerSku, soundTape }) {
  const P = L * H;
  const items = [];

  // Plates: P × 2.05 (single) or × 4.10 (double), board = 2.5 m²
  const plateM2 = P * (cladding === 'double' ? 4.1 : 2.05);
  const boards = Math.ceil(plateM2 / 2.5);
  items.push({ sku: plateSku, need: `${fmt2.format(plateM2)} m²`, qty: boards * 2.5, note: `${boards} ploča po 2,5 m²` });

  // CW studs: (L / 0.6) × H × 1.05 running meters, profile = 3 m
  const cwM = (L / 0.6) * H * 1.05;
  const cwPieces = Math.ceil(cwM / 3);
  items.push({ sku: cwSku, need: `${fmt2.format(cwM)} m`, qty: cwPieces, note: `${cwPieces} komada po 3 m` });

  // UW tracks: (L × 2) × 1.05 running meters, profile = 4 m
  const uwM = L * 2 * 1.05;
  const uwPieces = Math.ceil(uwM / 4);
  items.push({ sku: 'PRF-UW75', need: `${fmt2.format(uwM)} m`, qty: uwPieces, note: `${uwPieces} komada po 4 m` });

  // Mineral wool: P × 1.05 m², panel = 0.6 m²
  if (woolSku) {
    const woolM2 = P * 1.05;
    const panels = Math.ceil(woolM2 / 0.6);
    items.push({ sku: woolSku, need: `${fmt2.format(woolM2)} m²`, qty: Math.round(panels * 0.6 * 100) / 100, note: `${panels} ploča po 0,6 m²` });
  }

  // Joint filler: P × 0.6 kg
  const fillerKg = P * 0.6;
  const bagSize = fillerSku === 'CHM-001' ? 5 : 25;
  const bags = Math.ceil(fillerKg / bagSize);
  items.push({ sku: fillerSku, need: `${fmt2.format(fillerKg)} kg`, qty: bags, note: `${bags} vreća po ${bagSize} kg` });

  // TN 25 screws: P × 25 pcs, box = 1000
  const screws = Math.ceil(P * 25);
  const boxes = Math.ceil(screws / 1000);
  items.push({ sku: 'ACC-001', need: `${fmt0.format(screws)} kom`, qty: boxes, note: `${boxes} kutija po 1000 komada` });

  // Joint tape: L × 1.5 m, roll = 25 m
  const tapeM = L * 1.5;
  const rolls = Math.ceil(tapeM / 25);
  items.push({ sku: 'ACC-003', need: `${fmt2.format(tapeM)} m`, qty: rolls, note: `${rolls} rola po 25 m` });

  // Optional (recommended by Knauf mounting practice): acoustic tape under UW
  if (soundTape) {
    const stRolls = Math.ceil(uwM / 30);
    items.push({ sku: 'ACC-005', need: `${fmt2.format(uwM)} m`, qty: stRolls, note: `${stRolls} rola po 30 m` });
  }

  return { P, items };
}

function renderBom(bom, L, H) {
  const rows = bom.items.map((it) => {
    const p = bySku[it.sku];
    const amount = priceOf(p) * it.qty;
    return `
      <tr class="border-b border-espresso/10">
        <td class="py-3 pr-3">
          <div class="font-serif text-[17px] leading-snug">${esc(p.name)}</div>
          <div class="text-[12px] text-umber">${p.sku}</div>
        </td>
        <td class="whitespace-nowrap py-3 pr-3 text-right text-[13px] text-umber">${it.need}</td>
        <td class="whitespace-nowrap py-3 pr-3 text-right"><span class="text-[14px] font-medium">${qtyFmt(it.qty)} ${p.unit}</span><br /><span class="text-[12px] text-umber">${it.note}</span></td>
        <td class="whitespace-nowrap py-3 text-right text-[14px] font-medium">${KM(amount)}</td>
      </tr>`;
  }).join('');

  const total = bom.items.reduce((s, it) => s + priceOf(bySku[it.sku]) * it.qty, 0);
  const b2bNote = partner()
    ? `<span class="ml-3 text-[13px] font-medium text-oxide">sa rabatom −${pct(discount())}</span>`
    : '';

  $('bom-results').innerHTML = `
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h3 class="font-serif text-[26px]">Specifikacija materijala</h3>
      <span class="font-serif italic text-[15px] text-umber">zid ${fmt2.format(L)} × ${fmt2.format(H)} m, površina ${fmt2.format(bom.P)} m²</span>
    </div>
    <p class="mt-1 text-[13px] text-umber">Normativ W111 sa 5% otpada, zaokruženo na cijela pakovanja. Vodilica je uvijek UW 75, lagerski artikal.</p>
    <table class="mt-5 w-full">
      <thead>
        <tr class="border-b border-espresso/40 text-left text-[12px] text-umber">
          <th class="pb-2 font-normal">Artikal</th><th class="pb-2 text-right font-normal">Normativ</th><th class="pb-2 text-right font-normal">Za narudžbu</th><th class="pb-2 text-right font-normal">Iznos</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-espresso/40 pt-5">
      <div class="flex items-baseline gap-2"><span class="text-[14px]">Ukupno</span><span class="font-serif text-[30px]">${KM(total)}</span><span class="text-[12px] text-umber">sa PDV-om</span>${b2bNote}</div>
      <button id="btn-bom-to-cart" class="${BTN_PRIMARY} px-7 py-3.5">Dodaj sve u korpu</button>
    </div>`;

  $('btn-bom-to-cart').addEventListener('click', () => {
    bom.items.forEach((it) => addToCart(it.sku, it.qty));
    toast(`U korpu je dodano ${bom.items.length} stavki iz kalkulatora`);
    openCart();
  });
}

function handleCalcSubmit(e) {
  e.preventDefault();
  const L = parseFloat($('calc-l').value);
  const H = parseFloat($('calc-h').value);
  if (!(L > 0) || !(H > 0)) {
    toast('Unesite ispravne dimenzije zida');
    return;
  }
  const input = {
    L,
    H,
    cladding: $('calc-cladding').value,
    plateSku: $('calc-plate').value,
    cwSku: $('calc-cw').value,
    woolSku: $('calc-wool').value || null,
    fillerSku: $('calc-filler').value,
    soundTape: $('calc-soundtape').checked,
  };
  lastBom = { input, bom: calcW111(input) };
  renderBom(lastBom.bom, L, H);
}

// ---------------------------------------------------------------------
// Global render + event wiring
// ---------------------------------------------------------------------
function renderAll() {
  renderModeToggle();
  renderPartnerBar();
  renderCatalog();
  renderCart();
  // Re-render the BOM so calculator prices follow the active B2B rebate
  if (lastBom) renderBom(lastBom.bom, lastBom.input.L, lastBom.input.H);
}

function init() {
  loadState();

  // Mode toggle
  $('mode-b2c').addEventListener('click', () => {
    if (partner()) logout();
  });
  $('mode-b2b').addEventListener('click', () => {
    if (!partner()) openLoginModal();
  });
  $('hero-b2b-login').addEventListener('click', openLoginModal);
  $('b2b-section-login').addEventListener('click', () => {
    if (partner()) toast('Već ste prijavljeni na partnerski portal');
    else openLoginModal();
  });

  // Cart open/close
  $('btn-cart').addEventListener('click', openCart);
  $('btn-close-cart').addEventListener('click', closeCart);
  $('cart-overlay').addEventListener('click', closeCart);

  // Catalog: search + category filter + add-to-cart (event delegation)
  $('search').addEventListener('input', (e) => {
    state.search = e.target.value;
    renderCatalog();
  });
  $('category-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;
    state.category = btn.dataset.category;
    renderCatalog();
  });
  $('product-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const sku = btn.dataset.add;
    const input = document.querySelector(`[data-qty-for="${sku}"]`);
    const qty = parseFloat(input && input.value) || 1;
    addToCart(sku, qty);
    toast(`${bySku[sku].name} je u korpi`);
  });

  // Cart item controls (event delegation on the drawer body)
  $('cart-body').addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    const rem = e.target.closest('[data-remove]');
    if (inc) setCartQty(inc.dataset.inc, (state.cart[inc.dataset.inc] || 0) + 1);
    if (dec) setCartQty(dec.dataset.dec, (state.cart[dec.dataset.dec] || 0) - 1);
    if (rem) setCartQty(rem.dataset.remove, 0);
  });
  $('cart-body').addEventListener('change', (e) => {
    const input = e.target.closest('[data-cart-qty]');
    if (!input) return;
    setCartQty(input.dataset.cartQty, parseFloat(input.value) || 0);
  });

  // Calculator
  $('calc-form').addEventListener('submit', handleCalcSubmit);

  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
