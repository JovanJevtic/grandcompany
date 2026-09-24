import type { ReactNode } from 'react'

// Zaglavlje svake sekcije: sitna oznaka i broj, veliki naslov (izlazi red po red, vidi ScrollFx), kratak uvod desno.
export default function SectionHead({ no, eyebrow, title, intro }: { no: string; eyebrow: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <header className="grid grid-cols-12 gap-x-5">
      <div data-reveal className="info col-span-12 flex justify-between text-dim">
        <span>{eyebrow}</span>
        <span className="tabular-nums">{no}</span>
      </div>
      <h2 data-split className="display col-span-12 mt-[clamp(28px,5vw,72px)] lg:col-span-9">
        {title}
      </h2>
      {intro && (
        <p
          data-reveal
          className="col-span-12 mt-8 max-w-[38ch] text-[15px] leading-[1.55] text-dim lg:col-span-3 lg:col-start-10 lg:mt-0 lg:self-end"
        >
          {intro}
        </p>
      )}
    </header>
  )
}
