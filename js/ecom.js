// =====================================================================
// GRAND COMPANY — wiring for the GCKit components (vendor/gckit/)
// Saved list, comparison, quick view and search suggestions come from
// the shared ecom-components kit; this file only tells the kit how our
// catalogue, prices and cart work.
// =====================================================================

'use strict';

GCKit.configure({
  products: () => PRODUCTS,
  id: (p) => p.sku,
  price: priceOf, // partner prices follow the logged-in account
  formatPrice: KM,
  unit: (p) => p.unit,
  thumb: (p) => productArt(p),
  url: productUrl,
  meta: (p) => `${p.brand} · ${p.spec}`,
  description: (p) => p.desc,
  defaultQty,
  addToCart(sku, qty) {
    addToCart(sku, qty);
    toast(`${bySku[sku].name} je u korpi.`, {
      label: 'Otvori korpu',
      onClick: () => {
        GCKit.panel.close();
        openCart();
      },
    });
  },
  toast: (message) => toast(message),
  compareRows: [
    { label: 'Proizvođač', get: (p) => p.brand },
    { label: 'Dimenzije i pakovanje', get: (p) => p.spec },
    { label: 'Prodajno pakovanje', get: (p) => (p.pack ? `${p.pack.name} od ${qtyFmt(p.pack.size)} ${p.unit}` : `1 ${p.unit}`) },
    { label: 'Masa', get: (p) => `oko ${qtyFmt(p.weight)} kg po ${p.unit}` },
    { label: 'Na stanju', get: (p) => `${fmt0.format(p.stock)} ${p.unit}` },
    { label: 'Namjena', get: (p) => p.desc },
  ],
  storagePrefix: 'gc',
});

// Small icon buttons (save, compare) that sit on a product picture
const productTools = (p) => `
  <div class="absolute right-2 top-2 z-[2] flex gap-1.5">${GCKit.saved.button(p.sku, p.name)}${GCKit.compare.button(p.sku, p.name)}</div>
  ${GCKit.quickView.button(p.sku, p.name)}`;

// Called from initPage() once the header exists
function initEcom() {
  ['hdr-q', 'mob-q'].forEach((id) => {
    const input = $(id);
    if (input) {
      GCKit.searchSuggest.attach(input, {
        fields: (p) => [p.name, p.sku, p.brand, p.spec, categoryById[p.category].label],
        allUrl: (q) => `katalog.html?q=${encodeURIComponent(q)}`,
      });
    }
  });
  GCKit.saved.sync();
  GCKit.compare.sync();
  // Logging in changes prices: re-render an open comparison or saved list
  onChange(() => {
    GCKit.saved.sync();
    GCKit.compare.sync();
  });
}
