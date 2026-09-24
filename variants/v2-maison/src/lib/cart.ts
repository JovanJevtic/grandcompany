import { useSyncExternalStore } from 'react'
import { DEFAULT_FILTERS, PRODUCT_MAP, resolveLine, type Filters } from './shop'

// Jedno zajedničko stanje prodavnice: korpa, sačuvani artikli i filteri.
// Korpa i sačuvano se pamte u browseru (localStorage), a filteri i otvorena korpa ne.

export type ShopState = Filters & {
  cart: Record<string, number>
  saved: string[]
  cartOpen: boolean
}

const STORAGE = 'grand-shop-v1'
const MAX_QTY = 99

// Isti početni oblik na serveru i pri prvom crtanju u browseru, da se HTML poklopi.
const EMPTY: ShopState = { ...DEFAULT_FILTERS, cart: {}, saved: [], cartOpen: false }

let state = EMPTY
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE)
    if (!raw) return
    const data = JSON.parse(raw) as { cart?: Record<string, number>; saved?: string[] }
    const cart: Record<string, number> = {}
    for (const [key, qty] of Object.entries(data.cart ?? {})) {
      if (resolveLine(key) && Number.isInteger(qty) && qty > 0) cart[key] = Math.min(qty, MAX_QTY)
    }
    const saved = (data.saved ?? []).filter((id) => PRODUCT_MAP[id])
    state = { ...state, cart, saved }
  } catch {
    // Privatni prozor ili blokiran storage: prodavnica radi i bez pamćenja.
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE, JSON.stringify({ cart: state.cart, saved: state.saved }))
  } catch {}
}

function set(patch: Partial<ShopState>) {
  state = { ...state, ...patch }
  if ('cart' in patch || 'saved' in patch) persist()
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

// ——— Radnje ———

export function addToCart(key: string, qty = 1) {
  const next = Math.min(MAX_QTY, (state.cart[key] ?? 0) + qty)
  set({ cart: { ...state.cart, [key]: next } })
}

export function setQty(key: string, qty: number) {
  if (qty < 1) return removeFromCart(key)
  set({ cart: { ...state.cart, [key]: Math.min(qty, MAX_QTY) } })
}

export function removeFromCart(key: string) {
  const rest = { ...state.cart }
  delete rest[key]
  set({ cart: rest })
}

export function toggleSaved(id: string) {
  set({ saved: state.saved.includes(id) ? state.saved.filter((s) => s !== id) : [...state.saved, id] })
}

export const openCart = () => set({ cartOpen: true })
export const closeCart = () => set({ cartOpen: false })

export const setFilter = (patch: Partial<Filters>) => set(patch)
export const resetFilters = (patch: Partial<Filters> = {}) => set({ ...DEFAULT_FILTERS, ...patch })

// ——— Izvedene vrijednosti ———

export const cartCount = (cart: Record<string, number>) => Object.values(cart).reduce((s, q) => s + q, 0)

export function cartLines(cart: Record<string, number>) {
  return Object.entries(cart).flatMap(([key, qty]) => {
    const line = resolveLine(key)
    return line ? [{ ...line, qty }] : []
  })
}

export const cartTotal = (cart: Record<string, number>) =>
  Math.round(cartLines(cart).reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100
