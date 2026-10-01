/* eslint-disable @next/next/no-img-element -- studijske fotografije iz /public, već optimizovane u WebP */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductBuy from '@/components/catalog/ProductBuy'
import ProductCard from '@/components/catalog/ProductCard'
import MotionScope from '@/components/shop/MotionScope'
import { DELIVERY_ZONES, WALL_SYSTEMS } from '@/gc/gc'
import { PRODUCTS, USES, categoryName, money, qtyLabel } from '@/lib/shop'

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ sku: product.sku }))
}

export async function generateMetadata({ params }: PageProps<'/prodavnica/[sku]'>): Promise<Metadata> {
  const { sku } = await params
  const product = PRODUCTS.find((item) => item.sku === sku)
  return product ? { title: `${product.name} | Grand Company`, description: product.desc } : { title: 'Artikal nije pronađen' }
}

// Stranica artikla: velika fotografija lijevo (lijepi se dok se skrola), desno ime, cijena,
// kratak opis i kupovina; ispod tanka lista podataka i artikli iz istog sistema.
export default async function ProductPage({ params }: PageProps<'/prodavnica/[sku]'>) {
  const { sku } = await params
  const product = PRODUCTS.find((item) => item.sku === sku)
  if (!product) notFound()

  const systems = WALL_SYSTEMS.filter((system) => system.skus.includes(product.sku))
  const systemSkus = new Set(systems.flatMap((s) => s.skus))
  const related = [
    ...PRODUCTS.filter((item) => item.id !== product.id && systemSkus.has(item.sku) && item.category !== product.category),
    ...PRODUCTS.filter((item) => item.id !== product.id && item.category === product.category),
  ]
    .filter((item, i, all) => all.findIndex((x) => x.id === item.id) === i)
    .slice(0, 4)

  const uses = USES.filter((u) => product.uses.includes(u.id))
  const specs = [
    ['Dimenzije', product.spec],
    ...(product.pack ? [['Pakovanje', `${qtyLabel(product.pack.size, product.unit)} — 1 ${product.pack.name}`]] : []),
    ['Masa', `${product.weight.toLocaleString('de-DE')} kg`],
    ['Proizvođač', product.brand],
    ...(systems.length ? [['Sistemi', systems.map((s) => s.code).join(', ')]] : []),
    ['Šifra', product.sku],
  ]

  return (
    <MotionScope>
      <section className="grid md:-mt-16 md:grid-cols-2">
        <div className="md:sticky md:top-0 md:h-svh md:self-start">
          <div className="shot h-[min(120vw,80svh)] md:h-full" data-curtain data-float>
            <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
          </div>
        </div>

        <div className="flex flex-col justify-center px-5 py-16 md:min-h-svh md:px-[6vw] md:py-[16vh]">
          <nav className="fade-up text-[13px] opacity-60" aria-label="Putanja">
            <Link href="/prodavnica" className="ulink">
              Katalog
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/prodavnica?kategorija=${product.category}`} className="ulink">
              {categoryName(product.category)}
            </Link>
          </nav>

          <h1 className="display fade-up mt-6 text-[clamp(38px,4.6vw,84px)] !leading-[1]" style={{ animationDelay: '0.08s' }}>
            {product.name}
          </h1>

          <p className="fade-up mt-6 text-[clamp(22px,1.8vw,30px)] tabular-nums" style={{ animationDelay: '0.16s' }}>
            {money(product.price)} <span className="text-[0.6em] opacity-50">/ {product.unit}, sa PDV-om</span>
          </p>

          <p className="fade-up mt-8 max-w-[44ch] text-[clamp(16px,1.15vw,19px)] leading-[1.55] opacity-80" style={{ animationDelay: '0.24s' }}>
            {product.desc}
          </p>

          <div className="fade-up mt-10" style={{ animationDelay: '0.32s' }}>
            <ProductBuy product={product} zones={DELIVERY_ZONES} />
          </div>

          <dl className="mt-14 max-w-[520px] text-[14px]" data-up>
            {specs.map(([term, value]) => (
              <div key={term} className="grid grid-cols-[8.5rem_1fr] gap-4 border-t border-ink/15 py-3">
                <dt className="opacity-50">{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          {uses.length > 0 && (
            <p className="mt-8 flex flex-wrap gap-x-5 gap-y-1 text-[14px]" data-up>
              <span className="opacity-50">Za radove:</span>
              {uses.map((u) => (
                <Link key={u.id} href={`/prodavnica?namjena=${u.id}`} className="ulink italic">
                  {u.name}
                </Link>
              ))}
            </p>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="gutter py-[18vh]">
          <h2 className="display text-center text-[clamp(36px,4.4vw,80px)]" data-up>
            {systems.length ? (
              <>
                Iz istog <em>sistema</em>
              </>
            ) : (
              <>
                Uz ovo <em>ide i</em>
              </>
            )}
          </h2>
          <div className="mt-[10vh] grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-[2vw] lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </MotionScope>
  )
}
