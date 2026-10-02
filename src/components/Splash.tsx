'use client'

/* eslint-disable @next/next/no-img-element -- znak uvoda je jedan mali WebP, ide odmah sa HTML-om */

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'

// Uvodni splash (uzor: leome-and-partners.com): četiri kvadratića se skupe u 2x2 blok,
// raziđu se u čoškove okvira, pa iz dna izranja monogram; na kraju se zavjesa podigne.
//
// Animacija je u `splash.css` (CSS keyframes) i kreće sama, čim se splash naslika — ne čeka
// ni hidrataciju ni 3D scenu. `transform`/`opacity` vozi kompozitor, pa blokada glavne niti
// (WebGL inicijalizacija ume da blokira nekoliko sekundi) ne zamrzava uvod i ne odlaže ga.
//
// Ovaj modul samo zaključava skrol dok uvod traje i, kad animacija istekne, skloni splash
// i javi ostatku strane (`gc:splash-done`) da mogu da krenu.
export default function Splash() {
  const root = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const lenisRef = useRef<typeof lenis>(undefined)

  // Dok splash traje, strana se ne skrola. Lenis zna da stigne tek POSLIJE kraja uvoda (teža
  // hidratacija); tada se više ne zaključava, inače bi skrol ostao zauvijek zaustavljen.
  useEffect(() => {
    lenisRef.current = lenis
    if (!lenis || document.documentElement.dataset.gcSplash === 'done') return
    lenis.stop()
    return () => lenis.start()
  }, [lenis])

  useEffect(() => {
    const el = root.current
    if (!el) return
    let done = false

    const finish = () => {
      if (done) return
      done = true
      el.style.display = 'none'
      lenisRef.current?.start()
      document.documentElement.dataset.gcSplash = 'done'
      window.dispatchEvent(new CustomEvent('gc:splash-done'))
    }

    // Uz reduced motion uvoda nema (CSS ga sakrije), pa nema ni čekanja.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }

    // Ako je glavna nit bila blokirana i uvod se već odigrao, ne puštamo ga ponovo.
    const running = el.getAnimations({ subtree: true })
    if (running.length && running.every((a) => a.playState === 'finished')) {
      finish()
      return
    }

    // Kraj se čita iz same animacije, pa se skrivanje poklopi sa CSS-om.
    const onEnd = (e: AnimationEvent) => {
      if (e.target === el && e.animationName === 'splash-curtain') finish()
    }
    el.addEventListener('animationend', onEnd)

    // Zavjesa se podiže kad je strana spremna: najmanje 1,5 s (da se uvod odigra), a na početnoj i
    // tek kad je 3D scena nacrtana. Najviše 6 s — spora mreža ne smije zadržati sajt iza zavjese.
    const t0 = performance.now()
    let lifted = false
    let safety = 0
    const lift = () => {
      if (lifted) return
      lifted = true
      el.classList.add('lift')
      window.dispatchEvent(new CustomEvent('gc:splash-lift'))
      safety = window.setTimeout(finish, 1200)
    }
    const ready = () => !document.getElementById('hero') || !!window.__gcCraneReady
    const check = () => {
      if (lifted) return
      const t = performance.now() - t0
      if ((t >= 1500 && ready()) || t >= 6000) lift()
    }
    const timer = window.setInterval(check, 100)
    window.addEventListener('gc:crane-ready', check)
    check()

    return () => {
      el.removeEventListener('animationend', onEnd)
      window.removeEventListener('gc:crane-ready', check)
      window.clearInterval(timer)
      window.clearTimeout(safety)
    }
  }, [])

  // Krajnje pozicije kvadratića: iz centra okvira u njegove ćoškove.
  const corner = (sx: -1 | 1, sy: -1 | 1) =>
    ({
      '--x0': `${sx * 7}px`,
      '--y0': `${sy * 7}px`,
      '--x1': `calc(var(--splash-frame) * ${sx * 0.5})`,
      '--y1': `calc(var(--splash-frame) * 1.12 * ${sy * 0.5})`,
    }) as React.CSSProperties

  return (
    <div
      ref={root}
      data-splash
      aria-hidden
      className="splash"
      // Isti stil i u markup-u, da splash prekrije stranu i prije nego stigne CSS.
      style={{ background: '#1a2331', position: 'fixed', inset: 0, zIndex: 900, overflow: 'hidden' }}
    >
      <div className="splash-frame">
        {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([sx, sy], i) => (
          <span key={i} data-cell className="splash-cell" style={corner(sx, sy)} />
        ))}

        <div className="splash-mark-mask">
          <div data-mark className="splash-mark">
            {/* Znak brenda u svijetloj verziji (za tamnu podlogu uvoda). */}
            <img src="/brand/mark-light.webp" alt="" decoding="async" className="block h-auto w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
