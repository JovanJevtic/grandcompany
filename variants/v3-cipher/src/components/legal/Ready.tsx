'use client'

import { useEffect } from 'react'

// Pravne stranice nemaju loader, pa odmah javljaju da je stranica spremna (inače globals.css drži skrol zaključan).
export default function Ready() {
  useEffect(() => {
    document.documentElement.dataset.ready = '1'
  }, [])
  return null
}
