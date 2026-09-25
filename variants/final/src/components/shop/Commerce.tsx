'use client'

import CartDrawer from './CartDrawer'
import Panels from './Panels'
import QuickView from './QuickView'

// Overlays shared by every page: cart drawer (grand-maison), side panels (grand-root), quick view (grand-cipher).
export default function ShopOverlays() {
  return (
    <>
      <CartDrawer />
      <Panels />
      <QuickView />
    </>
  )
}
