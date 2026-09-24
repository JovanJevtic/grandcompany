import { COMPANY } from '@/lib/company'
import { FOOTER } from '@/lib/shop'
import FooterLinks from './FooterLinks'

// Podnožje: tamno, kao hero; kolone kao na referenci (prodavnica, podrška, pravno, usluge), podaci firme i
// džinovski naziv. Redovi firme koji nisu poznati (null u company.ts) se jednostavno preskaču.
export default function Footer() {
  const facts = [COMPANY.address, COMPANY.phone, COMPANY.email].filter(Boolean) as string[]

  return (
    <footer className="relative overflow-hidden bg-ink px-[var(--pad)] pb-[var(--pad)] pt-[6vw] text-bg max-md:pt-16">
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12">
        <div className="col-span-2 md:col-span-4">
          <p className="lbl">{COMPANY.legalName}</p>
          <p className="copy mt-5 max-w-[26ch] opacity-90">
            Veleprodaja i maloprodaja građevinskog materijala iz {COMPANY.city === 'Banja Luka' ? 'Banje Luke' : COMPANY.city}, od 2012. godine.
          </p>
          {facts.length > 0 && (
            <ul className="lbl mt-6 space-y-2 opacity-80">
              {facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
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
        className="mt-[7vw] select-none whitespace-nowrap font-serif uppercase leading-[0.82] tracking-[-0.01em] [font-size:clamp(40px,15.4vw,340px)] max-md:mt-14"
      >
        GRAND COMPANY
      </p>

      <div className="lbl mt-[3vw] flex flex-wrap justify-between gap-x-8 gap-y-3 border-t border-bg/30 pt-5 opacity-80 max-md:mt-8">
        <span>© 2026 {COMPANY.legalName}</span>
        <span>
          {COMPANY.city}, {COMPANY.country}
        </span>
        <span>Šifra djelatnosti {COMPANY.activityCode}</span>
      </div>
    </footer>
  )
}
