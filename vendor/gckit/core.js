// @ts-check
// =====================================================================
// GCKit core — shared plumbing for every component in the kit.
//
//   GCKit.configure(adapter)  the host site tells the kit how to read its
//                              products, format prices and add to its cart
//   GCKit.store(key, opts)    a list persisted in localStorage (saved, compare)
//   GCKit.panel               one right-hand side panel with focus trap
//   GCKit.text                search normalisation, Serbian plurals, tokens
//
// Plain browser JavaScript, no build step: every file adds itself to the
// global `GCKit` object, so load core.js first and the components after it.
// Ported from Marija's Next.js shops (mqrijqm/grand-root, grand-cipher).
// =====================================================================

'use strict';

(function () {
  /**
   * What the kit needs to know about the host shop. Only `products`,
   * `formatPrice` and `addToCart` are required; the rest have defaults.
   *
   * @typedef {Object} Product
   * @property {string} id
   * @property {string} name
   *
   * @typedef {Object} Adapter
   * @property {() => any[]} products                    every product in the catalogue
   * @property {(p: any) => string} [id]                 product id (default: p.id ?? p.sku)
   * @property {(p: any) => number} [price]              current unit price (default: p.price)
   * @property {(n: number) => string} formatPrice
   * @property {(p: any) => string} [unit]               sales unit, e.g. "m²"
   * @property {(p: any) => string} [thumb]              HTML for a small product picture
   * @property {(p: any) => string} [url]                product page URL
   * @property {(p: any) => string} [meta]               one caps micro line (brand, spec)
   * @property {(p: any) => string} [description]
   * @property {(p: any) => number} [defaultQty]         quantity preset in quick view
   * @property {(id: string, qty: number) => void} addToCart
   * @property {(message: string) => void} [toast]
   * @property {{ label: string, get: (p: any) => string }[]} [compareRows]
   * @property {string} [storagePrefix]                  localStorage key prefix
   */

  /** @type {Required<Adapter>} */
  const cfg = {
    products: () => [],
    id: (p) => p.id ?? p.sku,
    price: (p) => p.price,
    formatPrice: (n) => `${n.toFixed(2)} KM`,
    unit: (p) => p.unit || 'kom',
    thumb: () => '',
    url: () => '',
    meta: () => '',
    description: (p) => p.desc || p.description || '',
    defaultQty: () => 1,
    addToCart: () => {},
    toast: () => {},
    compareRows: [],
    storagePrefix: 'gck',
  };

  /** @param {Adapter} adapter */
  function configure(adapter) {
    Object.assign(cfg, adapter);
  }

  /** @param {string} id */
  const byId = (id) => cfg.products().find((p) => cfg.id(p) === id) || null;

  // -------------------------------------------------------------------
  // Text helpers
  // -------------------------------------------------------------------
  const esc = (/** @type {unknown} */ s) =>
    String(s).replace(/[&<>"']/g, (c) => /** @type {Record<string,string>} */ ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // "Ploča", "ploca" and "PLOČA" should all match: fold case and diacritics.
  // đ has no combining form, so it needs its own rule.
  const fold = (/** @type {string} */ s) =>
    s.toLowerCase().replace(/đ/g, 'dj').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Serbian plurals: 1 artikal, 2–4 artikla, 5+ artikala; 11–14 take the "many" form.
  function plural(/** @type {number} */ n, /** @type {string} */ one, /** @type {string} */ few, /** @type {string} */ many) {
    const d10 = n % 10, d100 = n % 100;
    if (d10 === 1 && d100 !== 11) return one;
    if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return few;
    return many;
  }

  /**
   * Replace {token} with a value and *text* with <em>. An unknown value is
   * never invented: it renders as a highlighted [label] until someone fills it.
   * @param {string} input
   * @param {Record<string, string | null | undefined>} values
   * @param {Record<string, string>} [labels] readable names for missing tokens
   */
  function fillTokens(input, values, labels = {}) {
    return esc(input)
      .replace(/\{(\w+)\}/g, (_, key) => {
        const v = values[key];
        return v ? esc(v) : `<mark class="gck-missing">[${esc(labels[key] || key)}]</mark>`;
      })
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  // -------------------------------------------------------------------
  // Persisted lists (saved, compare). Reading and writing must never break
  // the page: private windows and blocked storage just keep the list in memory.
  // -------------------------------------------------------------------
  /**
   * @param {string} name
   * @param {{ max?: number }} [opts]
   */
  function store(name, opts = {}) {
    const key = `${cfg.storagePrefix}-${name}`;
    /** @type {Set<() => void>} */
    const subs = new Set();
    /** @type {string[]} */
    let items = [];

    function read() {
      try {
        const raw = JSON.parse(localStorage.getItem(key) || '[]');
        // Drop ids of products that left the catalogue
        items = Array.isArray(raw) ? raw.filter((id) => typeof id === 'string' && byId(id)) : [];
        if (opts.max) items = items.slice(0, opts.max);
      } catch {
        items = [];
      }
    }
    function write() {
      try {
        localStorage.setItem(key, JSON.stringify(items));
      } catch {
        /* storage unavailable — the list lives for this visit only */
      }
      subs.forEach((fn) => fn());
    }

    // Read lazily: component scripts create their stores before the host
    // calls configure(), and until then no product id would look valid.
    let loaded = false;
    const ensure = () => {
      if (!loaded) {
        loaded = true;
        read();
      }
    };
    // Another tab changed the list
    window.addEventListener('storage', (e) => {
      if (e.key !== key) return;
      loaded = true;
      read();
      subs.forEach((fn) => fn());
    });

    return {
      list: () => (ensure(), [...items]),
      has: (/** @type {string} */ id) => (ensure(), items.includes(id)),
      count: () => (ensure(), items.length),
      full: () => (ensure(), !!opts.max && items.length >= opts.max),
      /** @returns {boolean} true when the id is in the list afterwards */
      toggle(/** @type {string} */ id) {
        ensure();
        if (items.includes(id)) items = items.filter((x) => x !== id);
        else if (opts.max && items.length >= opts.max) return false;
        else items = [...items, id];
        write();
        return items.includes(id);
      },
      remove(/** @type {string} */ id) {
        ensure();
        items = items.filter((x) => x !== id);
        write();
      },
      clear() {
        items = [];
        write();
      },
      subscribe(/** @type {() => void} */ fn) {
        subs.add(fn);
        return () => subs.delete(fn);
      },
    };
  }

  // -------------------------------------------------------------------
  // Focus trap (from grand-cipher's useDialog): Escape closes, Tab cycles
  // inside the dialog, and closing returns focus to the button that opened it.
  // -------------------------------------------------------------------
  const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  /**
   * @param {HTMLElement} el
   * @param {() => void} onClose
   * @returns {() => void} release
   */
  function trapFocus(el, onClose) {
    const opener = /** @type {HTMLElement | null} */ (document.activeElement);
    el.tabIndex = -1;
    el.focus({ preventScroll: true });

    /** @param {KeyboardEvent} e */
    function onKey(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        return onClose();
      }
      if (e.key !== 'Tab') return;
      const nodes = [...el.querySelectorAll(FOCUSABLE)].filter((n) => /** @type {HTMLElement} */ (n).offsetParent !== null);
      if (!nodes.length) return;
      const first = /** @type {HTMLElement} */ (nodes[0]);
      const last = /** @type {HTMLElement} */ (nodes[nodes.length - 1]);
      const now = document.activeElement;
      // Focus fell out (its button was re-rendered away): pull it back in
      if (!el.contains(now)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && (now === first || now === el)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && now === last) {
        e.preventDefault();
        first.focus();
      }
    }
    // Listen on the document, not the dialog: when a re-render removes the
    // focused button, focus drops to <body> and Escape must still work.
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }

  // -------------------------------------------------------------------
  // Side panel (from grand-root's Panels): one panel at a time slides in
  // from the right. It stays in the DOM until the exit transition ends.
  // -------------------------------------------------------------------
  const panel = (() => {
    /** @type {HTMLElement | null} */ let root = null;
    /** @type {(() => void) | null} */ let release = null;
    /** @type {(() => void) | null} */ let onCloseCb = null;
    let hideTimer = 0;

    function mount() {
      if (root) return root;
      root = document.createElement('div');
      root.className = 'gck-panel-root';
      root.innerHTML = `
        <div class="gck-scrim" data-gck-close></div>
        <aside class="gck-panel" role="dialog" aria-modal="true" aria-labelledby="gck-panel-title">
          <header class="gck-panel__head">
            <h2 id="gck-panel-title" class="gck-panel__title"></h2>
            <button type="button" class="gck-icon-btn" data-gck-close aria-label="Zatvori">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </header>
          <div class="gck-panel__body"></div>
          <footer class="gck-panel__foot"></footer>
        </aside>`;
      document.body.append(root);
      root.addEventListener('click', (e) => {
        if (/** @type {HTMLElement} */ (e.target).closest('[data-gck-close]')) close();
      });
      return root;
    }

    /**
     * @param {{ title: string, body: string, footer?: string, wide?: boolean, onClose?: () => void }} view
     */
    function open(view) {
      const r = mount();
      clearTimeout(hideTimer);
      const box = /** @type {HTMLElement} */ (r.querySelector('.gck-panel'));
      /** @type {HTMLElement} */ (r.querySelector('.gck-panel__title')).textContent = view.title;
      /** @type {HTMLElement} */ (r.querySelector('.gck-panel__body')).innerHTML = view.body;
      const foot = /** @type {HTMLElement} */ (r.querySelector('.gck-panel__foot'));
      foot.innerHTML = view.footer || '';
      foot.hidden = !view.footer;
      box.classList.toggle('is-wide', !!view.wide);
      onCloseCb = view.onClose || null;

      if (!r.classList.contains('is-open')) {
        r.hidden = false;
        document.documentElement.classList.add('gck-locked');
        // Two frames: let the closed state paint so the slide-in transition runs
        requestAnimationFrame(() => requestAnimationFrame(() => r.classList.add('is-open')));
        release = trapFocus(box, close);
      }
      return box;
    }

    /** Re-render the open panel in place (after a list changed) */
    function update(/** @type {{ title?: string, body?: string, footer?: string }} */ view) {
      if (!root || !isOpen()) return;
      if (view.title != null) /** @type {HTMLElement} */ (root.querySelector('.gck-panel__title')).textContent = view.title;
      if (view.body != null) /** @type {HTMLElement} */ (root.querySelector('.gck-panel__body')).innerHTML = view.body;
      if (view.footer != null) {
        const foot = /** @type {HTMLElement} */ (root.querySelector('.gck-panel__foot'));
        foot.innerHTML = view.footer;
        foot.hidden = !view.footer;
      }
    }

    function close() {
      if (!root || !isOpen()) return;
      root.classList.remove('is-open');
      document.documentElement.classList.remove('gck-locked');
      release?.();
      release = null;
      const cb = onCloseCb;
      onCloseCb = null;
      cb?.();
      const r = root;
      hideTimer = window.setTimeout(() => (r.hidden = true), 450);
    }

    const isOpen = () => !!root && root.classList.contains('is-open');
    const body = () => /** @type {HTMLElement | null} */ (root?.querySelector('.gck-panel') || null);

    return { open, update, close, isOpen, body };
  })();

  // Small building blocks shared by several components
  const ui = {
    /** @param {{ title: string, text: string, action?: string }} o */
    empty: (o) => `
      <div class="gck-empty">
        <p class="gck-empty__title">${esc(o.title)}</p>
        <p class="gck-empty__text">${esc(o.text)}</p>
        ${o.action || ''}
      </div>`,
    /** Product row: picture, name, price. `extra` goes under the price. */
    row: (/** @type {any} */ p, /** @type {string} */ extra = '') => {
      const url = cfg.url(p);
      const name = url ? `<a href="${url}" class="gck-row__name">${esc(p.name)}</a>` : `<span class="gck-row__name">${esc(p.name)}</span>`;
      return `
        <li class="gck-row">
          <div class="gck-thumb" aria-hidden="true">${cfg.thumb(p)}</div>
          <div class="gck-row__main">
            ${name}
            <p class="gck-row__price">${cfg.formatPrice(cfg.price(p))} <span>/ ${esc(cfg.unit(p))}</span></p>
            ${extra}
          </div>
        </li>`;
    },
  };

  // Any kit button with data-gck-add="<id>" puts the product in the host cart.
  // A [data-gck-qty] field inside the same panel sets the quantity.
  document.addEventListener('click', (e) => {
    const btn = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('[data-gck-add]'));
    if (!btn) return;
    const id = /** @type {string} */ (btn.dataset.gckAdd);
    const p = byId(id);
    if (!p) return;
    const field = /** @type {HTMLInputElement | null} */ (btn.closest('.gck-panel')?.querySelector(`[data-gck-qty="${CSS.escape(id)}"]`) || null);
    const qty = parseFloat(field?.value || '') || cfg.defaultQty(p);
    cfg.addToCart(id, qty);
    if (btn.hasAttribute('data-gck-then-close')) panel.close();
  });

  const GCKit = /** @type {any} */ (window).GCKit || {};
  Object.assign(GCKit, {
    configure,
    cfg,
    byId,
    store,
    panel,
    trapFocus,
    ui,
    text: { esc, fold, plural, fillTokens },
  });
  /** @type {any} */ (window).GCKit = GCKit;
})();
