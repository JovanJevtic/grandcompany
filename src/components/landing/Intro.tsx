'use client'

/* eslint-disable @next/next/no-img-element -- editorijalne fotografije iz /public, već u WebP */

import { useRef } from 'react'
import Cta from '@/components/ui/Cta'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useMediaMotion } from '@/lib/media'
import { MQ } from '@/lib/motion'
import { revealChars } from '@/lib/reveal'
import Pw from '@/components/ui/Pw'

// Prvi ekran poslije herosa: ko smo (B2B veleprodaja, Knauf sistematika). Tekst je uz lijevu
// ivicu (naslov, opis, ulazi — sve u istoj liniji), a ispod njega vodoravna traka krupnih,
// mirnih kadrova: kran, ploče, profili, vuna, bandaža. Skrol vozi traku udesno (na mobilnom
// i uz reduced-motion je običan swipe). id="radovi" je okidač za odlazak velikog wordmarka.
const SCENES = [
  { src: '/editorial/pro/01-kuka.webp', label: 'Kuka i svežanj ploča', note: 'Istovar na gradilištu' },
  { src: '/editorial/pro/02-paleta.webp', label: 'Složaj ploča na paleti', note: 'Suho skladištenje' },
  { src: '/editorial/pro/03-stub.webp', label: 'Stub krana odozdo', note: 'Vlastita logistika' },
  { src: '/editorial/pro/04-bandaza.webp', label: 'Bandaža i glet', note: 'Suha gradnja' },
  { src: '/editorial/pro/05-profili.webp', label: 'Pocinkovani profili', note: 'Knauf sistemi' },
  { src: '/editorial/pro/06-vuna.webp', label: 'Kamena vuna', note: 'Toplotna i zvučna izolacija' },
  { src: '/editorial/pro/07-kontrateg.webp', label: 'Kontrateg i pod', note: 'Naš toranjski kran' },
  { src: '/editorial/pro/08-vijci.webp', label: 'Vijci za suhu gradnju', note: 'Sitni materijal' },
]

export default function Intro() {
  const root = useRef<HTMLElement>(null)
  useMediaMotion(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }
        revealChars(root.current!.querySelector('[data-head]')!, reduce, 'top 80%')
      })
    },
    { scope: root },
  )

  // Traka kadrova: sekcija se zalijepi (CSS sticky u višem omotaču) i skrol, umjesto na sljedeću
  // sekciju, vodi traku vodoravno. Sticky drži browser — bez GSAP pina, pa nema skoka.
  useGSAP(
    () => {
      const el = root.current!
      const wrap = el.querySelector<HTMLElement>('[data-pinwrap]')!
      const viewport = el.querySelector<HTMLElement>('[data-viewport]')!
      const track = el.querySelector<HTMLElement>('[data-track]')!

      const mm = gsap.matchMedia()
      mm.add({ desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)' }, () => {
        const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth)
        // Omotač je visok koliko traje vožnja: ekran + dužina trake. Mjeri se prije svakog
        // osvježavanja ScrollTriggera, da start/end budu izmjereni na tačnoj visini.
        const setHeight = () => {
          wrap.style.height = `${window.innerHeight + distance()}px`
        }
        setHeight()
        ScrollTrigger.addEventListener('refreshInit', setHeight)
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top top', end: () => `+=${distance()}`, scrub: 0.7, invalidateOnRefresh: true },
        })
        return () => {
          ScrollTrigger.removeEventListener('refreshInit', setHeight)
          wrap.style.height = ''
          tween.scrollTrigger?.kill()
          tween.kill()
          gsap.set(track, { clearProps: 'transform' })
        }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="radovi" className="relative z-20 bg-bg pb-[8vh] pt-[24vh]">
      <div className="gutter">
        <p data-up className="label opacity-60">
          Veleprodaja građevinskog materijala · Banja Luka
        </p>

        <div className="mt-7 grid gap-x-[5vw] gap-y-7 md:grid-cols-[minmax(0,1.05fr)_minmax(0,48ch)] md:items-end">
          <h2 data-head className="display invisible max-w-[18ch] text-[clamp(32px,4.8vw,92px)]">
            <Pw>Građevinski materijal za profesionalce</Pw>
          </h2>
          <p data-up data-delay="0.1" className="max-w-[52ch] text-[15px] leading-[1.7] opacity-75 md:pb-3">
            Snabdijevamo građevinske firme i izvođače: materijal sa stovarišta u Banjoj Luci, vaša cijena i dostava
            vlastitim kamionima sa kranom — direktno na gradilište. Suha gradnja i Knauf sistemi su naša specijalizacija.
          </p>
        </div>

        <div data-up data-delay="0.2" className="mt-8 flex flex-wrap gap-3">
          <Cta href="/portal" solid>
            B2B portal
          </Cta>
          <Cta href="/prodavnica">Maloprodaja</Cta>
        </div>
      </div>

      {/* Traka kadrova: sticky sekcija, skrol je vozi udesno. */}
      <div data-pinwrap className="relative mt-[12vh] bg-bg">
        <section
          aria-label="Sa gradilišta i iz stovarišta"
          className="relative overflow-hidden bg-bg md:sticky md:top-0 md:flex md:h-dvh md:items-center"
        >
          <div data-viewport className="hs-viewport w-full">
            <div data-track className="flex w-max items-start gap-[6vw] px-5 md:gap-[2.2vw] md:px-[6vw]">
              {SCENES.map((s, i) => (
                <figure
                  key={s.src}
                  data-curtain
                  className="m-0 shrink-0 snap-start"
                  style={{ marginTop: i % 2 ? '8vh' : 0 }}
                >
                  <div className="relative h-[48vh] aspect-[2/3] overflow-hidden bg-plate md:h-[60vh]">
                    <img
                      decoding="async"
                      loading="lazy"
                      src={s.src}
                      alt={`${s.label} — ${s.note}`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="mt-3 text-[11px] tracking-[0.06em] text-ink/55">
                    <span className="font-medium text-ink/80">{String(i + 1).padStart(2, '0')}</span> · {s.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
