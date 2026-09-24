// @ts-check
// =====================================================================
// GCKit.quickView — "Brzi pregled": the product in a side panel, with
// quantity and add-to-cart, without leaving the catalogue.
// Ported from grand-root (ProductView) and grand-cipher (QuickView);
// cipher's full-screen GSAP zoom is left out on purpose — the panel
// slide is the site's one motion for overlays.
//
// Markup hook: <button data-gck-quick="KNF-001">Brzi pregled</button>
// =====================================================================

'use strict';

(function () {
  const K = /** @type {any} */ (window).GCKit;
  const { esc } = K.text;

  const button = (/** @type {string} */ id, /** @type {string} */ name = '') =>
    `<button type="button" class="gck-quick" data-gck-quick="${esc(id)}" aria-label="Brzi pregled: ${esc(name)}">Brzi pregled</button>`;

  function open(/** @type {string} */ id) {
    const cfg = K.cfg;
    const p = K.byId(id);
    if (!p) {
      K.panel.open({ title: 'Artikal', body: K.ui.empty({ title: 'Artikal nije pronađen', text: 'Moguće je da više nije u ponudi.' }) });
      return;
    }
    const url = cfg.url(p);
    const qty = cfg.defaultQty(p);
    const saveBtn = K.saved ? `<button type="button" class="gck-btn gck-btn--line" data-gck-save="${esc(id)}" aria-pressed="${K.saved.list.has(id)}">Sačuvaj</button>` : '';
    const cmpBtn = K.compare ? `<button type="button" class="gck-btn gck-btn--line" data-gck-compare="${esc(id)}" aria-pressed="${K.compare.list.has(id)}">Uporedi</button>` : '';

    K.panel.open({
      title: 'Brzi pregled',
      body: `
        <div class="gck-thumb gck-thumb--hero" aria-hidden="true">${cfg.thumb(p)}</div>
        ${cfg.meta(p) ? `<p class="gck-meta">${esc(cfg.meta(p))}</p>` : ''}
        <h3 class="gck-qv__name">${esc(p.name)}</h3>
        <p class="gck-qv__price">${cfg.formatPrice(cfg.price(p))} <span>/ ${esc(cfg.unit(p))}, sa PDV-om</span></p>
        ${cfg.description(p) ? `<p class="gck-qv__desc">${esc(cfg.description(p))}</p>` : ''}
        <div class="gck-qv__actions">${saveBtn}${cmpBtn}</div>
        ${url ? `<a href="${url}" class="gck-link gck-qv__more">Sve o artiklu, tehnički podaci i dokumentacija →</a>` : ''}`,
      footer: `
        <div class="gck-buy">
          <label class="gck-buy__qty"><span class="gck-sr">Količina u ${esc(cfg.unit(p))}</span>
            <input type="number" min="0" step="any" value="${qty}" data-gck-qty="${esc(id)}" />
          </label>
          <span class="gck-buy__unit">${esc(cfg.unit(p))}</span>
          <button type="button" class="gck-btn gck-buy__add" data-gck-add="${esc(id)}" data-gck-then-close>U korpu</button>
        </div>`,
    });
  }

  document.addEventListener('click', (e) => {
    const b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('[data-gck-quick]'));
    if (!b) return;
    e.preventDefault();
    open(/** @type {string} */ (b.dataset.gckQuick));
  });

  K.quickView = { open, button };
})();
