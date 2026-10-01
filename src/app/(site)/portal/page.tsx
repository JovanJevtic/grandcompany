import type { Metadata } from 'next'
import PortalClient from '@/components/b2b/PortalClient'

export const metadata: Metadata = {
  title: 'B2B Partner Portal | Grand Company',
  description: 'Ugovoreni rabat, kreditni limit, odgođeno plaćanje i stanje zaliha za građevinske firme i izvođače.',
}

export default function PortalPage() {
  return <PortalClient />
}
