'use client'

import type { ReactNode } from 'react'
import { openContact, scrollToTarget, showCategory } from '@/lib/scroll'
import type { CatId } from '@/lib/shop'

// Sitne klijentske akcije koje serverske sekcije (Cijene, podnožje) koriste kao dugmad i linkove.
export function ContactButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={openContact} className={className}>
      {children}
    </button>
  )
}

export function TopButton({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={() => scrollToTarget(0)} className={className}>
      {children}
    </button>
  )
}

export function CategoryButton({ cat, className, children }: { cat: CatId; className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={() => showCategory(cat)} className={className}>
      {children}
    </button>
  )
}
