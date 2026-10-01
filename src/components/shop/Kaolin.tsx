'use client'

import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'

// Od sirovog kaolina do umivaonika: jedan video preko cijele širine, odmah poslije herosa.
// Kad sekcija dođe u kadar, skrol pokrene video (bez zvuka) i on ide do kraja; kad se skrola
// nazad iznad sekcije, isti put se pusti unazad, od mjesta gdje je stao.
//
// Chrome ne zna da pusti video unazad (negativan playbackRate), zato postoje dva fajla:
// kaolin.mp4 i kaolin-reverse.mp4 (isti kadrovi obrnutim redom). Pri promjeni smjera
// obrnuti video se premota na isti kadar (vrijeme D − t), pa se tek kad je spreman zamijene.
// Oba su ubrzana 1,5× i posvijetljena ka boji stranice (ffmpeg); ivice utapa CSS maska.
// U browseru se dodatno ubrzavaju (RATE), pa je ukupno 1,75×.
//
// Zaustavljanje skrola: kad sekcija stigne na vrh ekrana, skrol se zaključa dok video ne
// prođe do kraja (Lenis stop), pa se otključa. Nazad (skrol nagore) ne zaključava.

const SRC = '/kaolin/video/kaolin.mp4'
const SRC_REV = '/kaolin/video/kaolin-reverse.mp4'
const POSTER = '/kaolin/video/kaolin-poster.jpg'
const RATE = 1.75 / 1.5

// Ivice videa se meko gube u pozadinu stranice: elipsa u sredini i blagi prelaz gore i dolje.
const MASK =
  'radial-gradient(ellipse 50% 50% at 50% 50%, #000 52%, transparent 100%)'

