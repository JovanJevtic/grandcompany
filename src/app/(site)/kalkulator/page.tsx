import W111Calculator from '@/components/calc/W111Calculator'
import Pw from '@/components/ui/Pw'

export const metadata = {
  title: 'Kalkulator W111 | Grand Company',
  description: 'Unesite površinu pregradnog zida i dobijte spisak materijala za Knauf W111, sa 5% otpada i cijenama.',
}

// Kalkulator materijala za Knauf W111 pregradni zid: naslov kao na ostalim stranicama, pa unos,
// presjek zida u razmjeri i spisak materijala sa "Dodaj sve u korpu".
export default function CalculatorPage() {
  return (
    <div className="pb-[16dvh]">
      <header className="px-5 pb-[8dvh] pt-[18dvh] text-center md:pt-[20dvh]">
        <p className="label text-ink/50">Knauf W111 · pregradni zid</p>
        <h1 className="display mt-6 text-[clamp(52px,10vw,170px)]">
          <Pw>Kalkulator</Pw>
        </h1>
        <p className="mx-auto mt-10 max-w-[44ch] text-[13px] text-ink/70">
          Unesite površinu zida i izaberite oblogu — dobijate tačan spisak materijala sa 5% otpada, spreman za korpu.
        </p>
      </header>
      <W111Calculator />
    </div>
  )
}
