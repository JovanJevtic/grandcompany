// =====================================================================
// GRAND COMPANY — shared layout and UI components
// Header, footer, cart drawer, modals and product cards are rendered
// here once, so every page stays identical without a build step.
// =====================================================================

'use strict';

const FIELD = 'mt-1 w-full border border-espresso/25 bg-paper px-3 py-2.5 text-[15px] text-espresso placeholder-umber/60 focus:border-espresso focus:ring-0';
const LABEL = 'text-[13px] text-umber';
const BTN_PRIMARY = 'inline-flex items-center justify-center gap-2 bg-espresso text-[15px] font-medium text-cream transition-colors hover:bg-oxide';
const BTN_GHOST = 'inline-flex items-center justify-center gap-2 border border-espresso/40 text-[15px] font-medium text-espresso transition-colors hover:bg-espresso hover:text-cream';

const ICON = {
  search: '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  cart: '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6"/><circle cx="9" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></svg>',
  user: '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  crane: '<svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M5 21V4l13 2M5 4h15M17 6v5"/><path d="M15 11h4v3h-4zM2 21h7"/></svg>',
  stock: '<svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>',
  doc: '<svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>',
  card: '<svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="1"/><path d="M3 10h18M7 15h4"/></svg>',
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
    const sep = i ? '<span aria-hidden="true" class="text-umber/50">/</span>' : '';
    const node = last || !it.href
      ? `<span${last ? ' aria-current="page" class="text-espresso"' : ''}>${esc(it.label)}</span>`
      : `<a href="${it.href}" class="link-line hover:text-espresso">${esc(it.label)}</a>`;
    return `<li class="flex items-center gap-2">${sep}${node}</li>`;
  });
  return `<nav aria-label="Putanja" class="text-[13px] text-umber"><ol class="flex flex-wrap items-center gap-x-2 gap-y-1">${parts.join('')}</ol></nav>`;
}