export default function Kaolin() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = root.current!
      const fwd = el.querySelector<HTMLVideoElement>('[data-fwd]')!
      const rev = el.querySelector<HTMLVideoElement>('[data-rev]')!
      const knob = el.querySelector<HTMLElement>('[data-knob]')!
      const fill = el.querySelector<HTMLElement>('[data-fill]')!
      const bar = el.querySelector<HTMLElement>('[data-bar]')!

      let dir: 1 | -1 = 1
      let raf = 0
      const D = () => fwd.duration || rev.duration || 6.67

      // Napredak 0..1 iz videa koji se trenutno vidi; vozi kuglicu na traci.
      const progress = () => (dir === 1 ? fwd.currentTime / D() : 1 - rev.currentTime / D())
      const paint = () => {
        const p = Math.min(1, Math.max(0, progress()))
        knob.style.left = `${p * 100}%`
        fill.style.transform = `scaleX(${p})`
        bar.setAttribute('aria-valuenow', String(Math.round(p * 100)))
      }
      const tick = () => {
        paint()
        raf = requestAnimationFrame(tick)
      }
      const loop = (on: boolean) => {
        cancelAnimationFrame(raf)
        if (on) raf = requestAnimationFrame(tick)
        else paint()
      }
      fwd.addEventListener('ended', () => loop(false))
      rev.addEventListener('ended', () => loop(false))
      // Rezerva za rAF (koji browser uspori u pozadini): traka se osvježi i na svaki timeupdate.
      fwd.addEventListener('timeupdate', () => dir === 1 && paint())
      rev.addEventListener('timeupdate', () => dir === -1 && paint())

      const show = (v: HTMLVideoElement) => {
        v.style.opacity = '1'
        ;(v === fwd ? rev : fwd).style.opacity = '0'
      }

      // Pusti u zadatom smjeru, nastavljajući od kadra koji se trenutno vidi.
      const play = (to: 1 | -1) => {
        const p = progress()
        const [from, next] = to === 1 ? [rev, fwd] : [fwd, rev]
        from.pause()
        if (to === dir && !next.paused) return
        const t = to === 1 ? p * D() : (1 - p) * D()
        const start = () => {
          dir = to
          show(next)
          next.playbackRate = RATE
          next.play().catch(() => {})
          loop(true)
        }
        if (Math.abs(next.currentTime - t) < 0.05) start()
        else {
          next.addEventListener('seeked', start, { once: true })
          next.currentTime = Math.min(t, D() - 0.01)
        }
      }

      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce, mobile } = ctx.conditions as { reduce: boolean; mobile: boolean }
        if (reduce) {
          // Bez pokreta: stoji gotov proizvod, traka je puna.
          const end = () => {
            fwd.currentTime = D() - 0.05
            paint()
          }
          if (fwd.readyState >= 1) end()
          else fwd.addEventListener('loadedmetadata', end, { once: true })
          return
        }
        // Sekcija je pinovana; kad stigne na vrh, skrol staje dok video ne prođe (naprijed).
        let locked = false
        let safety = 0
        const unlock = () => {
          if (!locked) return
          locked = false
          window.clearTimeout(safety)
          window.__gcLenis?.start?.()
          document.documentElement.classList.remove('scroll-held')
        }
        const lock = (at: number) => {
          if (locked || progress() > 0.97) return
          locked = true
          window.__gcLenis?.scrollTo(at, { immediate: true, force: true })
          window.__gcLenis?.stop?.()
          document.documentElement.classList.add('scroll-held')
          // Sigurnosna mreža: ako video zapne (mreža, pauza taba), skrol se ipak vrati.
          safety = window.setTimeout(unlock, (D() / RATE + 1.5) * 1000)
        }
        fwd.addEventListener('ended', unlock)
        ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: () => `+=${window.innerHeight * (mobile ? 0.6 : 0.9)}`,
          pin: true,
          invalidateOnRefresh: true,
          onEnter: (self) => {
            // Zaključava se samo kad se do videa stiglo skrolom; skok preko sekcije
            // (link na #kontakt, tipka End) prolazi bez zaustavljanja.
            if (self.progress < 0.3) lock(self.start)
            play(1)
          },
          onLeaveBack: () => play(-1),
        })
        return unlock
      })

      return () => cancelAnimationFrame(raf)
    },
    { scope: root },
  )

  const video = 'absolute inset-0 h-full w-full object-contain transition-opacity duration-150'
  return (
    <section
      ref={root}
      id="kaolin"
      className="relative z-20 flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-bg pt-[var(--story-header)]"
      aria-label="Od sirovog kaolina do umivaonika od porcelana"
    >
      <div className="relative mx-auto aspect-video w-[min(100%,calc(78dvh*16/9))]" style={{ maskImage: MASK, WebkitMaskImage: MASK }}>
        <video data-fwd className={video} src={SRC} poster={POSTER} muted playsInline preload="auto" aria-hidden />
        <video data-rev className={video} style={{ opacity: 0 }} src={SRC_REV} muted playsInline preload="auto" aria-hidden />
      </div>
      <p className="sr-only">Sirovi kaolin se oblikuje u kuglu, pa u činiju i na kraju u umivaonik sa mesinganom slavinom.</p>

      {/* Traka odmah ispod modela: pokazuje koliko je puta od materijala do proizvoda pređeno. */}
      <div className="mt-2 flex w-full max-w-[1000px] items-center gap-5 px-5 font-mono text-[11px] uppercase tracking-[0.18em] md:gap-8 md:text-micro">
        <span className="shrink-0">Od materijala</span>
        <div
          data-bar
          role="progressbar"
          aria-label="Od materijala do gotovih proizvoda"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          className="relative h-px flex-1 bg-ink/25"
        >
          <span data-fill className="absolute inset-0 origin-left bg-ink" style={{ transform: 'scaleX(0)' }} />
          <span data-knob className="absolute top-1/2 size-3 rounded-full bg-signal -translate-x-1/2 -translate-y-1/2" style={{ left: '0%' }} />
        </div>
        <span className="shrink-0 text-right">Do gotovih proizvoda</span>
      </div>
    </section>
  )
}
