// @ts-check
// =====================================================================
// GCKit.bundles — "Kompleti": a ready list of articles for one job,
// added to the cart with one click.
// Ported from grand-maison (Bundles.tsx + bundleTotals).
//
//   GCKit.bundles.render(el, bundles)
//   bundle = { id, name, note, items: [[productId, qty], ...], off? }
//
// The total is always computed from live catalogue prices. `off` is a
// discount share (0.05 = 5%) and defaults to 0: only set it when the
// company has actually agreed to sell the bundle cheaper.
// =====================================================================

'use strict';

(function () {
  const K = /** @type {any} */ (window).GCKit;
  const { esc } = K.text;

  /**
   * @typedef {{ id: string, name: string, note?: string, items: [string, number][], off?: number }} Bundle
   * @param {Bundle} b
   */
  function totals(b) {
    const cfg = K.cfg;
    const sum = b.items.reduce((s, [id, qty]) => {
      const p = K.byId(id);
      return s + (p ? cfg.price(p) * qty : 0);
    }, 0);
    const price = sum * (1 - (b.off || 0));
    return { sum, price, save: sum - price };
  }

  /** @param {HTMLElement} el @param {Bundle[]} bundles */
  function render(el, bundles) {
    const cfg = K.cfg;
    el.innerHTML = `<div class="gck-bundles">${bundles
      .map((b) => {
        const t = totals(b);
        const rows = b.items
          .map(([id, qty]) => {
            const p = K.byId(id);
            if (!p) return '';
            return `<li><span><span class="gck-num">${qty} ${esc(cfg.unit(p))}</span> ${esc(p.name)}</span><span class="gck-num">${cfg.formatPrice(cfg.price(p) * qty)}</span></li>`;
          })
          .join('');
        return `
          <article class="gck-bundle">
            <h3 class="gck-bundle__name">${esc(b.name)}</h3>
            ${b.note ? `<p class="gck-bundle__note">${esc(b.note)}</p>` : ''}
            <ul class="gck-bundle__lines">${rows}</ul>
            <div class="gck-bundle__foot">
              <div>
                ${t.save > 0 ? `<p class="gck-bundle__was gck-num">${cfg.formatPrice(t.sum)}</p>` : ''}
                <p class="gck-bundle__price gck-num">${cfg.formatPrice(t.price)}</p>
              </div>
              <button type="button" class="gck-btn" data-gck-bundle="${esc(b.id)}">Komplet u korpu</button>
            </div>
          </article>`;
      })
      .join('')}</div>`;

    el.addEventListener('click', (e) => {
      const btn = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('[data-gck-bundle]'));
      if (!btn) return;
      const b = bundles.find((x) => x.id === btn.dataset.gckBundle);
      if (!b) return;
      b.items.forEach(([id, qty]) => K.byId(id) && cfg.addToCart(id, qty));
    });
  }

  K.bundles = { render, totals };
})();
