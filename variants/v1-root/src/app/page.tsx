import { Boxed, Caption, Chapter, IntroA, IntroB, Media, TextLarge } from "@/components/Blocks";
import Chrome from "@/components/Chrome";
import Connect from "@/components/Connect";
import Cursor from "@/components/Cursor";
import GridGallery from "@/components/GridGallery";
import HashScroll from "@/components/HashScroll";
import Hero from "@/components/Hero";
import Menu from "@/components/Menu";
import Motion from "@/components/Motion";
import Preloader from "@/components/Preloader";
import Shop from "@/components/shop/Shop";
import ShopHeader from "@/components/shop/ShopHeader";
import { COLORS } from "@/lib/content";

export default function Home() {
  return (
    <>
      <Preloader />
      <Cursor />
      <Chrome />
      <Menu />
      <ShopHeader />

      <main>
        {/* LANDING. Desktop: jedan ekran u kojem se vodoravna traka pomjera uz okomiti skrol (pin, vidi Motion.tsx).
            Mobilni: obični vertikalni tok. */}
        <div data-landing className="md:h-dvh md:overflow-hidden">
          <div data-strip className="flex will-change-transform max-md:flex-col md:h-dvh md:w-max">
            <Hero />

            {/* 01 — ZAŠTO */}
            <Chapter id="why" color={COLORS.why}>
              <IntroA
                word="Poglavlje"
                no="001"
                title="Zašto"
                label="Pristupačne cijene i stručan savjet"
                tones={[0, 3]}
                text={
                  <>
                    GRAND COMPANY je <em>preduzeće za veleprodaju i maloprodaju građevinskog materijala</em> iz Banje
                    Luke, koje kupcu nudi pristupačne cijene i stručan savjet.
                  </>
                }
              />
              <Media tone={2} />
              <Caption
                tone={4}
                shifted
                label="Stručan tim uz robu"
                text={
                  <>
                    Uz robu stoji stručni tim koji{" "}
                    <em>odgovara na pitanja i pomaže pri izboru materijala</em>, kako bi pravi izbor bio lak i za
                    običnog investitora, a ne samo za velike izvođače radova.
                  </>
                }
              />
              <Boxed tone={1} />
            </Chapter>

            {/* 02 — KO */}
            <Chapter id="who" color={COLORS.who}>
              <IntroB
                words={["Poglavlje", "002", "Dva"]}
                title="Ko"
                label="Vlasnik i direktor: Predrag Uzelac"
                text={
                  <>
                    GRAND COMPANY d.o.o. za usluge i trgovinu iz Banje Luke posluje od 23. aprila 2012. godine, dakle
                    više od trinaest godina. Našu osnovnu djelatnost čini trgovina na veliko drvom, građevinskim
                    materijalom i sanitarnom opremom.
                  </>
                }
              />
              <Media tone={5} />
              <Caption
                wide
                tone={3}
                label="Od 2012. u Banjoj Luci"
                text={
                  <>
                    Poslujemo u veleprodaji i u maloprodaji. Naš najveći oslonac su zadovoljni klijenti koji nas
                    preporučuju dalje.
                  </>
                }
              />
              <Media tone={0} side="right" />
              <Caption
                shifted
                tone={2}
                label="Naša djelatnost"
                text={
                  <>
                    Registrovana osnovna djelatnost je <em>trgovina na veliko drvom, građevinskim materijalom i
                    sanitarnom opremom</em> (šifra G 46.73).
                  </>
                }
              />
              <Boxed tone={4} />
            </Chapter>

            {/* 03 — ŠTA */}
            <Chapter id="what" color={COLORS.what}>
              <IntroA
                word="Poglavlje"
                no="003"
                title="Šta"
                label="Tri glavne grupe ponude"
                tones={[5, 1]}
                text={
                  <>
                    Naša ponuda je organizovana oko tri grupe:{" "}
                    <em>građevinski materijal, sistemi suhe gradnje i kamena vuna</em>. Uz to su u našoj djelatnosti i
                    drvo i sanitarna oprema.
                  </>
                }
              />
              <Media tone={0} />
              <Caption
                shifted
                tone={3}
                label="Građevinski materijal"
                text={
                  <>
                    Opšta prodaja materijala za gradnju i opremanje objekata,{" "}
                    <em>za privatne kupce i za izvođače radova</em>.
                  </>
                }
              />
              <Boxed tone={2} />
              <TextLarge label="Suha gradnja i izolacija">
                <p>
                  <em>Sistemi suhe gradnje</em> obuhvataju materijale za građenje i uređenje enterijera suhim
                  postupkom, što se vidi i po našoj galeriji na portalu Moja djelatnost.
                </p>
                <p>
                  <em>Kamena vuna</em> je izolacioni materijal koji prodajemo kao zaseban proizvod, uz stručan savjet
                  pri izboru.
                </p>
              </TextLarge>
              <GridGallery />
            </Chapter>

            {/* 04 — KAKO */}
            <Chapter id="how" color={COLORS.how}>
              <IntroB
                words={["Poglavlje", "004", "Četiri"]}
                title="Kako"
                label="Naš pristup"
                text={
                  <>
                    Kupcu nudimo pristupačne cijene i stručan savjet. Uz robu stoji stručni tim koji odgovara na
                    pitanja i pomaže pri izboru materijala, pa ono što nudimo treba da bude dostupno i običnom
                    investitoru, a ne samo velikim izvođačima.
                  </>
                }
              />
              <Media tone={4} />
              <Caption
                wide
                tone={1}
                label="Stručan savjet"
                text={
                  <>
                    Naš stručni tim odgovara na pitanja i pomaže pri izboru materijala, za privatne kupce i za
                    izvođače radova.
                  </>
                }
              />
              <Media tone={5} side="right" />
              <Caption
                shifted
                tone={0}
                label="Pristupačne cijene"
                text={
                  <>
                    Cilj nam je da ono što nudimo bude <em>dostupno i običnom investitoru</em>, a ne samo velikim
                    izvođačima.
                  </>
                }
              />
              <Boxed tone={3} />
              <TextLarge label="Zadovoljni klijenti">
                <p>
                  Sebe opisujemo kao <em>jednu od vodećih firmi u Banjoj Luci</em> u prodaji građevinskog materijala.
                </p>
                <p>Naš najveći oslonac su zadovoljni klijenti koji nas preporučuju dalje.</p>
              </TextLarge>
              <Media tone={2} />
              <Caption
                tone={5}
                label="Veleprodaja i maloprodaja"
                text={
                  <>
                    Poslujemo u veleprodaji i u maloprodaji, od 2012. godine.
                  </>
                }
              />
            </Chapter>

            {/* 05 — KONTAKT */}
            <Connect />
          </div>
        </div>

        {/* 06 — PRODAVNICA: okomiti tok ispod landinga */}
        <Shop />
      </main>

      <Motion />
      <HashScroll />
    </>
  );
}
