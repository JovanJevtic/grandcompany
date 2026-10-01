import Footer from "@/components/Footer";
import CraneHero from "@/components/CraneHero";
import SiteChrome from "@/components/SiteChrome";
import SiteHeader from "@/components/site/SiteHeader";
import CartDrawer from "@/components/shop/CartDrawer";
import Panels from "@/components/shop/Panels";
import LoginModal from "@/components/b2b/LoginModal";
import Bento from "@/components/landing/Bento";
import BrandsSplit from "@/components/landing/BrandsSplit";
import Delivery from "@/components/landing/Delivery";
import Featured from "@/components/landing/Featured";
import Intro from "@/components/landing/Intro";
import StepBand from "@/components/ui/StepBand";
import Partners from "@/components/landing/Partners";
import PostsTeaser from "@/components/landing/PostsTeaser";
import SkySwipe from "@/components/landing/SkySwipe";
import UsesSplit from "@/components/landing/UsesSplit";

// Početna hibridne B2B + B2C platforme (glavni naglasak B2B). Sadržaj isključivo iz dokumentacije
// firme (PDF "Kompletna dokumentacija i katalog"). Kalkulator je u prodavnici (/prodavnica#kalkulator).
export default function Home() {
  return (
    <>
      <SiteChrome />
      {/* Navbar: tokom herosa ispod velikog wordmarka; kad se hero pređe, wordmark se smanji u logo
          u sredini navbara, a navbar ostaje zalijepljen za vrh. */}
      <SiteHeader variant="home" />
      {/* home-flow: velik razmak između sekcija (globals.css) */}
      <main className="home-flow">
        <CraneHero />
        <SkySwipe />
        {/* B2B prvo: ko smo → sistemi → B2B portal → prednosti (kran, Knauf, Pantheon, atesti) →
            rabatna skala → artikli na stanju → isporuka kranom → vodiči */}
        <Intro />
        <UsesSplit />
        <Bento />
        <BrandsSplit />
        {/* Stepenasti prelaz (pravougaonici) u plavu sekciju i nazad */}
        <StepBand tone="navy" profile="diag" steps={12} aria-label="Rabatna skala">
          <Partners />
        </StepBand>
        <Featured />
        <Delivery />
        <StepBand tone="navy" profile="valley" steps={11} aria-label="Vodiči">
          <PostsTeaser />
        </StepBand>
        <Footer />
      </main>
      <CartDrawer />
      <Panels />
      <LoginModal />
    </>
  );
}
