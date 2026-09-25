import { useSyncExternalStore } from 'react'
import { DEFAULT_FILTERS, PRODUCT_MAP, resolveLine, type Filters } from './shop'

// Jedno zajedničko stanje prodavnice: korpa, sačuvani artikli, poređenje, filteri, otvoreni panel i obavijest.
// Korpa, sačuvano i poređenje se pamte u browseru (localStorage), a filteri, paneli i obavijest ne.
// Poređenje, paneli i obavijest su preneseni iz ShopProvider-a projekta grand-root, u obliku ovog store-a.

export type PanelKind = 'saved' | 'compare' | 'search'
export type Panel = { kind: PanelKind } | null
/** Quick view grows out of the card it was opened from (grand-cipher QuickView) */
export type Rect = { top: number; left: number; width: number; height: number }
export type QuickView = { id: string; rect: Rect } | null

export type Toast = { text: string; action?: { label: string; open: 'cart' | PanelKind } } | null

export type ShopState = Filters & {
  /** Količina je u jedinici artikla (m², kom, kut), za komplet broj kompleta */
  cart: Record<string, number>
  saved: string[]
  compare: string[]
  cartOpen: boolean
  panel: Panel
  view: QuickView
  toast: Toast
}

export const COMPARE_MAX = 3
const STORAGE = 'grand-shop-v2'
const MAX_QTY = 9999

// Isti početni oblik na serveru i pri prvom crtanju u browseru, da se HTML poklopi.
const EMPTY: ShopState = { ...DEFAULT_FILTERS, cart: {}, saved: [], compare: [], cartOpen: false, panel: null, view: null, toast: null }

let state = EMPTY
let loaded = false
const listeners = new Set<() => void>()

const round2 = (n: number) => Math.round(n * 100) / 100

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE)
    if (!raw) return
    const data = JSON.parse(raw) as { cart?: Record<string, number>; saved?: string[]; compare?: string[] }
    const cart: Record<string, number> = {}
    for (const [key, qty] of Object.entries(data.cart ?? {})) {
      if (resolveLine(key) && Number.isFinite(qty) && qty > 0) cart[key] = Math.min(round2(qty), MAX_QTY)
    }
    const saved = (data.saved ?? []).filter((id) => PRODUCT_MAP[id])
    const compare = (data.compare ?? []).filter((id) => PRODUCT_MAP[id]).slice(0, COMPARE_MAX)
    state = { ...state, cart, saved, compare }
  } catch {
    // Privatni prozor ili blokiran storage: prodavnica radi i bez pamćenja.
  }
}

function persist() {
  try {
    window.localStorage.setItem(
      STORAGE,
      JSON.stringify({ cart: state.cart, saved: state.saved, compare: state.compare }),
    )
  } catch {}
}

function set(patch: Partial<ShopState>) {
  state = { ...state, ...patch }
  if ('cart' in patch || 'saved' in patch || 'compare' in patch) persist()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useShop() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load()
      return state
    },
    () => EMPTY,
  )
}

// ——— Obavijest ("dodato u korpu") ———

let toastTimer: ReturnType<typeof setTimeout> | undefined

export function notify(text: string, action?: NonNullable<Toast>['action']) {
  set({ toast: { text, action } })
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => set({ toast: null }), 3200)
}

// ——— Korpa ———

/** Dodaje `qty`; bez njega jedno pakovanje artikla (ploča 2,5 m², rolna 6 m²...) ili jedan komplet */
export function addToCart(key: string, qty?: number) {
  const line = resolveLine(key)
  if (!line) return
  const add = qty ?? line.step
  const next = Math.min(MAX_QTY, round2((state.cart[key] ?? 0) + add))
  set({ cart: { ...state.cart, [key]: next } })
  notify(`${line.name}: dodato u korpu`, { label: 'Korpa', open: 'cart' })
}

export function setQty(key: string, qty: number) {
  if (qty <= 0) return removeFromCart(key)
  set({ cart: { ...state.cart, [key]: Math.min(round2(qty), MAX_QTY) } })
}

export function removeFromCart(key: string) {
  const rest = { ...state.cart }
  delete rest[key]
  set({ cart: rest })
}

export function toggleSaved(id: string) {
  set({ saved: state.saved.includes(id) ? state.saved.filter((s) => s !== id) : [...state.saved, id] })
}

export function toggleCompare(id: string) {
  const c = state.compare
  if (c.includes(id)) return set({ compare: c.filter((x) => x !== id) })
  if (c.length >= COMPARE_MAX) return notify(`Poredite najviše ${COMPARE_MAX} artikla odjednom`, { label: 'Poređenje', open: 'compare' })
  set({ compare: [...c, id] })
  notify('Dodato u poređenje', { label: 'Poređenje', open: 'compare' })
}

// Korpa (ladica iz grand-maison) i bočni paneli (iz grand-root) se ne otvaraju istovremeno.
export const openCart = () => set({ cartOpen: true, panel: null, view: null })
export const closeCart = () => set({ cartOpen: false })
export const openPanel = (panel: Panel) => set({ panel, cartOpen: false, view: null })
export const closePanel = () => set({ panel: null })

/** Opens the quick view from an element (card photo). Without one it grows from the screen centre. */
export function openView(id: string, from?: Element | null) {
  let rect: Rect
  if (from) {
    const r = from.getBoundingClientRect()
    rect = { top: r.top, left: r.left, width: r.width, height: r.height }
  } else {
    const w = Math.min(320, window.innerWidth * 0.6)
    rect = { top: window.innerHeight / 2 - w / 2, left: window.innerWidth / 2 - w / 2, width: w, height: w }
  }
  set({ view: { id, rect }, panel: null, cartOpen: false })
}
export const closeView = () => set({ view: null })

/** Adds several lines at once (calculator bill of materials) with one notification */
export function addMany(lines: { sku: string; qty: number }[], label: string) {
  const cart = { ...state.cart }
  for (const { sku, qty } of lines) {
    if (!resolveLine(sku) || qty <= 0) continue
    cart[sku] = Math.min(MAX_QTY, round2((cart[sku] ?? 0) + qty))
  }
  set({ cart })
  notify(label, { label: 'Korpa', open: 'cart' })
}

export const setFilter = (patch: Partial<Filters>) => set(patch)
export const resetFilters = (patch: Partial<Filters> = {}) => set({ ...DEFAULT_FILTERS, ...patch })

// ——— Izvedene vrijednosti ———

/** Broj stavki u korpi (ne zbir m² i komada, jer se jedinice ne sabiraju) */
export const cartCount = (cart: Record<string, number>) => Object.keys(cart).length

export function cartLines(cart: Record<string, number>) {
  return Object.entries(cart).flatMap(([key, qty]) => {
    const line = resolveLine(key)
    return line ? [{ ...line, qty }] : []
  })
}

export const cartTotal = (cart: Record<string, number>) =>
  Math.round(cartLines(cart).reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100
