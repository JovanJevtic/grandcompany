// Perf mjerenje (CJS radi kroz npx -p playwright koji postavi NODE_PATH):
//   npx -y -p playwright node scripts/perf.cjs
// Koristi instalirani Chrome (channel:'chrome').
const { chromium } = require('playwright')
const fs = require('node:fs')

const URL = process.env.PERF_URL || 'https://grandcompany-maison.vercel.app/'
const OUT = 'perf-report.json'

const runs = {
  desktop: { viewport: { width: 1440, height: 900 }, dpr: 1, cpu: 1 },
  mobile: { viewport: { width: 390, height: 844 }, dpr: 2, cpu: 4 },
}

async function measure(label, cfg) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--no-sandbox'] })
  const context = await browser.newContext({
    viewport: cfg.viewport,
    deviceScaleFactor: cfg.dpr,
    isMobile: cfg.cpu > 1,
    hasTouch: cfg.cpu > 1,
    locale: 'bs-BA',
  })
  const page = await context.newPage()
  const client = await context.newCDPSession(page)
  if (cfg.cpu > 1) await client.send('Emulation.setCPUThrottlingRate', { rate: cfg.cpu })

  const metrics = { label, fcp: 0, lcp: 0, cls: 0, longTasks: [], requests: [], errors: [], transferred: 0, jsBytes: 0, imgBytes: 0, fontBytes: 0, nl: {}, wallMs: 0, scrollLong: [] }

  await context.addInitScript(() => {
    window.__perf = { lcp: 0, cls: 0, long: [] }
    try {
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__perf.lcp = Math.max(window.__perf.lcp, e.startTime + e.duration)
      }).observe({ type: 'largest-contentful-paint', buffered: true })
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value
      }).observe({ type: 'layout-shift', buffered: true })
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__perf.long.push({ d: e.duration, s: e.startTime })
      }).observe({ type: 'longtask', buffered: true })
    } catch (e) { /* stari browser */ }
  })

  page.on('request', (r) => {
    const t = r.resourceType()
    if (/\.(js|json|webp|png|jpg|jpeg|avif|woff2?|ttf|otf)(\?|$)/.test(r.url())) metrics.requests.push({ t, url: r.url().slice(0, 220) })
  })
  page.on('response', (r) => {
    const bytes = Number(r.headers()['content-length'] || 0) || 0
    const type = r.request().resourceType()
    if (type === 'script') metrics.jsBytes += bytes
    else if (type === 'image') metrics.imgBytes += bytes
    else if (type === 'font') metrics.fontBytes += bytes
    metrics.transferred += bytes
  })
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') metrics.errors.push(`[${m.type()}] ${m.text().slice(0, 250)}`) })
  page.on('pageerror', (e) => metrics.errors.push(`[pageerror] ${e.message.slice(0, 250)}`))

  const t0 = Date.now()
  await page.goto(URL, { waitUntil: 'load', timeout: 120000 })
  await page.waitForTimeout(cfg.cpu > 1 ? 9000 : 6000)

  const nl = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0]
    return { ttfb: n.responseStart, dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd, transfer: n.transferSize }
  })
  const perf = await page.evaluate(() => window.__perf)
  metrics.lcp = Math.round(perf.lcp)
  metrics.cls = Math.round(perf.cls * 1000) / 1000
  metrics.fcp = Math.round(await page.evaluate(() => performance.getEntriesByType('paint').find((e) => e.name === 'first-contentful-paint')?.startTime || 0))
  metrics.longTasks = perf.long.map((l) => ({ ms: Math.round(l.d), at: Math.round(l.s) })).sort((a, b) => b.ms - a.ms).slice(0, 8)
  metrics.nl = { ttfb: Math.round(nl.ttfb), dcl: Math.round(nl.dcl), load: Math.round(nl.load) }
  metrics.requests = metrics.requests.filter((x, i, a) => a.findIndex((y) => y.url === x.url) === i)
  metrics.wallMs = Date.now() - t0

  // Skrol do dna: da izazove pinove i trigger-e, pa skupi nove long taskove.
  await page.evaluate(() => new Promise((res) => { let y = 0; const step = () => { window.scrollBy(0, 700); y += 700; if (y < document.body.scrollHeight) requestAnimationFrame(step); else res() }; requestAnimationFrame(step) }))
  await page.waitForTimeout(3000)
  const after = await page.evaluate(() => window.__perf.long || [])
  metrics.scrollLong = after.map((l) => Math.round(l.d)).sort((a, b) => b - a).slice(0, 6)

  await browser.close()
  return metrics
}

;(async () => {
  const out = {}
  for (const [k, cfg] of Object.entries(runs)) out[k] = await measure(k, cfg)
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2))
  console.log(JSON.stringify(out, null, 2))
  console.log('\n→ ' + OUT)
})().catch((e) => { console.error('FATAL', e); process.exit(1) })