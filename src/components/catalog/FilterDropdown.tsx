'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { EASE, MQ } from '@/lib/motion'

type Option = { value: string; label: string }
type Props = {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  /** Poravnanje panela: lijevo (podrazumijevano) ili desno (za padajuće uz desnu ivicu) */
  align?: 'left' | 'right'
}

// Tihi padajući izbor: tekst sa malom strelicom; panel je zaobljena kartica koja izroni odozgo.
export default function FilterDropdown({ label, value, options, onChange, align = 'left' }: Props) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value) ?? options[0]
  const isSet = value !== options[0]?.value

  // Klik van panela ga zatvara.
  useEffect(() => {
    if (!open) return
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [open])

  useGSAP(
    () => {
      const panel = root.current?.querySelector('[data-panel]')
      if (!panel) return
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        gsap.to(panel, {
          autoAlpha: open ? 1 : 0,
          y: open ? 0 : -8,
          duration: reduce ? 0 : 0.35,
          ease: EASE.out,
        })
      })
    },
    { scope: root, dependencies: [open] },
  )

  const focusOption = (index: number) => {
    const items = root.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')
    items?.[Math.max(0, Math.min(index, items.length - 1))]?.focus()
  }

  const onTriggerKey = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    setOpen(true)
    requestAnimationFrame(() => focusOption(event.key === 'ArrowDown' ? 0 : options.length - 1))
  }

  const onOptionKey = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'Escape') {
      setOpen(false)
      trigger.current?.focus()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusOption(index + (event.key === 'ArrowDown' ? 1 : -1))
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      focusOption(event.key === 'Home' ? 0 : options.length - 1)
    }
  }

  return (
    <div
      ref={root}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation()
          setOpen(false)
          trigger.current?.focus()
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
        className="flex min-h-11 items-center gap-2 text-[15px]"
      >
        {isSet && <span className="size-1.5 rounded-full bg-signal" aria-hidden />}
        <span className="opacity-50">{label}</span>
        <span className="truncate">{isSet ? selected.label : ''}</span>
        <svg viewBox="0 0 10 6" className={`w-2.5 transition-transform duration-500 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" aria-hidden>
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>
      <div
        id={id}
        data-panel
        role="listbox"
        aria-label={label}
        className={`invisible absolute top-full z-50 mt-2 min-w-[220px] rounded-2xl bg-bg p-2 opacity-0 shadow-[0_24px_60px_-20px_rgba(27,36,54,.35)] ring-1 ring-ink/10 ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
      >
        {options.map((option, index) => {
          const on = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={on}
              onKeyDown={(event) => onOptionKey(event, index)}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
                trigger.current?.focus()
              }}
              className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] transition-colors hover:bg-plate/70"
            >
              <span className={`size-1.5 shrink-0 rounded-full bg-signal ${on ? '' : 'opacity-0'}`} />
              <span className={on ? 'italic' : ''}>{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
