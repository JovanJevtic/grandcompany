import Link from 'next/link'
import { CRANE_RECOMMEND_OVER_KG, DELIVERY_ZONES, FREE_DELIVERY_OVER, ORDER_STEPS, km } from '@/gc/gc'
import { Photo, SectionTitle } from '../ui'

// Dostava: grand-root Delivery (zone price table + link to the delivery terms) and grand-maison Process
// (ORDER_STEPS), next to a photograph of a crane truck.
export default function Delivery() {
  return (
    <section id="dostava" aria-labelledby="dostava-h" className="relative z-10 bg-canvas py-16 lg:py-24">
      <div className="gutter wrap">
        <SectionTitle
          id="dostava-h"
          title="Dostava i istovar kranom"
          lead={`Tri zone oko Banje Luke. Standardna dostava je besplatna za narudžbe preko ${km(FREE_DELIVERY_OVER)}.`}
          action={
            <Link href="/dostava" className="btn-line">
              Uslovi dostave <span aria-hidden>→</span>
            </Link>
          }
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
          <figure>
            <Photo
              src="/stock/crane-truck.jpg"
              alt="Kamion sa hidrauličnim kranom na ravnoj platformi"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="aspect-[3/2] w-full"
            />
            <figcaption className="mt-2 text-[12px] text-muted">Kamion sa kranom, ilustracija</figcaption>
          </figure>

          <div className="min-w-0">
            {/* phones: one block per zone instead of a four-column table */}
            <ul className="border-t border-ink/15 sm:hidden">
              {DELIVERY_ZONES.map((z) => (
                <li key={z.id} className="border-b border-ink/12 py-3.5">
                  <p className="text-[15px] font-medium">{z.label}</p>
                  <dl className="mt-2 grid grid-cols-3 gap-2 text-[13px]">
                    {(
                      [
                        ['Standardna', z.standard],
                        ['Kran: prevoz', z.kranTransport],
                        ['Kran: istovar', z.kranWork],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[11px] text-muted">{k}</dt>
                        <dd className="tnum">{km(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
            <div className="hidden sm:block">
              <table className="w-full border-collapse text-left text-[14px]">
                <caption className="sr-only">Cijene dostave po zonama, u KM</caption>
                <thead>
                  <tr>
                    {['Zona', 'Standardna', 'Kran: prevoz', 'Kran: istovar'].map((h, i) => (
                      <th key={h} scope="col" className={`eyebrow border-b border-ink/25 pb-3 text-[10px] font-medium text-muted ${i ? 'text-right' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DELIVERY_ZONES.map((z) => (
                    <tr key={z.id}>
                      <th scope="row" className="border-b border-ink/12 py-3.5 pr-4 font-normal">
                        {z.label}
                      </th>
                      {[z.standard, z.kranTransport, z.kranWork].map((v, i) => (
                        <td key={i} className="border-b border-ink/12 py-3.5 pl-3 text-right tnum">
                          {km(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[13px] leading-[1.6] text-muted">
              Kran se naplaćuje kao prevoz plus istovar. Preporučujemo ga za narudžbe teže od{' '}
              {CRANE_RECOMMEND_OVER_KG.toLocaleString('de-DE')} kg ili kad roba ide na sprat. Dalje adrese dogovaramo
              pojedinačno.
            </p>

            <ol className="mt-10 grid gap-x-6 gap-y-6 border-t border-ink/12 pt-6 sm:grid-cols-2">
              {ORDER_STEPS.map(([title, text]) => (
                <li key={title}>
                  <h3 className="text-[15px] font-medium">{title}</h3>
                  <p className="mt-1 text-[13.5px] leading-[1.6] text-muted">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
