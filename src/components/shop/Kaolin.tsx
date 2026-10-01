'use client'

import { useEffect, useRef } from 'react'

// Od tvrdog kamena kaolina do umivaonika: JEDAN video, bez ikakve veze sa skrolom osim okidača.
// Kad sekcija uđe u ekran, video krene i odigra se do kraja — jednom — i ostane na umivaoniku.
// Nema pinovanja, nema zaustavljanja skrola, nema premotavanja unazad.
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

    let started = false
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return
        started = true
        io.disconnect()
        v.playbackRate = RATE
        v.play().catch(() => {
          // Ako browser odbije autoplay (rijetko za utišan video), pusti na prvi dodir/klik.
          const go = () => v.play().catch(() => {})
          window.addEventListener('pointerdown', go, { once: true })
        })
      },
      { threshold: 0.45 },
    )
    io.observe(v)
    return () => {
      io.disconnect()
      v.removeEventListener('timeupdate', paint)
      v.removeEventListener('ended', paint)
    }
  }, [])

  return (
    <section
      ref={root}
      id="kaolin"
      className="relative z-20 flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg pt-[var(--story-header)]"
      aria-label="Od kamena kaolina do umivaonika od porcelana"
    >
      <div className="relative mx-auto aspect-video w-[min(100%,calc(78dvh*16/9))]" style={{ maskImage: MASK, WebkitMaskImage: MASK }}>
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
