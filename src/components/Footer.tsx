'use client'

import { MAPS_URL } from '@/lib/company'
import Link from 'next/link'
import { useRef } from 'react'
import UseArt from '@/components/landing/UseArt'
import { axisShift } from '@/components/landing/iso'
import Cta from '@/components/ui/Cta'
import Pw from '@/components/ui/Pw'
import { COMPANY } from '@/gc/gc'
import { drawOnScroll } from '@/lib/draw'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ, fitFontSize } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'

const COLS: { title: string; links: [string, string][] }[] = [
  { title: 'Platforma', links: [['B2B portal', '/portal'], ['Katalog', '/prodavnica'], ['Kalkulator', '/prodavnica#kalkulator'], ['Vodiči', '/vodici']] },
  { title: 'Kupovina', links: [['Dostava', '/dostava'], ['Povrat robe', '/povrat-robe'], ['Načini plaćanja', '/nacini-placanja']] },
  { title: 'Pravno', links: [['Uslovi kupovine', '/uslovi-kupovine'], ['Privatnost', '/politika-privatnosti'], ['Sve politike', '/sve-politike']] },
]

// Podnožje u tri pojasa, odvojena tankim linijama:
// 1) poziv (serif naslov, rečenica, CTA) lijevo, a desno pregradni zid koji se SKLAPA dok footer ulazi
//    u ekran — slojevi (ploča, profili, vuna, ploča) dolaze iz rastavljenog položaja na svoje mjesto;
// 2) mreža ćelija sa kontaktom i linkovima (sitni sans u verzalu);
// 3) veliki wordmark koji izroni slovo po slovo + jedan red sa podacima firme.
export default function Footer() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    (_, contextSafe) => {
      const el = root.current!
      const word = el.querySelector<HTMLElement>('[data-word]')!
      const svg = el.querySelector<SVGSVGElement>('[data-build] svg')!
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
          drawOnScroll(svg, reduce, { trigger: svg, start: 'top 90%', duration: 1.4 })
          if (reduce) return
          gsap.fromTo(split.chars, { yPercent: 110 }, { yPercent: 0, duration: 1.4, ease: EASE.quint, stagger: 0.04, scrollTrigger: { trigger: word, start: 'top 98%' } })

          // Sklapanje: svaki sloj kreće iz rastavljenog položaja (dalje što je bliži) i dolazi na 0.
          const axis = svg.dataset.axis as 'x' | 'y' | 'z'
          const gap = Number(svg.dataset.gap)
          gsap.utils.toArray<SVGGElement>('[data-layer]', svg).forEach((layer, k) => {
            const { x, y } = axisShift(axis, k * gap)
            gsap.fromTo(
              layer,
              { x, y },
              { x: 0, y: 0, ease: 'none', scrollTrigger: { trigger: svg, start: 'top 95%', end: 'bottom 55%', scrub: 0.8 } },
            )
          })
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
    <footer ref={root} id="kontakt" className="relative z-40 overflow-x-clip bg-ink text-bg [--art-fill:var(--ink)]">
      {/* 1. Poziv + zid koji se sklapa */}
      <div className="grid border-b border-bg/15 md:grid-cols-2">
        <div className="flex flex-col justify-between gap-12 px-5 pb-16 pt-[18vh] md:border-r md:border-bg/15 md:px-10 md:pb-14">
          <h2 data-head className="display invisible text-[clamp(56px,7vw,128px)]">
            <Pw>
              Gradimo
              <br />
              zajedno.
            </Pw>
          </h2>
          <div className="flex flex-col gap-8">
            <p className="max-w-[44ch] text-[12.5px] leading-[1.7] opacity-70">
              Upit za veći projekat, otvaranje B2B partnerskog računa ili savjet o sistemu suhe gradnje — javite se.
            </p>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              <Cta href={`mailto:${COMPANY.emailSales}`} className="[--cta-fill:var(--bg)] [--cta-ink:var(--ink)]">
                Pišite
              </Cta>
              <a href={COMPANY.phoneMobileHref} className="ulink text-[12.5px] tabular-nums">
                {COMPANY.phoneMobile}
              </a>
            </div>
          </div>
        </div>
        <div data-build className="flex items-center justify-center px-8 py-[10vh] md:px-[5vw]">
          <UseArt use="pregradni-zid" className="w-full max-w-[560px] text-bg/90" title="Pregradni zid: ploča, profili, vuna, ploča" />
        </div>
      </div>

      {/* 2. Kontakt i linkovi: ćelije sa tankim linijama */}
      <div className="grid grid-cols-2 text-[11.5px] md:grid-cols-5 [&>*]:border-b [&>*]:border-bg/15 [&>*:nth-child(odd)]:border-r md:[&>*:not(:last-child)]:border-r [&>*:last-child]:col-span-2 [&>*:last-child]:border-r-0 md:[&>*:last-child]:col-span-1">
        <div className="px-5 py-10 md:px-10 md:py-12">
          <p className="mb-6 opacity-45">Sjedište i stovarište</p>
          <address className="not-italic leading-[1.9]">
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="group block" aria-label="Stovarište na Google mapi">
              {COMPANY.address.split(', ').map((l) => (
                <span key={l} className="block">
                  <span className="ulink">{l}</span>
                </span>
              ))}
              <span className="block opacity-60">Zalužani / Lazarevo · mapa ↗</span>
            </a>
            <a href={`mailto:${COMPANY.emailInfo}`} className="ulink break-all">
              {COMPANY.emailInfo}
            </a>
            <br />
            <a href={`mailto:${COMPANY.emailSales}`} className="ulink break-all">
              {COMPANY.emailSales}
            </a>
          </address>
        </div>
        <div className="px-5 py-10 md:px-10 md:py-12">
          <p className="mb-6 opacity-45">Telefoni i radno vrijeme</p>
          <dl className="grid gap-1 leading-[1.6]">
            <dt className="opacity-60">Veleprodaja / skladište</dt>
            <dd>
              <a href={COMPANY.phoneLandlineHref} className="ulink tabular-nums">
                {COMPANY.phoneLandline}
              </a>
            </dd>
            <dt className="mt-2 opacity-60">Mobilni / Viber / WhatsApp</dt>
            <dd>
              <a href={COMPANY.phoneMobileHref} className="ulink tabular-nums">
                {COMPANY.phoneMobile}
              </a>
            </dd>
            <dt className="mt-2 opacity-60">Pon–Pet · Sub · Ned</dt>
            <dd className="tabular-nums">07–17 · 07–14 · neradna</dd>
          </dl>
        </div>
        {COLS.map((c) => (
          <div key={c.title} className="px-5 py-10 md:px-10 md:py-12">
            <p className="mb-6 opacity-45">{c.title}</p>
            <ul className="flex flex-col gap-2.5">
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

      {/* 3. Wordmark + red sa podacima firme */}
      <div className="mt-[10vh] overflow-x-clip px-5 pb-[1.5vw] text-center">
        <p data-word className="font-hero inline-block whitespace-nowrap leading-[0.9] tracking-[-0.02em]" aria-label="Grand Company">
          Grand Company
        </p>
      </div>

      <div className="flex flex-col items-center justify-between gap-2 border-t border-bg/15 px-5 py-5 text-[10.5px] opacity-50 md:flex-row md:px-10">
        <p>
          © {COMPANY.founded}–2026 {COMPANY.name} · JIB {COMPANY.jib} · PIB {COMPANY.pib} · MBS {COMPANY.mbs} ·{' '}
          <Link href="/o-prodavcu" className="ulink">
            Podaci o prodavcu
          </Link>
        </p>
        <p>Demo prodavnica — narudžbe se još ne šalju</p>
      </div>
    </footer>
  )
}
