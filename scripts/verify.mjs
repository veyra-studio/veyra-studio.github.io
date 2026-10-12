// End-to-end verification of the production build.
//
//   npm run build && npm run verify
//
// Serves dist/ exactly as GitHub Pages would (static files, directory
// indexes, 404.html), then checks all four languages (English, Persian,
// Arabic, Turkish): no console errors or
// failed requests, lang/dir and hreflang, keyboard entry, the language
// switch, reduced motion, mobile layout. Screenshots go to verify-output/.
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = fileURLToPath(new URL('../dist/', import.meta.url))
const OUT = fileURLToPath(new URL('../verify-output/', import.meta.url))
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

// Each language: path, direction, digits, browser locale, and where its switch leads in the check.
const LANGS = [
  { lang: 'en', path: '/', dir: 'ltr', digits: /^[0-9]+$/, locale: 'en-US', eight: '8' },
  { lang: 'fa', path: '/fa/', dir: 'rtl', digits: /^[۰-۹]+$/, locale: 'fa-IR', eight: '۸' },
  { lang: 'ar', path: '/ar/', dir: 'rtl', digits: /^[٠-٩]+$/, locale: 'ar', eight: '٨' },
  { lang: 'tr', path: '/tr/', dir: 'ltr', digits: /^[0-9]+$/, locale: 'tr-TR', eight: '8' },
]
const spec = (lang) => LANGS.find((l) => l.lang === lang)

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

// ---------------------------------------------------------------------
// The "New in 0.2" row: a horizontal section of live demos.
// ---------------------------------------------------------------------
const xOf = (page, sel) => page.$eval(sel, (el) => new DOMMatrix(getComputedStyle(el).transform).m41)
const identity = (page, sel) => page.$eval(sel, (el) => new DOMMatrix(getComputedStyle(el).transform).isIdentity)

/** Scrolls so the row travels by `progress` (0…1) of its length. */
const rowAt = (page, progress) =>
  page.evaluate((p) => {
    const s = document.querySelector('#new')
    window.scrollTo(0, s.getBoundingClientRect().top + scrollY + (s.offsetHeight - s.firstElementChild.offsetHeight) * p)
  }, progress)

/** Scrolls so panel `id` rests where the first panel rests (as snapping would). */
const toPanel = (page, id) =>
  page.evaluate((id) => {
    const section = document.querySelector('#new')
    const pin = section.firstElementChild
    const track = section.querySelector('[data-next-track]')
    const panels = [...track.children]
    const rtl = getComputedStyle(track).direction === 'rtl'
    const edge = (el) => (rtl ? el.offsetLeft + el.offsetWidth : el.offsetLeft)
    const distance = track.scrollWidth - pin.clientWidth
    const panel = panels.find((el) => el.dataset.panel === id)
    const stop = Math.min(distance, Math.abs(edge(panel) - edge(panels[0])))
    window.scrollTo(0, section.getBoundingClientRect().top + scrollY + (stop / distance) * (section.offsetHeight - pin.offsetHeight))
  }, id)

const inView = (page, id) =>
  page.$eval(`[data-panel="${id}"]`, (el) => {
    const r = el.getBoundingClientRect()
    return r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1
  })

// ---------------------------------------------------------------------
// Commissions: the studio's address, in its section, the nav and the footer.
// ---------------------------------------------------------------------
const EMAIL = 'itsmetti@proton.me'
async function checkContact(page, device) {
  await at(page, '#contact', 0)
  await page.waitForTimeout(700)
  const c = await page.evaluate(() => {
    const email = document.querySelector('#contact .contact-email')
    const r = email?.getBoundingClientRect()
    return {
      text: email?.textContent?.trim(),
      href: email?.getAttribute('href') ?? '',
      dir: email ? getComputedStyle(email).direction : '',
      fits: r ? r.left >= -1 && r.right <= innerWidth + 1 : false,
      footer: document.querySelector('.footer-links .footer-email')?.getAttribute('href') ?? '',
      nav: !!document.querySelector('.nav-links a[href="#contact"]'),
    }
  })
  const subject = decodeURIComponent(c.href.split('?subject=')[1] ?? '')
  c.text === EMAIL && c.href.startsWith(`mailto:${EMAIL}?subject=`) && subject.length > 5
    ? pass(`contact section: mailto ${EMAIL} (subject “${subject}”)`)
    : fail(`contact section: “${c.text}” → ${c.href}`)
  c.dir === 'ltr' && c.fits ? pass('the address reads left to right and fits the screen') : fail(`address dir ${c.dir}, fits ${c.fits}`)
  c.footer.startsWith(`mailto:${EMAIL}`) ? pass('footer links the address') : fail(`footer address ${c.footer}`)
  if (device === 'desktop') c.nav ? pass('nav links to the contact section') : fail('no contact link in the nav')
}

