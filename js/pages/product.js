// =====================================================================
// Product detail page — gallery, live stock, partner price, quantity,
// tabs with technical data and related products. Reads ?sku= from URL.
// =====================================================================

'use strict';

initPage(() => {
  const sku = new URLSearchParams(location.search).get('sku');
  const p = bySku[sku];

  if (!p) {
    $('product-root').innerHTML = `
      <div class="py-24 text-center">
        <p class="font-serif text-[40px] leading-tight">Artikal nije pronađen.</p>
        <p class="mt-3 text-muted">Šifra „${esc(sku || '')}" ne postoji u katalogu ili je artikal povučen iz prodaje.</p>
        <a href="katalog.html" class="${BTN_PRIMARY} mt-8 px-7 py-3.5">Nazad na katalog</a>
      </div>`;
    $('related').remove();
    return;
  }

  const cat = categoryById[p.category];
  document.title = `${p.name} | Grand Company Banja Luka`;

  const COMPLEMENTS = {
    'suha-gradnja': ['ACC-001', 'CHM-001', 'ISO-001'],
    izolacija: ['CHM-003', 'CHM-004', 'PRF-075'],
    veziva: ['ACC-003', 'KNF-001', 'CHM-005'],
    oprema: ['KNF-001', 'PRF-075', 'CHM-001'],
  };
  const CALCULATOR_SKUS = ['ISO-001', 'ISO-002', 'CHM-001', 'CHM-002', 'ACC-001', 'ACC-003', 'ACC-005'];
  const TABS = [['opis', 'Opis'], ['podaci', 'Tehnički podaci'], ['dokumentacija', 'Dokumentacija'], ['dostava', 'Dostava i istovar']];

  let tab = 'opis';
  let qty = defaultQty(p);

  function docsFor() {
    const docs = [['Tehnički list proizvoda', 'Svojstva, potrošnja i uputstvo za ugradnju']];
    if (p.category !== 'oprema') docs.push(['Izjava o svojstvima (CE)', 'Deklarisane karakteristike prema harmonizovanom standardu']);
    if (['KNF-003', 'KNF-004', 'ISO-001', 'ISO-002'].includes(p.sku)) docs.push(['Protivpožarni atest', 'Klasa reakcije na požar, za tehnički prijem objekta']);
    if (p.category === 'izolacija') docs.push(['Izvještaj o toplotnoj provodljivosti', 'Deklarisana vrijednost λ']);
    if (p.category === 'veziva') docs.push(['Sigurnosno-tehnički list', 'Rukovanje, skladištenje i zaštitna oprema']);
    return docs;
  }

  function tabPanel() {
    if (tab === 'opis') {
      const brandNote = p.brand.startsWith('Knauf')
        ? 'Grand Company je ovlašćeni distributer Knauf sistema, pa uz ovaj artikal na istom mjestu dobijate i sve sistemske komponente istog proizvođača.'
        : 'Artikal držimo na lageru jer se provjereno slaže sa sistemima iz naše ponude. Za zamjenske proizvode i veće količine pitajte u prodaji.';
      return `
        <div class="grid gap-8 lg:grid-cols-12">
          <p class="font-serif text-[24px] leading-snug lg:col-span-6">${esc(p.desc)}</p>
          <div class="space-y-4 text-[16px] leading-relaxed text-muted lg:col-span-5 lg:col-start-8">
            <p>${esc(cat.usage)}</p>
            <p>${brandNote}</p>
          </div>
        </div>`;
    }
    if (tab === 'podaci') {
      const rows = [
        ['Šifra artikla', p.sku],
        ['Proizvođač', p.brand],
        ['Kategorija', cat.label],
        ['Dimenzije i specifikacija', p.spec],
        ['Jedinica prodaje', p.unit],
        ['Prodajno pakovanje', p.pack ? `${p.pack.name} od ${qtyFmt(p.pack.size)} ${p.unit}` : `1 ${p.unit}`],
        ['Masa', `oko ${qtyFmt(p.weight)} kg po ${p.unit}`],
        ['Stanje na stovarištu', `${fmt0.format(p.stock)} ${p.unit}`],
      ];
      return `
        <table class="w-full max-w-3xl text-[15px]">
          <tbody>${rows.map(([k, v]) => `<tr class="border-b border-ink/10"><th scope="row" class="w-1/2 py-3 pr-6 text-left font-normal text-muted">${k}</th><td class="py-3">${esc(v)}</td></tr>`).join('')}</tbody>
        </table>`;
    }
    if (tab === 'dokumentacija') {
      return `
        <ul class="max-w-3xl divide-y divide-ink/10 border-y border-ink/15">
          ${docsFor().map(([name, note]) => `
            <li class="flex flex-wrap items-center justify-between gap-4 py-4">
              <div class="flex items-start gap-3"><span class="text-steel">${ICON.doc}</span><div><p class="text-[15px] font-semibold leading-snug">${name}</p><p class="text-[14px] text-muted">${note}</p></div></div>
              <button data-doc="${esc(name)}" class="${BTN_GHOST} px-4 py-2 text-[14px]">Zatraži dokument</button>
            </li>`).join('')}
        </ul>
        <p class="mt-4 max-w-3xl text-[14px] text-muted">Dokumentacija se isporučuje i u papirnom obliku uz robu, spremna za predaju nadzornom organu.</p>`;
    }
    const zone = DELIVERY_ZONES[0];
    const packWeight = p.pack ? p.weight * p.pack.size : p.weight;
    return `
      <div class="grid gap-8 lg:grid-cols-12">
        <div class="space-y-4 text-[16px] leading-relaxed text-muted lg:col-span-6">
          <p>Jedno pakovanje (${p.pack ? `${p.pack.name} od ${qtyFmt(p.pack.size)} ${p.unit}` : `1 ${p.unit}`}) teži oko <strong class="font-medium text-ink">${qtyFmt(Math.round(packWeight * 10) / 10)} kg</strong>. Kada narudžba pređe ${fmt0.format(CRANE_RECOMMEND_OVER_KG)} kg, preporučujemo kamion sa kranom koji paletu podiže direktno na etažu.</p>
          <p>Dostavu i zonu birate u korpi, a tačan termin istovara dogovaramo pri potvrdi narudžbe.</p>
          <a href="dostava.html" class="inline-flex items-center gap-2 text-steel link-line">Cjenovnik dostave po zonama ${ICON.arrow}</a>
        </div>
        <div class="lg:col-span-5 lg:col-start-8">
          <div class="aspect-[4/3] overflow-hidden"><img src="img/crane-lift.jpg" alt="Kran podiže betonski panel na gradilištu" class="h-full w-full object-cover" /></div>
          <p class="mt-2 text-[14px] text-muted">Kamion sa kranom u Banjoj Luci: ${KM(zone.kranTransport + zone.kranWork)}</p>
        </div>
      </div>`;
  }

  function render() {
    const b2b = partner();
    const photo = PRODUCT_PHOTOS[p.sku];
    const zone = DELIVERY_ZONES[0];
    const showCalc = p.category === 'suha-gradnja' || CALCULATOR_SKUS.includes(p.sku);

    $('product-root').innerHTML = `
      ${breadcrumb([{ label: 'Početna', href: 'index.html' }, { label: 'Katalog', href: 'katalog.html' }, { label: cat.label, href: `katalog.html?kat=${cat.id}` }, { label: p.name }])}

      <div class="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div class="lg:col-span-7">
          <div class="aspect-[4/3] overflow-hidden border border-ink/10 bg-well ${photo ? '' : 'p-8 lg:p-14'}">${productArt(p, 'h-full w-full', photo ? 'contain' : 'cover')}</div>
          ${cat.app ? `
          <figure class="mt-3">
            <div class="aspect-[16/9] overflow-hidden bg-well"><img src="${cat.app}" alt="Ugradnja iz kategorije ${esc(cat.label.toLowerCase())}" loading="lazy" class="h-full w-full object-cover" /></div>
            <figcaption class="mt-2 text-[13px] text-muted">Fotografija prikazuje ugradnju iz iste kategorije, ne sam artikal. <a href="zasluge.html" class="link-line">Zasluge za fotografije</a></figcaption>
          </figure>` : ''}
        </div>

        <div class="lg:col-span-5">
          <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-muted">
            <span>${esc(p.brand)}</span>
            <span>Šifra ${p.sku}</span>
            <a href="katalog.html?kat=${cat.id}" class="hover:text-ink">${cat.label}</a>
          </div>
          <h1 class="mt-3 font-serif text-[clamp(1.89rem,2.95vw,2.87rem)] leading-[1.04]">${esc(p.name)}</h1>
          <p class="mt-3 text-[16px] text-muted">${esc(p.spec)}</p>

          <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-ink/15 py-3 text-[14px]">
            ${stockBadge(p)}
            <span class="text-muted">${fmt0.format(p.stock)} ${p.unit} na stovarištu, stanje iz Pantheona u ${syncTime()}</span>
          </div>

          <div class="mt-6">
            ${b2b ? `<p class="text-[14px] text-muted"><span class="line-through">${KM(p.price)}</span><span class="ml-2 text-steel">rabat −${pct(discount())} za ${esc(b2b.name)}</span></p>` : ''}
            <p class="tnum mt-1 text-[38px] font-semibold leading-none ${b2b ? 'text-steel' : ''}">${KM(priceOf(p))}<span class="ml-2 text-[15px] font-normal text-muted">po ${p.unit}, sa PDV-om</span></p>
            ${p.pack ? `<p class="mt-2 text-[15px] text-muted">Jedna ${p.pack.name} od ${qtyFmt(p.pack.size)} ${p.unit} košta ${KM(priceOf(p) * p.pack.size)}.</p>` : ''}
            ${b2b ? '' : `<button data-login class="mt-3 text-left text-[15px] text-muted"><span class="text-steel underline underline-offset-4">Prijavite se kao partner</span> i platite od ${KM(p.price * 0.9)} do ${KM(p.price * 0.78)} po ${p.unit}.</button>`}
          </div>

          <div data-product="${p.sku}" class="mt-7 flex flex-wrap items-stretch gap-3">
            <div class="flex">
              <button id="qty-dec" class="w-11 border border-ink/30 text-[20px] transition-colors hover:bg-ink hover:text-canvas" aria-label="Smanji količinu">−</button>
              <input id="qty" data-qty type="number" min="0" step="any" value="${qty}" aria-label="Količina u ${p.unit}"
                     class="w-20 border-x-0 border-y border-ink/30 bg-surface text-center text-[17px] focus:border-ink focus:ring-0" />
              <button id="qty-inc" class="w-11 border border-ink/30 text-[20px] transition-colors hover:bg-ink hover:text-canvas" aria-label="Povećaj količinu">+</button>
            </div>
            <span class="self-center text-[15px] text-muted">${p.unit}</span>
            <button data-add="${p.sku}" class="${BTN_PRIMARY} min-w-[200px] flex-1 px-8 py-4 text-[16px]">Dodaj u korpu</button>
          </div>
          <p id="line-total" class="mt-3 text-[15px] text-muted"></p>

          ${showCalc ? `<a href="kalkulator.html" class="mt-5 inline-flex items-center gap-2 text-[15px] text-steel link-line">Izračunajte količinu za pregradni zid ${ICON.arrow}</a>` : ''}

          <ul class="mt-7 divide-y divide-ink/10 border-y border-ink/15 text-[15px]">
            <li class="flex flex-wrap justify-between gap-x-4 py-3"><span>Preuzimanje na stovarištu</span><span class="text-muted">besplatno</span></li>
            <li class="flex flex-wrap justify-between gap-x-4 py-3"><span>Standardna dostava, Banja Luka</span><span class="text-muted">${KM(zone.standard)}, besplatna preko ${fmt0.format(FREE_STANDARD_DELIVERY_OVER)} KM</span></li>
            <li class="flex flex-wrap justify-between gap-x-4 py-3"><span>Kamion sa kranom, istovar na etažu</span><span class="text-muted">od ${KM(zone.kranTransport + zone.kranWork)}</span></li>
          </ul>
        </div>
      </div>

      <div class="mt-16">
        <div role="tablist" aria-label="Detalji artikla" class="no-scrollbar flex gap-8 overflow-x-auto border-b border-ink/20">
          ${TABS.map(([id, label]) => `
            <button role="tab" data-tab="${id}" aria-selected="${tab === id}" class="whitespace-nowrap pb-3 text-[16px] ${tab === id ? 'text-ink shadow-[inset_0_-2px_0_#274C77]' : 'text-muted hover:text-ink'}">${label}</button>`).join('')}
        </div>
        <div role="tabpanel" class="pt-8">${tabPanel()}</div>
      </div>`;

    updateLineTotal();
  }

  function updateLineTotal() {
    $('line-total').textContent = `Ukupno za ${qtyFmt(qty)} ${p.unit}: ${KM(priceOf(p) * qty)}`;
  }

  function renderRelated() {
    const related = [...new Set([...COMPLEMENTS[p.category], ...PRODUCTS.filter((x) => x.category === p.category).map((x) => x.sku)])]
      .filter((s) => s !== p.sku)
      .slice(0, 4)
      .map((s) => bySku[s]);
    $('related').innerHTML = `
      <div class="mx-auto max-w-page px-5 py-14 lg:px-10 lg:py-20">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <h2 class="font-serif text-[clamp(1.64rem,2.79vw,2.46rem)] leading-tight">Uz ovaj artikal najčešće idu</h2>
          <a href="katalog.html?kat=${cat.id}" class="link-line text-[15px]">Sve iz kategorije ${esc(cat.label.toLowerCase())}</a>
        </div>
        <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">${related.map(productCard).join('')}</div>
      </div>`;
  }

  $('product-root').addEventListener('click', (e) => {
    const viewBtn = e.target.closest('[data-view]');
    if (viewBtn) {
      view = Number(viewBtn.dataset.view);
      return render();
    }
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      tab = tabBtn.dataset.tab;
      return render();
    }
    if (e.target.closest('#qty-inc') || e.target.closest('#qty-dec')) {
      const step = defaultQty(p) * (e.target.closest('#qty-inc') ? 1 : -1);
      qty = Math.max(defaultQty(p), Math.round((qty + step) * 100) / 100);
      $('qty').value = qty;
      return updateLineTotal();
    }
    const doc = e.target.closest('[data-doc]');
    if (doc) toast(`Zahtjev za dokument „${doc.dataset.doc}" je zabilježen. U demo verziji se ne šalje.`);
  });

  $('product-root').addEventListener('input', (e) => {
    if (e.target.id !== 'qty') return;
    qty = Math.max(0, parseFloat(e.target.value) || 0);
    updateLineTotal();
  });

  render();
  renderRelated();
  onChange(() => {
    render();
    renderRelated();
  });
});
