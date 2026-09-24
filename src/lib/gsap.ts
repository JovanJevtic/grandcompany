import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

// Hero se ne skroluje sam po sebi, ali ispod njega je prodavnica, pa su tu ScrollTrigger (pinovanje, reveal)
// i SplitText (naslovi po redovima). Lenis se dodaje u SmoothScroll.tsx.
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

export { gsap, useGSAP, ScrollTrigger, SplitText }
