import Constellation from "@/components/Constellation";
import Contact from "@/components/Contact";
import Loader from "@/components/Loader";
import Mark from "@/components/Mark";
import Nav from "@/components/Nav";
import ScrollFx from "@/components/ScrollFx";
import SmoothScroll from "@/components/SmoothScroll";
import CartDrawer from "@/components/shop/CartDrawer";
import Footer from "@/components/shop/Footer";
import Materials from "@/components/shop/Materials";
import Novo from "@/components/shop/Novo";
import Pricing from "@/components/shop/Pricing";
import QuickView from "@/components/shop/QuickView";
import Shop from "@/components/shop/Shop";
import ShopProvider from "@/components/shop/ShopProvider";
import Steps from "@/components/shop/Steps";

const FACTS = ["Veleprodaja i maloprodaja", "Sistemi suhe gradnje", "Kamena vuna", "Od 2012. u Banjoj Luci"];

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
          <ul className="grid grid-cols-2 gap-px border-t border-line bg-line md:grid-cols-4">
            {FACTS.map((t, i) => (
              <li key={t} data-reveal className="bg-bg px-5 pb-6 pt-5 md:pb-8">
                <span className="info text-dim">0{i + 1}</span>
                <p className="mt-10 max-w-[16ch] text-[clamp(20px,2vw,28px)] font-medium leading-[1.05] tracking-[-0.04em] md:mt-14">{t}</p>
              </li>
            ))}
          </ul>
          <Shop />
          <Novo />
          <Materials />
          <Pricing />
          <Steps />
          <Footer />
        </div>
      </main>
      <CartDrawer />
      <QuickView />
      <SmoothScroll />
      <ScrollFx />
    </ShopProvider>
  );
}
