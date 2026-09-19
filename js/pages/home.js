// =====================================================================
// Home page — facts, categories, featured products, the yard video,
// the calculator panel, the partner portal preview and delivery zones
// =====================================================================

'use strict';

initPage(() => {
  const EXAMPLE_WALL = { L: 5, H: 2.8, cladding: 'single', plateSku: 'KNF-001', cwSku: 'PRF-075', woolSku: 'ISO-001', fillerSku: 'CHM-001', soundTape: true };
  const DEMO_PARTNER = PARTNERS.find((p) => p.id === 'lazarevo') || PARTNERS[PARTNERS.length - 1];
  const STATUS_TONE = {
    'Isporučena': 'bg-sage/20 text-canvas',
    'U pripremi': 'bg-ochre/25 text-canvas',
    'Potvrđena': 'bg-canvas/15 text-canvas',
    'Primljena': 'bg-canvas/15 text-canvas',
  };

  const inCategory = (id) => PRODUCTS.filter((p) => p.category === id);
  const countLabel = (n) => `${n} ${plural(n, 'artikal', 'artikla', 'artikala')}`;

  // The cover ends in the catalogue instead of a slogan: four categories with
  // their real counts, so the first screen already sells something.
  function renderCoverLinks() {
    $('home-cover-links').innerHTML = CATEGORIES.map((c) => `
      <a href="katalog.html?kat=${c.id}" class="group flex items-baseline gap-3 border-t border-ink/20 py-3 transition-colors hover:border-ink">
        <span class="text-[16px] font-medium group-hover:text-steel">${c.label}</span>
        <span class="tnum ml-auto whitespace-nowrap text-[13px] text-muted">${countLabel(inCategory(c.id).length)} &middot; od ${KM(minPrice(c.id))}</span>
      </a>`).join('');
  }

  // Category tiles show the goods, not a stock photograph of a man in a hard
  // hat: each one carries the drawing of a real article from that category.
  function renderCategories() {
    $('home-categories').innerHTML = CATEGORIES.map((c) => {
      const items = inCategory(c.id);
      const lead = items.find((p) => p.featured) || items[0];
      return `
        <a href="katalog.html?kat=${c.id}" class="group flex flex-col bg-surface">
          <span class="block overflow-hidden bg-well">
            <span class="block aspect-[4/3] p-4 transition-transform duration-[900ms] group-hover:scale-[1.04]">${productArt(lead)}</span>
          </span>
          <span class="flex flex-1 flex-col p-5">
            <span class="text-[17px] font-medium leading-snug group-hover:text-steel">${c.label}</span>
            <span class="mt-1.5 text-[14px] leading-snug text-muted">${esc(c.lead)}</span>
            <span class="tnum mt-auto pt-4 text-[13px] text-muted">${countLabel(items.length)} &middot; od ${KM(minPrice(c.id))}</span>
          </span>
        </a>`;
    }).join('');
  }

  // ------------------------------------------------------------------
  // Articles with filters that actually filter. A filter bar that only
  // looked like one would be exactly the invented UI we are removing.
  // ------------------------------------------------------------------
  const MAX_SHOWN = 8;
  let filterCat = 'sve';
  let inStockOnly = false;

  // Featured articles come first so the default view is the curated mix the
  // counter staff would name, not the first eight rows of the price list.
  const matching = () => PRODUCTS
    .filter((p) => (filterCat === 'sve' || p.category === filterCat) && (!inStockOnly || p.stock > 0))
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  function renderFilters() {
    const chip = (key, label) => `
      <button type="button" data-cat="${key}" aria-pressed="${filterCat === key}" class="chip">${label}</button>`;
    $('home-filters').innerHTML =
      chip('sve', 'Sve') + CATEGORIES.map((c) => chip(c.id, c.label)).join('') +
      `<button type="button" id="home-stock" aria-pressed="${inStockOnly}" class="chip ml-auto">Samo na stanju</button>`;
  }

  function renderFeatured() {
    const found = matching();
    const shown = found.slice(0, MAX_SHOWN);
    $('home-featured').innerHTML = shown.length
      ? shown.map(productCard).join('')
      : '<p class="col-span-full py-10 text-[15px] text-muted">Nema artikala za ovaj izbor.</p>';
    $('home-count').textContent = shown.length
      ? `Prikazano ${shown.length} od ${countLabel(found.length)}`
      : `0 od ${countLabel(PRODUCTS.length)}`;
  }

  function bindFilters() {
    $('home-filters').addEventListener('click', (e) => {
      const catBtn = e.target.closest('[data-cat]');
      const stockBtn = e.target.closest('#home-stock');
      if (catBtn) filterCat = catBtn.dataset.cat;
      else if (stockBtn) inStockOnly = !inStockOnly;
      else return;
      renderFilters();
      renderFeatured();
    });
  }

  function renderPortal() {
    const p = DEMO_PARTNER;
    const invoices = partnerInvoices(p);
    const orders = partnerOrders(p).slice(0, 3);
    const used = openInvoicesTotal(p);
    const usedPct = Math.min(100, (used / p.creditLimit) * 100);
    const openCount = invoices.filter((i) => !i.paid).length;
    const stat = (label, value) => `
      <div class="px-6 py-5">
        <p class="eyebrow text-ink/50">${label}</p>
        <p class="tnum mt-2 text-[19px] font-medium">${value}</p>
      </div>`;

    $('home-portal').innerHTML = `
      <figure class="bg-surface text-ink shadow-[0_60px_120px_-60px_rgba(0,0,0,0.8)]">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-6 py-5">
          <div>
            <p class="eyebrow text-ink/50">Partnerski nalog</p>
            <p class="mt-1.5 text-[17px] font-medium">${esc(p.name)}</p>
          </div>
          <span class="bg-steel px-3 py-1.5 text-[12px] font-medium uppercase tracking-label text-surface">Rabat −${pct(p.discount)}</span>
        </div>
        <div class="grid grid-cols-1 divide-y divide-ink/10 border-b border-ink/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          ${stat('Kreditni limit', KM(p.creditLimit))}
          ${stat(`Otvoreno (${openCount})`, KM(used))}
          ${stat('Slobodno', KM(p.creditLimit - used))}
        </div>
        <div class="border-b border-ink/10 px-6 py-5">
          <div class="h-1.5 overflow-hidden bg-ink/10" aria-hidden="true"><div class="h-full bg-steel" style="width:${usedPct}%"></div></div>
          <p class="tnum mt-3 text-[12px] text-muted">Iskorišteno ${Math.round(usedPct)}% limita, valuta ${p.paymentDays} dana</p>
        </div>
        <div class="px-6 py-5">
          <p class="eyebrow text-ink/50">Posljednje narudžbe</p>
          <table class="mt-3 w-full text-[13px]">
            <tbody class="divide-y divide-ink/10">
              ${orders.map((o) => `
                <tr>
                  <td class="tnum py-3 pr-3 font-medium">${esc(o.no)}</td>
                  <td class="tnum hidden py-3 pr-3 text-muted sm:table-cell">${fmtDate(o.date)}</td>
                  <td class="tnum py-3 pr-3 text-right">${KM(o.total)}</td>
                  <td class="py-3 text-right"><span class="inline-block whitespace-nowrap bg-ink/5 px-2 py-0.5 text-[12px]">${esc(o.status)}</span></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <figcaption class="border-t border-ink/10 bg-canvas px-6 py-3 text-[12px] text-muted">Primjer naloga sa demo podacima</figcaption>
      </figure>`;
  }

  function renderZones() {
    $('home-zones').innerHTML = `
      <thead>
        <tr class="border-b border-ink/25">
          <th class="eyebrow pb-3 pr-4 text-left">Zona</th>
          <th class="eyebrow pb-3 pr-4 text-right">Standardna</th>
          <th class="eyebrow pb-3 text-right">Sa kranom</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-ink/10">
        ${DELIVERY_ZONES.map((z) => `
          <tr>
            <td class="py-4 pr-4">${z.label}</td>
            <td class="tnum py-4 pr-4 text-right text-muted">${KM(z.standard)}</td>
            <td class="tnum py-4 text-right font-medium">${KM(z.kranTransport + z.kranWork)}</td>
          </tr>`).join('')}
      </tbody>`;
  }

  function renderCalcExample() {
    const bom = calcW111(EXAMPLE_WALL);
    const shown = bom.items.slice(0, 5);
    const rest = bom.items.length - shown.length;
    $('home-calc').innerHTML = `
      <div class="flex h-full flex-col px-8 py-12 lg:px-10">
        <div class="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/15 pb-5">
          <p class="eyebrow">Primjer</p>
          <p class="tnum text-[14px] text-muted">Zid 5 × 2,8 m, ${fmt0.format(bom.P)} m², CW 75</p>
        </div>
        <ul class="divide-y divide-ink/10">
          ${shown.map((it) => {
            const p = bySku[it.sku];
            return `<li class="flex items-center gap-4 py-4">
              <span class="block h-12 w-14 shrink-0 bg-well">${productArt(p)}</span>
              <span class="flex-1 text-[14px] leading-snug">${esc(p.name)}</span>
              <span class="tnum whitespace-nowrap text-[13px] text-muted">${it.note}</span>
            </li>`;
          }).join('')}
        </ul>
        <p class="pt-4 text-[13px] text-muted">i još ${rest} ${plural(rest, 'stavka', 'stavke', 'stavki')}: vijci, bandaž traka i zvučna traka</p>
        <div class="mt-auto flex items-baseline justify-between border-t border-ink/15 pt-6">
          <span class="eyebrow">Ukupno sa PDV-om</span>
          <span class="tnum text-[26px] font-medium ${partner() ? 'text-steel' : ''}">${KM(bomTotal(bom))}</span>
        </div>
        <a href="kalkulator.html" class="btn-solid mt-8 w-full">Otvori kalkulator</a>
      </div>`;
  }

  // The full-bleed video is decorative: it only fetches and plays while on
  // screen, and stays a still poster for visitors who ask for less motion.
  function bindYardVideo() {
    const video = $('yard-video');
    if (!video || !('IntersectionObserver' in window)) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          video.preload = 'auto';
          video.play().catch(() => {}); // autoplay can be blocked; poster stays
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.2 });
    io.observe(video);
  }

  renderZones();
  renderPortal();
  bindYardVideo();
  bindFilters();

  const renderPriced = () => {
    renderCoverLinks();
    renderCategories();
    renderFilters();
    renderFeatured();
    renderCalcExample();
  };
  renderPriced();
  onChange(renderPriced);
});
