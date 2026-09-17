// =====================================================================
// Calculator page — Knauf W111 bill of materials, live as you type
// =====================================================================

'use strict';

initPage(() => {
  let last = null;

  const readInput = () => ({
    L: parseFloat($('calc-l').value),
    H: parseFloat($('calc-h').value),
    cladding: $('calc-cladding').value,
    plateSku: $('calc-plate').value,
    cwSku: $('calc-cw').value,
    woolSku: $('calc-wool').value || null,
    fillerSku: $('calc-filler').value,
    soundTape: $('calc-soundtape').checked,
  });

  function run() {
    const input = readInput();
    if (!(input.L > 0) || !(input.H > 0)) {
      last = null;
      $('bom-results').innerHTML = `
        <div class="border border-dashed border-ink/30 px-6 py-16 text-center">
          <p class="font-serif text-[24px]">Unesite dužinu i visinu zida.</p>
          <p class="mt-2 text-muted">Obje vrijednosti moraju biti veće od nule, u metrima.</p>
        </div>`;
      return;
    }
    last = { input, bom: calcW111(input) };
    renderBom();
  }

  function renderBom() {
    const { input, bom } = last;
    const weight = bom.items.reduce((s, it) => s + bySku[it.sku].weight * it.qty, 0);
    const b2b = partner();

    const rows = bom.items.map((it) => {
      const p = bySku[it.sku];
      return `
        <tr class="border-b border-ink/10 align-middle">
          <td class="py-3 pr-4">
            <div class="flex items-center gap-3">
              <a href="${productUrl(p)}" class="block h-14 w-[4.7rem] shrink-0 bg-well p-0.5" tabindex="-1" aria-hidden="true">${productArt(p)}</a>
              <div>
                <a href="${productUrl(p)}" class="text-[14px] font-medium leading-snug hover:text-steel">${esc(p.name)}</a>
                <p class="text-[12px] text-muted">${p.sku}</p>
              </div>
            </div>
          </td>
          <td class="whitespace-nowrap py-3 pr-4 text-right text-[14px] text-muted">${it.need}</td>
          <td class="whitespace-nowrap py-3 pr-4 text-right"><span class="text-[15px] font-medium">${qtyFmt(it.qty)} ${p.unit}</span><br /><span class="text-[12px] text-muted">${it.note}</span></td>
          <td class="whitespace-nowrap py-3 text-right text-[15px] font-medium">${KM(priceOf(p) * it.qty)}</td>
        </tr>`;
    }).join('');

    $('bom-results').innerHTML = `
      <div class="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink pb-4">
        <h2 class="font-serif text-[28px] leading-tight">Specifikacija materijala</h2>
        <p class="text-[15px] text-muted">Zid ${fmt2.format(input.L)} × ${fmt2.format(input.H)} m, ${fmt2.format(bom.P)} m², oko ${fmt0.format(weight)} kg</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px]">
          <thead>
            <tr class="text-left text-[12px] text-muted">
              <th class="py-3 font-normal">Artikal</th>
              <th class="py-3 pr-4 text-right font-normal">Normativ</th>
              <th class="py-3 pr-4 text-right font-normal">Za narudžbu</th>
              <th class="py-3 text-right font-normal">Iznos</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="mt-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p class="text-[14px] text-muted">Ukupno sa PDV-om${b2b ? `, uključen rabat −${pct(discount())}` : ''}</p>
          <p class="tnum mt-1 text-[34px] font-semibold leading-none ${b2b ? 'text-steel' : ''}">${KM(bomTotal(bom))}</p>
        </div>
        <button data-bom-add class="${BTN_PRIMARY} px-8 py-4 text-[16px]">Dodaj sve u korpu</button>
      </div>
      ${weight >= CRANE_RECOMMEND_OVER_KG
        ? `<p class="mt-5 border-l-2 border-steel pl-3 text-[15px] text-muted">Pošiljka prelazi tonu, pa preporučujemo <a href="dostava.html" class="text-steel underline underline-offset-4">dostavu kamionom sa kranom</a>.</p>`
        : ''}`;
  }

  $('bom-results').addEventListener('click', (e) => {
    if (!e.target.closest('[data-bom-add]') || !last) return;
    last.bom.items.forEach((it) => addToCart(it.sku, it.qty));
    toast(`U korpu je dodano ${last.bom.items.length} stavki iz kalkulatora.`, { label: 'Otvori korpu', onClick: openCart });
  });

  const form = $('calc-form');
  form.addEventListener('input', run);
  form.addEventListener('change', run);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run();
  });

  run();
  onChange(() => last && renderBom());
});
