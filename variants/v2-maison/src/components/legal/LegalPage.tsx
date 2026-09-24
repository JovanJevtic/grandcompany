import Link from 'next/link'
import { SITE } from '@/lib/company'
import { GROUP_LABEL, type LegalBlock, type LegalDoc, type LegalGroup } from '@/lib/legal-types'
import { LEGAL_DOCS } from '@/lib/legal'
import Footer from '@/components/Footer'
import { T } from './LegalText'

// Pravne i servisne stranice iz grand-root (LegalPage + PoliciesIndex), obučene u jezik grand-maison:
// krem podloga, linije od 2px, džinovski uppercase naslov, a sam tekst u normalnom pismu da bude čitak.

const COPY = 'text-[clamp(15px,1.1vw,18px)] font-medium normal-case leading-[1.5]'

// Stranice sa radnjom: dugme vodi na formu za upit u prodavnici.
const CTA: Record<string, { label: string; href: string }> = {
  'upit-za-izvodjace': { label: 'Pošaljite upit', href: '/#ponuda' },
}

function Block({ b }: { b: LegalBlock }) {
  switch (b.t) {
    case 'p':
      return (
        <p className={`${COPY} mt-5 max-w-[62ch]`}>
          <T s={b.text} />
        </p>
      )
    case 'ul':
    case 'ol': {
      const Tag = b.t
      return (
        <Tag className={`${COPY} mt-5 max-w-[62ch] space-y-2 pl-6 ${b.t === 'ul' ? 'list-[square]' : 'list-decimal'}`}>
          {b.items.map((it, i) => (
            <li key={i}>
              <T s={it} />
            </li>
          ))}
        </Tag>
      )
    }
    case 'dl':
      return (
        <dl className="mt-5 max-w-[62ch] border-t-2 border-ink">
          {b.items.map((it) => (
            <div key={it.k} className="grid grid-cols-[38%_1fr] gap-4 border-b border-ink/25 py-3">
              <dt className="pt-[3px] text-micro uppercase text-ink/60">{it.k}</dt>
              <dd className={COPY}>
                <T s={it.v} />
              </dd>
            </div>
          ))}
        </dl>
      )
    case 'box':
      return (
        <div className="mt-6 max-w-[62ch] border-2 border-ink p-6">
          {b.title && <p className="text-micro uppercase">{b.title}</p>}
          <div className={`${COPY} space-y-3 ${b.title ? 'mt-4' : ''}`}>
            {b.lines.map((l, i) => (
              <p key={i}>
                <T s={l} />
              </p>
            ))}
          </div>
        </div>
      )
    case 'note':
      return (
        <p className="mt-5 max-w-[62ch] text-micro uppercase leading-[1.4] text-ink/60">
          <T s={b.text} />
        </p>
      )
  }
}

