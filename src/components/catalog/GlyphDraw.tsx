'use client'

import { useRef } from 'react'
import ProductGlyph from '@/components/art/ProductGlyph'
import { drawOnScroll } from '@/lib/draw'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
import type { Product } from '@/lib/shop'

export default function GlyphDraw({ product, className = '' }: { product: Product; className?: string }) {
  const root = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const svg = root.current?.querySelector('svg')
      if (!svg) return
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => drawOnScroll(svg, (context.conditions as { reduce: boolean }).reduce, {
        trigger: root.current!,
        start: 'top 88%',
        duration: 0.8,
      }))
    },
    { scope: root },
  )
  return (
    <div ref={root} data-glyph className={className}>
      <ProductGlyph product={product} className="h-full w-full" />
    </div>
  )
}
