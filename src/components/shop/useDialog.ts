import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Dijalog (korpa, brzi pregled): Escape zatvara, Tab ostaje unutar dijaloga, a po zatvaranju se fokus vraća
// na dugme koje ga je otvorilo. Fokus prvo ide na sam dijalog, jer su njegova dugmad još skrivena dok traje ulazna animacija.
export function useDialog(active: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })

  useEffect(() => {
    const el = ref.current
    if (!active || !el) return
    const opener = document.activeElement as HTMLElement | null
    el.tabIndex = -1
    el.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close.current()
      if (e.key !== 'Tab') return
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => getComputedStyle(n).visibility !== 'hidden')
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const now = document.activeElement
      if (e.shiftKey && (now === first || now === el)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && now === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      opener?.focus?.({ preventScroll: true })
    }
  }, [active, ref])
}
