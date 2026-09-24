// Znak u sredini: dva prstena koja se preklapaju i stvaraju oblik oka. Boja se preuzima iz teksta (currentColor).
export default function Mark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 41 18" fill="none" className={className} aria-hidden>
      <ellipse cx="14.5" cy="9" rx="13.5" ry="8" stroke="currentColor" strokeWidth="1.3" />
      <ellipse cx="26.5" cy="9" rx="13.5" ry="8" stroke="currentColor" strokeWidth="1.3" />
      <ellipse cx="20.5" cy="9" rx="6.5" ry="8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}
