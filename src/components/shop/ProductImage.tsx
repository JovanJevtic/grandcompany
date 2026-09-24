import type { Product } from '@/lib/shop'
import { WELL } from '@/lib/content'

// Slika artikla. Crtež (SVG packshot) stoji cijeli na svijetloj podlozi, sa odmakom;
// fotografija artikla popunjava okvir. Kategorijska ili ambijentalna fotografija se ovdje nikad ne koristi.
export default function ProductImage({
  p,
  className = '',
  pad = '12%',
  eager = false,
}: {
  p: Pick<Product, 'image' | 'drawing' | 'name'>
  className?: string
  pad?: string
  eager?: boolean
}) {
  return (
    <span
      className={`absolute inset-0 block ${className}`}
      style={p.drawing ? { background: `linear-gradient(160deg, ${WELL.a}, ${WELL.b})`, padding: pad } : { background: '#1a1a1a' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- lokalni SVG crteži i fotografije, bez optimizacije */}
      <img
        src={p.image}
        alt={p.name}
        draggable={false}
        loading={eager ? 'eager' : 'lazy'}
        className={`block h-full w-full ${p.drawing ? 'object-contain' : 'object-cover'}`}
      />
    </span>
  )
}
