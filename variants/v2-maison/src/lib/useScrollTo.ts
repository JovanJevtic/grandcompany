import { useCallback } from 'react'
import { useLenis } from 'lenis/react'

// Klizanje do sekcije po id-ju, sa odmakom za lijepljivu traku prodavnice.
// `force` jer je Lenis zaustavljen dok je korpa otvorena, a upit se šalje baš iz korpe.
export function useScrollTo() {
  const lenis = useLenis()

  return useCallback(
    (id: string) => {
      const el = document.getElementById(id)
      if (!el) return
      const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar')) || 52
      if (lenis) lenis.scrollTo(el, { offset: -bar, duration: 1.6, force: true })
      else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - bar })
    },
    [lenis],
  )
}
