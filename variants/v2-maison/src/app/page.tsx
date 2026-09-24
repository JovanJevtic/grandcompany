import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
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
        <Hero />
        <Services />
        <Manifest />
        <Projects />
        <Commerce />
        <Footer />
      </main>
    </>
  );
}
