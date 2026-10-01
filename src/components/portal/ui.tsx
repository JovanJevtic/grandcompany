'use client'

import type { ReactNode } from 'react'
import { STATUSES, type Status } from './store'

// Zajednički elementi portala — isti korporativni jezik kao ostatak sajta: tanke linije mreže,
// teški verzal naslovi (.display), brojevi (.num), sitne oznake (.label), kobalt blokovi.

export const line = 'border-ink/20'
export const idx = (i: number) => String(i + 1).padStart(2, '0')
export const field = 'h-11 w-full rounded-none border border-ink/25 bg-transparent px-3 text-[12px] outline-none transition-colors focus:border-ink'

export type View = 'pregled' | 'katalog' | 'kalkulator' | 'korpa' | 'nalog' | 'kontakt' | 'interno'

/** Prelaz na drugi dio portala (adresa #/katalog, radi i dugme "nazad"). */
export function go(view: View) {
  if (typeof window === 'undefined') return
  window.location.hash = `#/${view}`
}

export function Arrow({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

/** Zaglavlje dijela portala: broj, veliki naslov, kratko objašnjenje desno. */
export function Head({ no, title, children, aside }: { no?: string; title: string; children?: ReactNode; aside?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 border-b-2 border-ink pb-5">
      <div>
        {no && <p className="label opacity-50">{no}</p>}
        <h1 className="display mt-3 text-[clamp(38px,5vw,88px)] !leading-[0.86]">{title}</h1>
        {children && <p className="mt-4 max-w-[52ch] text-[11.5px] leading-[1.65] opacity-70">{children}</p>}
      </div>
      {aside}
    </header>
  )
}

/** Praćenje narudžbe: četiri koraka, popunjeno do trenutnog statusa. */
export function Track({ status, compact }: { status: Status; compact?: boolean }) {
  const at = STATUSES.indexOf(status)
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label={`Status: ${status}`}>
      {STATUSES.map((s, i) => (
        <li key={s} className={compact ? 'text-[9px]' : 'text-[9.5px]'}>
          <span className={`mb-2 block h-1.5 ${i <= at ? 'bg-cobalt' : 'bg-ink/15'}`} />
          <span className={i === at ? 'font-semibold' : 'opacity-50'}>{s}</span>
        </li>
      ))}
    </ol>
  )
}

/** Količina sa − / + (korak = pakovanje artikla). */
export function Stepper({ value, step, unit, onChange }: { value: number; step: number; unit: string; onChange: (v: number) => void }) {
  const set = (v: number) => onChange(Math.max(step, Math.round(v * 100) / 100))
  const btn = 'grid size-8 shrink-0 place-items-center border border-ink/25 text-[15px] transition-colors hover:border-ink disabled:opacity-30'
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" className={btn} onClick={() => set(value - step)} disabled={value <= step} aria-label="Manje">
        −
      </button>
      <span className="num w-[5ch] text-center text-[15px] tabular-nums" aria-live="polite">
        {value.toLocaleString('de-DE', { maximumFractionDigits: 2 })}
      </span>
      <button type="button" className={btn} onClick={() => set(value + step)} aria-label="Više">
        +
      </button>
      <span className="w-7 text-[10px] opacity-55">{unit}</span>
    </div>
  )
}

// Ilustrativni krug (sa starog portala): tanki prsten sa podiocima koji se sporo okreće, broj u sredini.
export function Dial({ value, label, size = 'size-[180px] md:size-[220px]' }: { value: string; label: string; size?: string }) {
  return (
    <div className={`relative grid shrink-0 place-items-center ${size}`}>
      <svg viewBox="0 0 200 200" className="dial absolute inset-0 h-full w-full" fill="none" stroke="currentColor" aria-hidden>
        <circle cx="100" cy="100" r="96" strokeWidth="1" />
        <circle cx="100" cy="100" r="78" strokeWidth="1" strokeDasharray="2 5" />
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 2
          const r1 = i % 5 ? 90 : 84
          return <line key={i} x1={100 + Math.cos(a) * r1} y1={100 + Math.sin(a) * r1} x2={100 + Math.cos(a) * 96} y2={100 + Math.sin(a) * 96} strokeWidth="1" />
        })}
        <circle cx="196" cy="100" r="4" fill="var(--cobalt)" stroke="none" />
      </svg>
      <div className="text-center">
        <p className="num text-[56px] leading-none">{value}</p>
        <p className="mt-1 text-[10px] opacity-60">{label}</p>
      </div>
    </div>
  )
}

/** Prsten iskorištenosti kredita; `extra` = dio koji bi dodala trenutna narudžba (svjetliji). */
export function Donut({ ratio, extra = 0, size = 'size-[170px]' }: { ratio: number; extra?: number; size?: string }) {
  const r = 70
  const c = 2 * Math.PI * r
  const a = Math.min(1, ratio)
  const b = Math.min(1 - a, extra)
  return (
    <svg viewBox="0 0 180 180" className={`${size} -rotate-90`} aria-hidden>
      <circle cx="90" cy="90" r={r} fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="18" />
      <circle cx="90" cy="90" r={r} fill="none" stroke="var(--cobalt)" strokeWidth="18" strokeDasharray={`${c * a} ${c}`} />
      {b > 0 && (
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--accent)" strokeWidth="18" strokeDasharray={`0 ${c * a} ${c * b} ${c}`} />
      )}
    </svg>
  )
}

/** Mala oznaka statusa (faktura / zaliha). */
export function Pill({ tone, children }: { tone: 'ink' | 'cobalt' | 'line' | 'warn'; children: ReactNode }) {
  const cls = {
    ink: 'bg-ink text-bg',
    cobalt: 'bg-cobalt text-bg',
    line: 'border border-ink/30',
    warn: 'border border-cobalt text-cobalt',
  }[tone]
  return <span className={`inline-block whitespace-nowrap px-2 py-1 text-[9.5px] font-medium tracking-[0.12em] ${cls}`}>{children}</span>
}

/** Datum za `ts` (ms) kao dd.mm.gggg. */
export function dateOf(ts: number) {
  const d = new Date(ts)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}.`
}
