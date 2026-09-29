import Footer from "@/components/Footer";
import CraneHero from "@/components/CraneHero";
import Manifest from "@/components/Manifest";
import Projects from "@/components/Projects";
import Services from "@/components/Services";
import Commerce from "@/components/shop/Commerce";
import SiteChrome from "@/components/SiteChrome";

export default function Home() {
  return (
    <>
      <SiteChrome />
      <main>
        <CraneHero />
        <Services />
        <Manifest />
        <Projects />
        <Commerce />
        <Footer />
      </main>
    </>
  );
}
