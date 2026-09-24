import Catalog from './Catalog'
import Footer from './Footer'
import Newsletter from './Newsletter'
import { ByUse, Materials, NewArrivals, ShopIntro } from './Sections'
import { Delivery, Faq, Pricing } from './Sections2'

// Prodavnica: jedna okomita stranica ispod landinga. Redoslijed prati referencu:
// uvod → novo → katalog → po radovima → materijali → cijene → dostava → pitanja → prijava → podnožje.
export default function Shop() {
  return (
    <div data-shop>
      <ShopIntro />
      <NewArrivals />
      <Catalog />
      <ByUse />
      <Materials />
      <Pricing />
      <Delivery />
      <Faq />
      <Newsletter />
      <Footer />
    </div>
  )
}
