// Okrugla značka brenda: ovalni obruč sa slovima G i C jedno iznad drugog.
export default function BadgeMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 58" fill="none" aria-hidden className={className}>
      <ellipse cx="22" cy="29" rx="20" ry="27" stroke="currentColor" strokeWidth="2.6" />
      <text
        x="22"
        y="27"
        textAnchor="middle"
        fontSize="19"
        fontWeight="800"
        fill="currentColor"
        style={{ fontFamily: 'var(--font-inter-tight), sans-serif' }}
      >
        G
      </text>
      <text
        x="22"
        y="47"
        textAnchor="middle"
        fontSize="19"
        fontWeight="800"
        fill="currentColor"
        style={{ fontFamily: 'var(--font-inter-tight), sans-serif' }}
      >
        C
      </text>
    </svg>
  )
}
