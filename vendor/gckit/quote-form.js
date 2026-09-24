// @ts-check
// =====================================================================
// GCKit.quoteForm — "Zatražite ponudu": an inquiry form that carries the
// visitor's current list (cart) along with it.
// Ported from grand-maison (Quote.tsx).
//
//   GCKit.quoteForm.mount(el, { lines, onSubmit })
//
// `lines()` returns [{ name, qty, unit, total }] from the host cart.
// `onSubmit(data)` sends the inquiry and returns a Promise. There is no
// backend in the kit: without onSubmit the form opens a prepared e-mail
// (mailto) so nothing is silently lost.
// =====================================================================

'use strict';

(function () {
  const K = /** @type {any} */ (window).GCKit;
  const { esc, plural } = K.text;

  const KINDS = [
    ['privatni', 'Privatni kupac'],
    ['izvodjac', 'Izvođač radova'],
    ['investitor', 'Investitor'],
  ];

  /**
   * @typedef {{ name: string, qty: number, unit: string, total: number }} Line
   * @typedef {{ kind: string, name: string, contact: string, message: string, lines: Line[] }} QuoteData
   * @param {HTMLElement} el
   * @param {{ lines?: () => Line[], onSubmit?: (d: QuoteData) => Promise<void>, email?: string }} opts
   */
  function mount(el, opts) {
    const lines = opts.lines || (() => []);
    const fmt = K.cfg.formatPrice;

    function summary() {
      const ls = lines();
      if (!ls.length) return '<p class="gck-quote__empty">Spisak je prazan. Dodajte artikle u korpu ili opišite šta vam treba.</p>';
      const total = ls.reduce((s, l) => s + l.total, 0);
      return `
        <ul class="gck-quote__lines">
          ${ls.map((l) => `<li><span><span class="gck-num">${l.qty} ${esc(l.unit)} ×</span> ${esc(l.name)}</span><span class="gck-num">${fmt(l.total)}</span></li>`).join('')}
        </ul>
        <p class="gck-quote__total"><span>Orijentacioni iznos</span><span class="gck-num">${fmt(total)}</span></p>`;
    }

    function form() {
      const n = lines().length;
      el.innerHTML = `
        <div class="gck-quote">
          <form class="gck-quote__form" novalidate>
            <fieldset class="gck-quote__kinds">
              <legend class="gck-meta">Ko ste</legend>
              ${KINDS.map(([v, l], i) => `<label><input type="radio" name="kind" value="${v}" ${i === 0 ? 'checked' : ''} /><span>${l}</span></label>`).join('')}
            </fieldset>
            <label class="gck-field"><span>Ime i prezime ili firma</span><input name="name" required autocomplete="name" /></label>
            <label class="gck-field"><span>Telefon ili e-pošta</span><input name="contact" required autocomplete="email" /></label>
            <label class="gck-field"><span>Šta vam treba</span><textarea name="message" rows="4" placeholder="Vrsta radova, površina, rok, lokacija isporuke"></textarea></label>
            <p class="gck-quote__error" role="alert" hidden></p>
            <button type="submit" class="gck-btn">Pošalji upit</button>
          </form>
          <aside class="gck-quote__side" aria-label="Vaš spisak">
            <p class="gck-meta gck-quote__side-head"><span>Vaš spisak</span><span>${n ? `${n} ${plural(n, 'artikal', 'artikla', 'artikala')}` : ''}</span></p>
            ${summary()}
          </aside>
        </div>`;

      const f = /** @type {HTMLFormElement} */ (el.querySelector('form'));
      const err = /** @type {HTMLElement} */ (el.querySelector('.gck-quote__error'));
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(f);
        /** @type {QuoteData} */
        const data = {
          kind: String(fd.get('kind')),
          name: String(fd.get('name') || '').trim(),
          contact: String(fd.get('contact') || '').trim(),
          message: String(fd.get('message') || '').trim(),
          lines: lines(),
        };
        if (!data.name || !data.contact) {
          err.textContent = 'Upišite ime i kontakt da bismo vam mogli odgovoriti.';
          err.hidden = false;
          return;
        }
        if (!data.message && !data.lines.length) {
          err.textContent = 'Opišite šta vam treba ili dodajte artikle u korpu.';
          err.hidden = false;
          return;
        }
        err.hidden = true;
        try {
          if (opts.onSubmit) await opts.onSubmit(data);
          else location.href = mailto(data, opts.email || '');
          done();
        } catch {
          err.textContent = 'Upit nije poslan. Pokušajte ponovo ili nas pozovite.';
          err.hidden = false;
        }
      });
    }

    function done() {
      el.innerHTML = `
        <div class="gck-quote__done" role="status">
          <p class="gck-quote__done-title">Hvala, upit je spreman.</p>
          <p>Javljamo se sa ponudom i rokom isporuke čim ga pregledamo.</p>
          <button type="button" class="gck-btn gck-btn--line">Novi upit</button>
        </div>`;
      /** @type {HTMLElement} */ (el.querySelector('button')).addEventListener('click', form);
    }

    form();
    return { refresh: form };
  }

  /** @param {QuoteData} d @param {string} to */
  function mailto(d, to) {
    const kind = KINDS.find(([v]) => v === d.kind)?.[1] || '';
    const body = [
      `${kind}: ${d.name}`,
      `Kontakt: ${d.contact}`,
      '',
      d.message,
      '',
      ...d.lines.map((l) => `${l.qty} ${l.unit} × ${l.name}`),
    ].join('\n');
    return `mailto:${to}?subject=${encodeURIComponent('Upit za ponudu')}&body=${encodeURIComponent(body)}`;
  }

  K.quoteForm = { mount };
})();
