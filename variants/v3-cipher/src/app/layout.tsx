import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif, Rubik_Mono_One } from "next/font/google";
import "./globals.css";

// Argumenti next/font moraju biti doslovne vrijednosti. latin-ext je obavezan za č, ć, š, đ, ž.
const sans = Instrument_Sans({ variable: "--f-sans", subsets: ["latin", "latin-ext"] });
// Kurziv je za istaknutu riječ u velikim naslovima prodavnice.
const serif = Instrument_Serif({ variable: "--f-serif", subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"] });
// Široki, teški font za oznaku klijenta u donjem desnom uglu.
const mono = Rubik_Mono_One({ variable: "--f-mono", subsets: ["latin", "latin-ext"], weight: "400" });

export const metadata: Metadata = {
  title: "GRAND COMPANY — Građevinski materijal, Banja Luka",
  description:
    "GRAND COMPANY d.o.o. iz Banje Luke: veleprodaja i maloprodaja građevinskog materijala, sistemi suhe gradnje i kamena vuna. Od 2012. godine.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bs" className={`${sans.variable} ${serif.variable} ${mono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
