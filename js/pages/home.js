// =====================================================================
// Home page — live stock, categories, featured products, delivery
// zones, calculator example, partner tiers and buying guides
// =====================================================================

'use strict';

initPage(() => {
  const LIVE_STOCK = ['KNF-001', 'PRF-075', 'ISO-001', 'CHM-004'];
  const EXAMPLE_WALL = { L: 5, H: 2.8, cladding: 'single', plateSku: 'KNF-001', cwSku: 'PRF-075', woolSku: 'ISO-001', fillerSku: 'CHM-001', soundTape: true };
  const TIER_OF = { gipsmont: 1, gradnjamont: 2, integral: 3 };
  const GUIDES = [
    {
      sku: 'KNF-002',
      title: 'Koja ploča za kupatilo, a koja za kotlovnicu?',
      text: 'Zelena impregnirana ploča podnosi vlagu kupatila i kuhinje. Crvena vatrootporna ide oko kotlovnica i u protivpožarne obloge, a plava Diamant tamo gdje zid trpi udarce ili treba bolja zvučna izolacija.',
      href: 'katalog.html?kat=suha-gradnja',
      cta: 'Pogledajte ploče',
    },
    {
      sku: 'ISO-003',
      title: 'Kamena ili staklena vuna?',
      text: 'Kamena vuna u pločama je negoriva i dobro prigušuje zvuk, pa je prvi izbor za pregradne zidove. Staklena vuna u rolni je lakša i brže se postavlja između rogova kosog krova.',
      href: 'katalog.html?kat=izolacija',
      cta: 'Pogledajte izolaciju',
    },
    {
      sku: 'PRF-075',
      title: 'Koliko profila ide u jedan zid?',
      text: 'CW profili idu na svakih 60 cm, a UW vodilice po podu i plafonu cijelom dužinom. Za zid od 5 × 2,8 m to je 9 CW i 3 UW profila sa otpadom, a kalkulator računa i sve ostalo.',
      href: 'kalkulator.html',
      cta: 'Otvorite kalkulator',
    },
  ];

  function renderLiveStock() {
    $('live-stock').innerHTML = `
      <p class="flex items-center gap-2 text-[13px] text-umber">
        <span class="relative flex h-2 w-2" aria-hidden="true">
          <span class="absolute inline-flex h-full w-full rounded-full bg-sage opacity-60 motion-safe:animate-ping"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-sage"></span>
        </span>
        Stanje na stovarištu, Pantheon u ${syncTime()}
      </p>
      <ul class="mt-2 divide-y divide-espresso/10">
        ${LIVE_STOCK.map((sku) => {
          const p = bySku[sku];
          return `<li><a href="${productUrl(p)}" class="flex items-baseline justify-between gap-4 py-2 text-[15px] hover:text-oxide"><span>${esc(p.name)}</span><span class="whitespace-nowrap text-umber">${fmt0.format(p.stock)} ${p.unit}</span></a></li>`;
        }).join('')}
      </ul>`;
  }

  function renderCategories() {
    $('home-categories').innerHTML = CATEGORIES.map((c,i) => {
      const count = PRODUCTS.filter(p => p.category === c.id).length;
      return `<a href="katalog.html?kat=${c.id}" class="category-card">
        <div class="category-image"><img src="${c.image}" alt="" loading="lazy"><span class="category-number">0${i+1}</span><span class="category-arrow">↗</span></div>
        <div class="category-info"><span>${count} ${plural(count,'artikal','artikla','artikala')}</span><h3>${c.label}</h3><p>${c.lead}</p></div>
      </a>`;
    }).join('');
  }

  function renderFeatured() {
    $('home-featured').innerHTML = PRODUCTS.filter((p) => p.featured).map(productCard).join('');
  }

  function renderZones() {
    $('home-zones').innerHTML = `
      <thead>
        <tr class="border-b border-espresso text-left text-[13px] text-umber">
          <th class="py-2 pr-4 font-normal">Zona</th>
          <th class="py-2 pr-4 text-right font-normal">Standardna</th>
          <th class="py-2 text-right font-normal">Kamion sa kranom</th>
        </tr>
      </thead>
      <tbody>
        ${DELIVERY_ZONES.map((z) => `
          <tr class="border-b border-espresso/10">
            <td class="py-3 pr-4">${z.label}</td>
            <td class="py-3 pr-4 text-right">${KM(z.standard)}</td>
            <td class="py-3 text-right font-medium">${KM(z.kranTransport + z.kranWork)}</td>
          </tr>`).join('')}
      </tbody>`;
  }

  function renderCalcExample() {
    const bom = calcW111(EXAMPLE_WALL);
    const shown = bom.items.slice(0, 5);
    const rest = bom.items.length - shown.length;
    $('home-calc').innerHTML = `
      <div class="bg-paper p-6 text-espresso shadow-[0_40px_80px_-40px_rgba(0,0,0,0.55)] lg:p-8">
        <div class="flex flex-wrap items-baseline justify-between gap-3 border-b border-espresso pb-3">
          <p class="font-display text-[28px] leading-none">Zid 5 × 2,8 m</p>
          <p class="text-[14px] text-umber">${fmt0.format(bom.P)} m², jednostruka obloga, CW 75</p>
        </div>
        <ul class="divide-y divide-espresso/10">
          ${shown.map((it) => {
            const p = bySku[it.sku];
            return `<li class="flex items-center gap-4 py-3">
              <span class="block h-12 w-16 shrink-0 bg-bone p-0.5">${productArt(p)}</span>
              <span class="flex-1 text-[15px] leading-snug">${esc(p.name)}</span>
              <span class="whitespace-nowrap text-[14px] text-umber">${it.note}</span>
            </li>`;
          }).join('')}
        </ul>
        <p class="mt-1 text-[14px] text-umber">i još ${rest} ${plural(rest, 'stavka', 'stavke', 'stavki')}: vijci, bandaž traka i zvučna traka</p>
        <div class="mt-5 flex items-baseline justify-between border-t border-espresso pt-4">
          <span class="text-[15px]">Ukupno sa PDV-om</span>
          <span class="font-display text-[40px] leading-none ${partner() ? 'text-oxide' : ''}">${KM(bomTotal(bom))}</span>
        </div>
      </div>`;
  }

  function renderTiers() {
    const mine = TIER_OF[state.partnerId];
    $('home-tiers').innerHTML = PARTNER_TIERS.map((t,i) => `<a href="partneri.html" class="partner-card ${i===2?'partner-card-featured':''}"><div class="partner-card-top"><span>${t.name}${i===mine?', vaš nivo':''}</span><span>↗</span></div><p class="partner-rebate">${t.rebate}</p><p>${t.who}</p><p class="partner-days">${t.days}</p></a>`).join('');
  }

  function renderGuides() {
    $('home-guides').innerHTML = GUIDES.map((g) => {
      const p = bySku[g.sku];
      return `
        <article class="guide-card">
          <div class="guide-image">${productArt(p)}</div>
          <div class="flex flex-1 flex-col p-6">
            <h3 class="font-display text-[26px] leading-tight">${g.title}</h3>
            <p class="mt-3 flex-1 text-[15px] leading-relaxed text-umber">${g.text}</p>
            <a href="${g.href}" class="link-line mt-5 self-start text-[15px] text-oxide">${g.cta}</a>
          </div>
        </article>`;
    }).join('');
  }

  renderLiveStock();
  renderZones();
  renderGuides();

  const renderPriced = () => {
    renderCategories();
    renderFeatured();
    renderCalcExample();
    renderTiers();
  };
  renderPriced();
  onChange(renderPriced);
});
