import type Lenis from 'lenis'
import { EV } from '@/lib/motion'

// Jedan Lenis za cijelu stranicu. Ostale komponente ga ne dodiruju direktno, nego kroz ovaj modul.
let lenis: Lenis | null = null
const locks = new Set<string>()

// Skrol je zaključan dok god je bar jedan "ključ" aktivan (loader, kontakt, korpa, uvećan artikal...).
// CSS za html[data-lock] je u globals.css; Lenis se zaustavlja jer inače sam pomjera stranicu.
function sync() {
  if (typeof document === 'undefined') return
  const locked = locks.size > 0
  document.documentElement.toggleAttribute('data-lock', locked)
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
}

export function setLenis(instance: Lenis | null) {
  lenis = instance
  sync()
}

export function lockScroll(key: string) {
  locks.add(key)
  sync()
}

export function unlockScroll(key: string) {
  locks.delete(key)
  sync()
}

// Glatki skrol do elementa (selektor ili broj u pikselima); bez Lenisa (reduced motion) običan skrol.
export function scrollToTarget(target: string | number, onComplete?: () => void) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.4, onComplete })
    return
  }
  if (typeof target === 'number') window.scrollTo({ top: target })
  else document.querySelector(target)?.scrollIntoView()
  onComplete?.()
}

// Kontakt ("pikselizirani" prsten) postoji samo u heroju, pa se prvo vraćamo na vrh.
export function openContact() {
  const open = () => window.dispatchEvent(new CustomEvent(EV.contact, { detail: true }))
  if (window.scrollY < window.innerHeight * 0.4) open()
  else scrollToTarget(0, open)
}

// Prikaži prodavnicu filtriranu na jednu kategoriju (koristi se iz Materijala i podnožja).
export function showCategory(cat: string) {
  window.dispatchEvent(new CustomEvent(EV.filter, { detail: cat }))
  scrollToTarget('#ponuda')
}
