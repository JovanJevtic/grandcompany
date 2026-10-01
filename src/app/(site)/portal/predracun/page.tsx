import type { Metadata } from 'next'
import QuoteSheet from '@/components/b2b/QuoteSheet'

export const metadata: Metadata = {
  title: 'Predračun | Grand Company',
  robots: { index: false },
}

export default function QuotePage() {
  return <QuoteSheet />
}
