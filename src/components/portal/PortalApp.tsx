'use client'

import { useEffect, useState } from 'react'
import { openLogin, useB2B } from '@/lib/b2b'
import { cartCount, useShop } from '@/lib/cart'
import Account from './Account'
import Admin from './Admin'
import Catalog from './Catalog'
import Checkout from './Checkout'
import Contact from './Contact'
import Overview from './Overview'
import { usePortal } from './store'
import { go, line, type View } from './ui'

// B2B portal Grand Company — kupcima okrenut portal (ne interni BI): jasna hijerarhija
// Katalog → Korpa → Narudžba, plus nalog (narudžbe, kredit, fakture) i kontakt
// za posebne uslove. Interni dio (tim) je odvojen i sažet. Dio portala je u adresi (#/katalog),
// pa radi dugme "nazad" i može se poslati link. Podaci su demo (Pantheon ERP).

const VIEWS: { id: View; label: string }[] = [
  { id: 'pregled', label: 'Pregled' },
  { id: 'katalog', label: 'Katalog' },
  { id: 'korpa', label: 'Korpa' },
  { id: 'nalog', label: 'Moj nalog' },
  { id: 'kontakt', label: 'Kontakt' },
]

const readView = (): View => {
  const v = window.location.hash.replace(/^#\/?/, '') as View
  return [...VIEWS.map((x) => x.id), 'interno'].includes(v) ? v : 'pregled'
}

export default function PortalApp() {
  const { partner, mode } = useB2B()
  const { cart } = useShop()
  const { admin } = usePortal()
  const [view, setView] = useState<View>('pregled')
  const active = partner && mode === 'b2b' ? partner : null

  useEffect(() => {
    const sync = () => {
      setView(readView())
      window.__gcLenis?.scrollTo(0, { immediate: true })
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const views = admin ? [...VIEWS, { id: 'interno' as View, label: 'Interno' }] : VIEWS
  const items = cartCount(cart)

  return (
    <div data-client-state>
      {/* Traka portala: dijelovi lijevo (vodoravni skrol na telefonu), nalog desno */}
      <nav
        aria-label="B2B portal"
        className={`sticky top-[calc(var(--nav-h)+var(--nav-inset)+8px)] z-30 flex items-stretch justify-between border-y ${line} bg-bg/95 backdrop-blur`}
      >
        <div className="flex min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-lenis-prevent>
          {views.map((v, i) => {
            const on = v.id === view
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => go(v.id)}
                aria-current={on ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 border-r ${line} px-4 py-3.5 text-[10.5px] transition-colors md:px-6 ${on ? 'bg-ink text-bg' : `hover:bg-ink/5 ${v.id === 'interno' ? 'text-cobalt' : ''}`}`}
              >
                <span className="tabular-nums opacity-40">{String(i).padStart(2, '0')}</span>
                {v.label}
                {v.id === 'korpa' && items > 0 && <span className={`grid size-5 place-items-center text-[9px] ${on ? 'bg-bg text-ink' : 'bg-cobalt text-bg'}`}>{items}</span>}
              </button>
            )
          })}
        </div>
        <div className={`hidden shrink-0 items-center gap-4 border-l ${line} px-5 md:flex`}>
          {active ? (
            <button type="button" onClick={() => go('nalog')} className="text-right text-[10px] leading-[1.35]">
              <span className="block max-w-[220px] truncate font-semibold">{active.name}</span>
              <span className="text-cobalt">rabat {Math.round(active.discount * 100)}% · valuta {active.paymentDays} d</span>
            </button>
          ) : (
            <button type="button" onClick={openLogin} className="bg-cobalt px-4 py-2 text-[10.5px] text-bg transition-colors hover:bg-ink">
              Prijava
            </button>
          )}
        </div>
      </nav>

      {view === 'pregled' && <Overview partner={active} />}
      {view === 'katalog' && <Catalog partner={active} />}
      {view === 'korpa' && <Checkout partner={active} />}
      {view === 'nalog' && <Account partner={active} />}
      {view === 'kontakt' && <Contact partner={active} />}
      {view === 'interno' && (admin ? <Admin /> : <Overview partner={active} />)}
    </div>
  )
}
