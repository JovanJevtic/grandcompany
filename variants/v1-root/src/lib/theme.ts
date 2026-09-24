import { gsap } from './gsap'
import { CHAPTERS, COLORS } from './content'

// Aktivno poglavlje određuje boju linija, kursora i navigacije. -1 je hero, a indeks poslije
// zadnjeg poglavlja (CHAPTERS.length) je prodavnica.
// Boje se glatko prelijevaju (GSAP može da animira CSS varijable).
export function applyTheme(index: number) {
  const color = index < 0 ? null : index >= CHAPTERS.length ? COLORS.why : CHAPTERS[index].color
  const c = color ?? COLORS.base
  const nav = color ?? COLORS.bg
  gsap.to(document.documentElement, { '--c': c, '--nav': nav, duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
}
