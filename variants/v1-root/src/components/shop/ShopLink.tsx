'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLenis } from 'lenis/react'
import { scrollToId } from '@/lib/nav'
import { useShop } from './ShopProvider'
import type { Filters } from '@/lib/shop'

// Link koji zna da je početna strana jedna stranica: sidro (/#cijene) na početnoj samo skroluje (preko Lenisa),
// sa druge stranice vodi na početnu, gdje HashScroll preuzima.
export default function ShopLink({
  href,
  children,
  className,
  onClick,
  ...rest
}: {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'onClick'>) {
  const pathname = usePathname()
  const lenis = useLenis()

  if (href.startsWith('/#') && pathname === '/') {
    const id = href.slice(2)
    return (
      <a
        href={href}
        className={className}
        onClick={(e) => {
          e.preventDefault()
          onClick?.()
          scrollToId(lenis, id)
        }}
        {...rest}
      >
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  )
}

// Dugme koje postavi filter kataloga i odvede na katalog (npr. "Artikli" uz materijal).
export function FilterLink({
  patch,
  children,
  className,
}: {
  patch: Partial<Filters>
  children: React.ReactNode
  className?: string
}) {
  const { setFilters, resetFilters } = useShop()
  const lenis = useLenis()
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        resetFilters()
        setFilters(patch)
        scrollToId(lenis, 'katalog')
      }}
    >
      {children}
    </button>
  )
}
