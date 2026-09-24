import type Lenis from 'lenis'
import { SITE } from './company'

// Visina fiksnog zaglavlja prodavnice (red od 60px + traka "Demo prodavnica" od 28px kad je uključena);
// koristi se kao odmak pri skrolu na sidra.
export const HEADER_H = SITE.demo ? 88 : 60

const expoInOut = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2

const options = (immediate: boolean, duration = 2) =>
  immediate ? { immediate: true, force: true } : { duration, easing: expoInOut }

export function scrollToTop(lenis: Lenis | undefined) {
  lenis?.scrollTo(0, options(false, 1.6))
}

// Odlazak na sekciju po id-u (npr. "katalog"), ispod fiksnog zaglavlja.
export function scrollToId(lenis: Lenis | undefined, id: string, immediate = false) {
  const el = document.getElementById(id)
  if (!lenis || !el) return
  lenis.scrollTo(el, { ...options(immediate), offset: -HEADER_H })
}
