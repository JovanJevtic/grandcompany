// @ts-check
// =====================================================================
// GCKit.legal — legal and service pages (dostava, povrat, reklamacije,
// uslovi kupovine, privatnost...) rendered from data/legal-docs.js.
// Ported from grand-root (LegalPage.tsx, company.ts parseText).
//
//   GCKit.legal.render(el, slug, {
//     values,   // { naziv, sjediste, jib, email, ... } — null = still unknown
//     docUrl,   // (slug) => URL of that document on the host site
//     include,  // optional list of slugs to publish (others are ignored)
//     draft,    // true shows the "Nacrt" note until a lawyer signs off
//   })
//
// Unknown company data is never invented: {racun} with no value renders
// as a highlighted [žiro račun] so the gap is visible before launch.
// =====================================================================

'use strict';

(function () {
  const K = /** @type {any} */ (window).GCKit;
  const { esc, fillTokens } = K.text;

  const LABELS = {
    naziv: 'naziv firme',
    sjediste: 'sjedište',
    jib: 'JIB',
    pdv: 'PDV broj',
    registracija: 'registracija',
    racun: 'žiro račun',
    email: 'e-pošta',
    telefon: 'telefon',
    web: 'web adresa',
    direktor: 'direktor',
    rokIsporuke: 'rok isporuke',
    zonaDostave: 'područje dostave',
    besplatnaDostava: 'prag besplatne dostave',
    rokOdustanka: 'rok za odustanak',
  };

  /**
   * @typedef {{ values: Record<string, string | null>, docUrl: (slug: string) => string, include?: string[], draft?: boolean }} LegalOpts
   */

  /** @param {LegalOpts} opts */
  const docs = (opts) => K.LEGAL_DOCS.filter((/** @type {any} */ d) => !opts.include || opts.include.includes(d.slug));

  /** @param {any} b @param {(s: string) => string} t */
  function block(b, t) {
    switch (b.t) {
      case 'p':
        return `<p>${t(b.text)}</p>`;
      case 'ul':
      case 'ol':
        return `<${b.t}>${b.items.map((/** @type {string} */ i) => `<li>${t(i)}</li>`).join('')}</${b.t}>`;
      case 'dl':
        return `<dl>${b.items.map((/** @type {any} */ i) => `<div><dt>${t(i.k)}</dt><dd>${t(i.v)}</dd></div>`).join('')}</dl>`;
      case 'box':
        return `<div class="gck-legal__box">${b.title ? `<p class="gck-meta">${t(b.title)}</p>` : ''}${b.lines.map((/** @type {string} */ l) => `<p>${t(l)}</p>`).join('')}</div>`;
      case 'note':
        return `<p class="gck-legal__note">${t(b.text)}</p>`;
      default:
        return '';
    }
  }

  /** Links to every published document, grouped (Kupovina, Pravno, Usluge) */
  function index(/** @type {LegalOpts} */ opts, /** @type {string} */ current = '') {
    const groups = /** @type {Record<string,string>} */ (K.LEGAL_GROUPS);
    return Object.entries(groups)
      .map(([g, label]) => {
        const list = docs(opts).filter((/** @type {any} */ d) => d.group === g);
        if (!list.length) return '';
        return `
          <div class="gck-legal__group">
            <p class="gck-meta">${esc(label)}</p>
            <ul>${list
              .map((/** @type {any} */ d) => `<li><a href="${opts.docUrl(d.slug)}"${d.slug === current ? ' aria-current="page"' : ''}>${esc(d.title)}</a></li>`)
              .join('')}</ul>
          </div>`;
      })
      .join('');
  }

  /**
   * @param {HTMLElement} el
   * @param {string} slug
   * @param {LegalOpts} opts
   * @returns {any | null} the rendered document, or null when the slug is unknown
   */
  function render(el, slug, opts) {
    const doc = docs(opts).find((/** @type {any} */ d) => d.slug === slug);
    const t = (/** @type {string} */ s) => fillTokens(s, opts.values, LABELS);
    if (!doc) {
      el.innerHTML = `
        <div class="gck-legal gck-legal--index">
          <h1 class="gck-legal__title">Uslovi i pravila kupovine</h1>
          <p class="gck-legal__lead">Dostava, plaćanje, povrat i reklamacije, uslovi kupovine i zaštita podataka na jednom mjestu.</p>
          ${opts.draft ? draftNote() : ''}
          <nav class="gck-legal__index" aria-label="Svi dokumenti">${index(opts)}</nav>
        </div>`;
      return null;
    }

    el.innerHTML = `
      <article class="gck-legal">
        <header class="gck-legal__head">
          <p class="gck-meta">${esc(K.LEGAL_GROUPS[doc.group])}, ${esc(doc.kicker)}</p>
          <h1 class="gck-legal__title">${esc(doc.title)}</h1>
          <p class="gck-legal__lead">${t(doc.lead)}</p>
          <p class="gck-legal__updated">Ažurirano ${esc(doc.updated)}</p>
        </header>
        <div class="gck-legal__grid">
          <aside class="gck-legal__aside">
            ${opts.draft ? draftNote() : ''}
            <nav aria-label="Sadržaj stranice" class="gck-legal__toc">
              <p class="gck-meta">Na ovoj stranici</p>
              <ul>${doc.sections.map((/** @type {any} */ s) => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('')}</ul>
            </nav>
          </aside>
          <div class="gck-legal__body">
            ${doc.sections
              .map((/** @type {any} */ s) => `
                <section id="${s.id}" class="gck-legal__section">
                  <h2>${esc(s.title)}</h2>
                  ${s.blocks.map((/** @type {any} */ b) => block(b, t)).join('')}
                </section>`)
              .join('')}
            <nav class="gck-legal__index gck-legal__index--end" aria-label="Ostali dokumenti">${index(opts, slug)}</nav>
          </div>
        </div>
      </article>`;
    return doc;
  }

  const draftNote = () =>
    '<p class="gck-legal__draft"><strong>Nacrt.</strong> Tekst je predložak i pravnik ga mora pregledati prije objave. Podaci u uglastim zagradama još nedostaju.</p>';

  K.legal = { render, index, docs, LABELS };
})();
