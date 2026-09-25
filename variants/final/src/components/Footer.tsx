import Link from 'next/link'
import { COMPANY } from '@/gc/gc'
import { LEGAL_DOCS } from '@/lib/legal'
import { NAV } from '@/lib/shop'
import { Logo } from './Header'

// Dark footer (deeper) as on Ponos/Drvex: company data, sections, legal pages from grand-root, demo note, photo credits.
export default function Footer() {
  const buying = LEGAL_DOCS.filter((d) => d.group === 'kupovina')
  const legal = LEGAL_DOCS.filter((d) => d.group !== 'kupovina')

  return (
    <footer id="kontakt" className="on-dark relative z-10 bg-deeper text-canvas">
      <div className="gutter wrap pb-10 pt-16 lg:pt-20">
        <div className="flex flex-col gap-8 border-b border-canvas/12 pb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <Logo />
            <p className="mt-6 max-w-[40ch] font-display text-[26px] font-medium leading-[1.15] tracking-[-0.02em] md:text-[32px]">
              Građevinski materijal, kranom do etaže.
            </p>
          </div>
          <a href={`mailto:${COMPANY.emailSales}`} className="btn-line self-start md:self-auto" style={{ ['--btn-gap' as string]: 'var(--deeper)' }}>
            Pišite prodaji <span aria-hidden>→</span>
          </a>
        </div>

        <div className="grid gap-10 py-12 text-[14px] sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1.2fr]">
          <div>
            <p className="eyebrow text-[10px] text-canvas/50">Kontakt</p>
            <address className="mt-4 flex flex-col gap-2 not-italic leading-[1.5]">
              <span>{COMPANY.address}</span>
              <a href={COMPANY.phoneLandlineHref} className="tnum hover:underline">
                Tel. {COMPANY.phoneLandline}
              </a>
              <a href={COMPANY.phoneMobileHref} className="tnum hover:underline">
                Mob. {COMPANY.phoneMobile}
              </a>
              <a href={`mailto:${COMPANY.emailInfo}`} className="hover:underline">
                {COMPANY.emailInfo}
              </a>
              <a href={`mailto:${COMPANY.emailSales}`} className="hover:underline">
                {COMPANY.emailSales}
              </a>
            </address>
          </div>
          <div>
            <p className="eyebrow text-[10px] text-canvas/50">Prodavnica</p>
            <ul className="mt-4 flex flex-col gap-2">
              {[{ id: 'katalog', label: 'Katalog' }, ...NAV.filter((n) => n.id !== 'kontakt'), { id: 'pitanja', label: 'Pitanja' }].map((n) => (
                <li key={n.id}>
                  <Link href={`/#${n.id}`} className="hover:underline">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-[10px] text-canvas/50">Kupovina</p>
            <ul className="mt-4 flex flex-col gap-2">
              {buying.map((d) => (
                <li key={d.slug}>
                  <Link href={`/${d.slug}`} className="hover:underline">
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-[10px] text-canvas/50">Pravno</p>
            <ul className="mt-4 flex flex-col gap-2">
              {legal.map((d) => (
                <li key={d.slug}>
                  <Link href={`/${d.slug}`} className="hover:underline">
                    {d.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/sve-politike" className="hover:underline">
                  Sve politike →
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-[10px] text-canvas/50">Firma</p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 tnum">
              <dt className="text-canvas/50">JIB</dt>
              <dd>{COMPANY.jib}</dd>
              <dt className="text-canvas/50">PIB</dt>
              <dd>{COMPANY.pib}</dd>
              <dt className="text-canvas/50">MBS</dt>
              <dd>{COMPANY.mbs}</dd>
              <dt className="text-canvas/50">Osnovana</dt>
              <dd>{COMPANY.founded}.</dd>
            </dl>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-canvas/12 pt-6 text-[12px] text-canvas/50 md:flex-row md:justify-between">
          <p>
            © {COMPANY.name} · Demo prodavnica: narudžbe i upiti se još ne šalju.
          </p>
          <p>Fotografije: Grand Company i Pexels</p>
        </div>
      </div>
    </footer>
  )
}
