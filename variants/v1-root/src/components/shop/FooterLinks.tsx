'use client'

import type { FooterLink } from '@/lib/shop'
import ShopLink from './ShopLink'
import { useShop } from './ShopProvider'

// Linkovi podnožja: ili vode na rutu/sidro, ili otvaraju panel (sačuvano, poređenje).
export default function FooterLinks({ links }: { links: FooterLink[] }) {
  const { openPanel, saved, compare } = useShop()
  const cls = 'link-u inline-block py-[3px] text-left'

  return (
    <ul className="copy mt-5 flex flex-col">
      {links.map((l) => (
        <li key={l.label}>
          {'href' in l ? (
            <ShopLink href={l.href} className={cls}>
              {l.label}
            </ShopLink>
          ) : (
            <button type="button" className={`${cls} cursor-pointer`} onClick={() => openPanel({ kind: l.action })}>
              {l.label}
              {l.action === 'saved' && saved.length > 0 ? ` (${saved.length})` : ''}
              {l.action === 'compare' && compare.length > 0 ? ` (${compare.length})` : ''}
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
