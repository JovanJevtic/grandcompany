import Link from 'next/link'
import { SITE } from '@/lib/company'
import { GROUP_LABEL, type LegalBlock, type LegalDoc } from '@/lib/legal-types'
import { LEGAL_DOCS, legalBySlug } from '@/lib/legal'
import Cta from '@/components/ui/Cta'
import { T } from './LegalText'
import Pw, { pw } from '@/components/ui/Pw'

// Pravne i servisne stranice: mirna stranica za čitanje. Naslov u sredini, jedna rečenica uvoda,
// pa jedan centriran stub teksta (~62 znaka u redu). Sadržaj (lijevo, sitno) samo na desktopu i samo
// kad je dokument dug. Header, podnožje i korpu daje (site) layout.

const MEASURE = 'mx-auto w-full max-w-[62ch]'

// Stranice sa radnjom: dugme vodi na kontakt u podnožju.
const CTA: Record<string, { label: string; href: string }> = {
  'upit-za-izvodjace': { label: 'Upit', href: '/#kontakt' },
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
        <p className="mt-5 text-[0.85em] leading-[1.5] text-ink/55">
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
      <p className="mx-auto mt-8 max-w-[46ch] text-center text-[13px] leading-[1.45] text-ink/75">
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
              <h2 className="font-pretty text-[clamp(26px,2.2vw,36px)] leading-[1.15]">{pw(s.title)}</h2>
              {s.blocks.map((b, j) => (
                <Block key={j} b={b} />
              ))}
            </section>
          ))}

          {SITE.legalDraft && doc.group === 'pravno' && (
            <p className="mt-16 text-[13px] text-ink/45">
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

// /sve-politike: sve politike na jednoj stranici, jedna ispod druge — dostava na vrhu,
// pa povrat robe, načini plaćanja, uslovi kupovine i privatnost. Ostale pravne stranice
// ostaju dostupne preko pojedinačnih adresa i spiska na dnu.
const STACK = ['dostava', 'povrat-robe', 'nacini-placanja', 'uslovi-kupovine', 'politika-privatnosti']

export function PoliciesCombined() {
  const docs = STACK.map((s) => legalBySlug(s)).filter((d): d is LegalDoc => Boolean(d))
  const rest = LEGAL_DOCS.filter((d) => !STACK.includes(d.slug))
  const num = (i: number) => String(i + 1).padStart(2, '0')

  return (
    <div className="px-5 pb-[18dvh] pt-[16dvh] md:px-10 md:pt-[20dvh]">
      <header className="text-center">
        <p className="label text-ink/50">Informacije</p>
        <h1 className="display mx-auto mt-6 max-w-[14ch] text-[clamp(44px,7vw,120px)]">
          <Pw>Sve politike</Pw>
        </h1>
        <p className="mx-auto mt-8 max-w-[46ch] text-[13px] leading-[1.5] text-ink/75">
          Dostava, povrat robe, načini plaćanja, uslovi kupovine i privatnost — na jednom mjestu, jedna ispod druge.
        </p>
      </header>

      <nav aria-label="Na ovoj stranici" className="mx-auto mt-14 flex max-w-[860px] flex-wrap justify-center gap-x-7 gap-y-3 px-2">
        {docs.map((d, i) => (
          <a
            key={d.slug}
            href={`#${d.slug}`}
            className="ulink text-[13px] tracking-[0.02em] text-ink/70 transition-colors hover:text-ink"
          >
            <span className="mr-1.5 inline-block w-5 text-right tabular-nums text-signal">{num(i)}</span>
            {d.title}
          </a>
        ))}
      </nav>

      <main className="mt-[14vh]">
        {docs.map((d, i) => (
          <section
            key={d.slug}
            id={d.slug}
            aria-labelledby={`${d.slug}-title`}
            className={`scroll-mt-24 ${i > 0 ? 'mt-[16vh] border-t border-ink/10 pt-[10vh]' : ''}`}
          >
            <header className="text-center">
              <p className="label text-ink/50">{GROUP_LABEL[d.group]}</p>
              <h2 id={`${d.slug}-title`} className="display mx-auto mt-5 max-w-[14ch] text-[clamp(40px,6vw,96px)] [hyphens:auto]">
                <Pw>{d.title}</Pw>
              </h2>
              <p className="mx-auto mt-6 max-w-[46ch] text-[13px] leading-[1.45] text-ink/75">
                <T s={d.lead} />
              </p>
              <p className="mt-4 text-[11px] tracking-[0.08em] text-ink/40">Ažurirano {d.updated}</p>
            </header>

            <div className="legal-copy relative mt-[8vh] md:grid md:grid-cols-[1fr_minmax(0,62ch)_1fr] md:gap-x-12">
              <nav
                aria-label={`Sadržaj: ${d.title}`}
                className="hidden self-start text-[13px] md:sticky md:top-28 md:col-start-1 md:block md:max-w-[220px]"
              >
                <p className="label text-ink/45">Sadržaj</p>
                <ul className="mt-4 space-y-2.5 text-ink/70">
                  {d.sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${d.slug}__${s.id}`} className="ulink leading-[1.35] transition-colors hover:text-ink">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className={`${MEASURE} md:col-start-2`}>
                {d.sections.map((s) => (
                  <section key={s.id} id={`${d.slug}__${s.id}`} className="scroll-mt-28 pt-12 first:pt-0">
                    <h3 className="font-pretty text-[clamp(26px,2.2vw,36px)] leading-[1.15]">{pw(s.title)}</h3>
                    {s.blocks.map((b, j) => (
                      <Block key={j} b={b} />
                    ))}
                  </section>
                ))}
              </div>
            </div>
          </section>
        ))}

        {rest.length > 0 && (
          <section id="ostalo" className="mt-[16vh] border-t border-ink/10 pt-[10vh]">
            <h2 className="label text-center text-ink/45">Ostale stranice</h2>
            <ul className="mx-auto mt-6 max-w-[520px] space-y-3 text-center text-[15px]">
              {rest.map((d) => (
                <li key={d.slug}>
                  <Link href={`/${d.slug}`} className="ulink text-ink/75 transition-colors hover:text-ink">
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
