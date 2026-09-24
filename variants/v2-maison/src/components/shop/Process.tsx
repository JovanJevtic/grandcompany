import Reveal from './Reveal'
import SectionHead from './SectionHead'

// Koraci i rokovi su probni: potvrditi sa klijentom.
const STEPS = [
  { title: 'Narudžba ili upit', text: 'Sastavite korpu ili pošaljite upit. Javljamo se sa cijenom i količinama.' },
  { title: 'Potvrda i rezervacija', text: 'Provjeravamo stanje na zalihi i rezervišemo robu za vas.' },
  { title: 'Priprema i utovar', text: 'Roba se priprema i utovaruje u dogovoreno vrijeme.' },
  { title: 'Isporuka', text: 'Dostava na adresu ili gradilište, ili preuzimanje u Banjoj Luci.' },
]

export default function Process() {
  return (
    <section id="isporuka" data-spy className="gutter scroll-mt-[var(--bar)] bg-ink py-[14dvh] text-bg">
      <SectionHead
        no="07"
        label="Isporuka"
        title="Od narudžbe do gradilišta"
        lead="Četiri koraka, bez iznenađenja."
      />

      <div className="mt-[8dvh] grid border-t-2 border-current md:grid-cols-4">
        {STEPS.map((s, i) => (
          <Reveal
            key={s.title}
            delay={i * 110}
            className={`flex min-h-[300px] flex-col justify-between gap-10 py-6 md:min-h-[46dvh] md:px-[1.6vw] ${
              i > 0 ? 'border-t border-current/25 md:border-l md:border-t-0' : 'md:pl-0'
            }`}
          >
            <p className="text-[clamp(72px,10vw,180px)] leading-[0.8] tabular-nums">{i + 1}</p>
            <div>
              <h3 className="text-small uppercase">{s.title}</h3>
              <p className="mt-3 max-w-[30ch] text-micro uppercase opacity-60">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
