'use client'

import { useId, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'

type Option = { value: string; label: string }
type Props = {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
}

export default function FilterDropdown({ label, value, options, onChange }: Props) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value) ?? options[0]

  useGSAP(
    () => {
      const panel = root.current?.querySelector('[data-panel]')
      if (!panel) return
      const mm = gsap.matchMedia()
      mm.add(MQ, (context) => {
        const { reduce } = context.conditions as { reduce: boolean }
        gsap.to(panel, {
          scaleY: open ? 1 : 0,
          autoAlpha: open ? 1 : 0,
          duration: reduce ? 0 : 0.28,
          ease: reduce ? 'none' : 'steps(4)',
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
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKey}
        className="flex min-h-11 w-full items-center justify-between border-2 border-ink px-3 font-mono text-[11px] uppercase"
      >
        <span className="truncate">{value === 'sve' ? label : selected.label}</span>
        <span aria-hidden>{open ? '↑' : '↓'}</span>
      </button>
      <div
        id={id}
        data-panel
        role="listbox"
        aria-label={label}
        className="invisible absolute inset-x-0 top-[calc(100%-2px)] z-50 origin-top border-2 border-ink bg-bg opacity-0"
        style={{ transform: 'scaleY(0)' }}
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={option.value === value}
            onKeyDown={(event) => onOptionKey(event, index)}
            onClick={() => {
              onChange(option.value)
              setOpen(false)
              trigger.current?.focus()
            }}
            className={`flex min-h-10 w-full items-center gap-2 border-t border-ink px-3 text-left font-mono text-[11px]
              uppercase first:border-t-0 hover:bg-navy hover:text-bg`}
          >
            <span className={option.value === value ? 'text-accent' : 'invisible'}>■</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
