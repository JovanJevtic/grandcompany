// =====================================================================
// GRAND COMPANY — shared layout and UI components
// Header, footer, cart drawer, modals and product cards are rendered
// here once, so every page stays identical without a build step.
// =====================================================================

'use strict';

const FIELD = 'mt-1 w-full border border-ink/20 bg-surface px-3 py-2.5 text-[15px] text-ink placeholder-muted/60 focus:border-steel focus:ring-1 focus:ring-steel';
const LABEL = 'text-[13px] font-medium text-muted';
const BTN_PRIMARY = 'inline-flex items-center justify-center gap-2 bg-ink text-[15px] font-semibold text-surface transition-colors hover:bg-steel';
const BTN_GHOST = 'inline-flex items-center justify-center gap-2 border border-ink/25 bg-surface text-[15px] font-semibold text-ink transition-colors hover:border-ink';

const ICON = {
  search: '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  cart: '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6"/><circle cx="9" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></svg>',
  user: '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  crane: '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 21V4l13 2M5 4h15M17 6v5"/><path d="M15 11h4v3h-4zM2 21h7"/></svg>',
  stock: '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>',
  doc: '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>',
  card: '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="1"/><path d="M3 10h18M7 15h4"/></svg>',
  check: '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

const SERVICE_LINKS = [
  { href: 'kalkulator.html', label: 'Kalkulator', page: 'kalkulator' },
  { href: 'dostava.html', label: 'Dostava kranom', page: 'dostava' },
  { href: 'partneri.html', label: 'Za partnere', page: 'partneri' },
  { href: 'o-nama.html', label: 'O nama', page: 'o-nama' },
  { href: 'kontakt.html', label: 'Kontakt', page: 'kontakt' },
];

const syncTime = () => new Date().toLocaleTimeString('sr-Latn-BA', { hour: '2-digit', minute: '2-digit' });
const productUrl = (p) => `proizvod.html?sku=${encodeURIComponent(p.sku)}`;
const currentPage = () => document.body.dataset.page || '';

function breadcrumb(items) {
  const parts = items.map((it, i) => {
    const last = i === items.length - 1;
    const sep = i ? '<span aria-hidden="true" class="text-muted/50">/</span>' : '';
    const node = last || !it.href
      ? `<span${last ? ' aria-current="page" class="text-ink"' : ''}>${esc(it.label)}</span>`
      : `<a href="${it.href}" class="link-line hover:text-ink">${esc(it.label)}</a>`;
    return `<li class="flex items-center gap-2">${sep}${node}</li>`;
  });
  return `<nav aria-label="Putanja" class="text-[13px] text-muted"><ol class="flex flex-wrap items-center gap-x-2 gap-y-1">${parts.join('')}</ol></nav>`;
}

// ---------------------------------------------------------------------
// Header / footer / shell markup
// ---------------------------------------------------------------------
function headerHTML() {
  const page = currentPage();
  const params = new URLSearchParams(location.search);
  const activeCat = page === 'katalog' ? params.get('kat') : page === 'proizvod' ? bySku[params.get('sku')]?.category : null;
  const q = page === 'katalog' ? params.get('q') || '' : '';
  const activeCls = 'text-ink shadow-[inset_0_-2px_0_#274C77]';

  const catLinks = CATEGORIES.map(
    (c) => `<a href="katalog.html?kat=${c.id}" class="whitespace-nowrap py-3.5 text-[14px] font-medium text-ink/80 hover:text-ink ${activeCat === c.id ? activeCls : ''}">${c.label}</a>`
  ).join('');
  const serviceLinks = SERVICE_LINKS.map(
    (l) => `<a href="${l.href}" class="whitespace-nowrap py-3.5 text-[14px] text-muted hover:text-ink ${page === l.page ? activeCls : ''}">${l.label}</a>`
  ).join('');

  const searchForm = (id, extra) => `
    <form action="katalog.html" role="search" class="flex ${extra}">
      <label for="${id}" class="sr-only">Pretraga kataloga</label>
      <input id="${id}" name="q" type="search" value="${esc(q)}" placeholder="Pretražite po nazivu, šifri ili dimenziji"
             class="h-11 w-full min-w-0 border border-r-0 border-ink/20 bg-canvas px-4 text-[15px] placeholder-muted/70 focus:border-steel focus:bg-surface focus:ring-0" />
      <button class="flex h-11 items-center gap-2 bg-ink px-4 text-[14px] font-semibold text-surface transition-colors hover:bg-steel">${ICON.search}<span class="hidden xl:inline">Traži</span></button>
    </form>`;

  return `
  <div class="border-b border-ink/10 bg-canvas text-[13px] text-muted">
    <div class="mx-auto flex max-w-page items-center gap-6 px-5 py-2 lg:px-10">
      <span class="hidden md:inline">Stovarište Zalužani, Nenada Kostića 151</span>
      <span class="hidden lg:inline">Pon–pet 7–17h, subota 7–14h</span>
      <a href="${COMPANY.phoneLandlineHref}" class="tnum hover:text-ink">${COMPANY.phoneLandline}</a>
      <a href="${COMPANY.phoneMobileHref}" class="tnum hidden hover:text-ink sm:inline">Viber ${COMPANY.phoneMobile}</a>
      <div class="ml-auto flex items-center gap-1" role="group" aria-label="Prikaz cijena">
        <span class="mr-1 hidden sm:inline">Cijene</span>
        <button id="mode-b2c">Maloprodajne</button>
        <button id="mode-b2b">Partnerske</button>
      </div>
    </div>
  </div>

  <header class="sticky top-0 z-40 border-b border-ink/10 bg-surface/95 backdrop-blur">
    <div class="mx-auto flex max-w-page items-center gap-4 px-5 py-3 lg:gap-10 lg:px-10">
      <button id="btn-menu" class="-ml-1 p-1.5 lg:hidden" aria-label="Meni" aria-expanded="false" aria-controls="mobile-menu">${ICON.menu}</button>
      <a href="index.html" class="flex shrink-0 items-center gap-3" aria-label="Grand Company, početna">
        <span class="flex h-9 w-9 items-center justify-center bg-ink font-serif text-[20px] font-semibold text-surface" aria-hidden="true">G</span>
        <span class="leading-tight">
          <span class="block font-serif text-[20px] font-semibold tracking-[-0.01em]">Grand Company</span>
          <span class="hidden text-[12px] text-muted sm:block">Građevinski materijali, Banja Luka</span>
        </span>
      </a>
      ${searchForm('hdr-q', 'mx-auto hidden max-w-2xl flex-1 md:flex')}
      <div class="ml-auto flex items-center gap-2 md:ml-0">
        <button id="btn-account" class="flex h-11 items-center gap-2 px-2 text-[14px] font-medium transition-colors hover:text-steel">${ICON.user}<span id="account-label" class="hidden max-w-[180px] truncate sm:inline">Prijava za partnere</span></button>
        <button id="btn-cart" class="relative flex h-11 items-center gap-2 border border-ink/20 px-4 text-[14px] font-semibold transition-colors hover:border-ink">
          ${ICON.cart}<span id="cart-total" class="tnum hidden sm:inline">Korpa</span>
          <span id="cart-count" class="absolute -right-2 -top-2 hidden h-5 min-w-[20px] items-center justify-center rounded-full bg-steel px-1 text-[11px] font-bold text-surface">0</span>
        </button>
      </div>
    </div>

    <nav aria-label="Glavna navigacija" class="hidden border-t border-ink/10 lg:block">
      <div class="mx-auto flex max-w-page items-center gap-8 px-10">
        <a href="katalog.html" class="whitespace-nowrap py-3.5 text-[14px] font-semibold hover:text-steel ${page === 'katalog' && !activeCat ? activeCls : ''}">Svi proizvodi</a>
        ${catLinks}
        <span class="ml-auto flex items-center gap-6">${serviceLinks}</span>
      </div>
    </nav>

    <div id="mobile-menu" class="hidden max-h-[75vh] overflow-y-auto border-t border-ink/10 bg-surface lg:hidden">
      <div class="px-5 py-5">
        ${searchForm('mob-q', '')}
        <p class="mt-6 text-[13px] font-medium text-muted">Kategorije</p>
        <div class="mt-2 grid grid-cols-2 gap-x-4">
          <a href="katalog.html" class="py-2 text-[16px] font-medium">Svi proizvodi</a>
          ${CATEGORIES.map((c) => `<a href="katalog.html?kat=${c.id}" class="py-2 text-[16px]">${c.label}</a>`).join('')}
        </div>
        <p class="mt-5 text-[13px] font-medium text-muted">Usluge i firma</p>
        <div class="mt-2 grid grid-cols-2 gap-x-4">
          ${SERVICE_LINKS.map((l) => `<a href="${l.href}" class="py-2 text-[16px]">${l.label}</a>`).join('')}
        </div>
      </div>
    </div>

    <div id="partner-bar" class="hidden border-t border-ink/10 bg-tint"></div>
  </header>`;
}

function footerHTML() {
  const promises = [
    [ICON.crane, 'Istovar kranom na etažu', 'Vlastiti kamioni sa dizalicom za cijelu regiju Banje Luke.'],
    [ICON.stock, 'Zalihe uživo', 'Stanje skladišta čitamo iz Pantheona, ne iz cjenovnika.'],
    [ICON.doc, 'Atesti uz robu', 'CE deklaracije i protivpožarni atesti za tehnički prijem.'],
    [ICON.card, 'Plaćanje do 90 dana', 'Za ugovorne partnere, uz mjenicu ili bankarsku garanciju.'],
  ];
  const col = (title, links) => `
    <div class="lg:col-span-2">
      <p class="text-[14px] font-semibold text-surface">${title}</p>
      <ul class="mt-4 space-y-2.5 text-[14px] text-surface/65">${links.map(([href, label]) => `<li><a href="${href}" class="link-line hover:text-surface">${label}</a></li>`).join('')}</ul>
    </div>`;

  return `
  <section class="border-t border-ink/10 bg-surface">
    <div class="mx-auto grid max-w-page gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
      ${promises.map(([icon, title, text]) => `
        <div class="flex gap-4">
          <span class="mt-0.5 shrink-0 text-steel">${icon}</span>
          <div><p class="text-[15px] font-semibold">${title}</p><p class="mt-1 text-[14px] leading-relaxed text-muted">${text}</p></div>
        </div>`).join('')}
    </div>
  </section>

  <footer class="bg-ink text-surface">
    <div class="mx-auto max-w-page px-5 pt-14 lg:px-10">
      <div class="grid gap-10 border-b border-surface/10 pb-12 sm:grid-cols-2 lg:grid-cols-12">
        <div class="lg:col-span-3">
          <p class="font-serif text-[24px] font-semibold tracking-[-0.01em]">Grand Company</p>
          <p class="mt-3 max-w-sm text-[14px] leading-relaxed text-surface/65">Veleprodaja i maloprodaja građevinskog materijala u Banjoj Luci od ${COMPANY.founded}. godine. Ovlašćeni distributer Knauf sistema suhe gradnje.</p>
          <address class="mt-5 text-[14px] not-italic leading-relaxed text-surface/65">Ul. Nenada Kostića 151<br />78000 Banja Luka, Zalužani</address>
        </div>
        ${col('Katalog', [['katalog.html', 'Svi proizvodi'], ...CATEGORIES.map((c) => [`katalog.html?kat=${c.id}`, c.label])])}
        ${col('Usluge', [['kalkulator.html', 'Kalkulator utroška'], ['dostava.html', 'Dostava i kran'], ['partneri.html', 'Partnerski program'], ['korpa.html', 'Korpa i narudžba']])}
        ${col('Firma', [['o-nama.html', 'O nama'], ['kontakt.html', 'Kontakt'], ['kontakt.html#poruka', 'Pošaljite upit'], ['zasluge.html', 'Zasluge za fotografije']])}
        <div class="lg:col-span-3">
          <p class="text-[14px] font-semibold text-surface">Pozovite nas</p>
          <ul class="mt-4 space-y-2.5 text-[14px] text-surface/65">
            <li>Veleprodaja<br /><a href="${COMPANY.phoneLandlineHref}" class="link-line tnum text-surface">${COMPANY.phoneLandline}</a></li>
            <li>Viber i WhatsApp<br /><a href="${COMPANY.phoneMobileHref}" class="link-line tnum text-surface">${COMPANY.phoneMobile}</a></li>
            <li><a href="mailto:${COMPANY.emailSales}" class="link-line text-surface">${COMPANY.emailSales}</a></li>
          </ul>
        </div>
      </div>
      <div class="flex flex-wrap justify-between gap-x-8 gap-y-2 py-6 text-[12px] text-surface/45">
        <span>© 2026 ${COMPANY.name}</span>
        <span class="tnum">JIB ${COMPANY.jib}, PIB ${COMPANY.pib}, MBS ${COMPANY.mbs}</span>
        <span>Demonstracioni portal</span>
      </div>
    </div>
  </footer>`;
}

function shellHTML() {
  return `
  <div id="cart-overlay" class="fixed inset-0 z-40 hidden bg-ink/40"></div>
  <aside id="cart-drawer" aria-label="Korpa" class="drawer fixed right-0 top-0 z-50 flex h-full w-full max-w-md translate-x-full flex-col border-l border-ink/10 bg-surface shadow-2xl">
    <div class="flex items-center justify-between border-b border-ink/10 px-6 py-4">
      <p class="font-serif text-[24px] font-semibold leading-none">Korpa</p>
      <button id="btn-close-cart" class="flex h-9 w-9 items-center justify-center border border-ink/15 transition-colors hover:border-ink" aria-label="Zatvori korpu">${ICON.close}</button>
    </div>
    <div id="drawer-body" class="flex-1 overflow-y-auto px-6"></div>
    <div id="drawer-footer" class="border-t border-ink/10 bg-canvas px-6 py-5"></div>
  </aside>
  <div id="modal-root"></div>
  <div id="toast" aria-live="polite" class="pointer-events-none fixed bottom-6 left-1/2 z-[60] w-max max-w-[92vw] -translate-x-1/2"></div>`;
}

function replacePlaceholder(id, html) {
  const el = $(id);
  if (!el) return;
  el.insertAdjacentHTML('beforebegin', html);
  el.remove();
}

// ---------------------------------------------------------------------
// Live chrome: price mode, account, cart badge, partner bar, drawer
// ---------------------------------------------------------------------
function renderChrome() {
  const p = partner();
  const on = 'px-2.5 py-1 text-[12px] font-semibold bg-ink text-surface';
  const off = 'px-2.5 py-1 text-[12px] font-medium text-muted hover:text-ink';
  $('mode-b2c').className = p ? off : on;
  $('mode-b2b').className = p ? on : off;
  $('account-label').textContent = p ? p.name : 'Prijava za partnere';

  const t = cartTotals();
  const count = $('cart-count');
  count.textContent = t.items.length;
  count.classList.toggle('hidden', !t.items.length);
  count.classList.toggle('flex', t.items.length > 0);
  $('cart-total').textContent = t.items.length ? KM(t.subtotal) : 'Korpa';

  renderPartnerBar(t);
  renderDrawer(t);
}

function renderPartnerBar(t) {
  const bar = $('partner-bar');
  const p = partner();
  bar.classList.toggle('hidden', !p);
  if (!p) {
    bar.innerHTML = '';
    return;
  }
  const used = creditUsed(p) + t.subtotal;
  const usedPct = Math.min(100, (used / p.creditLimit) * 100);
  const free = Math.max(0, p.creditLimit - used);

  bar.innerHTML = `
    <div class="mx-auto flex max-w-page flex-wrap items-center gap-x-8 gap-y-2 px-5 py-2.5 text-[13px] lg:px-10">
      <a href="partneri.html#nalog" class="font-semibold hover:text-steel">${esc(p.name)}</a>
      <span class="text-muted">Rabat <strong class="font-semibold text-steel">−${pct(p.discount)}</strong></span>
      <span class="text-muted">Valuta ${p.paymentDays} dana</span>
      <div class="flex min-w-[260px] max-w-md flex-1 items-center gap-3">
        <span class="text-muted">Kreditni limit</span>
        <div class="h-1.5 flex-1 overflow-hidden bg-ink/10" role="meter" aria-valuemin="0" aria-valuemax="${p.creditLimit}" aria-valuenow="${Math.round(used)}" aria-label="Iskorišten kreditni limit">
          <div class="h-full ${usedPct < 85 ? 'bg-steel' : 'bg-brick'}" style="width:${usedPct}%"></div>
        </div>
        <span class="tnum whitespace-nowrap text-muted">slobodno <strong class="font-semibold text-ink">${KM(free)}</strong></span>
      </div>
      <span class="tnum text-muted">Pantheon, ${syncTime()}</span>
    </div>`;
}

function cartStepper(p, qty) {
  const btn = 'flex h-8 w-8 items-center justify-center border border-ink/20 transition-colors hover:border-ink';
  return `
    <div class="flex items-center">
      <button data-dec="${p.sku}" class="${btn}" aria-label="Smanji količinu">−</button>
      <input data-cart-qty="${p.sku}" type="number" min="0" step="any" value="${qty}" aria-label="Količina za ${esc(p.name)}"
             class="tnum h-8 w-16 border-x-0 border-y border-ink/20 bg-surface px-1 text-center text-[14px] focus:border-steel focus:ring-0" />
      <button data-inc="${p.sku}" class="${btn}" aria-label="Povećaj količinu">+</button>
      <span class="ml-2 text-[13px] text-muted">${p.unit}</span>
    </div>`;
}

function renderDrawer(t) {
  if (!t.items.length) {
    $('drawer-body').innerHTML = `
      <div class="py-16 text-center">
        <p class="text-[18px] font-semibold">Korpa je prazna</p>
        <p class="mt-2 text-[14px] text-muted">Dodajte artikle iz kataloga ili prenesite specifikaciju iz kalkulatora.</p>
        <a href="katalog.html" class="${BTN_PRIMARY} mt-6 px-6 py-3">Otvori katalog</a>
      </div>`;
    $('drawer-footer').innerHTML = '';
    $('drawer-footer').classList.add('hidden');
    return;
  }
  $('drawer-footer').classList.remove('hidden');

  $('drawer-body').innerHTML = t.items.map(({ product: p, qty }) => `
    <div class="flex gap-4 border-b border-ink/10 py-4">
      <a href="${productUrl(p)}" class="block h-20 w-24 shrink-0 bg-well p-1" tabindex="-1" aria-hidden="true">${productArt(p)}</a>
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <a href="${productUrl(p)}" class="text-[14px] font-medium leading-snug hover:text-steel">${esc(p.name)}</a>
          <button data-remove="${p.sku}" class="shrink-0 text-muted/70 hover:text-brick" aria-label="Ukloni ${esc(p.name)}">${ICON.close}</button>
        </div>
        <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
          ${cartStepper(p, qty)}
          <span class="tnum text-[15px] font-semibold">${KM(priceOf(p) * qty)}</span>
        </div>
      </div>
    </div>`).join('');

  $('drawer-footer').innerHTML = `
    ${t.rebate > 0 ? `<div class="flex justify-between text-[14px] text-steel"><span>Partnerski rabat</span><span class="tnum">−${KM(t.rebate)}</span></div>` : ''}
    <div class="mt-1 flex items-baseline justify-between"><span class="text-[15px]">Roba sa PDV-om</span><span class="tnum text-[22px] font-semibold">${KM(t.subtotal)}</span></div>
    <p class="mt-1 text-[13px] text-muted">Težina oko <span class="tnum">${fmt0.format(t.weightKg)}</span> kg. Dostavu i istovar kranom birate u korpi.</p>
    <a href="korpa.html" class="${BTN_PRIMARY} mt-4 w-full py-3.5">Korpa i narudžba</a>
    <button data-close-drawer class="mt-2 w-full py-2 text-[14px] text-muted hover:text-ink">Nastavi kupovinu</button>`;
}

// ---------------------------------------------------------------------
// Drawer, modals, toast, mobile menu
// ---------------------------------------------------------------------
const drawerOpen = () => !$('cart-drawer').classList.contains('translate-x-full');
const syncScrollLock = () => document.body.classList.toggle('no-scroll', drawerOpen() || !!$('modal-root').innerHTML);

function openCart() {
  $('cart-drawer').classList.remove('translate-x-full');
  $('cart-overlay').classList.remove('hidden');
  syncScrollLock();
}

function closeCart() {
  $('cart-drawer').classList.add('translate-x-full');
  $('cart-overlay').classList.add('hidden');
  syncScrollLock();
}

function openModal(innerHtml, { wide = false } = {}) {
  $('modal-root').innerHTML = `
    <div id="modal-overlay" class="fixed inset-0 z-[55] flex items-center justify-center bg-ink/50 p-4">
      <div role="dialog" aria-modal="true" class="max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} overflow-y-auto bg-surface text-ink shadow-2xl">
        ${innerHtml}
      </div>
    </div>`;
  syncScrollLock();
  $('modal-root').querySelectorAll('[data-close-modal]').forEach((b) => b.addEventListener('click', closeModal));
  $('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
  $('modal-root').querySelector('input, select, button')?.focus();
}

function closeModal() {
  $('modal-root').innerHTML = '';
  syncScrollLock();
}

function toast(message, action) {
  const el = document.createElement('div');
  el.className = 'pointer-events-auto mb-2 flex items-center gap-5 bg-ink px-5 py-3 text-[14px] text-surface shadow-lg transition-opacity duration-500';
  const text = document.createElement('span');
  text.textContent = message;
  el.append(text);
  if (action) {
    const btn = document.createElement('button');
    btn.className = 'whitespace-nowrap font-semibold underline underline-offset-4 hover:text-tint';
    btn.textContent = action.label;
    btn.addEventListener('click', () => {
      action.onClick();
      el.remove();
    });
    el.append(btn);
  }
  $('toast').append(el);
  setTimeout(() => (el.style.opacity = '0'), 3200);
  setTimeout(() => el.remove(), 3800);
}

function toggleMenu() {
  const menu = $('mobile-menu');
  const open = menu.classList.toggle('hidden') === false;
  $('btn-menu').setAttribute('aria-expanded', String(open));
}

// ---------------------------------------------------------------------
// Partner login / account
// ---------------------------------------------------------------------
function openLoginModal() {
  openModal(`
    <div class="p-7">
      <h2 class="font-serif text-[26px] leading-tight">Prijava za partnere</h2>
      <p class="mt-2 text-[14px] text-muted">Unesite adresu e-pošte i lozinku iz ugovora o partnerstvu.</p>
      <form id="login-form" class="mt-6 space-y-4">
        <label class="block">
          <span class="${LABEL}">Adresa e-pošte</span>
          <input id="login-email" type="email" required autocomplete="username" value="nabavka@lazarevo.demo" class="${FIELD}" />
        </label>
        <label class="block">
          <span class="${LABEL}">Lozinka</span>
          <input id="login-password" type="password" required autocomplete="current-password" value="lazarevo2026" class="${FIELD}" />
        </label>
        <p id="login-error" class="hidden border-l-2 border-brick pl-3 text-[14px] text-brick" role="alert"></p>
        <div class="flex gap-3 pt-2">
          <button type="submit" id="login-submit" class="${BTN_PRIMARY} flex-1 py-3">Prijavi se</button>
          <button type="button" data-close-modal class="${BTN_GHOST} px-6 py-3">Otkaži</button>
        </div>
      </form>
      <div class="mt-6 border-t border-ink/10 pt-4">
        <p class="text-[13px] text-muted">Demo nalozi, kliknite red da popunite podatke</p>
        <ul class="mt-2 divide-y divide-ink/10">
          ${PARTNERS.map((p) => `
            <li><button type="button" data-demo="${p.id}" class="flex w-full flex-wrap items-baseline justify-between gap-x-3 py-2 text-left text-[13px] hover:text-steel">
              <span class="font-medium underline decoration-ink/25 underline-offset-4">${esc(p.email)}</span>
              <span class="text-muted">${esc(p.tier)}</span>
            </button></li>`).join('')}
        </ul>
      </div>
    </div>`);

  $('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    submitLogin($('login-email').value, $('login-password').value);
  });

  $('modal-root').querySelectorAll('[data-demo]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const p = PARTNERS.find((x) => x.id === btn.dataset.demo);
      $('login-email').value = p.email;
      $('login-password').value = p.password;
      $('login-error').classList.add('hidden');
      $('login-submit').focus();
    })
  );
}

