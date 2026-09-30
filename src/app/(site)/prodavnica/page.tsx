import { Suspense } from 'react'
import Link from 'next/link'
import CatalogClient from '@/components/catalog/CatalogClient'
import StepBand from '@/components/ui/StepBand'
import { BUNDLES, CATEGORIES, PRODUCTS } from '@/lib/shop'

export const metadata = {
  title: 'Katalog | Grand Company',
  description: 'Građevinski materijal: suha gradnja, izolacija, veziva i oprema.',
}

export default async function CataloguePage({ searchParams }: PageProps<'/prodavnica'>) {
  const query = await searchParams
  const selected = typeof query.kategorija === 'string' ? query.kategorija : ''

  return (
    <>
      <section className="grid min-h-[calc(100svh-4rem)] border-b-2 border-ink md:grid-cols-[58%_42%]">
        <div className="flex flex-col justify-between p-5 pb-10 md:p-[8.33vw] md:pr-10">
          <p className="font-mono text-xs uppercase">Grand Company · Banja Luka</p>
          <div>
            <h1 className="text-[clamp(68px,12vw,205px)] uppercase leading-[.88] tracking-[-.03em]">
              Kata<br />log
            </h1>
            <p className="mt-8 max-w-[45ch] text-lg uppercase">
              Sistemi suhe gradnje, izolacija, veziva i pribor. Jasne specifikacije, stanje i cijena po jedinici.
            </p>
          </div>
          <p className="font-mono text-xs uppercase">{PRODUCTS.length} artikala · {CATEGORIES.length} kategorije</p>
        </div>
        <div className="flex flex-col justify-end bg-navy text-bg">
          {CATEGORIES.map((category, index) => {
            const count = PRODUCTS.filter((product) => product.category === category.id).length
            const active = selected === category.id
            return (
              <Link
                key={category.id}
                href={`/prodavnica?kategorija=${category.id}#artikli`}
                className={`group grid grid-cols-[45px_1fr_auto_auto] items-center border-t border-bg/35 p-5 transition-colors md:p-8 ${
                  active ? 'bg-bg text-ink' : 'hover:bg-bg hover:text-ink'
                }`}
              >
                <span className="font-mono text-xs text-accent">0{index + 1}</span>
                <span className="text-[clamp(25px,3.5vw,60px)] uppercase leading-[.92] tracking-[-.02em]">{category.name}</span>
                <span className="font-mono text-xs">{count}</span>
                <span className="ml-4 transition-transform duration-300 group-hover:translate-x-2" aria-hidden>→</span>
              </Link>
            )
          })}
        </div>
      </section>

      <Suspense fallback={<div className="gutter min-h-screen py-20 font-mono text-xs uppercase">Učitavanje kataloga…</div>}>
        <CatalogClient />
      </Suspense>

      <StepBand profile="diag" tone="navy" id="kompleti" className="gutter py-20 md:py-28">
        <p className="font-mono text-xs uppercase text-accent">Kompleti / sistemi zidova</p>
        <h2 className="mt-5 text-title uppercase">Sistem je više od zbira dijelova.</h2>
        <div className="mt-12 grid md:grid-cols-2">
          {BUNDLES.map((bundle, index) => (
            <Link
              key={bundle.id}
              href={bundle.code === 'D112'
                ? '/objave/spusteni-plafon-na-cd-profilima'
                : '/objave/pregradni-zid-w111-korak-po-korak'}
              className="border-t border-bg/35 py-7 md:p-7"
            >
              <span className="font-mono text-xs text-accent">0{index + 1} · {bundle.code}</span>
              <h3 className="mt-3 text-2xl uppercase">{bundle.name}</h3>
              <p className="mt-4 font-mono text-[11px] uppercase opacity-70">{bundle.build}</p>
            </Link>
          ))}
        </div>
      </StepBand>
    </>
  )
}
