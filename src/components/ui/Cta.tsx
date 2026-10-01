import Link from 'next/link'

// Glavno dugme sajta: kapsula sa cinober tačkom; na hover se tekst zakotrlja u kurziv,
// a pozadina se napuni odozdo. `solid` je tamna varijanta za glavnu radnju na stranici.
type Props = {
  children: string
  href?: string
  onClick?: () => void
  solid?: boolean
  className?: string
  type?: 'button' | 'submit'
}

export default function Cta({ children, href, onClick, solid, className = '', type = 'button' }: Props) {
  const cls = `cta ${solid ? 'cta--solid' : ''} ${className}`
  const inner = (
    <>
      <span className="cta-dot" aria-hidden />
      <span className="cta-roll">
        <span>{children}</span>
        <span aria-hidden>{children}</span>
      </span>
    </>
  )
  if (href)
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  return (
    <button type={type} onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}
