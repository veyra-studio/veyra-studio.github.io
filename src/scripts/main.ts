/**
 * Veyra Studio — page runtime. One Veyra stage drives the veil, the
 * demos, section reveals and the navigation.
 */
import { createStage, range, splitText, type Stage } from '@veyra/core'
import { initDemos } from './demos'
import { createVeil } from './veil'

const html = document.documentElement
const lang = html.lang === 'fa' ? 'fa' : 'en'
const stage = createStage({ quality: { dprRange: [1, 2] } })

// ---------------------------------------------------------------------
// Navigation: hides while reading down, returns on the way up; turns dark
// over dark sections.
// ---------------------------------------------------------------------
function initNav(stage: Stage) {
  const nav = document.querySelector<HTMLElement>('[data-nav]')
  if (!nav) return
  const darkSections = Array.from(document.querySelectorAll<HTMLElement>('.engine, .start'))
  let lastY = 0
  stage.onFrame(() => {
    const y = stage.scrollY
    const dir = stage.scroll?.direction ?? 0
    nav.classList.toggle('is-solid', y > 40)
    if (y > window.innerHeight * 0.6 && dir === 1 && y - lastY > 2) nav.classList.add('is-hidden')
    else if (dir === -1 || y < window.innerHeight * 0.6) nav.classList.remove('is-hidden')
    lastY = y
  })
  for (const section of darkSections) {
    stage.scene(section, {
      start: `top ${nav.offsetHeight / 2}px`,
      end: `bottom ${nav.offsetHeight / 2}px`,
      onEnter: () => nav.classList.add('is-dark'),
      onEnterBack: () => nav.classList.add('is-dark'),
      onLeave: () => nav.classList.remove('is-dark'),
      onLeaveBack: () => nav.classList.remove('is-dark'),
    })
  }
}

// ---------------------------------------------------------------------
// Hero: the woven wordmark and its entrance.
// ---------------------------------------------------------------------
async function initHero(stage: Stage) {
  const hero = document.querySelector<HTMLElement>('.hero')
  const canvas = document.querySelector<HTMLCanvasElement>('.veil')
  const wordmark = document.querySelector<HTMLElement>('[data-wordmark]')
  if (!hero || !canvas || !wordmark) return
  await document.fonts.ready
  const veil = createVeil(stage, canvas, wordmark)
  stage.scene(hero, {
    start: 'top top',
    end: 'bottom top',
    onEnterBack: () => veil.setActive(true),
    onLeave: () => veil.setActive(false),
  })
  if (!stage.reducedMotion.value) {
    const tl = stage.timeline()
    tl.fromTo(canvas, { opacity: 0 }, { opacity: 1 }, { duration: 1.6, ease: 'glide' }, 0)
      .fromTo('.hero-eyebrow, .wordmark-alt', { opacity: 0, y: 14 }, { opacity: 1, y: 0 }, { duration: 1.1, stagger: 0.12 }, 0.3)
      .fromTo('.hero-lead, .hero-ctas', { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, { duration: 1.1, stagger: 0.1 }, 0.55)
    tl.play()
  }
}

// ---------------------------------------------------------------------
// Statement: each line slides up through its mask as the section scrolls in.
// ---------------------------------------------------------------------
function initStatement(stage: Stage) {
  const el = document.querySelector<HTMLElement>('[data-statement]')
  if (!el) return
  const lines = Array.from(el.querySelectorAll<HTMLElement>('.st-line'))
  const splits = lines.map((line) => splitText(line, { type: 'words', mask: 'words' }))
  stage.scene('#statement', {
    start: 'top 85%',
    end: 'center 55%',
    onProgress(p) {
      splits.forEach((s, i) => {
        s.words.forEach((w, j) => {
          const t = stage.reducedMotion.value ? 1 : range(p, i * 0.16 + j * 0.03, i * 0.16 + j * 0.03 + 0.4)
          const e = 1 - (1 - t) ** 3
          w.style.transform = `translate3d(0, ${(1 - e) * 105}%, 0)`
        })
      })
    },
  })
}

// ---------------------------------------------------------------------
// Work: gentle parallax inside the case visual.
// ---------------------------------------------------------------------
function initWork(stage: Stage) {
  const img = document.querySelector<HTMLImageElement>('[data-parallax]')
  const visual = document.querySelector<HTMLElement>('.case-visual')
  if (!img || !visual) return
  img.addEventListener('error', () => (img.style.display = 'none'))
  stage.scene(visual, {
    start: 'top bottom',
    end: 'bottom top',
    onProgress(p) {
      if (stage.reducedMotion.value) return
      img.style.setProperty('--shift', `${(-11 + p * 10).toFixed(2)}%`)
    },
  })
}

// ---------------------------------------------------------------------
// Code block: a tiny highlighter (keywords, strings, comments).
// ---------------------------------------------------------------------
function highlight() {
  const code = document.querySelector('.code code')
  if (!code) return
  const src = code.textContent ?? ''
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  code.innerHTML = src
    .split('\n')
    .map((line) => {
      const ci = line.indexOf('//')
      const body = ci >= 0 ? line.slice(0, ci) : line
      const comment = ci >= 0 ? `<span class="tk-com">${esc(line.slice(ci))}</span>` : ''
      const hl = esc(body)
        .replace(/('[^']*')/g, '<span class="tk-str">$1</span>')
        .replace(/\b(import|from|const|export)\b/g, '<span class="tk-key">$1</span>')
      return hl + comment
    })
    .join('\n')
}

// ---------------------------------------------------------------------
// Languages: direction-aware view transitions, remembered choice, a hint
// for visitors whose browser prefers the other language.
// ---------------------------------------------------------------------
function initLanguages() {
  const store = (key: string, value?: string) => {
    try {
      if (value === undefined) return localStorage.getItem(key)
      localStorage.setItem(key, value)
    } catch {
      /* storage unavailable */
    }
    return null
  }
  store('veyra:lang', lang)
  for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-lang-switch]')) {
    link.addEventListener('click', () => store('veyra:lang', link.dataset.langSwitch ?? lang))
  }
  // Tell the transition which way to wipe (both outgoing and incoming page).
  const typeFor = (url: string) => (new URL(url, location.href).pathname.startsWith('/fa') ? 'to-fa' : 'to-en')
  window.addEventListener('pageswap', (e) => {
    const event = e as Event & { viewTransition?: { types: Set<string> }; activation?: { entry?: { url: string } } }
    const url = event.activation?.entry?.url
    if (event.viewTransition && url) event.viewTransition.types.add(typeFor(url))
  })
  window.addEventListener('pagereveal', (e) => {
    const event = e as Event & { viewTransition?: { types: Set<string> } }
    if (event.viewTransition) event.viewTransition.types.add(typeFor(location.href))
  })

  const hint = document.querySelector<HTMLElement>('[data-lang-hint]')
  if (!hint || store('veyra:hint-dismissed')) return
  const prefersFa = (navigator.languages ?? [navigator.language]).some((l) => l?.toLowerCase().startsWith('fa'))
  if (lang === 'en' ? !prefersFa : prefersFa) return
  hint.hidden = false
  hint.querySelector('[data-lang-hint-close]')?.addEventListener('click', () => {
    hint.hidden = true
    store('veyra:hint-dismissed', '1')
  })
}

// ---------------------------------------------------------------------
initNav(stage)
void initHero(stage)
initStatement(stage)
initDemos(stage, lang === 'fa' ? { low: 'پایین', medium: 'متوسط', high: 'بالا' } : { low: 'low', medium: 'medium', high: 'high' })
initWork(stage)
highlight()
initLanguages()
stage.refresh()
