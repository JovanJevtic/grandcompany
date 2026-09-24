import { COLORS } from '@/lib/content'
import { COMPANY } from '@/lib/company'
import { BENEFITS, CATEGORIES, MATERIALS, PRODUCTS, USES } from '@/lib/shop'
import { PHOTOS_GC } from '@/gc/gc'
import { FilterLink } from './ShopLink'
import ShopLink from './ShopLink'
import { Photo, Section, SectionHead, T } from './parts'

// Sekcije prodavnice koje su sadržajno statične (server-komponente). Interaktivni dijelovi (filteri, dugmad)
// su male klijentske komponente unutar njih.

// Uvod: fotografija našeg stovarišta preko cijele širine, rečenica o tome šta radimo i dva dugmeta
// (raspored po Korvae referenci, tipografija i dugmad iz grand-root).
export function Hero() {
  const onDark = { ['--acc' as string]: 'var(--bg)', ['--pfg' as string]: 'var(--ink)' } as React.CSSProperties
  return (
    <section id="pocetak" className="relative flex h-[100svh] min-h-[640px] flex-col justify-end overflow-hidden text-bg">
      {/* eslint-disable-next-line @next/next/no-img-element -- naša fotografija iz /public */}
      <img
        src={PHOTOS_GC.yardAerial}
        alt="Stovarište Grand Company iz vazduha, palete materijala i kamioni"
        className="absolute inset-0 size-full object-cover"
        fetchPriority="high"
      />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(26_18_11/0.15)_30%,rgb(26_18_11/0.72)_100%)]" />

      <div className="relative px-[var(--pad)] pb-[4.5vw] max-md:pb-10">
        <p className="lbl flex flex-wrap gap-x-[6vw] gap-y-2 border-t border-bg/60 pt-4">
          <span>Grand Company d.o.o.</span>
          <span>Banja Luka, od {COMPANY.founded.split(' ').pop()}</span>
          <span className="ml-auto max-md:hidden">Veleprodaja i maloprodaja</span>
        </p>
        <h1 className="mt-[2.4vw] max-w-[17ch] font-serif leading-[0.95] tracking-[-0.01em] [font-size:clamp(44px,6.6vw,120px)] max-md:mt-6">
          Materijal za suhu gradnju, izolaciju i fasade, <em>kranom do vaše etaže.</em>
        </h1>
        <div className="mt-[3vw] grid grid-cols-12 items-end gap-x-6 gap-y-8 max-md:mt-8">
          <p className="copy col-span-12 max-w-[40ch] md:col-span-5">
            Knauf ploče i profili, kamena vuna i stiropor, ljepila, mase i vijci. Zalihe čitamo iz Pantheona, a vlastiti
            kamioni sa kranom istovaraju palete na gradilištu.
          </p>
          <div className="col-span-12 flex flex-wrap gap-3 md:col-span-6 md:col-start-7 md:justify-end" style={onDark}>
            <ShopLink href="/#katalog" className="pill pill-solid">
              Pogledaj katalog
            </ShopLink>
            <ShopLink href="/#kompleti" className="pill">
              Gotovi kompleti za 10 m² zida →
            </ShopLink>
          </div>
        </div>
      </div>
    </section>
  )
}

