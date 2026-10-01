'use client'

/* eslint-disable @next/next/no-img-element -- editorijalna fotografija iz /public, već u WebP */

import { useRef } from 'react'
import Link from 'next/link'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'

// Isporuka: jedna velika fotografija. Sekcija je visoka 240vh, a unutra stoji "sticky" ekran.
// Dok se skrola, okvir (transform: scale) raste iz malog prozora do punog ekrana, slika se smiruje sa zuma,
// a preko nje izroni rečenica. Na kraju ostaje jedan tihi link.
export default function Delivery() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const frame = el.querySelector<HTMLElement>('[data-frame]')!
      const img = el.querySelector<HTMLElement>('img')!
      const lines = el.querySelectorAll<HTMLElement>('[data-line]')
      const foot = el.querySelector<HTMLElement>('[data-foot]')!
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce, mobile } = ctx.conditions as { reduce: boolean; mobile: boolean }
        if (reduce) {
          gsap.set(frame, { scale: 1 })
          gsap.set([lines, foot], { autoAlpha: 1, yPercent: 0 })
          return
        }
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
        })
        // Prozor raste preko transform: scale (radi ga GPU). Ranije je to bio clip-path preko
        // cijelog ekrana, koji browser mora ponovo da iscrta u svakom kadru — to je trzalo.
        tl.fromTo(frame, { scale: mobile ? 0.84 : 0.42 }, { scale: 1, ease: 'none', duration: 1, force3D: true })
          .fromTo(img, { scale: 1.35 }, { scale: 1, ease: 'none', duration: 1.2 }, 0)
          .fromTo(lines, { yPercent: 110 }, { yPercent: 0, ease: EASE.out, duration: 0.4, stagger: 0.12 }, 0.55)
          .fromTo(foot, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.95)
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="isporuka" className="relative z-20 h-[240vh] bg-bg" aria-label="Isporuka kranom">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <div data-frame className="absolute inset-0 overflow-hidden bg-ink will-change-transform" data-cursor="Isporuka">
          <img src="/editorial/delivery.webp" alt="Kamion sa kranom podiže paletu ploča na sprat zgrade u izgradnji" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
        </div>

        <div className="relative flex h-full flex-col items-center justify-center px-5 text-center text-bg">
          <h2 className="display text-[clamp(44px,8.4vw,150px)]">
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-line className="block">
                Istovar
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-line className="block">
                na sprat
              </span>
            </span>
          </h2>
          <p data-foot className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-3 text-[12.5px] md:bottom-14">
            <span className="flex items-center gap-3">
              <span className="max-w-[52ch] opacity-90">
                Vlastiti kamioni sa hidrauličnom dizalicom — paletirani materijal istovaramo direktno na spratove i visoke
                etaže gradilišta u regiji Banja Luke i šire.
              </span>
            </span>
            <Link href="/dostava" className="ulink">
              Dostava i kran-transport
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
