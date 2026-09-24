import { COLORS } from '@/lib/content'

// Posljednje poglavlje: kontakt. Na desktopu se raspoređuje apsolutno u dvh mjerama.
export default function Connect() {
  return (
    <article
      data-chapter="connect"
      className="flex shrink-0 max-md:flex-col md:h-dvh"
      style={{ ['--cc' as string]: COLORS.connect, color: COLORS.connect }}
    >
      <div className="hidden w-[80px] shrink-0 md:block" />
      <section className="relative shrink-0 max-md:px-5 max-md:py-24 md:h-full md:w-[150dvh]">
        <h2
          data-title
          className="giant max-md:text-[22vw] md:absolute md:left-[15.5dvh] md:top-[8dvh] md:text-[26dvh]"
          style={{
            background: `linear-gradient(180deg, ${COLORS.connect} 35%, #b6a48f 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            lineHeight: 0.95,
          }}
        >
          Kontakt
        </h2>

        <div className="body max-md:mt-10 md:absolute md:left-[14.9dvh] md:top-[41dvh] md:w-[38dvh]">
          <p data-fade>
            <em>GRAND COMPANY d.o.o. za usluge i trgovinu iz Banje Luke.</em> Veleprodaja i maloprodaja građevinskog
            materijala, od 23. aprila 2012. godine.
          </p>
          <p data-fade className="mt-[1.5dvh]">
            Za pitanja o materijalima i za savjet pri izboru, obratite se našem stručnom timu.
          </p>
        </div>

        <div className="max-md:mt-10 md:absolute md:bottom-[5dvh] md:left-[14.9dvh]">
          <p data-fade className="lbl">
            Vlasnik i direktor
          </p>
          <p data-fade className="body mt-[3.4dvh] md:w-[38dvh]">
            Predrag Uzelac
          </p>
        </div>

        <div className="max-md:mt-12 md:absolute md:bottom-[5dvh] md:left-[68dvh]">
          <p data-fade className="lbl leading-[1.05]">
            Osnovni
            <br />
            podaci
          </p>
          <div data-fade className="mt-[3.4dvh] font-serif text-[clamp(28px,5.8dvh,64px)] leading-[1.08] md:whitespace-nowrap">
            <p>
              Grad — <em>Banja Luka</em>
            </p>
            <p>
              Šifra — <em>G 46.73</em>
            </p>
            <p>
              Oblik — <em>d.o.o.</em>
            </p>
          </div>
        </div>

        <div className="max-md:mt-12 md:absolute md:left-[102dvh] md:top-[10.5dvh]">
          <p data-fade className="lbl leading-[1.05]">
            Poslujemo
            <br />
            od
          </p>
          <p data-fade className="mt-[4dvh] font-serif text-[clamp(30px,6.3dvh,72px)] italic leading-[1.08]">
            2012.
          </p>
        </div>
      </section>
    </article>
  )
}