// Traka na vrhu pravnih stranica, u obliku ShopBar-a iz grand-maison.
function LegalBar() {
  return (
    <div className="sticky top-0 z-50 flex h-[var(--bar)] items-stretch border-b-2 border-ink bg-bg text-micro uppercase">
      <Link href="/" className="flex shrink-0 items-center border-r-2 border-ink px-4 transition-colors duration-300 hover:bg-ink hover:text-bg md:px-[3.05vw]">
        Grand Company
      </Link>
      <Link href="/sve-politike" className="flex items-center px-4 transition-colors duration-300 hover:bg-ink/10 md:px-5">
        Sve politike
      </Link>
      <Link
        href="/#prodavnica"
        className="ml-auto flex shrink-0 items-center gap-2 border-l-2 border-ink px-4 transition-colors duration-300 hover:bg-ink hover:text-bg md:px-[3.05vw]"
      >
        Prodavnica <span aria-hidden>→</span>
      </Link>
    </div>
  )
}

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const cta = CTA[doc.slug]

  return (
    <>
      <LegalBar />
      <main className="gutter relative z-30 bg-bg pb-[14dvh] pt-[8dvh]">
        <div className="flex items-baseline justify-between gap-4 border-t-2 border-ink pt-3 text-micro uppercase">
          <span>{GROUP_LABEL[doc.group]}</span>
          <span className="max-sm:hidden">{doc.kicker}</span>
          <span className="text-right">Ažurirano: {doc.updated}</span>
        </div>

        <h1 className="mt-[5dvh] text-[clamp(40px,8vw,150px)] uppercase leading-[0.92] [overflow-wrap:anywhere]">{doc.title}</h1>

        <div className="mt-[7dvh] grid grid-cols-12 gap-x-[1.5vw] gap-y-12">
          <div className="col-span-12 md:col-span-4">
            <p className="max-w-[30ch] text-small uppercase">
              <T s={doc.lead} />
            </p>
            {cta && (
              <Link
                href={cta.href}
                className="mt-8 inline-flex items-center gap-6 bg-ink px-4 py-4 text-micro uppercase text-bg transition-opacity duration-300 hover:opacity-85"
              >
                {cta.label} <span aria-hidden>→</span>
              </Link>
            )}
            {SITE.legalDraft && doc.group === 'pravno' && (
              <p className="mt-10 border-t-2 border-ink pt-4 text-micro uppercase leading-[1.4]">
                Nacrt: tekst je predložak i treba ga pregledati pravnik prije objave. Oznake u tamnom polju su
                podaci koje firma još treba da dopuni.
              </p>
            )}
            <nav aria-label="Sadržaj stranice" className="mt-10 hidden border-t-2 border-ink pt-4 text-micro uppercase md:sticky md:top-[calc(var(--bar)+24px)] md:block">
              <ul className="space-y-3">
                {doc.sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="underline-offset-4 hover:underline">
                      {String(i + 1).padStart(2, '0')} · {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="col-span-12 md:col-span-8">
            {doc.sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-[calc(var(--bar)+24px)] border-t-2 border-ink pb-10 pt-5"
              >
                <h2 className="flex gap-4 text-small uppercase">
                  <span className="tabular-nums text-ink/60">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.title}</span>
                </h2>
                <div className="md:pl-9">
                  {s.blocks.map((b, j) => (
                    <Block key={j} b={b} />
                  ))}
                </div>
              </section>
            ))}
            <p className="mt-6 border-t-2 border-ink pt-5 text-micro uppercase">
              <Link href="/sve-politike" className="underline underline-offset-4">
                Sve politike →
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// /sve-politike: pregled svih stranica, grupisan.
export function PoliciesIndex() {
  const groups = (['kupovina', 'pravno', 'usluge'] as LegalGroup[]).map((g) => ({
    g,
    docs: LEGAL_DOCS.filter((d) => d.group === g),
  }))
  return (
    <>
      <LegalBar />
      <main className="gutter relative z-30 bg-bg pb-[14dvh] pt-[8dvh]">
        <div className="flex items-baseline justify-between gap-4 border-t-2 border-ink pt-3 text-micro uppercase">
          <span>Pravno</span>
          <span>Pregled</span>
          <span>{LEGAL_DOCS.length} stranica</span>
        </div>
        <h1 className="mt-[5dvh] text-[clamp(40px,8vw,150px)] uppercase leading-[0.92]">Sve politike</h1>
        <div className="mt-[7dvh] space-y-14">
          {groups.map(({ g, docs }) => (
            <section key={g} className="grid grid-cols-12 gap-x-[1.5vw] gap-y-4">
              <p className="col-span-12 border-t-2 border-ink pt-3 text-micro uppercase md:col-span-3">{GROUP_LABEL[g]}</p>
              <ul className="col-span-12 border-t-2 border-ink md:col-span-9">
                {docs.map((d) => (
                  <li key={d.slug} className="border-b border-ink/25">
                    <Link
                      href={`/${d.slug}`}
                      className="group flex items-baseline justify-between gap-6 px-1 py-4 uppercase transition-colors duration-300 hover:bg-ink hover:text-bg"
                    >
                      <span className="text-[clamp(22px,2.6vw,44px)] leading-[0.95]">{d.title}</span>
                      <span className="shrink-0 text-micro max-sm:hidden">{d.kicker} →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
