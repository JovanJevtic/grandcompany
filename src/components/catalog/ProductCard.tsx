'use client'
import Link from 'next/link'
import { addToCart, toggleSaved, useShop } from '@/lib/cart'
import { defaultQty, money, type Product } from '@/lib/shop'
import { STOCK_LABEL, stockLevel } from '@/gc/gc'
import GlyphDraw from './GlyphDraw'

export default function ProductCard({ product, view }: { product:Product; view:'grid'|'list' }) {
  const {saved}=useShop(); const isSaved=saved.includes(product.id); const stock=stockLevel(product)
  if(view==='list') return <article data-flip-id={product.id} className="product-card grid grid-cols-[1fr_auto] gap-3 border-t-2 border-ink py-4 transition-colors md:grid-cols-[110px_1fr_160px_130px_auto] md:items-center md:px-3">
    <GlyphDraw product={product} className="hidden h-16 md:block"/><div><p className="font-mono text-[10px] uppercase opacity-60">{product.sku} · {product.brand}</p><Link href={`/prodavnica/${product.sku}`} className="mt-1 block text-lg uppercase leading-none">{product.name}</Link><p className="mt-2 font-mono text-[10px] uppercase opacity-60">{product.spec}</p></div><p className="hidden font-mono text-xs uppercase md:block"><i className="mr-2 inline-block size-2 bg-accent"/>{STOCK_LABEL[stock]}</p><p className="font-mono text-sm uppercase tabular-nums">{money(product.price)} / {product.unit}</p><div className="flex gap-2"><button aria-label={isSaved?'Ukloni iz sačuvanih':'Sačuvaj'} onClick={()=>toggleSaved(product.id)} className="border-2 border-current px-3 py-2">{isSaved?'■':'□'}</button><button onClick={()=>addToCart(product.id,defaultQty(product))} className="border-2 border-current px-3 py-2 font-mono text-[10px] uppercase">+ U korpu</button></div>
  </article>
  return <article data-flip-id={product.id} className="product-card flex min-h-[520px] flex-col border-2 border-ink bg-well p-4 transition-colors duration-300">
    <div className="flex justify-between font-mono text-[10px] uppercase tracking-wide"><span>{product.sku} · {product.brand}</span><button aria-label={isSaved?'Ukloni iz sačuvanih':'Sačuvaj'} onClick={()=>toggleSaved(product.id)}>{isSaved?'■':'□'}</button></div>
    <Link href={`/prodavnica/${product.sku}`} className="flex flex-1 flex-col"><GlyphDraw product={product} className="my-5 h-56"/><h2 className="text-2xl uppercase leading-[.95]">{product.name}</h2><p className="mt-3 font-mono text-[10px] uppercase opacity-60">{product.spec}</p></Link>
    <div className="mt-6 flex items-end justify-between gap-3 border-t border-current pt-4"><div><p className="font-mono text-[10px] uppercase"><i className="mr-2 inline-block size-2 bg-accent"/>{STOCK_LABEL[stock]}</p><p className="mt-2 font-mono text-sm uppercase tabular-nums">{money(product.price)} / {product.unit}</p></div><button onClick={()=>addToCart(product.id,defaultQty(product))} className="border-2 border-current px-3 py-3 font-mono text-[10px] uppercase">+ U korpu</button></div>
  </article>
}
