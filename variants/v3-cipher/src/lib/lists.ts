import { productById } from '@/lib/shop'

// Sačuvano i poređenje (stanje preneseno iz grand-root ShopProvider: toggleSaved / toggleCompare, COMPARE_MAX),
// napisano kao i korpa u grand-cipher: modul sa pretplatom za useSyncExternalStore, sačuvan u localStorage.
export const COMPARE_MAX = 3

type List = string[]
const EMPTY: List = []

function createList(key: string, max = Infinity) {
  let items: List = EMPTY
  const listeners = new Set<() => void>()

  const read = (): List => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown
      if (!Array.isArray(raw)) return EMPTY
      const clean = raw.filter((id): id is string => typeof id === 'string' && !!productById(id)).slice(0, max)
      return clean.length ? clean : EMPTY
    } catch {
      return EMPTY
    }
  }
  const commit = (next: List) => {
    items = next.length ? next : EMPTY
    try {
      localStorage.setItem(key, JSON.stringify(items))
    } catch {
      // storage nedostupan: lista živi dok je stranica otvorena
    }
    listeners.forEach((l) => l())
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key !== key) return
    items = read()
    listeners.forEach((l) => l())
  }

  return {
    subscribe(cb: () => void) {
      if (listeners.size === 0) {
        items = read()
        window.addEventListener('storage', onStorage)
      }
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
        if (listeners.size === 0) window.removeEventListener('storage', onStorage)
      }
    },
    snapshot: () => items,
    serverSnapshot: () => EMPTY,
    has: (id: string) => items.includes(id),
    /** false kad je lista puna (poređenje: najviše tri artikla) */
    toggle(id: string): boolean {
      if (items.includes(id)) {
        commit(items.filter((x) => x !== id))
        return true
      }
      if (items.length >= max) return false
      commit([...items, id])
      return true
    },
    remove(id: string) {
      commit(items.filter((x) => x !== id))
    },
  }
}

export const savedList = createList('gc:saved')
export const compareList = createList('gc:compare', COMPARE_MAX)
