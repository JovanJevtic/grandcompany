import Image from 'next/image'
import type { ReactNode } from 'react'

// Shared house-style primitives: icons, section title, photo frame.

const ICONS = {
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Zm4.6-1.9L20 20',
  saved: 'M6.5 3.5h11v17l-5.5-4-5.5 4z',
  compare: 'M4 7.5h12m0 0-3-3m3 3-3 3M20 16.5H8m0 0 3-3m-3 3 3 3',
  cart: 'M3 4.5h2.6l2.1 10.5h10.1L20 8H6.6M9.5 19.5a1 1 0 1 0 0-.01M16.5 19.5a1 1 0 1 0 0-.01',
  close: 'M5 5l14 14M19 5 5 19',
  menu: 'M3.5 7.5h17M3.5 12h17M3.5 16.5h17',
  arrowL: 'M15 5l-7 7 7 7',
  arrowR: 'M9 5l7 7-7 7',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
} as const

export type IconName = keyof typeof ICONS

export function Icon({ name, className = 'size-5', filled = false }: { name: IconName; className?: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICONS[name]} />
    </svg>
  )
}

/** Section heading: Montserrat 500, sentence case, left, one line. Optional lead and action on the right. */
export function SectionTitle({
  title,
  lead,
  action,
  id,
  className = '',
}: {
  title: string
  lead?: ReactNode
  action?: ReactNode
  id?: string
  className?: string
}) {
  return (
    <header className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10 ${className}`}>
      <div className="min-w-0">
        <h2 id={id} className="s-head">
          {title}
        </h2>
        {lead && <p className="mt-3 max-w-[58ch] text-[15px] leading-[1.55] opacity-75">{lead}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

/** Photo in a frame: next/image with `fill`, so the frame (aspect or height) sets the size. */
export function Photo({
  src,
  alt,
  sizes,
  className = '',
  imgClassName = '',
  preload = false,
  quality,
  children,
}: {
  src: string
  alt: string
  sizes: string
  className?: string
  imgClassName?: string
  preload?: boolean
  quality?: number
  children?: ReactNode
}) {
  return (
    <div className={`relative overflow-hidden bg-well ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        quality={quality}
        className={`object-cover ${imgClassName}`}
      />
      {children}
    </div>
  )
}
