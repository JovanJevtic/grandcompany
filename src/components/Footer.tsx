'use client'

import Link from 'next/link'
import { useRef } from 'react'
import Cta from '@/components/ui/Cta'
import { COMPANY } from '@/gc/gc'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ, fitFontSize } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import Pw from '@/components/ui/Pw'

const COLS: { title: string; links: [string, string][] }[] = [
  { title: 'Prodavnica', links: [['Katalog', '/prodavnica'], ['Kalkulator zida', '/prodavnica#kalkulator'], ['Objave', '/objave']] },
  { title: 'Kupovina', links: [['Dostava', '/dostava'], ['Povrat robe', '/povrat-robe'], ['Načini plaćanja', '/nacini-placanja']] },
  { title: 'Pravno', links: [['Uslovi kupovine', '/uslovi-kupovine'], ['Privatnost', '/politika-privatnosti'], ['Sve politike', '/sve-politike']] },
]

// Podnožje: rečenica-poziv, kontakt, tri kratke kolone i veliki wordmark koji izroni slovo po slovo.
// Podaci firme (JIB, adresa) stoje u jednom sitnom redu na dnu — zakonski dovoljno, vizuelno tiho.
export default function Footer() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!
      const word = el.querySelector<HTMLElement>('[data-word]')!
      let dead = false
      let onResize: (() => void) | null = null

      const boot = contextSafe!(() => {
        if (dead) return
        const fit = () => {
          word.style.fontSize = `${fitFontSize(word, (el.clientWidth - 40) * 0.95)}px`
        }
        fit()
        onResize = fit
        window.addEventListener('resize', fit)
        gsap.matchMedia().add(MQ, (ctx) => {
          const { reduce } = ctx.conditions as { reduce: boolean }
          revealChars(el.querySelector('[data-head]')!, reduce, 'top 85%')
          const split = revealChars(word, true)
          if (reduce) return
          gsap.fromTo(split.chars, { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: EASE.quint, stagger: 0.04, scrollTrigger: { trigger: word, start: 'top 98%' } })
        })
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
    <footer ref={root} id="kontakt" className="relative z-40 overflow-x-clip bg-ink pt-[20vh] text-bg">
      <div className="flex flex-col items-center px-5 text-center">
        <h2 data-head className="display invisible text-title"><Pw>
          Gradimo <em>zajedno.</em>
        </Pw></h2>
        <p className="mt-8 max-w-[34ch] text-[17px] italic opacity-70">Upit za veći projekat, ponuda za partnere ili samo savjet — javite se.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
          <Cta href={`mailto:${COMPANY.emailSales}`} className="[--cta-fill:var(--bg)] [--cta-ink:var(--ink)]">
            Pišite nam
          </Cta>
          <a href={COMPANY.phoneMobileHref} className="ulink text-[17px] tabular-nums">
            {COMPANY.phoneMobile}
          </a>
        </div>
      </div>

      <div className="mx-auto mt-[18vh] grid w-[calc(100%-40px)] grid-cols-2 gap-x-6 gap-y-12 border-t border-bg/15 pt-12 text-[15px] md:w-[88vw] md:grid-cols-4">
        <div>
          <p className="mb-4 italic opacity-50">Stovarište</p>
          <address className="not-italic leading-[1.6]">
            {COMPANY.address.split(', ').map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
            <a href={COMPANY.phoneLandlineHref} className="ulink mt-2 inline-block tabular-nums">
              {COMPANY.phoneLandline}
            </a>
          </address>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="mb-4 italic opacity-50">{c.title}</p>
            <ul className="flex flex-col gap-1.5">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="ulink">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-[14vh] overflow-x-clip px-5 pb-[1.5vw] text-center">
        <p data-word className="font-pretty inline-block whitespace-nowrap leading-[0.9] tracking-[-0.02em]" aria-label="Grand Company">
          Grand Company
        </p>
      </div>

      <div className="flex flex-col items-center justify-between gap-2 px-5 pb-8 pt-6 text-[12px] opacity-45 md:flex-row md:px-10">
        <p>
          © {COMPANY.founded}–2026 {COMPANY.name} · JIB {COMPANY.jib} ·{' '}
          <Link href="/o-prodavcu" className="ulink">
            Podaci o prodavcu
          </Link>
        </p>
        <p className="italic">Demo prodavnica — narudžbe se još ne šalju.</p>
      </div>
    </footer>
  )
}
