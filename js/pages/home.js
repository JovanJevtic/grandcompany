// =====================================================================
// Home page — categories, featured products, the yard video, partner
// portal preview, delivery zones and a calculator example
// =====================================================================

'use strict';

initPage(() => {
  const EXAMPLE_WALL = { L: 5, H: 2.8, cladding: 'single', plateSku: 'KNF-001', cwSku: 'PRF-075', woolSku: 'ISO-001', fillerSku: 'CHM-001', soundTape: true };
  const DEMO_PARTNER = PARTNERS.find((p) => p.id === 'lazarevo') || PARTNERS[PARTNERS.length - 1];
  const STATUS_TONE = {
    'Isporučena': 'bg-sage/10 text-[#3B5E41]',
    'U pripremi': 'bg-ochre/15 text-[#7A5A1C]',
    'Potvrđena': 'bg-tint text-steel',
    'Primljena': 'bg-tint text-steel',
  };

  function renderCategories() {
    $('home-categories').innerHTML = CATEGORIES.map((c) => {
      const count = PRODUCTS.filter((p) => p.category === c.id).length;
      return `
        <a href="katalog.html?kat=${c.id}" class="group block">
          <div class="relative aspect-[3/4] overflow-hidden bg-well">
            <img src="${c.app || c.image}" alt="" loading="lazy"
                 class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"></div>
            <div class="absolute inset-x-0 bottom-0 p-6 text-surface">
              <h3 class="font-serif text-[clamp(1.4rem,1.8vw,1.9rem)] leading-tight">${c.label}</h3>
              <p class="mt-2 text-[14px] leading-snug text-surface/80">${c.lead}</p>
            </div>
          </div>
          <p class="mt-4 flex items-baseline justify-between border-t border-ink/15 pt-3 text-[14px]">
            <span class="tnum text-muted">${count} ${plural(count, 'artikal', 'artikla', 'artikala')}</span>
            <span class="tnum font-semibold group-hover:text-steel">od ${KM(minPrice(c.id))}</span>
          </p>
        </a>`;
    }).join('');
  }

  function renderFeatured() {
    $('home-featured').innerHTML = PRODUCTS.filter((p) => p.featured).map(productCard).join('');
  }

  function renderPortal() {
    const p = DEMO_PARTNER;
    const invoices = partnerInvoices(p);
    const orders = partnerOrders(p).slice(0, 3);
    const used = openInvoicesTotal(p);
    const usedPct = Math.min(100, (used / p.creditLimit) * 100);
    const openCount = invoices.filter((i) => !i.paid).length;
    const stat = (label, value, cls = '') => `
      <div class="px-6 py-5">
        <p class="text-[12px] text-muted">${label}</p>
        <p class="tnum mt-1 text-[19px] font-semibold ${cls}">${value}</p>
      </div>`;

    $('home-portal').innerHTML = `
      <figure class="border border-ink/10 bg-surface shadow-[0_50px_100px_-60px_rgba(27,30,34,0.6)]">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-6 py-5">
          <div>
            <p class="text-[12px] text-muted">Partnerski nalog</p>
            <p class="text-[17px] font-semibold">${esc(p.name)}</p>
          </div>
          <span class="bg-tint px-2.5 py-1 text-[12px] font-semibold text-steel">Rabat −${pct(p.discount)}, valuta ${p.paymentDays} dana</span>
        </div>
        <div class="grid grid-cols-1 divide-y divide-ink/10 border-b border-ink/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          ${stat('Kreditni limit', KM(p.creditLimit))}
          ${stat(`Otvorene fakture (${openCount})`, KM(used))}
          ${stat('Slobodno', KM(p.creditLimit - used), 'text-steel')}
        </div>
        <div class="border-b border-ink/10 px-6 py-5">
          <div class="h-2 overflow-hidden bg-ink/10" aria-hidden="true"><div class="h-full bg-steel" style="width:${usedPct}%"></div></div>
          <p class="tnum mt-2 text-[12px] text-muted">Iskorišteno ${Math.round(usedPct)}% limita</p>
        </div>
        <div class="px-6 py-5">
          <p class="text-[13px] font-semibold">Posljednje narudžbe</p>
          <table class="mt-2 w-full text-[13px]">
            <tbody class="divide-y divide-ink/10">
              ${orders.map((o) => `
                <tr>
                  <td class="tnum py-3 pr-3 font-medium">${esc(o.no)}</td>
                  <td class="tnum hidden py-3 pr-3 text-muted sm:table-cell">${fmtDate(o.date)}</td>
                  <td class="tnum py-3 pr-3 text-right">${KM(o.total)}</td>
                  <td class="py-3 text-right"><span class="inline-block whitespace-nowrap px-2 py-0.5 text-[12px] font-medium ${STATUS_TONE[o.status] || 'bg-well text-muted'}">${esc(o.status)}</span></td>
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
        <tr class="border-b border-ink/20 text-left text-[12px] text-muted">
          <th class="pb-2 pr-4 font-medium">Zona dostave</th>
          <th class="pb-2 pr-4 text-right font-medium">Standardna</th>
          <th class="pb-2 text-right font-medium">Sa kranom</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-ink/10">
        ${DELIVERY_ZONES.map((z) => `
          <tr>
            <td class="py-3.5 pr-4">${z.label}</td>
            <td class="tnum py-3.5 pr-4 text-right">${KM(z.standard)}</td>
            <td class="tnum py-3.5 text-right font-semibold">${KM(z.kranTransport + z.kranWork)}</td>
          </tr>`).join('')}
      </tbody>`;
  }

  function renderCalcExample() {
    const bom = calcW111(EXAMPLE_WALL);
    const shown = bom.items.slice(0, 5);
    const rest = bom.items.length - shown.length;
    $('home-calc').innerHTML = `
      <div class="border border-ink/10 bg-canvas">
        <div class="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/10 px-6 py-5">
          <p class="tnum text-[17px] font-semibold">Zid 5 × 2,8 m</p>
          <p class="tnum text-[13px] text-muted">${fmt0.format(bom.P)} m², jednostruka obloga, CW 75</p>
        </div>
        <ul class="divide-y divide-ink/10 px-6">
          ${shown.map((it) => {
            const p = bySku[it.sku];
            return `<li class="flex items-center gap-5 py-4">
              <span class="block h-14 w-16 shrink-0 overflow-hidden bg-well p-0.5">${productArt(p)}</span>
              <span class="flex-1 text-[15px] leading-snug">${esc(p.name)}</span>
              <span class="tnum whitespace-nowrap text-[13px] text-muted">${it.note}</span>
            </li>`;
          }).join('')}
        </ul>
        <p class="px-6 pb-4 text-[13px] text-muted">i još ${rest} ${plural(rest, 'stavka', 'stavke', 'stavki')}: vijci, bandaž traka i zvučna traka</p>
        <div class="flex items-baseline justify-between border-t border-ink/10 bg-surface px-6 py-5">
          <span class="text-[15px]">Ukupno sa PDV-om</span>
          <span class="tnum text-[26px] font-semibold ${partner() ? 'text-steel' : ''}">${KM(bomTotal(bom))}</span>
        </div>
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

  const renderPriced = () => {
    renderCategories();
    renderFeatured();
    renderCalcExample();
  };
  renderPriced();
  onChange(renderPriced);
});
