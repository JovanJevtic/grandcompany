import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

// Plugini se registruju na jednom mjestu. Duplo registrovanje pravi bugove koji se vide samo u produkciji.
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

export { gsap, ScrollTrigger, SplitText, useGSAP }
