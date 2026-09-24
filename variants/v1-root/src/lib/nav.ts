import type Lenis from 'lenis'
import { BAND } from './motion'
import { CHAPTERS } from './content'
import { HEADER_H, isDesktop, leftInStrip } from './landing'

const expoInOut = (t: number) =>
  t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2

const options = (immediate: boolean, duration = 2.4) =>
  immediate ? { immediate: true, force: true } : { duration, easing: expoInOut }

// Odlazak na poglavlje. Na desktopu se skroluje tako da se traka tog poglavlja tačno "zalijepi" ulijevo.
// index -1 je hero (početak); index poslije zadnjeg poglavlja je prodavnica.
export function scrollToChapter(lenis: Lenis | undefined, index: number, immediate = false) {
  if (!lenis) return
  if (index < 0) {
    lenis.scrollTo(0, options(immediate))
    return
  }
  if (index >= CHAPTERS.length) {
    scrollToId(lenis, 'prodavnica', immediate)
    return
  }
  const el = document.querySelector<HTMLElement>(`[data-chapter="${CHAPTERS[index].id}"]`)
  if (!el) return
  // Na desktopu je vodoravni položaj trake jednak okomitom skrolu (pin počinje na vrhu stranice).
  if (isDesktop()) lenis.scrollTo(leftInStrip(el) - BAND * index, options(immediate))
  else lenis.scrollTo(el, { ...options(immediate), duration: immediate ? undefined : 1.6 })
}

// Odlazak na sekciju prodavnice po id-u (npr. "katalog"). Ispod fiksnog zaglavlja, osim na samom vrhu prodavnice.
export function scrollToId(lenis: Lenis | undefined, id: string, immediate = false) {
  // "kontakt" je zadnje poglavlje landinga (vodoravna traka), ne sekcija sa id-em.
  if (id === 'kontakt') {
    scrollToChapter(lenis, CHAPTERS.length - 1, immediate)
    return
  }
  const el = document.getElementById(id)
  if (!lenis || !el) return
  const offset = id === 'prodavnica' ? 0 : -HEADER_H
  lenis.scrollTo(el, { ...options(immediate, 2), offset })
}
