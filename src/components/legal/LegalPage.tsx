import Link from 'next/link'
import { SITE } from '@/lib/company'
import { GROUP_LABEL, type LegalBlock, type LegalDoc, type LegalGroup } from '@/lib/legal-types'
import { LEGAL_DOCS } from '@/lib/legal'
import Cta from '@/components/ui/Cta'
import { T } from './LegalText'
import Pw from '@/components/ui/Pw'

// Pravne i servisne stranice: mirna stranica za čitanje. Naslov u sredini, jedna rečenica uvoda,
// pa jedan centriran stub teksta (~62 znaka u redu). Sadržaj (lijevo, sitno) samo na desktopu i samo
// kad je dokument dug. Header, podnožje i korpu daje (site) layout.

const MEASURE = 'mx-auto w-full max-w-[62ch]'

// Stranice sa radnjom: dugme vodi na kontakt u podnožju.
const CTA: Record<string, { label: string; href: string }> = {
  'upit-za-izvodjace': { label: 'Pošaljite upit', href: '/#kontakt' },
}

function Block({ b }: { b: LegalBlock }) {
  switch (b.t) {
    case 'p':
      return (
        <p className="mt-5">
          <T s={b.text} />
        </p>
      )
    case 'ul':
    case 'ol': {
      const Tag = b.t
      return (
        <Tag className={`mt-5 space-y-2 pl-5 ${b.t === 'ul' ? 'list-disc marker:text-signal' : 'list-decimal marker:text-ink/45'}`}>
          {b.items.map((it, i) => (
            <li key={i} className="pl-1">
              <T s={it} />
            </li>
          ))}
        </Tag>
      )
    }
    case 'dl':
      return (
        <dl className="mt-6 border-t border-ink/15 text-[0.94em]">
          {b.items.map((it) => (
            <div key={it.k} className="grid gap-1 border-b border-ink/15 py-3 sm:grid-cols-[38%_1fr] sm:gap-4">
              <dt className="text-ink/55">{it.k}</dt>
              <dd>
                <T s={it.v} />
              </dd>
            </div>
          ))}
        </dl>
      )
    case 'box':
      return (
        <div className="mt-7 rounded-[2px] bg-plate/60 px-6 py-6 md:px-8">
          {b.title && <p className="label text-ink/60">{b.title}</p>}
          <div className={`space-y-3 ${b.title ? 'mt-4' : ''}`}>
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
        <p className="mt-5 text-[0.85em] italic leading-[1.5] text-ink/55">
          <T s={b.text} />
        </p>
      )
  }
}

export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const cta = CTA[doc.slug]
  const long = doc.sections.length > 4

  return (
    <div className="legal-page px-5 pb-[18dvh] pt-[16dvh] md:px-10 md:pt-[20dvh]">
      <header className="text-center">
        <p className="label text-ink/50">{GROUP_LABEL[doc.group]}</p>
        <h1 className="display mx-auto mt-6 max-w-[14ch] text-[clamp(44px,7vw,120px)] [hyphens:auto]"><Pw>{doc.title}</Pw></h1>
      </header>
      <p className="mx-auto mt-8 max-w-[46ch] text-center text-[clamp(17px,1.35vw,21px)] italic leading-[1.45] text-ink/75">
        <T s={doc.lead} />
      </p>
      {cta && (
        <div className="mt-10 flex justify-center">
          <Cta href={cta.href} solid>
            {cta.label}
          </Cta>
        </div>
      )}

      <div className="relative mt-[12dvh] md:grid md:grid-cols-[1fr_minmax(0,62ch)_1fr] md:gap-x-12">
        {long && (
          <nav aria-label="Sadržaj stranice" className="hidden self-start text-[13px] md:sticky md:top-28 md:block md:max-w-[220px]">
            <p className="label text-ink/45">Sadržaj</p>
            <ul className="mt-4 space-y-2.5 text-ink/70">
              {doc.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="ulink leading-[1.35] transition-colors hover:text-ink">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className={`legal-copy ${MEASURE} md:col-start-2`}>
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 pt-12 first:pt-0">
              <h2 className="text-[clamp(24px,2vw,32px)] leading-[1.15] tracking-[-0.015em]">{s.title}</h2>
              {s.blocks.map((b, j) => (
                <Block key={j} b={b} />
              ))}
            </section>
          ))}

          {SITE.legalDraft && doc.group === 'pravno' && (
            <p className="mt-16 text-[13px] italic text-ink/45">
              Nacrt: tekst je predložak i treba ga pregledati pravnik prije objave. Istaknute oznake su podaci koje firma
              još treba da dopuni.
            </p>
          )}

          <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-ink/15 pt-6 text-[14px] text-ink/60">
            <span>Ažurirano {doc.updated}</span>
            <Link href="/sve-politike" className="ulink text-ink">
              Sve politike
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// /sve-politike: pregled svih stranica, grupisan — tihi spisak sa hover stanjem.
export function PoliciesIndex() {
  const groups = (['kupovina', 'pravno', 'usluge'] as LegalGroup[])
    .map((g) => ({ g, docs: LEGAL_DOCS.filter((d) => d.group === g) }))
    .filter(({ docs }) => docs.length)

  return (
    <div className="px-5 pb-[18dvh] pt-[16dvh] md:px-10 md:pt-[20dvh]">
      <header className="text-center">
        <h1 className="display text-[clamp(52px,9vw,150px)]"><Pw>
          Sve <em>politike</em>
        </Pw></h1>
        <p className="mx-auto mt-8 max-w-[40ch] text-[clamp(17px,1.35vw,21px)] italic text-ink/70">
          Dostava, povrat, plaćanje i uslovi — na jednom mjestu.
        </p>
      </header>

      <div className="mx-auto mt-[12dvh] max-w-[860px] space-y-20">
        {groups.map(({ g, docs }) => (
          <section key={g}>
            <h2 className="label text-center text-ink/45">{GROUP_LABEL[g]}</h2>
            <ul className="mt-6 border-t border-ink/15">
              {docs.map((d) => (
                <li key={d.slug} className="border-b border-ink/15">
                  <Link
                    href={`/${d.slug}`}
                    className="group flex items-baseline justify-between gap-6 py-5 transition-[padding] duration-500 ease-[var(--ease-out)] hover:pl-3"
                  >
                    <span className="text-[clamp(24px,2.6vw,40px)] leading-[1.05] tracking-[-0.02em] transition-[font-style] group-hover:italic">
                      {d.title}
                    </span>
                    <span
                      aria-hidden
                      className="size-2 shrink-0 self-center rounded-full bg-signal opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
