import Bundles from './Bundles'
import Catalog from './Catalog'
import Footer from './Footer'
import MostChosen from './MostChosen'
import Quote from './Quote'
import { ByUse, CategoryTiles, Hero, Materials, ShopIntro } from './Sections'
import { Delivery, Faq, Pricing } from './Sections2'

// Prodavnica: jedna okomita stranica. Redoslijed po Korvae / Kora referencama:
// hero → obećanja → grupe → najčešće birano → katalog → kompleti → radovi → materijali → cijene → dostava
// → pitanja → ponuda → podnožje.
export default function Shop() {
  return (
    <div data-shop>
      <Hero />
      <ShopIntro />
      <CategoryTiles />
      <MostChosen />
      <Catalog />
      <Bundles />
      <ByUse />
      <Materials />
      <Pricing />
      <Delivery />
      <Faq />
      <Quote />
      <Footer />
    </div>
  )
}
