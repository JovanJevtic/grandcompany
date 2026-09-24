'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import { DEFAULT_FILTERS, type Filters, productById } from '@/lib/shop'

// Stanje prodavnice na jednom mjestu: korpa, sačuvano, poređenje, filteri kataloga, otvoreni panel i obavijest.
// Korpa, sačuvano i poređenje se pamte u localStorage, da ostanu i poslije zatvaranja stranice.

export type PanelKind = 'cart' | 'checkout' | 'saved' | 'compare' | 'search' | 'samples' | 'inquiry'
export type Panel = { kind: PanelKind } | { kind: 'product'; id: string } | null

export type Line = { id: string; qty: number }

const KEYS = { cart: 'gc-cart', saved: 'gc-saved', compare: 'gc-compare' } as const
export const COMPARE_MAX = 3
export const QTY_MAX = 999

type Toast = { text: string; action?: { label: string; panel: PanelKind } } | null

type Shop = {
  cart: Line[]
  saved: string[]
  compare: string[]
  count: number
  subtotal: number
  add: (id: string, qty?: number) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clearCart: () => void
  toggleSaved: (id: string) => void
  toggleCompare: (id: string) => void
  panel: Panel
  openPanel: (p: Panel) => void
  closePanel: () => void
  filters: Filters
  setFilters: (patch: Partial<Filters>) => void
  resetFilters: () => void
  toast: Toast
  notify: (text: string, action?: NonNullable<Toast>['action']) => void
  ready: boolean
}

const Ctx = createContext<Shop | null>(null)

export function useShop() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useShop mora biti unutar <ShopProvider>')
  return v
}

// Čitanje i pisanje ne smiju rušiti sajt (privatni prozor, blokirana pohrana...).
function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* pohrana nedostupna: stanje živi samo dok je stranica otvorena */
  }
}

export default function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Line[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [compare, setCompare] = useState<string[]>([])
  const [panel, setPanel] = useState<Panel>(null)
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS)
  const [toast, setToast] = useState<Toast>(null)
  const [ready, setReady] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const lenis = useLenis()

  // Učitavanje tek nakon prvog prikaza, da server i preglednik prvo daju isti HTML (bez greške pri hidrataciji).
  // Nepoznati id-evi (artikal uklonjen iz ponude) se odbacuju.
  useEffect(() => {
    const known = <T extends { id: string }>(l: T[]) => l.filter((x) => productById(x.id))
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage ne postoji na serveru: čita se tek poslije prvog prikaza */
    setCart(known(read<Line[]>(KEYS.cart, [])).map((l) => ({ id: l.id, qty: Math.min(QTY_MAX, Math.max(1, Math.floor(l.qty) || 1)) })))
    setSaved(read<string[]>(KEYS.saved, []).filter((id) => productById(id)))
    setCompare(read<string[]>(KEYS.compare, []).filter((id) => productById(id)).slice(0, COMPARE_MAX))
    setReady(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  useEffect(() => {
    if (ready) write(KEYS.cart, cart)
  }, [cart, ready])
  useEffect(() => {
    if (ready) write(KEYS.saved, saved)
  }, [saved, ready])
  useEffect(() => {
    if (ready) write(KEYS.compare, compare)
  }, [compare, ready])

  const notify = useCallback((text: string, action?: NonNullable<Toast>['action']) => {
    setToast({ text, action })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const add = useCallback(
    (id: string, qty = 1) => {
      const p = productById(id)
      if (!p) return
      setCart((c) => {
        const found = c.find((l) => l.id === id)
        if (found) return c.map((l) => (l.id === id ? { ...l, qty: Math.min(QTY_MAX, l.qty + qty) } : l))
        return [...c, { id, qty: Math.min(QTY_MAX, qty) }]
      })
      notify(`${p.name}: dodato u korpu`, { label: 'Korpa', panel: 'cart' })
    },
    [notify],
  )
  const setQty = useCallback(
    (id: string, qty: number) =>
      setCart((c) => c.map((l) => (l.id === id ? { ...l, qty: Math.min(QTY_MAX, Math.max(1, Math.floor(qty) || 1)) } : l))),
    [],
  )
  const remove = useCallback((id: string) => setCart((c) => c.filter((l) => l.id !== id)), [])
  const clearCart = useCallback(() => setCart([]), [])

  const toggleSaved = useCallback(
    (id: string) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
    [],
  )
  const toggleCompare = useCallback(
    (id: string) => {
      setCompare((c) => {
        if (c.includes(id)) return c.filter((x) => x !== id)
        if (c.length >= COMPARE_MAX) {
          notify(`Poredite najviše ${COMPARE_MAX} artikla odjednom`)
          return c
        }
        return [...c, id]
      })
    },
    [notify],
  )

  // Otvoren panel zaključava skrol stranice (isto kao meni landinga).
  const openPanel = useCallback((p: Panel) => setPanel(p), [])
  const closePanel = useCallback(() => setPanel(null), [])
  // `start()` se zove samo pri zatvaranju panela: preloader landinga drži skrol zaključan dok traje uvod.
  const locked = useRef(false)
  useEffect(() => {
    if (!lenis) return
    if (panel) {
      lenis.stop()
      locked.current = true
    } else if (locked.current) {
      lenis.start()
      locked.current = false
    }
  }, [panel, lenis])

  const setFilters = useCallback((patch: Partial<Filters>) => setFiltersState((f) => ({ ...f, ...patch })), [])
  const resetFilters = useCallback(() => setFiltersState(DEFAULT_FILTERS), [])

  const count = useMemo(() => cart.reduce((n, l) => n + l.qty, 0), [cart])
  const subtotal = useMemo(() => cart.reduce((n, l) => n + l.qty * (productById(l.id)?.price ?? 0), 0), [cart])

  const value: Shop = {
    cart, saved, compare, count, subtotal,
    add, setQty, remove, clearCart, toggleSaved, toggleCompare,
    panel, openPanel, closePanel,
    filters, setFilters, resetFilters,
    toast, notify, ready,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
