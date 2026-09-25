import Image from 'next/image'

// Product image on the `well` ground. Photos fill the frame (cover); package drawings (SVG) sit inside it (contain).
export default function ProductImage({
  src,
  alt,
  sizes = '(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw',
  className = '',
  illustrative = false,
}: {
  src: string
  alt: string
  sizes?: string
  className?: string
  /** stock photo of the same kind of material, not this exact article */
  illustrative?: boolean
}) {
  const drawing = src.endsWith('.svg')
  return (
    <div className={`relative overflow-hidden bg-well ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        unoptimized={drawing}
        className={drawing ? 'object-contain p-[10%]' : 'object-cover'}
      />
      {illustrative && !drawing && (
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 bg-canvas/80 px-1 py-px text-[8.5px] font-medium uppercase tracking-[0.12em] text-muted">
          ilustracija
        </span>
      )}
    </div>
  )
}
