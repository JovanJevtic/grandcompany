// Runway klipovi -> niz kadrova za kaolin sekciju.
//
//   pnpm kaolin:frames                 (klipovi iz ../kaolin-runway/clips)
//   pnpm kaolin:frames <folder>        (klipovi iz drugog foldera)
//
// Uzima 01.mp4 … 08.mp4 redom, izvlači kadrove, izbacuje duplirani prvi kadar svakog
// sledećeg klipa (on je isti kao poslednji prethodnog), po potrebi ravnomjerno prorijedi
// na MAX kadrova i pakuje u WebP u dvije veličine. Na kraju upiše manifest.json — čim on
// postoji, sajt sam prelazi sa pretapanja slika na ove kadrove.
// Treba: ffmpeg i ImageMagick (magick) u PATH-u (oba su instalirana preko scoop-a).

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const CLIPS = resolve(process.argv[2] ?? join(ROOT, '..', 'kaolin-runway', 'clips'))
const OUT = join(ROOT, 'public', 'kaolin', 'frames')
const FPS = 24
const MAX = 240 // gornja granica kadrova — dovoljno za glatko premotavanje, a da ne bude teško
const SIZES = [
  { suffix: '', width: 1600, quality: 80 },
  { suffix: '-m', width: 800, quality: 78 },
]

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' })
  if (r.status !== 0) {
    console.error(`\n✗ ${cmd} ${args.join(' ')}\n${r.stderr || r.error}`)
    process.exit(1)
  }
  return r.stdout
}

if (!existsSync(CLIPS)) {
  console.error(`Nema foldera sa klipovima: ${CLIPS}`)
  process.exit(1)
}
const clips = readdirSync(CLIPS)
  .filter((f) => /^\d+\.(mp4|mov|webm)$/i.test(f))
  .sort((a, b) => parseInt(a) - parseInt(b))
if (clips.length === 0) {
  console.error(`U ${CLIPS} nema klipova (očekujem 01.mp4, 02.mp4 …).`)
  process.exit(1)
}
console.log(`Klipovi: ${clips.join(', ')}`)

// 1) Kadrovi iz svih klipova, redom, u privremeni folder.
const tmp = mkdtempSync(join(tmpdir(), 'kaolin-'))
const all = []
const clipStarts = []
clips.forEach((clip, c) => {
  const dir = join(tmp, String(c))
  mkdirSync(dir)
  run('ffmpeg', ['-v', 'error', '-i', join(CLIPS, clip), '-vf', `fps=${FPS}`, join(dir, '%05d.png')])
  let files = readdirSync(dir).sort().map((f) => join(dir, f))
  if (c > 0) files = files.slice(1)
  clipStarts.push(all.length)
  all.push(...files)
  console.log(`  ${clip}: ${files.length} kadrova`)
})

// 2) Ravnomjerno prorjeđivanje ako ih ima previše (početak i kraj uvijek ostaju).
const n = Math.min(MAX, all.length)
const picked = Array.from({ length: n }, (_, i) => Math.round((i * (all.length - 1)) / Math.max(1, n - 1)))
const stageFrames = [...clipStarts, all.length - 1].map((src) =>
  picked.reduce((best, v, i) => (Math.abs(v - src) < Math.abs(picked[best] - src) ? i : best), 0),
)

// 3) Pozadina: boja iz ugla prvog kadra, da sekcija oko kadrova nema šav.
const bg = run('magick', [all[0], '-crop', '24x24+8+8', '+repage', '-scale', '1x1!', '-format', '#%[hex:p{0,0}]', 'info:']).trim()

// 4) WebP u dvije veličine.
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
const probe = run('magick', ['identify', '-format', '%w %h', all[0]]).split(' ').map(Number)
picked.forEach((src, i) => {
  const name = `f${String(i + 1).padStart(4, '0')}`
  for (const s of SIZES) {
    run('magick', [all[src], '-resize', `${s.width}x`, '-quality', String(s.quality), join(OUT, `${name}${s.suffix}.webp`)])
  }
  if ((i + 1) % 20 === 0 || i === n - 1) process.stdout.write(`\r  WebP: ${i + 1}/${n}`)
})
console.log()

const width = SIZES[0].width
const height = Math.round((probe[1] / probe[0]) * width)
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ count: n, width, height, bg, stageFrames }, null, 2))
rmSync(tmp, { recursive: true, force: true })

const size = (mobile) =>
  readdirSync(OUT)
    .filter((f) => f.endsWith('.webp') && f.endsWith('-m.webp') === mobile)
    .reduce((sum, f) => sum + statSync(join(OUT, f)).size, 0)
console.log(`✓ ${n} kadrova u public/kaolin/frames — desktop ${(size(false) / 1e6).toFixed(1)} MB, mobilni ${(size(true) / 1e6).toFixed(1)} MB, pozadina ${bg}`)
