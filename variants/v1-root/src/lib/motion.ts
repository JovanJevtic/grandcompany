// Jedan izvor istine za tajminge i geometriju.

export const EASE = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  expo: 'expo.out',
  expoInOut: 'expo.inOut',
} as const

// Uslovi za gsap.matchMedia. Funkcija se pokreće samo ako se bar jedan upit poklopi,
// zato je `all` uvijek tu (uvijek je tačan).
export const MQ = {
  all: 'all',
  desktop: '(min-width: 768px)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const

// Trake (01–04): svaka je široka 80px. Na početku su naslagane s desne strane, a kako se
// skroluje, redom se "zalijepe" na lijevu stranu.
export const BAND = 80
export const BANDS = 4

// Događaji za komunikaciju između komponenti (bez zajedničkog stanja).
export const EV = {
  menu: 'gc:menu',
  introDone: 'gc:intro-done',
} as const

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Veličina fonta pri kojoj tekst tačno popunjava zadatu dužinu.
// Mjeri se širina (horizontalno pisanje) ili visina (vertical-rl), zavisno od `axis`.
export function fitFontSize(el: HTMLElement, target: number, axis: 'width' | 'height') {
  const prev = el.style.fontSize
  el.style.fontSize = '100px'
  const box = el.getBoundingClientRect()
  el.style.fontSize = prev
  return (100 * target) / (axis === 'width' ? box.width : box.height)
}
