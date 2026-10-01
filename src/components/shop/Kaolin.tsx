'use client'

import { useEffect, useRef } from 'react'
import { ScrollTrigger } from '@/lib/gsap'

// Od tvrdog kamena kaolina do umivaonika: JEDAN video. Kad sekcija stigne na vrh ekrana, skrol se
// zaključa, video se odigra do kraja (jednom) i skrol se otključa. Nema premotavanja unazad i nema
// ponovnog zaključavanja. Ko skoči preko sekcije (link, End) ne biva zaustavljen; ako video zapne,
// skrol se oslobodi sam (sigurnosni tajmer).
// Fajl je ubrzan 1,5× (ffmpeg); RATE ga dodatno ubrza na ukupno 1,75×.

const SRC = '/kaolin/video/kaolin.mp4?v=3'
const POSTER = '/kaolin/video/kaolin-poster.jpg?v=3'
const RATE = 1.75 / 1.5

// Ivice videa se meko gube u pozadinu stranice.
const MASK = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 52%, transparent 100%)'

export default function Kaolin() {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const fill = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const v = video.current!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Traka ispod prati video (timeupdate je dovoljno gladak za tanku liniju).
    const paint = () => {
      const p = v.duration ? v.currentTime / v.duration : 0
      if (fill.current) fill.current.style.transform = `scaleX(${p})`
    }
    v.addEventListener('timeupdate', paint)
    v.addEventListener('ended', paint)

    // Bez pokreta: odmah zadnji kadar (gotov umivaonik).
    if (reduce) {
      const end = () => {
        v.currentTime = Math.max(0, v.duration - 0.05)
        paint()
      }
      if (v.readyState >= 1) end()
      else v.addEventListener('loadedmetadata', end, { once: true })
      return () => v.removeEventListener('timeupdate', paint)
    }

    let done = false
    let locked = false
    let safety = 0
    const html = document.documentElement
    const unlock = () => {
      if (!locked) return
      locked = false
      window.clearTimeout(safety)
      window.__gcLenis?.start?.()
      html.classList.remove('scroll-held')
    }
    const lock = (at: number) => {
      locked = true
      window.__gcLenis?.scrollTo(at, { immediate: true, force: true })
      window.__gcLenis?.stop?.()
      html.classList.add('scroll-held')
      const dur = (v.duration || 2.8) / RATE
      safety = window.setTimeout(unlock, (dur + 1.5) * 1000)
    }
    const play = () => {
      v.playbackRate = RATE
      v.play().catch(() => {
        // autoplay odbijen (rijetko za utišan video): ne držimo skrol, video krene na prvi dodir
        unlock()
        window.addEventListener('pointerdown', () => v.play().catch(() => {}), { once: true })
      })
    }
    v.addEventListener('ended', unlock)

    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      onEnter: (self) => {
        if (done) return
        done = true
        // zaključava se samo ako se do sekcije stiglo skrolom (nije preskočena)
        if (Math.abs(window.scrollY - self.start) < window.innerHeight * 0.6) lock(self.start)
        play()
      },
    })
    return () => {
      st.kill()
      unlock()
      v.removeEventListener('timeupdate', paint)
      v.removeEventListener('ended', paint)
      v.removeEventListener('ended', unlock)
    }
  }, [])

  return (
    <section
      ref={root}
      id="kaolin"
      className="relative z-20 flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg pt-[calc(var(--story-header)+var(--nav-h)+var(--nav-gap))]"
      aria-label="Od kamena kaolina do umivaonika od porcelana"
    >
      <div className="relative mx-auto aspect-video w-[min(88%,calc(46dvh*16/9))] md:w-[min(64%,calc(54dvh*16/9))]" style={{ maskImage: MASK, WebkitMaskImage: MASK }}>
        <video ref={video} className="absolute inset-0 h-full w-full object-contain" src={SRC} poster={POSTER} muted playsInline preload="auto" aria-hidden />
      </div>
      <p className="sr-only">Komad tvrdog kamena kaolina postaje umivaonik od porcelana sa mesinganom slavinom.</p>

      <div className="mt-2 flex w-full max-w-[1000px] items-center gap-5 px-5 text-[11px] md:gap-8">
        <span className="shrink-0">Kamen</span>
        <div className="relative h-px flex-1 bg-ink/25" aria-hidden>
          <span ref={fill} className="absolute inset-0 origin-left bg-signal" style={{ transform: 'scaleX(0)' }} />
        </div>
        <span className="shrink-0 text-right">Umivaonik</span>
      </div>
    </section>
  )
}
