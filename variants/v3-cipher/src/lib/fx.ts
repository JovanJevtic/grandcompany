import { gsap, SplitText } from '@/lib/gsap'
import { EASE } from '@/lib/motion'

// Naslov izlazi red po red iz maske. `trigger` je element čiji dolazak u vidno polje pokreće animaciju
// (za naslove u pinovanim sekcijama to nije sam naslov, nego cijela sekcija).
export function revealLines(el: HTMLElement, trigger: Element = el, start = 'top 88%') {
  return SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true, // ponovo dijeli na redove kad se učitaju fontovi ili promijeni širina
    onSplit(self) {
      // maska bi inače odsjekla donje krakove slova (p, y, g) i kurziv, jer je red tijesan
      self.masks.forEach((m) => {
        const mask = m as HTMLElement
        mask.style.padding = '0 0.1em 0.16em 0'
        mask.style.margin = '0 -0.1em -0.16em 0'
      })
      return gsap.from(self.lines, {
        yPercent: 115,
        duration: 1.25,
        ease: EASE.expo,
        stagger: 0.1,
        scrollTrigger: { trigger, start, once: true },
      })
    },
  })
}
