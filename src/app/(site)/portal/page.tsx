import type { Metadata } from 'next'
import PortalApp from '@/components/portal/PortalApp'

export const metadata: Metadata = {
  title: 'B2B portal | Grand Company',
  description: 'Katalog sa vašim rabatom, W111 kalkulator materijala, narudžba sa dostavom kamionom sa kranom, kreditni limit i fakture — za građevinske firme i izvođače.',
}

export default function PortalPage() {
  return <PortalApp />
}
