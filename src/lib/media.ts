'use client'

import type { RefObject } from 'react'
import { gsap, useGSAP } from './gsap'
import { EASE, MQ } from './motion'

// Kretanje fotografija na cijelom sajtu. Komponenta samo označi elemente atributima:
//   data-curtain      okvir se otvara odozdo naviše kad uđe u ekran, slika se smiruje sa zuma
//   data-parallax="n" slika unutar okvira klizi dok se skrola (n = jačina u %, npr. 10)
//   data-float        slika se blago pomjera za mišem (samo miš, ne dodir)
//   data-up           tekst/blok izranja kad uđe u ekran (data-delay u sekundama)
// Sve poštuje prefers-reduced-motion: tada je sve odmah na mjestu.

export function useMediaMotion(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return
      const mm = gsap.matchMedia()
      mm.add(MQ, (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean }

        gsap.utils.toArray<HTMLElement>('[data-curtain]', root).forEach((box) => {
          const img = box.querySelector('img, video')
          if (reduce) return gsap.set(box, { clipPath: 'inset(0% 0% 0% 0%)' })
          const tl = gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 90%' } })
          tl.fromTo(box, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: EASE.quintInOut })
          if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2, ease: EASE.out }, 0)
        })

        if (reduce) return
        gsap.utils.toArray<HTMLElement>('[data-parallax]', root).forEach((box) => {
          const img = box.querySelector<HTMLElement>('[data-parallax-target]') ?? box.querySelector<HTMLElement>('img')
          if (!img) return
          const amt = Number(box.dataset.parallax) || 10
          gsap.set(img, { scale: 1 + amt / 50 })
          gsap.fromTo(
            img,
            { yPercent: -amt },
            { yPercent: amt, ease: 'none', scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true } },
          )
        })

        gsap.utils.toArray<HTMLElement>('[data-up]', root).forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 1.2, ease: EASE.quint, delay: Number(el.dataset.delay || 0), scrollTrigger: { trigger: el, start: 'top 92%' } },
          )
        })

        if (!window.matchMedia('(pointer: fine)').matches) return
        const offs: (() => void)[] = []
        gsap.utils.toArray<HTMLElement>('[data-float]', root).forEach((box) => {
          const img = box.querySelector<HTMLElement>('[data-float-target]') ?? box.querySelector<HTMLElement>('img')
          if (!img) return
          const xTo = gsap.quickTo(img, 'xPercent', { duration: 1.2, ease: 'power3.out' })
          const yTo = gsap.quickTo(img, 'yPercent', { duration: 1.2, ease: 'power3.out' })
          const move = (e: PointerEvent) => {
            const r = box.getBoundingClientRect()
            xTo(((e.clientX - r.left) / r.width - 0.5) * -4)
            yTo(((e.clientY - r.top) / r.height - 0.5) * -4)
          }
          const leave = () => {
            xTo(0)
            yTo(0)
          }
          box.addEventListener('pointermove', move)
          box.addEventListener('pointerleave', leave)
          offs.push(() => {
            box.removeEventListener('pointermove', move)
            box.removeEventListener('pointerleave', leave)
          })
        })
        return () => offs.forEach((f) => f())
      })
    },
    { scope, dependencies: deps },
  )
}
