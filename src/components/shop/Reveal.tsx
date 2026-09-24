'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useInView } from '@/lib/useInView'

// Omotač koji sadržaj izranja odozdo kad uđe u ekran. `delay` je u ms, za stagger među susjedima.
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      data-rise
      data-in={seen ? '' : undefined}
      className={className}
      style={{ '--d': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}

// Okvir koji se otvara iz sredine, kao Manifest u landingu.
export function OpenBox({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>('0px 0px -12% 0px')
  return (
    <div ref={ref} data-in={seen ? '' : undefined} className={`open-box ${className}`}>
      {children}
    </div>
  )
}
