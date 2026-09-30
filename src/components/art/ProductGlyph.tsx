import type { Product } from '@/lib/shop'

export type GlyphKind = 'board' | 'stud' | 'track' | 'ceiling' | 'slab' | 'roll' | 'eps' | 'bag' | 'pail' | 'screws' | 'tape' | 'hanger'

export function glyphKind(p: Product): GlyphKind {
  if (p.sku.startsWith('KNF-')) return 'board'
  if (/PRF-(050|075|100)/.test(p.sku)) return 'stud'
  if (/PRF-(UW75|UD28)/.test(p.sku)) return 'track'
  if (p.sku === 'PRF-CD60') return 'ceiling'
  if (/ISO-00[12]/.test(p.sku)) return 'slab'
  if (p.sku === 'ISO-003') return 'roll'
  if (/ISO-00[4-7]/.test(p.sku)) return 'eps'
  if (p.sku.startsWith('CHM-')) return 'bag'
  if (/ACC-00[12]/.test(p.sku)) return 'screws'
  if (/ACC-00[3-5]/.test(p.sku)) return 'tape'
  return 'hanger'
}

type Props = { product: Product; kind?: GlyphKind; className?: string; title?: string }
const S = { vectorEffect: 'non-scaling-stroke' as const, strokeLinecap: 'square' as const }

export default function ProductGlyph({ product, kind = glyphKind(product), className = '', title }: Props) {
  const label = title ?? `${product.name} — linijski crtež`
  const common = { ...S, strokeWidth: 1.25 }
  const Board = () => <>
    <path data-d="0" d="M35 59 160 27l45 25-126 34Z" {...common}/><path data-d="0" d="m35 59 44 27v63l-44-27Z" {...common}/><path data-d="0" d="m79 86 126-34v63L79 149Z" {...common}/>
    <path data-d="1" d="m40 75 41 24 120-32M40 90l41 24 120-32M40 105l41 24 120-32" {...common}/>
    <path data-d="2" d={product.sku === 'KNF-004' ? 'm115 66 18-5 9 5-18 5Zm-3 46 18-5m-6-40v40' : product.sku === 'KNF-002' ? 'm110 58 16 9 17-5m-12 33 18-5' : product.sku === 'KNF-003' ? 'm118 57 0 46m-12-20 25-7' : 'm112 65 30-8m-30 53 30-8'} {...common}/>
  </>
  const Profile = ({ lips = true, ribs = false }: { lips?: boolean; ribs?: boolean }) => <>
    <path data-d="0" d="M25 65 156 30l58 31-132 37Z" {...common}/><path data-d="0" d="m25 65 57 33v43l-57-33Z" {...common}/><path data-d="0" d="m82 98 132-37v43L82 141Z" {...common}/>
    <path data-d="1" d="m38 69 43 24 116-32-42-23Z" {...common}/>{lips && <path data-d="1" d="m25 65 13 4v29l44 25 115-32V61l17 0" {...common}/>} 
    {ribs && <path data-d="2" d="m92 101 0 31m17-36v31m17-36v31m17-36v31" {...common}/>}<path data-d="2" d="m51 81 16 9m61-29 25-7" {...common}/>
  </>
  const Slabs = ({ foam = false }: { foam?: boolean }) => <>
    <path data-d="0" d="m34 77 125-35 48 27-125 36Z" {...common}/><path data-d="0" d="m34 77 48 28v48l-48-27Z" {...common}/><path data-d="0" d="m82 105 125-36v48L82 153Z" {...common}/>
    <path data-d="1" d="m38 91 45 26 120-34m-165 22 45 26 120-34" {...common}/>
    {foam ? <path data-d="2" d="m101 105 8-6m11 2 8-6m12 2 8-6m12 2 8-6m-63 42 8-6m12 2 8-6m13 2 8-6" {...common}/> : <path data-d="2" d="m52 82 8 9m5-15 7 12m8-18 7 12m9-17 7 12m10-17 7 12m10-17 8 12m9-17 8 11" {...common}/>} 
  </>
  const art: Record<GlyphKind, React.ReactNode> = {
    board: Board(), stud: Profile({}), track: Profile({ lips:false }), ceiling: Profile({ ribs:true }), slab: Slabs({}), eps: Slabs({ foam:true }),
    roll: <><path data-d="0" d="M38 104c0-24 20-44 44-44h91c22 0 39 18 39 39s-17 39-39 39H79c-23 0-41-15-41-34Z" {...common}/><ellipse data-d="0" cx="172" cy="99" rx="39" ry="39" {...common}/><ellipse data-d="1" cx="172" cy="99" rx="18" ry="18" {...common}/><path data-d="2" d="m54 76 84 0m-96 22h92m-88 23h94" {...common}/></>,
    bag: <><path data-d="0" d="m69 31 100 0 10 25-5 91-13 13H74l-13-13-4-91Z" {...common}/><path data-d="1" d="m57 56 122 0m-113 62h108M77 31l7 25m73-25-7 25" {...common}/><path data-d="2" d="M91 77h56v22H91Zm4 52h48m-37 10h26" {...common}/></>,
    pail: <><ellipse data-d="0" cx="120" cy="55" rx="60" ry="18" {...common}/><path data-d="0" d="m60 55 12 92c20 19 77 19 96 0l12-92" {...common}/><path data-d="1" d="M79 61c0 77 82 77 82 0" {...common}/><path data-d="2" d="M93 96h54m-48 13h42" {...common}/></>,
    screws: <><path data-d="0" d="m38 72 104-27 61 29-105 31Z" {...common}/><path data-d="0" d="m38 72 60 33v53l-60-32Zm60 33 105-31v52L98 158Z" {...common}/><path data-d="1" d="m66 69 48-12 29 14-49 13Z" {...common}/><path data-d="2" d="m148 124 36-10m-32 3 28 25m-15-33 5 38M50 48l41 35m-35-40-12 12m47 28-12 12" {...common}/></>,
    tape: <><ellipse data-d="0" cx="118" cy="95" rx="76" ry="52" {...common}/><ellipse data-d="0" cx="118" cy="95" rx="35" ry="24" {...common}/><path data-d="1" d="m118 43 45 16c19 8 31 22 31 39s-14 35-35 43l-41 6" {...common}/><path data-d="2" d="m55 76 39 14m-42 3 35 12m-29 10 39 13" {...common}/></>,
    hanger: <><path data-d="0" d="M104 28h32v63h42v30h-42v38h-32v-38H62V91h42Z" {...common}/><path data-d="1" d="M74 91V54m92 37V54M74 54h30m32 0h30" {...common}/><circle data-d="2" cx="120" cy="45" r="5" {...common}/><circle data-d="2" cx="120" cy="108" r="5" {...common}/><circle data-d="2" cx="78" cy="106" r="4" {...common}/><circle data-d="2" cx="162" cy="106" r="4" {...common}/></>,
  }
  return <svg viewBox="0 0 240 180" role={title ? 'img' : undefined} aria-label={title ? label : undefined} aria-hidden={title ? undefined : true} className={className} fill="none" stroke="currentColor">{title && <title>{label}</title>}{art[kind]}</svg>
}