/** The copy button puts the address on the clipboard and says so. */
async function checkCopy(page, context) {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.click('[data-copy]')
  await page.waitForTimeout(300)
  const r = await page.evaluate(async () => ({
    clip: await navigator.clipboard.readText(),
    label: document.querySelector('[data-copy]')?.textContent,
    status: document.querySelector('[data-copy-status]')?.textContent,
    copied: document.querySelector('[data-copy]')?.dataset.copied,
  }))
  r.clip === EMAIL && r.label === r.copied && r.status === r.copied ? pass(`copy button copies the address (“${r.copied}”)`) : fail(`copy: clipboard “${r.clip}”, label “${r.label}”, status “${r.status}”`)
}

async function checkNext(page, lang, device) {
  const rtl = spec(lang).dir === 'rtl'
  const shot = (name) => page.screenshot({ path: `${OUT}${lang}-${device}-new-${name}.png` })

  // The row is a horizontal section: tall, pinned, moving along the reading direction.
  await rowAt(page, 0)
  await page.waitForTimeout(900)
  await shot('intro')
  await rowAt(page, 0.5)
  await page.waitForTimeout(1500)
  const mid = await page.evaluate((rtl) => {
    const track = document.querySelector('[data-next-track]')
    const pin = track.parentElement.getBoundingClientRect()
    const inset = parseFloat(getComputedStyle(track).paddingInlineStart)
    const snapped = [...track.children].some((el) => {
      const r = el.getBoundingClientRect()
      return Math.abs(rtl ? pin.right - r.right - inset : r.left - pin.left - inset) < 2
    })
    return { x: new DOMMatrix(getComputedStyle(track).transform).m41, snapped, count: document.querySelector('[data-next-count]').textContent }
  }, rtl)
  ;(rtl ? mid.x > 100 : mid.x < -100) ? pass(`0.2 row travels ${rtl ? 'rightward' : 'leftward'} (x ${Math.round(mid.x)}px)`) : fail(`0.2 row x ${mid.x}`)
  mid.snapped ? pass('0.2 row settles on a panel') : fail('0.2 row did not snap to a panel')
  spec(lang).digits.test(mid.count) && mid.count.length === 2 && !/^(01|۰۱|٠١)$/.test(mid.count) ? pass(`counter reads ${mid.count}`) : fail(`counter reads ${mid.count}`)
  const crowded = await page.$$eval('.np', (panels) =>
    panels
      .filter((p) => {
        const r = p.getBoundingClientRect()
        const spill = [...p.querySelectorAll('.np-text, .np-intro-text, .np-cue')].some((t) => t.getBoundingClientRect().bottom > r.bottom + 1)
        const squeezed = [...p.querySelectorAll('.np-demo')].some((d) => d.getBoundingClientRect().height < 120)
        return spill || squeezed
      })
      .map((p) => p.dataset.panel),
  )
  crowded.length ? fail(`0.2 panels overflow: ${crowded.join(', ')}`) : pass('every 0.2 panel fits its text and demo')

  if (device === 'mobile') {
    await toPanel(page, 'flip')
    await page.waitForTimeout(1800)
    await shot('flip')
    await toPanel(page, 'noise')
    await page.waitForTimeout(1500)
    await shot('noise')
    return
  }

  // Kashida: focus pulls the panel into view; the slider stretches the words (8 tatweels per stretchable word).
  await page.focus('[data-kashida-range]')
  await page.waitForTimeout(1600)
  ;(await inView(page, 'kashida')) ? pass('focus brings an offscreen panel into view') : fail('focused panel stayed offscreen')
  await page.keyboard.press('End')
  await page.waitForTimeout(250)
  const k = await page.evaluate(() => ({
    shown: document.querySelector('[data-kashida]').textContent,
    spoken: document.querySelector('.kd-sample .visually-hidden').textContent,
    level: document.querySelector('[data-kashida-level]').textContent,
  }))
  const tatweels = (k.shown.match(/\u0640/g) ?? []).length
  tatweels >= 8 && tatweels % 8 === 0 && !k.spoken.includes('\u0640') && k.level === spec(lang).eight
    ? pass(`kashida slider stretches the words (${tatweels} tatweels, accessible text intact)`)
    : fail(`kashida: ${tatweels} tatweels, level ${k.level}, spoken “${k.spoken}”`)
  await shot('kashida')

  // Drag: an arrow key steps to the next card; a throw lands on a card.
  await page.focus('[data-drag-track]')
  await page.waitForTimeout(1600)
  const d0 = await xOf(page, '[data-drag-track]')
  await page.keyboard.press(rtl ? 'ArrowLeft' : 'ArrowRight')
  await page.waitForTimeout(1200)
  const d1 = await xOf(page, '[data-drag-track]')
  ;(rtl ? d1 > d0 + 50 : d1 < d0 - 50) ? pass(`arrow key steps the carousel (${Math.round(d0)} → ${Math.round(d1)}px)`) : fail(`carousel key step ${d0} → ${d1}`)
  const vp = await page.locator('.dg-viewport').boundingBox()
  await page.mouse.move(vp.x + vp.width / 2, vp.y + vp.height / 2)
  await page.mouse.down()
  await page.mouse.move(vp.x + vp.width / 2 + (rtl ? 170 : -170), vp.y + vp.height / 2, { steps: 6 })
  await page.mouse.up()
  await page.waitForTimeout(1800)
  const d2 = await xOf(page, '[data-drag-track]')
  await page.waitForTimeout(200)
  const d3 = await xOf(page, '[data-drag-track]')
  // At rest a card's start edge meets the carousel's start edge, or the row sits at its end bound.
  const vpNow = await page.locator('.dg-viewport').boundingBox()
  const restsOnCard = await page.$$eval(
    '.dg-card',
    (els, [rtl, left, right]) => {
      const starts = (r) => Math.abs(rtl ? r.right - right : r.left - left) < 1.5
      const last = els[els.length - 1].getBoundingClientRect()
      return els.some((el) => starts(el.getBoundingClientRect())) || Math.abs(rtl ? last.left - left : last.right - right) < 1.5
    },
    [rtl, vpNow.x, vpNow.x + vpNow.width],
  )
  ;(rtl ? d2 > d1 : d2 < d1) && d2 === d3 && restsOnCard ? pass(`a throw coasts and rests on a card (${Math.round(d2)}px)`) : fail(`drag throw ${d1} → ${d2}/${d3}, on card: ${restsOnCard}`)

  // FLIP: shuffling moves the tiles, then they settle with no transform left.
  await page.focus('[data-flip-shuffle]')
  await page.waitForTimeout(2400)
  const order = () => page.$$eval('[data-flip-grid] li', (els) => els.map((el) => el.textContent).join(','))
  const before = await order()
  await page.click('[data-flip-shuffle]')
  await page.waitForTimeout(140)
  const moving = await page.$$eval('[data-flip-grid] li', (els) => els.some((el) => !new DOMMatrix(getComputedStyle(el).transform).isIdentity))
  await page.waitForTimeout(1500)
  const after = await order()
  const settled = await page.$$eval('[data-flip-grid] li', (els) => els.every((el) => new DOMMatrix(getComputedStyle(el).transform).isIdentity))
  before !== after && moving && settled ? pass('FLIP shuffle animates, then settles') : fail(`FLIP: changed ${before !== after}, moving ${moving}, settled ${settled}`)
  // Whatever the order, every tile (the promoted 2×2 one too) stays square and inside the grid.
  const fits = () =>
    page.$eval('[data-flip-grid]', (grid) => {
      const g = grid.getBoundingClientRect()
      return [...grid.children].every((el) => {
        const r = el.getBoundingClientRect()
        const inside = r.top >= g.top - 1 && r.bottom <= g.bottom + 1 && r.left >= g.left - 1 && r.right <= g.right + 1
        return inside && Math.abs(r.width - r.height) < 1.5
      })
    })
  let contained = await fits()
  for (let i = 0; i < 4; i++) {
    await page.click('[data-flip-shuffle]')
    await page.waitForTimeout(1250)
    contained = contained && (await fits())
  }
  contained ? pass('FLIP tiles stay square and inside the grid across shuffles') : fail('a FLIP tile was squashed or left the grid')
  await shot('flip')

  // Magnetic link and tilt card follow the pointer.
  await page.focus('[data-magnet]')
  await page.waitForTimeout(1600)
  const m = await page.locator('[data-magnet]').boundingBox()
  await page.mouse.move(m.x + m.width / 2 + 34, m.y + m.height / 2 + 22, { steps: 6 })
  await page.waitForTimeout(700)
  const pulled = !(await identity(page, '[data-magnet]'))
  const c = await page.locator('[data-tilt]').boundingBox()
  await page.mouse.move(c.x + c.width * 0.85, c.y + c.height * 0.2, { steps: 6 })
  await page.waitForTimeout(700)
  const tilted = !(await identity(page, '[data-tilt]'))
  pulled && tilted ? pass('magnetic link and tilt card follow the pointer') : fail(`pointer demos: magnet ${pulled}, tilt ${tilted}`)
  await shot('pointer')
  await page.mouse.move(5, 5)

  // Scramble: lines decode in their own script and settle on the real text.
  await page.focus('[data-scramble-replay]')
  await page.waitForTimeout(2800)
  const lines = () => page.$$eval('.sc-line', (ps) => ps.map((p) => [p.querySelector('[data-scramble]').textContent, p.querySelector('.visually-hidden').textContent]))
  const settledLines = (await lines()).every(([shown, real]) => shown === real)
  await page.click('[data-scramble-replay]')
  await page.waitForTimeout(150)
  const flickering = (await lines()).some(([shown, real]) => shown !== real)
  await page.waitForTimeout(2400)
  const decoded = (await lines()).every(([shown, real]) => shown === real)
  settledLines && flickering && decoded ? pass('scramble decodes and settles on the real text') : fail(`scramble: settled ${settledLines}, flicker ${flickering}, decoded ${decoded}`)

  // GLSL: the shader compiles (or a still fallback replaces it without errors).
  await toPanel(page, 'noise')
  await page.waitForTimeout(1500)
  const state = await page.$eval('[data-demo="noise"]', (el) => el.dataset.state ?? 'none')
  state === 'ok' ? pass('GLSL chunks compile into the noise shader') : state === 'fallback' ? pass('no WebGL2 here: still fallback shown') : fail(`noise demo state ${state}`)
  await shot('noise')

  // The band after the row runs toward the line start: left in English, right in Persian.
  await page.evaluate(() => {
    const band = document.querySelector('.next-band')
    window.scrollTo(0, band.getBoundingClientRect().top + scrollY - innerHeight * 0.4)
  })
  await page.waitForTimeout(700)
  const b0 = await xOf(page, '[data-veyra-marquee-track]')
  await page.waitForTimeout(600)
  const b1 = await xOf(page, '[data-veyra-marquee-track]')
  const db = b1 - b0
  Math.abs(db) > 1000 || (rtl ? db > 2 : db < -2) ? pass(`marquee runs ${rtl ? 'rightward' : 'leftward'}`) : fail(`marquee moved ${db}px`)
  await shot('band')
}

