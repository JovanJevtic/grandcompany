import Footer from '@/components/Footer'
import CartDrawer from '@/components/shop/CartDrawer'
import SiteHeader from '@/components/site/SiteHeader'
import './site.css'

export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return <><SiteHeader variant="inner"/><main className="pt-16">{children}</main><Footer/><CartDrawer/></>
}
