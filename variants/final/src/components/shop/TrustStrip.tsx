// Facts strip under the hero (grand-maison TrustStrip, laid out as the Ponos strip: one row, hairline cells).
const FACTS = ['Od 2012.', 'Ovlašćeni Knauf distributer', 'Istovar kranom na etažu', 'Zalihe uživo iz Pantheona']

export default function TrustStrip() {
  return (
    <section id="ukratko" aria-label="Ukratko o nama" className="relative z-10 border-y border-ink/15 bg-canvas">
      <ul className="grid grid-cols-2 md:grid-cols-4">
        {FACTS.map((f, i) => (
          <li
            key={f}
            className={`eyebrow flex min-h-[58px] items-center justify-center px-3 py-4 text-center text-[11px] md:min-h-[64px] ${
              i % 2 === 1 ? 'border-l border-ink/15' : ''
            } ${i > 1 ? 'border-t border-ink/15 md:border-t-0' : ''} ${i === 2 ? 'md:border-l md:border-ink/15' : ''}`}
          >
            {f}
          </li>
        ))}
      </ul>
    </section>
  )
}
