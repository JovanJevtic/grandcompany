'use client'

import { useEffect } from 'react'

// Izranjanje sekcija prodavnice i pravnih stranica: svaki element sa `data-reveal` dobije `data-in` kad uđe u
// ekran, a CSS (globals.css) odradi kretanje. Radi i za elemente koji se dodaju kasnije (npr. artikli nakon
// filtriranja). Sakrivanje se uključuje tek ovdje (klasa `rv`), pa bez JS-a sve ostaje vidljivo.
export default function Reveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const html = document.documentElement

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.setAttribute('data-in', '')
          io.unobserve(e.target)
        })
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    )

    const seen = new WeakSet<Element>()
    const scan = () =>
      document.querySelectorAll('[data-reveal]:not([data-in])').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        io.observe(el)
      })

    scan()
    html.classList.add('rv')
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      io.disconnect()
      html.classList.remove('rv')
    }
  }, [])

  return null
}
