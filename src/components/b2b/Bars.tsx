import { money } from '@/lib/shop'

// Jednostavan horizontalni grafikon (CSS), bez biblioteka: naziv, traka srazmjerna najvećoj
// vrijednosti i iznos. Koristi se u portalu za potrošnju po gradilištu i po grupi artikala.
export default function Bars({ data, label }: { data: { name: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <figure aria-label={label}>
      <ul className="grid gap-3">
        {data.map((d) => (
          <li key={d.name} className="grid gap-1.5">
            <div className="flex items-baseline justify-between gap-4 text-[11px]">
              <span className="min-w-0 truncate">{d.name}</span>
              <span className="shrink-0 tabular-nums opacity-70">{money(d.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-ink" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  )
}
