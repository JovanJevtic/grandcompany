'use client'

import { useEffect, useRef, useState } from 'react'
import { useLenis } from 'lenis/react'
import { closePanel, openCart, openPanel, useShop, type Panel } from '@/lib/cart'
import { CompareView, ProductView, SavedView, SearchView } from './panel-views'

const TITLES: Record<NonNullable<Panel>['kind'], string> = {
  saved: 'Sačuvano',
  compare: 'Poređenje',
  search: 'Pretraga',
  product: 'Brzi pregled',
}

// Široki panel je za tabelu poređenja; ostali su uže trake.
const WIDTH: Partial<Record<NonNullable<Panel>['kind'], string>> = { compare: 'min(920px, 100vw)' }

function View({ panel }: { panel: NonNullable<Panel> }) {
  switch (panel.kind) {
    case 'saved':
      return <SavedView />
    case 'compare':
      return <CompareView />
    case 'search':
      return <SearchView />
    case 'product':
      return <ProductView key={panel.id} id={panel.id} />
  }
}

// Desna traka za sačuvano, poređenje, pretragu i brzi pregled (sistem panela iz grand-root).
// Ostaje u DOM-u dok traje animacija zatvaranja. Dok je otvorena, Lenis je zaustavljen, kao kod korpe.
// Sloj je iznad fiksne značke i marqueea iz landinga (z-500 i z-200), isto kao ladica korpe.
export default function Panels() {
  const { panel, toast } = useShop()
  const lenis = useLenis()
  const [shown, setShown] = useState<NonNullable<Panel> | null>(null)
  const [entered, setEntered] = useState(false)
  const box = useRef<HTMLElement>(null)

  useEffect(() => {
    if (panel) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- panel se prikazuje tek nakon što je zatvoreno stanje iscrtano
      setShown(panel)
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)))
      return () => cancelAnimationFrame(id)
    }
    setEntered(false)
    const t = setTimeout(() => setShown(null), 700)
    return () => clearTimeout(t)
  }, [panel])

  // Esc zatvara, skrol stranice je zaključan dok je panel otvoren.
  const open = Boolean(panel)
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    const before = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closePanel()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lenis?.start()
      before?.focus({ preventScroll: true })
    }
  }, [open, lenis])

  // Fokus ide u panel kad se otvori (čitači ekrana i tastatura).
  useEffect(() => {
    if (entered && !box.current?.contains(document.activeElement)) box.current?.focus({ preventScroll: true })
  }, [entered, shown?.kind])

  return (
    <>
      <div
        aria-hidden
        onClick={closePanel}
        className={`fixed inset-0 z-[610] bg-ink/35 backdrop-blur-[2px] transition-opacity duration-700 ${entered ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      {shown && (
        <aside
          ref={box}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={TITLES[shown.kind]}
          className={`fixed inset-y-0 right-0 z-[620] h-dvh bg-bg outline-none transition-transform duration-700 [transition-timing-function:var(--ease-io)] ${
            entered ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ width: WIDTH[shown.kind] ?? 'min(560px, 100vw)' }}
        >
          <View panel={shown} />
        </aside>
      )}

      {/* Obavijest ("dodato u korpu") sa prečicom do korpe ili poređenja. */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-6 z-[630] flex justify-center px-4 transition-all duration-500 [transition-timing-function:var(--ease-out)] ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {toast && (
          <div className="pointer-events-auto flex max-w-full items-center gap-4 rounded-full bg-ink py-2.5 pl-5 pr-2.5 text-[14px] text-bg shadow-[0_18px_40px_-18px_rgba(27,36,54,.6)]">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-signal" />
            <span className="truncate">{toast.text}</span>
            {toast.action && (
              <button
                type="button"
                className="shrink-0 rounded-full bg-bg px-4 py-1.5 italic text-ink transition-colors hover:bg-signal hover:text-bg"
                onClick={() => {
                  const target = toast.action!.open
                  if (target === 'cart') openCart()
                  else openPanel({ kind: target })
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
