import { ORDER_STEPS } from '@/gc/gc'
import SectionHead from './SectionHead'

// Kako naručiti (grand-cipher Steps) sa našim koracima iz kataloga (ORDER_STEPS).
export default function Steps() {
  return (
    <section id="naruci" className="border-t border-line px-5 py-[clamp(72px,11vw,176px)]">
      <SectionHead
        no="09 / 12"
        eyebrow="Kako naručiti"
        title={
          <>
            od korpe do <em>etaže</em>.
          </>
        }
        intro="Četiri koraka: od spiska materijala do palete spuštene kranom na skelu."
      />
      <ol className="mt-[clamp(56px,8vw,120px)] grid border-t border-line md:grid-cols-2 lg:grid-cols-4">
        {ORDER_STEPS.map(([t, p], i) => (
          <li
            key={t}
            data-reveal
            className={`flex min-h-[240px] flex-col justify-between py-8 md:min-h-[340px] md:px-8 ${
              i > 0 ? 'border-t border-line' : ''
            } ${i === 1 || i === 3 ? 'md:border-l' : ''} ${i === 1 ? 'md:border-t-0' : ''} ${i >= 2 ? 'lg:border-t-0 lg:border-l' : ''} ${
              i === 0 || i === 2 ? 'md:pl-0' : ''
            } ${i === 2 ? 'lg:pl-8' : ''}`}
          >
            <span className="info text-dim">0{i + 1}</span>
            <div>
              <h3 className="text-[clamp(28px,2.8vw,42px)] font-medium leading-[1] tracking-[-0.045em]">{t}</h3>
              <p className="mt-4 max-w-[34ch] text-[15px] leading-[1.55] text-dim">{p}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
