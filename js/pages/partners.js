// =====================================================================
// Partner program page — account dashboard, tiers, application form
// The dashboard reads everything through the Pantheon gateway, so the
// invoices, orders and sites can later come from the real ERP.
// =====================================================================

'use strict';

initPage(() => {
  const TIER_OF = { gipsmont: 1, gradnjamont: 2, lazarevo: 3 };
  let tab = 'fakture'; // 'fakture' | 'nalozi' | 'gradilista'

  const EMPTY = (msg) => `<p class="border border-dashed border-ink/25 px-5 py-10 text-center text-[15px] text-muted">${msg}</p>`;
  const stat = (label, value) => `<div><dt class="text-[13px] text-muted">${label}</dt><dd class="tnum mt-1 text-[26px] font-semibold leading-none">${value}</dd></div>`;

  function creditBar(openPct, cartPct) {
    return `
      <div class="flex h-4 overflow-hidden bg-tint" aria-hidden="true">
        <div class="h-full bg-ink" style="width:${openPct}%"></div>
        <div class="h-full bg-steel" style="width:${cartPct}%"></div>
      </div>`;
  }

  function legend(items) {
    return `<ul class="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-[14px] text-muted">
      ${items.map(([color, label]) => `<li class="flex items-center gap-2"><span class="inline-block h-2.5 w-2.5" style="background:${color}"></span>${label}</li>`).join('')}
    </ul>`;
  }

  const INVOICE_STATUS = {
    paid: ['bg-sage/15 text-sage', 'Plaćeno'],
    open: ['bg-well text-muted', 'Otvoreno'],
    overdue: ['bg-steel/10 text-steel', 'Dospjelo'],
  };

  const ORDER_STATUS = {
    Primljena: 'bg-dusk/10 text-dusk',
    Potvrđena: 'bg-ochre/15 text-muted',
    'U pripremi': 'bg-ochre/15 text-muted',
    Isporučena: 'bg-sage/15 text-sage',
  };

  const badge = (cls, label) => `<span class="inline-flex whitespace-nowrap px-2 py-0.5 text-[12px] ${cls}">${label}</span>`;

  const tabBtn = (id, label, count) => {
    const active = tab === id;
    return `<button type="button" role="tab" data-tab="${id}" aria-selected="${active}"
      class="-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-[15px] transition-colors ${active ? 'border-steel font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}">
      ${label}<span class="px-2 py-0.5 text-[12px] ${active ? 'bg-steel text-canvas' : 'bg-well text-muted'}">${count}</span></button>`;
  };

  // -------------------------------------------------------------------
  // Dashboard panels
  // -------------------------------------------------------------------
  function invoiceRow(inv, p) {
    const [cls, label] = INVOICE_STATUS[inv.status];
    const due = inv.paid
      ? 'plaćeno'
      : inv.status === 'overdue'
        ? `dospjelo prije ${Math.abs(inv.daysToDue)} ${plural(Math.abs(inv.daysToDue), 'dan', 'dana', 'dana')}`
        : `dospijeva za ${inv.daysToDue} ${plural(inv.daysToDue, 'dan', 'dana', 'dana')}`;
    return `<li class="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
      <div class="min-w-[12rem]">
        <p class="tnum text-[15px] font-semibold leading-tight">${esc(inv.no)}</p>
        <p class="mt-0.5 text-[13px] text-muted">Izdato ${fmtDate(inv.issued)}, valuta ${p.paymentDays} dana</p>
      </div>
      <div class="flex items-center gap-5">
        ${badge(cls, label)}
        <div class="text-right">
          <p class="font-medium">${KM(inv.amount)}</p>
          <p class="text-[13px] text-muted">${due}</p>
        </div>
      </div>
    </li>`;
  }

  function orderRow(o, siteName) {
    const count = o.items ? o.items.length : 0;
    const status = o.status || 'Primljena';
    const detail = [
      `${count} ${plural(count, 'artikal', 'artikla', 'artikala')}`,
      DELIVERY_SHORT[o.delivery] || '',
      o.deliveryCost ? `dostava ${KM(o.deliveryCost)}` : 'preuzimanje',
    ].filter(Boolean).join(', ');
    return `<li class="py-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="tnum text-[15px] font-semibold leading-tight">${esc(o.no)}</p>
          <p class="mt-0.5 text-[13px] text-muted">${fmtDate(o.date)}${siteName ? `, ${esc(siteName)}` : ''}</p>
        </div>
        ${badge(ORDER_STATUS[status] || 'bg-well text-muted', esc(status))}
      </div>
      <div class="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-[14px]">
        <span class="text-muted">${detail}</span>
        <span class="font-medium">${KM(o.total)}</span>
      </div>
    </li>`;
  }

  const siteCard = (s) => `
    <div class="border border-ink/15 bg-surface p-5">
      <p class="text-[16px] font-semibold leading-tight">${esc(s.name)}</p>
      <p class="mt-2 text-[14px] leading-snug">${esc(s.address)}</p>
      ${s.note ? `<p class="mt-2 text-[13px] leading-snug text-muted">${esc(s.note)}</p>` : ''}
    </div>`;

  function panel() {
    const p = partner();

    if (tab === 'fakture') {
      const invoices = partnerInvoices(p);
      const openTotal = invoices.filter((i) => !i.paid).reduce((s, i) => s + i.amount, 0);
      if (!invoices.length) return EMPTY('Ovaj nalog još nema faktura.');
      return `
        <div class="flex flex-wrap items-baseline justify-between gap-3">
          <h3 class="text-[18px] font-semibold leading-snug">Fakture</h3>
          <p class="text-[14px] text-muted">Otvoreno ukupno <strong class="font-medium text-ink">${KM(openTotal)}</strong></p>
        </div>
        <ul class="mt-2 divide-y divide-ink/10 border-t border-ink/15">${invoices.map((i) => invoiceRow(i, p)).join('')}</ul>
        <p class="mt-4 text-[13px] leading-relaxed text-muted">Fakture se povlače iz Pantheona; nova se pojavi ovdje čim je komercijalista proknjiži.</p>`;
    }

    if (tab === 'nalozi') {
      const orders = partnerOrders(p);
      const siteName = Object.fromEntries(partnerSites(p).map((s) => [s.id, s.name]));
      if (!orders.length) return EMPTY('Još nema narudžbi na ovom nalogu.');
      return `
        <div class="flex flex-wrap items-baseline justify-between gap-3">
          <h3 class="text-[18px] font-semibold leading-snug">Nalozi</h3>
          <p class="text-[14px] text-muted">${orders.length} ${plural(orders.length, 'nalog', 'naloga', 'naloga')}</p>
        </div>
        <ul class="mt-2 divide-y divide-ink/10 border-t border-ink/15">${orders.map((o) => orderRow(o, siteName[o.siteId])).join('')}</ul>
        <p class="mt-4 text-[13px] leading-relaxed text-muted">Status se mijenja kad komercijalist potvrdi narudžbu i kad roba izađe sa stovarišta.</p>`;
    }

    const sites = partnerSites(p);
    return `
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-[18px] font-semibold leading-snug">Gradilišta</h3>
        <button type="button" data-add-site class="${BTN_GHOST} px-4 py-2.5 text-[14px]">Dodaj gradilište</button>
      </div>
      ${sites.length
        ? `<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${sites.map(siteCard).join('')}</div>`
        : `<div class="mt-4">${EMPTY('Još nema sačuvanih gradilišta.')}</div>`}
      <p class="mt-4 text-[13px] leading-relaxed text-muted">Gradilište sa adresom birate pri narudžbi, pa vozač krana odmah zna gdje istovaruje.</p>`;
  }

  // -------------------------------------------------------------------
  // Account header + tabs
  // -------------------------------------------------------------------
  function renderAccount() {
    const p = partner();
    const panelEl = $('account-panel');

    if (!p) {
      const demo = PARTNERS[2];
      const used = creditUsed(demo);
      const openPct = Math.min(100, (used / demo.creditLimit) * 100);
      panelEl.innerHTML = `
        <div class="grid items-center gap-10 border border-ink/15 bg-surface p-7 lg:grid-cols-12 lg:p-10">
          <div class="lg:col-span-5">
            <h2 class="font-serif text-[clamp(1.64rem,2.79vw,2.46rem)] leading-tight">Vaš nalog na jednom ekranu.</h2>
            <p class="mt-4 text-[16px] leading-relaxed text-muted">Nakon prijave vidite ugovoreni rabat, valutu, otvorene fakture i koliko je kreditnog limita ostalo, uključujući robu koja je trenutno u korpi. Probajte sa demo nalogom velikog partnera.</p>
            <button data-login class="${BTN_PRIMARY} mt-7 px-7 py-3.5">Prijava na portal</button>
          </div>
          <div class="lg:col-span-6 lg:col-start-7" aria-hidden="true">
            <p class="text-[14px] text-muted">${esc(demo.tier)}</p>
            <p class="mt-1 font-serif text-[26px] leading-tight">${esc(demo.name)}</p>
            <div class="mt-5 grid grid-cols-3 gap-4 border-t border-ink/15 pt-4">
              <div><p class="text-[13px] text-muted">Rabat</p><p class="tnum text-[22px] font-semibold leading-none">−${pct(demo.discount)}</p></div>
              <div><p class="text-[13px] text-muted">Valuta</p><p class="tnum text-[22px] font-semibold leading-none">${demo.paymentDays} dana</p></div>
              <div><p class="text-[13px] text-muted">Limit</p><p class="tnum text-[22px] font-semibold leading-none">${fmt0.format(demo.creditLimit / 1000)} hilj.</p></div>
            </div>
            <div class="mt-6">${creditBar(openPct, 0)}</div>
            ${legend([['#1B1E22', `Otvorene fakture ${KM(used)}`], ['#E4EAF1', `Slobodno ${KM(demo.creditLimit - used)}`]])}
          </div>
        </div>`;
      return;
    }

    const t = cartTotals();
    const used = creditUsed(p);
    const openPct = Math.min(100, (used / p.creditLimit) * 100);
    const cartPct = Math.min(100 - openPct, (t.subtotal / p.creditLimit) * 100);
    const free = Math.max(0, p.creditLimit - used - t.subtotal);
    const invoices = partnerInvoices(p);
    const orders = partnerOrders(p);
    const sites = partnerSites(p);

    panelEl.innerHTML = `
      <div class="border border-ink/15 bg-surface p-7 lg:p-10">
        <div class="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p class="text-[14px] text-muted">${esc(p.tier)}</p>
            <h2 class="mt-1 font-serif text-[clamp(1.8rem,3.12vw,2.79rem)] leading-tight">${esc(p.name)}</h2>
          </div>
          <div class="text-right">
            <p class="text-[14px] text-muted">Pantheon, ${syncTime()}</p>
            <button id="panel-logout" class="mt-1 text-[15px] text-muted underline underline-offset-4 hover:text-steel">Odjava</button>
          </div>
        </div>
        <dl class="mt-8 grid gap-6 border-t border-ink/15 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          ${stat('Ugovoreni rabat', `−${pct(p.discount)}`)}
          ${stat('Valuta plaćanja', `${p.paymentDays} dana`)}
          ${stat('Kreditni limit', KM(p.creditLimit))}
          ${stat('Slobodno sa korpom', KM(free))}
        </dl>
        <div class="mt-8">
          ${creditBar(openPct, cartPct)}
          ${legend([['#1B1E22', `Otvorene fakture ${KM(openInvoicesTotal(p))}`], ['#274C77', `Roba u korpi ${KM(t.subtotal)}`], ['#E4EAF1', `Slobodno ${KM(free)}`]])}
        </div>
        <div class="mt-8 flex flex-wrap items-center gap-3">
          <a href="katalog.html" class="${BTN_PRIMARY} px-6 py-3.5">Naručite iz kataloga</a>
          <a href="korpa.html" class="${BTN_GHOST} px-6 py-3.5">Korpa</a>
        </div>
      </div>

      <div class="mt-6 border border-ink/15 bg-surface p-7 lg:p-10">
        <div class="flex flex-wrap gap-1 border-b border-ink/15" role="tablist" aria-label="Pregled naloga">
          ${tabBtn('fakture', 'Fakture', invoices.length)}
          ${tabBtn('nalozi', 'Nalozi', orders.length)}
          ${tabBtn('gradilista', 'Gradilišta', sites.length)}
        </div>
        <div class="pt-6" role="tabpanel">${panel()}</div>
      </div>`;

    panelEl.querySelector('#panel-logout').addEventListener('click', logout);
    panelEl.querySelectorAll('[data-tab]').forEach((btn) =>
      btn.addEventListener('click', () => {
        tab = btn.dataset.tab;
        renderAccount();
      })
    );
    panelEl.querySelector('[data-add-site]')?.addEventListener('click', openSiteModal);
  }

  function openSiteModal() {
    openModal(`
      <div class="p-7">
        <h2 class="font-serif text-[26px] leading-tight">Novo gradilište</h2>
        <p class="mt-2 text-[14px] text-muted">Adresa i napomena pomažu vozaču da nađe pristup za kamion.</p>
        <form id="site-form" class="mt-6 space-y-4">
          <label class="block"><span class="${LABEL}">Naziv gradilišta</span>
            <input id="site-name" required class="${FIELD}" placeholder="Stan, Borik" /></label>
          <label class="block"><span class="${LABEL}">Adresa</span>
            <input id="site-address" required class="${FIELD}" placeholder="Ulica i broj, mjesto" /></label>
          <label class="block"><span class="${LABEL}">Napomena za dostavu, opciono</span>
            <textarea id="site-note" rows="2" class="${FIELD}" placeholder="Sprat, pristup za kamion, najava"></textarea></label>
          <div class="flex gap-3 pt-2">
            <button type="submit" id="site-submit" class="${BTN_PRIMARY} flex-1 py-3">Sačuvaj gradilište</button>
            <button type="button" data-close-modal class="${BTN_GHOST} px-6 py-3">Otkaži</button>
          </div>
        </form>
      </div>`);

    $('site-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = $('site-submit');
      btn.disabled = true;
      btn.textContent = 'Čuvam…';
      await Pantheon.saveSite({
        name: $('site-name').value.trim(),
        address: $('site-address').value.trim(),
        note: $('site-note').value.trim(),
      });
      closeModal();
      toast('Gradilište je dodato u vaš nalog.');
    });
  }

  function renderTiers() {
    const mine = TIER_OF[state.partnerId];
    $('tiers').innerHTML = PARTNER_TIERS.map((t, i) => `
      <div class="flex flex-col border bg-surface p-6 ${i === mine ? 'border-steel' : 'border-ink/15'}">
        <p class="text-[14px] ${i === mine ? 'text-steel' : 'text-muted'}">${t.name}${i === mine ? ', vaš nivo' : ''}</p>
        <p class="tnum mt-3 font-serif text-[40px] leading-none">${t.rebate}</p>
        <p class="mt-1 text-[14px] text-muted">rabat na sve artikle</p>
        <p class="mt-5 border-t border-ink/15 pt-4 text-[16px] font-semibold leading-snug">${t.who}</p>
        <p class="mt-2 text-[15px] text-muted">${t.limit}</p>
        <p class="text-[15px] text-muted">${t.days}</p>
      </div>`).join('');
  }

  $('partner-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const company = $('pf-company').value.trim();
    $('partner-form').outerHTML = `
      <div class="border border-ink/15 bg-surface p-8" role="status">
        <p class="text-[15px] text-sage">Zahtjev je zabilježen</p>
        <p class="mt-2 font-serif text-[31px] leading-tight">Hvala, ${esc(company)}.</p>
        <p class="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-muted">Komercijalista pregleda podatke i javlja se sa prijedlogom nivoa partnerstva. U demo verziji zahtjev se ne šalje nikome.</p>
      </div>`;
  });

  const render = () => {
    renderAccount();
    renderTiers();
  };
  render();
  onChange(render);
});
