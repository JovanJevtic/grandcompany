'use client'

import { useEffect } from 'react'

// Kad se stranica učita i browser odmori, sve slike sa loading="lazy" počnu da se skidaju odmah
// (ukupno ~1.5 MB na početnoj). Tako su već u kešu kad skrol stigne do njih, umjesto da se
// tek tada skidaju i "iskoče". Na sporoj vezi (save-data / 2g) ne radimo ništa.
export default function ImageWarmup() {
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (conn?.saveData || /2g/.test(conn?.effectiveType ?? '')) return
    let idle = 0
    const warm = () => {
      document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
        img.loading = 'eager'
      })
    }
    const schedule = () => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(warm, { timeout: 2500 }) : window.setTimeout(warm, 1200)
    }
    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })
    return () => {
      window.removeEventListener('load', schedule)
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
    }
  }, [])
  return null
}
