import Constellation from "@/components/Constellation";
import Contact from "@/components/Contact";
import Loader from "@/components/Loader";
import Mark from "@/components/Mark";
import Nav from "@/components/Nav";
import ScrollFx from "@/components/ScrollFx";
import SmoothScroll from "@/components/SmoothScroll";
import Bundles from "@/components/shop/Bundles";
import CartDrawer from "@/components/shop/CartDrawer";
import Categories from "@/components/shop/Categories";
import Delivery from "@/components/shop/Delivery";
import Faq from "@/components/shop/Faq";
import Footer from "@/components/shop/Footer";
import ListDrawer from "@/components/shop/ListDrawer";
import Materials from "@/components/shop/Materials";
import Novo from "@/components/shop/Novo";
import Pricing from "@/components/shop/Pricing";
import Promises from "@/components/shop/Promises";
import QuickView from "@/components/shop/QuickView";
import Quote from "@/components/shop/Quote";
import Shop from "@/components/shop/Shop";
import ShopProvider from "@/components/shop/ShopProvider";
import Steps from "@/components/shop/Steps";
import Toast from "@/components/shop/Toast";
import UseCases from "@/components/shop/UseCases";

export default function Home() {
  return (
    <ShopProvider>
      <main>
        <Loader />
        <Constellation />
        <Contact />
        <Nav />
        {/* znak u sredini; ploče prolaze ispod njega */}
        <Mark className="mark pointer-events-none fixed left-1/2 top-[49.7%] z-[36] w-[41px] -translate-x-1/2 -translate-y-1/2 text-fg" />

        {/* Hero je fiksan sloj; ovaj prazan blok drži prvi ekran, a prodavnica se preko njega navlači kao zavjesa. */}
        <div aria-hidden className="h-svh" />
        <div className="relative z-[38] bg-bg">
          <Promises />
          <Categories />
          <Shop />
          <Novo />
          <Bundles />
          <UseCases />
          <Materials />
          <Pricing />
          <Delivery />
          <Steps />
          <Faq />
          <Quote />
          <Footer />
        </div>
      </main>
      <CartDrawer />
      <ListDrawer />
      <QuickView />
      <Toast />
      <SmoothScroll />
      <ScrollFx />
    </ShopProvider>
  );
}
