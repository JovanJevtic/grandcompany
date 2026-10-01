'use client'

import { useEffect, useRef, useState } from 'react'
import { closeLogin, DEMO_PARTNERS, login, loginAs, useB2B } from '@/lib/b2b'
import Cta from '@/components/ui/Cta'

// Prijava u B2B Partner Portal. Forma (e-mail + lozinka) i, za prezentaciju, brza prijava jednog od
// tri demo partnera (podaci iz gc-data: naziv, nivo, rabat). U produkciji: nalog iz Pantheon ERP-a.
export default function LoginModal() {
  const { loginOpen } = useB2B()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loginOpen) return
    window.__gcLenis?.stop?.()
    box.current?.querySelector<HTMLInputElement>('input')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeLogin()
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.__gcLenis?.start?.()
    }
  }, [loginOpen])

  if (!loginOpen) return null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = login(email, password)
    setError(!ok)
    if (ok) {
      setEmail('')
      setPassword('')
    }
  }

  return (
    <div className="fixed inset-0 z-[700] grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" onClick={closeLogin} aria-hidden />
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="b2b-login-title"
        data-lenis-prevent
        className="relative max-h-[92dvh] w-full max-w-[460px] overflow-y-auto rounded-[18px] bg-bg p-6 text-ink shadow-[0_30px_80px_-30px_rgba(27,36,54,.5)] md:p-8"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="label opacity-50">B2B Partner Portal</p>
            <h2 id="b2b-login-title" className="display mt-2 text-[30px]">
              Prijava
            </h2>
          </div>
          <button type="button" onClick={closeLogin} className="ulink text-[11.5px]">
            Zatvori
          </button>
        </div>
        <p className="mt-4 text-[11.5px] leading-[1.6] opacity-65">
          Ugovoreni rabat, kreditni limit i odgođeno plaćanje — podaci iz Pantheon ERP-a.
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-3">
          <label className="grid gap-1.5 text-[10.5px] opacity-80">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="b2b-input"
            />
          </label>
          <label className="grid gap-1.5 text-[10.5px] opacity-80">
            Lozinka
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="b2b-input"
            />
          </label>
          {error && <p className="text-[11px] text-signal">Pogrešan e-mail ili lozinka.</p>}
          <Cta type="submit" solid className="mt-2 w-full">
            Prijava
          </Cta>
        </form>

        <div className="mt-8 border-t border-ink/15 pt-5">
          <p className="text-[10.5px] opacity-55">Demo nalozi (za prezentaciju)</p>
          <ul className="mt-3 grid gap-2">
            {DEMO_PARTNERS.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => loginAs(p.id)}
                  className="flex w-full items-center justify-between gap-4 rounded-[12px] border border-ink/15 px-4 py-3 text-left transition-colors hover:border-ink/40 hover:bg-[var(--btn)]/40"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[11.5px]">{p.name}</span>
                    <span className="block text-[10px] opacity-55">{p.tier}</span>
                  </span>
                  <span className="b2b-pill shrink-0">−{Math.round(p.discount * 100)}%</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
