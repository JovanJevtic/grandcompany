'use client'

import { useRef } from 'react'
import { useGSAP } from '@/lib/gsap'
import { SIDE, fitFontSize } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import BadgeMark from './BadgeMark'
import { BRAND } from './SiteChrome'

export default function Footer() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!
      const word = el.querySelector<HTMLElement>('[data-word]')!
      const talk = el.querySelector<HTMLElement>('[data-talk]')!
      let dead = false
      let onResize: (() => void) | null = null

      const boot = contextSafe!(() => {
        if (dead) return
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        // Wordmark se razdvaja na slova PRIJE mjerenja širine, da mjera odgovara onome što se vidi.
        revealChars(word, reduce, 'top 75%')
        const fit = () => {
          word.style.fontSize = `${fitFontSize(word, window.innerWidth * (1 - 2 * SIDE))}px`
        }
        fit()
        onResize = fit
        window.addEventListener('resize', fit)
        revealChars(talk, reduce, 'top 90%')
      })

      document.fonts.ready.then(boot)
      return () => {
        dead = true
        if (onResize) window.removeEventListener('resize', onResize)
      }
    },
    { scope: root },
  )

  return (
    <footer
      ref={root}
      id="kontakt"
      className="relative z-40 flex min-h-[80dvh] flex-col justify-between bg-ink px-[3.05vw] pb-[16dvh] pt-[10dvh] text-bg"
    >
      <div className="text-center">
        <h2
          data-word
          className="invisible inline-block whitespace-nowrap font-bold uppercase leading-none"
          style={{ fontSize: '10vw' }}
        >
          {BRAND}
        </h2>
      </div>

      <div className="flex flex-col items-center gap-10">
        <BadgeMark className="w-[44px] text-bg" />
        <p
          data-talk
          className="invisible text-[clamp(13px,1.25vw,20px)] uppercase leading-none tracking-[0.55em]"
        >
          Banja Luka · od 2012.
        </p>
        <p className="max-w-[90vw] text-center text-[11px] uppercase leading-[1.5] tracking-[0.18em] opacity-60">
          „GRAND COMPANY“ d.o.o. za usluge i trgovinu Banja Luka
        </p>
      </div>
    </footer>
  )
}
