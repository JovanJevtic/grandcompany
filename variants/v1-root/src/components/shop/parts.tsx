import type { Availability, Product } from '@/lib/shop'
import { parseText } from '@/lib/company'

// Tekst sa oznakama iz company.ts: {sjediste} → vrijednost (ili istaknuta oznaka ako je nepoznata), *kurziv*.
export function T({ s }: { s: string }) {
  return (
    <>
      {parseText(s).map((p, i) =>
        p.kind === 'em' ? (
          <em key={i}>{p.text}</em>
        ) : p.kind === 'missing' ? (
          <span key={i} className="missing">
            {p.text}
          </span>
        ) : (
          p.text
        ),
      )}
    </>
  )
}

// Gradivne jedinice prodavnice (server-komponente): okvir sekcije, zaglavlje sekcije, ploča umjesto fotografije.

// Sekcija prodavnice. `color` je akcentna boja poglavlja (tekst, linije, dugmad). Podaci artikala koriste tamnu (ink).
export function Section({
  id,
  color,
  children,
  className = '',
}: {
  id?: string
  color: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      className={`relative px-[var(--pad)] pb-[9vw] pt-[6vw] max-md:pb-20 max-md:pt-14 ${className}`}
      style={{ color, ['--acc' as string]: color }}
    >
      {children}
    </section>
  )
}

// Zaglavlje sekcije u stilu poglavlja landinga: crta, red oznaka, džinovski naslov.
export function SectionHead({
  no,
  side,
  title,
  className = '',
}: {
  no: string
  side: string
  title: string
  className?: string
}) {
  return (
    <header className={className}>
      <div data-reveal className="lbl flex items-baseline gap-[6vw] border-t border-current pt-4 max-md:gap-6">
        <span>Poglavlje</span>
        <span>{no}</span>
        <span className="ml-auto text-right">{side}</span>
      </div>
      <h2 data-reveal className="giant-v mt-[2.4vw] max-md:mt-4">
        {title}
      </h2>
    </header>
  )
}

// Fotografija ambijenta (naše stovarište, kran, primjena materijala). Otvara se sa lijeva na desno kad uđe u
// ekran, kao sive ploče na Marijinom landingu.
export function Photo({
  src,
  alt,
  className = '',
  index = 0,
  children,
}: {
  src: string
  alt: string
  className?: string
  index?: number
  children?: React.ReactNode
}) {
  return (
    <div
      data-reveal="clip"
      className={`${className.includes('absolute') ? '' : 'relative'} overflow-hidden ${className}`}
      style={{ ['--i' as string]: index }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- statične fotografije iz /public, bez optimizacije */}
      <img src={src} alt={alt} loading="lazy" className="plate-in absolute inset-0 size-full object-cover" />
      {children}
    </div>
  )
}

// Slika artikla. Crtež (SVG) stoji cijeli na svijetloj podlozi; fotografija artikla popunjava okvir.
export function ProductImage({
  p,
  className = '',
  index = 0,
  reveal = true,
}: {
  p: Pick<Product, 'image' | 'drawing' | 'name'>
  className?: string
  index?: number
  reveal?: boolean
}) {
  return (
    <div
      data-reveal={reveal ? 'clip' : undefined}
      className={`relative overflow-hidden ${className}`}
      style={{ ['--i' as string]: index }}
    >
      <div className={`${reveal ? 'plate-in' : ''} absolute inset-0 ${p.drawing ? 'bg-[#efe9d6]' : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- statične slike iz /public, bez optimizacije */}
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className={`size-full ${p.drawing ? 'object-contain p-[8%]' : 'object-cover'}`}
        />
      </div>
    </div>
  )
}

// Tačka dostupnosti u paleti sajta: puna tamna = na stanju, orange = ograničeno, prazan krug = malo na stanju.
export function AvailDot({ avail }: { avail: Availability }) {
  const style =
    avail === 'high'
      ? { background: 'var(--ink)' }
      : avail === 'mid'
        ? { background: '#d6956d' }
        : { border: '1px solid var(--ink)' }
  return <span aria-hidden className="mr-2 inline-block size-[7px] rounded-full align-[1px]" style={style} />
}
