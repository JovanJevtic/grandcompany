'use client'

import { useState } from 'react'
import { showCategory } from '@/lib/scroll'
import { CATS, PRODUCTS, artikala } from '@/lib/shop'
import SectionHead from './SectionHead'
const two = (n: number) => String(n).padStart(2, '0')

// Materijali: popis naše četiri grupe (tekst `usage` iz kataloga). Ispod kursora ostaje pun red, ostali potamne (kao u prstenu), a desno se
// mijenja fotografija primjene sa opisom (fotografija je radova, ne artikla). Klik otvara tu kategoriju u prodavnici.
export default function Materials() {
  const [active, setActive] = useState(0)

  return (
    <section id="materijali" className="border-t border-line px-5 py-[clamp(72px,11vw,176px)]">
      <SectionHead
        no="06 / 12"
        eyebrow="Materijali"
        title={
          <>
            četiri grupe. <em>jedan sistem</em>.
          </>
        }
        intro="Sve što treba da zid, plafon ili izolacija budu urađeni kako treba, od ploče do posljednjeg vijka."
      />

      <div className="mt-[clamp(56px,8vw,120px)] grid grid-cols-12 gap-x-5">
        <ul className="iso col-span-12 border-t border-line lg:col-span-7">
          {CATS.map((c, i) => (
            <li key={c.id} data-reveal className="iso-i border-b border-line" onMouseEnter={() => setActive(i)}>
              <button
                type="button"
                onClick={() => showCategory(c.id)}
                onFocus={() => setActive(i)}
                className="grid w-full cursor-pointer grid-cols-[40px_1fr_auto] items-baseline gap-4 py-6 text-left lg:py-8"
              >
                <span className="info text-dim">{two(i + 1)}</span>
                <span className="text-[clamp(30px,4.4vw,72px)] font-medium leading-[0.98] tracking-[-0.05em]">{c.name}</span>
                <span className="info text-dim max-md:hidden">{artikala(PRODUCTS.filter((p) => p.cat === c.id).length)} →</span>
              </button>
              <p className="pb-6 pl-14 text-[15px] leading-[1.55] text-dim lg:hidden">{c.text}</p>
            </li>
          ))}
        </ul>

        <div className="relative col-span-5 hidden lg:block" aria-hidden>
          <div className="sticky top-[120px] aspect-[4/5] overflow-hidden">
            {CATS.map((c, i) => (
              <div
                key={c.id}
                className="absolute inset-0 isolate flex flex-col justify-between p-6 text-white transition-opacity duration-700"
                style={{ opacity: active === i ? 1 : 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- lokalna fotografija primjene */}
                <img src={c.photo} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
                <span className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.35),rgba(0,0,0,0.15)_35%,rgba(0,0,0,0.85))]" />
                <p className="info flex justify-between font-medium">
                  <span>{two(i + 1)}</span>
                  <span>{c.name}</span>
                </p>
                <div>
                  <p className="max-w-[34ch] text-[15px] leading-[1.5]">{c.text}</p>
                  <p className="info mb-3 opacity-70">U ponudi, između ostalog</p>
                  <ul className="border-t border-current/30">
                    {c.facts.map((f) => (
                      <li key={f} className="border-b border-current/30 py-2.5 text-[13px]">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
