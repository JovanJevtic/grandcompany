'use client'

import { useShop } from './ShopProvider'

// Kratka obavijest (sačuvano, poređenje puno...), kao "notify" u grand-root, ali u cipher slogu: sitan tekst u dnu.
export default function Toast() {
  const { toast } = useShop()
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex justify-center px-5">
      <p
        className={`info border border-line bg-bg px-4 py-3 text-fg transition-all duration-500 ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        {toast ?? ' '}
      </p>
    </div>
  )
}
