import { ContactButton } from './Actions'
import SectionHead from './SectionHead'

// PLACEHOLDER TEKSTOVI — uslovi (rabat, pisana ponuda, isporuka) su prijedlog i treba ih potvrditi sa klijentom.
const TIERS = [
  {
    name: 'Maloprodaja',
    price: 'Redovna cijena',
    text: 'Za domaćinstva i majstore koji kupuju po potrebi.',
    list: ['Cijene po komadu, metru ili pakovanju', 'Bez minimalne količine', 'Kupovina online kroz korpu'],
    cta: 'Kupuj online',
    href: '#ponuda',
  },
  {
    name: 'Veleprodaja',
    price: 'Cijena po količini',
    text: 'Za trgovce, firme i veće nabavke.',
    list: ['Cijena zavisi od količine', 'Pisana ponuda na zahtjev', 'Fakturisanje za pravna lica'],
    cta: 'Zatraži ponudu',
  },
  {
    name: 'Projekti i izvođači',
    price: 'Ponuda po projektu',
    text: 'Za izvođače radova i investitore.',
    list: ['Ponuda za cijeli objekat prema predmjeru', 'Suha gradnja i izolacija na jednom mjestu', 'Isporuka prema dinamici radova'],
    cta: 'Pošalji predmjer',
  },
]

const ROWS: [string, string, string, string][] = [
  ['Cijena', 'Redovna', 'Po količini', 'Po projektu'],
  ['Količinski rabat', '—', 'Na upit', 'Na upit'],
  ['Pisana ponuda', '—', 'Na zahtjev', 'Uključena'],
  ['Isporuka', 'Po dogovoru', 'Po dogovoru', 'Prema dinamici radova'],
]

// Cijene i uslovi: svijetla sekcija (tone-light) kao predah između tamnih; srednja kolona je opet tamna.
export default function Pricing() {
  return (
    <section id="cijene" className="tone-light px-5 py-[clamp(72px,11vw,176px)]">
      <SectionHead
        no="04 / 06"
        eyebrow="Cijene i uslovi"
        title={
          <>
            cijena po <em>količini</em>.
          </>
        }
        intro="Kupujete li nekoliko ploča ili materijal za cijeli objekat, cijena prati količinu. Odaberite način nabavke koji vam odgovara."
      />

      <div className="mt-[clamp(56px,8vw,120px)] grid border border-line md:grid-cols-3">
        {TIERS.map((t, i) => (
          <article
            key={t.name}
            data-reveal
            className={`flex flex-col p-6 md:min-h-[600px] md:p-8 ${i === 1 ? 'tone-dark' : ''} ${i > 0 ? 'border-t border-line md:border-l md:border-t-0' : ''}`}
          >
            <p className="info flex justify-between text-dim">
              <span>0{i + 1}</span>
            </p>
            <h3 className="mt-16 text-[clamp(32px,3.4vw,52px)] font-medium leading-none tracking-[-0.05em]">{t.name}</h3>
            <p className="mt-3 font-serif text-[clamp(22px,2vw,30px)] italic leading-tight">{t.price}</p>
            <p className="mt-6 max-w-[32ch] text-[15px] leading-[1.55] text-dim">{t.text}</p>
            <ul className="mt-8 border-t border-line">
              {t.list.map((l) => (
                <li key={l} className="border-b border-line py-3 text-[14px]">
                  {l}
                </li>
              ))}
            </ul>
            <div className="mt-10 md:mt-auto md:pt-10">
              {t.href ? (
                <a href={t.href} className="btn w-full justify-between">
                  {t.cta} <span aria-hidden>→</span>
                </a>
              ) : (
                <ContactButton className="btn w-full justify-between">
                  {t.cta} <span aria-hidden>→</span>
                </ContactButton>
              )}
            </div>
          </article>
        ))}
      </div>

      <div data-reveal className="mt-[clamp(56px,8vw,120px)] hidden md:block">
        <p className="info mb-6 text-dim">Poređenje</p>
        <div className="border-t border-line">
          <div className="info grid grid-cols-4 gap-5 border-b border-line py-4 text-dim">
            <span />
            {TIERS.map((t) => (
              <span key={t.name}>{t.name}</span>
            ))}
          </div>
          {ROWS.map(([label, ...cells]) => (
            <div key={label} className="grid grid-cols-4 gap-5 border-b border-line py-5 text-[15px]">
              <span className="text-dim">{label}</span>
              {cells.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
