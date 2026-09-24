// @ts-check
// =====================================================================
// GCKit.saved — "Sačuvano": a wishlist kept in the browser.
// Ported from grand-root (SavedView + toggleSaved in ShopProvider).
//
// Markup hooks (work anywhere on the page, also in HTML rendered later):
//   <button data-gck-save="KNF-001">      toggles the product; aria-pressed follows
//   <button data-gck-open="saved">        opens the saved panel
//   <span data-gck-count="saved">         live count (hidden while zero)
// =====================================================================

'use strict';

(function () {
  const K = /** @type {any} */ (window).GCKit;
  const { esc, plural } = K.text;
  const list = K.store('saved');

  const HEART = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';

  /** Icon-only toggle for a product card */
  const button = (/** @type {string} */ id, /** @type {string} */ name = '') =>
    `<button type="button" class="gck-toggle" data-gck-save="${esc(id)}" aria-pressed="${list.has(id)}" aria-label="Sačuvaj ${esc(name)}" title="Sačuvaj">${HEART}</button>`;

  function view() {
    const items = /** @type {any[]} */ (list.list().map(K.byId).filter(Boolean));
    const title = `Sačuvano (${items.length})`;
    if (!items.length) {
      return {
        title,
        body: K.ui.empty({ title: 'Ništa nije sačuvano', text: 'Sačuvajte artikle srcem na kartici da ih kasnije lakše nađete. Lista ostaje u ovom pregledniku.' }),
        footer: '',
      };
    }
    const rows = items
      .map((p) => {
        const id = K.cfg.id(p);
        return K.ui.row(p, `
          <div class="gck-row__actions">
            <button type="button" class="gck-btn gck-btn--small" data-gck-add="${esc(id)}">U korpu</button>
            <button type="button" class="gck-link" data-gck-save="${esc(id)}" aria-pressed="true">Ukloni</button>
          </div>`);
      })
      .join('');
    return {
      title,
      body: `<ul class="gck-rows">${rows}</ul>`,
      footer: `<button type="button" class="gck-btn gck-btn--block" data-gck-add-all="saved">Sve u korpu (${items.length} ${plural(items.length, 'artikal', 'artikla', 'artikala')})</button>`,
    };
  }

  let showing = false;
  function open() {
    showing = true;
    K.panel.open({ ...view(), onClose: () => (showing = false) });
  }

  function sync() {
    document.querySelectorAll('[data-gck-save]').forEach((b) => {
      b.setAttribute('aria-pressed', String(list.has(/** @type {HTMLElement} */ (b).dataset.gckSave)));
    });
    document.querySelectorAll('[data-gck-count="saved"]').forEach((el) => {
      el.textContent = String(list.count());
      /** @type {HTMLElement} */ (el).hidden = list.count() === 0;
    });
    if (showing) K.panel.update(view());
  }
  list.subscribe(sync);

  document.addEventListener('click', (e) => {
    const t = /** @type {HTMLElement} */ (e.target);
    const toggle = /** @type {HTMLElement | null} */ (t.closest('[data-gck-save]'));
    if (toggle) {
      e.preventDefault();
      const id = /** @type {string} */ (toggle.dataset.gckSave);
      // No toast: the pressed button and the header count already say it
      list.toggle(id);
      return;
    }
    if (t.closest('[data-gck-open="saved"]')) return open();
    if (t.closest('[data-gck-add-all="saved"]')) {
      list.list().forEach((/** @type {string} */ id) => {
        const p = K.byId(id);
        if (p) K.cfg.addToCart(id, K.cfg.defaultQty(p));
      });
      K.panel.close();
    }
  });

  // Hooks rendered after this script ran (catalogue grids) need their state
  document.addEventListener('DOMContentLoaded', sync);

  K.saved = { list, button, open, sync };
})();
