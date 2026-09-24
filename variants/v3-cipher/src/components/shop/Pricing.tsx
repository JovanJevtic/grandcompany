import { PARTNER_TIERS } from '@/gc/gc'
import { ContactButton } from './Actions'
import SectionHead from './SectionHead'

const ROWS: [string, (t: (typeof PARTNER_TIERS)[number]) => string][] = [
  ['Za koga', (t) => t.who],
  ['Rabat', (t) => t.rebate],
  ['Kreditni limit', (t) => t.limit],
  ['Plaćanje', (t) => t.days],
]

// Cijene i uslovi (grand-cipher Pricing): svijetla sekcija (tone-light) kao predah između tamnih; druga kolona je
// opet tamna. Kolone su naši nivoi partnera (PARTNER_TIERS): maloprodaja i nivoi 1–3.
export default function Pricing() {
  return (
    <section id="cijene" className="tone-light px-5 py-[clamp(72px,11vw,176px)]">
      <SectionHead
        no="07 / 12"
        eyebrow="Cijene i uslovi"
        title={
          <>
            cijena po <em>saradnji</em>.
          </>
        }
        intro="Maloprodaja plaća cijenu iz kataloga. Ugovorni partneri naručuju po svom rabatu, sa kreditnim limitom i valutom plaćanja do 90 dana."
      />

      <div className="mt-[clamp(56px,8vw,120px)] grid gap-px border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
        {PARTNER_TIERS.map((t, i) => (
          <article key={t.name} data-reveal className={`flex flex-col bg-bg p-6 md:min-h-[520px] md:p-8 ${i === 1 ? 'tone-dark' : ''}`}>
            <p className="info flex justify-between text-dim">
              <span>0{i + 1}</span>
              <span>{i === 0 ? 'Bez ugovora' : 'Ugovorni partner'}</span>
            </p>
            <h3 className="mt-14 text-[clamp(32px,3.4vw,52px)] font-medium leading-none tracking-[-0.05em]">{t.name}</h3>
            <p className="mt-3 font-serif text-[clamp(22px,2vw,30px)] italic leading-tight">
              {i === 0 ? 'Cijena iz kataloga' : `Rabat ${t.rebate}`}
            </p>
            <p className="mt-6 max-w-[32ch] text-[15px] leading-[1.55] text-dim">{t.who}</p>
            <ul className="mt-8 border-t border-line">
              <li className="border-b border-line py-3 text-[14px]">{t.limit}</li>
              <li className="border-b border-line py-3 text-[14px]">{t.days}</li>
            </ul>
            <div className="mt-10 md:mt-auto md:pt-10">
              {i === 0 ? (
                <a href="#ponuda" className="btn w-full justify-between">
                  Kupuj online <span aria-hidden>→</span>
                </a>
              ) : (
                <ContactButton className="btn w-full justify-between">
                  Postani partner <span aria-hidden>→</span>
                </ContactButton>
              )}
            </div>
          </article>
        ))}
      </div>

      <div data-reveal className="mt-[clamp(56px,8vw,120px)] hidden md:block">
        <p className="info mb-6 text-dim">Poređenje</p>
        <div className="border-t border-line">
          <div className="info grid grid-cols-5 gap-5 border-b border-line py-4 text-dim">
            <span />
            {PARTNER_TIERS.map((t) => (
              <span key={t.name}>{t.name}</span>
            ))}
          </div>
          {ROWS.map(([label, get]) => (
            <div key={label} className="grid grid-cols-5 gap-5 border-b border-line py-5 text-[15px]">
              <span className="text-dim">{label}</span>
              {PARTNER_TIERS.map((t) => (
                <span key={t.name}>{get(t)}</span>
              ))}
            </div>
          ))}
        </div>
        <p className="info mt-6 text-dim">Nivo i limit se utvrđuju ugovorom. Odgođeno plaćanje uz mjenicu ili bankarsku garanciju.</p>
      </div>
    </section>
  )
}
