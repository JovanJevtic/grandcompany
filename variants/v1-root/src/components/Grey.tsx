import { TONES } from '@/lib/content'

// Siva ploča umjesto fotografije. Tri sloja: maska (clip-path), zum, sadržaj.
// Početno stanje je skriveno; otvara se sa lijeva na desno kad uđe u vidno polje (vidi Motion.tsx).
export default function Grey({
  tone = 0,
  className = '',
  style,
}: {
  tone?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      data-media
      className={`relative overflow-hidden ${className}`}
      style={{ clipPath: 'inset(0% 100% 0% 0%)', ...style }}
    >
      <div data-scale className="absolute inset-0">
        <div className="absolute inset-0" style={{ background: TONES[tone % TONES.length] }} />
      </div>
    </div>
  )
}
