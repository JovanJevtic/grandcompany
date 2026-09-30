'use client'
import { useRef } from 'react'
import PostArt, { type PostArtKind } from '@/components/art/PostArt'
import { drawOnScroll } from '@/lib/draw'
import { gsap, useGSAP } from '@/lib/gsap'
import { MQ } from '@/lib/motion'
export default function PostArtDraw({kind,className='',title}:{kind:PostArtKind;className?:string;title?:string}){const root=useRef<HTMLDivElement>(null);useGSAP(()=>{const svg=root.current?.querySelector('svg');if(!svg)return;const mm=gsap.matchMedia();mm.add(MQ,ctx=>drawOnScroll(svg,(ctx.conditions as {reduce:boolean}).reduce,{trigger:root.current!,start:'top 82%',duration:1.1}))},{scope:root});return <div ref={root} className={className}><PostArt kind={kind} title={title} className="h-full w-full"/></div>}
