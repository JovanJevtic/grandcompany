// =====================================================================
// Partner program page — account overview, tiers, application form
// =====================================================================

'use strict';

initPage(() => {
  const TIER_OF = { gipsmont: 1, gradnjamont: 2, integral: 3 };

  function creditBar(openPct, cartPct) {
    return `
      <div class="flex h-4 overflow-hidden bg-[#DCE5D8]" aria-hidden="true">
        <div class="h-full bg-espresso" style="width:${openPct}%"></div>
        <div class="h-full bg-oxide" style="width:${cartPct}%"></div>
      </div>`;
  }

  function legend(items) {
    return `<ul class="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-[14px] text-umber">
      ${items.map(([color, label]) => `<li class="flex items-center gap-2"><span class="inline-block h-2.5 w-2.5" style="background:${color}"></span>${label}</li>`).join('')}
    </ul>`;
  }

  function renderAccount() {
    const p = partner();

    if (!p) {
      const demo = PARTNERS[2];
      const openPct = (demo.creditUsed / demo.creditLimit) * 100;
      $('account-panel').innerHTML = `
        <div class="grid items-center gap-10 border border-espresso/15 bg-paper p-7 lg:grid-cols-12 lg:p-10">
          <div class="lg:col-span-5">
            <h2 class="font-serif text-[clamp(2rem,3.4vw,3rem)] leading-tight">Vaš nalog na jednom ekranu.</h2>
            <p class="mt-4 text-[16px] leading-relaxed text-umber">Nakon prijave vidite ugovoreni rabat, valutu i koliko je kreditnog limita ostalo, uključujući robu koja je trenutno u korpi. Probajte sa demo nalogom velikog partnera.</p>
            <button data-login class="${BTN_PRIMARY} mt-7 px-7 py-3.5">Otvorite demo nalog</button>
          </div>
          <div class="lg:col-span-6 lg:col-start-7" aria-hidden="true">
            <p class="text-[14px] text-umber">${esc(demo.tier)}</p>
            <p class="mt-1 font-serif text-[30px] leading-tight">${esc(demo.name)}</p>
            <div class="mt-5 grid grid-cols-3 gap-4 border-t border-espresso/15 pt-4">
              <div><p class="text-[13px] text-umber">Rabat</p><p class="font-serif text-[30px] leading-none">−${pct(demo.discount)}</p></div>
              <div><p class="text-[13px] text-umber">Valuta</p><p class="font-serif text-[30px] leading-none">${demo.paymentDays} dana</p></div>
              <div><p class="text-[13px] text-umber">Limit</p><p class="font-serif text-[30px] leading-none">${fmt0.format(demo.creditLimit / 1000)} hilj.</p></div>
            </div>
            <div class="mt-6">${creditBar(openPct, 0)}</div>
            ${legend([['#221C14', `Otvorene fakture ${KM(demo.creditUsed)}`], ['#DCE5D8', `Slobodno ${KM(demo.creditLimit - demo.creditUsed)}`]])}
          </div>
        </div>`;
      return;
    }

    const t = cartTotals();
    const openPct = Math.min(100, (p.creditUsed / p.creditLimit) * 100);
    const cartPct = Math.min(100 - openPct, (t.subtotal / p.creditLimit) * 100);
    const free = Math.max(0, p.creditLimit - p.creditUsed - t.subtotal);
    const stat = (label, value) => `<div><dt class="text-[13px] text-umber">${label}</dt><dd class="mt-1 font-serif text-[40px] leading-none">${value}</dd></div>`;

    $('account-panel').innerHTML = `
      <div class="border border-espresso/15 bg-paper p-7 lg:p-10">
        <div class="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p class="text-[14px] text-umber">${esc(p.tier)}</p>
            <h2 class="mt-1 font-serif text-[clamp(2.2rem,3.8vw,3.4rem)] leading-tight">${esc(p.name)}</h2>
          </div>
          <p class="text-[14px] text-umber">Sinhronizovano sa Pantheonom u ${syncTime()}</p>
        </div>
        <dl class="mt-8 grid gap-6 border-t border-espresso/15 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          ${stat('Ugovoreni rabat', `−${pct(p.discount)}`)}
          ${stat('Valuta plaćanja', `${p.paymentDays} dana`)}
          ${stat('Kreditni limit', KM(p.creditLimit))}
          ${stat('Slobodno sa korpom', KM(free))}
        </dl>
        <div class="mt-8">
          ${creditBar(openPct, cartPct)}
          ${legend([['#221C14', `Otvorene fakture ${KM(p.creditUsed)}`], ['#7D2E1D', `Roba u korpi ${KM(t.subtotal)}`], ['#DCE5D8', `Slobodno ${KM(free)}`]])}
        </div>
        <div class="mt-8 flex flex-wrap items-center gap-3">
          <a href="katalog.html" class="${BTN_PRIMARY} px-6 py-3.5">Naručite iz kataloga</a>
          <a href="korpa.html" class="${BTN_GHOST} px-6 py-3.5">Korpa</a>
          <button id="panel-logout" class="px-3 py-3 text-[15px] text-umber underline underline-offset-4 hover:text-oxide">Odjava</button>
        </div>
      </div>`;
    $('panel-logout').addEventListener('click', logout);
  }

  function renderTiers() {
    const mine = TIER_OF[state.partnerId];
    $('tiers').innerHTML = PARTNER_TIERS.map((t, i) => `
      <div class="flex flex-col border bg-paper p-6 ${i === mine ? 'border-oxide' : 'border-espresso/15'}">
        <p class="text-[14px] ${i === mine ? 'text-oxide' : 'text-umber'}">${t.name}${i === mine ? ', vaš nivo' : ''}</p>
        <p class="mt-3 font-serif text-[60px] leading-none">${t.rebate}</p>
        <p class="mt-1 text-[14px] text-umber">rabat na sve artikle</p>
        <p class="mt-5 border-t border-espresso/15 pt-4 font-serif text-[21px] leading-snug">${t.who}</p>
        <p class="mt-2 text-[15px] text-umber">${t.limit}</p>
        <p class="text-[15px] text-umber">${t.days}</p>
      </div>`).join('');
  }

  $('partner-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const company = $('pf-company').value.trim();
    $('partner-form').outerHTML = `
      <div class="border border-espresso/15 bg-paper p-8" role="status">
        <p class="text-[15px] text-sage">Zahtjev je zabilježen</p>
        <p class="mt-2 font-serif text-[36px] italic leading-tight">Hvala, ${esc(company)}.</p>
        <p class="mt-3 max-w-[56ch] text-[16px] leading-relaxed text-umber">Komercijalista pregleda podatke i javlja se sa prijedlogom nivoa partnerstva. U demo verziji zahtjev se ne šalje nikome.</p>
      </div>`;
  });

  const render = () => {
    renderAccount();
    renderTiers();
  };
  render();
  onChange(render);
});