// ---------------------------------------------------------------------
// Header / footer / shell markup
// ---------------------------------------------------------------------
function headerHTML() {
  const page = currentPage();
  const params = new URLSearchParams(location.search);
  const q = page === 'katalog' ? params.get('q') || '' : '';


  const serviceLinks = SERVICE_LINKS.map(
    (l) => `<a href="${l.href}" ${page === l.page ? 'aria-current="page"' : ''} class="nav-link">${l.label}</a>`
  ).join('');

  const searchForm = (id, extra) => `
    <form action="katalog.html" role="search" class="flex ${extra}">
      <label for="${id}" class="sr-only">Pretraga kataloga</label>
      <input id="${id}" name="q" type="search" value="${esc(q)}" placeholder="Pretražite ploče, profile, vunu, ljepila…"
             class="w-full min-w-0 border border-r-0 border-espresso/25 bg-paper px-4 py-2.5 text-[15px] placeholder-umber/70 focus:border-espresso focus:ring-0" />
      <button class="flex items-center gap-2 bg-espresso px-4 text-[14px] font-medium text-cream hover:bg-oxide">${ICON.search}<span class="hidden xl:inline">Traži</span></button>
    </form>`;

  return `
  <a href="#main-content" class="skip-content">Preskoči na sadržaj</a>
  <div class="utility-bar">
    <div class="site-container utility-inner">
      <span>Građevinski materijali. Pouzdan partner od 2012.</span>
      <a href="${COMPANY.phoneLandlineHref}" class="utility-phone">${COMPANY.phoneLandline}</a>
      <div class="price-mode" role="group" aria-label="Cijene">
        <button id="mode-b2c">Maloprodaja</button><button id="mode-b2b">Za partnere</button>
      </div>
    </div>
  </div>
  <header class="site-header">
    <div class="site-container header-main">
      <button id="btn-menu" class="menu-toggle" aria-label="Meni" aria-expanded="false" aria-controls="mobile-menu">${ICON.menu}</button>
      <a href="index.html" class="brand" aria-label="Grand Company — početna">
        <span class="brand-symbol" aria-hidden="true">G<span>↗</span></span>
        <span class="brand-name">GRAND<span>COMPANY</span></span>
      </a>
      ${searchForm('hdr-q', 'header-search')}
      <div class="header-actions">
        <button id="btn-account" class="account-button">${ICON.user}<span id="account-label">Prijava za partnere</span></button>
        <button id="btn-cart" class="cart-button" aria-label="Otvori korpu">${ICON.cart}<span id="cart-total">Korpa</span><span id="cart-count" class="hidden">0</span></button>
      </div>
    </div>
    <nav aria-label="Glavna navigacija" class="desktop-nav">
      <div class="site-container nav-inner">
        <a href="katalog.html" class="catalog-link" ${page === 'katalog' ? 'aria-current="page"' : ''}>${ICON.menu} Katalog materijala ${ICON.arrow}</a>
        <div class="nav-services">${serviceLinks}</div>
        <span class="nav-location"><span></span>Banja Luka · Zalužani</span>
      </div>
    </nav>
    <div id="mobile-menu" class="hidden mobile-menu">
      <div class="site-container">
        ${searchForm('mob-q', 'mobile-search')}
        <p class="eyebrow">Materijali za vaš projekat</p>
        <a href="katalog.html" class="mobile-catalog-link">Cijeli katalog ${ICON.arrow}</a>
        <div class="mobile-menu-grid">${CATEGORIES.map(c=>`<a href="katalog.html?kat=${c.id}">${c.label}</a>`).join('')}</div>
        <div class="mobile-service-links">${SERVICE_LINKS.map(l=>`<a href="${l.href}">${l.label}</a>`).join('')}</div>
      </div>
    </div>
    <div id="partner-bar" class="hidden border-t border-espresso/10 bg-bone"></div>
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
      <p class="font-display text-[20px]">${title}</p>
      <ul class="mt-3 space-y-2 text-[14px] text-cream/70">${links.map(([href, label]) => `<li><a href="${href}" class="link-line hover:text-cream">${label}</a></li>`).join('')}</ul>
    </div>`;

  return `
  <section class="service-promises border-t border-espresso/15 bg-bone">
    <div class="mx-auto grid max-w-[1440px] gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-12">
      ${promises.map(([icon, title, text]) => `
        <div class="flex gap-4">
          <span class="mt-0.5 shrink-0 text-oxide">${icon}</span>
          <div><p class="font-display text-[21px] leading-tight">${title}</p><p class="mt-1 text-[14px] leading-relaxed text-umber">${text}</p></div>
        </div>`).join('')}
    </div>
  </section>

  <footer class="site-footer bg-espresso text-cream">
    <div class="footer-cta site-container"><div><span class="eyebrow">OD PLANA DO POSLJEDNJE PALETE</span><h2>Gradite. Mi smo uz vas.</h2></div><a href="kontakt.html#poruka" class="button button-yellow">Razgovarajmo o projektu ↗</a></div>
    <div class="mx-auto max-w-[1440px] px-5 pt-14 lg:px-12">
      <div class="grid gap-10 border-b border-cream/15 pb-12 sm:grid-cols-2 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <p class="footer-brand">GRAND COMPANY</p>
          <p class="mt-4 max-w-sm text-[14px] leading-relaxed text-cream/70">Veleprodaja i maloprodaja građevinskog materijala u Banjoj Luci od ${COMPANY.founded}. godine. Ovlašćeni distributer Knauf sistema suhe gradnje.</p>
          <p class="mt-5 text-[14px] leading-relaxed text-cream/70">Ul. Nenada Kostića 151<br />78000 Banja Luka, Zalužani</p>
        </div>
        ${col('Katalog', [['katalog.html', 'Svi proizvodi'], ...CATEGORIES.map((c) => [`katalog.html?kat=${c.id}`, c.label])])}
        ${col('Usluge', [['kalkulator.html', 'Kalkulator utroška'], ['dostava.html', 'Dostava i kran'], ['partneri.html', 'Partnerski program'], ['korpa.html', 'Korpa i narudžba']])}
        ${col('Firma', [['o-nama.html', 'O nama'], ['kontakt.html', 'Kontakt'], ['kontakt.html#poruka', 'Pošaljite upit']])}
        <div class="lg:col-span-2">
          <p class="font-display text-[20px]">Pozovite nas</p>
          <ul class="mt-3 space-y-2 text-[14px] text-cream/70">
            <li>Veleprodaja <a href="${COMPANY.phoneLandlineHref}" class="link-line text-cream">${COMPANY.phoneLandline}</a></li>
            <li>Viber i WhatsApp <a href="${COMPANY.phoneMobileHref}" class="link-line text-cream">${COMPANY.phoneMobile}</a></li>
            <li><a href="mailto:${COMPANY.emailSales}" class="link-line text-cream">${COMPANY.emailSales}</a></li>
          </ul>
        </div>
      </div>
      <div class="flex flex-wrap justify-between gap-x-8 gap-y-2 py-5 text-[12px] text-cream/45">
        <span>© 2026 ${COMPANY.name}</span>
        <span>JIB ${COMPANY.jib}, PIB ${COMPANY.pib}, MBS ${COMPANY.mbs}</span>
        <span>Demonstracioni portal</span>
      </div>
      <div aria-hidden="true" class="select-none overflow-hidden">
        <div class="footer-wordmark">GRAND COMPANY</div>
      </div>
    </div>
  </footer>`;
}

