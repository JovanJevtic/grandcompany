'use client'

import { addToCart, useShop } from '@/lib/cart'
import { TONES } from '@/lib/reveal'
import { BUNDLES, PRODUCT_MAP, bundleTotals, money } from '@/lib/shop'
import { useInView } from '@/lib/useInView'
import SectionHead from './SectionHead'

function BundleRow({ index, inCart }: { index: number; inCart: number }) {
  const b = BUNDLES[index]
  const { sum, price, save } = bundleTotals(b)
  const [ref, seen] = useInView<HTMLElement>()

  return (
    <article
      ref={ref}
      data-reveal
      data-in={seen ? '' : undefined}
      className="grid gap-6 border-t-2 border-current py-10 md:grid-cols-12 md:gap-[1.5vw] md:py-14"
    >
      <div className="md:col-span-5">
        <p className="mb-4 flex justify-between text-micro uppercase">
          <span className="tabular-nums">0{index + 1}</span>
          <span>{b.area}</span>
        </p>
        <div className="relative">
          <div data-plate className="aspect-[5/4] w-full" style={{ background: TONES[(index * 2 + 1) % TONES.length] }} />
          <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-micro uppercase text-bg">
            Ušteda {Math.round(b.off * 100)} %
          </span>
        </div>
      </div>

      <div className="flex flex-col md:col-span-7 md:pl-[2vw]">
        <h3 className="text-lead uppercase">{b.name}</h3>
        <p className="mt-2 text-micro uppercase opacity-60">{b.note}</p>

        <ul className="mt-6 border-t border-current/25">
          {b.items.map(([id, qty]) => {
            const p = PRODUCT_MAP[id]
            return (
              <li key={id} className="flex items-baseline justify-between gap-4 border-b border-current/25 py-2.5 uppercase">
                <span className="text-small">
                  <span className="tabular-nums opacity-60">
                    {qty} {p.unit}
                  </span>{' '}
                  · {p.name}
                </span>
                <span className="shrink-0 text-small tabular-nums">{money(p.price * qty)}</span>
              </li>
            )
          })}
        </ul>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6 md:mt-auto md:pt-8">
          <div className="uppercase">
            <p className="text-micro tabular-nums line-through opacity-60">{money(sum)}</p>
            <p className="mt-1 text-lead tabular-nums">{money(price)}</p>
            <p className="mt-1 text-micro tabular-nums">Ušteda {money(save)}</p>
          </div>
          <button
            type="button"
            onClick={() => addToCart(`komplet:${b.id}`)}
            className="flex min-w-[260px] items-center justify-between border-2 border-current px-4 py-4 text-micro uppercase transition-colors duration-300 hover:bg-bg hover:text-ink"
          >
            <span>{inCart ? `Komplet u korpi · ${inCart}` : 'Dodaj komplet u korpu'}</span>
            <span aria-hidden>+</span>
          </button>
        </div>
      </div>
    </article>
  )
}

export default function Bundles() {
  const { cart } = useShop()

  return (
    <section id="kompleti" data-spy className="gutter scroll-mt-[var(--bar)] bg-ink py-[14dvh] text-bg">
      <SectionHead
        no="03"
        label="Kompleti"
        title="Gotovi kompleti"
        lead="Gotovi spiskovi materijala za najčešće radove. Količine su orijentacione, tačan obračun radimo prema vašem predmjeru."
        meta={`${BUNDLES.length} kompleta`}
      />
      <div className="mt-[8dvh] border-b-2 border-current">
        {BUNDLES.map((b, i) => (
          <BundleRow key={b.id} index={i} inCart={cart[`komplet:${b.id}`] ?? 0} />
        ))}
      </div>
    </section>
  )
}
