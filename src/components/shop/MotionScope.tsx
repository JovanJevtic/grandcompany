'use client'

import { useRef } from 'react'
import { useMediaMotion } from '@/lib/media'

// Omotač za serverske stranice: uključuje kretanje fotografija (data-curtain, data-parallax,
// data-float, data-up) za sve unutar sebe.
export default function MotionScope({ children, className, as: Tag = 'div' }: { children: React.ReactNode; className?: string; as?: 'div' | 'section' }) {
  const ref = useRef<HTMLDivElement>(null)
  useMediaMotion(ref)
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
