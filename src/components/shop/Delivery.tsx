import Link from 'next/link'
import { CRANE_RECOMMEND_OVER_KG, DELIVERY_ZONES, FREE_DELIVERY_OVER } from '@/gc/gc'
import { km, num } from '@/lib/shop'
import SectionHead from './SectionHead'

// Dostava (grand-root Delivery, u cipher slogu): tri kolone sa velikim brojem (ovdje: udaljenost zone), a ispod
// red činjenica. Cijene su iz naših zona dostave (DELIVERY_ZONES): standardna dostava i kamion sa kranom.
const RADIUS: Record<string, string> = { bl: '10', z25: '25', z50: '50' }

const FACTS: [string, string][] = [
  ['Besplatna standardna dostava', `Za narudžbe preko ${km(FREE_DELIVERY_OVER)}.`],
  ['Kran preporučujemo', `Za teret preko ${num(CRANE_RECOMMEND_OVER_KG, 0)} kg: paleta ide pravo na etažu ili skelu.`],
  ['Rad krana', 'Obračunava se posebno, po zoni, uz prevoz kamionom sa kranom.'],
]

export default function Delivery() {
  return (
    <section id="dostava" className="border-t border-line px-5 py-[clamp(72px,11vw,176px)]">
      <SectionHead
        no="08 / 12"
        eyebrow="Dostava"
        title={
          <>
            paleta na <em>skeli</em>, ne na ulici.
          </>
        }
        intro="Imamo svoje kamione sa kranom. Cijena zavisi od zone i od toga da li treba istovar kranom."
      />

      <ol className="mt-[clamp(56px,8vw,120px)] grid gap-x-5 gap-y-12 md:grid-cols-3">
        {DELIVERY_ZONES.map((z, i) => (
          <li key={z.id} data-reveal className="border-t border-line pt-4">
            <p className="info flex justify-between text-dim">
              <span>0{i + 1}</span>
              <span>Zona</span>
            </p>
            <p className="mt-8 font-serif text-[clamp(72px,9vw,160px)] leading-[0.8] tracking-[-0.03em]">
              {RADIUS[z.id] ?? '—'}
              <span className="ml-2 font-sans text-[clamp(16px,1.4vw,22px)] font-medium tracking-[-0.02em]">km</span>
            </p>
            <h3 className="mt-6 text-[clamp(20px,1.8vw,26px)] font-medium leading-[1.1] tracking-[-0.03em]">{z.label}</h3>
            <dl className="mt-6 border-t border-line text-[14px]">
              {(
                [
                  ['Standardna dostava', z.standard],
                  ['Kamion sa kranom', z.kranTransport],
                  ['Rad krana', z.kranWork],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 border-b border-line py-3">
                  <dt className="text-dim">{k}</dt>
                  <dd className="tabular-nums">{km(v)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ol>

      <dl className="mt-[clamp(56px,6vw,96px)] grid gap-x-5 border-t border-line md:grid-cols-3">
        {FACTS.map(([k, v]) => (
          <div key={k} data-reveal className="border-b border-line py-5 md:border-b-0">
            <dt className="info text-dim">{k}</dt>
            <dd className="mt-4 max-w-[32ch] text-[clamp(18px,1.5vw,22px)] leading-[1.25] tracking-[-0.02em]">{v}</dd>
          </div>
        ))}
      </dl>
      <p data-reveal className="mt-8">
        <Link href="/dostava" className="info underline underline-offset-4 hover:text-dim">
          Uslovi dostave →
        </Link>
      </p>
    </section>
  )
}
