import { productById, round2 } from '@/lib/shop'

// Količine su u jedinici artikla (m², kom, kut...), pa mogu biti decimalne (ploča = 2,5 m²).
// Korpa je običan modul sa pretplatom (koristi se kroz useSyncExternalStore u ShopProvider). Sačuvana je u
// localStorage, pa preživi osvježavanje stranice. Server uvijek vidi praznu korpu; preglednik je učita tek pri
// pretplati, da se prvi prikaz podudara sa serverskim.
export type Lines = Record<string, number>

const KEY = 'gc:cart'
const MAX = 9999
const EMPTY: Lines = {}

let lines: Lines = EMPTY
const listeners = new Set<() => void>()

function read(): Lines {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, unknown>
    const clean: Lines = {}
    for (const [id, q] of Object.entries(raw)) {
      if (productById(id) && typeof q === 'number' && Number.isFinite(q) && q > 0) clean[id] = Math.min(round2(q), MAX)
    }
    return Object.keys(clean).length ? clean : EMPTY
  } catch {
    return EMPTY
  }
}

function commit(next: Lines) {
  lines = Object.keys(next).length ? next : EMPTY
  try {
    localStorage.setItem(KEY, JSON.stringify(lines))
  } catch {
    // privatni prozor ili blokiran storage: korpa radi, samo se ne pamti
  }
  listeners.forEach((l) => l())
}

// druga kartica je promijenila korpu
function onStorage(e: StorageEvent) {
  if (e.key !== KEY) return
  lines = read()
  listeners.forEach((l) => l())
}

export const cart = {
  subscribe(cb: () => void) {
    if (listeners.size === 0) {
      lines = read()
      window.addEventListener('storage', onStorage)
    }
    listeners.add(cb)
    return () => {
      listeners.delete(cb)
      if (listeners.size === 0) window.removeEventListener('storage', onStorage)
    }
  },
  snapshot: () => lines,
  serverSnapshot: () => EMPTY,

  add(id: string, qty = 1) {
    if (!productById(id)) return
    commit({ ...lines, [id]: Math.min(round2((lines[id] ?? 0) + qty), MAX) })
  },
  setQty(id: string, qty: number) {
    if (!lines[id]) return
    if (qty <= 0.001) return cart.remove(id)
    commit({ ...lines, [id]: Math.min(round2(qty), MAX) })
  },
  remove(id: string) {
    const rest = { ...lines }
    delete rest[id]
    commit(rest)
  },
  clear() {
    commit({})
  },
}
