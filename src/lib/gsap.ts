import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'

// Plugini se registruju na jednom mjestu. Duplo registrovanje pravi bugove koji se vide samo u produkciji.
// DrawSVG crta outline ilustracije liniju po liniju; Flip animira promjenu rasporeda (filteri u katalogu).
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, Flip)

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, Flip, useGSAP }
