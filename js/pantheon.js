// =====================================================================
// GRAND COMPANY — Pantheon ERP gateway (demo)
// ---------------------------------------------------------------------
// The partner portal reads and writes account data only through this
// file. Every function is async and answers after a short delay, the
// way a real API would. In production each body becomes a fetch() to a
// small backend that talks to Datalab PANTHEON — the pages stay as they
// are.
// =====================================================================

'use strict';

const Pantheon = (() => {
  const LATENCY_MS = 450;
  const delay = (ms = LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

  async function login(email, password) {
    await delay();
    const p = PARTNERS.find((x) => x.email === email.trim().toLowerCase());
    if (!p) return { ok: false, field: 'email', message: 'Ne postoji partnerski nalog sa ovom adresom e-pošte.' };
    if (p.password !== password) return { ok: false, field: 'password', message: 'Lozinka nije ispravna. Pokušajte ponovo ili pozovite veleprodaju.' };
    setPartner(p.id);
    return { ok: true, partner: p };
  }

  async function account() {
    await delay(300);
    const p = partner();
    if (!p) return null;
    return {
      partner: p,
      invoices: partnerInvoices(p),
      orders: partnerOrders(p),
      sites: partnerSites(p),
      used: creditUsed(p),
      free: creditFree(p),
      syncedAt: new Date(),
    };
  }

  async function submitOrder(draft) {
    await delay(800);
    const p = partner();
    if (p && draft.payment === 'odgodjeno' && draft.total > creditFree(p)) {
      return { ok: false, message: 'Narudžba prelazi slobodan kreditni limit. Izaberite avansno plaćanje.' };
    }
    const now = new Date();
    const order = {
      ...draft,
      no: `GC-${now.getFullYear()}-${String(now.getTime()).slice(-5)}`,
      date: now.toISOString(),
      status: 'Primljena',
      source: 'portal',
      customerId: p ? p.id : 'guest',
    };
    recordOrder(order);
    return { ok: true, order };
  }

  async function saveSite(site) {
    await delay(250);
    const p = partner();
    if (!p) return null;
    const saved = { ...site, id: `site-${Date.now()}` };
    recordSite(p.id, saved);
    return saved;
  }

  return { login, account, submitOrder, saveSite };
})();
