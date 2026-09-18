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

  const FACTS = [
    ['Godina osnivanja', '2012', 'Porodična firma iz Zalužana'],
    ['Zaposlenih', '17', 'Prodaja, magacin i vozači'],
    ['Artikala na stanju', `${PRODUCTS.length}`, 'Od ploče do vijka'],
    ['Bonitet', 'A+', 'Uredno izmirene obaveze'],
  ];

  function renderFacts() {
    $('home-facts').innerHTML = FACTS.map(([label, value, note]) => `
      <div class="border-t border-canvas/20 pt-5 text-center">
        <dt class="eyebrow text-canvas/60">${label}</dt>
        <dd class="tnum font-display mt-4 text-[clamp(2.6rem,5vw,4.4rem)] leading-none">${value}</dd>
        <p class="mt-4 text-[14px] leading-snug text-canvas/60">${note}</p>
      </div>`).join('');
  }

  function renderCategories() {
    $('home-categories').innerHTML = CATEGORIES.map((c) => {
      const count = PRODUCTS.filter((p) => p.category === c.id).length;
      return `
        <a href="katalog.html?kat=${c.id}" class="group relative block overflow-hidden bg-surface">
          <div class="aspect-[4/5] overflow-hidden">
            <img src="${c.app || c.image}" alt="" loading="lazy"
                 class="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105" />
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-deeper/90 via-deeper/25 to-transparent"></div>
          <div class="absolute inset-x-0 bottom-0 p-5 text-canvas lg:p-7">
            <p class="eyebrow text-canvas/70">${count} ${plural(count, 'artikal', 'artikla', 'artikala')}</p>
            <h3 class="u-head mt-2 text-[clamp(1.1rem,1.6vw,1.6rem)]">${c.label}</h3>
            <p class="tnum mt-2 text-[14px] text-canvas/75">od ${KM(minPrice(c.id))}</p>
          </div>
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

  renderFacts();
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
