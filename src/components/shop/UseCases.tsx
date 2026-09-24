'use client'

import { showUse } from '@/lib/scroll'
import { USES, artikala } from '@/lib/shop'
import SectionHead from './SectionHead'

// "Šta gradite?" (grand-maison UseCases, u cipher slogu): popis vrsta radova. Klik filtrira prodavnicu na
// materijal za taj posao i klizi do nje. Hover izolacija kao u prstenu (iso / iso-i).
export default function UseCases() {
  return (
    <section id="namjena" className="border-t border-line py-[clamp(72px,11vw,176px)]">
      <div className="px-5">
        <SectionHead
          no="05 / 12"
          eyebrow="Po namjeni"
          title={
            <>
              šta <em>gradite</em>?
            </>
          }
          intro="Izaberite vrstu radova i vidite samo materijal koji vam za nju treba."
        />
      </div>

      <ul className="iso mt-[clamp(56px,8vw,120px)] border-b border-line">
        {USES.map((u, i) => (
          <li key={u.id} data-reveal className="iso-i border-t border-line">
            <button
              type="button"
              onClick={() => showUse(u.id)}
              className="group grid w-full cursor-pointer grid-cols-[32px_1fr_auto] items-baseline gap-4 px-5 py-6 text-left transition-colors duration-500 hover:bg-fg hover:text-bg md:grid-cols-12 md:gap-5 md:py-8"
            >
              <span className="info text-dim group-hover:text-bg md:col-span-1">0{i + 1}</span>
              <span className="text-[clamp(30px,4.4vw,72px)] font-medium leading-[0.98] tracking-[-0.05em] md:col-span-6">{u.name}</span>
              <span className="hidden text-[14px] leading-[1.45] text-dim group-hover:text-bg md:col-span-3 md:block">{u.hint}</span>
              <span className="info whitespace-nowrap md:col-span-2 md:text-right">
                {artikala(u.skus.length)} <span aria-hidden>→</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
