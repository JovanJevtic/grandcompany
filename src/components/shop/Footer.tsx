import { BRAND } from '@/lib/content'
import { CATS } from '@/lib/shop'
import { CategoryButton, ContactButton, TopButton } from './Actions'
import SectionHead from './SectionHead'

const LINKS = [
  ['Ponuda', '#ponuda'],
  ['Novo u ponudi', '#novo'],
  ['Materijali', '#materijali'],
  ['Cijene i uslovi', '#cijene'],
  ['Kako naručiti', '#naruci'],
]

// Podnožje sa kontaktom. Ovdje su samo podaci koji su poznati (firma, grad, godina, direktor); telefon, e-pošta i
// adresa nisu dati, pa ih nema. "Otvori kontakt" vraća na vrh i otvara isti kontakt kao u navigaciji.
export default function Footer() {
  return (
    <footer id="kontakt" className="overflow-hidden border-t border-line px-5 pt-[clamp(72px,11vw,176px)]">
      <SectionHead
        no="06 / 06"
        eyebrow="Kontakt"
        title={
          <>
            trebate ponudu za <em>cijeli objekat</em>?
          </>
        }
        intro="Pošaljite nam predmjer ili listu materijala, a mi ćemo pripremiti ponudu."
      />

      <div data-reveal className="mt-10 flex flex-wrap gap-3">
        <ContactButton className="btn btn-solid">Otvori kontakt</ContactButton>
        <a href="#ponuda" className="btn">
          Pogledaj ponudu
        </a>
      </div>

      <div data-reveal className="mt-[clamp(56px,8vw,120px)] grid grid-cols-2 gap-x-5 gap-y-10 border-t border-line pt-8 md:grid-cols-4">
        <div className="info col-span-2 leading-[1.9] md:col-span-1">
          <p className="text-dim">Firma</p>
          <p className="mt-3">{BRAND} d.o.o.</p>
          <p>Banja Luka</p>
          <p>Poslujemo od 23. aprila 2012.</p>
        </div>
        <div className="info leading-[1.9]">
          <p className="text-dim">Ponuda</p>
          <ul className="mt-3">
            {CATS.map((c) => (
              <li key={c.id}>
                <CategoryButton cat={c.id} className="uppercase hover:underline hover:underline-offset-4">
                  {c.name}
                </CategoryButton>
              </li>
            ))}
          </ul>
        </div>
        <div className="info leading-[1.9]">
          <p className="text-dim">Na stranici</p>
          <ul className="mt-3">
            {LINKS.map(([label, href]) => (
              <li key={href}>
                <a href={href} className="hover:underline hover:underline-offset-4">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="info leading-[1.9]">
          <p className="text-dim">Vlasnik i direktor</p>
          <p className="mt-3">Predrag Uzelac</p>
        </div>
      </div>

      <p
        aria-hidden
        className="mt-[clamp(56px,8vw,120px)] select-none whitespace-nowrap text-center font-medium lowercase leading-[0.82] tracking-[-0.07em] text-[clamp(48px,14.4vw,300px)]"
      >
        grand company
      </p>

      <div className="info flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-6 pt-8 text-dim">
        <span>
          © {new Date().getFullYear()} {BRAND} d.o.o.
        </span>
        {/* Ovu napomenu ukloniti kad se ubace stvarni artikli i cijene. */}
        <span>Prikazani artikli i cijene su ilustrativni</span>
        <TopButton className="uppercase text-fg">Nazad na vrh ↑</TopButton>
      </div>
    </footer>
  )
}
