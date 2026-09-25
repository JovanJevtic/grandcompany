import { parseText } from '@/lib/company'

// Tekst sa oznakama iz company.ts: {sjediste} → vrijednost (ili istaknuta oznaka ako je nepoznata), *kurziv*.
// (grand-root components/shop/parts.tsx → T)
export function T({ s }: { s: string }) {
  return (
    <>
      {parseText(s).map((p, i) =>
        p.kind === 'em' ? (
          <em key={i}>{p.text}</em>
        ) : p.kind === 'missing' ? (
          <span key={i} className="bg-ink px-1 text-canvas" title="Podatak nije poznat, dopuniti prije objave">
            {p.text}
          </span>
        ) : (
          p.text
        ),
      )}
    </>
  )
}
