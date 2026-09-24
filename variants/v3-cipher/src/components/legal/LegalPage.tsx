import Link from 'next/link'
import { SITE } from '@/lib/company'
import { LEGAL_DOCS } from '@/lib/legal'
import { GROUP_LABEL, type LegalBlock, type LegalDoc, type LegalGroup } from '@/lib/legal-types'
import Footer from '@/components/shop/Footer'
import Ready from './Ready'
import { T } from './T'

// Pravne i servisne stranice (grand-root LegalPage), prebačene u grand-cipher jezik: crna podloga, veliki naslov
// srednje debljine sa kurzivom, sitne razmaknute oznake i tanke linije.

const COPY = 'mt-5 max-w-[62ch] text-[16px] leading-[1.65]'

function Block({ b }: { b: LegalBlock }) {
  switch (b.t) {
    case 'p':
      return (
        <p className={COPY}>
          <T s={b.text} />
        </p>
      )
    case 'ul':
    case 'ol': {
      const Tag = b.t
      return (
        <Tag className={`${COPY} space-y-2 pl-6 ${b.t === 'ul' ? 'list-disc' : 'list-decimal'} marker:text-dim`}>
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
        <dl className="mt-5 max-w-[62ch] border-t border-line">
          {b.items.map((it) => (
            <div key={it.k} className="grid grid-cols-[36%_1fr] gap-4 border-b border-line py-3">
              <dt className="info pt-[5px] leading-[1.4] text-dim">{it.k}</dt>
              <dd className="text-[15px] leading-[1.55]">
                <T s={it.v} />
              </dd>
            </div>
          ))}
        </dl>
      )
    case 'box':
      return (
        <div className="mt-6 max-w-[62ch] border border-line p-6">
          {b.title && <p className="info text-dim">{b.title}</p>}
          <div className={`space-y-3 text-[15px] leading-[1.6] ${b.title ? 'mt-4' : ''}`}>
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
        <p className="info mt-5 max-w-[62ch] leading-[1.5] text-dim">
          <T s={b.text} />
        </p>
      )
  }
}

function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[88px] items-start justify-between px-5 mix-blend-difference">
      <Link href="/" className="mt-[15px] text-[30px] font-medium lowercase leading-[48px] tracking-[-0.035em] text-fg">
        grand company
      </Link>
      <nav aria-label="Pravne stranice" className="info mt-[37px] flex gap-8 font-semibold text-fg">
        <Link href="/sve-politike" className="max-md:hidden hover:underline hover:underline-offset-4">
          Sve politike
        </Link>
        <Link href="/#ponuda" className="hover:underline hover:underline-offset-4">
          ← Prodavnica
        </Link>
      </nav>
    </header>
  )
}

function Title({ children }: { children: string }) {
  // posljednja riječ u kurzivu, kao u naslovima sekcija prodavnice
  const words = children.split(' ')
  const last = words.pop()
  return (
    <h1 className="display mt-[clamp(28px,5vw,72px)] text-[clamp(48px,9vw,160px)]">
      {words.length ? `${words.join(' ').toLowerCase()} ` : ''}
      <em>{last?.toLowerCase()}</em>.
    </h1>
  )
}

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <Ready />
      <Header />
      <main className="px-5 pb-[clamp(72px,9vw,160px)] pt-[calc(88px+clamp(40px,6vw,96px))]">
        <div className="info flex flex-wrap items-baseline gap-x-[6vw] gap-y-2 border-t border-line pt-4 text-dim">
          <span>{GROUP_LABEL[doc.group]}</span>
          <span>{doc.kicker}</span>
          <span className="ml-auto">Ažurirano: {doc.updated}</span>
        </div>

        <Title>{doc.title}</Title>

        <div className="mt-[clamp(40px,6vw,96px)] grid grid-cols-12 gap-x-5 gap-y-12">
          <div className="col-span-12 lg:col-span-4">
            <p className="max-w-[26ch] text-[clamp(20px,1.8vw,26px)] font-medium leading-[1.2] tracking-[-0.03em]">
              <T s={doc.lead} />
            </p>
            {doc.slug === 'upit-za-izvodjace' && (
              <Link href="/#upit" className="btn btn-solid mt-8">
                Pošalji upit →
              </Link>
            )}
            {SITE.legalDraft && (
              <p className="info mt-10 border-t border-line pt-4 leading-[1.6] text-dim">
                Nacrt: tekst je predložak i treba ga pregledati pravnik prije objave. Podaci u [zagradama] nisu poznati.
              </p>
            )}
            <nav aria-label="Sadržaj stranice" className="info mt-10 hidden border-t border-line pt-4 lg:sticky lg:top-[120px] lg:block">
              <ul className="space-y-3">
                {doc.sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="hover:underline hover:underline-offset-4">
                      {String(i + 1).padStart(2, '0')} · {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="col-span-12 lg:col-span-8">
            {doc.sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-[120px] border-t border-line pb-10 pt-5 first:border-t-0 first:pt-0">
                <h2 className="flex gap-4 text-[clamp(24px,2.2vw,34px)] font-medium leading-[1.1] tracking-[-0.04em]">
                  <span className="info pt-[0.7em] text-dim">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.title}</span>
                </h2>
                <div className="md:pl-9">
                  {s.blocks.map((b, j) => (
                    <Block key={j} b={b} />
                  ))}
                </div>
              </section>
            ))}
            <p className="info mt-6 border-t border-line pt-5">
              <Link href="/sve-politike" className="hover:underline hover:underline-offset-4">
                Sve politike →
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer page />
    </>
  )
}

// /sve-politike: pregled svih stranica, grupisan.
export function PoliciesIndex() {
  const groups = (['kupovina', 'pravno', 'usluge'] as LegalGroup[])
    .map((g) => ({ g, docs: LEGAL_DOCS.filter((d) => d.group === g) }))
    .filter((x) => x.docs.length)
  return (
    <>
      <Ready />
      <Header />
      <main className="px-5 pb-[clamp(72px,9vw,160px)] pt-[calc(88px+clamp(40px,6vw,96px))]">
        <div className="info flex items-baseline gap-[6vw] border-t border-line pt-4 text-dim">
          <span>Pravno</span>
          <span>Pregled</span>
        </div>
        <Title>Sve politike</Title>
        <div className="iso mt-[clamp(40px,6vw,96px)] space-y-14">
          {groups.map(({ g, docs }) => (
            <section key={g} className="grid grid-cols-12 gap-x-5 gap-y-4">
              <p className="info col-span-12 border-t border-line pt-4 text-dim md:col-span-3">{GROUP_LABEL[g]}</p>
              <ul className="col-span-12 md:col-span-9">
                {docs.map((d) => (
                  <li key={d.slug} className="iso-i border-t border-line first:border-t-0 md:first:border-t">
                    <Link href={`/${d.slug}`} className="group flex items-baseline justify-between gap-6 py-5">
                      <span className="text-[clamp(26px,3vw,48px)] font-medium leading-[1] tracking-[-0.045em] transition-transform duration-500 group-hover:translate-x-2">
                        {d.title}
                      </span>
                      <span className="info shrink-0 text-dim max-sm:hidden">{d.kicker} →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer page />
    </>
  )
}