// 001 — Zašto mi: četiri obećanja (grand-root ShopIntro).
export function ShopIntro() {
  return (
    <Section id="prodavnica" color={COLORS.why}>
      <SectionHead no="001" side="Stovarište u Banjoj Luci" title="Zašto mi" />

      <div className="mt-[5vw] grid grid-cols-12 gap-x-6 gap-y-14 max-md:mt-10">
        <div className="col-span-12 md:col-span-5">
          <p data-reveal className="lbl">
            Za izvođače i za investitore
          </p>
          <p data-reveal className="copy-l mt-5">
            Materijal za suhu gradnju, izolaciju i fasade, <em>od jedne ploče do cijelog kamiona</em>. Odaberite artikle, a
            komercijalista potvrđuje narudžbu i termin istovara.
          </p>
          <div data-reveal className="mt-8 flex flex-wrap gap-3">
            <ShopLink href="/#katalog" className="pill pill-solid">
              Pogledaj katalog
            </ShopLink>
            <ShopLink href="/#cijene" className="pill">
              Uslovi za partnere
            </ShopLink>
          </div>
        </div>

        <ul className="col-span-12 grid grid-cols-1 gap-x-6 sm:grid-cols-2 md:col-span-6 md:col-start-7">
          {BENEFITS.map((b, i) => (
            <li key={b.no} data-reveal style={{ ['--i' as string]: i }} className="border-t border-current pb-8 pt-4">
              <p className="lbl flex justify-between">
                <span>{b.no}</span>
                <span>{b.title}</span>
              </p>
              <p className="copy mt-6 text-ink">
                <T s={b.text} />
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-[7vw] grid grid-cols-12 items-end gap-x-4 max-md:mt-14 md:gap-x-6">
        <figure className="col-span-5 md:col-span-3">
          <Photo src={PHOTOS_GC.forklift} alt="Viljuškar utovara palete na našem stovarištu" className="aspect-[3/4]" />
          <figcaption className="lbl mt-3">Utovar na stovarištu</figcaption>
        </figure>
        <figure className="col-span-7 md:col-span-5">
          <Photo src={PHOTOS_GC.crane} index={1} alt="Naš kamion sa kranom utovara paletu" className="aspect-[4/3]" />
          <figcaption className="lbl mt-3">Kamion sa kranom</figcaption>
        </figure>
        <figure className="col-span-12 mt-4 md:col-span-4 md:mt-0">
          <Photo src={PHOTOS_GC.shop} index={2} alt="Naša maloprodaja" className="aspect-[16/9] md:aspect-[4/5]" />
          <figcaption className="lbl mt-3">Naša maloprodaja</figcaption>
        </figure>
      </div>
    </Section>
  )
}

// 002 — Grupe: velike fotografije primjene po kategoriji (raspored po Korvae referenci).
// Fotografije prikazuju primjenu materijala, ne konkretan artikal, pa ih opisujemo kao grupu.
export function CategoryTiles() {
  return (
    <Section id="grupe" color={COLORS.who} className="!px-0">
      <div className="px-[var(--pad)]">
        <SectionHead no="002" side="Četiri grupe materijala" title="Grupe" />
      </div>
      <ul className="mt-[4vw] grid grid-cols-2 gap-px bg-bg max-md:mt-8 md:grid-cols-4">
        {CATEGORIES.map((c, i) => {
          const n = PRODUCTS.filter((p) => p.category === c.id).length
          return (
            <li key={c.id}>
              <FilterLink patch={{ cat: c.id }} className="group relative block aspect-[3/4] w-full cursor-pointer overflow-hidden text-left text-bg">
                <Photo src={c.photo} alt={`Primjena: ${c.label}`} index={i} className="absolute inset-0" />
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(26_18_11/0.7)_100%)]" />
                <span className="absolute inset-x-0 bottom-0 p-[1.6vw] max-md:p-4">
                  <span className="lbl block opacity-90">
                    0{i + 1} · {n} artikala
                  </span>
                  <span className="mt-3 block font-serif uppercase leading-[0.95] [font-size:clamp(26px,3vw,52px)] transition-transform duration-700 [transition-timing-function:var(--ease-expo)] group-hover:translate-x-2 group-hover:italic">
                    {c.label}
                  </span>
                  <span className="copy mt-2 block max-w-[28ch] opacity-90 max-md:hidden">{c.blurb}</span>
                  <span className="lbl mt-4 block">Artikli →</span>
                </span>
              </FilterLink>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

// 006 — Po vrsti radova: veliki redovi koji filtriraju katalog.
export function ByUse() {
  return (
    <Section id="radovi" color={COLORS.why}>
      <SectionHead no="006" side="Po vrsti radova" title="Radovi" />
      <p data-reveal className="copy-l mt-[3vw] max-w-[26ch] max-md:mt-6">
        Počnite od posla koji vas čeka, mi ćemo pokazati materijal.
      </p>
      <ul className="mt-[4vw] max-md:mt-8">
        {USES.map((u, i) => {
          const n = PRODUCTS.filter((p) => p.uses.includes(u.id)).length
          return (
            <li key={u.id} data-reveal style={{ ['--i' as string]: 0 }} className="border-t border-current last:border-b">
              <FilterLink
                patch={{ use: u.id }}
                className="group grid w-full cursor-pointer grid-cols-12 items-baseline gap-x-6 py-[1.4vw] text-left max-md:py-5"
              >
                <span className="lbl col-span-2 md:col-span-1">0{i + 1}</span>
                <span className="col-span-10 font-serif uppercase leading-[1] tracking-[-0.01em] transition-transform duration-700 [transition-timing-function:var(--ease-expo)] [font-size:clamp(34px,6.2vw,108px)] group-hover:translate-x-[1.6vw] group-hover:italic md:col-span-7">
                  {u.label}
                </span>
                <span className="lbl hidden md:col-span-3 md:block">{u.blurb}</span>
                <span className="lbl col-span-12 mt-2 md:col-span-1 md:mt-0 md:text-right">{n} →</span>
              </FilterLink>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

// 007 — Materijali: naše četiri grupe, sa opisom primjene iz kataloga.
export function Materials() {
  return (
    <Section id="materijali" color={COLORS.who}>
      <SectionHead no="007" side="Materijali" title="Materijali" />
      <p data-reveal className="copy-l mt-[3vw] max-w-[24ch] max-md:mt-6">
        Četiri grupe materijala, jedan stručan tim iza svake.
      </p>

      <div className="mt-[5vw] max-md:mt-10">
        {MATERIALS.map((m, i) => (
          <article key={m.id} className="grid grid-cols-12 gap-x-6 gap-y-6 border-t border-current py-[2.6vw] last:border-b max-md:py-8">
            <p data-reveal className="lbl col-span-12 md:col-span-1">
              0{i + 1}
            </p>
            <Photo src={m.photo} alt={`Primjena: ${m.name}`} className="col-span-6 aspect-[4/5] md:col-span-3" />
            <div className="col-span-12 md:col-span-5 md:col-start-5">
              <h3 data-reveal className="font-serif uppercase leading-[0.92] tracking-[-0.01em] [font-size:clamp(34px,4.8vw,84px)]">
                {m.name}
              </h3>
              <p data-reveal className="copy-l mt-4 italic">
                {m.line}
              </p>
              <p data-reveal className="copy mt-6 max-w-[44ch] text-ink">
                {m.text}
              </p>
            </div>
            <div data-reveal className="col-span-12 flex flex-col justify-between gap-8 md:col-span-3 md:col-start-10">
              <ul className="lbl">
                {m.props.map((p) => (
                  <li key={p} className="border-t border-current py-3 leading-[1.3] first:border-t-0 first:pt-0">
                    {p}
                  </li>
                ))}
              </ul>
              <FilterLink patch={{ cat: m.category }} className="pill self-start">
                Artikli · {m.name} →
              </FilterLink>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
