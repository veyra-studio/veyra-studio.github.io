// End-to-end verification of the production build.
//
//   npm run build && npm run verify
//
// Serves dist/ exactly as GitHub Pages would (static files, directory
// indexes, 404.html), then checks both languages: no console errors or
// failed requests, lang/dir and hreflang, keyboard entry, the language
// switch, reduced motion, mobile layout. Screenshots go to verify-output/.
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { chromium } from 'playwright'

const ROOT = new URL('../dist/', import.meta.url).pathname
const OUT = new URL('../verify-output/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain' }

// A tiny Pages-like static server.
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  let file = normalize(join(ROOT, decodeURIComponent(url.pathname)))
  if (!file.startsWith(ROOT)) return res.writeHead(403).end()
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) {
    res.writeHead(404, { 'content-type': TYPES['.html'] })
    return createReadStream(join(ROOT, '404.html')).pipe(res)
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
})
await new Promise((r) => server.listen(0, r))
const BASE = `http://localhost:${server.address().port}`

const failures = []
const fail = (msg) => {
  failures.push(msg)
  console.log(`  ✗ ${msg}`)
}
const pass = (msg) => console.log(`  ✓ ${msg}`)

async function visit(browser, name, path, options, steps, { expectStatus = 200 } = {}) {
  console.log(`\n${name}`)
  const context = await browser.newContext(options)
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => {
    // Chrome logs the document's own (expected) 404 status as a console error.
    if (m.type() === 'error' && !(expectStatus === 404 && m.text().includes('status of 404'))) errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('response', (r) => {
    const isDoc = r.url() === `${BASE}${path}`
    if (r.status() >= 400 && !(isDoc && r.status() === expectStatus)) errors.push(`HTTP ${r.status()} ${r.url()}`)
  })
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await steps(page, context)
  errors.length ? fail(`${name}: errors:\n    ${errors.join('\n    ')}`) : pass(`${name}: no console or network errors`)
  await context.close()
}

const at = (page, sel, frac = 0) =>
  page.evaluate(([s, f]) => {
    const el = document.querySelector(s)
    window.scrollTo(0, el.getBoundingClientRect().top + scrollY + el.offsetHeight * f)
  }, [sel, frac])

try {
  const browser = await chromium.launch()
  for (const [lang, path, dir] of [['en', '/', 'ltr'], ['fa', '/fa/', 'rtl']]) {
    await visit(browser, `Desktop ${lang.toUpperCase()} 1440×900`, path, { viewport: { width: 1440, height: 900 }, locale: lang === 'fa' ? 'fa-IR' : 'en-US' }, async (page) => {
      const meta = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        hreflang: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => l.getAttribute('hreflang')),
        h1: document.querySelector('h1')?.textContent?.trim(),
        veil: document.documentElement.classList.contains('veil-text'),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }))
      meta.lang === lang && meta.dir === dir ? pass(`lang="${lang}" dir="${dir}"`) : fail(`lang/dir ${meta.lang}/${meta.dir}`)
      ;['en', 'fa', 'x-default'].every((h) => meta.hreflang.includes(h)) ? pass('hreflang alternates') : fail(`hreflang: ${meta.hreflang}`)
      meta.h1 ? pass(`h1 “${meta.h1}”`) : fail('missing h1')
      meta.veil ? pass('woven wordmark active') : fail('veil did not initialise')
      meta.overflow <= 1 ? pass('no horizontal overflow') : fail(`horizontal overflow ${meta.overflow}px`)
      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => document.activeElement?.className)
      focused?.includes('skip-link') ? pass('first Tab focuses the skip link') : fail(`first Tab focused ${focused}`)
      await page.evaluate(() => document.activeElement?.blur?.())
      for (const [name, sel, f] of [['hero', '#top', 0], ['statement', '#statement', 0.15], ['engine', '#engine', 0.3], ['work', '#work', 0.1], ['studio', '#studio', 0.05], ['start', '#start', 0.1]]) {
        await at(page, sel, f)
        await page.waitForTimeout(1100)
        await page.screenshot({ path: `${OUT}${lang}-desktop-${name}.png` })
      }
      pass(`screenshots → verify-output/${lang}-desktop-*.png`)
      // The language switch leads to the other language.
      const other = lang === 'en' ? '/fa/' : '/'
      await at(page, '#top', 0)
      await page.click('.lang-switch')
      await page.waitForURL(`${BASE}${other}`, { timeout: 10000 }).catch(() => {})
      new URL(page.url()).pathname === other ? pass(`language switch → ${other}`) : fail(`language switch went to ${page.url()}`)
    })
    await visit(browser, `Mobile ${lang.toUpperCase()} 390×844`, path, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, async (page) => {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      overflow <= 1 ? pass('no horizontal overflow') : fail(`horizontal overflow ${overflow}px`)
      for (const [name, sel, f] of [['hero', '#top', 0], ['engine', '#engine', 0.4], ['work', '#work', 0.05]]) {
        await at(page, sel, f)
        await page.waitForTimeout(1000)
        await page.screenshot({ path: `${OUT}${lang}-mobile-${name}.png` })
      }
      pass(`screenshots → verify-output/${lang}-mobile-*.png`)
    })
  }
  await visit(browser, 'Reduced motion EN', '/', { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' }, async (page) => {
    const smooth = await page.evaluate(() => document.documentElement.hasAttribute('data-reduced-motion'))
    smooth ? pass('reduced-motion flag set on <html>') : fail('reduced motion not detected')
    await at(page, '#statement', 0.2)
    await page.waitForTimeout(800)
    const t = await page.$eval('.st-line [style*="transform"]', (el) => el.style.transform).catch(() => 'none')
    t.includes('0%') || t === 'none' ? pass('statement readable without motion') : fail(`statement transform ${t}`)
  })
  await visit(browser, '404 page', '/does-not-exist/', { viewport: { width: 1280, height: 800 } }, async (page) => {
    const h1 = await page.textContent('h1')
    h1?.length ? pass(`404 renders “${h1}”`) : fail('404 page missing')
  }, { expectStatus: 404 })
  await browser.close()
} catch (error) {
  fail(String(error?.stack ?? error))
} finally {
  server.close()
}

console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed')
process.exit(failures.length ? 1 : 0)
