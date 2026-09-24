// =====================================================================
// Shopping rules and legal pages — pravno.html?dok=<slug>
// Texts come from the GCKit legal drafts (vendor/gckit/legal-docs.js);
// company data fills the {tokens}. Anything we do not know yet stays
// visible as a highlighted [label] instead of being made up.
// =====================================================================

'use strict';

// Delivery has its own page (dostava.html) and the samples/contractor
// pages describe forms this site does not have, so they are left out.
const LEGAL_PUBLISHED = [
  'povrat-robe', 'povrat-novca', 'nacini-placanja', 'garancija-i-reklamacije', 'status-narudzbe',
  'uslovi-kupovine', 'politika-privatnosti', 'odustanak-od-ugovora', 'o-prodavcu',
];

const LEGAL_VALUES = {
  naziv: COMPANY.name,
  grad: 'Banja Luka',
  direktor: COMPANY.founder,
  sjediste: COMPANY.address,
  jib: COMPANY.jib,
  pdv: COMPANY.pib, // in BiH the 12-digit PIB is the VAT number
  registracija: null, // registry court and entry — ask the company
  racun: null, // bank account — ask the company
  email: COMPANY.emailInfo,
  telefon: COMPANY.phoneLandline,
  web: null,
  rokIsporuke: null, // the site does not state a delivery lead time yet
  zonaDostave: 'Banja Luka i regija do 50 km',
  besplatnaDostava: KM(FREE_STANDARD_DELIVERY_OVER),
  rokOdustanka: '15 dana', // matches the return promise in the home page FAQ
};

initPage(() => {
  const slug = new URLSearchParams(location.search).get('dok') || '';
  const doc = GCKit.legal.render($('legal-root'), slug, {
    values: LEGAL_VALUES,
    docUrl: (s) => `pravno.html?dok=${s}`,
    include: LEGAL_PUBLISHED,
    draft: true,
  });

  const crumbs = [{ label: 'Početna', href: 'index.html' }, { label: 'Uslovi i pravila kupovine', href: doc ? 'pravno.html' : null }];
  if (doc) {
    crumbs.push({ label: doc.title });
    document.title = `${doc.title} | Grand Company Banja Luka`;
  }
  $('legal-crumb').innerHTML = breadcrumb(crumbs);
});
