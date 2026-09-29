'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import GcMonogram from './GcMonogram'

// Uvodni splash (uzor: leome-and-partners.com): četiri kvadratića se skupe u 2x2 blok,
// raziđu se u čoškove okvira, pa iz dna izranja monogram; na kraju se zavjesa podigne.
//
// Animacija je u `splash.css` (CSS keyframes), a ne u GSAP-u — CSS animacija traje svoje
// vrijeme nezavisno od glavne niti. Ovaj modul: zaključava skrol, čeka da 3D scena bude
// spremna i da frejmovi teku (inače se uvod zamrzne), pa pusti uvod, i na kraju sakrije
// splash i javi ostatku strane da je gotovo.
export default function Splash() {
  const root = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const lenisRef = useRef<typeof lenis>(undefined)

  // Dok splash traje, strana se ne skrola.
  useEffect(() => {
    lenisRef.current = lenis
    if (!lenis) return
    lenis.stop()
    return () => lenis.start()
  }, [lenis])

  useEffect(() => {
    const el = root.current
    if (!el) return
    let done = false
    let kicked = false
    let safety = 0

    const finish = () => {
      if (done) return
      done = true
      el.style.display = 'none'
      lenisRef.current?.start()
      document.documentElement.dataset.gcSplash = 'done'
      window.dispatchEvent(new CustomEvent('gc:splash-done'))
    }

    // Uvod kreće tek kad glavna nit diše: 3D scena i hidratacija znaju da blokiraju nit
    // nekoliko sekundi, a animacija pokrenuta prije toga se ne vidi (zamrzne se u prvom frejmu).
    let raf = 0
    const kick = () => {
      if (kicked) return
      kicked = true
      window.setTimeout(() => el.classList.add('is-playing'), 150)
      // Sigurnosna mreža: splash se sakrije i ako animacija ne javi kraj.
      safety = window.setTimeout(finish, 4200)
    }

    // Frejmovi su pouzdan signal da nit diše — dok je blokirana, `requestAnimationFrame` ne stiže.
    // Na strani sa 3D scenom čeka se i da scena bude spremna (`__gcCraneReady`), jer njena
    // inicijalizacija ume da blokira nit nekoliko sekundi i pojede uvod.
    let last = performance.now()
    const flow = () => {
      const now = performance.now()
      const gap = now - last
      last = now
      const craneDone = window.__gcCraneReady === true || !document.querySelector('.construction-story')
      if (craneDone && gap < 150 && now > 350) kick()
      else raf = requestAnimationFrame(flow)
    }
    raf = requestAnimationFrame(flow)
    // Kapija: ako nešto zaglavi, uvod se ipak pusti.
    const cap = window.setTimeout(kick, 8000)

    // Kraj se čita iz same animacije (animationend na zavjesi), pa se sakrivanje poklopi sa CSS-om.
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === 'splash-curtain') finish()
    }
    el.addEventListener('animationend', onEnd)

    return () => {
      el.removeEventListener('animationend', onEnd)
      cancelAnimationFrame(raf)
      window.clearTimeout(cap)
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
      style={{ background: '#222a36', position: 'fixed', inset: 0, zIndex: 900, overflow: 'hidden' }}
    >
      <div className="splash-frame">
        {([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(([sx, sy], i) => (
          <span key={i} data-cell className="splash-cell" style={corner(sx, sy)} />
        ))}

        <div className="splash-mark-mask">
          <div data-mark className="splash-mark">
            <GcMonogram className="block h-auto w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