async function submitLogin(email, password) {
  const err = $('login-error');
  const btn = $('login-submit');
  err.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Prijava…';

  const res = await Pantheon.login(email, password);
  if (!res.ok) {
    err.textContent = res.message;
    err.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Prijavi se';
    const field = res.field === 'password' ? $('login-password') : $('login-email');
    field.focus();
    return;
  }
  closeModal();
  toast(`Prijavljeni ste kao ${res.partner.name}. Cijene uključuju rabat −${pct(res.partner.discount)}.`);
}

function openAccountModal() {
  const p = partner();
  const t = cartTotals();
  const row = (label, value) => `<div class="border-t border-ink/10 pt-3"><dt class="text-[13px] text-muted">${label}</dt><dd class="tnum mt-1 text-[20px] font-semibold leading-none">${value}</dd></div>`;
  openModal(`
    <div class="p-7">
      <p class="text-[13px] text-muted">${esc(p.tier)}</p>
      <h2 class="mt-1 font-serif text-[26px] leading-tight">${esc(p.name)}</h2>
      <dl class="mt-6 grid grid-cols-2 gap-5">
        ${row('Ugovoreni rabat', `−${pct(p.discount)}`)}
        ${row('Valuta plaćanja', `${p.paymentDays} dana`)}
        ${row('Otvorene fakture', KM(creditUsed(p)))}
        ${row('Slobodan limit sa korpom', KM(Math.max(0, p.creditLimit - creditUsed(p) - t.subtotal)))}
      </dl>
      <div class="mt-7 flex gap-3">
        <a href="partneri.html#nalog" class="${BTN_PRIMARY} flex-1 py-3">Pregled naloga</a>
        <button id="btn-logout" class="${BTN_GHOST} px-6 py-3">Odjava</button>
      </div>
    </div>`);
  $('btn-logout').addEventListener('click', () => {
    closeModal();
    logout();
  });
}

