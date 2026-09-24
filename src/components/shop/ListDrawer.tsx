'use client'

import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { COMPARE_MAX } from '@/lib/lists'
import { EASE, prefersReducedMotion } from '@/lib/motion'
import { scrollToTarget } from '@/lib/scroll'
import { STOCK_LABEL, catName, km, productById, qtyText, type Product } from '@/lib/shop'
import ProductImage from './ProductImage'
import { useShop } from './ShopProvider'
import { useDialog } from './useDialog'

// Sačuvano i Poređenje: pogledi SavedView i CompareView iz grand-root (panel-views.tsx), prebačeni u
// grand-cipher drawer (isti izlazak s desne strane kao korpa, isti slog, "Zatvori" u serifu).

const listOf = (ids: string[]) => ids.map(productById).filter((p): p is Product => !!p)

function Empty({ title, text, onGo }: { title: ReactNode; text: string; onGo: () => void }) {
  return (
    <div data-x className="flex flex-1 flex-col justify-between border-t border-line px-6 pb-6 pt-8">
      <div>
        <p className="text-[clamp(30px,4vw,44px)] font-medium leading-[1] tracking-[-0.045em]">{title}</p>
        <p className="mt-4 max-w-[34ch] text-[15px] leading-[1.55] text-dim">{text}</p>
      </div>
      <button type="button" onClick={onGo} className="btn btn-solid w-full">
        Pogledaj ponudu
      </button>
    </div>
  )
}

