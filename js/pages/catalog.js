// =====================================================================
// Catalogue page — faceted filters, search and sorting.
// Filter state is mirrored in the URL, so a filtered view can be shared.
// =====================================================================

'use strict';

initPage(() => {
  const params = new URLSearchParams(location.search);
  const listParam = (key) => (params.get(key) || '').split(',').filter(Boolean);
  const LEVELS = [['high', 'Na stanju'], ['mid', 'Ograničene zalihe'], ['low', 'Niske zalihe']];

  const f = {
    cats: new Set(listParam('kat').filter((id) => categoryById[id])),
    brands: new Set(listParam('brend').filter((b) => BRANDS.includes(b))),
    levels: new Set(listParam('zalihe').filter((l) => LEVELS.some(([v]) => v === l))),
    q: params.get('q') || '',
    min: params.get('min') || '',
    max: params.get('max') || '',
    sort: params.get('sort') || 'preporuceno',
  };
  const SET_BY_NAME = { kat: f.cats, brend: f.brands, zalihe: f.levels };

  const SORTS = {
    preporuceno: (a, b) => Number(!!b.featured) - Number(!!a.featured),
    'cijena-rastuce': (a, b) => a.price - b.price,
    'cijena-opadajuce': (a, b) => b.price - a.price,
    naziv: (a, b) => a.name.localeCompare(b.name, 'sr'),
    zalihe: (a, b) => b.stock - a.stock,
  };

  // "ploca" finds "ploča", "celik" finds "čelik"
  const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

  // `skip` ignores one facet, so its own counts show what selecting it would add
  function matches(p, skip) {
    if (skip !== 'kat' && f.cats.size && !f.cats.has(p.category)) return false;
    if (skip !== 'brend' && f.brands.size && !f.brands.has(p.brand)) return false;
    if (skip !== 'zalihe' && f.levels.size && !f.levels.has(stockLevel(p))) return false;
    const price = priceOf(p);
    if (f.min !== '' && price < parseFloat(f.min)) return false;
    if (f.max !== '' && price > parseFloat(f.max)) return false;
    const words = normalize(f.q).split(/\s+/).filter(Boolean);
    if (words.length) {
      const haystack = normalize([p.name, p.sku, p.spec, p.desc, p.brand, categoryById[p.category].label].join(' '));
      if (!words.every((w) => haystack.includes(w))) return false;
    }
    return true;
  }

  function writeUrl() {
    const out = new URLSearchParams();
    if (f.cats.size) out.set('kat', [...f.cats].join(','));
    if (f.brands.size) out.set('brend', [...f.brands].join(','));
    if (f.levels.size) out.set('zalihe', [...f.levels].join(','));
    if (f.q) out.set('q', f.q);
    if (f.min !== '') out.set('min', f.min);
    if (f.max !== '') out.set('max', f.max);
    if (f.sort !== 'preporuceno') out.set('sort', f.sort);
    const qs = out.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  function renderHead() {
    const single = f.cats.size === 1 ? categoryById[[...f.cats][0]] : null;
    const title = single ? single.label : f.q ? 'Rezultati pretrage' : 'Katalog proizvoda';
    const lead = single
      ? single.usage
      : f.q
        ? `Artikli koji odgovaraju pojmu „${f.q}".`
        : 'Svi artikli sa stovarišta u Zalužanima. Stanje zaliha čitamo iz Pantheona, a partnerima se rabat obračunava na svakoj cijeni.';

    const quick = CATEGORIES.map((c) => {
      const count = PRODUCTS.filter((p) => p.category === c.id).length;
      return `<button data-quick-cat="${c.id}" class="inline-flex items-center gap-2 border border-espresso/20 bg-paper px-3 py-2 text-[14px] transition-colors hover:border-espresso">
        ${c.label}<span class="text-umber">${count}</span></button>`;
    }).join('');

    $('catalog-head').innerHTML = `
      <div class="mx-auto grid max-w-[1440px] items-center gap-8 px-5 py-8 lg:grid-cols-12 lg:px-12 lg:py-10">
        <div class="${single ? 'lg:col-span-7' : 'lg:col-span-10'}">
          ${breadcrumb([{ label: 'Početna', href: 'index.html' }, { label: 'Katalog', href: single ? 'katalog.html' : null }, ...(single ? [{ label: single.label }] : [])])}
          <h1 class="mt-4 font-serif text-[clamp(2.13rem,4.1vw,3.69rem)] leading-[1.02]">${esc(title)}</h1>
          <p class="mt-4 max-w-[64ch] text-[16px] leading-relaxed text-umber">${esc(lead)}</p>
          ${single ? '' : `<div class="mt-6 flex flex-wrap gap-2">${quick}</div>`}
        </div>
        ${single ? `
        <div class="hidden lg:col-span-4 lg:col-start-9 lg:block">
          <div class="relative aspect-[16/10] overflow-hidden">
            <img src="${single.image}" alt="" class="h-full w-full object-cover" />
          </div>
        </div>` : ''}
      </div>`;
  }

  function renderFilters() {
    const group = (title, body) => `
      <fieldset class="border-t border-espresso/15 py-5">
        <legend class="float-left mb-3 w-full font-serif text-[18px]">${title}</legend>
        <div class="clear-both space-y-2.5">${body}</div>
      </fieldset>`;
    const check = (name, value, label, swatch = '') => `
      <label class="flex cursor-pointer items-center gap-3 text-[15px]">
        <input type="checkbox" name="${name}" value="${esc(value)}" class="h-4 w-4 rounded-none border-espresso/40 text-oxide focus:ring-oxide" />
        ${swatch}<span class="flex-1">${esc(label)}</span>
        <span class="text-[13px] text-umber" data-count="${name}|${esc(value)}"></span>
      </label>`;
    const priceField = 'w-full min-w-0 border border-espresso/25 bg-paper px-2 py-2 text-[15px] focus:border-espresso focus:ring-0';

    $('filters').innerHTML = `
      <div class="lg:sticky lg:top-40">
        <label class="block pb-5">
          <span class="font-serif text-[18px]">Pretraga</span>
          <input id="f-q" type="search" placeholder="Naziv, šifra ili dimenzija" class="${FIELD}" />
        </label>
        ${group('Kategorija', CATEGORIES.map((c) => check('kat', c.id, c.label)).join(''))}
        ${group('Proizvođač', BRANDS.map((b) => check('brend', b, b)).join(''))}
        ${group('Zalihe', LEVELS.map(([v, l]) => check('zalihe', v, l)).join(''))}
        ${group('Cijena po jedinici', `
          <div class="flex items-center gap-2">
            <label class="flex-1"><span class="sr-only">Cijena od</span><input id="f-min" type="number" min="0" step="0.5" placeholder="od" class="${priceField}" /></label>
            <span class="text-umber" aria-hidden="true">–</span>
            <label class="flex-1"><span class="sr-only">Cijena do</span><input id="f-max" type="number" min="0" step="0.5" placeholder="do" class="${priceField}" /></label>
            <span class="text-[13px] text-umber">KM</span>
          </div>`)}
        <button id="f-reset" class="mt-1 text-[14px] text-oxide underline underline-offset-4">Poništi sve filtere</button>
      </div>`;
    syncInputs();
  }

  function syncInputs() {
    $('filters').querySelectorAll('input[type="checkbox"]').forEach((box) => {
      box.checked = SET_BY_NAME[box.name].has(box.value);
    });
    for (const [id, key] of [['f-q', 'q'], ['f-min', 'min'], ['f-max', 'max']]) {
      if (document.activeElement !== $(id)) $(id).value = f[key];
    }
    $('sort').value = f.sort;
  }

  function updateCounts() {
    const byFacet = {
      kat: (v) => PRODUCTS.filter((p) => p.category === v && matches(p, 'kat')).length,
      brend: (v) => PRODUCTS.filter((p) => p.brand === v && matches(p, 'brend')).length,
      zalihe: (v) => PRODUCTS.filter((p) => stockLevel(p) === v && matches(p, 'zalihe')).length,
    };
    $('filters').querySelectorAll('[data-count]').forEach((el) => {
      const [name, value] = el.dataset.count.split('|');
      el.textContent = byFacet[name](value);
    });
  }

  function renderChips() {
    const chips = [
      ...[...f.cats].map((id) => ['kat', id, categoryById[id].label]),
      ...[...f.brands].map((b) => ['brend', b, b]),
      ...[...f.levels].map((l) => ['zalihe', l, LEVELS.find(([v]) => v === l)[1]]),
      ...(f.q ? [['q', '', `„${f.q}"`]] : []),
      ...(f.min !== '' || f.max !== '' ? [['cijena', '', `${f.min || 0} do ${f.max || '∞'} KM`]] : []),
    ];
    $('active-chips').classList.toggle('hidden', !chips.length);
    $('active-chips').innerHTML = chips.map(([name, value, label]) => `
      <button data-chip="${name}" data-value="${esc(value)}" class="inline-flex items-center gap-2 bg-espresso px-3 py-1.5 text-[13px] text-cream transition-colors hover:bg-oxide">
        ${esc(label)}<span aria-hidden="true">×</span><span class="sr-only">Ukloni filter</span>
      </button>`).join('');
  }

  function renderResults() {
    const results = PRODUCTS.filter((p) => matches(p)).sort(SORTS[f.sort] || SORTS.preporuceno);
    $('result-count').textContent = `${results.length} ${plural(results.length, 'artikal', 'artikla', 'artikala')}`;
    $('catalog-grid').innerHTML = results.length
      ? results.map(productCard).join('')
      : `<div class="col-span-full border border-dashed border-espresso/30 px-6 py-16 text-center">
          <p class="font-serif text-[26px]">Nijedan artikal ne odgovara filterima.</p>
          <p class="mt-2 text-umber">Uklonite neki od filtera ili pretražite po šifri artikla.</p>
          <button data-reset class="${BTN_PRIMARY} mt-6 px-6 py-3">Poništi filtere</button>
        </div>`;
    renderHead();
    renderChips();
    updateCounts();
    writeUrl();
  }

  function resetAll() {
    f.cats.clear();
    f.brands.clear();
    f.levels.clear();
    f.q = f.min = f.max = '';
    syncInputs();
    renderResults();
  }

  $('filters').addEventListener('change', (e) => {
    const box = e.target.closest('input[type="checkbox"]');
    if (!box) return;
    const set = SET_BY_NAME[box.name];
    box.checked ? set.add(box.value) : set.delete(box.value);
    renderResults();
  });

  $('filters').addEventListener('input', (e) => {
    const key = { 'f-q': 'q', 'f-min': 'min', 'f-max': 'max' }[e.target.id];
    if (!key) return;
    f[key] = e.target.value;
    renderResults();
  });

  $('filters').addEventListener('click', (e) => e.target.closest('#f-reset') && resetAll());
  $('catalog-grid').addEventListener('click', (e) => e.target.closest('[data-reset]') && resetAll());

  $('catalog-head').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quick-cat]');
    if (!btn) return;
    f.cats.clear();
    f.cats.add(btn.dataset.quickCat);
    syncInputs();
    renderResults();
  });

  $('active-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-chip]');
    if (!chip) return;
    const { chip: name, value } = chip.dataset;
    if (SET_BY_NAME[name]) SET_BY_NAME[name].delete(value);
    if (name === 'q') f.q = '';
    if (name === 'cijena') f.min = f.max = '';
    syncInputs();
    renderResults();
  });

  $('sort').addEventListener('change', (e) => {
    f.sort = e.target.value;
    renderResults();
  });

  $('btn-filters').addEventListener('click', () => {
    const open = $('filters').classList.toggle('hidden') === false;
    $('btn-filters').setAttribute('aria-expanded', String(open));
  });

  renderFilters();
  renderResults();
  onChange(renderResults);
});
