'use client'

import Link from 'next/link'
import { useLenis } from 'lenis/react'
import { COLORS } from '@/lib/content'
import { SITE } from '@/lib/company'
import { scrollToTop } from '@/lib/nav'
import ShopLink from './ShopLink'
import { useShop } from './ShopProvider'

const NAV = [
  { label: 'Katalog', href: '/#katalog' },
  { label: 'Kompleti', href: '/#kompleti' },
  { label: 'Radovi', href: '/#radovi' },
  { label: 'Cijene', href: '/#cijene' },
  { label: 'Dostava', href: '/#dostava' },
  { label: 'Ponuda', href: '/#ponuda' },
]

// Mali brojač uz stavku zaglavlja: prazan krug za 0, popunjen akcentom kad ima nečega.
function Count({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="ml-2 inline-flex size-[18px] items-center justify-center rounded-full border text-[10px] leading-none transition-colors duration-300"
      style={n > 0 ? { background: COLORS.why, borderColor: COLORS.why, color: 'var(--ink)' } : { borderColor: 'currentColor' }}
    >
      {n}
    </span>
  )
}

// Zaglavlje prodavnice: naziv, sekcije, pretraga, sačuvano, poređenje i korpa. Uvijek vidljivo (nema više
// landinga sa preloaderom iznad prodavnice).
export default function ShopHeader({ variant = 'home' }: { variant?: 'home' | 'page' }) {
  const { count, saved, compare, openPanel } = useShop()
  const lenis = useLenis()

  const wordmark = 'font-serif text-[22px] uppercase leading-none tracking-[0.01em] max-sm:text-[18px]'

  return (
    <header
      className="fixed inset-x-0 top-0 z-30 bg-bg text-ink"
    >
      {SITE.demo && (
        <p className="lbl bg-ink px-[var(--pad)] py-2 text-center text-bg">
          Demo prodavnica <span className="max-sm:hidden">· narudžbe i upiti se još ne šalju</span>
        </p>
      )}
      <div className="flex h-[60px] items-center justify-between gap-6 border-b border-ink/15 px-[var(--pad)]">
        <div className="flex items-center gap-6 md:gap-9">
          {variant === 'page' && (
            <Link href="/" className="lbl max-sm:hidden">
              Početna
            </Link>
          )}
          {variant === 'home' ? (
            <button type="button" data-hover className={`${wordmark} cursor-pointer`} onClick={() => scrollToTop(lenis)}>
              Grand Company
            </button>
          ) : (
            <Link href="/" className={wordmark}>
              Grand Company
            </Link>
          )}
        </div>

        <nav aria-label="Sekcije prodavnice" className="lbl hidden gap-7 xl:flex">
          {NAV.map((n) => (
            <ShopLink key={n.href} href={n.href} className="link-u">
              {n.label}
            </ShopLink>
          ))}
        </nav>

        <div className="lbl flex items-center gap-5 md:gap-7">
          <button type="button" data-hover className="cursor-pointer" onClick={() => openPanel({ kind: 'search' })}>
            Pretraga
          </button>
          <button type="button" data-hover className="cursor-pointer max-md:hidden" onClick={() => openPanel({ kind: 'saved' })}>
            Sačuvano
            <Count n={saved.length} />
          </button>
          <button type="button" data-hover className="cursor-pointer max-md:hidden" onClick={() => openPanel({ kind: 'compare' })}>
            Poređenje
            <Count n={compare.length} />
          </button>
          <button type="button" data-hover className="cursor-pointer" onClick={() => openPanel({ kind: 'cart' })}>
            Korpa
            <Count n={count} />
          </button>
        </div>
      </div>
    </header>
  )
}
