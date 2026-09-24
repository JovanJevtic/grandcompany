import Reveal from './Reveal'

// Tekstovi uslova su probni: potvrditi sa klijentom prije puštanja u rad.
const ITEMS = [
  { title: 'Dostava ili preuzimanje', text: 'Isporuka na adresu i gradilište, ili preuzimanje u Banjoj Luci.' },
  { title: 'Cijene za izvođače', text: 'Poseban cjenovnik za izvođače radova i veće količine.' },
  { title: 'Stručan savjet', text: 'Pomoć pri izboru i obračunu materijala za vaš objekat.' },
  { title: 'Sve na jednom mjestu', text: 'Suha gradnja, izolacija, drvo i sanitarija u jednoj narudžbi.' },
]

export default function TrustStrip() {
  return (
    <section className="grid grid-cols-2 border-b-2 border-ink md:grid-cols-4">
      {ITEMS.map((item, i) => (
        <Reveal
          key={item.title}
          delay={i * 90}
          className={`flex min-h-[210px] flex-col justify-between gap-10 p-5 md:min-h-[26dvh] md:p-[1.6vw] ${
            i % 2 === 1 ? 'border-l-2 border-ink' : ''
          } ${i > 1 ? 'border-t-2 border-ink md:border-t-0' : ''} ${i > 0 ? 'md:border-l-2 md:border-ink' : ''}`}
        >
          <p className="text-micro tabular-nums">0{i + 1}</p>
          <div>
            <h2 className="text-small uppercase">{item.title}</h2>
            <p className="mt-3 max-w-[30ch] text-micro uppercase text-ink/60">{item.text}</p>
          </div>
        </Reveal>
      ))}
    </section>
  )
}