function logout() {
  setPartner(null);
  toast('Odjavljeni ste. Prikazane su maloprodajne cijene.');
}

// ---------------------------------------------------------------------
// Product card (catalogue, home, related products)
// ---------------------------------------------------------------------
function stockBadge(p) {
  const [color, label] = { high: ['#4E7A55', 'Na stanju'], mid: ['#B7862C', 'Ograničeno'], low: ['#A8432F', 'Malo na stanju'] }[stockLevel(p)];
  return `<span class="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-muted"><span class="h-2 w-2 rounded-full" style="background:${color}" aria-hidden="true"></span>${label}</span>`;
}

function productCard(p) {
  const url = productUrl(p);
  const b2b = !!partner();
  const photo = PRODUCT_PHOTOS[p.sku];
  return `
  <article data-product="${p.sku}" class="group flex flex-col border border-ink/10 bg-surface transition-shadow hover:shadow-[0_16px_40px_-28px_rgba(27,30,34,0.45)]">
    <a href="${url}" class="relative block bg-well" tabindex="-1" aria-hidden="true">
      <div class="aspect-square ${photo ? '' : 'p-3'}">${productArt(p)}</div>
      ${b2b ? `<span class="absolute left-3 top-3 bg-steel px-2 py-0.5 text-[12px] font-semibold text-surface">−${pct(discount())}</span>` : ''}
    </a>
    <div class="flex flex-1 flex-col border-t border-ink/10 p-4 sm:p-5">
      <div class="flex items-center justify-between gap-2 text-[12px] text-muted">
        <span class="truncate font-medium text-ink/70">${esc(p.brand)}</span>
        <span class="tnum shrink-0">${p.sku}</span>
      </div>
      <h3 class="mt-2 text-[15px] font-semibold leading-snug sm:text-[16px]"><a href="${url}" class="hover:text-steel">${esc(p.name)}</a></h3>
      <p class="mt-1.5 text-[13px] leading-snug text-muted">${esc(p.spec)}</p>
      <div class="mt-auto pt-4 sm:pt-5">
        <div class="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <div>
            ${b2b ? `<p class="tnum text-[12px] text-muted line-through">${KM(p.price)}</p>` : ''}
            <p class="tnum whitespace-nowrap text-[19px] font-semibold leading-none sm:text-[22px] ${b2b ? 'text-steel' : ''}">${KM(priceOf(p))}<span class="ml-1 text-[12px] font-normal text-muted">/ ${p.unit}</span></p>
          </div>
          ${stockBadge(p)}
        </div>
        <div class="mt-3 flex">
          <label class="shrink-0"><span class="sr-only">Količina u ${p.unit}</span>
            <input data-qty type="number" min="0" step="any" value="${defaultQty(p)}"
                   class="tnum h-10 w-12 border border-r-0 border-ink/20 bg-surface px-1 text-center text-[14px] focus:border-steel focus:ring-0 sm:w-16" />
          </label>
          <button data-add="${p.sku}" class="h-10 flex-1 whitespace-nowrap bg-ink px-2 text-[13px] font-semibold text-surface transition-colors hover:bg-steel sm:px-3 sm:text-[14px]">U korpu</button>
        </div>
      </div>
    </div>
  </article>`;
}

