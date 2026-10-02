// Snima proizvoljnu sekciju sa sajta: SECTION selektor, URL, OUT.
//   $env:NODE_PATH="..."; $env:SECTION="#isporuka"; node scripts/section-shot.cjs
const { chromium } = require('playwright')
const fs = require('node:fs')

const URL = process.env.SHOT_URL || 'http://localhost:3000/'
const SEL = process.env.SECTION || '#stovariste'
const OUT = process.env.SHOT_OUT || 'section-shot.png'
const H = Number(process.env.SHOT_H || 900)

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage({ viewport: { width: 1440, height: H }, deviceScaleFactor: 1 })
  await page.goto(URL, { waitUntil: 'load', timeout: 120000 })
  await page.waitForTimeout(2500)
  const el = page.locator(SEL)
  await el.scrollIntoViewIfNeeded()
  await page.waitForTimeout(1200)
  // Za visoke (pinovane) sekcije: uđi još malo u sekciju pa snimi kadar ekrana.
  const off = Number(process.env.SHOT_OFF || 0)
  if (off) {
    await page.evaluate((off) => {
      const y = window.scrollY + off
      if (window.__gcLenis) window.__gcLenis.scrollTo(y, { immediate: true })
      else window.scrollTo(0, y)
    }, off)
    await page.waitForTimeout(1600)
  }
  await page.screenshot({ path: OUT })
  console.log('saved', OUT)
  await browser.close()
})().catch((e) => { console.error('FATAL', e); process.exit(1) })