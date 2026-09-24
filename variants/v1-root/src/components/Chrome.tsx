'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { CHAPTERS, COLORS, TONES } from '@/lib/content'
import { BAND, BANDS, EV, MQ } from '@/lib/motion'
import { leftInStrip, shopTop, travel } from '@/lib/landing'
import { scrollToChapter } from '@/lib/nav'
import { applyTheme } from '@/lib/theme'

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

// Fiksni okvir landinga: trake 01–05, navigacija, linija sadržaja i sličica koja prati miš iznad traka.
// Sve je u jednom omotaču (`data-lift`) koji se, kad landing završi, podiže zajedno s njim, pa u prodavnici
// nema ostataka landinga.
export default function Chrome() {
  const root = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const lenisRef = useRef<typeof lenis>(undefined)

  useEffect(() => {
    lenisRef.current = lenis
  }, [lenis])

  useGSAP(
    () => {
      const el = root.current!
      const mm = gsap.matchMedia()

      mm.add(MQ, (ctx) => {
        const { desktop } = ctx.conditions as { desktop: boolean }

        const lift = el.querySelector<HTMLElement>('[data-lift]')!
        const setLift = gsap.quickSetter(lift, 'y', 'px') as (v: number) => void
        const bands = gsap.utils.toArray<HTMLElement>('[data-band]', el)
        const setX = bands.map((b) => gsap.quickSetter(b, 'x', 'px') as (v: number) => void)
        const edge = el.querySelector<HTMLElement>('[data-edge]')!
        const cue = el.querySelector<HTMLElement>('[data-cue]')!
        const thumb = el.querySelector<HTMLElement>('[data-thumb]')!
        const thumbBg = thumb.querySelector<HTMLElement>('[data-thumb-bg]')!
        const html = document.documentElement

        let starts: number[] = []
        let travelPx = 0
        let top = 0 // gdje počinje prodavnica
        let active = -2
        let gone = false
        let cueOn = false

        // Gdje (u koordinatama trake) počinje svako poglavlje, koliko traka putuje i gdje se landing završava.
        const measure = () => {
          travelPx = travel()
          top = shopTop()
          if (!desktop) return
          starts = CHAPTERS.map((c) => {
            const chapter = document.querySelector(`[data-chapter="${c.id}"]`)
            return chapter ? leftInStrip(chapter) : 0
          })
        }

        const update = () => {
          const y = window.scrollY
          const vh = window.innerHeight

          // Kad prodavnica uđe u ekran, cijeli okvir landinga se podiže zajedno s njim (1:1 sa skrolom).
          const l = clamp(y + vh - top, 0, vh)
          setLift(-l)
          const out = l >= vh
          if (out !== gone) {
            gone = out
            lift.style.visibility = out ? 'hidden' : 'visible'
          }

          if (!desktop) return

          // Vodoravni položaj trake jednak je okomitom skrolu, do kraja putanje.
          const s = clamp(y, 0, travelPx)
          const vw = window.innerWidth

          // Svaka traka sjedi tačno na lijevoj ivici svog poglavlja dok putuje, a zaustavi se u lijevom
          // (80·i) ili desnom (vw − (4−i)·80) "steku". `p` je koliko je traka već prešlo ulijevo.
          let p = 0
          bands.forEach((_, i) => {
            const left = BAND * i
            const right = i < BANDS ? vw - (BANDS - i) * BAND : vw
            const x = clamp(starts[i] - s, left, right)
            setX[i](x)
            p += clamp((right - x) / (right - left), 0, 1)
          })
          html.style.setProperty('--le', `${BAND * p}px`)
          html.style.setProperty('--re', `${Math.min(vw, vw - BAND * (BANDS - p))}px`)
          edge.style.opacity = p > 0.02 ? '1' : '0'

          // Na kraju trake pojavi se oznaka "Prodavnica ↓", da se zna da se skrol nastavlja prema dolje.
          const showCue = s >= travelPx - 4 && l < 2
          if (showCue !== cueOn) {
            cueOn = showCue
            cue.style.opacity = showCue ? '1' : '0'
            cue.style.pointerEvents = showCue ? 'auto' : 'none'
          }

          const a = l > vh * 0.5 ? CHAPTERS.length : Math.round(p) - 1 // -1 = hero, CHAPTERS.length = prodavnica
          if (a !== active) {
            active = a
            applyTheme(a)
          }
        }

        const onResize = () => {
          measure()
          update()
        }
        measure()
        update()
        window.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', onResize)
        window.addEventListener(EV.introDone, onResize)
        ScrollTrigger.addEventListener('refresh', onResize)
        document.fonts.ready.then(onResize)

        // Sličica poglavlja prati miš dok je kursor iznad neke trake.
        const xTo = gsap.quickTo(thumb, 'x', { duration: 0.4, ease: 'power3' })
        const yTo = gsap.quickTo(thumb, 'y', { duration: 0.4, ease: 'power3' })
        const onMove = (e: PointerEvent) => {
          xTo(e.clientX - 110)
          yTo(e.clientY - 110)
        }
        if (desktop) window.addEventListener('pointermove', onMove)
        const enters: (() => void)[] = []
        if (desktop) {
          bands.forEach((b, i) => {
            const enter = () => {
              thumbBg.style.background = TONES[i % TONES.length]
              gsap.to(thumb, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power3.out', overwrite: 'auto' })
            }
            const leave = () => gsap.to(thumb, { autoAlpha: 0, scale: 0.9, duration: 0.35, overwrite: 'auto' })
            b.addEventListener('pointerenter', enter)
            b.addEventListener('pointerleave', leave)
            enters.push(() => {
              b.removeEventListener('pointerenter', enter)
              b.removeEventListener('pointerleave', leave)
            })
          })
        }

        return () => {
          window.removeEventListener('scroll', update)
          window.removeEventListener('resize', onResize)
          window.removeEventListener(EV.introDone, onResize)
          ScrollTrigger.removeEventListener('refresh', onResize)
          window.removeEventListener('pointermove', onMove)
          enters.forEach((off) => off())
        }
      })
    },
    { scope: root },
  )

  return (
    <div ref={root}>
      <div data-lift className="pointer-events-none fixed inset-0 z-20 will-change-transform">
        {/* linija koja obilježava lijevu ivicu sadržaja (vidi se tek kad se prva traka zalijepi) */}
        <div
          data-edge
          className="pointer-events-none absolute top-0 hidden h-dvh w-px opacity-0 md:block"
          style={{ left: 'var(--le)', background: 'var(--c)' }}
        />

        {CHAPTERS.map((c, i) => (
          <div
            key={c.id}
            data-band
            className="pointer-events-auto absolute left-0 top-0 z-10 hidden h-dvh w-[80px] cursor-pointer border-l bg-bg md:block"
            style={{
              borderColor: 'var(--c)',
              color: COLORS.base,
              transform: `translateX(${i < BANDS ? `calc(100vw - ${(BANDS - i) * BAND}px)` : '100vw'})`,
            }}
            onClick={() => scrollToChapter(lenisRef.current, i)}
          >
            <div data-band-intro className="relative h-full w-full">
              <span className="lbl absolute left-0 top-[45px] w-full text-center">{c.index}</span>
              <span className="lbl absolute bottom-[45px] left-1/2 -translate-x-1/2 rotate-180 [writing-mode:vertical-rl]">
                {c.label}
              </span>
            </div>
          </div>
        ))}

        {/* navigacija: prati ivice sadržaja, pa se pomjera dok se trake slažu */}
        <button
          data-ui
          data-hover
          type="button"
          className="lbl pointer-events-auto absolute top-[45px] z-20 cursor-pointer"
          style={{ left: 'calc(var(--le) + 45px)', color: 'var(--nav)' }}
          onClick={() => window.dispatchEvent(new Event(EV.menu))}
        >
          Meni
        </button>
        <button
          data-ui
          data-hover
          type="button"
          className="lbl pointer-events-auto absolute top-[45px] z-20 cursor-pointer"
          style={{ right: 'calc(100vw - var(--re) + 45px)', color: 'var(--nav)' }}
          onClick={() => scrollToChapter(lenisRef.current, CHAPTERS.length - 1)}
        >
          Kontakt
        </button>

        {/* na kraju trake: podsjetnik da se skrol nastavlja u prodavnicu */}
        <button
          data-cue
          data-hover
          type="button"
          className="lbl pointer-events-none absolute bottom-[45px] right-[45px] z-20 hidden cursor-pointer opacity-0 transition-opacity duration-700 md:block"
          style={{ color: 'var(--nav)' }}
          onClick={() => scrollToChapter(lenisRef.current, CHAPTERS.length)}
        >
          Prodavnica ↓
        </button>

        <div
          data-thumb
          className="pointer-events-none absolute left-0 top-0 z-30 hidden size-[219px] overflow-hidden opacity-0 md:block"
          style={{ visibility: 'hidden' }}
          aria-hidden
        >
          <div data-thumb-bg className="absolute inset-0" />
        </div>
      </div>
    </div>
  )
}
