// @ts-check
// =====================================================================
// GCKit.compare — "Poređenje": up to three products side by side.
// Ported from grand-root (CompareView + toggleCompare, COMPARE_MAX = 3).
//
// Markup hooks:
//   <button data-gck-compare="KNF-001">   toggles; aria-pressed follows
//   <button data-gck-open="compare">       opens the comparison table
//   <span data-gck-count="compare">        live count (hidden while zero)
//
// Table rows come from the adapter's `compareRows` — the host decides
// which facts are worth comparing (price, spec, stock, weight...).
// =====================================================================

'use strict';

(function () {
  const K = /** @type {any} */ (window).GCKit;
  const { esc } = K.text;
  const MAX = 3;
  const list = K.store('compare', { max: MAX });

  const ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 4v16M16 4v16M4 8h8M12 16h8"/></svg>';

  const button = (/** @type {string} */ id, /** @type {string} */ name = '') =>
    `<button type="button" class="gck-toggle" data-gck-compare="${esc(id)}" aria-pressed="${list.has(id)}" aria-label="Uporedi ${esc(name)}" title="Uporedi">${ICON}</button>`;

  function view() {
    const items = /** @type {any[]} */ (list.list().map(K.byId).filter(Boolean));
    const title = `Poređenje (${items.length} od ${MAX})`;
    if (!items.length) {
      return {
        title,
        body: K.ui.empty({ title: 'Nema artikala za poređenje', text: `Na kartici artikla izaberite „Uporedi“, do ${MAX} artikla, da ih vidite jedan uz drugi.` }),
      };
    }
    const cfg = K.cfg;
    const rows = [
      { label: 'Cijena', get: (/** @type {any} */ p) => `${cfg.formatPrice(cfg.price(p))} / ${esc(cfg.unit(p))}` },
      ...cfg.compareRows.map((/** @type {any} */ r) => ({ label: r.label, get: (/** @type {any} */ p) => esc(r.get(p) ?? '—') })),
    ];
    const head = items
      .map((p) => {
        const id = cfg.id(p);
        const url = cfg.url(p);
        return `<th scope="col">
          <div class="gck-thumb gck-thumb--tall" aria-hidden="true">${cfg.thumb(p)}</div>
          ${url ? `<a href="${url}" class="gck-cmp__name">${esc(p.name)}</a>` : `<span class="gck-cmp__name">${esc(p.name)}</span>`}
          <button type="button" class="gck-link" data-gck-compare="${esc(id)}" aria-pressed="true">Ukloni</button>
        </th>`;
      })
      .join('');
    const body = rows
      .map((r) => `<tr><th scope="row">${esc(r.label)}</th>${items.map((p) => `<td>${r.get(p)}</td>`).join('')}</tr>`)
      .join('');
    const buy = items.map((p) => `<td><button type="button" class="gck-btn gck-btn--small" data-gck-add="${esc(cfg.id(p))}">U korpu</button></td>`).join('');
    return {
      title,
      body: `
        <div class="gck-cmp">
          <table>
            <thead><tr><td></td>${head}</tr></thead>
            <tbody>${body}<tr><td></td>${buy}</tr></tbody>
          </table>
        </div>`,
    };
  }

  let showing = false;
  function open() {
    showing = true;
    K.panel.open({ ...view(), wide: true, onClose: () => (showing = false) });
  }

  function sync() {
    document.querySelectorAll('[data-gck-compare]').forEach((b) => {
      b.setAttribute('aria-pressed', String(list.has(/** @type {HTMLElement} */ (b).dataset.gckCompare)));
    });
    document.querySelectorAll('[data-gck-count="compare"]').forEach((el) => {
      el.textContent = String(list.count());
      /** @type {HTMLElement} */ (el).hidden = list.count() === 0;
    });
    if (showing) K.panel.update(view());
  }
  list.subscribe(sync);

  document.addEventListener('click', (e) => {
    const t = /** @type {HTMLElement} */ (e.target);
    const toggle = /** @type {HTMLElement | null} */ (t.closest('[data-gck-compare]'));
    if (toggle) {
      e.preventDefault();
      const id = /** @type {string} */ (toggle.dataset.gckCompare);
      const wasIn = list.has(id);
      if (!wasIn && list.full()) {
        K.cfg.toast(`Uporedite najviše ${MAX} artikla odjednom. Uklonite jedan iz poređenja.`);
        return;
      }
      list.toggle(id);
      return;
    }
    if (t.closest('[data-gck-open="compare"]')) open();
  });

  document.addEventListener('DOMContentLoaded', sync);

  K.compare = { list, button, open, sync, MAX };
})();
