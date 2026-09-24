// @ts-check
// =====================================================================
// GCKit.searchSuggest — live suggestions under an existing search field.
// Ported from grand-root's SearchView, but attached to the site's own
// search input instead of opening a second search (one search per screen).
//
//   GCKit.searchSuggest.attach(inputEl, { fields, limit })
//
// Accessible combobox: arrows move, Enter opens the highlighted product,
// Escape closes; with nothing highlighted the form submits as before.
// Matching ignores case and diacritics ("ploca" finds "ploča"), and every
// word must match somewhere ("cw 75" finds "profil CW 75").
// =====================================================================

'use strict';

(function () {
  const K = /** @type {any} */ (window).GCKit;
  const { esc, fold } = K.text;
  let uid = 0;

  /**
   * @param {any[]} products
   * @param {string} query
   * @param {(p: any) => string[]} fields
   */
  function search(products, query, fields) {
    const words = fold(query).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return products
      .map((p) => {
        const hay = fields(p).map((f) => fold(String(f || '')));
        let score = 0;
        for (const w of words) {
          const hit = hay.findIndex((h) => h.includes(w));
          if (hit < 0) return null;
          // Name hits outrank spec hits; a word at the start of the name ranks highest
          score += hit === 0 ? (hay[0].startsWith(w) ? 3 : 2) : 1;
        }
        return { p, score };
      })
      .filter(Boolean)
      .sort((a, b) => /** @type {any} */ (b).score - /** @type {any} */ (a).score)
      .map((r) => /** @type {any} */ (r).p);
  }

  /**
   * @param {HTMLInputElement} input
   * @param {{ fields?: (p: any) => string[], limit?: number, allUrl?: (q: string) => string }} [opts]
   */
  function attach(input, opts = {}) {
    const cfg = K.cfg;
    const fields = opts.fields || ((/** @type {any} */ p) => [p.name, cfg.id(p), cfg.meta(p)]);
    const limit = opts.limit || 6;
    const listId = `gck-suggest-${++uid}`;

    const box = document.createElement('div');
    box.className = 'gck-suggest';
    box.hidden = true;
    box.innerHTML = `<ul id="${listId}" role="listbox" aria-label="Prijedlozi"></ul><p class="gck-suggest__foot" aria-live="polite"></p>`;
    const wrap = input.closest('form') || input.parentElement;
    /** @type {HTMLElement} */ (wrap).classList.add('gck-suggest-host');
    /** @type {HTMLElement} */ (wrap).append(box);
    const ul = /** @type {HTMLElement} */ (box.querySelector('ul'));
    const foot = /** @type {HTMLElement} */ (box.querySelector('.gck-suggest__foot'));

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', listId);
    input.setAttribute('aria-expanded', 'false');
    input.autocomplete = 'off';

    /** @type {any[]} */ let results = [];
    let active = -1;

    function render() {
      const q = input.value.trim();
      if (q.length < 2) return hide();
      const all = search(cfg.products(), q, fields);
      results = all.slice(0, limit);
      active = -1;
      ul.innerHTML = results
        .map((p, i) => `
          <li id="${listId}-${i}" role="option" aria-selected="false" data-i="${i}">
            <span class="gck-thumb gck-thumb--xs" aria-hidden="true">${cfg.thumb(p)}</span>
            <span class="gck-suggest__name">${esc(p.name)}<small>${esc(cfg.meta(p))}</small></span>
            <span class="gck-suggest__price">${cfg.formatPrice(cfg.price(p))}</span>
          </li>`)
        .join('');
      const allUrl = opts.allUrl ? opts.allUrl(q) : '';
      foot.innerHTML = all.length
        ? `${all.length > limit ? `Prikazano ${limit} od ${all.length}. ` : ''}${allUrl ? `<a href="${allUrl}">Svi rezultati za „${esc(q)}“ →</a>` : ''}`
        : `Nema artikala za „${esc(q)}“. Pokušajte šifrom ili dimenzijom, npr. „12,5“.`;
      box.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    function hide() {
      box.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    }

    function highlight(/** @type {number} */ i) {
      active = i;
      ul.querySelectorAll('[role="option"]').forEach((li, n) => li.setAttribute('aria-selected', String(n === i)));
      if (i >= 0) input.setAttribute('aria-activedescendant', `${listId}-${i}`);
      else input.removeAttribute('aria-activedescendant');
    }

    function go(/** @type {number} */ i) {
      const p = results[i];
      if (!p) return;
      const url = cfg.url(p);
      hide();
      if (url) location.href = url;
      else if (K.quickView) K.quickView.open(cfg.id(p));
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', () => input.value.trim().length > 1 && render());
    input.addEventListener('keydown', (e) => {
      if (box.hidden) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlight(Math.min(results.length - 1, active + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlight(Math.max(-1, active - 1));
      } else if (e.key === 'Enter' && active >= 0) {
        e.preventDefault();
        go(active);
      } else if (e.key === 'Escape') {
        hide();
      }
    });
    // Pressing inside the box must not blur the input, or the box would close
    // before the click lands; links in the footer still get their click.
    box.addEventListener('mousedown', (e) => e.preventDefault());
    ul.addEventListener('click', (e) => {
      const li = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('[data-i]'));
      if (li) go(Number(li.dataset.i));
    });
    input.addEventListener('blur', () => setTimeout(hide, 120));
  }

  K.searchSuggest = { attach, search };
})();
