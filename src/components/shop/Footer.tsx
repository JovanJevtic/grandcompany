import Link from 'next/link'
import { COMPANY } from '@/lib/company'
import { LEGAL_DOCS } from '@/lib/legal'
import { CATS } from '@/lib/shop'
import { CategoryButton, ContactButton, TopButton } from './Actions'
import SectionHead from './SectionHead'

const LINKS = [
  ['Ponuda', '#ponuda'],
  ['Najčešće birano', '#birano'],
  ['Kompleti', '#kompleti'],
  ['Cijene i uslovi', '#cijene'],
  ['Dostava', '#dostava'],
  ['Pitanja', '#pitanja'],
  ['Zatražite ponudu', '#upit'],
]

const link = 'hover:underline hover:underline-offset-4'

// Podnožje (grand-cipher Footer) sa podacima firme iz kataloga i linkovima na pravne stranice (iz grand-root).
// Redovi koji nisu poznati (null u company.ts) se preskaču. Na pravnim stranicama (`page`) sidra vode na početnu.
export default function Footer({ page = false }: { page?: boolean }) {
  const to = (hash: string) => (page ? `/${hash}` : hash)
  const legal = LEGAL_DOCS.filter((d) => d.group !== 'usluge')
  const ids: [string, string | null][] = [
    ['JIB', COMPANY.jib],
    ['PIB', COMPANY.vat],
    ['Registracija', COMPANY.court],
  ]

  return (
    <footer id="kontakt" className="overflow-hidden border-t border-line px-5 pt-[clamp(72px,11vw,176px)]">
      <SectionHead
        no="12 / 12"
        eyebrow="Kontakt"
        title={
          <>
            trebate ponudu za <em>cijeli objekat</em>?
          </>
        }
        intro="Pošaljite nam predmjer ili listu materijala, a mi ćemo pripremiti ponudu sa stanjem i terminom istovara."
      />

      <div data-reveal className="mt-10 flex flex-wrap gap-3">
        {page ? (
          <Link href="/#upit" className="btn btn-solid">
            Zatraži ponudu
          </Link>
        ) : (
          <ContactButton className="btn btn-solid">Otvori kontakt</ContactButton>
        )}
        {COMPANY.phone && (
          <a href={COMPANY.phoneHref} className="btn">
            {COMPANY.phone}
          </a>
        )}
      </div>

      <div data-reveal className="mt-[clamp(56px,8vw,120px)] grid grid-cols-2 gap-x-5 gap-y-10 border-t border-line pt-8 md:grid-cols-4">
        <div className="info col-span-2 leading-[1.9] md:col-span-1">
          <p className="text-dim">Firma</p>
          <p className="mt-3">{COMPANY.legalName}</p>
          {COMPANY.address && <p>{COMPANY.address}</p>}
          {COMPANY.phone && (
            <p>
              <a href={COMPANY.phoneHref} className={link}>
                Tel. {COMPANY.phone}
              </a>
            </p>
          )}
          {COMPANY.mobile && (
            <p>
              <a href={COMPANY.mobileHref} className={link}>
                Mob. {COMPANY.mobile}
              </a>
            </p>
          )}
          {COMPANY.email && (
            <p className="normal-case">
              <a href={`mailto:${COMPANY.email}`} className={link}>
                {COMPANY.email}
              </a>
            </p>
          )}
          {COMPANY.emailSales && (
            <p className="normal-case">
              <a href={`mailto:${COMPANY.emailSales}`} className={link}>
                {COMPANY.emailSales}
              </a>
            </p>
          )}
          <p className="mt-3 text-dim">
            {ids
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <span key={k} className="block">
                  {k} {v}
                </span>
              ))}
          </p>
        </div>
        <div className="info leading-[1.9]">
          <p className="text-dim">Ponuda</p>
          <ul className="mt-3">
            {CATS.map((c) => (
              <li key={c.id}>
                {page ? (
                  <Link href="/#kategorije" className={`uppercase ${link}`}>
                    {c.name}
                  </Link>
                ) : (
                  <CategoryButton cat={c.id} className={`uppercase ${link}`}>
                    {c.name}
                  </CategoryButton>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-dim">Na stranici</p>
          <ul className="mt-3">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <a href={to(href)} className={link}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Kupovina i pravno" className="info leading-[1.9]">
          <p className="text-dim">Kupovina i pravno</p>
          <ul className="mt-3">
            {legal.map((d) => (
              <li key={d.slug}>
                <Link href={`/${d.slug}`} className={link}>
                  {d.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/sve-politike" className={link}>
                Sve politike →
              </Link>
            </li>
          </ul>
        </nav>
        <div className="info leading-[1.9]">
          <p className="text-dim">Izvođačima</p>
          <ul className="mt-3">
            <li>
              <Link href="/upit-za-izvodjace" className={link}>
                Upit za izvođače i projekte
              </Link>
            </li>
            <li>
              <a href={to('#cijene')} className={link}>
                Nivoi partnera
              </a>
            </li>
          </ul>
          <p className="mt-8 text-dim">Vlasnik i direktor</p>
          <p className="mt-3">{COMPANY.director}</p>
          <p>Poslujemo od {COMPANY.founded}</p>
        </div>
      </div>

      <p
        aria-hidden
        className="mt-[clamp(56px,8vw,120px)] select-none whitespace-nowrap text-center font-medium lowercase leading-[0.82] tracking-[-0.07em] text-[clamp(48px,14.4vw,300px)]"
      >
        grand company
      </p>

      <div className="info flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-6 pt-8 text-dim">
        <span>© {new Date().getFullYear()} {COMPANY.legalName}</span>
        <span>Demo prodavnica: narudžbe i upiti se ne šalju. Cijene i stanje su iz demo kataloga.</span>
        {page ? (
          <Link href="/" className="uppercase text-fg">
            Na početnu ↑
          </Link>
        ) : (
          <TopButton className="uppercase text-fg">Nazad na vrh ↑</TopButton>
        )}
      </div>
    </footer>
  )
}
