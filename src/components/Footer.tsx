'use client'

import { useRef } from 'react'
import { useGSAP } from '@/lib/gsap'
import { SIDE, fitFontSize } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import Link from 'next/link'
import { COMPANY } from '@/gc/gc'
import { LEGAL_DOCS } from '@/lib/legal'
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
      className="relative z-40 flex min-h-[80dvh] flex-col justify-between overflow-x-clip bg-ink px-5 pb-[16dvh] pt-[10dvh] text-bg md:px-[3.05vw]"
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

      {/* Podaci firme i pravne stranice (iz grand-root), složeni u kolone sa linijama od 2px. */}
      <div className="my-[10dvh] grid gap-10 border-t-2 border-bg pt-6 text-micro uppercase sm:grid-cols-2 md:mx-[5.3vw] lg:grid-cols-4 lg:gap-[1.5vw]">
        <div>
          <p className="opacity-60">Kontakt</p>
          <address className="mt-4 flex flex-col gap-2 not-italic leading-[1.3]">
            <span>{COMPANY.address}</span>
            <a href={COMPANY.phoneLandlineHref} className="hover:underline">Tel. {COMPANY.phoneLandline}</a>
            <a href={COMPANY.phoneMobileHref} className="hover:underline">Mob. {COMPANY.phoneMobile}</a>
            <a href={`mailto:${COMPANY.emailInfo}`} className="normal-case hover:underline">{COMPANY.emailInfo}</a>
            <a href={`mailto:${COMPANY.emailSales}`} className="normal-case hover:underline">{COMPANY.emailSales}</a>
          </address>
        </div>
        <div>
          <p className="opacity-60">Firma</p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 tabular-nums">
            <dt className="opacity-60">JIB</dt>
            <dd>{COMPANY.jib}</dd>
            <dt className="opacity-60">PIB</dt>
            <dd>{COMPANY.pib}</dd>
            <dt className="opacity-60">MBS</dt>
            <dd>{COMPANY.mbs}</dd>
            <dt className="opacity-60">Osnovana</dt>
            <dd>{COMPANY.founded}.</dd>
          </dl>
        </div>
        {(['kupovina', 'pravno'] as const).map((g) => (
          <div key={g}>
            <p className="opacity-60">{g === 'kupovina' ? 'Kupovina' : 'Pravno'}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {LEGAL_DOCS.filter((d) => d.group === g || (g === 'pravno' && d.group === 'usluge')).map((d) => (
                <li key={d.slug}>
                  <Link href={`/${d.slug}`} className="hover:underline">
                    {d.title}
                  </Link>
                </li>
              ))}
              {g === 'pravno' && (
                <li>
                  <Link href="/sve-politike" className="hover:underline">
                    Sve politike →
                  </Link>
                </li>
              )}
            </ul>
          </div>
        ))}
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
          {COMPANY.name} · Demo prodavnica: narudžbe i upiti se još ne šalju.
        </p>
      </div>
    </footer>
  )
}
