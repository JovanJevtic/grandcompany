import Footer from '@/components/Footer'
import LoginModal from '@/components/b2b/LoginModal'
import CartDrawer from '@/components/shop/CartDrawer'
import Panels from '@/components/shop/Panels'
import SiteHeader from '@/components/site/SiteHeader'
import './site.css'

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <SiteHeader variant="inner" />
      <main className="pt-[calc(var(--nav-h)+var(--nav-inset)+8px)]">{children}</main>
      <Footer />
      <CartDrawer />
      {/* Obavijest "dodato u korpu" i bočni paneli (isto kao na početnoj) */}
      <Panels />
      <LoginModal />
    </>
  )
}
