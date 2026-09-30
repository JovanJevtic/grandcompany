import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import GlyphDraw from '@/components/catalog/GlyphDraw'
import ProductBuy from '@/components/catalog/ProductBuy'
import ProductCard from '@/components/catalog/ProductCard'
import TitleReveal from '@/components/posts/TitleReveal'
import StepBand from '@/components/ui/StepBand'
import { DELIVERY_ZONES, STOCK_LABEL, WALL_SYSTEMS, stockLevel } from '@/gc/gc'
import { PRODUCTS, categoryName } from '@/lib/shop'

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ sku: product.sku }))
}

export async function generateMetadata({ params }: PageProps<'/prodavnica/[sku]'>): Promise<Metadata> {
  const { sku } = await params
  const product = PRODUCTS.find((item) => item.sku === sku)
  return product
    ? { title: `${product.name} | Grand Company`, description: product.desc }
    : { title: 'Artikal nije pronađen' }
}

export default async function ProductPage({ params }: PageProps<'/prodavnica/[sku]'>) {
  const { sku } = await params
  const product = PRODUCTS.find((item) => item.sku === sku)
  if (!product) notFound()

  const systems = WALL_SYSTEMS.filter((system) => system.skus.includes(product.sku))
  const related = PRODUCTS
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3)
  const stock = stockLevel(product)

  return (
    <>
      <div className="gutter py-7">
        <nav className="font-mono text-[11px] uppercase">
          <Link href="/prodavnica">Katalog</Link> /{' '}
          <Link href={`/prodavnica?kategorija=${product.category}`}>{categoryName(product.category)}</Link> / {product.sku}
        </nav>
      </div>
      <section className="gutter grid items-start gap-10 pb-24 md:grid-cols-[minmax(0,1.25fr)_minmax(340px,.75fr)]">
        <div>
          <div className="relative grid min-h-[55vh] place-items-center border-2 border-ink bg-well">
            <GlyphDraw product={product} className="h-full max-h-[600px] w-full p-5 md:p-12" />
            <span className="absolute left-4 top-4 font-mono text-[11px] uppercase">← {product.spec.split(',')[0]} →</span>
            <span className="absolute bottom-4 right-4 font-mono text-[11px] uppercase">{product.sku}</span>
          </div>
          <p className="mt-5 font-mono text-xs uppercase">
            {product.brand} · <i className="mr-2 inline-block size-2 bg-accent" />{STOCK_LABEL[stock]}
          </p>
          <TitleReveal className="mt-5 text-[clamp(48px,7vw,120px)] uppercase leading-[.88] tracking-[-.03em]">
            {product.name}
          </TitleReveal>
          <p className="mt-8 max-w-[48ch] text-xl uppercase leading-tight">{product.desc}</p>
        </div>
        <ProductBuy product={product} systems={systems} zones={DELIVERY_ZONES} />
      </section>

      <StepBand profile="valley" tone="navy" className="gutter py-20">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase text-accent">Tehnički podaci</p>
            <dl className="mt-6 font-mono text-xs uppercase">
              {[
                ['SKU', product.sku],
                ['Brend', product.brand],
                ['Specifikacija', product.spec],
                ['Masa', `${product.weight} kg / prodajna jedinica`],
                ['Kategorija', categoryName(product.category)],
              ].map(([term, value]) => (
                <div key={term} className="grid grid-cols-[120px_1fr] border-t border-bg/30 py-4">
                  <dt className="opacity-60">{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="font-mono text-xs uppercase text-accent">Dostava i istovar</p>
            <p className="mt-6 max-w-[38ch] text-2xl uppercase">
              Za teže i paletne isporuke dostupan je istovar kranom. Termin i pristup potvrđuju se uz ponudu.
            </p>
            <ul className="mt-6 font-mono text-[11px] uppercase">
              {DELIVERY_ZONES.map((zone) => (
                <li key={zone.id} className="border-t border-bg/30 py-3">
                  {zone.label} · standard {zone.standard} KM · kran transport {zone.kranTransport} KM + rad {zone.kranWork} KM
                </li>
              ))}
            </ul>
          </div>
        </div>
      </StepBand>

      <section className="gutter py-24">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase">Koristi se za</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {product.uses.map((use) => (
                <Link
                  key={use}
                  href={`/prodavnica?namjena=${use}`}
                  className="border-2 border-ink px-4 py-3 font-mono text-xs uppercase"
                >
                  ■ {use.replaceAll('-', ' ')}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-xs uppercase">Sistemi</p>
            {systems.length ? (
              <ul className="mt-5">
                {systems.map((system) => (
                  <li key={system.code} className="border-t-2 border-ink py-4">
                    <strong className="text-2xl uppercase">{system.code} · {system.name}</strong>
                    <p className="mt-2 font-mono text-[11px] uppercase opacity-60">{system.build}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-5 uppercase">Artikal nije vezan za zidni sistem iz kataloga.</p>}
          </div>
        </div>
        <h2 className="mt-28 text-title uppercase">Povezani artikli</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {related.map((item) => <ProductCard key={item.id} product={item} view="grid" />)}
        </div>
      </section>
    </>
  )
}
