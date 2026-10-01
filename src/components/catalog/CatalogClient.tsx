'use client'

/* eslint-disable @next/next/no-img-element -- studijske fotografije iz /public, već optimizovane u WebP */

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Pw, { pw } from '@/components/ui/Pw'
import ShopHero from '@/components/shop/ShopHero'
import { addToCart } from '@/lib/cart'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE } from '@/lib/motion'
import { CATEGORIES, PRODUCTS, USES, defaultQty, shotOf, type CategoryId, type UseId } from '@/lib/shop'
import Price from '@/components/b2b/Price'

// Prodavnica poslije naslova: četiri grupe kao okrugle fotografije, podijeljeni uvod (ShopHero),
// pa "Najprodavanije" — mreža od osam ćelija odvojenih tankim linijama (po referenci). Dugme ispod
// otvara sve artikle izabrane grupe. Grupa i namjena se čuvaju u adresi (?kategorija=, ?namjena=).

// Naslovna fotografija za svaku grupu: jedan tipičan artikal iz nje.
const COVER: Record<CategoryId, string> = {
  'suha-gradnja': 'KNF-001',
  izolacija: 'ISO-002',
  veziva: 'CHM-002',
  oprema: 'ACC-003',
}

const FIRST = 8

type Cat = CategoryId | 'sve'

