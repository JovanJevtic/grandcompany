export type PostArtKind = 'wall-section' | 'ceiling-grid' | 'facade-layers' | 'attic' | 'floor-layers' | 'crane' | 'pallet' | 'calculator'
type Props = { kind: PostArtKind; className?: string; title?: string }
const line = { strokeWidth: 1.25, vectorEffect: 'non-scaling-stroke' as const, strokeLinecap: 'square' as const }

export default function PostArt({ kind, className = '', title }: Props) {
  const layers = (vertical = true) => vertical ? <><path data-d="0" d="M64 54h52v193H64zM284 54h52v193h-52z" {...line}/><path data-d="1" d="M116 68h38v165h-38zm38 0h92v165h-92zm92 0h38v165h-38z" {...line}/><path data-d="2" d="m164 87 72 127m-72-95 64 112m-57-153 65 113m-65-80 58 102" {...line}/></> : <><path data-d="0" d="M50 63h300v38H50zm0 38h300v49H50zm0 49h300v31H50zm0 31h300v57H50z" {...line}/><path data-d="2" d="M65 83h270M65 123h270M65 165h270M65 211h270" {...line}/></>
  const art: Record<PostArtKind, React.ReactNode> = {
    'wall-section': layers(), 'facade-layers': layers(), 'floor-layers': layers(false),
    'ceiling-grid': <><path data-d="0" d="m46 79 226-47 83 51-228 52Z" {...line}/><path data-d="1" d="m79 72 83 51m-27-65 83 52m-26-65 83 50m-190-4 225-48m-195 69 226-48" {...line}/><path data-d="2" d="M76 119v64m66-79v91m70-106v91m69-107v79" {...line}/></>,
    attic: <><path data-d="0" d="M43 224 200 49l157 175" {...line}/><path data-d="1" d="m75 224 125-139 125 139M99 190h202M127 159h146" {...line}/><path data-d="2" d="m106 190 21 34m1-65 41 65m-19-91 54 91m-33-116 68 116m-44-90 54 90" {...line}/></>,
    crane: <><path data-d="0" d="M81 249h178M111 249l39-189h21l30 189M132 147h171l42 18H128" {...line}/><path data-d="1" d="m148 61 52 188m-79-49h70m-62-46h53m-44-49h34m124 53v60" {...line}/><path data-d="2" d="M273 218h48v30h-48zm23-50-8 18h16Z" {...line}/></>,
    pallet: <><path data-d="0" d="m51 211 214-56 87 39-218 61Z" {...line}/><path data-d="1" d="M79 204V96l197-45 48 23v105M79 96l48 25 197-47m-197 47v109" {...line}/><path data-d="2" d="m101 102 0 93m48-81v94m49-105v93m49-105v93m-151 49-1 22m61-38v22m62-39v22m61-38v21" {...line}/></>,
    calculator: <><rect data-d="0" x="95" y="30" width="210" height="240" {...line}/><rect data-d="1" x="120" y="57" width="160" height="43" {...line}/>{[0,1,2,3].map(r => [0,1,2].map(c => <rect key={`${r}-${c}`} data-d="2" x={120+c*57} y={120+r*34} width="45" height="22" {...line}/>))}</>,
  }
  return <svg viewBox="0 0 400 300" className={className} fill="none" stroke="currentColor" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>{title && <title>{title}</title>}{art[kind]}</svg>
}
