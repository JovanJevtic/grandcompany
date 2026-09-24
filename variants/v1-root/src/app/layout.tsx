import type { Metadata } from "next";
import { Inter_Tight, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Panels from "@/components/shop/Panels";
import Reveal from "@/components/shop/Reveal";
import ShopProvider from "@/components/shop/ShopProvider";

// Argumenti next/font moraju biti doslovne vrijednosti (ne mogu se slagati iz promjenljivih).
// latin-ext je obavezan za č, ć, š, đ, ž.

// Naslovi i tekst: uska serifna sa kurzivom (jedna porodica, dosljedan ton).
const serif = Instrument_Serif({
  variable: "--f-serif",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
});
// Oznake i navigacija.
const sans = Inter_Tight({ variable: "--f-sans", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Grand Company — suha gradnja, izolacija i fasade, Banja Luka",
  description:
    "Grand Company d.o.o. Banja Luka: Knauf ploče i profili, kamena vuna i stiropor, ljepila, mase i vijci. Zalihe iz Pantheona, istovar kranom na etažu, plaćanje do 90 dana za ugovorne partnere.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bs" className={`${serif.variable} ${sans.variable} antialiased`}>
      <body>
        <SmoothScroll>
          {/* Prodavnica (korpa, paneli) je dostupna na svim stranicama: i na početnoj i na pravnim. */}
          <ShopProvider>
            {children}
            <Panels />
            <Reveal />
          </ShopProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