function shellHTML() {
  return `
  <div id="cart-overlay" class="fixed inset-0 z-40 hidden bg-espresso/40 backdrop-blur-[2px]"></div>
  <aside id="cart-drawer" aria-label="Korpa" class="drawer fixed right-0 top-0 z-50 flex h-full w-full max-w-md translate-x-full flex-col border-l border-espresso/25 bg-cream">
    <div class="flex items-center justify-between border-b border-espresso/15 px-6 py-4">
      <p class="font-display text-[30px] leading-none">Korpa</p>
      <button id="btn-close-cart" class="flex h-9 w-9 items-center justify-center border border-espresso/20 transition-colors hover:bg-espresso hover:text-cream" aria-label="Zatvori korpu">${ICON.close}</button>
    </div>
    <div id="drawer-body" class="flex-1 overflow-y-auto px-6"></div>
    <div id="drawer-footer" class="border-t border-espresso/15 px-6 py-5"></div>
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
  const on = 'px-2.5 py-1 bg-cream text-espresso';
  const off = 'px-2.5 py-1 text-cream/70 hover:text-cream';
  $('mode-b2c').className = p ? off : on;
  $('mode-b2c').setAttribute('aria-pressed', String(!p));
  $('mode-b2b').className = p ? on : off;
  $('mode-b2b').setAttribute('aria-pressed', String(!!p));
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
  const used = p.creditUsed + t.subtotal;
  const usedPct = Math.min(100, (used / p.creditLimit) * 100);
  const free = Math.max(0, p.creditLimit - used);

  bar.innerHTML = `
    <div class="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-8 gap-y-2 px-5 py-2.5 text-[13px] lg:px-12">
      <a href="partneri.html#nalog" class="font-medium hover:text-oxide">${esc(p.name)}</a>
      <span class="text-umber">Rabat <strong class="font-medium text-oxide">−${pct(p.discount)}</strong></span>
      <span class="text-umber">Valuta ${p.paymentDays} dana</span>
      <div class="flex min-w-[260px] max-w-md flex-1 items-center gap-3">
        <span class="text-umber">Kreditni limit</span>
        <div class="h-1.5 flex-1 overflow-hidden bg-espresso/15" role="meter" aria-valuemin="0" aria-valuemax="${p.creditLimit}" aria-valuenow="${Math.round(used)}" aria-label="Iskorišten kreditni limit">
          <div class="h-full ${usedPct < 85 ? 'bg-sage' : 'bg-oxide'}" style="width:${usedPct}%"></div>
        </div>
        <span class="whitespace-nowrap text-umber">slobodno <strong class="font-medium text-espresso">${KM(free)}</strong></span>
      </div>
      <span class="text-umber">Pantheon, ${syncTime()}</span>
    </div>`;
}

function cartStepper(p, qty) {
  const btn = 'flex h-8 w-8 items-center justify-center border border-espresso/25 transition-colors hover:bg-espresso hover:text-cream';
  return `
    <div class="flex items-center">
      <button data-dec="${p.sku}" class="${btn}" aria-label="Smanji količinu">−</button>
      <input data-cart-qty="${p.sku}" type="number" min="0" step="any" value="${qty}" aria-label="Količina za ${esc(p.name)}"
             class="h-8 w-16 border-x-0 border-y border-espresso/25 bg-paper px-1 text-center text-[14px] focus:border-espresso focus:ring-0" />
      <button data-inc="${p.sku}" class="${btn}" aria-label="Povećaj količinu">+</button>
      <span class="ml-2 text-[13px] text-umber">${p.unit}</span>
    </div>`;
}

function renderDrawer(t) {
  if (!t.items.length) {
    $('drawer-body').innerHTML = `
      <div class="py-16 text-center">
        <p class="font-display text-[26px]">Korpa je prazna.</p>
        <p class="mt-3 text-[14px] text-umber">Dodajte artikle iz kataloga ili prenesite specifikaciju iz kalkulatora.</p>
        <a href="katalog.html" class="${BTN_PRIMARY} mt-6 px-6 py-3">Otvori katalog</a>
      </div>`;
    $('drawer-footer').innerHTML = '';
    return;
  }

  $('drawer-body').innerHTML = t.items.map(({ product: p, qty }) => `
    <div class="flex gap-4 border-b border-espresso/10 py-4">
      <a href="${productUrl(p)}" class="block h-20 w-24 shrink-0 bg-bone p-1" tabindex="-1" aria-hidden="true">${productArt(p)}</a>
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <a href="${productUrl(p)}" class="font-display text-[17px] leading-snug hover:text-oxide">${esc(p.name)}</a>
          <button data-remove="${p.sku}" class="shrink-0 text-umber/70 hover:text-oxide" aria-label="Ukloni ${esc(p.name)}">${ICON.close}</button>
        </div>
        <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
          ${cartStepper(p, qty)}
          <span class="font-medium">${KM(priceOf(p) * qty)}</span>
        </div>
      </div>
    </div>`).join('');

  $('drawer-footer').innerHTML = `
    ${t.rebate > 0 ? `<div class="flex justify-between text-[14px] text-oxide"><span>Partnerski rabat</span><span>−${KM(t.rebate)}</span></div>` : ''}
    <div class="mt-1 flex items-baseline justify-between"><span class="text-[15px]">Roba sa PDV-om</span><span class="font-display text-[30px]">${KM(t.subtotal)}</span></div>
    <p class="mt-1 text-[13px] text-umber">Težina oko ${fmt0.format(t.weightKg)} kg. Dostavu i istovar kranom birate u korpi.</p>
    <a href="korpa.html" class="${BTN_PRIMARY} mt-4 w-full py-3.5">Korpa i narudžba</a>
    <button data-close-drawer class="mt-2 w-full py-2 text-[14px] text-umber hover:text-espresso">Nastavi kupovinu</button>`;
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
    <div id="modal-overlay" class="fixed inset-0 z-[55] flex items-center justify-center bg-espresso/45 p-4 backdrop-blur-[2px]">
      <div role="dialog" aria-modal="true" class="max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} overflow-y-auto border border-espresso/30 bg-cream text-espresso shadow-2xl">
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
  el.className = 'pointer-events-auto mb-2 flex items-center gap-5 bg-espresso px-5 py-3 text-[14px] text-cream shadow-lg transition-opacity duration-500';
  const text = document.createElement('span');
  text.textContent = message;
  el.append(text);
  if (action) {
    const btn = document.createElement('button');
    btn.className = 'whitespace-nowrap font-medium underline underline-offset-4 hover:text-bone';
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
  const options = PARTNERS.map((p, i) => `
    <label class="flex cursor-pointer items-start gap-4 border border-espresso/20 bg-paper p-4 transition-colors hover:border-espresso has-[:checked]:border-espresso has-[:checked]:bg-bone">
      <input type="radio" name="login-partner" value="${p.id}" ${i === 2 ? 'checked' : ''} class="mt-1 border-espresso/40 text-oxide focus:ring-oxide" />
      <span>
        <span class="block font-display text-[19px] leading-snug">${esc(p.name)}</span>
        <span class="mt-0.5 block text-[13px] text-umber">${esc(p.tier)}</span>
        <span class="mt-1 block text-[13px] text-umber">Rabat <strong class="font-medium text-oxide">−${pct(p.discount)}</strong>, limit ${KM(p.creditLimit)}, valuta ${p.paymentDays} dana</span>
      </span>
    </label>`).join('');

  openModal(`
    <div class="p-7">
      <h2 class="font-display text-[32px] leading-tight">Prijava za partnere</h2>
      <p class="mt-2 text-[14px] text-umber">Demonstracija: odaberite test nalog. U produkciji se prijava provjerava kroz Pantheon šifarnik kupaca.</p>
      <form id="login-form" class="mt-6 space-y-3">
        ${options}
        <label class="block pt-3">
          <span class="${LABEL}">Lozinka</span>
          <input type="password" value="demo1234" autocomplete="off" class="${FIELD}" />
          <span class="mt-1 block text-[12px] text-umber">U demo režimu prolazi bilo koja lozinka.</span>
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
    closeModal();
    setPartner(chosen.value);
    toast(`Prijavljeni ste kao ${partner().name}. Cijene uključuju rabat −${pct(partner().discount)}.`);
  });
}