// ---------------------------------------------------------------------
// Page bootstrap
// ---------------------------------------------------------------------
function bindGlobalEvents() {
  $('mode-b2c').addEventListener('click', () => partner() && logout());
  $('mode-b2b').addEventListener('click', () => !partner() && openLoginModal());
  $('btn-account').addEventListener('click', () => (partner() ? openAccountModal() : openLoginModal()));
  $('btn-cart').addEventListener('click', openCart);
  $('btn-close-cart').addEventListener('click', closeCart);
  $('cart-overlay').addEventListener('click', closeCart);
  $('btn-menu').addEventListener('click', toggleMenu);

  document.addEventListener('click', (e) => {
    const target = e.target;

    const addBtn = target.closest('[data-add]');
    if (addBtn) {
      const p = bySku[addBtn.dataset.add];
      const input = addBtn.closest('[data-product]')?.querySelector('[data-qty]');
      const qty = parseFloat(input?.value) || defaultQty(p);
      addToCart(p.sku, qty);
      toast(`${p.name} je u korpi.`, { label: 'Otvori korpu', onClick: openCart });
      return;
    }

    const inc = target.closest('[data-inc]');
    const dec = target.closest('[data-dec]');
    const stepBtn = inc || dec;
    if (stepBtn) {
      const p = bySku[stepBtn.dataset.inc || stepBtn.dataset.dec];
      const step = defaultQty(p) * (inc ? 1 : -1);
      setCartQty(p.sku, (state.cart[p.sku] || 0) + step);
      return;
    }

    const remove = target.closest('[data-remove]');
    if (remove) return setCartQty(remove.dataset.remove, 0);
    if (target.closest('[data-close-drawer]')) return closeCart();
    if (target.closest('[data-login]')) {
      e.preventDefault();
      partner() ? openAccountModal() : openLoginModal();
    }
  });

  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-cart-qty]');
    if (input) setCartQty(input.dataset.cartQty, parseFloat(input.value) || 0);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeModal();
    closeCart();
  });
}

function initPage(pageInit) {
  document.addEventListener('DOMContentLoaded', () => {
    loadState();
    replacePlaceholder('site-header', headerHTML());
    replacePlaceholder('site-footer', footerHTML());
    document.body.insertAdjacentHTML('beforeend', shellHTML());
    bindGlobalEvents();
    onChange(renderChrome);
    renderChrome();
    if (pageInit) pageInit();
  });

  // Another tab changed the cart or logged in — re-read and re-render
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    loadState();
    notify();
  });
}
