'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'
import { cartCount, openCart, useShop } from '@/lib/cart'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'

const NAV = [['Početna','/'],['Prodavnica','/prodavnica'],['Objave','/objave'],['Kontakt','/#kontakt']] as const

export default function SiteHeader({ variant }: { variant: 'inner' | 'overlay' }) {
  const root = useRef<HTMLElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { cart, saved } = useShop()
  useGSAP(() => {
    if (variant !== 'inner') return
    let last = window.scrollY
    const mm = gsap.matchMedia()
    mm.add(MQ, ctx => {
      const { reduce } = ctx.conditions as { reduce: boolean }
      const onScroll = () => {
        const y = window.scrollY
        if (!open && Math.abs(y-last) > 8) gsap.to(root.current, { yPercent: y > last && y > 100 ? -110 : 0, duration: reduce ? 0 : .45, ease:'power3.out' })
        last = y
      }
      window.addEventListener('scroll', onScroll, { passive:true })
      return () => window.removeEventListener('scroll', onScroll)
    })
  }, { scope:root, dependencies:[open, variant] })
  useGSAP(() => {
    const cols = menu.current?.querySelectorAll('[data-wipe]')
    if (!cols) return
    gsap.to(cols, { scaleY: open ? 1 : 0, stagger: open ? .035 : -.025, duration:.55, ease:'power4.inOut' })
    gsap.to(menu.current?.querySelector('[data-menu-links]') ?? null, { autoAlpha: open ? 1 : 0, duration:.25, delay: open ? .28 : 0 })
  }, { scope:menu, dependencies:[open] })
  const compact = variant === 'overlay'
  return <header ref={root} className={`fixed inset-x-0 top-0 z-[300] ${compact ? 'pointer-events-none text-white mix-blend-difference' : 'border-b-2 border-ink bg-bg text-ink'}`}>
    <div className={`flex h-16 items-center gap-5 px-5 ${compact ? 'justify-end md:px-8' : 'justify-between md:px-[8.33vw]'}`}>
      {!compact && <Link href="/" className="text-sm font-bold uppercase tracking-tight">Grand Company</Link>}
      {!compact && <nav className="hidden items-center gap-6 font-mono text-[11px] uppercase tracking-wider md:flex">{NAV.map(([label,href]) => <Link key={href} href={href} className="flex items-center gap-2"><span className={`text-accent ${pathname === href || (href !== '/' && pathname.startsWith(href.split('#')[0])) ? '' : 'invisible'}`}>■</span>{label}</Link>)}</nav>}
      <div className={`pointer-events-auto flex items-center border-2 ${compact ? 'border-white' : 'border-ink'}`}>
        {!compact && <span className="hidden border-r-2 border-current px-3 py-2 font-mono text-[10px] uppercase md:block">Sačuvano {saved.length}</span>}
        <button onClick={openCart} className="border-r-2 border-current px-3 py-2 font-mono text-[10px] uppercase">Korpa {cartCount(cart)}</button>
        <button onClick={() => setOpen(v=>!v)} aria-expanded={open} aria-controls="site-menu" className="px-3 py-2 font-mono text-[10px] uppercase">{open ? 'Zatvori' : 'Meni'}</button>
      </div>
    </div>
    <div ref={menu} id="site-menu" className={`fixed inset-0 -z-10 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className="absolute inset-0 flex">{Array.from({length:8},(_,i)=><span key={i} data-wipe className="h-full flex-1 origin-top bg-navy" style={{transform:'scaleY(0)'}} />)}</div>
      <nav data-menu-links className="relative flex h-full flex-col justify-end gap-1 p-5 pb-10 text-bg opacity-0 md:p-[8.33vw]">{NAV.map(([label,href],i)=><Link onClick={()=>setOpen(false)} key={href} href={href} className="border-t border-bg/30 py-2 text-[clamp(42px,8vw,120px)] uppercase leading-[.86]"><span className="mr-4 align-top font-mono text-xs text-accent">0{i+1}</span>{label}</Link>)}</nav>
    </div>
  </header>
}
