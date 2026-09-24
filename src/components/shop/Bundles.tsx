'use client'

import { addToCart, openPanel, useShop } from '@/lib/cart'
import { BUNDLES, KIT_WALL, PRODUCT_MAP, bundleTotals, money, qtyLabel } from '@/lib/shop'
import { useInView } from '@/lib/useInView'
import ProductImage from './ProductImage'
import SectionHead from './SectionHead'

// Kompleti su sistemi zidova iz kataloga. Količine su po normi W111 (isti proračun kao kalkulator HTML sajta)
// za zid 4 × 2,5 m. Popusta nema: firma ga nije odobrila, pa je cijena komplet = zbir stavki.
function BundleRow({ index, inCart }: { index: number; inCart: number }) {
  const b = BUNDLES[index]
  const { price } = bundleTotals(b)
  const [ref, seen] = useInView<HTMLElement>()
  const hasKit = b.items.length > 0

  return (
    <article
      ref={ref}
      data-reveal
      data-in={seen ? '' : undefined}
      className="grid gap-6 border-t-2 border-current py-10 md:grid-cols-12 md:gap-[1.5vw] md:py-14"
    >
      <div className="md:col-span-5">
        <p className="mb-4 flex justify-between text-micro uppercase">
          <span className="tabular-nums">{b.code}</span>
          <span>{hasKit ? b.area : 'Po predmjeru'}</span>
        </p>
        {/* Artikli sistema: slike samih artikala, ne fotografija ugradnje. */}
        <div data-plate className="grid grid-cols-2 gap-[2px] bg-bg/20 p-[2px]">
          {b.skus.slice(0, 4).map((sku) => {
            const p = PRODUCT_MAP[sku]
            return p ? (
              <ProductImage key={sku} src={p.image} drawing={p.drawing} alt={p.name} className="aspect-[4/3] w-full" />
            ) : null
          })}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 text-micro uppercase">
          <dt className="opacity-60">Profil</dt>
          <dd className="text-right">{b.profile}</dd>
          <dt className="opacity-60">{b.code.startsWith('D') ? 'Visina rešetke' : 'Debljina zida'}</dt>
          <dd className="text-right tabular-nums">{b.thickness} mm</dd>
          {b.rw !== null && (
            <>
              <dt className="opacity-60">Zvučna izolacija</dt>
              <dd className="text-right tabular-nums">Rw {b.rw} dB</dd>
            </>
          )}
        </dl>
      </div>

      <div className="flex flex-col md:col-span-7 md:pl-[2vw]">
        <h3 className="text-lead uppercase">{b.name}</h3>
        <p className="mt-2 text-micro uppercase opacity-60">{b.note}</p>
        <p className="mt-2 text-micro uppercase">{b.build}</p>

        {hasKit ? (
          <ul className="mt-6 border-t border-current/25">
            {b.items.map((it) => {
              const p = PRODUCT_MAP[it.sku]
              if (!p) return null
              return (
                <li key={it.sku} className="flex items-baseline justify-between gap-4 border-b border-current/25 py-2.5 uppercase">
                  <span className="min-w-0 text-small">
                    <span className="tabular-nums opacity-60">{qtyLabel(it.qty, p.unit)}</span> ·{' '}
                    <button type="button" className="text-left hover:underline" onClick={() => openPanel({ kind: 'product', id: p.id })}>
                      {p.name}
                    </button>
                    <span className="mt-0.5 block text-micro opacity-60">{it.note}</span>
                  </span>
                  <span className="shrink-0 text-small tabular-nums">{money(p.price * it.qty)}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="mt-6 border-t border-current/25 pt-4">
            <p className="text-micro uppercase opacity-60">Artikli sistema</p>
            <ul className="mt-2">
              {b.skus.map((sku) => (
                <li key={sku} className="border-b border-current/25 py-2.5 text-small uppercase">
                  {PRODUCT_MAP[sku]?.name}
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-[46ch] text-micro uppercase opacity-60">
              Norma za jednostruki zid ne važi za ovaj sistem, pa količine računamo po vašem predmjeru.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6 md:mt-auto md:pt-8">
          {hasKit ? (
            <div className="uppercase">
              <p className="text-micro opacity-60">Zbir stavki, {b.area}</p>
              <p className="mt-1 text-lead tabular-nums">{money(price)}</p>
            </div>
          ) : (
            <p className="text-micro uppercase opacity-60">Količine po predmjeru</p>
          )}
          {hasKit ? (
            <button
              type="button"
              onClick={() => addToCart(`komplet:${b.id}`)}
              className="flex w-full items-center justify-between border-2 border-current px-4 py-4 text-micro uppercase transition-colors duration-300 hover:bg-bg hover:text-ink sm:w-auto sm:min-w-[260px]"
            >
              <span>{inCart ? `Komplet u korpi · ${inCart}` : 'Dodaj komplet u korpu'}</span>
              <span aria-hidden>+</span>
            </button>
          ) : (
            <a
              href="#ponuda"
              className="flex w-full items-center justify-between border-2 border-current px-4 py-4 text-micro uppercase transition-colors duration-300 hover:bg-bg hover:text-ink sm:w-auto sm:min-w-[260px]"
            >
              <span>Pošaljite predmjer</span>
              <span aria-hidden>→</span>
            </a>
          )}
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
        no="04"
        label="Kompleti"
        title="Sistemi zidova"
        lead={`Knauf sistemi iz kataloga. Za zid ${KIT_WALL.L} × ${KIT_WALL.H} m količine računamo po normi W111, sa otpadom i zaokruženo na cijela pakovanja.`}
        meta={`${BUNDLES.length} sistema`}
      />
      <div className="mt-[8dvh] border-b-2 border-current">
        {BUNDLES.map((b, i) => (
          <BundleRow key={b.id} index={i} inCart={cart[`komplet:${b.id}`] ?? 0} />
        ))}
      </div>
    </section>
  )
}
