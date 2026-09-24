// Jedan izvor istine za tajminge i događaje.

export const EASE = {
  out: 'power3.out',
  inOut: 'power3.inOut',
  expo: 'expo.out',
  expoInOut: 'expo.inOut',
} as const

// Događaji za komunikaciju između komponenti (bez zajedničkog stanja).
export const EV = {
  ready: 'gc:ready', // loader je završen, počinje ulazak prstena
  contact: 'gc:contact', // detail: true = otvori, false = zatvori
  filter: 'gc:filter', // detail: id kategorije — prodavnica se filtrira i prikaže
} as const

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
