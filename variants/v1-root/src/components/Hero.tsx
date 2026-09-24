'use client'

import { useRef } from 'react'
import { useGSAP } from '@/lib/gsap'
import { fitFontSize } from '@/lib/motion'

// Dvije riječi okomito, na sivoj "video" ploči. Lijeva se čita odozdo prema gore, desna odozgo prema dolje.
const LEFT = 'GRAND'
const RIGHT = 'COMPANY'

// Vanjski element razvlači slova po visini (na ekranu: po debljini riječi) od same ivice, da budu "viša"
// kao na referenci. Unutarnji se rotira oko svog centra (lijeva riječ se čita odozdo prema gore).
function Word({ text, side }: { text: string; side: 'l' | 'r' }) {
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 scale-x-[1.3] ${side === 'l' ? 'left-0 origin-left' : 'right-0 origin-right'}`}
      aria-hidden
    >
      <div
        data-word
        className={`whitespace-nowrap font-serif uppercase leading-none text-bg [writing-mode:vertical-rl] ${
          side === 'l' ? 'rotate-180' : ''
        }`}
        style={{ fontSize: '30vh' }}
      >
        {[...text].map((ch, i) => (
          <span key={i} data-char data-dir={side} className="inline-block">
            {ch}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!
      const words = [...el.querySelectorAll<HTMLElement>('[data-word]')]
      let dead = false

      // Svaka riječ se razvuče na istu visinu; ako im kutije (font-size × 1.3 zbog razvlačenja) ne staju
      // jedna pored druge u širinu hero-a, obje se proporcionalno smanje.
      const fit = () => {
        const H = el.clientHeight
        const W = el.clientWidth
        const sizes = words.map((w) => fitFontSize(w, H * 0.87, 'height'))
        const need = sizes.reduce((a, f) => a + f * 1.3, 0)
        const k = Math.min(1, (W - 16) / need)
        words.forEach((w, i) => (w.style.fontSize = `${sizes[i] * k}px`))
      }

      const boot = contextSafe!(() => {
        if (dead) return
        fit()
        window.addEventListener('resize', fit)
      })
      document.fonts.ready.then(boot)

      return () => {
        dead = true
        window.removeEventListener('resize', fit)
      }
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      data-hero
      className="relative shrink-0 overflow-hidden bg-ink max-md:h-dvh max-md:w-full md:h-dvh md:w-[calc(100vw-320px)]"
    >
      {/* siva ploča umjesto videa + tamni sloj preko nje */}
      <div data-hero-bg className="absolute inset-0 scale-110 will-change-transform">
        <div className="hero-sheen absolute inset-0" />
      </div>
      <div className="absolute inset-0 bg-ink/40" />

      <p className="lbl absolute left-1/2 top-[29px] w-[219px] -translate-x-1/2 text-center leading-[1.05] text-bg max-md:top-[84px] max-md:w-[280px]">
        GRAND COMPANY d.o.o. Banja Luka, veleprodaja i maloprodaja građevinskog materijala
      </p>
      <p className="lbl absolute bottom-[30px] left-1/2 -translate-x-1/2 text-bg">© 2026</p>

      <h1 className="sr-only">GRAND COMPANY</h1>
      <Word text={LEFT} side="l" />
      <Word text={RIGHT} side="r" />
    </section>
  )
}
