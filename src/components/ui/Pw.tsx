import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

// Prettywise (naslovni font, isti kao rečenica u herou) je DEMO verzija bez č ć š đ ž i sa žigom umjesto nekih znakova.
// Ova komponenta prolazi kroz tekst naslova i takva slova slaže od osnovnog slova iz fonta + tankog
// znaka iznad (kvačica, akcenat, crtica kod đ). Znak je pravi element, pa izranja zajedno sa slovom
// kad SplitText animira naslov. Čitači ekrana dobijaju pravo slovo (sr-only).
// Kad se kupi puna licenca fonta (sa latin-ext), postavi DEMO_FONT na false i sve ostaje isto, samo pravim slovima.
const DEMO_FONT = true

const MAP: Record<string, [base: string, mark: string, kind: string]> = {
  č: ['c', 'ˇ', 'lo'],
  ć: ['c', '´', 'lo'],
  š: ['s', 'ˇ', 'lo'],
  ž: ['z', 'ˇ', 'lo'],
  đ: ['d', '-', 'dj'],
  Č: ['C', 'ˇ', 'up'],
  Ć: ['C', '´', 'up'],
  Š: ['S', 'ˇ', 'up'],
  Ž: ['Z', 'ˇ', 'up'],
  Đ: ['D', '-', 'DJ'],
}
// Demo font na mjestu većine interpunkcije (- ! ( ) / & + % " ' # * = …) i cifre 4 ima žig "DEMO".
// Sigurni su samo slova, razmak i . , : ; ? — sve ostalo (i sve cifre, da ne budu pomiješane)
// crta se rezervnim serifom (.pw-alt = Bodoni Moda).
const SAFE = /[A-Za-z .,:;?\u00a0]/

function letter(ch: string, key: string): ReactNode {
  const m = MAP[ch]
  if (!m) return ch
  // Znak crta CSS (::after, SVG maska), vidi globals.css; pravo slovo čuva sr-only za čitače ekrana.
  return (
    <span key={key} className={`pw-m pw-${m[2]}`} data-mark={m[1]}>
      <span aria-hidden>{m[0]}</span>
      <span className="sr-only">{ch}</span>
    </span>
  )
}

// Niz znakova: sigurna slova idu kako jesu, slova sa kvačicama se slažu, ostalo ide u .pw-alt grupe.
function run(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = []
  let plain = ''
  let alt = ''
  const flush = () => {
    if (plain) out.push(plain)
    if (alt) out.push(<span key={`${key}-a${out.length}`} className="pw-alt">{alt}</span>)
    plain = ''
    alt = ''
  }
  ;[...text].forEach((ch, i) => {
    if (MAP[ch]) {
      flush()
      out.push(letter(ch, `${key}-${i}`))
    } else if (SAFE.test(ch)) {
      if (alt) flush()
      plain += ch
    } else {
      if (plain) flush()
      alt += ch
    }
  })
  flush()
  return out
}

function convert(text: string, key: string): ReactNode {
  if ([...text].every((ch) => SAFE.test(ch))) return text
  // Riječ sa složenim slovom ide u nowrap omotač: SplitText je inače presiječe na mjestu
  // ugniježđenog elementa i browser prelomi "ploče" u "ploc / e".
  return text.split(/(\s+)/).map((word, w) => {
    if (!word || /^\s+$/.test(word)) return word
    const parts = run(word, `${key}-${w}`)
    return parts.length === 1 && typeof parts[0] === 'string' ? (
      parts[0]
    ) : (
      <span key={`${key}-${w}`} className="pw-w">
        {parts}
      </span>
    )
  })
}

function walk(node: ReactNode, key = 'pw'): ReactNode {
  if (typeof node === 'string') return convert(node, key)
  if (Array.isArray(node)) return Children.map(node, (n, i) => walk(n, `${key}-${i}`))
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>
    if (el.props.children === undefined) return el
    return cloneElement(el, undefined, walk(el.props.children, key))
  }
  return node
}

/** Tekst u naslovnom fontu (Prettywise), sa složenim č ć š đ ž dok je font demo. */
export default function Pw({ children }: { children: ReactNode }) {
  return <>{DEMO_FONT ? walk(children) : children}</>
}

/** Isto, za mjesta gdje treba funkcija (npr. ime artikla iz podataka). */
export const pw = (text: string) => (DEMO_FONT ? convert(text, 'pw') : text)
