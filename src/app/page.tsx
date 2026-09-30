import Footer from "@/components/Footer";
import CraneHero from "@/components/CraneHero";
import SiteChrome from "@/components/SiteChrome";
import SiteHeader from "@/components/site/SiteHeader";
import CartDrawer from "@/components/shop/CartDrawer";
import Panels from "@/components/shop/Panels";
import Pricing from "@/components/shop/Pricing";
import CraneBand from "@/components/landing/CraneBand";
import Featured from "@/components/landing/Featured";
import PostsTeaser from "@/components/landing/PostsTeaser";
import SkySwipe from "@/components/landing/SkySwipe";
import UsesSplit from "@/components/landing/UsesSplit";
import WallBuilder from "@/components/landing/WallBuilder";

// Početna: hero sa kranom, pa se nebo "obriše" bijelim stepenicama i počinje prodavnica.
// Sekcije se smjenjuju svijetlo / tamno plavo (stepenaste trake), kao na referencama.
export default function Home() {
  return (
    <>
      <SiteChrome />
      {/* Meni i korpa se pojavljuju tek kad veliki wordmark ode (vidi SiteChrome i globals.css). */}
      <div data-overlay-header>
        <SiteHeader variant="overlay" />
      </div>
      <main>
        <CraneHero />
        <SkySwipe />
        <UsesSplit />
        <Featured />
        <CraneBand />
        <WallBuilder />
        <PostsTeaser />
        <div className="relative z-20 bg-bg">
          <Pricing />
        </div>
        <Footer />
      </main>
      <CartDrawer />
      <Panels />
    </>
  );
}
