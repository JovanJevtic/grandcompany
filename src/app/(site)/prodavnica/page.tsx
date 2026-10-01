import { Suspense } from 'react'
import CatalogClient from '@/components/catalog/CatalogClient'
import BrandStory from '@/components/shop/BrandStory'
import Pw from '@/components/ui/Pw'

export const metadata = {
  title: 'Katalog | Grand Company',
  description: 'Građevinski materijal: suha gradnja, izolacija, veziva i oprema.',
}

// Prodavnica: naslov u sredini, četiri grupe kao okrugle fotografije, podijeljeni uvod,
// "Najprodavanije" (mreža sa tankim linijama), pa brend i "Sa gradilišta".
export default function CataloguePage() {
  return (
    <>
      <header className="gutter pb-[10vh] pt-[16vh] text-center">
        <h1 className="display fade-up text-display"><Pw>
          Kata<em>log</em>
        </Pw></h1>
        <p className="fade-up mx-auto mt-8 max-w-[34ch] text-[13px] leading-snug opacity-70" style={{ animationDelay: '0.12s' }}>
          Materijal za zid, plafon, fasadu i pod — na stanju u Banjoj Luci.
        </p>
      </header>

      <Suspense fallback={<div className="min-h-screen" />}>
        <CatalogClient />
      </Suspense>


      <BrandStory />
      <div aria-hidden className="h-[22vh]" />
    </>
  )
}
