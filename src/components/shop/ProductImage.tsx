/* eslint-disable @next/next/no-img-element -- statične slike iz /public, bez optimizacije (crteži su SVG) */

// Slika artikla: fotografija se puni preko okvira (cover), a crtež (SVG) stoji u svijetlom polju sa razmakom (contain).
export default function ProductImage({
  src,
  drawing,
  alt,
  className = '',
}: {
  src: string
  drawing?: boolean
  alt: string
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden ${drawing ? 'bg-well' : 'bg-ink/10'} ${className}`}>
      <img decoding="async"
        src={src}
        alt={alt}
        loading="lazy"
        className={`absolute inset-0 h-full w-full ${drawing ? 'object-contain p-[9%]' : 'object-cover'}`}
      />
    </div>
  )
}
