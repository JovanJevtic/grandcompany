import type { Metadata } from "next";
import { Barlow_Condensed, Bodoni_Moda, Inter, Inter_Tight, Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import ImageWarmup from "@/components/ImageWarmup";
import Splash from "@/components/Splash";
import Cursor from "@/components/Cursor";

// Jedan serif za cijeli sajt (editorijalni stil, srodan tankom serifu iz herosa).
// Varijabilan sa osom optičke veličine: na 14px su crte deblje i čitljive, na 140px tanke i elegantne.
// latin-ext je obavezan za č, ć, š, đ, ž.
const serif = Bodoni_Moda({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

// Tekstni sans: sve osim naslova (opisi, oznake, meni, cijene) — uvijek u verzalu (globals.css).
// Inter je širok i miran, bez "uskog" karaktera; latin-ext zbog č ć š đ ž.
const sans = Inter({
  variable: "--font-text",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

// Naslovi: debeli geometrijski sans (korporativni stil), uvijek verzal. Prettywise ostaje samo za logotip.
const heavy = Montserrat({
  variable: "--font-heavy",
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800", "900"],
});

// Navbar: zbijeni masni verzal (ćelije trake, preklopnik, Kupuj).
const condensed = Barlow_Condensed({
  variable: "--font-cond",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
});

// Debeli grotesk za sitne oznake u verzalu (hero, bento kartice) — kontrast tankom Prettywise-u.
const grotesk = Inter_Tight({
  variable: "--font-grotesk",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700", "800"],
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

const MOTION_FLAG = "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.setAttribute('data-motion','')"

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bs" className={`${serif.variable} ${sans.variable} ${heavy.variable} ${grotesk.variable} ${condensed.variable} ${displaySerif.variable} ${prettywise.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Prije prvog crtanja: elementi koji izranjaju na skrol odmah su sakriveni (ne bljesnu pa nestanu). */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_FLAG }} />
      </head>
      <body>
        <SmoothScroll>
          {children}
          {/* Uvodni splash stoji iznad sajta dok se ne odigra (i ne skrola se dok traje). */}
          <Splash />
          <Cursor />
        </SmoothScroll>
        <ImageWarmup />
      </body>
    </html>
  );
}
