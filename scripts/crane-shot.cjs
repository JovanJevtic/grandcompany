// Snima kadar WebGL scene krana.
// Modalitet A (progres): node scripts/crane-shot.cjs           → CRANE_PS liste progresа.
// Modalitet B (kamera):  CRANE_CAM='[{"name":"x","p":0.2,"pos":[..],"look":[..],"fov":40}]'
//   → postavi story na p (world.update), pa nadjačaj kameru i renderuj.
// Env: CRANE_URL, CRANE_OUT, CRANE_W, CRANE_H, CRANE_PS, CRANE_CAM.
const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')

const URL = process.env.CRANE_URL || 'http://localhost:3000/?debug'
const OUT = process.env.CRANE_OUT || 'shots'
const W = Number(process.env.CRANE_W || 1440)
const H = Number(process.env.CRANE_H || 900)
const PROGRESS = (process.env.CRANE_PS || '0,0.04,0.07,0.13,0.18,0.22,0.28,0.34,0.4,0.44,0.5,0.56').split(',').map(Number)
const CAM = process.env.CRANE_CAM ? JSON.parse(process.env.CRANE_CAM) : null

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] })
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)))
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForFunction(() => !!window.__gcCraneDebug && !!window.__gcCraneReady, null, { timeout: 60000 })
  await page.waitForTimeout(600)

  const jobs = CAM
    ? CAM.map((c) => ({ name: c.name || `p-${c.p}`, p: c.p, pos: c.pos, look: c.look, fov: c.fov }))
    : PROGRESS.map((p) => ({ name: `p-${String(p).replace('.', '_')}`, p }))

  for (const j of jobs) {
    const dataUrl = await page.evaluate((j) => {
      const { world, pipeline, renderer } = window.__gcCraneDebug
      const cam = world.camera
      const cv = renderer.domElement
      const aspect = cv.width / cv.height
      world.update(j.p, aspect)
      if (j.pos) {
        cam.position.set(j.pos[0], j.pos[1], j.pos[2])
        if (j.fov) cam.fov = j.fov
        cam.aspect = aspect
        cam.lookAt(j.look[0], j.look[1], j.look[2])
        cam.updateProjectionMatrix()
      }
      pipeline.setStyle(j.p)
      pipeline.render(1)
      return cv.toDataURL('image/png')
    }, j)
    const file = path.join(OUT, `${j.name}.png`)
    fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'))
    console.log('saved', file)
  }
  if (errors.length) console.log('ERRORS:', errors.slice(0, 5))
  await browser.close()
})().catch((e) => { console.error('FATAL', e); process.exit(1) })