export default function CatalogClient() {
  const search = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const section = useRef<HTMLElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const [cat, setCat] = useState<Cat>(() => (search.get('kategorija') ?? 'sve') as Cat)
  const [use, setUse] = useState<UseId | 'sve'>(() => (search.get('namjena') ?? 'sve') as UseId | 'sve')
  const [all, setAll] = useState(() => search.has('kategorija') || search.has('namjena'))

  // Browser back/forward vraća i lokalno stanje.
  useEffect(() => {
    const onPop = () => {
      const q = new URLSearchParams(window.location.search)
      setCat((q.get('kategorija') ?? 'sve') as Cat)
      setUse((q.get('namjena') ?? 'sve') as UseId | 'sve')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Najprije najčešće birani, pa ostali; grupa i namjena sužavaju listu.
  const list = useMemo(
    () =>
      PRODUCTS.filter((p) => (cat === 'sve' || p.category === cat) && (use === 'sve' || p.uses.includes(use))).sort(
        (a, b) => Number(!!b.featured) - Number(!!a.featured),
      ),
    [cat, use],
  )
  const shown = all ? list : list.slice(0, FIRST)

  // Nove ćelije izranjaju jedna za drugom (poslije promjene grupe ili "prikaži sve").
  useGSAP(
    () => {
      const cells = grid.current?.querySelectorAll('[data-cell]')
      if (!cells?.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo(cells, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE.quint, stagger: 0.04, scrollTrigger: { trigger: grid.current, start: 'top 85%' } })
    },
    { scope: grid, dependencies: [cat, use, all], revertOnUpdate: true },
  )

  const sync = (nextCat: Cat, nextUse: UseId | 'sve') => {
    const q = new URLSearchParams()
    if (nextCat !== 'sve') q.set('kategorija', nextCat)
    if (nextUse !== 'sve') q.set('namjena', nextUse)
    router.replace(`${pathname}${q.size ? `?${q}` : ''}`, { scroll: false })
  }
  const chooseCat = (c: Cat) => {
    setCat(c)
    sync(c, use)
  }
  const clearUse = () => {
    setUse('sve')
    sync(cat, 'sve')
  }
  const toGrid = () => {
    const el = document.getElementById('najprodavanije')
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 40
    if (window.__gcLenis) window.__gcLenis.scrollTo(y)
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }
  const showAll = () => {
    setAll(true)
    toGrid()
  }

  const tabs: { id: Cat; name: string }[] = [{ id: 'sve', name: 'Sve' }, ...CATEGORIES.map((c) => ({ id: c.id, name: c.name }))]
  const useName = USES.find((u) => u.id === use)?.name

  return (
    <section ref={section} id="artikli">
      {/* Grupe kao četiri okrugle fotografije: biraju grupu i vode do mreže */}
      <div className="gutter mx-auto grid max-w-[1280px] grid-cols-4 gap-x-3 md:gap-x-[2vw]">
        {CATEGORIES.map((c, i) => {
          const on = cat === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                chooseCat(on ? 'sve' : c.id)
                toGrid()
              }}
              aria-pressed={on}
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
              data-cursor={on ? 'Sve' : 'Izaberi'}
              className="fade-up group text-center"
            >
              <span className="shot block aspect-square rounded-full !bg-bg ring-1 ring-ink/15 transition-shadow duration-500 group-hover:ring-ink/40">
                <img src={shotOf(COVER[c.id])} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] leading-tight md:mt-4 md:gap-2 md:text-[12px]">
                <span className={`size-1.5 rounded-full bg-signal transition-transform duration-500 ${on ? 'scale-100' : 'scale-0'}`} />
                {c.name}
              </span>
            </button>
          )
        })}
      </div>

      <ShopHero onAll={showAll} />

      {/* Najprodavanije: zaglavlje, grupe, mreža ćelija sa tankim linijama */}
      <div id="najprodavanije" className="mt-[22vh] scroll-mt-10 border-t border-ink/20">
        <div className="flex flex-wrap items-end justify-between gap-6 px-5 pb-8 pt-10 md:px-[3vw]">
          <h2 className="display text-[clamp(40px,4vw,68px)]">
            <Pw>Najprodavanije</Pw>
          </h2>
          <button type="button" onClick={() => setAll((v) => !v)} className="text-[11.5px] tracking-[0.1em] underline decoration-1 underline-offset-[5px] hover:text-signal">
            {all ? 'Prvih osam' : 'Svi artikli'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-ink/20 px-5 py-4 md:px-[3vw] max-md:pl-8 max-md:flex-nowrap max-md:justify-start max-md:overflow-x-auto max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden max-md:[&>*]:shrink-0 max-md:[&>*]:whitespace-nowrap" role="tablist" aria-label="Grupa artikala">
          {tabs.map((t) => {
            const on = cat === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => chooseCat(t.id)}
                className={`flex min-h-10 items-center gap-2 text-[11.5px] transition-opacity ${on ? '' : 'opacity-45 hover:opacity-100'}`}
              >
                <span className={`size-1.5 rounded-full bg-signal transition-transform duration-500 ${on ? 'scale-100' : 'scale-0'}`} />
                {t.name}
              </button>
            )
          })}
          {useName && (
            <button type="button" onClick={clearUse} className="ml-auto flex min-h-10 items-center gap-2 text-[11.5px] hover:text-signal">
              Namjena: {useName} <span aria-hidden>×</span>
            </button>
          )}
        </div>

        <div ref={grid} className="grid grid-cols-2 gap-px border-y border-ink/20 bg-ink/20 lg:grid-cols-4">
          {shown.map((p, i) => (
            <article key={p.id} data-cell className="group flex flex-col bg-bg">
              <Link href={`/prodavnica/${p.sku}`} data-cursor="Pogledaj" className="flex flex-1 flex-col items-center px-4 pb-6 pt-8 text-center md:px-6">
                <span className="relative block aspect-[4/5] w-full max-w-[300px] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading={i < 4 ? 'eager' : 'lazy'}
                    className="cell-shot absolute inset-0 h-full w-full object-contain transition-transform duration-700 ease-[var(--ease-out)] group-hover:-translate-y-2 group-hover:scale-[1.03]"
                  />
                </span>
                <span className="mt-5 max-w-[30ch] text-[11px] leading-[1.45]">{p.name}</span>
                <span className="mt-1.5 text-[12px] tabular-nums transition-colors group-hover:text-signal">
                  <Price value={p.price} unit={p.unit} />
                </span>
              </Link>
              <button
                type="button"
                onClick={() => addToCart(p.id, defaultQty(p))}
                className="mx-auto mb-6 text-[10.5px] tracking-[0.12em] underline decoration-1 underline-offset-[5px] opacity-0 transition-opacity duration-300 hover:text-signal focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-60"
                aria-label={`Dodaj u korpu: ${p.name}`}
              >
                Dodaj
              </button>
            </article>
          ))}
          {/* Popuna zadnjeg reda, da linije mreže ostanu pune */}
          {Array.from({ length: (4 - (shown.length % 4)) % 4 }, (_, i) => (
            <div key={`f${i}`} aria-hidden className="hidden bg-bg lg:block" />
          ))}
          {shown.length % 2 === 1 && <div aria-hidden className="bg-bg lg:hidden" />}
        </div>

        {!list.length && (
          <div className="grid min-h-[40vh] place-items-center px-5 text-center">
            <div>
              <p className="font-pretty text-[clamp(32px,3vw,48px)]">{pw('Ništa ovdje.')}</p>
              <button type="button" onClick={() => { chooseCat('sve'); clearUse() }} className="mt-6 text-[11.5px] underline underline-offset-[5px] hover:text-signal">
                Poništi
              </button>
            </div>
          </div>
        )}

        {list.length > FIRST && (
          <div className="flex justify-center py-12">
            <button
              type="button"
              onClick={() => setAll((v) => !v)}
              className="text-[11.5px] tracking-[0.12em] underline decoration-1 underline-offset-[5px] hover:text-signal"
            >
              {all ? 'Prikaži manje' : `Prikaži sve (${list.length})`}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
