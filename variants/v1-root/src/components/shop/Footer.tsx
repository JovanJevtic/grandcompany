import { COMPANY } from '@/lib/company'
import { FOOTER } from '@/lib/shop'
import FooterLinks from './FooterLinks'

// Podnožje: tamno; kolone (prodavnica, podrška, pravno, usluge), kontakt i matični podaci firme i
// džinovski naziv. Redovi firme koji nisu poznati (null u company.ts) se jednostavno preskaču.
export default function Footer() {
  const contacts = [
    COMPANY.phone && COMPANY.phoneHref ? { label: `Tel. ${COMPANY.phone}`, href: COMPANY.phoneHref } : null,
    COMPANY.mobile && COMPANY.mobileHref ? { label: `Mob. ${COMPANY.mobile}`, href: COMPANY.mobileHref } : null,
    COMPANY.email ? { label: COMPANY.email, href: `mailto:${COMPANY.email}` } : null,
    COMPANY.emailSales ? { label: COMPANY.emailSales, href: `mailto:${COMPANY.emailSales}` } : null,
  ].filter((c): c is { label: string; href: string } => c !== null)
  const ids = [
    COMPANY.jib && `JIB ${COMPANY.jib}`,
    COMPANY.vat && `PDV ${COMPANY.vat}`,
    COMPANY.court,
  ].filter(Boolean) as string[]

  return (
    <footer className="relative overflow-hidden bg-ink px-[var(--pad)] pb-[var(--pad)] pt-[6vw] text-bg max-md:pt-16">
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12">
        <div className="col-span-2 md:col-span-4">
          <p className="lbl">{COMPANY.legalName}</p>
          <p className="copy mt-5 max-w-[30ch] opacity-90">
            Suha gradnja, izolacija, veziva i pribor, uz dostavu kranom. Veleprodaja i maloprodaja iz Banje Luke, od 2012.
            godine.
          </p>
          {COMPANY.address && <p className="copy mt-5 opacity-90">{COMPANY.address}</p>}
          <ul className="lbl mt-6 space-y-2.5">
            {contacts.map((c) => (
              <li key={c.href}>
                <a href={c.href} className="link-u normal-case">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {FOOTER.map((col) => (
          <nav key={col.title} aria-label={col.title} className="md:col-span-2">
            <p className="lbl border-t border-bg/30 pt-4 opacity-70">{col.title}</p>
            <FooterLinks links={col.links} />
          </nav>
        ))}
      </div>

      <p
        aria-hidden
        className="mt-[7vw] select-none whitespace-nowrap font-serif uppercase leading-[0.82] tracking-[-0.01em] [font-size:clamp(36px,15.4vw,340px)] max-md:mt-14 max-md:text-[13.2vw]"
      >
        GRAND COMPANY
      </p>

      <div className="lbl mt-[3vw] flex flex-wrap justify-between gap-x-8 gap-y-3 border-t border-bg/30 pt-5 opacity-80 max-md:mt-8">
        <span>© 2026 {COMPANY.legalName}</span>
        <span>
          {COMPANY.city}, {COMPANY.country}
        </span>
        {ids.map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
    </footer>
  )
}
