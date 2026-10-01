import { useSyncExternalStore } from 'react'
import { DELIVERY_ZONES, type DeliveryMethod } from '@/lib/logistics'

// Postavke isporuke za trenutnu korpu: gradilište (B2B), zona dostave i način (preuzimanje /
// standard / kamion sa kranom). Pamti se u browseru, kao korpa. Koriste ih korpa, portal i predračun.

export type DeliveryPrefs = { siteId: string | null; zoneId: string; method: DeliveryMethod }

const STORAGE = 'grand-delivery-v1'
const EMPTY: DeliveryPrefs = { siteId: null, zoneId: DELIVERY_ZONES[0].id, method: 'standard' }

let state = EMPTY
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const raw = window.localStorage.getItem(STORAGE)
    if (!raw) return
    const d = JSON.parse(raw) as Partial<DeliveryPrefs>
    state = {
      siteId: typeof d.siteId === 'string' ? d.siteId : null,
      zoneId: DELIVERY_ZONES.some((z) => z.id === d.zoneId) ? (d.zoneId as string) : EMPTY.zoneId,
      method: d.method === 'kran' || d.method === 'preuzimanje' ? d.method : 'standard',
    }
  } catch {}
}

export function setPrefs(patch: Partial<DeliveryPrefs>) {
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

export function useDeliveryPrefs() {
  return useSyncExternalStore(
    subscribe,
    () => {
      load()
      return state
    },
    () => EMPTY,
  )
}

export const METHOD_LABEL: Record<DeliveryMethod, string> = {
  preuzimanje: 'Preuzimanje na stovarištu',
  standard: 'Standardna dostava',
  kran: 'Kamion sa kranom',
}
