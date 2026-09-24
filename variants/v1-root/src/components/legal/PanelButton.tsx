'use client'

import { useShop } from '@/components/shop/ShopProvider'

// Dugme na pravnoj stranici koje otvara panel prodavnice (uzorci, upit).
export default function PanelButton({
  kind,
  className,
  children,
}: {
  kind: 'samples' | 'inquiry'
  className?: string
  children: React.ReactNode
}) {
  const { openPanel } = useShop()
  return (
    <button type="button" className={className} onClick={() => openPanel({ kind })}>
      {children}
    </button>
  )
}