function SavedView({ toShop }: { toShop: () => void }) {
  const { saved, toggleSaved, add, added } = useShop()
  const items = listOf(saved)
  if (!items.length)
    return (
      <Empty
        title={
          <>
            ništa nije <em className="font-serif font-normal tracking-[-0.03em]">sačuvano</em>.
          </>
        }
        text="Sačuvajte artikle na kartici ili u brzom pregledu, da ih kasnije lakše nađete."
        onGo={toShop}
      />
    )
  return (
    <ul data-lenis-prevent className="flex-1 overflow-y-auto border-t border-line px-6">
      {items.map((p) => (
        <li key={p.id} data-x className="grid grid-cols-[84px_1fr] gap-4 border-b border-line py-5">
          <span aria-hidden className="relative aspect-square overflow-hidden">
            <ProductImage p={p} pad="8%" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-medium leading-[1.25] tracking-[-0.01em]">{p.name}</p>
            <p className="mt-1 text-[13px] text-dim">
              {km(p.price)} / {p.unit}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <button type="button" className={`chip ${added === p.id ? '!bg-fg !text-bg' : ''}`} onClick={() => add(p.id)}>
                {added === p.id ? 'Dodato ✓' : `+ ${qtyText(p.step)} ${p.unit} u korpu`}
              </button>
              <button type="button" className="info text-dim underline underline-offset-4 hover:text-fg" onClick={() => toggleSaved(p.id)}>
                Ukloni
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function CompareView({ toShop }: { toShop: () => void }) {
  const { compare, toggleCompare, add, added } = useShop()
  const items = listOf(compare)
  if (!items.length)
    return (
      <Empty
        title={
          <>
            nema ništa za <em className="font-serif font-normal tracking-[-0.03em]">poređenje</em>.
          </>
        }
        text={`Na kartici artikla odaberite „Poredi“ (do ${COMPARE_MAX} artikla) da ih vidite jedan uz drugi.`}
        onGo={toShop}
      />
    )

  const rows: [string, (p: Product) => ReactNode][] = [
    ['Cijena', (p) => `${km(p.price)} / ${p.unit}`],
    ['Kategorija', (p) => catName(p.cat)],
    ['Proizvođač', (p) => p.brand],
    ['Specifikacija', (p) => p.spec],
    ['Pakovanje', (p) => (p.pack ? `${p.pack.name} = ${qtyText(p.pack.size)} ${p.unit}` : `1 ${p.unit}`)],
    ['Težina', (p) => `${qtyText(p.weight)} kg / ${p.unit}`],
    ['Stanje', (p) => STOCK_LABEL[p.level]],
  ]

  return (
    <div data-lenis-prevent data-x className="flex-1 overflow-auto border-t border-line px-6">
      <table className="w-full min-w-[560px] table-fixed border-collapse text-left">
        <thead>
          <tr>
            <th className="w-[20%]" />
            {items.map((p) => (
              <th key={p.id} className="px-2 pb-5 pt-5 align-top font-normal">
                <span className="relative block aspect-[4/5] w-full overflow-hidden">
                  <ProductImage p={p} pad="10%" />
                </span>
                <p className="mt-3 text-[14px] font-medium leading-[1.25]">{p.name}</p>
                <button type="button" className="info mt-2 text-dim underline underline-offset-4 hover:text-fg" onClick={() => toggleCompare(p.id)}>
                  Ukloni
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, get]) => (
            <tr key={label} className="border-t border-line">
              <th className="info py-3 pr-2 align-top font-normal text-dim">{label}</th>
              {items.map((p) => (
                <td key={p.id} className="px-2 py-3 align-top text-[13px] leading-[1.4]">
                  {get(p)}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-line">
            <th />
            {items.map((p) => (
              <td key={p.id} className="px-2 py-4">
                <button type="button" className={`chip w-full ${added === p.id ? '!bg-fg !text-bg' : ''}`} onClick={() => add(p.id)}>
                  {added === p.id ? 'Dodato ✓' : 'U korpu'}
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function ListDrawer() {
  const { panel, panelKind: kind, setPanel, saved, compare } = useShop()
  const wrap = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const scrim = useRef<HTMLDivElement>(null)
  const shown = useRef(false)
  const open = panel !== null

  const close = () => setPanel(null)
  useDialog(open, box, close)

  useGSAP(
    () => {
      if (!open && !shown.current) return
      const d = (n: number) => (prefersReducedMotion() ? 0.01 : n)
      if (open) {
        shown.current = true
        gsap.set(wrap.current, { autoAlpha: 1 })
        gsap.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: d(0.6), ease: 'power2.out' })
        gsap.fromTo(box.current, { xPercent: 100 }, { xPercent: 0, duration: d(0.9), ease: EASE.expoInOut })
        gsap.from(box.current!.querySelectorAll('[data-x]'), { autoAlpha: 0, y: 14, duration: d(0.7), delay: d(0.4), stagger: 0.05, ease: EASE.out })
      } else {
        gsap.to(scrim.current, { opacity: 0, duration: d(0.5) })
        gsap.to(box.current, {
          xPercent: 100,
          duration: d(0.7),
          ease: EASE.expoInOut,
          onComplete: () => {
            gsap.set(wrap.current, { autoAlpha: 0 })
          },
        })
      }
    },
    { dependencies: [open, kind] },
  )

  const toShop = () => {
    close()
    scrollToTarget('#ponuda')
  }

  const title = kind === 'saved' ? 'Sačuvano' : 'Poređenje'
  const n = kind === 'saved' ? saved.length : compare.length

  return (
    <div ref={wrap} className="invisible fixed inset-0 z-[60]">
      <div ref={scrim} onClick={close} className="absolute inset-0 bg-black/70" aria-hidden />
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        inert={!open}
        className={`absolute inset-y-0 right-0 flex flex-col border-l border-line bg-bg text-fg focus:outline-none ${
          kind === 'compare' ? 'w-[min(920px,100vw)]' : 'w-[min(480px,100vw)]'
        }`}
      >
        <div data-x className="flex items-center justify-between px-6 pb-5 pt-6">
          <h2 className="text-[26px] font-medium leading-none tracking-[-0.04em]">
            {title} <span className="tabular-nums text-dim">({n})</span>
          </h2>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setPanel(kind === 'saved' ? 'compare' : 'saved')}
              className="info text-dim underline underline-offset-4 hover:text-fg"
            >
              {kind === 'saved' ? `Poređenje (${compare.length})` : `Sačuvano (${saved.length})`}
            </button>
            <button type="button" onClick={close} className="font-serif text-[16px] leading-none">
              Zatvori
            </button>
          </div>
        </div>
        {kind === 'saved' ? <SavedView toShop={toShop} /> : <CompareView toShop={toShop} />}
      </div>
    </div>
  )
}
