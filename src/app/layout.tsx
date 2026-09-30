import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Splash from "@/components/Splash";

// latin-ext je obavezan za č, ć, š, đ, ž
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "latin-ext"],
});

// Display serif (italic) za kratke rečenice preko scene. Bodoni Moda je OFL —
// slobodna i za komercijalnu upotrebu; 72pt rez je namijenjen velikim veličinama.
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
    <html lang="bs" className={`${interTight.variable} ${displaySerif.variable} antialiased`}>
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
