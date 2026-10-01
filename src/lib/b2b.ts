import { useSyncExternalStore } from 'react'
import { PARTNERS, PARTNER_TIERS } from '@/gc/gc'

// Hibridna platforma: Maloprodaja (B2C) i B2B Partner Portal (glavni naglasak).
// Ovo je zajedničko stanje: koji je način aktivan i koji je partner prijavljen (demo — u produkciji
// podaci dolaze iz Pantheon ERP-a). Pamti se u browseru, kao korpa.
//
// Izvor podataka (PDF "Kompletna dokumentacija", tačka 5): rabatna skala Gost 0%, Nivo 1 10%,
// Nivo 2 15%, Nivo 3 18–22%; kreditni limit uz odgođeno plaćanje 30/60/90 dana.

export type Mode = 'b2c' | 'b2b'

export type PartnerSite = { id: string; name: string; address: string; note: string }
export type PartnerInvoice = { no: string; issuedDaysAgo: number; amount: number; paid: boolean }
export type PartnerOrder = {
  no: string
  daysAgo: number
  siteId: string
  status: string
  payment: string
  delivery: 'kran' | 'standard'
  deliveryCost: number
  items: [string, number][]
}
export type FullPartner = {
  id: string
  name: string
  tier: string
  discount: number
  creditLimit: number
  paymentDays: number
  email: string
  password: string
  sites: PartnerSite[]
  invoices: PartnerInvoice[]
  orders: PartnerOrder[]
}

export const DEMO_PARTNERS = PARTNERS as unknown as FullPartner[]
export { PARTNER_TIERS }

type State = { mode: Mode; partnerId: string | null; loginOpen: boolean }
const STORAGE = 'grand-b2b-v1'
const EMPTY: State = { mode: 'b2c', partnerId: null, loginOpen: false }

let state = EMPTY
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE)
    if (!raw) return
    const data = JSON.parse(raw) as Partial<State>
    const partnerId = DEMO_PARTNERS.some((p) => p.id === data.partnerId) ? (data.partnerId as string) : null
    state = { ...state, mode: data.mode === 'b2b' ? 'b2b' : 'b2c', partnerId }
  } catch {}
}

function set(patch: Partial<State>) {
  state = { ...state, ...patch }
  try {
    window.localStorage.setItem(STORAGE, JSON.stringify({ mode: state.mode, partnerId: state.partnerId }))
  } catch {}
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useB2B() {
  const s = useSyncExternalStore(
    subscribe,
    () => {
      load()
      return state
    },
    () => EMPTY,
  )
  const partner = s.partnerId ? (DEMO_PARTNERS.find((p) => p.id === s.partnerId) ?? null) : null
  // Rabat važi samo u B2B načinu i samo za prijavljenog partnera
  const discount = s.mode === 'b2b' && partner ? partner.discount : 0
  return { ...s, partner, discount }
}

/** Prebaci način. B2B bez prijave otvara prijavu. */
export function setMode(mode: Mode) {
  if (mode === 'b2b' && !state.partnerId) set({ mode, loginOpen: true })
  else set({ mode })
}
export const openLogin = () => set({ loginOpen: true })
export const closeLogin = () => set({ loginOpen: false })

/** Demo prijava: e-mail + lozinka iz demo podataka (u produkciji: Pantheon / B2B nalog). */
export function login(email: string, password: string): boolean {
  const p = DEMO_PARTNERS.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
  if (!p) return false
  set({ partnerId: p.id, mode: 'b2b', loginOpen: false })
  return true
}
/** Brza prijava demo partnera (za prezentaciju) */
export function loginAs(id: string) {
  if (DEMO_PARTNERS.some((p) => p.id === id)) set({ partnerId: id, mode: 'b2b', loginOpen: false })
}
export const logout = () => set({ partnerId: null, mode: 'b2c' })

/** Cijena sa ugovorenim rabatom (zaokruženo na feninge) */
export const withDiscount = (price: number, discount: number) => Math.round(price * (1 - discount) * 100) / 100

/** Iskorištenost kreditnog limita: zbir neplaćenih faktura */
export function creditUsage(p: FullPartner) {
  const used = Math.round(p.invoices.filter((i) => !i.paid).reduce((s, i) => s + i.amount, 0) * 100) / 100
  return { used, limit: p.creditLimit, available: Math.max(0, Math.round((p.creditLimit - used) * 100) / 100), ratio: Math.min(1, used / p.creditLimit) }
}
