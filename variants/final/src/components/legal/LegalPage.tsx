import Link from 'next/link'
import { SITE } from '@/lib/company'
import { GROUP_LABEL, type LegalBlock, type LegalDoc, type LegalGroup } from '@/lib/legal-types'
import { LEGAL_DOCS } from '@/lib/legal'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import ShopOverlays from '@/components/shop/Commerce'
import { T } from './LegalText'

// Legal and service pages from grand-root (LegalPage + PoliciesIndex), in the house style:
// canvas ground, Montserrat 500 title in sentence case, Instrument Sans body, hairlines.

const COPY = 'text-[16px] leading-[1.65]'

const CTA: Record<string, { label: string; href: string }> = {
  'upit-za-izvodjace': { label: 'Pošaljite upit', href: '/#upit' },
}

function Block({ b }: { b: LegalBlock }) {
  switch (b.t) {
    case 'p':
      return (
        <p className={`${COPY} mt-4 max-w-[64ch]`}>
          <T s={b.text} />
        </p>
      )
    case 'ul':
    case 'ol': {
      const Tag = b.t
      return (
        <Tag className={`${COPY} mt-4 max-w-[64ch] space-y-1.5 pl-5 ${b.t === 'ul' ? 'list-disc' : 'list-decimal'}`}>
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
        <dl className="mt-4 max-w-[64ch] border-t border-ink/12">
          {b.items.map((it) => (
            <div key={it.k} className="grid grid-cols-[38%_1fr] gap-4 border-b border-ink/12 py-3">
              <dt className="text-[14px] text-muted">{it.k}</dt>
              <dd className="text-[15px] leading-[1.6]">
                <T s={it.v} />
              </dd>
            </div>
          ))}
        </dl>
      )
    case 'box':
      return (
        <div className="mt-5 max-w-[64ch] bg-surface p-6">
          {b.title && <p className="eyebrow text-[10px] text-muted">{b.title}</p>}
          <div className={`${COPY} space-y-3 ${b.title ? 'mt-3' : ''}`}>
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
        <p className="mt-4 max-w-[64ch] text-[13px] leading-[1.6] text-muted">
          <T s={b.text} />
        </p>
      )
  }
}

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const cta = CTA[doc.slug]

  return (
    <>
      <Header variant="page" />
      <main className="gutter wrap pb-20 pt-[calc(var(--header)+48px)] lg:pb-28 lg:pt-[calc(var(--header)+72px)]">
        <p className="text-[13px] text-muted">
          <Link href="/sve-politike" className="hover:underline">
            {GROUP_LABEL[doc.group]}
          </Link>{' '}
          · {doc.kicker} · Ažurirano {doc.updated}
        </p>
        <h1 className="mt-4 font-display text-[clamp(36px,5vw,68px)] font-medium leading-[1.02] tracking-[-0.03em]">{doc.title}</h1>

        <div className="mt-10 grid grid-cols-12 gap-x-8 gap-y-10 lg:mt-14">
          <div className="col-span-12 md:col-span-4">
            <p className="max-w-[36ch] text-[17px] leading-[1.55]">
              <T s={doc.lead} />
            </p>
            {cta && (
              <Link href={cta.href} className="btn-solid mt-6">
                {cta.label} <span aria-hidden>→</span>
              </Link>
            )}
            {SITE.legalDraft && doc.group === 'pravno' && (
              <p className="mt-8 border-t border-ink/12 pt-4 text-[13px] leading-[1.6] text-muted">
                Nacrt: tekst je predložak i treba ga pregledati pravnik prije objave. Oznake u tamnom polju su podaci koje
                firma još treba da dopuni.
              </p>
            )}
            <nav
              aria-label="Sadržaj stranice"
              className="mt-8 hidden border-t border-ink/12 pt-4 text-[14px] md:sticky md:top-[calc(var(--header)+24px)] md:block"
            >
              <ul className="space-y-2.5">
                {doc.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-muted transition-colors hover:text-ink">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="col-span-12 md:col-span-8">
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-[calc(var(--header)+24px)] border-t border-ink/12 pb-10 pt-6">
                <h2 className="s-sub">{s.title}</h2>
                {s.blocks.map((b, j) => (
                  <Block key={j} b={b} />
                ))}
              </section>
            ))}
            <p className="border-t border-ink/12 pt-5 text-[14px]">
              <Link href="/sve-politike" className="link-u">
                Sve politike →
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <ShopOverlays />
    </>
  )
}

// /sve-politike: overview of all pages, grouped.
export function PoliciesIndex() {
  const groups = (['kupovina', 'pravno', 'usluge'] as LegalGroup[]).map((g) => ({
    g,
    docs: LEGAL_DOCS.filter((d) => d.group === g),
  }))
  return (
    <>
      <Header variant="page" />
      <main className="gutter wrap pb-20 pt-[calc(var(--header)+48px)] lg:pb-28 lg:pt-[calc(var(--header)+72px)]">
        <p className="text-[13px] text-muted">{LEGAL_DOCS.length} stranica</p>
        <h1 className="mt-4 font-display text-[clamp(36px,5vw,68px)] font-medium leading-[1.02] tracking-[-0.03em]">Sve politike</h1>
        <div className="mt-12 space-y-12">
          {groups.map(({ g, docs }) => (
            <section key={g} className="grid grid-cols-12 gap-x-8 gap-y-3">
              <h2 className="eyebrow col-span-12 pt-4 text-[10px] text-muted md:col-span-3">{GROUP_LABEL[g]}</h2>
              <ul className="col-span-12 border-t border-ink/12 md:col-span-9">
                {docs.map((d) => (
                  <li key={d.slug} className="border-b border-ink/12">
                    <Link href={`/${d.slug}`} className="group flex items-baseline justify-between gap-6 py-4 transition-opacity hover:opacity-70">
                      <span className="s-sub">{d.title}</span>
                      <span className="shrink-0 text-[13px] text-muted max-sm:hidden">{d.kicker} →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
      <ShopOverlays />
    </>
  )
}
