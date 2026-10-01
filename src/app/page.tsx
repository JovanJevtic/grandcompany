import Footer from "@/components/Footer";
import CraneHero from "@/components/CraneHero";
import SiteChrome from "@/components/SiteChrome";
import HeroNav from "@/components/site/HeroNav";
import CartDrawer from "@/components/shop/CartDrawer";
import Panels from "@/components/shop/Panels";
import Kaolin from "@/components/shop/Kaolin";
import Bento from "@/components/landing/Bento";
import BrandsSplit from "@/components/landing/BrandsSplit";
import Delivery from "@/components/landing/Delivery";
import Detail from "@/components/landing/Detail";
import Featured from "@/components/landing/Featured";
import Intro from "@/components/landing/Intro";
import PostsTeaser from "@/components/landing/PostsTeaser";
import SkySwipe from "@/components/landing/SkySwipe";
import UsesSplit from "@/components/landing/UsesSplit";

// Početna, editorijalno: hero sa kranom, kaolin, pa kratak niz sekcija koje se smjenjuju
// fotografija / crtež / fotografija. Svaka sekcija ima jedan naslov i najviše jednu rečenicu.
// Kalkulator zida je u prodavnici (/prodavnica#kalkulator).
export default function Home() {
  return (
    <>
      <SiteChrome />
      {/* Traka-navigacija: ispod wordmarka tokom herosa, poslije zalijepljena za vrh. */}
      <HeroNav />
      <main>
        <CraneHero />
        <SkySwipe />
        <Kaolin />
        <Intro />
        <UsesSplit />
        <Featured />
        <Delivery />
        <Detail />
        <BrandsSplit />
        <Bento />
        <PostsTeaser />
        <Footer />
      </main>
      <CartDrawer />
      <Panels />
    </>
  );
}
