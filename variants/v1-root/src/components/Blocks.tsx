import Grey from './Grey'

// Blokovi poglavlja. Mjere su u dvh (visina ekrana), pa se kompozicija ne lomi na različitim ekranima.
// Na mobilnom se blokovi slažu jedan ispod drugog (vidi max-md klase).

type ChapterProps = { id: string; color: string; children: React.ReactNode }

// Poglavlje: uska "traka" (80px) na početku rezervira mjesto za lijepljenu traku 01–04.
export function Chapter({ id, color, children }: ChapterProps) {
  return (
    <article
      data-chapter={id}
      className="flex shrink-0 max-md:flex-col md:h-dvh"
      style={{ ['--cc' as string]: color, color }}
    >
      <div className="hidden w-[80px] shrink-0 md:block" />
      {children}
    </article>
  )
}

const rowLbl = 'lbl'

// Uvod tipa A (ZAŠTO, ŠTA): velika slika lijevo, mala preko nje, a desno naslov i tekst.
export function IntroA({
  no,
  word,
  title,
  label,
  text,
  tones,
}: {
  no: string
  word: string
  title: string
  label: string
  text: React.ReactNode
  tones: [number, number]
}) {
  return (
    <section className="relative shrink-0 md:h-full md:w-[162dvh] max-md:px-5 max-md:pt-24 max-md:pb-16">
      <Grey
        tone={tones[0]}
        className="max-md:mb-6 max-md:aspect-[4/5] md:absolute md:left-0 md:top-0 md:h-full md:w-[80dvh]"
      />
      <Grey
        tone={tones[1]}
        className="max-md:-mt-16 max-md:ml-auto max-md:aspect-[4/3] max-md:w-[70%] md:absolute md:bottom-0 md:left-[54.6dvh] md:h-[37.4dvh] md:w-[50.8dvh]"
      />
      <div className={`${rowLbl} flex md:absolute md:left-[92dvh] md:top-[10.8dvh] max-md:mt-8 max-md:gap-6 md:gap-[16dvh]`}>
        <span data-fade>{word}</span>
        <span data-fade>{no}</span>
      </div>
      <h2 data-title className="giant max-md:mt-2 max-md:text-[26vw] md:absolute md:left-[92.5dvh] md:top-[19dvh]">
        {title}
      </h2>
      <div className="max-md:mt-6 md:absolute md:left-[115.8dvh] md:top-[63dvh] md:w-[40dvh]">
        <p data-fade className={rowLbl}>
          {label}
        </p>
        <p data-fade className="body mt-[3.4dvh]">
          {text}
        </p>
      </div>
    </section>
  )
}

// Uvod tipa B (KO, KAKO): tekst lijevo (oznaka, citat, red poglavlja, naslov).
export function IntroB({
  words,
  title,
  label,
  text,
}: {
  words: [string, string, string]
  title: string
  label: string
  text: React.ReactNode
}) {
  return (
    <section className="relative shrink-0 md:h-full md:w-[83.3dvh] max-md:px-5 max-md:py-20">
      <p data-fade className={`${rowLbl} md:absolute md:left-[12.6dvh] md:top-[10.4dvh]`}>
        {label}
      </p>
      <p data-fade className="body max-md:mt-6 md:absolute md:left-[12.6dvh] md:top-[18dvh] md:w-[43dvh]">
        {text}
      </p>
      <div className={`${rowLbl} flex justify-between max-md:mt-10 md:absolute md:left-[11dvh] md:top-[53.8dvh] md:w-[50dvh]`}>
        {words.map((w) => (
          <span data-fade key={w}>
            {w}
          </span>
        ))}
      </div>
      <h2 data-title className="giant max-md:mt-2 max-md:text-[26vw] md:absolute md:left-[11.4dvh] md:top-[59dvh]">
        {title}
      </h2>
    </section>
  )
}

// Samo slika, cijele visine.
export function Media({ tone, side = 'left' }: { tone: number; side?: 'left' | 'right' }) {
  return (
    <section className="relative shrink-0 max-md:px-5 max-md:pb-10 md:h-full md:w-[113.8dvh]">
      <Grey
        tone={tone}
        className={`max-md:aspect-[4/5] md:absolute md:inset-y-0 md:w-[84dvh] ${side === 'left' ? 'md:left-[13.9dvh]' : 'md:right-[13.9dvh]'}`}
      />
    </section>
  )
}

// Slika u okviru (sa razmakom oko sebe).
export function Boxed({ tone }: { tone: number }) {
  return (
    <section className="relative shrink-0 max-md:px-5 max-md:pb-10 md:h-full md:w-[121.2dvh]">
      <Grey
        tone={tone}
        className="max-md:aspect-[4/3] md:absolute md:left-[10dvh] md:top-[13.2dvh] md:h-[73.6dvh] md:w-[77dvh]"
      />
    </section>
  )
}

// Mala slika gore + oznaka i tekst ispod. `wide` je varijanta sa većim tekstom.
export function Caption({
  tone,
  label,
  text,
  wide = false,
  shifted = false,
}: {
  tone: number
  label: string
  text: React.ReactNode
  wide?: boolean
  shifted?: boolean
}) {
  return (
    <section
      className={`relative shrink-0 max-md:px-5 max-md:pb-14 md:h-full ${wide ? 'md:w-[111.8dvh]' : 'md:w-[64.3dvh]'}`}
    >
      <Grey
        tone={tone}
        className={`max-md:aspect-[4/3] md:absolute md:top-0 md:h-[33.8dvh] ${
          wide ? 'md:left-[13dvh] md:h-[42.7dvh] md:w-[64dvh]' : 'md:left-0 md:w-[43dvh]'
        }`}
      />
      <div
        className={`max-md:mt-6 md:absolute ${
          wide ? 'md:left-[13dvh] md:top-[56.5dvh] md:w-[64dvh]' : 'md:left-[13.6dvh] md:top-[64dvh] md:w-[36dvh]'
        } ${shifted ? '' : ''}`}
      >
        <p data-fade className={rowLbl}>
          {label}
        </p>
        <p data-fade className={`${wide ? 'body-l mt-[3.6dvh]' : 'body mt-[3.4dvh]'}`}>
          {text}
        </p>
      </div>
    </section>
  )
}

// Samo tekst, krupno.
export function TextLarge({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="relative shrink-0 max-md:px-5 max-md:pb-14 md:h-full md:w-[64dvh]">
      <p data-fade className={`${rowLbl} md:absolute md:left-0 md:top-[10.4dvh] md:w-[30dvh]`}>
        {label}
      </p>
      <div className="body-l max-md:mt-6 md:absolute md:bottom-[13.5dvh] md:left-0 md:w-[63dvh] [&>p+p]:mt-[5.5dvh]">
        {children}
      </div>
    </section>
  )
}
