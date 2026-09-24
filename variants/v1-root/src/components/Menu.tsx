'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import { gsap, useGSAP } from '@/lib/gsap'
import { COLORS, MENU } from '@/lib/content'
import { EASE, EV } from '@/lib/motion'
import { scrollToChapter } from '@/lib/nav'

// Meni preko cijelog ekrana: stupci sa džinovskim naslovima poglavlja (pet poglavlja landinga + prodavnica).
// Klik vodi na poglavlje.
export default function Menu() {
  const root = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const lenisRef = useRef<typeof lenis>(undefined)
  const state = useRef({ open: false, close: () => {} })

  useEffect(() => {
    lenisRef.current = lenis
  }, [lenis])

  useGSAP(
    () => {
      const el = root.current!
      const cols = gsap.utils.toArray<HTMLElement>('[data-mcol]', el)
      // Početni položaj se postavlja iz GSAP-a, ne iz CSS-a: CSS transform u % GSAP čita kao piksele i pomnoži ga.
      gsap.set(el, { xPercent: -100, autoAlpha: 1 })

      const tl = gsap.timeline({ paused: true })
      tl.to(el, { xPercent: 0, duration: 1.1, ease: EASE.expoInOut }).from(
        cols,
        { yPercent: 8, autoAlpha: 0, duration: 1, ease: EASE.expo, stagger: 0.07 },
        0.5,
      )

      const setOpen = (open: boolean) => {
        state.current.open = open
        if (open) {
          lenisRef.current?.stop()
          tl.timeScale(1).play()
        } else {
          tl.timeScale(1.3).reverse()
          lenisRef.current?.start()
        }
      }
      state.current.close = () => setOpen(false)

      const toggle = () => setOpen(!state.current.open)
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && state.current.open && setOpen(false)
      window.addEventListener(EV.menu, toggle)
      window.addEventListener('keydown', onKey)
      return () => {
        window.removeEventListener(EV.menu, toggle)
        window.removeEventListener('keydown', onKey)
      }
    },
    { scope: root },
  )

  return (
    <div ref={root} className="invisible fixed inset-0 z-[100] flex bg-bg" aria-label="Meni">
      {MENU.map((c, i) => (
        <button
          key={c.id}
          data-mcol
          data-hover
          type="button"
          className="relative h-full flex-1 cursor-pointer border-l border-base text-left first:border-l-0"
          style={{ color: COLORS.base }}
          onClick={() => {
            // Prvo se skrol skoči (dok je meni još preko ekrana), pa se meni povuče.
            scrollToChapter(lenisRef.current, i, true)
            state.current.close()
          }}
        >
          <span className="lbl absolute left-[34px] top-[45px]">{c.index}</span>
          <span className="lbl absolute bottom-[45px] left-[34px] rotate-180 [writing-mode:vertical-rl]">{c.label}</span>
          <span className="absolute bottom-[45px] left-[68px] rotate-180 font-serif uppercase leading-[0.85] [writing-mode:vertical-rl] text-[min(24dvh,19vw)]">
            {c.label}
          </span>
        </button>
      ))}
      <button
        type="button"
        data-hover
        className="lbl absolute right-[45px] top-[45px] cursor-pointer"
        style={{ color: COLORS.base }}
        onClick={() => state.current.close()}
      >
        Zatvori
      </button>
    </div>
  )
}
