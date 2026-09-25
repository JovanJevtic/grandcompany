import type { Metadata } from 'next'
import { Instrument_Sans, Montserrat, Pinyon_Script } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'

// latin-ext is required for č, ć, š, đ, ž
const montserrat = Montserrat({ variable: '--font-montserrat', subsets: ['latin', 'latin-ext'], weight: ['500', '900'] })
const pinyon = Pinyon_Script({ variable: '--font-pinyon', subsets: ['latin', 'latin-ext'], weight: '400' })
const instrument = Instrument_Sans({ variable: '--font-instrument', subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  title: 'Grand Company — građevinski materijal, Banja Luka',
  description:
    'Grand Company d.o.o. Banja Luka: Knauf suha gradnja, kamena i staklena vuna, stiropor, ljepila i pribor. Istovar kranom na etažu. Demo prodavnica.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="bs" className={`${montserrat.variable} ${pinyon.variable} ${instrument.variable} antialiased`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
