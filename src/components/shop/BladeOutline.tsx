import Link from 'next/link'

// Veliki tanki krug (kao na referenci) sa malim podvučenim linkom u sredini. Na hover se krug
// ispuni neutralnom sivo-bež bojom dugmadi. `dark` = popunjen tamnom bojom, svijetli tekst.
// (Ime komponente je ostalo od ranijeg oblika "sječiva".)
type Props = { label: string; href?: string; onClick?: () => void; dark?: boolean; className?: string }

export default function BladeOutline({ label, href, onClick, dark, className = '' }: Props) {
  const inner = (
    <>
      <span
        aria-hidden
        className={`keep-round absolute inset-0 rounded-full transition-colors duration-500 ${
          dark ? 'bg-ink' : 'border border-current group-hover:border-transparent group-hover:bg-[var(--btn)]'
        }`}
      />
      <span
        className={`relative text-[11px] tracking-[0.12em] transition-colors duration-500 ${
          dark ? 'text-bg' : 'underline decoration-1 underline-offset-[5px]'
        }`}
      >
        {label}
      </span>
    </>
  )
  const cls = `group relative grid aspect-square w-[min(200px,52vw)] place-items-center ${className}`
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
