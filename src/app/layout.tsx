import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Splash from "@/components/Splash";

// latin-ext je obavezan za č, ć, š, đ, ž
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "latin-ext"],
});

// Mono za tehničke liste i oznake (SKU, sastav sistema, brojači), kao etikete na paleti.
const mono = JetBrains_Mono({
  variable: "--font-mono-src",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

// Display serif (italic) za kratke rečenice preko scene. Bodoni Moda je OFL —
// slobodna i za komercijalnu upotrebu; 72pt rez je namijenjen velikim veličinama.
// Završna rečenica na nebu: Prettywise Light (tanki display serif).
// PAŽNJA: ovo je DEMO verzija (licenca "Demo / Trial", bez č ć š đ ž) — prije objave treba
// kupiti licencu. Kvačice za š i ć se do tada dodaju posebno (vidi CraneHero).
const prettywise = localFont({
  src: [{ path: "./fonts/Prettywise-Light-DEMO.otf", weight: "300", style: "normal" }],
  variable: "--font-pretty",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

const displaySerif = localFont({
  src: [{ path: "./fonts/BodoniModa-SemiBoldItalic.ttf", weight: "600", style: "italic" }],
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const metadata: Metadata = {
  title: "GRAND COMPANY — Građevinski materijal, Banja Luka",
  description:
    "GRAND COMPANY d.o.o. iz Banje Luke: veleprodaja i maloprodaja građevinskog materijala, sistemi suhe gradnje i kamena vuna. Pristupačne cijene i stručan savjet.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bs" className={`${interTight.variable} ${mono.variable} ${displaySerif.variable} ${prettywise.variable} antialiased`}>
      <body>
        <SmoothScroll>
          {children}
          {/* Uvodni splash stoji iznad sajta dok se ne odigra (i ne skrola se dok traje). */}
          <Splash />
        </SmoothScroll>
      </body>
    </html>
  );
}
