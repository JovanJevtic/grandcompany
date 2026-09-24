// Četiri obećanja ispod heroja (obrazac trake sa Korvae), u slogu grand-cipher trake činjenica.
const PROMISES: [string, string][] = [
  ['Istovar kranom na etažu', 'Kamion sa kranom spušta paletu na etažu ili skelu, ne na ulicu.'],
  ['Zalihe uživo iz Pantheona', 'Stanje na sajtu čitamo iz istog sistema iz kojeg radi prodaja.'],
  ['Atesti uz robu', 'CE deklaracija i protivpožarni atest uz otpremnicu, za tehnički prijem.'],
  ['Plaćanje do 90 dana', 'Za ugovorne partnere: po fakturi, uz mjenicu ili bankarsku garanciju.'],
]

export default function Promises() {
  return (
    <ul className="grid grid-cols-2 gap-px border-t border-line bg-line md:grid-cols-4">
      {PROMISES.map(([t, d], i) => (
        <li key={t} data-reveal className="flex flex-col bg-bg px-5 pb-6 pt-5 md:pb-8">
          <span className="info text-dim">0{i + 1}</span>
          <p className="mt-10 max-w-[16ch] text-[clamp(20px,2vw,28px)] font-medium leading-[1.05] tracking-[-0.04em] md:mt-14">{t}</p>
          <p className="mt-3 max-w-[30ch] text-[13px] leading-[1.45] text-dim">{d}</p>
        </li>
      ))}
    </ul>
  )
}
