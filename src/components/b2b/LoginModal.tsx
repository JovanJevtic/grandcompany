'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { closeLogin, DEMO_PARTNERS, login, loginAs, useB2B } from '@/lib/b2b'

// Ulaz u B2B Partner Portal. Za prezentaciju: veliki naslov "Ulaziš kao demo gost", polja su već
// popunjena demo nalogom, jedan klik prijavljuje i vodi na /portal. Ispod se može izabrati drugi
// demo partner (nivo 1/2/3). U produkciji: nalog iz Pantheon ERP-a.
const GUEST = DEMO_PARTNERS.find((p) => p.id === 'lazarevo') ?? DEMO_PARTNERS[0]

export default function LoginModal() {
  const { loginOpen } = useB2B()
  const router = useRouter()
  const [email, setEmail] = useState(GUEST.email)
  const [password, setPassword] = useState(GUEST.password)
  const [error, setError] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loginOpen) return
    window.__gcLenis?.stop?.()
    box.current?.querySelector<HTMLButtonElement>('[data-enter]')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeLogin()
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.__gcLenis?.start?.()
    }
  }, [loginOpen])

  if (!loginOpen) return null

  const go = () => {
    closeLogin()
    router.push('/portal')
  }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = login(email, password)
    setError(!ok)
    if (ok) go()
  }
  const enterAs = (id: string) => {
    loginAs(id)
    go()
  }

  return (
    <div className="fixed inset-0 z-[700] grid place-items-center p-3 md:p-6">
      <div className="absolute inset-0 bg-ink/60" onClick={closeLogin} aria-hidden />
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="b2b-login-title"
        data-lenis-prevent
        className="relative max-h-[94dvh] w-full max-w-[620px] overflow-y-auto border border-ink bg-bg text-ink"
      >
        {/* traka */}
        <div className="flex items-center justify-between bg-cobalt px-5 py-3 text-bg">
          <span className="label">B2B Partner Portal · demo</span>
          <button type="button" onClick={closeLogin} className="btn-square size-9 border-bg/40 text-bg hover:border-bg hover:bg-bg hover:text-cobalt" aria-label="Zatvori">
            <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
              <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <div className="border-b border-ink/15 px-5 pb-7 pt-8 md:px-8">
          <h2 id="b2b-login-title" className="display text-[clamp(38px,7vw,64px)] !leading-[0.9]">
            Ulaziš kao
            <br />
            demo gost
          </h2>
          <p className="mt-5 max-w-[46ch] text-[12px] leading-[1.6] opacity-70">
            Ovo je prikaz portala za građevinske firme i izvođače. Podaci su ogledni — u radu vidite svoj rabat,
            kreditni limit, gradilišta, narudžbe i fakture.
          </p>
        </div>

        <form onSubmit={submit} className="grid border-b border-ink/15 md:grid-cols-2">
          <label className="block border-b border-ink/15 px-5 py-4 md:border-b-0 md:border-r md:px-8">
            <span className="label opacity-50">E-mail</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" className="b2b-input mt-2 w-full bg-transparent text-[13px] outline-none" />
          </label>
          <label className="block px-5 py-4 md:px-8">
            <span className="label opacity-50">Lozinka</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" className="b2b-input mt-2 w-full bg-transparent text-[13px] outline-none" />
          </label>
          {error && <p className="col-span-full border-t border-ink/15 px-5 py-3 text-[11.5px] text-cobalt md:px-8">Pogrešan e-mail ili lozinka.</p>}
          <div className="col-span-full flex flex-wrap items-center justify-between gap-4 border-t border-ink/15 px-5 py-5 md:px-8">
            <span className="text-[11px] opacity-60">
              {GUEST.name} · rabat {Math.round(GUEST.discount * 100)}%
            </span>
            <button type="submit" data-enter className="cta cta--solid">
              <span className="cta-roll">
                <span>Uđi u portal</span>
                <span aria-hidden>Uđi u portal</span>
              </span>
              <svg className="cta-arrow" viewBox="0 0 16 16" aria-hidden>
                <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </div>
        </form>

        <div className="px-5 py-5 md:px-8">
          <p className="label opacity-50">Ili uđi kao drugi demo partner</p>
          <ul className="mt-3 border-t border-ink/15">
            {DEMO_PARTNERS.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => enterAs(p.id)} className="group grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-ink/15 py-3 text-left text-[11.5px] transition-colors hover:bg-ink hover:text-bg">
                  <span className="px-1">{p.name}</span>
                  <span className="opacity-60">{p.tier.split(',')[0]}</span>
                  <span className="bg-cobalt px-2 py-1 text-bg">−{Math.round(p.discount * 100)}%</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
