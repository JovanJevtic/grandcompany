import { parseText } from '@/lib/company'

// Tekst sa oznakama iz company.ts: {oznaka} → vrijednost ili istaknuta [oznaka] ako podatak nije poznat.
export function T({ s }: { s: string }) {
  return (
    <>
      {parseText(s).map((p, i) =>
        p.kind === 'em' ? (
          <em key={i} className="font-serif text-[1.08em] tracking-[-0.01em]">
            {p.text}
          </em>
        ) : p.kind === 'missing' ? (
          <span key={i} className="missing">
            {p.text}
          </span>
        ) : (
          p.text
        ),
      )}
    </>
  )
}
