'use client'

import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { BRAND } from '@/lib/content'
import { EASE, prefersReducedMotion } from '@/lib/motion'
import { scrollToTarget } from '@/lib/scroll'
import { PRODUCTS, km } from '@/lib/shop'
import { useShop } from './ShopProvider'
import { tileBg } from './tile'
import { useDialog } from './useDialog'

// Korpa: panel koji se izvlači s desne strane. Slanje narudžbe još nije povezano ni s čim (nema servera za to),
// pa "Završi narudžbu" iskreno kaže da nije aktivno i nudi kopiranje liste.
export default function CartDrawer() {
  const { lines, count, total, cartOpen, setCartOpen, setQty, remove } = useShop()
  const wrap = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const scrim = useRef<HTMLDivElement>(null)
  const shown = useRef(false)
  const [step, setStep] = useState<'korpa' | 'zavrsi'>('korpa')
  const [copied, setCopied] = useState(false)

  const items = PRODUCTS.filter((p) => lines[p.id]).map((p) => ({ p, q: lines[p.id] }))
  const close = () => {
    setCartOpen(false)
    setStep('korpa')
  }
  useDialog(cartOpen, panel, close)

  useGSAP(
    () => {
      if (!cartOpen && !shown.current) return
      const d = (n: number) => (prefersReducedMotion() ? 0.01 : n)
      if (cartOpen) {
        shown.current = true
        gsap.set(wrap.current, { autoAlpha: 1 })
        gsap.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: d(0.6), ease: 'power2.out' })
        gsap.fromTo(panel.current, { xPercent: 100 }, { xPercent: 0, duration: d(0.9), ease: EASE.expoInOut })
        gsap.from(panel.current!.querySelectorAll('[data-x]'), { autoAlpha: 0, y: 14, duration: d(0.7), delay: d(0.4), stagger: 0.05, ease: EASE.out })
      } else {
        gsap.to(scrim.current, { opacity: 0, duration: d(0.5) })
        gsap.to(panel.current, {
          xPercent: 100,
          duration: d(0.7),
          ease: EASE.expoInOut,
          onComplete: () => {
            gsap.set(wrap.current, { autoAlpha: 0 })
          },
        })
      }
    },
    { dependencies: [cartOpen] },
  )

  const copyList = async () => {
    const text = [
      `${BRAND} — narudžba`,
      ...items.map(({ p, q }) => `${q} × ${p.name} (${km(p.price)} / ${p.unit}) = ${km(p.price * q)}`),
      `Ukupno: ${km(total)}`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // clipboard nije dostupan (npr. nesiguran kontekst): lista je vidljiva u korpi
    }
  }

  const toShop = () => {
    close()
    scrollToTarget('#ponuda')
  }

  return (
    <div ref={wrap} className="invisible fixed inset-0 z-[60]">
      <div ref={scrim} onClick={close} className="absolute inset-0 bg-black/70" aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Korpa"
        inert={!cartOpen}
        className="absolute inset-y-0 right-0 flex w-[min(480px,100vw)] flex-col border-l border-line bg-bg text-fg focus:outline-none"
      >
        <div data-x className="flex items-center justify-between px-6 pb-5 pt-6">
          <h2 className="text-[26px] font-medium leading-none tracking-[-0.04em]">
            Korpa <span className="tabular-nums text-dim">({count})</span>
          </h2>
          <button type="button" onClick={close} className="font-serif text-[16px] leading-none">
            Zatvori
          </button>
        </div>

        {items.length === 0 ? (
          <div data-x className="flex flex-1 flex-col justify-between border-t border-line px-6 pb-6 pt-8">
            <div>
              <p className="text-[clamp(30px,4vw,44px)] font-medium leading-[1] tracking-[-0.045em]">
                korpa je <em className="font-serif font-normal tracking-[-0.03em]">prazna</em>.
              </p>
              <p className="mt-4 max-w-[34ch] text-[15px] leading-[1.55] text-dim">Dodajte artikle iz ponude, pa ih ovdje pregledajte.</p>
            </div>
            <button type="button" onClick={toShop} className="btn btn-solid w-full">
              Pogledaj ponudu
            </button>
          </div>
        ) : step === 'korpa' ? (
          <>
            <ul data-lenis-prevent className="flex-1 overflow-y-auto border-t border-line px-6">
              {items.map(({ p, q }) => (
                <li key={p.id} data-x className="grid grid-cols-[64px_1fr_auto] gap-4 border-b border-line py-5">
                  <span aria-hidden className="aspect-square" style={{ background: tileBg(p.tile) }} />
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium leading-[1.25] tracking-[-0.01em]">{p.name}</p>
                    <p className="mt-1 text-[13px] text-dim">
                      {km(p.price)} / {p.unit}
                    </p>
                    <div className="mt-3 inline-flex items-center border border-line">
                      <button type="button" aria-label={`Smanji količinu: ${p.name}`} onClick={() => setQty(p.id, q - 1)} className="size-9 text-[16px] leading-none">
                        −
                      </button>
                      <span className="min-w-8 text-center text-[13px] font-medium tabular-nums" aria-live="polite">
                        {q}
                      </span>
                      <button type="button" aria-label={`Povećaj količinu: ${p.name}`} onClick={() => setQty(p.id, q + 1)} className="size-9 text-[16px] leading-none">
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="text-[15px] font-medium tabular-nums">{km(p.price * q)}</p>
                    <button type="button" onClick={() => remove(p.id)} className="info text-dim underline underline-offset-4 hover:text-fg">
                      Ukloni
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div data-x className="border-t border-line px-6 pb-6 pt-5">
              <p className="flex items-baseline justify-between">
                <span className="info text-dim">Ukupno</span>
                <span className="text-[26px] font-medium leading-none tracking-[-0.03em] tabular-nums">{km(total)}</span>
              </p>
              <button type="button" onClick={() => setStep('zavrsi')} className="btn btn-solid mt-5 w-full">
                Završi narudžbu
              </button>
            </div>
          </>
        ) : (
          <div data-x className="flex flex-1 flex-col justify-between border-t border-line px-6 pb-6 pt-8">
            <div>
              <p className="text-[clamp(28px,3.6vw,40px)] font-medium leading-[1.02] tracking-[-0.045em]">
                online slanje narudžbe još <em className="font-serif font-normal tracking-[-0.03em]">nije aktivno</em>.
              </p>
              <p className="mt-5 max-w-[38ch] text-[15px] leading-[1.55] text-dim">
                Kopirajte listu artikala i pošaljite je nama. Korpa ostaje sačuvana u ovom pregledaču.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={copyList} className="btn btn-solid w-full">
                {copied ? 'Kopirano ✓' : 'Kopiraj listu'}
              </button>
              <button type="button" onClick={() => setStep('korpa')} className="btn w-full">
                Nazad u korpu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
