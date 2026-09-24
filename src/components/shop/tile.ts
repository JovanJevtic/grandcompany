import { TILES } from '@/lib/content'

// Dok nema fotografija, artikal je siva ploča iz iste palete kao prsten u heroju.
export const tileBg = (i: number) => `linear-gradient(160deg, ${TILES[i].a}, ${TILES[i].b})`

const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Boja natpisa na ploči: crna na svijetloj, bijela na tamnoj (granica je tamo gdje su oba kontrasta jednaka).
export const tileInk = (i: number) => ((lum(TILES[i].a) + lum(TILES[i].b)) / 2 > 0.18 ? '#000' : '#fff')
