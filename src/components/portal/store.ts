import { useSyncExternalStore } from 'react'
import { bySku } from '@/gc/gc'
import { DEMO_PARTNERS, withDiscount, type FullPartner, type PartnerOrder } from '@/lib/b2b'

// Stanje portala (demo, pamti se u browseru kao korpa; u produkciji sve dolazi iz Pantheon ERP-a):
// - narudžbe poslate iz portala (dodaju se na demo narudžbe partnera),
// - statusi koje interni tim mijenja (kupac ih odmah vidi u praćenju),
// - zahtjevi (registracija, posebni uslovi), vrijeme posljednje Pantheon sinhronizacije,
// - interni (admin) pristup.

export const STATUSES = ['Potvrđena', 'U pripremi', 'Na putu', 'Isporučena'] as const
export type Status = (typeof STATUSES)[number]

export type PlacedOrder = PartnerOrder & { partnerId: string; placedAt: number; paymentDays: number; total: number; date?: string; note?: string }
export type Request = { kind: 'registracija' | 'uslovi'; at: number; from: string; detail: string }

type State = { admin: boolean; placed: PlacedOrder[]; status: Record<string, Status>; requests: Request[]; syncedAt: number }

const STORAGE = 'grand-portal-v1'
const EMPTY: State = { admin: false, placed: [], status: {}, requests: [], syncedAt: 0 }

let state = EMPTY
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE)
    if (raw) state = { ...EMPTY, ...(JSON.parse(raw) as Partial<State>) }
  } catch {}
  if (!state.syncedAt) state = { ...state, syncedAt: Date.now() - 4 * 60000 }
}

function set(patch: Partial<State>) {
  state = { ...state, ...patch }
  try {
    window.localStorage.setItem(STORAGE, JSON.stringify(state))
  } catch {}
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function usePortal() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load()
      return state
    },
    () => EMPTY,
  )
}

export const enterAdmin = () => set({ admin: true })
export const leaveAdmin = () => set({ admin: false })
export const syncPantheon = () => set({ syncedAt: Date.now() })
export const setStatus = (no: string, s: Status) => set({ status: { ...state.status, [no]: s } })
export const addRequest = (r: Omit<Request, 'at'>) => set({ requests: [{ ...r, at: Date.now() }, ...state.requests] })

export function placeOrder(o: Omit<PlacedOrder, 'no' | 'placedAt' | 'daysAgo' | 'status'>) {
  const now = Date.now()
  const order: PlacedOrder = { ...o, no: `GC-${new Date(now).getFullYear()}-${String(now).slice(-5)}`, placedAt: now, daysAgo: 0, status: 'Potvrđena' }
  set({ placed: [order, ...state.placed] })
  return order
}

const r2 = (n: number) => Math.round(n * 100) / 100

export type ViewOrder = PlacedOrder & { status: Status; fresh: boolean }

/** Sve narudžbe partnera (demo iz ERP-a + poslate iz portala), sa statusom koji je postavio tim. */
export function ordersOf(p: FullPartner, s: State): ViewOrder[] {
  const demo: ViewOrder[] = p.orders.map((o) => ({
    ...o,
    partnerId: p.id,
    placedAt: 0,
    paymentDays: p.paymentDays,
    total: r2(o.items.reduce((t, [sku, q]) => t + withDiscount(bySku(sku)?.price ?? 0, p.discount) * q, 0) + o.deliveryCost),
    status: (s.status[o.no] ?? o.status) as Status,
    fresh: false,
  }))
  const mine: ViewOrder[] = s.placed
    .filter((o) => o.partnerId === p.id)
    .map((o) => ({ ...o, daysAgo: Math.floor((Date.now() - o.placedAt) / 86400000), status: s.status[o.no] ?? 'Potvrđena', fresh: true }))
  return [...mine, ...demo].sort((a, b) => a.daysAgo - b.daysAgo)
}

export function allOrders(s: State) {
  return DEMO_PARTNERS.flatMap((p) => ordersOf(p, s).map((o) => ({ ...o, partner: p })))
}

/** Kredit: neplaćene fakture + narudžbe na odgođeno plaćanje koje još nisu fakturisane. */
export function creditOf(p: FullPartner, s: State) {
  const invoices = r2(p.invoices.filter((i) => !i.paid).reduce((t, i) => t + i.amount, 0))
  const pending = r2(s.placed.filter((o) => o.partnerId === p.id && o.paymentDays > 0).reduce((t, o) => t + o.total, 0))
  const used = r2(invoices + pending)
  return { invoices, pending, used, limit: p.creditLimit, available: Math.max(0, r2(p.creditLimit - used)), ratio: Math.min(1, used / p.creditLimit) }
}
