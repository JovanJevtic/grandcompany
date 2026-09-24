import { COLORS } from '@/lib/content'
import { COMPANY } from '@/lib/company'
import { CRANE_RECOMMEND_OVER_KG } from '@/gc/gc'
import { DELIVERY, DELIVERY_STEPS, FAQ, FREE_DELIVERY_OVER, PAYMENTS, TIERS, formatNumber, formatPrice } from '@/lib/shop'
import ShopLink from './ShopLink'
import { Photo, Section, SectionHead, T } from './parts'

// Dio 2: cijene, dostava, pitanja (server-komponente).

// 008 — Cijene i uslovi: nivoi partnera (maloprodaja i tri nivoa rabata).
export function Pricing() {
  const rows: { row: string; get: (t: (typeof TIERS)[number]) => string }[] = [
    { row: 'Ko', get: (t) => t.who },
    { row: 'Rabat na katalog', get: (t) => t.price },
    { row: 'Kreditni limit', get: (t) => t.limit },
    { row: 'Plaćanje', get: (t) => t.days },
  ]
  return (
    <Section id="cijene" color={COLORS.connect}>
      <SectionHead no="008" side="Cijene i uslovi" title="Cijene" />
      <p data-reveal className="copy-l mt-[3vw] max-w-[30ch] max-md:mt-6">
        Katalog važi za sve. Ugovorni partneri dobijaju rabat, kreditni limit i <em>valutu do 90 dana</em>.
      </p>

      <div data-reveal className="mt-[5vw] grid gap-px border border-current bg-current max-md:mt-10 md:grid-cols-2 xl:grid-cols-4">
        {TIERS.map((t) => (
          <article
            key={t.no}
            className="flex flex-col bg-bg p-[2.2vw] max-md:p-6"
            style={t.featured ? { background: COLORS.connect, color: 'var(--bg)' } : { color: COLORS.connect }}
          >
            <p className="lbl flex justify-between">
              <span>{t.no}</span>
              {t.featured && <span>Srednje firme</span>}
            </p>
            <h3 className="mt-[5vw] font-serif leading-[0.95] tracking-[-0.01em] [font-size:clamp(38px,4vw,70px)] max-md:mt-12">{t.name}</h3>
            <p className="copy-l mt-6">{t.price}</p>
            <p className="copy mt-3">{t.who}</p>
            <ul className="mt-8 flex-1 border-t border-current pt-6">
              {[t.limit, t.days].map((f) => (
                <li key={f} className="copy flex gap-3 py-1.5">
                  <span aria-hidden className="lbl pt-[0.6em]">
                    ✓
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <ShopLink
              href={t.href}
              className="pill mt-10 self-start"
              style={t.featured ? ({ ['--acc' as string]: 'var(--bg)', ['--pfg' as string]: COLORS.connect } as React.CSSProperties) : undefined}
            >
              {t.cta} →
            </ShopLink>
          </article>
        ))}
      </div>

      {/* poređenje nivoa */}
      <div data-reveal className="mt-[6vw] overflow-x-auto text-ink max-md:mt-14">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr style={{ color: COLORS.connect }}>
              <th className="lbl w-[20%] pb-4 font-normal">Poređenje</th>
              {TIERS.map((t) => (
                <th key={t.no} className="lbl pb-4 font-normal">
                  {t.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.row} className="border-t" style={{ borderColor: COLORS.connect }}>
                <th className="copy py-4 pr-4 font-normal">{r.row}</th>
                {TIERS.map((t) => (
                  <td key={t.no} className="copy py-4 pr-4">
                    {r.get(t)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* načini plaćanja */}
      <div className="mt-[6vw] max-md:mt-14">
        <p data-reveal className="lbl border-t border-current pt-4">
          Načini plaćanja
        </p>
        <ul className="mt-6 grid gap-x-6 gap-y-8 md:grid-cols-3">
          {PAYMENTS.map((p, i) => (
            <li key={p.title} data-reveal style={{ ['--i' as string]: i }}>
              <p className="copy-l">{p.title}</p>
              <p className="copy mt-3 text-ink">{p.text}</p>
            </li>
          ))}
        </ul>
        <p data-reveal className="mt-8">
          <ShopLink href="/nacini-placanja" className="lbl link-u">
            Više o plaćanju →
          </ShopLink>
        </p>
      </div>
    </Section>
  )
}

// 009 — Dostava: zone, standardna dostava i kamion sa kranom.
export function Delivery() {
  return (
    <Section id="dostava" color={COLORS.why}>
      <SectionHead no="009" side="Kako roba stiže" title="Dostava" />

      <div className="mt-[5vw] grid grid-cols-12 gap-x-6 gap-y-10 max-md:mt-10">
        <div className="col-span-12 md:col-span-5">
          <p data-reveal className="copy-l max-w-[22ch]">
            Standardno do adrese ili <em>kranom na etažu</em>, našim kamionima.
          </p>
          <p data-reveal className="copy mt-6 max-w-[40ch] text-ink">
            Standardna dostava je besplatna za narudžbe preko {formatPrice(FREE_DELIVERY_OVER)}. Za isporuke teže od{' '}
            {formatNumber(CRANE_RECOMMEND_OVER_KG)} kg preporučujemo kamion sa kranom. Kran se obračunava kao prevoz plus istovar.
          </p>
        </div>
        <figure className="col-span-12 md:col-span-6 md:col-start-7">
          <Photo src="/photos/kran-utovar.jpg" alt="Naš kamion sa kranom podiže paletu" className="aspect-[16/10]" />
          <figcaption className="lbl mt-3">Utovar palete kranom, naše stovarište</figcaption>
        </figure>
      </div>

      {/* cjenovnik po zonama */}
      <div data-reveal className="mt-[6vw] overflow-x-auto text-ink max-md:mt-14">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr style={{ color: COLORS.why }}>
              <th className="lbl w-[28%] pb-4 font-normal">Zona</th>
              <th className="lbl pb-4 font-normal">Standardna dostava</th>
              <th className="lbl pb-4 font-normal">Kamion sa kranom, prevoz</th>
              <th className="lbl pb-4 font-normal">Istovar kranom</th>
              <th className="lbl pb-4 font-normal">Kran ukupno</th>
            </tr>
          </thead>
          <tbody>
            {DELIVERY.map((z) => (
              <tr key={z.id} className="border-t" style={{ borderColor: COLORS.why }}>
                <th className="copy py-4 pr-4 font-normal">{z.label}</th>
                <td className="copy py-4 pr-4">{formatPrice(z.standard)}</td>
                <td className="copy py-4 pr-4">{formatPrice(z.kranTransport)}</td>
                <td className="copy py-4 pr-4">{formatPrice(z.kranWork)}</td>
                <td className="copy py-4 pr-4">{formatPrice(z.kranTransport + z.kranWork)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="lbl mt-4" style={{ color: COLORS.base }}>
          Cijene sa PDV-om. Standardna dostava besplatna preko {formatPrice(FREE_DELIVERY_OVER)}; kran se uvijek obračunava. Dalje od 50 km cijenu šaljemo uz predračun.
        </p>
      </div>

      <ol className="mt-[6vw] grid gap-x-6 gap-y-10 max-md:mt-14 md:grid-cols-3">
        {DELIVERY_STEPS.map((s, i) => (
          <li key={s.no} data-reveal style={{ ['--i' as string]: i }} className="border-t border-current pt-4">
            <p className="lbl">{s.no}</p>
            <p className="giant-v mt-[3vw] max-md:mt-6" style={{ fontSize: 'clamp(56px, 9vw, 160px)' }}>
              {s.no}
            </p>
            <h3 className="copy-l mt-6">{s.title}</h3>
            <p className="copy mt-3 max-w-[32ch] text-ink">{s.text}</p>
          </li>
        ))}
      </ol>

      <p data-reveal className="mt-8">
        <ShopLink href="/dostava" className="lbl link-u">
          Uslovi dostave →
        </ShopLink>
      </p>
    </Section>
  )
}

// 010 — Česta pitanja
export function Faq() {
  return (
    <Section id="pitanja" color={COLORS.who}>
      <SectionHead no="010" side="Česta pitanja" title="Pitanja" />

      <div className="mt-[4vw] grid grid-cols-12 gap-x-6 gap-y-10 max-md:mt-8">
        <div className="col-span-12 md:col-span-4">
          <p data-reveal className="copy-l max-w-[18ch]">
            Ne nalazite odgovor? Pozovite prodaju.
          </p>
          <div data-reveal className="mt-6 flex flex-wrap gap-3">
            {COMPANY.phoneHref && (
              <a href={COMPANY.phoneHref} className="pill">
                {COMPANY.phone}
              </a>
            )}
            <ShopLink href="/#ponuda" className="pill">
              Zatražite ponudu
            </ShopLink>
          </div>
        </div>

        <div className="col-span-12 border-b border-current md:col-span-8">
          {FAQ.map((f, i) => (
            <details key={f.q} data-reveal style={{ ['--i' as string]: 0 }} className="border-t border-current" name="faq">
              <summary className="flex items-center justify-between gap-6 py-6">
                <span className="lbl w-8 shrink-0">0{i + 1}</span>
                <span className="copy-l flex-1 text-ink">{f.q}</span>
                <span className="plus shrink-0" aria-hidden />
              </summary>
              <div className="pb-8 pl-14 max-md:pl-0">
                <p className="copy max-w-[56ch] text-ink">
                  <T s={f.a} />
                </p>
                {f.link && (
                  <p className="mt-5">
                    <ShopLink href={f.link.href} className="lbl link-u">
                      {f.link.label} →
                    </ShopLink>
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}
