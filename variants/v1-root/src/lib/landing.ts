// Geometrija landinga na jednom mjestu (koriste je Chrome, nav i Motion).
//
// Desktop: landing je jedan ekran visine (100dvh) čiji se sadržaj, vodoravna traka `[data-strip]`, pomjera ulijevo
// dok korisnik skroluje OKOMITO (pin + scrub u Motion.tsx). Zato je "vodoravni skrol" tačno jednak `scrollY`,
// sve dok ne pređe `travel()`; iza toga se landing podiže i ispod njega dolazi prodavnica.
// Mobilni: obični vertikalni tok, bez pina.

import { SITE } from './company'

export const DESKTOP_MQ = '(min-width: 768px)'

export const isDesktop = () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_MQ).matches

export const getStrip = () => document.querySelector<HTMLElement>('[data-strip]')
export const getLanding = () => document.querySelector<HTMLElement>('[data-landing]')

// Koliko se traka može pomjeriti ulijevo (širina trake minus širina prozora). Na mobilnom 0.
export function travel() {
  const strip = getStrip()
  if (!strip || !isDesktop()) return 0
  return Math.max(0, strip.offsetWidth - window.innerWidth)
}

// Gdje (mjereno od vrha stranice) počinje prodavnica, odnosno gdje se landing završava.
export function shopTop() {
  if (isDesktop()) return travel() + window.innerHeight
  return getLanding()?.offsetHeight ?? window.innerHeight
}

// Lijeva ivica elementa unutar trake. Ne zavisi od toga koliko je traka trenutno pomjerena
// (oba pravokutnika se pomjeraju zajedno), pa vrijedi i usred animacije.
export function leftInStrip(el: Element) {
  const strip = getStrip()
  if (!strip) return 0
  return el.getBoundingClientRect().left - strip.getBoundingClientRect().left
}

// Visina fiksnog zaglavlja prodavnice (red od 60px + traka "Demo prodavnica" od 28px kad je uključena);
// koristi se kao odmak pri skrolu na sidra.
export const HEADER_H = SITE.demo ? 88 : 60