function openAccountModal() {
  const p = partner();
  const t = cartTotals();
  const row = (label, value) => `<div class="border-t border-espresso/15 pt-3"><dt class="text-[13px] text-umber">${label}</dt><dd class="mt-1 font-display text-[24px] leading-none">${value}</dd></div>`;
  openModal(`
    <div class="p-7">
      <p class="text-[13px] text-umber">${esc(p.tier)}</p>
      <h2 class="mt-1 font-display text-[32px] leading-tight">${esc(p.name)}</h2>
      <dl class="mt-6 grid grid-cols-2 gap-5">
        ${row('Ugovoreni rabat', `−${pct(p.discount)}`)}
        ${row('Valuta plaćanja', `${p.paymentDays} dana`)}
        ${row('Otvorene fakture', KM(p.creditUsed))}
        ${row('Slobodan limit sa korpom', KM(Math.max(0, p.creditLimit - p.creditUsed - t.subtotal)))}
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
  const [color, label] = { high: ['#5E7F5B', 'Na stanju'], mid: ['#C08A2E', 'Ograničene zalihe'], low: ['#7D2E1D', 'Niske zalihe'] }[stockLevel(p)];
  return `<span class="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-umber"><span class="h-2 w-2 rounded-full" style="background:${color}" aria-hidden="true"></span>${label}</span>`;
}

function productCard(p) {
  const url = productUrl(p);
  const cat = categoryById[p.category];
  const b2b = !!partner();
  return `
  <article data-product="${p.sku}" class="product-card">
    <a href="${url}" class="product-card__image" tabindex="-1" aria-hidden="true">
      ${productArt(p)}
      <span class="product-brand">${esc(p.brand)}</span>
      ${b2b ? `<span class="product-discount">−${pct(discount())}</span>` : ''}
    </a>
    <div class="product-card__body">
      <div class="product-card__meta"><span>${cat.label}</span>${stockBadge(p)}</div>
      <h3><a href="${url}">${esc(p.name)}</a></h3>
      <p class="product-spec">${esc(p.spec)}</p>
      <div class="product-card__buy">
        ${b2b ? `<p class="product-old-price">${KM(p.price)}</p>` : ''}
        <p class="product-price">${KM(priceOf(p))}<span>/ ${p.unit}</span></p>
        <p class="product-tax">Cijena sa PDV-om</p>
        <div class="product-controls">
          <label><span class="sr-only">Količina u ${p.unit} za ${esc(p.name)}</span>
            <input data-qty type="number" min="0" step="any" value="${defaultQty(p)}" />
          </label>
          <button data-add="${p.sku}">${ICON.cart}<span>U korpu</span></button>
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
