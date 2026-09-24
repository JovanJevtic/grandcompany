'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { cart, type Lines } from '@/lib/cart'
import { COMPARE_MAX, compareList, savedList } from '@/lib/lists'
import { PRODUCTS, productById, type Product } from '@/lib/shop'
import { lockScroll, unlockScroll } from '@/lib/scroll'

type View = { p: Product; rect: DOMRect } | null
export type ListPanel = 'saved' | 'compare' | null

type Shop = {
  lines: Lines
  count: number // broj različitih artikala u korpi (količine su u m², kom, kut...)
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
  // iz grand-root: sačuvano i poređenje (do tri artikla)
  saved: string[]
  compare: string[]
  toggleSaved: (id: string) => void
  toggleCompare: (id: string) => void
  panel: ListPanel // otvoren panel (null = zatvoren)
  panelKind: Exclude<ListPanel, null> // posljednji otvoren, ostaje nacrtan dok traje izlazna animacija
  setPanel: (p: ListPanel) => void
  toast: string | null
  notify: (text: string) => void
}

const Ctx = createContext<Shop | null>(null)

export function useShop() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useShop se koristi samo unutar ShopProvider')
  return ctx
}

// Korpa, sačuvano, poređenje, drawer-i i brzi pregled artikla dijele se između Nav-a, kartica i drawer-a.
export default function ShopProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(cart.subscribe, cart.snapshot, cart.serverSnapshot)
  const saved = useSyncExternalStore(savedList.subscribe, savedList.snapshot, savedList.serverSnapshot)
  const compare = useSyncExternalStore(compareList.subscribe, compareList.snapshot, compareList.serverSnapshot)
  const [cartOpen, setCartOpen] = useState(false)
  const [panelKind, setPanelKind] = useState<Exclude<ListPanel, null>>('saved')
  const [panelOpen, setPanelOpen] = useState(false)
  const panel: ListPanel = panelOpen ? panelKind : null
  const setPanel = useCallback((p: ListPanel) => {
    if (p) setPanelKind(p)
    setPanelOpen(!!p)
  }, [])
  const [view, setView] = useState<View>(null)
  const [added, setAdded] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const { count, total } = useMemo(() => {
    let c = 0
    let t = 0
    for (const p of PRODUCTS) {
      const q = lines[p.id]
      if (q) {
        c += 1
        t += q * p.price
      }
    }
    return { count: c, total: t }
  }, [lines])

  const notify = useCallback((text: string) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }, [])

  // bez količine se dodaje jedno pakovanje (ploča = 2,5 m², vuna = 0,6 m²...)
  const add = useCallback((id: string, qty?: number) => {
    const p = productById(id)
    if (!p) return
    cart.add(id, qty ?? p.step)
    setAdded(id)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(null), 1600)
  }, [])

  const toggleSaved = useCallback(
    (id: string) => {
      const was = savedList.has(id)
      savedList.toggle(id)
      notify(was ? 'Uklonjeno iz sačuvanog' : 'Sačuvano')
    },
    [notify],
  )
  const toggleCompare = useCallback(
    (id: string) => {
      const was = compareList.has(id)
      if (!compareList.toggle(id)) notify(`Poredite najviše ${COMPARE_MAX} artikla odjednom`)
      else notify(was ? 'Uklonjeno iz poređenja' : 'Dodato u poređenje')
    },
    [notify],
  )

  const openView = useCallback((p: Product, rect: DOMRect) => setView({ p, rect }), [])
  const closeView = useCallback(() => setView(null), [])

  // dok je korpa, panel ili artikal otvoren, stranica ispod se ne skroluje
  useEffect(() => {
    if (!cartOpen) return
    lockScroll('cart')
    return () => unlockScroll('cart')
  }, [cartOpen])
  useEffect(() => {
    if (!panel) return
    lockScroll('panel')
    return () => unlockScroll('panel')
  }, [panel])
  useEffect(() => {
    if (!view) return
    lockScroll('view')
    return () => unlockScroll('view')
  }, [view])
  useEffect(
    () => () => {
      clearTimeout(timer.current)
      clearTimeout(toastTimer.current)
    },
    [],
  )

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
      saved,
      compare,
      toggleSaved,
      toggleCompare,
      panel,
      panelKind,
      setPanel,
      toast,
      notify,
    }),
    [lines, count, total, added, add, cartOpen, view, openView, closeView, saved, compare, toggleSaved, toggleCompare, panel, panelKind, setPanel, toast, notify],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
