import Link from 'next/link'

// Veliki obrisani "sječivo" romb (oblik iz logotipa, samo tanka linija) sa malim podvučenim linkom
// u sredini — zamjena za tanki krug sa reference. Na hover linija i tekst pređu u boju kursora.
// `dark` = popunjen tamnom bojom, bijeli tekst (za ćeliju u redu "Sa gradilišta").
type Props = { label: string; href?: string; onClick?: () => void; dark?: boolean; className?: string }

const PATH = 'M0 60C130 55 168 26 200 0 232 26 270 55 400 60 270 65 232 94 200 120 168 94 130 65 0 60Z'

export default function BladeOutline({ label, href, onClick, dark, className = '' }: Props) {
  const inner = (
    <>
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <path
          d={PATH}
          fill={dark ? 'var(--ink)' : 'none'}
          stroke={dark ? 'none' : 'currentColor'}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          className="transition-[stroke,fill] duration-500 group-hover:stroke-signal"
        />
      </svg>
      <span
        className={`relative text-[11px] tracking-[0.12em] transition-colors duration-500 ${
          dark ? 'text-bg' : 'underline decoration-1 underline-offset-[5px] group-hover:text-signal'
        }`}
      >
        {label}
      </span>
    </>
  )
  const cls = `group relative grid aspect-[2/1] w-[min(300px,70vw)] place-items-center ${className}`
  if (href)
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    )
  return <div className={cls}>{inner}</div>
}
