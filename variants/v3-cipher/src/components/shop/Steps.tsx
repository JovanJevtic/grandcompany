import SectionHead from './SectionHead'

const STEPS = [
  { t: 'Odaberite artikle', p: 'Dodajte materijal u korpu iz ponude, ili nam pošaljite svoju listu.' },
  { t: 'Potvrda narudžbe', p: 'Provjeravamo stanje na zalihi i potvrđujemo količine i cijenu.' },
  { t: 'Isporuka ili preuzimanje', p: 'Zajedno dogovaramo termin isporuke ili preuzimanja materijala.' },
]

export default function Steps() {
  return (
    <section id="naruci" className="border-t border-line px-5 py-[clamp(72px,11vw,176px)]">
      <SectionHead
        no="05 / 06"
        eyebrow="Kako naručiti"
        title={
          <>
            od korpe do <em>gradilišta</em>.
          </>
        }
        intro="Tri koraka, bez komplikacija."
      />
      <ol className="mt-[clamp(56px,8vw,120px)] grid border-t border-line md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.t} data-reveal className={`flex min-h-[260px] flex-col justify-between py-8 md:min-h-[360px] md:px-8 ${i > 0 ? 'border-t border-line md:border-l md:border-t-0' : 'md:pl-0'}`}>
            <span className="info text-dim">0{i + 1}</span>
            <div>
              <h3 className="text-[clamp(28px,2.8vw,42px)] font-medium leading-[1] tracking-[-0.045em]">{s.t}</h3>
              <p className="mt-4 max-w-[34ch] text-[15px] leading-[1.55] text-dim">{s.p}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
