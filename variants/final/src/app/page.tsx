import About from '@/components/About'
import Footer from '@/components/Footer'
import Gallery from '@/components/Gallery'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Brands from '@/components/shop/Brands'
import Bundles from '@/components/shop/Bundles'
import Calculator from '@/components/shop/Calculator'
import ShopOverlays from '@/components/shop/Commerce'
import Delivery from '@/components/shop/Delivery'
import Faq from '@/components/shop/Faq'
import NewArrivals from '@/components/shop/NewArrivals'
import Pricing from '@/components/shop/Pricing'
import Quote from '@/components/shop/Quote'
import Shop from '@/components/shop/Shop'
import TrustStrip from '@/components/shop/TrustStrip'
import UseCases from '@/components/shop/UseCases'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <NewArrivals />
        <Shop />
        <Calculator />
        <Bundles />
        <UseCases />
        <Services />
        <About />
        <Delivery />
        <Pricing />
        <Gallery />
        <Brands />
        <Faq />
        <Quote />
      </main>
      <Footer />
      <ShopOverlays />
    </>
  )
}
