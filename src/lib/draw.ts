import { gsap } from './gsap'
import { EASE } from './motion'

// Outline crteži (SVG, stroke="currentColor", fill="none") se iscrtavaju liniju po liniju.
// Crtaju se svi elementi sa `data-d`; vrijednost atributa je redoslijed (0, 1, 2...) —
// isti broj crta se zajedno. Crtež bez `data-d` elemenata crta sve path/line/circle/rect/polyline.
//
// scrub: true → crtež prati skrol (i vraća se kad se skrola nazad);
// scrub: false → jednom se iscrta kad uđe u ekran.

const SHAPES = 'path, line, circle, ellipse, rect, polyline, polygon'

export function drawOnScroll(
  svg: Element,
  reduce: boolean,
  { scrub = false, start = 'top bottom', end = 'bottom 40%', trigger = svg as Element, duration = 0.3 } = {},
) {
  const marked = svg.querySelectorAll<SVGElement>('[data-d]')
  const parts = marked.length ? Array.from(marked) : Array.from(svg.querySelectorAll<SVGElement>(SHAPES))
  if (!parts.length) return null
  if (reduce) {
    gsap.set(parts, { drawSVG: '0% 100%' })
    return null
  }

  const groups = new Map<number, SVGElement[]>()
  parts.forEach((p) => {
    const k = Number(p.getAttribute('data-d') ?? 0)
    groups.set(k, [...(groups.get(k) ?? []), p])
  })

  const tl = gsap.timeline({
    scrollTrigger: scrub ? { trigger, start, end, scrub: 0.8 } : { trigger, start },
  })
  ;[...groups.keys()]
    .sort((a, b) => a - b)
    .forEach((k, i) => {
      tl.fromTo(
        groups.get(k)!,
        { drawSVG: '0% 0%' },
        { drawSVG: '0% 100%', duration, ease: scrub ? 'none' : EASE.out, stagger: 0.008 },
        // grupe skoro istovremeno: cijeli crtež je gotov za ~0.4 s
        i === 0 ? 0 : `<0.05`,
      )
    })
  return tl
}
