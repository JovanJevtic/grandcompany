// Jedan izvor istine za tajminge. Doslednost tajminga daje "osjećaj" cijelom sajtu.

export const EASE = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  expo: 'expo.out',
  quint: 'power4.out',
  quintInOut: 'power4.inOut',
} as const

export const DUR = {
  fast: 0.4,
  base: 0.8,
  slow: 1.4,
} as const

// Uslovi za gsap.matchMedia. Funkcija se pokreće samo ako se bar jedan upit poklopi,
// zato je `all` uvijek tu (uvijek je tačan), inače se na običnom desktopu ništa ne pokrene.
export const MQ = {
  all: 'all',
  reduce: '(prefers-reduced-motion: reduce)',
  mobile: '(max-width: 767px)',
} as const

// Raspored uvodne animacije, u sekundama od učitavanja stranice.
export const INTRO = {
  letters: 0.2, // slova wordmarka izranjaju ispod maske
  frame: 1.0, // okvir sa videom se otvara iz srednje linije
  caption: 2.4, // slogan ispod okvira
} as const

// Margina wordmarka sa svake strane, kao udio širine ekrana (44px na 1440px).
export const SIDE = 0.0305

// Veličina fonta pri kojoj tekst tačno popunjava zadatu širinu.
// `el` mora biti inline-block bez prelamanja, da bi mu se izmjerila širina.
export function fitFontSize(el: HTMLElement, targetWidth: number) {
  const prev = el.style.fontSize
  el.style.fontSize = '100px'
  const width = el.getBoundingClientRect().width
  el.style.fontSize = prev
  return (100 * targetWidth) / width
}
