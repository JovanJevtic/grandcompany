'use client'

import { showCategory } from '@/lib/scroll'
import { CATS, PRODUCTS, artikala } from '@/lib/shop'
import SectionHead from './SectionHead'

// Kategorije sa velikim fotografijama (obrazac sa Korvae), u cipher slogu. Fotografija prikazuje primjenu
// (radove), pa je natpis uvijek kategorija, nikad pojedinačan artikal. Klik filtrira prodavnicu.
export default function Categories() {
  return (
    <section id="kategorije" className="pt-[clamp(72px,11vw,176px)]">
      <div className="px-5">
        <SectionHead
          no="01 / 12"
          eyebrow="Kategorije"
          title={
            <>
              od profila do <em>fasade</em>.
            </>
          }
          intro="Četiri grupe materijala za suhu gradnju, izolaciju i završne radove. Izaberite grupu i vidite samo njene artikle."
        />
      </div>

      <ul className="iso mt-[clamp(56px,8vw,120px)] grid gap-px border-y border-line bg-line md:grid-cols-2 xl:grid-cols-4">
        {CATS.map((c, i) => (
          <li key={c.id} data-reveal className="iso-i bg-bg">
            <button
              type="button"
              onClick={() => showCategory(c.id)}
              className="group relative block aspect-[4/5] w-full cursor-pointer overflow-hidden text-left text-white max-md:aspect-[5/4]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- lokalna fotografija primjene */}
              <img
                src={c.photo}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover grayscale-[35%] transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
              />
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.3),rgba(0,0,0,0)_30%,rgba(0,0,0,0.78))]" />
              <span className="info absolute inset-x-5 top-5 flex justify-between">
                <span>0{i + 1}</span>
                <span>{artikala(PRODUCTS.filter((p) => p.cat === c.id).length)}</span>
              </span>
              <span className="absolute inset-x-5 bottom-5">
                <span className="block text-[clamp(30px,3vw,48px)] font-medium leading-[0.98] tracking-[-0.05em]">{c.name}</span>
                <span className="mt-3 block max-w-[34ch] text-[14px] leading-[1.45] text-white/80">{c.lead}</span>
                <span className="info mt-5 inline-block border-b border-current pb-1">Pogledaj artikle →</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
