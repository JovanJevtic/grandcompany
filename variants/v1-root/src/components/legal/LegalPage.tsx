import Link from 'next/link'
import { COLORS } from '@/lib/content'
import { SITE } from '@/lib/company'
import { GROUP_LABEL, type LegalBlock, type LegalDoc, type LegalGroup } from '@/lib/legal-types'
import { LEGAL_DOCS } from '@/lib/legal'
import Footer from '@/components/shop/Footer'
import ShopHeader from '@/components/shop/ShopHeader'
import { T } from '@/components/shop/parts'
import PanelButton from './PanelButton'

// Pravne i servisne stranice: isti jezik kao landing i prodavnica (krem pozadina, serif, uppercase oznake,
// džinovski naslov u akcentnoj boji), ali sa čitkim tamnim tekstom.

const GROUP_COLOR: Record<LegalGroup, string> = { kupovina: COLORS.connect, pravno: COLORS.why, usluge: COLORS.who }

// Stranice sa radnjom: dugme otvara panel (isti obrazac kao u prodavnici).
const CTA: Record<string, { label: string; kind: 'samples' | 'inquiry' }> = {
  'uzorci-materijala': { label: 'Zatraži uzorke', kind: 'samples' },
  'upit-za-izvodjace': { label: 'Pošalji upit', kind: 'inquiry' },
}

function Block({ b }: { b: LegalBlock }) {
  switch (b.t) {
    case 'p':
      return (
        <p className="copy mt-5 max-w-[62ch] text-ink">
          <T s={b.text} />
        </p>
      )
    case 'ul':
    case 'ol': {
      const Tag = b.t
      return (
        <Tag className={`copy mt-5 max-w-[62ch] space-y-2 pl-6 text-ink ${b.t === 'ul' ? 'list-disc' : 'list-decimal'}`}>
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
        <dl className="mt-5 max-w-[62ch] border-t border-ink/20">
          {b.items.map((it) => (
            <div key={it.k} className="grid grid-cols-[36%_1fr] gap-4 border-b border-ink/20 py-3">
              <dt className="lbl pt-[3px]" style={{ color: COLORS.base }}>
                {it.k}
              </dt>
              <dd className="copy text-ink">
                <T s={it.v} />
              </dd>
            </div>
          ))}
        </dl>
      )
    case 'box':
      return (
        <div className="mt-6 max-w-[62ch] border border-current p-6 text-ink">
          {b.title && <p className="lbl">{b.title}</p>}
          <div className={`copy space-y-3 ${b.title ? 'mt-4' : ''}`}>
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
        <p className="lbl mt-5 max-w-[62ch] leading-[1.4]" style={{ color: COLORS.base }}>
          <T s={b.text} />
        </p>
      )
  }
}

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const color = GROUP_COLOR[doc.group]
  const cta = CTA[doc.slug]

  return (
    <>
      <ShopHeader variant="page" />
      <main style={{ color, ['--acc' as string]: color }} className="px-[var(--pad)] pb-[9vw] pt-[calc(88px+6vw)] max-md:pt-[calc(88px+40px)]">
        <div className="lbl flex items-baseline gap-[6vw] border-t border-current pt-4 max-md:gap-6">
          <span>{GROUP_LABEL[doc.group]}</span>
          <span>{doc.kicker}</span>
          <span className="ml-auto">Ažurirano: {doc.updated}</span>
        </div>

        <h1 className="giant-v mt-[2.4vw] max-md:mt-4" style={{ fontSize: 'clamp(48px, 12.5vw, 240px)' }}>
          {doc.title}
        </h1>

        <div className="mt-[4vw] grid grid-cols-12 gap-x-6 gap-y-12 max-md:mt-10">
          <div className="col-span-12 md:col-span-4">
            <p className="copy-l max-w-[22ch]">
              <T s={doc.lead} />
            </p>
            {cta && (
              <PanelButton kind={cta.kind} className="pill pill-solid mt-8">
                {cta.label}
              </PanelButton>
            )}
            {SITE.legalDraft && doc.group === 'pravno' && (
              <p className="lbl mt-10 border-t border-current pt-4 leading-[1.5]">
                Nacrt: tekst je predložak i treba ga pregledati pravnik prije objave.
              </p>
            )}
            <nav aria-label="Sadržaj stranice" className="lbl mt-10 hidden border-t border-current pt-4 md:sticky md:top-[120px] md:block">
              <ul className="space-y-3">
                {doc.sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="link-u">
                      {String(i + 1).padStart(2, '0')} · {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="col-span-12 md:col-span-8">
            {doc.sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-[120px] border-t border-current pb-10 pt-5 first:border-t-0 first:pt-0">
                <h2 className="copy-l flex gap-4">
                  <span className="lbl pt-[0.9em]">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.title}</span>
                </h2>
                <div className="md:pl-9">
                  {s.blocks.map((b, j) => (
                    <Block key={j} b={b} />
                  ))}
                </div>
              </section>
            ))}
            <p className="lbl mt-6 border-t border-current pt-5">
              <Link href="/sve-politike" className="link-u">
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
      <ShopHeader variant="page" />
      <main style={{ color: COLORS.connect, ['--acc' as string]: COLORS.connect }} className="px-[var(--pad)] pb-[9vw] pt-[calc(88px+6vw)] max-md:pt-[calc(88px+40px)]">
        <div className="lbl flex items-baseline gap-[6vw] border-t border-current pt-4">
          <span>Pravno</span>
          <span>Pregled</span>
        </div>
        <h1 className="giant-v mt-[2.4vw] max-md:mt-4" style={{ fontSize: 'clamp(48px, 12.5vw, 240px)' }}>
          Sve politike
        </h1>
        <div className="mt-[5vw] space-y-14 max-md:mt-10">
          {groups.map(({ g, docs }) => (
            <section key={g} className="grid grid-cols-12 gap-x-6 gap-y-4">
              <p className="lbl col-span-12 border-t border-current pt-4 md:col-span-3">{GROUP_LABEL[g]}</p>
              <ul className="col-span-12 md:col-span-9">
                {docs.map((d) => (
                  <li key={d.slug} className="border-t border-current first:border-t-0 md:first:border-t">
                    <Link href={`/${d.slug}`} className="group flex items-baseline justify-between gap-6 py-4">
                      <span className="copy-l text-ink transition-transform duration-500 [transition-timing-function:var(--ease-expo)] group-hover:translate-x-2">{d.title}</span>
                      <span className="lbl shrink-0 max-sm:hidden">{d.kicker} →</span>
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
