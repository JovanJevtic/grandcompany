'use client'

import { useState } from 'react'
import { BUNDLES, WALL, type Bundle } from '@/lib/bundles'
import { scrollToTarget } from '@/lib/scroll'
import { km, qtyText } from '@/lib/shop'
import SectionHead from './SectionHead'
import { useShop } from './ShopProvider'

// Fotografija radova za svaki sistem (ambijent, ne artikal).
const PHOTO: Record<string, string> = {
  W111: '/photos/drywall-frame.jpg',
  W112: '/photos/drywall-wall.jpg',
  W115: '/photos/drywall-room.jpg',
  D112: '/photos/interior.jpg',
}

function BundleRow({ b, index }: { b: Bundle; index: number }) {
  const { add } = useShop()
  const [done, setDone] = useState(false)
  const s = b.system

  const addAll = () => {
    b.lines.forEach((l) => add(l.p.id, l.qty))
    setDone(true)
    setTimeout(() => setDone(false), 1800)
  }

  return (
    <article data-reveal className="grid gap-8 border-t border-line py-10 md:grid-cols-12 md:gap-5 md:py-14">
      <div className="md:col-span-5">
        <p className="info mb-4 flex justify-between text-dim">
          <span className="tabular-nums">0{index + 1}</span>
          <span>
            {s.code} · {s.profile} · {s.thickness} mm
          </span>
        </p>
        <div className="relative aspect-[5/4] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- lokalna fotografija radova */}
          <img src={PHOTO[s.code] ?? '/photos/drywall-room.jpg'} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover grayscale-[35%]" />
          <span className="info absolute left-3 top-3 bg-fg px-2 py-[7px] font-semibold text-bg">
            {b.bom ? 'Za 10 m² zida' : 'Po predmjeru'}
          </span>
          {s.rw !== null && <span className="info absolute bottom-3 right-3 bg-bg px-2 py-[7px] text-fg">Rw {s.rw} dB</span>}
        </div>
      </div>

      <div className="flex flex-col md:col-span-7 md:pl-[2vw]">
        <h3 className="text-[clamp(28px,3vw,44px)] font-medium leading-[1] tracking-[-0.045em]">{s.name}</h3>
        <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.55] text-dim">{s.use}</p>
        <p className="info mt-4 leading-[1.5] text-dim">{s.build}</p>

        <ul className="mt-6 border-t border-line">
          {b.lines.map((l) => (
            <li key={l.p.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-[14px]">
              <span>
                {b.bom && (
                  <span className="tabular-nums text-dim">
                    {qtyText(l.qty)} {l.p.unit} ·{' '}
                  </span>
                )}
                {l.p.name}
                {b.bom && <span className="block text-[12px] text-dim">{l.note}</span>}
              </span>
              <span className="shrink-0 tabular-nums">{b.bom ? km(l.p.price * l.qty) : `${km(l.p.price)} / ${l.p.unit}`}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6 md:mt-auto md:pt-8">
          {b.bom ? (
            <div>
              <p className="info text-dim">Ukupno za 10 m² zida, sa PDV-om</p>
              <p className="mt-2 font-serif text-[clamp(34px,3.4vw,52px)] leading-none tabular-nums">{km(b.sum)}</p>
            </div>
          ) : (
            <p className="max-w-[36ch] text-[14px] leading-[1.5] text-dim">
              Za ovaj sistem W111 norma ne važi. Pošaljite mjere, pa računamo količine po predmjeru.
            </p>
          )}
          {b.bom ? (
            <button type="button" onClick={addAll} className={`btn min-w-[260px] justify-between max-sm:w-full ${done ? 'btn-solid' : ''}`}>
              <span>{done ? 'Dodato u korpu ✓' : 'Dodaj komplet u korpu'}</span>
              <span aria-hidden>+</span>
            </button>
          ) : (
            <button type="button" onClick={() => scrollToTarget('#upit')} className="btn min-w-[260px] justify-between max-sm:w-full">
              <span>Zatraži obračun</span>
              <span aria-hidden>→</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

// Kompleti (grand-maison Bundles, prebačen u cipher slog): naši sistemi zidova i plafona iz kataloga.
// Količine za W111/W112 računa ista W111 norma kao kalkulator (zid 4 × 2,5 m). Bez popusta.
export default function Bundles() {
  return (
    <section id="kompleti" className="border-t border-line px-5 py-[clamp(72px,11vw,176px)]">
      <SectionHead
        no="04 / 12"
        eyebrow="Kompleti"
        title={
          <>
            zid, <em>složen unaprijed</em>.
          </>
        }
        intro={`Gotovi spiskovi za Knauf sisteme. Količine za zid ${qtyText(WALL.L)} × ${qtyText(WALL.H)} m računa W111 norma: normativ po m², 5 % otpada, cijela pakovanja.`}
      />
      <div className="mt-[clamp(56px,8vw,120px)] border-b border-line">
        {BUNDLES.map((b, i) => (
          <BundleRow key={b.system.code} b={b} index={i} />
        ))}
      </div>
    </section>
  )
}
