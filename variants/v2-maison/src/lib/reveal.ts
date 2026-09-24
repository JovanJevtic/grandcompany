import { gsap, SplitText } from './gsap'
import { EASE } from './motion'

// Nijanse sive za ploče koje zamjenjuju fotografije.
export const TONES = ['#d7d9dd', '#cbcdd2', '#dcdee1', '#c2c5ca', '#d2d4d8']

const OPEN = 'inset(0% 0% 0% 0%)'
const CLOSED = 'inset(0% 50% 0% 50%)'

// Otvaranje sive ploče: clip-path krene od srednje linije, a unutrašnjost se smiruje sa zuma 1.2 na 1.
// Uvijek fromTo: browser sažima inset(a b a b) u inset(a b), pa bi `to` pročitao pogrešan broj vrijednosti.
export function revealMedia(media: Element, reduce: boolean, start = 'top 88%') {
  const scale = media.querySelector('[data-scale]')
  if (reduce) {
    gsap.set(media, { clipPath: OPEN })
    return
  }
  gsap.fromTo(
    media,
    { clipPath: CLOSED },
    {
      clipPath: OPEN,
      duration: 1.4,
      ease: EASE.quintInOut,
      scrollTrigger: { trigger: media, start },
    },
  )
  if (scale) {
    gsap.fromTo(
      scale,
      { scale: 1.2 },
      { scale: 1, duration: 1.8, ease: EASE.out, scrollTrigger: { trigger: media, start } },
    )
  }
}

// Paragraf po redovima: svaki red izranja iz maske. `autoSplit` ponovo dijeli tekst kad se promijeni širina ili font.
export function revealLines(el: Element, reduce: boolean, start = 'top 88%') {
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'ln',
    autoSplit: true,
    onSplit(self) {
      gsap.set(el, { visibility: 'visible' })
      if (reduce) return
      return gsap.from(self.lines, {
        yPercent: 120,
        duration: 1.1,
        ease: EASE.quint,
        stagger: 0.08,
        scrollTrigger: { trigger: el, start },
      })
    },
  })
}

// Kratki naslovi slovo po slovo. Riječi ostaju cjelovite (words), pa se ne lome usred riječi.
export function revealChars(el: Element, reduce: boolean, start = 'top 88%', trigger: Element = el) {
  const split = SplitText.create(el, { type: 'words,chars', mask: 'chars', charsClass: 'ch' })
  gsap.set(el, { visibility: 'visible' })
  if (reduce) return split
  gsap.from(split.chars, {
    yPercent: 120,
    duration: 0.9,
    ease: EASE.quint,
    stagger: 0.02,
    scrollTrigger: { trigger, start },
  })
  return split
}
