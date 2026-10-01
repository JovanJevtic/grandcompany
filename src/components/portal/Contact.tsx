'use client'

import { useState } from 'react'
import { COMPANY } from '@/gc/gc'
import type { FullPartner } from '@/lib/b2b'
import Cta from '@/components/ui/Cta'
import { addRequest } from './store'
import { Head, field, line } from './ui'

// Kontakt za posebne uslove: viši rabat, povećanje limita, ponuda za veći projekat, termin krana.
// Zahtjev ide komercijalisti (demo: čuva se lokalno i vidi se u internom dijelu).

const TOPICS = ['Ponuda za projekat (veće količine)', 'Viši nivo rabata', 'Povećanje kreditnog limita', 'Termin kamiona sa kranom', 'Tehnički atesti i deklaracije']

export default function Contact({ partner }: { partner: FullPartner | null }) {
  const [sent, setSent] = useState(false)
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    addRequest({ kind: 'uslovi', from: partner?.name ?? String(f.get('firma') || 'Gost'), detail: `${f.get('tema')}: ${f.get('poruka')}` })
    setSent(true)
  }
  return (
    <div className="px-5 pb-[14vh] pt-10 md:px-10">
      <Head no="05 · Kontakt" title="Posebni uslovi">
        Za veće projekte, viši rabat, povećanje limita ili tačan termin krana — komercijalista odgovara istog radnog dana.
      </Head>
      <div className="grid lg:grid-cols-[1.4fr_1fr]">
        <div className={`border-b ${line} py-10 lg:border-b-0 lg:border-r lg:pr-10`}>
          {sent ? (
            <div className="flex flex-col gap-5">
              <p className="label text-cobalt">Zahtjev je poslat</p>
              <p className="display text-[clamp(28px,3vw,48px)]">Javljamo se danas</p>
              <div>
                <Cta onClick={() => setSent(false)}>Novi zahtjev</Cta>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              {!partner && (
                <label className="flex flex-col gap-2 text-[10.5px] sm:col-span-2">
                  <span className="opacity-60">Firma</span>
                  <input name="firma" required className={field} />
                </label>
              )}
              <label className="flex flex-col gap-2 text-[10.5px] sm:col-span-2">
                <span className="opacity-60">Tema</span>
                <select name="tema" className={field}>
                  {TOPICS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-[10.5px] sm:col-span-2">
                <span className="opacity-60">Poruka (količine, gradilište, rok)</span>
                <textarea name="poruka" required rows={5} className={`${field} h-auto py-2`} />
              </label>
              <label className="flex flex-col gap-2 text-[10.5px]">
                <span className="opacity-60">Telefon za povratni poziv</span>
                <input name="telefon" type="tel" className={field} />
              </label>
              <div className="flex items-end justify-end">
                <Cta solid type="submit">
                  Pošalji
                </Cta>
              </div>
            </form>
          )}
        </div>
        <dl className="grid content-start gap-6 py-10 text-[11.5px] lg:pl-10">
          {[
            ['Veleprodaja / stovarište', COMPANY.phoneLandline, COMPANY.phoneLandlineHref],
            ['Mobilni · Viber · WhatsApp', COMPANY.phoneMobile, COMPANY.phoneMobileHref],
            ['Prodaja', COMPANY.emailSales, `mailto:${COMPANY.emailSales}`],
          ].map(([k, v, href]) => (
            <div key={k} className={`border-t ${line} pt-4`}>
              <dt className="opacity-55">{k}</dt>
              <dd className="num mt-1 text-[20px]">
                <a href={href} className="hover:text-cobalt">
                  {v}
                </a>
              </dd>
            </div>
          ))}
          <div className={`border-t ${line} pt-4`}>
            <dt className="opacity-55">Stovarište</dt>
            <dd className="mt-1">{COMPANY.address}</dd>
            <dd className="mt-1 opacity-70">Pon–Pet 07–17 h · Sub 07–14 h · Nedjelja ne radimo</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
