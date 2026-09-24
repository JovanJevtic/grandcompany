'use client'

import { useEffect, useRef, useState } from 'react'
import { COLORS } from '@/lib/content'
import { CartView, CheckoutView, CompareView, FormView, ProductView, SavedView, SearchView } from './panel-views'
import { type Panel, useShop } from './ShopProvider'

const TITLES: Record<string, string> = {
  cart: 'Korpa',
  checkout: 'Narudžba',
  saved: 'Sačuvano',
  compare: 'Poređenje',
  search: 'Pretraga',
  samples: 'Uzorci materijala',
  inquiry: 'Upit za izvođače i projekte',
  product: 'Artikal',
}

// Široki paneli su za tabelu poređenja; ostali su uže trake.
const WIDTH: Record<string, string> = { compare: 'min(920px, 100vw)' }

function View({ panel }: { panel: NonNullable<Panel> }) {
  switch (panel.kind) {
    case 'cart':
      return <CartView />
    case 'checkout':
      return <CheckoutView />
    case 'saved':
      return <SavedView />
    case 'compare':
      return <CompareView />
    case 'search':
      return <SearchView />
    case 'samples':
    case 'inquiry':
      return <FormView kind={panel.kind} />
    case 'product':
      return <ProductView key={panel.id} id={panel.id} />
  }
}

// Desna traka za korpu, narudžbu, sačuvano, poređenje, pregled artikla, pretragu, uzorke i upit.
// Ostaje u DOM-u dok traje animacija zatvaranja. Dok je otvorena, skrol stranice je zaključan (ShopProvider).
export default function Panels() {
  const { panel, closePanel, toast, openPanel } = useShop()
  const [shown, setShown] = useState<NonNullable<Panel> | null>(null)
  const [entered, setEntered] = useState(false)
  const box = useRef<HTMLElement>(null)

  useEffect(() => {
    if (panel) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- panel se prikazuje tek nakon što je prethodno stanje "zatvoreno" iscrtano
      setShown(panel)
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)))
      return () => cancelAnimationFrame(id)
    }
    setEntered(false)
    const t = setTimeout(() => setShown(null), 650)
    return () => clearTimeout(t)
  }, [panel])

  useEffect(() => {
    if (!panel) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closePanel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panel, closePanel])

  // Fokus ide u panel kad se otvori (čitači ekrana i tastatura).
  useEffect(() => {
    // Polje sa autoFocus (pretraga) zadržava fokus; inače fokus ide na sam panel.
    if (entered && !box.current?.contains(document.activeElement)) box.current?.focus({ preventScroll: true })
  }, [entered, shown?.kind])

  return (
    <>
      <div
        aria-hidden
        onClick={closePanel}
        className={`fixed inset-0 z-[79] bg-ink/45 transition-opacity duration-500 ${entered ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      {shown && (
        <aside
          ref={box}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={TITLES[shown.kind]}
          className={`fixed inset-y-0 right-0 z-[80] bg-bg outline-none transition-transform duration-[650ms] [transition-timing-function:var(--ease-expo)] ${
            entered ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ width: WIDTH[shown.kind] ?? 'min(560px, 100vw)', borderLeft: '1px solid rgb(26 18 11 / 0.15)', ['--acc' as string]: 'var(--ink)' }}
        >
          <View panel={shown} />
        </aside>
      )}

      {/* obavijest ("dodato u korpu") */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-6 z-[85] flex justify-center px-4 transition-all duration-500 [transition-timing-function:var(--ease-expo)] ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {toast && (
          <div className="pointer-events-auto flex max-w-full items-center gap-5 bg-ink px-5 py-3.5 text-bg">
            <span className="lbl truncate">{toast.text}</span>
            {toast.action && (
              <button
                type="button"
                data-hover
                className="lbl cursor-pointer shrink-0 underline underline-offset-4"
                style={{ color: COLORS.why }}
                onClick={() => openPanel({ kind: toast.action!.panel })}
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
