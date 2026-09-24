import { COLORS } from '@/lib/content'
import { DELIVERY_FACTS, DELIVERY_STEPS, FAQ, PAYMENTS, TIERS, TIER_TABLE } from '@/lib/shop'
import ShopLink from './ShopLink'
import { Section, SectionHead, T } from './parts'

// Dio 2: cijene, dostava, pitanja (server-komponente).

// 06.5 — Cijene i uslovi
export function Pricing() {
  return (
    <Section id="cijene" color={COLORS.connect}>
      <SectionHead no="006.5" side="Cijene i uslovi" title="Cijene" />
      <p data-reveal className="copy-l mt-[3vw] max-w-[28ch] max-md:mt-6">
        Kupite jedan artikal ili cijelu isporuku. Za veće količine dogovaramo uslove.
      </p>

      <div data-reveal className="mt-[5vw] grid border border-current max-md:mt-10 md:grid-cols-3">
        {TIERS.map((t, i) => (
          <article
            key={t.no}
            className={`flex flex-col p-[2.2vw] max-md:p-6 ${i > 0 ? 'border-current max-md:border-t md:border-l' : ''}`}
            style={t.featured ? { background: COLORS.connect, color: 'var(--bg)' } : undefined}
          >
            <p className="lbl flex justify-between">
              <span>{t.no}</span>
              {t.featured && <span>Veće količine</span>}
            </p>
            <h3 className="mt-[7vw] font-serif leading-[0.95] tracking-[-0.01em] [font-size:clamp(38px,4.4vw,76px)] max-md:mt-14">
              {t.name}
            </h3>
            <p className="mt-6 flex flex-wrap items-baseline gap-x-3">
              <span className="copy-l">{t.price}</span>
              <span className="lbl">{t.note}</span>
            </p>
            <p className="copy mt-3">{t.who}</p>
            <ul className="mt-8 flex-1 border-t border-current pt-6">
              {t.features.map((f) => (
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
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr style={{ color: COLORS.connect }}>
              <th className="lbl w-[34%] pb-4 font-normal">Poređenje</th>
              {TIERS.map((t) => (
                <th key={t.no} className="lbl pb-4 font-normal">
                  {t.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIER_TABLE.map((r) => (
              <tr key={r.row} className="border-t" style={{ borderColor: COLORS.connect }}>
                <th className="copy py-4 pr-4 font-normal">{r.row}</th>
                {r.cells.map((c, i) => (
                  <td key={i} className="copy py-4 pr-4">
                    {c === true ? '✓' : c === false ? '—' : c}
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

// 06.6 — Dostava
export function Delivery() {
  return (
    <Section id="dostava" color={COLORS.why}>
      <SectionHead no="006.6" side="Kako roba stiže" title="Dostava" />

      <ol className="mt-[5vw] grid gap-x-6 gap-y-10 max-md:mt-10 md:grid-cols-3">
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

      <dl className="mt-[6vw] grid gap-x-6 border-t border-current max-md:mt-14 md:grid-cols-3">
        {DELIVERY_FACTS.map((f, i) => (
          <div key={f.k} data-reveal style={{ ['--i' as string]: i }} className="border-b border-current py-5 md:border-b-0">
            <dt className="lbl">{f.k}</dt>
            <dd className="copy-l mt-4 text-ink">
              <T s={f.v} />
            </dd>
          </div>
        ))}
      </dl>
      <p data-reveal className="mt-8">
        <ShopLink href="/dostava" className="lbl link-u">
          Uslovi dostave →
        </ShopLink>
      </p>
    </Section>
  )
}

// 06.7 — Česta pitanja
export function Faq() {
  return (
    <Section id="pitanja" color={COLORS.who}>
      <SectionHead no="006.7" side="Česta pitanja" title="Pitanja" />

      <div className="mt-[4vw] grid grid-cols-12 gap-x-6 gap-y-10 max-md:mt-8">
        <div className="col-span-12 md:col-span-4">
          <p data-reveal className="copy-l max-w-[18ch]">
            Ne nalazite odgovor? Naš tim je tu.
          </p>
          <p data-reveal className="mt-6">
            <ShopLink href="/#kontakt" className="pill">
              Kontakt
            </ShopLink>
          </p>
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
