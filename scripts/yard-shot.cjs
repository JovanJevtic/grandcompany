// Snima novu sekciju #stovariste: normalno, hover, spoj sa footerom i mobilni izgled.
//   $env:NODE_PATH="..."; node scripts/yard-shot.cjs
const { chromium } = require('playwright')
const fs = require('node:fs')

const URL = process.env.YARD_URL || 'http://localhost:3000/'
const OUT = process.env.YARD_OUT || 'yardshot'

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] })

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  page.on('pageerror', (e) => console.log('PAGEERR', e.message.slice(0, 160)))
  await page.goto(URL, { waitUntil: 'load', timeout: 120000 })
  await page.waitForTimeout(2500)
  const sec = page.locator('#stovariste')
  await sec.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1800)
  await sec.screenshot({ path: `${OUT}/normal.png` })
  await page.locator('#stovariste figure').first().hover()
  await page.waitForTimeout(700)
  await sec.screenshot({ path: `${OUT}/hover.png` })

  // Spoj: dno sekcije + vrh footera u istom kadru
  await page.evaluate(() => {
    const f = document.getElementById('kontakt')
    const y = f.getBoundingClientRect().top + window.scrollY - window.innerHeight + 420
    if (window.__gcLenis) window.__gcLenis.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
  })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/footer-junction.png` })

  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await m.goto(URL, { waitUntil: 'load', timeout: 120000 })
  await m.waitForTimeout(2500)
  const msec = m.locator('#stovariste')
  await msec.scrollIntoViewIfNeeded()
  await m.waitForTimeout(1500)
  await msec.screenshot({ path: `${OUT}/mobile.png` })

  console.log('saved normal, hover, footer-junction, mobile')
  await browser.close()
})().catch((e) => { console.error('FATAL', e); process.exit(1) })