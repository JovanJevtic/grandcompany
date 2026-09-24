'use client'

import { useEffect } from 'react'
import { useLenis } from 'lenis/react'
import { scrollToId } from '@/lib/nav'

// Dolazak direktno na sekciju (npr. /#cijene sa pravne stranice): preloader se preskače (vidi Preloader.tsx),
// a ovdje se, čim se učitaju fontovi i postave pinovi, skoči na traženu sekciju.
export default function HashScroll() {
  const lenis = useLenis()

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!lenis || !id) return
    let dead = false
    document.fonts.ready.then(() => {
      // dva okvira: da ScrollTrigger stigne da postavi pin i visine
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (!dead) scrollToId(lenis, id, true)
        }),
      )
    })
    return () => {
      dead = true
    }
  }, [lenis])

  return null
}
