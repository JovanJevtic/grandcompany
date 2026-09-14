// =====================================================================
// Cart page — items, delivery with crane logistics, partner credit
// check and order submission (simulated PANTHEON order).
// The layout is built once; only the parts that change are re-rendered,
// so text typed into the order form is never wiped.
// =====================================================================

'use strict';

initPage(() => {
  let mode = null; // 'empty' | 'filled' | 'done'

  const DELIVERY_LABELS = { pickup: 'Preuzimanje na stovarištu', standard: 'Standardna dostava', kran: 'Kamion sa kranom, istovar na etažu' };

  function setSteps(active) {
    $('steps').innerHTML = ['Korpa', 'Dostava i podaci', 'Potvrda'].map((label, i) => {
      const done = i < active;
      const current = i === active;
      const circle = done ? 'border-sage bg-sage text-cream' : current ? 'border-espresso' : 'border-umber/40';
      return `<li class="flex items-center gap-2 ${done || current ? 'text-espresso' : 'text-umber/60'}"${current ? ' aria-current="step"' : ''}>
        <span class="flex h-7 w-7 items-center justify-center rounded-full border text-[13px] ${circle}">${done ? '✓' : i + 1}</span>${label}</li>`;
    }).join('');
  }

  // -------------------------------------------------------------------
  // Layouts
  // -------------------------------------------------------------------
  function layoutEmpty() {
    setSteps(0);
    $('cart-root').innerHTML = `
      <div class="border border-dashed border-espresso/30 px-6 py-16 text-center">
        <p class="font-serif text-[42px] italic leading-tight">Korpa je prazna.</p>
        <p class="mt-3 text-[16px] text-umber">Dodajte artikle iz kataloga ili prenesite gotovu specifikaciju iz kalkulatora.</p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <a href="katalog.html" class="${BTN_PRIMARY} px-7 py-3.5">Otvori katalog</a>
          <a href="kalkulator.html" class="${BTN_GHOST} px-7 py-3.5">Otvori kalkulator</a>
        </div>
      </div>
      <h2 class="mt-16 font-serif text-[36px] leading-tight">Izdvojeno iz ponude</h2>
      <div id="empty-featured" class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"></div>`;
  }

  function layoutFilled() {
    setSteps(1);
    const heading = (id, text) => `<h2 id="${id}" class="font-serif text-[32px] leading-tight">${text}</h2>`;
    $('cart-root').innerHTML = `
      <div class="grid gap-12 lg:grid-cols-12">
        <div class="lg:col-span-8">
          <section aria-labelledby="h-items">
            <div class="flex items-baseline justify-between gap-4 border-b border-espresso pb-3">
              ${heading('h-items', 'Artikli')}
              <button id="btn-clear" class="text-[14px] text-umber underline underline-offset-4 hover:text-oxide">Isprazni korpu</button>
            </div>
            <div id="cart-items"></div>
          </section>

          <section aria-labelledby="h-delivery" class="mt-14">
            <div class="border-b border-espresso pb-3">${heading('h-delivery', 'Dostava')}</div>
            <div id="cart-delivery" class="mt-6"></div>
          </section>

          <section aria-labelledby="h-details" class="mt-14">
            <div class="border-b border-espresso pb-3">${heading('h-details', 'Podaci za narudžbu')}</div>
            <form id="checkout-form" class="mt-6 grid gap-5 sm:grid-cols-2">
              <label class="block"><span id="name-label" class="${LABEL}">Ime i prezime</span><input id="co-name" required autocomplete="name" class="${FIELD}" /></label>
              <label id="company-wrap" class="block"><span class="${LABEL}">Firma, opciono</span><input id="co-company" autocomplete="organization" class="${FIELD}" /></label>
              <label class="block"><span class="${LABEL}">Telefon</span><input id="co-phone" type="tel" required autocomplete="tel" placeholder="065 000 000" class="${FIELD}" /></label>
              <label class="block"><span class="${LABEL}">Adresa e-pošte</span><input id="co-email" type="email" autocomplete="email" class="${FIELD}" /></label>
              <label id="address-wrap" class="block sm:col-span-2"><span class="${LABEL}">Adresa gradilišta za istovar</span><input id="co-address" autocomplete="street-address" placeholder="Ulica i broj, mjesto, sprat i pristup za kamion" class="${FIELD}" /></label>
              <label class="block sm:col-span-2"><span class="${LABEL}">Način plaćanja</span><select id="co-payment" class="${FIELD}"></select></label>
              <div id="credit-warning" class="hidden sm:col-span-2"></div>
              <label class="block sm:col-span-2"><span class="${LABEL}">Napomena za prodaju ili vozača</span><textarea id="co-note" rows="3" class="${FIELD}"></textarea></label>
            </form>
          </section>
        </div>

        <aside class="lg:col-span-4">
          <div id="cart-summary" class="border border-espresso/15 bg-paper p-6 lg:sticky lg:top-40"></div>
        </aside>
      </div>`;

    $('btn-clear').addEventListener('click', () => {
      clearCart();
      toast('Korpa je ispražnjena.');
    });
    $('cart-delivery').addEventListener('change', (e) => {
      if (e.target.name === 'delivery') setDelivery(e.target.value);
      if (e.target.id === 'zone-select') setZone(e.target.value);
    });
    $('checkout-form').addEventListener('submit', submitOrder);
  }

  // -------------------------------------------------------------------
  // Parts
  // -------------------------------------------------------------------
  function renderItems() {
    const b2b = partner();
    $('cart-items').innerHTML = cartItems().map(({ product: p, qty }) => `
      <div class="grid grid-cols-[88px_1fr] gap-x-5 gap-y-3 border-b border-espresso/10 py-5 sm:grid-cols-[124px_1fr_auto]">
        <a href="${productUrl(p)}" class="block aspect-[4/3] self-start bg-bone p-1" tabindex="-1" aria-hidden="true">${productArt(p)}</a>
        <div class="min-w-0">
          <a href="${productUrl(p)}" class="font-serif text-[22px] leading-snug hover:text-oxide">${esc(p.name)}</a>
          <p class="mt-0.5 text-[13px] text-umber">${p.sku}, ${esc(p.spec)}</p>
          <p class="mt-1 text-[14px]">${KM(priceOf(p))} po ${p.unit}${b2b ? ` <span class="ml-1 text-umber line-through">${KM(p.price)}</span>` : ''}</p>
          <div class="mt-3 flex flex-wrap items-center gap-4">
            ${cartStepper(p, qty)}
            <button data-remove="${p.sku}" class="text-[14px] text-umber underline underline-offset-4 hover:text-oxide">Ukloni</button>
          </div>
        </div>
        <p class="col-start-2 font-serif text-[28px] leading-none sm:col-start-3 sm:text-right">${KM(priceOf(p) * qty)}</p>
      </div>`).join('');
  }

  function renderDelivery() {
    const t = cartTotals();
    const zone = currentZone();
    const standardFree = t.subtotal >= FREE_STANDARD_DELIVERY_OVER;
    const options = [
      { id: 'pickup', title: 'Preuzimanje na stovarištu', text: 'Nenada Kostića 151, pon–pet 7–17h, subota 7–14h', cost: 'besplatno' },
      { id: 'standard', title: 'Standardna dostava', text: standardFree ? `Besplatna za narudžbe preko ${fmt0.format(FREE_STANDARD_DELIVERY_OVER)} KM` : 'Istovar pored vozila na adresi', cost: standardFree ? 'besplatno' : KM(zone.standard) },
      { id: 'kran', title: 'Kamion sa kranom', text: `Istovar na etažu ili skelu: transport ${KM(zone.kranTransport)} i rad krana ${KM(zone.kranWork)}`, cost: KM(zone.kranTransport + zone.kranWork) },
    ];

    $('cart-delivery').innerHTML = `
      <div class="grid gap-3 md:grid-cols-3">
        ${options.map((o) => `
          <label class="flex cursor-pointer flex-col border p-4 transition-colors ${state.delivery === o.id ? 'border-espresso bg-paper' : 'border-espresso/20 hover:border-espresso/50'}">
            <span class="flex items-center justify-between gap-3">
              <input type="radio" name="delivery" value="${o.id}" ${state.delivery === o.id ? 'checked' : ''} class="border-espresso/40 text-oxide focus:ring-oxide" />
              <span class="text-[14px] font-medium">${o.cost}</span>
            </span>
            <span class="mt-3 font-serif text-[22px] leading-tight">${o.title}</span>
            <span class="mt-1 text-[14px] leading-snug text-umber">${o.text}</span>
          </label>`).join('')}
      </div>
      ${state.delivery === 'pickup' ? '' : `
        <label class="mt-5 block max-w-md">
          <span class="${LABEL}">Zona dostave</span>
          <select id="zone-select" class="${FIELD}">
            ${DELIVERY_ZONES.map((z) => `<option value="${z.id}" ${z.id === state.zone ? 'selected' : ''}>${z.label}</option>`).join('')}
          </select>
        </label>`}
      <p class="mt-5 text-[15px] text-umber">Procijenjena težina pošiljke: <strong class="font-medium text-espresso">${fmt0.format(t.weightKg)} kg</strong></p>
      ${t.weightKg >= CRANE_RECOMMEND_OVER_KG && state.delivery !== 'kran'
        ? '<p class="mt-2 border-l-2 border-oxide pl-3 text-[15px] text-umber">Pošiljka prelazi tonu, pa preporučujemo kamion sa kranom.</p>'
        : ''}`;

    const needsAddress = state.delivery !== 'pickup';
    $('address-wrap').classList.toggle('hidden', !needsAddress);
    $('co-address').required = needsAddress;
  }

  function renderPayment() {
    const p = partner();
    const t = cartTotals();
    const select = $('co-payment');
    const previous = select.value;

    $('name-label').textContent = p ? 'Kontakt osoba' : 'Ime i prezime';
    $('company-wrap').classList.toggle('hidden', !!p);

    let options;
    let warning = '';
    if (p) {
      const free = Math.max(0, p.creditLimit - p.creditUsed);
      const fits = t.total <= free;
      options = [
        ['odgodjeno', `Odgođeno plaćanje, valuta ${p.paymentDays} dana`, !fits],
        ['avans', 'Avansno plaćanje virmanom', false],
      ];
      if (!fits) {
        warning = `<p class="border-l-2 border-oxide pl-3 text-[15px] text-umber">Narudžba od ${KM(t.total)} prelazi slobodan kreditni limit od ${KM(free)}. Izaberite avansno plaćanje ili zatražite povećanje limita od komercijaliste.</p>`;
      }
    } else {
      options = [
        ['preuzimanje', 'Plaćanje pri preuzimanju robe', false],
        ['predracun', 'Predračun i uplata na žiro račun', false],
      ];
    }

    select.innerHTML = options.map(([value, label, disabled]) => `<option value="${value}" ${disabled ? 'disabled' : ''}>${label}${disabled ? ', nedovoljan limit' : ''}</option>`).join('');
    const keep = options.find(([v, , d]) => v === previous && !d) || options.find(([, , d]) => !d);
    select.value = keep[0];

    $('credit-warning').innerHTML = warning;
    $('credit-warning').classList.toggle('hidden', !warning);
  }

  function renderSummary() {
    const t = cartTotals();
    const p = partner();
    const row = (label, value, cls = 'text-[15px]') => `<div class="flex justify-between gap-4 py-1.5 ${cls}"><span>${label}</span><span class="text-right">${value}</span></div>`;

    let credit = '';
    if (p) {
      const usedPct = Math.min(100, ((p.creditUsed + t.total) / p.creditLimit) * 100);
      credit = `
        <div class="mt-5 border-t border-espresso/15 pt-4 text-[14px] text-umber">
          <p>Kreditni limit nakon ove narudžbe</p>
          <div class="mt-2 h-1.5 overflow-hidden bg-espresso/15"><div class="h-full ${usedPct < 85 ? 'bg-sage' : 'bg-oxide'}" style="width:${usedPct}%"></div></div>
          <p class="mt-2">Slobodno još <strong class="font-medium text-espresso">${KM(Math.max(0, p.creditLimit - p.creditUsed - t.total))}</strong> od ${KM(p.creditLimit)}</p>
        </div>`;
    }

    $('cart-summary').innerHTML = `
      <h2 class="font-serif text-[30px] leading-tight">Pregled narudžbe</h2>
      <div class="mt-4 border-t border-espresso/15 pt-3">
        ${t.rebate > 0 ? row('Vrijednost po cjenovniku', `<span class="line-through">${KM(t.grossB2C)}</span>`, 'text-[15px] text-umber') : ''}
        ${t.rebate > 0 ? row(`Partnerski rabat −${pct(discount())}`, `−${KM(t.rebate)}`, 'text-[15px] text-oxide') : ''}
        ${row(`Roba, ${t.items.length} ${plural(t.items.length, 'stavka', 'stavke', 'stavki')}`, KM(t.subtotal))}
        ${row(DELIVERY_LABELS[state.delivery], t.deliveryCost ? KM(t.deliveryCost) : 'besplatno')}
        ${row('Osnovica bez PDV-a', KM(t.net), 'text-[13px] text-umber')}
        ${row('PDV 17%', KM(t.vat), 'text-[13px] text-umber')}
      </div>
      <div class="mt-3 flex items-baseline justify-between border-t border-espresso pt-4">
        <span class="text-[15px]">Ukupno</span>
        <span class="font-serif text-[42px] leading-none">${KM(t.total)}</span>
      </div>
      ${credit}
      <button type="submit" form="checkout-form" class="${BTN_PRIMARY} mt-6 w-full py-4 text-[16px]">Pošalji narudžbu</button>
      <p class="mt-3 text-[13px] leading-relaxed text-umber">Narudžba stiže komercijalisti, koji je potvrđuje i šalje predračun iz Pantheona. Ništa se ne naplaćuje prije potvrde.</p>`;
  }

  // -------------------------------------------------------------------
  // Submit → confirmation
  // -------------------------------------------------------------------
  function submitOrder(e) {
    e.preventDefault();
    const t = cartTotals();
    const p = partner();
    const now = new Date();
    const orderNo = `GC-${now.getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
    const name = $('co-name').value.trim();
    const phone = $('co-phone').value.trim();
    const customer = p ? `${p.name}, ${name}` : [name, $('co-company').value.trim()].filter(Boolean).join(', ');
    const address = state.delivery === 'pickup' ? 'Nenada Kostića 151, Zalužani' : $('co-address').value.trim();
    const payment = $('co-payment').selectedOptions[0].textContent;
    const next = { pickup: 'termin preuzimanja', standard: 'termin dostave', kran: 'termin istovara kranom' }[state.delivery];

    const detail = (label, value) => `<div><dt class="text-[13px] text-umber">${label}</dt><dd class="mt-1 text-[16px]">${esc(value)}</dd></div>`;

    mode = 'done';
    setSteps(2);
    $('cart-root').innerHTML = `
      <div class="grid gap-12 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <p class="text-[15px] text-sage">Narudžba je poslata u Pantheon (simulacija)</p>
          <h2 class="mt-2 font-serif text-[clamp(2.4rem,4.4vw,4rem)] italic leading-tight">Hvala, narudžba ${orderNo} je primljena.</h2>
          <p class="mt-4 max-w-[58ch] text-[17px] leading-relaxed text-umber">Komercijalista provjerava stanje i ${next}, zove vas na ${esc(phone)} i šalje predračun. Atesti i deklaracije stižu uz robu.</p>
          <dl class="mt-8 grid gap-5 border-t border-espresso/15 pt-6 sm:grid-cols-2">
            ${detail('Kupac', customer)}
            ${detail('Datum', now.toLocaleDateString('sr-Latn-BA'))}
            ${detail('Dostava', DELIVERY_LABELS[state.delivery])}
            ${detail('Adresa', address)}
            ${detail('Plaćanje', payment)}
            ${detail('Težina', `oko ${fmt0.format(t.weightKg)} kg`)}
          </dl>
          <div class="mt-10 flex flex-wrap gap-3">
            <a href="katalog.html" class="${BTN_PRIMARY} px-7 py-3.5">Nastavite kupovinu</a>
            <a href="index.html" class="${BTN_GHOST} px-7 py-3.5">Početna</a>
          </div>
        </div>
        <aside class="lg:col-span-5">
          <div class="border border-espresso/15 bg-paper p-6">
            <h3 class="font-serif text-[26px]">Naručeni artikli</h3>
            <ul class="mt-3 divide-y divide-espresso/10 border-t border-espresso/15">
              ${t.items.map(({ product: pr, qty }) => `
                <li class="flex items-center gap-3 py-3">
                  <span class="block h-11 w-14 shrink-0 bg-bone p-0.5">${productArt(pr)}</span>
                  <span class="flex-1 text-[14px] leading-snug">${esc(pr.name)}<br /><span class="text-umber">${qtyFmt(qty)} ${pr.unit}</span></span>
                  <span class="whitespace-nowrap text-[14px] font-medium">${KM(priceOf(pr) * qty)}</span>
                </li>`).join('')}
            </ul>
            <div class="mt-3 space-y-1 border-t border-espresso/15 pt-3 text-[15px]">
              ${t.rebate > 0 ? `<div class="flex justify-between text-oxide"><span>Partnerski rabat</span><span>−${KM(t.rebate)}</span></div>` : ''}
              <div class="flex justify-between"><span>Dostava</span><span>${t.deliveryCost ? KM(t.deliveryCost) : 'besplatno'}</span></div>
            </div>
            <div class="mt-3 flex items-baseline justify-between border-t border-espresso pt-3">
              <span>Ukupno sa PDV-om</span><span class="font-serif text-[34px] leading-none">${KM(t.total)}</span>
            </div>
          </div>
        </aside>
      </div>`;

    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // -------------------------------------------------------------------
  function render() {
    if (mode === 'done') return;
    const next = cartCount() ? 'filled' : 'empty';
    if (next !== mode) {
      mode = next;
      if (next === 'filled') layoutFilled();
      else layoutEmpty();
    }
    if (mode === 'filled') {
      renderItems();
      renderDelivery();
      renderPayment();
      renderSummary();
    } else {
      $('empty-featured').innerHTML = PRODUCTS.filter((p) => p.featured).slice(0, 4).map(productCard).join('');
    }
  }

  render();
  onChange(render);
});
