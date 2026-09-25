import { COMPANY } from '@/gc/gc'
import { Photo } from './ui'

// Dark about section (Ponos "Ko je MT Ponos" / Drvex dark band): plain facts from COMPANY, our own photo of the sign.
export default function About() {
  return (
    <section id="o-nama" aria-labelledby="onama-h" className="on-dark relative z-10 bg-deep py-16 text-canvas lg:py-24">
      <div className="gutter wrap grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <h2 id="onama-h" className="s-head">
            U Banjoj Luci od {COMPANY.founded}.
          </h2>
          <p className="mt-6 max-w-[52ch] text-[17px] leading-[1.6] text-canvas/85">
            {COMPANY.name} prodaje građevinski materijal na veliko i malo: Knauf sisteme suhe gradnje kao ovlašćeni
            distributer, kamenu i staklenu vunu, stiropor, ljepila, cement i pribor. Kupci su investitori koji grade
            za sebe, zanatlije i građevinske firme.
          </p>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.6] text-canvas/65">
            Roba je na našem stovarištu, a do gradilišta je voze naši kamioni sa kranom.
          </p>
          <dl className="mt-8 grid max-w-[520px] grid-cols-[auto_1fr] gap-x-8 border-t border-canvas/15 text-[14px]">
            {[
              ['Sjedište', COMPANY.address],
              ['Osnivač', COMPANY.founder],
              ['Telefon', `${COMPANY.phoneLandline} · ${COMPANY.phoneMobile}`],
            ].map(([k, v]) => (
              <div key={k} className="col-span-2 grid grid-cols-subgrid border-b border-canvas/15 py-3">
                <dt className="eyebrow pt-0.5 text-[10px] text-canvas/55">{k}</dt>
                <dd className="tnum">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure>
          <Photo
            src="/photos/tabla.jpg"
            alt="Tabla Grand Company i palete robe iza ograde stovarišta, pogled sa ulice"
            sizes="(min-width: 1024px) 52vw, 100vw"
            quality={85}
            className="aspect-[16/10] w-full !bg-deeper"
            imgClassName="object-[50%_78%]"
          />
          <figcaption className="mt-3 text-[12px] text-canvas/55">Stovarište sa ulice, Banja Luka</figcaption>
        </figure>
      </div>
    </section>
  )
}