try {
  const browser = await chromium.launch()
  for (const { lang, path, dir, locale } of LANGS) {
    await visit(browser, `Desktop ${lang.toUpperCase()} 1440×900`, path, { viewport: { width: 1440, height: 900 }, locale }, async (page, context) => {
      const meta = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        hreflang: [...document.querySelectorAll('link[rel=alternate][hreflang]')].map((l) => l.getAttribute('hreflang')),
        h1: document.querySelector('h1')?.textContent?.trim(),
        veil: document.documentElement.classList.contains('veil-text'),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }))
      meta.lang === lang && meta.dir === dir ? pass(`lang="${lang}" dir="${dir}"`) : fail(`lang/dir ${meta.lang}/${meta.dir}`)
      ;[...LANGS.map((l) => l.lang), 'x-default'].every((h) => meta.hreflang.includes(h)) ? pass('hreflang alternates') : fail(`hreflang: ${meta.hreflang}`)
      meta.h1 ? pass(`h1 “${meta.h1}”`) : fail('missing h1')
      meta.veil ? pass('woven wordmark active') : fail('veil did not initialise')
      meta.overflow <= 1 ? pass('no horizontal overflow') : fail(`horizontal overflow ${meta.overflow}px`)
      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => document.activeElement?.className)
      focused?.includes('skip-link') ? pass('first Tab focuses the skip link') : fail(`first Tab focused ${focused}`)
      await page.evaluate(() => document.activeElement?.blur?.())
      for (const [name, sel, f] of [['hero', '#top', 0], ['statement', '#statement', 0.15], ['engine', '#engine', 0.3], ['work', '#work', 0.1], ['studio', '#studio', 0.05], ['start', '#start', 0.1], ['contact', '#contact', 0]]) {
        await at(page, sel, f)
        await page.waitForTimeout(1100)
        await page.screenshot({ path: `${OUT}${lang}-desktop-${name}.png` })
      }
      pass(`screenshots → verify-output/${lang}-desktop-*.png`)
      const codeOverflow = await page.$eval('.code', (el) => el.scrollWidth - el.clientWidth)
      codeOverflow <= 1 ? pass('code sample fits without scrolling') : fail(`code sample overflows by ${codeOverflow}px`)
      await checkContact(page, 'desktop')
      await checkCopy(page, context)
      // The nav's contact link scrolls to the section.
      await at(page, '#top', 0)
      await page.waitForTimeout(400)
      await page.click('.nav-links a[href="#contact"]')
      await page.waitForTimeout(2200)
      const contactTop = await page.$eval('#contact', (el) => el.getBoundingClientRect().top)
      Math.abs(contactTop) < 4 ? pass('nav link scrolls to the contact section') : fail(`contact section top after the nav link: ${contactTop.toFixed(0)}px`)
      await checkNext(page, lang, 'desktop')
      // The language switch lists every language, marks this one, and leads to the next.
      const switcher = await page.$$eval('.lang-switch .ls-item', (items) => items.map((i) => [i.getAttribute('lang'), i.getAttribute('aria-current')]))
      switcher.length === LANGS.length && switcher.every(([l, cur]) => (l === lang) === (cur === 'page'))
        ? pass(`language switch lists ${switcher.map(([l]) => l).join(', ')}`)
        : fail(`language switch items ${JSON.stringify(switcher)}`)
      const next = LANGS[(LANGS.findIndex((l) => l.lang === lang) + 1) % LANGS.length]
      const other = next.path
      await at(page, '#top', 0)
      await page.click(`.lang-switch a[lang="${next.lang}"]`)
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
      await checkContact(page, 'mobile')
      await page.screenshot({ path: `${OUT}${lang}-mobile-contact.png` })
      // The smallest phones: the address still fits, nothing overflows.
      await page.setViewportSize({ width: 320, height: 640 })
      await page.waitForTimeout(600)
      await checkContact(page, 'mobile')
      const narrow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      narrow <= 1 ? pass('no horizontal overflow at 320 px') : fail(`horizontal overflow at 320 px: ${narrow}px`)
      await page.screenshot({ path: `${OUT}${lang}-mobile-320-contact.png` })
      await page.setViewportSize({ width: 390, height: 844 })
      await page.waitForTimeout(600)
      await checkNext(page, lang, 'mobile')
    })
  }
  await visit(browser, 'Reduced motion EN', '/', { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' }, async (page) => {
    const smooth = await page.evaluate(() => document.documentElement.hasAttribute('data-reduced-motion'))
    smooth ? pass('reduced-motion flag set on <html>') : fail('reduced motion not detected')
    await at(page, '#statement', 0.2)
    await page.waitForTimeout(800)
    const t = await page.$eval('.st-line [style*="transform"]', (el) => el.style.transform).catch(() => 'none')
    t.includes('0%') || t === 'none' ? pass('statement readable without motion') : fail(`statement transform ${t}`)
    await toPanel(page, 'kashida')
    await page.waitForTimeout(1500)
    const stretched = await page.$eval('[data-kashida]', (el) => el.textContent.includes('\u0640'))
    await toPanel(page, 'scramble')
    await page.waitForTimeout(700)
    const plain = await page.$$eval('.sc-line', (ps) => ps.every((p) => p.querySelector('[data-scramble]').textContent === p.querySelector('.visually-hidden').textContent))
    const replay = await page.$eval('[data-scramble-replay]', (el) => getComputedStyle(el).display)
    await page.evaluate(() => {
      const band = document.querySelector('.next-band')
      window.scrollTo(0, band.getBoundingClientRect().top + scrollY - innerHeight * 0.4)
    })
    await page.waitForTimeout(900)
    const still = await identity(page, '[data-veyra-marquee-track]')
    !stretched && plain && replay === 'none' && still
      ? pass('0.2 demos hold still (no auto stretch or scramble, marquee at rest)')
      : fail(`reduced motion: stretched ${stretched}, plain ${plain}, replay ${replay}, marquee still ${still}`)
  })
  await visit(browser, '404 page', '/does-not-exist/', { viewport: { width: 1280, height: 800 } }, async (page) => {
    const h1 = await page.textContent('h1')
    const alts = await page.$$eval('.nf-alt', (els) => els.map((el) => el.lang))
    h1?.length && alts.length === LANGS.length - 1 ? pass(`404 renders “${h1}” and ${alts.join(', ')}`) : fail(`404 page: h1 ${h1}, others ${alts}`)
  }, { expectStatus: 404 })
  await browser.close()
} catch (error) {
  fail(String(error?.stack ?? error))
} finally {
  server.close()
}

console.log(failures.length ? `\n${failures.length} check(s) failed` : '\nAll checks passed')
process.exit(failures.length ? 1 : 0)
