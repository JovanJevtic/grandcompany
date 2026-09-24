import Reveal from './Reveal'

// Četiri obećanja firme (iz podataka Grand Company: istovar kranom, stanje iz Pantheona, atesti, valuta partnera).
const ITEMS = [
  { title: 'Istovar kranom na etažu', text: 'Vlastiti kamioni sa kranom spuštaju paletu na etažu ili skelu, ne na ulicu.' },
  { title: 'Zalihe uživo iz Pantheona', text: 'Stanje na sajtu čitamo iz istog sistema iz kojeg radi prodaja.' },
  { title: 'Atesti uz robu', text: 'CE deklaracija i protivpožarni atest uz otpremnicu, za tehnički prijem.' },
  { title: 'Plaćanje do 90 dana', text: 'Za ugovorne partnere, po fakturi, uz mjenicu ili bankarsku garanciju.' },
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
