import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Splash from "@/components/Splash";

// latin-ext je obavezan za č, ć, š, đ, ž
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "GRAND COMPANY — Građevinski materijal, Banja Luka",
  description:
    "GRAND COMPANY d.o.o. iz Banje Luke: veleprodaja i maloprodaja građevinskog materijala, sistemi suhe gradnje i kamena vuna. Pristupačne cijene i stručan savjet.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bs" className={`${interTight.variable} antialiased`}>
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
