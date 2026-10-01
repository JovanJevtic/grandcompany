import { Suspense } from 'react'
import CatalogClient from '@/components/catalog/CatalogClient'
import WallCalculator from '@/components/shop/WallCalculator'
import Pw from '@/components/ui/Pw'

export const metadata = {
  title: 'Katalog | Grand Company',
  description: 'Građevinski materijal: suha gradnja, izolacija, veziva i oprema.',
}

// Prodavnica: naslov u sredini, četiri grupe kao fotografije, tihi filteri, mreža artikala,
// a na dnu kalkulator zida.
export default function CataloguePage() {
  return (
    <>
      <header className="gutter pb-[10vh] pt-[16vh] text-center">
        <h1 className="display fade-up text-display"><Pw>
          Kata<em>log</em>
        </Pw></h1>
        <p className="fade-up mx-auto mt-8 max-w-[34ch] text-[clamp(17px,1.3vw,21px)] leading-snug opacity-70" style={{ animationDelay: '0.12s' }}>
          Materijal za zid, plafon, fasadu i pod — na stanju u Banjoj Luci.
        </p>
      </header>

      <Suspense fallback={<div className="min-h-screen" />}>
        <CatalogClient />
      </Suspense>

      <div className="mt-[16vh] border-t border-ink/15">
        <WallCalculator />
      </div>
    </>
  )
}
