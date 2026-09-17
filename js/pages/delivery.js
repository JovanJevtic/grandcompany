// =====================================================================
// Delivery page — methods, zone price list, typical weights and the
// live weight of the visitor's own cart
// =====================================================================

'use strict';

initPage(() => {
  const WEIGHT_EXAMPLES = ['KNF-001', 'KNF-004', 'PRF-075', 'ISO-001', 'CHM-004', 'CHM-006', 'ACC-001'];
  const zone = DELIVERY_ZONES[0];

  const methods = [
    { title: 'Preuzimanje na stovarištu', price: 'Besplatno', text: 'Nenada Kostića 151 u Zalužanima, ponedjeljak–petak 7–17h i subotom 7–14h. Robu pripremamo za utovar u vaše vozilo.' },
    { title: 'Standardna dostava', price: `od ${KM(zone.standard)}`, text: `Istovar pored vozila na adresi. Besplatna za narudžbe preko ${fmt0.format(FREE_STANDARD_DELIVERY_OVER)} KM.` },
    { title: 'Kamion sa kranom', price: `od ${KM(zone.kranTransport + zone.kranWork)}`, text: 'Istovar dizalicom na etažu, krov ili skelu. Preporučujemo za pošiljke preko jedne tone.' },
  ];

  $('delivery-methods').innerHTML = methods.map((m) => `
    <div class="flex flex-col border border-ink/15 bg-surface p-7">
      <h3 class="text-[18px] font-semibold leading-snug">${m.title}</h3>
      <p class="tnum mt-2 text-[28px] font-semibold leading-none">${m.price}</p>
      <p class="mt-4 text-[15px] leading-relaxed text-muted">${m.text}</p>
    </div>`).join('');

  $('free-over').textContent = KM(FREE_STANDARD_DELIVERY_OVER);

  $('zones-table').innerHTML = `
    <thead>
      <tr class="border-b border-ink text-left text-[13px] text-muted">
        <th class="py-3 pr-4 font-normal">Zona</th>
        <th class="py-3 pr-4 text-right font-normal">Standardna dostava</th>
        <th class="py-3 pr-4 text-right font-normal">Transport sa kranom</th>
        <th class="py-3 pr-4 text-right font-normal">Rad krana</th>
        <th class="py-3 text-right font-normal">Kran ukupno</th>
      </tr>
    </thead>
    <tbody>
      ${DELIVERY_ZONES.map((z) => `
        <tr class="border-b border-ink/10">
          <td class="py-4 pr-4 text-[15px] font-medium">${z.label}</td>
          <td class="py-4 pr-4 text-right">${KM(z.standard)}</td>
          <td class="py-4 pr-4 text-right">${KM(z.kranTransport)}</td>
          <td class="py-4 pr-4 text-right">${KM(z.kranWork)}</td>
          <td class="py-4 text-right font-medium">${KM(z.kranTransport + z.kranWork)}</td>
        </tr>`).join('')}
    </tbody>`;

  $('weights').innerHTML = `
    <thead>
      <tr class="border-b border-ink text-left text-[13px] text-muted">
        <th class="py-3 pr-4 font-normal">Artikal</th>
        <th class="py-3 pr-4 font-normal">Pakovanje</th>
        <th class="py-3 text-right font-normal">Masa</th>
      </tr>
    </thead>
    <tbody>
      ${WEIGHT_EXAMPLES.map((sku) => {
        const p = bySku[sku];
        const packLabel = p.pack ? `${p.pack.name} ${qtyFmt(p.pack.size)} ${p.unit}` : p.spec.split(',')[0];
        const kg = p.pack ? p.weight * p.pack.size : p.weight;
        return `
          <tr class="border-b border-ink/10">
            <td class="py-3 pr-4">
              <a href="${productUrl(p)}" class="flex items-center gap-3 hover:text-steel">
                <span class="block h-11 w-14 shrink-0 bg-well p-0.5">${productArt(p)}</span>
                <span class="text-[14px] font-medium leading-snug">${esc(p.name)}</span>
              </a>
            </td>
            <td class="py-3 pr-4 text-muted">${esc(packLabel)}</td>
            <td class="whitespace-nowrap py-3 text-right font-medium">${qtyFmt(Math.round(kg * 10) / 10)} kg</td>
          </tr>`;
      }).join('')}
    </tbody>`;

  function renderCartWeight() {
    const t = cartTotals();
    if (!t.items.length) {
      $('cart-weight').innerHTML = `
        <p class="text-[13px] text-muted">Vaša korpa</p>
        <p class="mt-1 text-[18px] font-semibold leading-snug">Korpa je prazna.</p>
        <a href="katalog.html" class="link-line mt-3 inline-block text-[15px] text-steel">Otvori katalog</a>`;
      return;
    }
    const heavy = t.weightKg >= CRANE_RECOMMEND_OVER_KG;
    $('cart-weight').innerHTML = `
      <p class="text-[13px] text-muted">Vaša korpa trenutno teži</p>
      <p class="tnum mt-1 text-[34px] font-semibold leading-none ${heavy ? 'text-steel' : ''}">${fmt0.format(t.weightKg)} kg</p>
      <p class="mt-3 text-[15px] leading-relaxed text-muted">${heavy ? 'Preporučujemo kamion sa kranom za istovar.' : 'Standardna dostava ili preuzimanje su dovoljni.'}</p>
      <a href="korpa.html" class="link-line mt-3 inline-block text-[15px] text-steel">Izaberite dostavu u korpi</a>`;
  }

  renderCartWeight();
  onChange(renderCartWeight);
});
