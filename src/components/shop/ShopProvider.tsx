'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { cart, type Lines } from '@/lib/cart'
import { PRODUCTS, type Product } from '@/lib/shop'
import { lockScroll, unlockScroll } from '@/lib/scroll'

type View = { p: Product; rect: DOMRect } | null

type Shop = {
  lines: Lines
  count: number // ukupan broj komada
  total: number // ukupna cijena u KM
  added: string | null // artikal koji je upravo dodat (dugme kratko potvrdi)
  add: (id: string, qty?: number) => void
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  clear: () => void
  cartOpen: boolean
  setCartOpen: (v: boolean) => void
  view: View // uvećan artikal (brzi pregled)
  openView: (p: Product, rect: DOMRect) => void
  closeView: () => void
}

const Ctx = createContext<Shop | null>(null)

export function useShop() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useShop se koristi samo unutar ShopProvider')
  return ctx
}

// Korpa, drawer korpe i brzi pregled artikla dijele se između Nav-a, kartica i drawera.
export default function ShopProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(cart.subscribe, cart.snapshot, cart.serverSnapshot)
  const [cartOpen, setCartOpen] = useState(false)
  const [view, setView] = useState<View>(null)
  const [added, setAdded] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const { count, total } = useMemo(() => {
    let c = 0
    let t = 0
    for (const p of PRODUCTS) {
      const q = lines[p.id]
      if (q) {
        c += q
        t += q * p.price
      }
    }
    return { count: c, total: t }
  }, [lines])

  const add = useCallback((id: string, qty = 1) => {
    cart.add(id, qty)
    setAdded(id)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(null), 1600)
  }, [])

  const openView = useCallback((p: Product, rect: DOMRect) => setView({ p, rect }), [])
  const closeView = useCallback(() => setView(null), [])

  // dok je korpa ili artikal otvoren, stranica ispod se ne skroluje
  useEffect(() => {
    if (!cartOpen) return
    lockScroll('cart')
    return () => unlockScroll('cart')
  }, [cartOpen])
  useEffect(() => {
    if (!view) return
    lockScroll('view')
    return () => unlockScroll('view')
  }, [view])
  useEffect(() => () => clearTimeout(timer.current), [])

  const value = useMemo<Shop>(
    () => ({
      lines,
      count,
      total,
      added,
      add,
      setQty: cart.setQty,
      remove: cart.remove,
      clear: cart.clear,
      cartOpen,
      setCartOpen,
      view,
      openView,
      closeView,
    }),
    [lines, count, total, added, add, cartOpen, view, openView, closeView],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
