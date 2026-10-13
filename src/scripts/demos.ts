/**
 * Live engine demos for the "Engine" section. Each one is the page's own
 * Veyra stage at work — nothing is simulated.
 */
import { clamp, Spring, splitText, type Stage } from '@veyra/core'
import { localNumber, pageLang } from '../i18n/numerals'

const lang = pageLang()
const rtl = document.documentElement.dir === 'rtl'
// Persian and Arabic digits with «٫»; the Turkish decimal comma.
const num = (v: string) => localNumber(lang, v)

function fitCanvas(canvas: HTMLCanvasElement): { w: number; h: number; dpr: number } {
  const r = canvas.getBoundingClientRect()
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = Math.max(1, Math.round(r.width * dpr))
  canvas.height = Math.max(1, Math.round(r.height * dpr))
  return { w: r.width, h: r.height, dpr }
}

/** Frame-time sparkline and readouts from the stage's own ticker. */
function loopDemo(stage: Stage, root: HTMLElement, visible: () => boolean) {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-spark]')!
  const fpsEl = root.querySelector('[data-fps]')!
  const frameEl = root.querySelector('[data-frame]')!
  const refreshEl = root.querySelector('[data-refresh]')!
  const ctx = canvas.getContext('2d')!
  const N = 120
  const samples = new Float32Array(N)
  let head = 0
  let size = fitCanvas(canvas)
  let tick = 0
  stage.viewport.onLayout(() => (size = fitCanvas(canvas)))
  stage.onFrame((f) => {
    samples[head] = f.rawDelta * 1000
    head = (head + 1) % N
    if (!visible()) return
    const { w, h, dpr } = size
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const pad = 18
    const max = 40
    const y = (ms: number) => h - pad - (Math.min(ms, max) / max) * (h - pad * 2)
    // Budget lines: 60 fps and 30 fps.
    ctx.strokeStyle = 'rgba(241,237,228,0.14)'
    ctx.setLineDash([3, 5])
    for (const ms of [16.7, 33.3]) {
      ctx.beginPath()
      ctx.moveTo(pad, y(ms))
      ctx.lineTo(w - pad, y(ms))
      ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.beginPath()
    for (let i = 0; i < N; i++) {
      const ms = samples[(head + i) % N]!
      const x = pad + (i / (N - 1)) * (w - pad * 2)
      const xx = rtl ? w - x : x
      if (i === 0) ctx.moveTo(xx, y(ms))
      else ctx.lineTo(xx, y(ms))
    }
    ctx.strokeStyle = '#e0412a'
    ctx.lineWidth = 1.6
    ctx.stroke()
    if (++tick % 10 === 0) {
      const avg = samples.reduce((a, b) => a + b, 0) / N
      fpsEl.textContent = num(String(Math.round(1000 / Math.max(1, avg))))
      frameEl.textContent = num(`${avg.toFixed(1)}ms`)
      refreshEl.textContent = num(`${stage.quality?.refreshRate ?? 60}Hz`)
    }
  })
}

/** Drag the dot; on release an analytic spring brings it home. */
function springDemo(stage: Stage, root: HTMLElement, visible: () => boolean) {
  const box = root.querySelector<HTMLElement>('[data-spring]')!
  const dot = root.querySelector<HTMLElement>('[data-dot]')!
  const trail = root.querySelector<HTMLCanvasElement>('[data-trail]')!
  const ctx = trail.getContext('2d')!
  let size = fitCanvas(trail)
  stage.viewport.onLayout(() => (size = fitCanvas(trail)))
  const sx = new Spring(0, { stiffness: 180, damping: 9 })
  const sy = new Spring(0, { stiffness: 180, damping: 9 })
  let dragging = false
  let ox = 0
  let oy = 0
  const points: Array<[number, number]> = []

  dot.addEventListener('pointerdown', (e) => {
    dragging = true
    dot.setPointerCapture(e.pointerId)
    ox = e.clientX - sx.value
    oy = e.clientY - sy.value
  })
  dot.addEventListener('pointermove', (e) => {
    if (!dragging) return
    const r = box.getBoundingClientRect()
    sx.snap(clamp(e.clientX - ox, -r.width / 2 + 20, r.width / 2 - 20))
    sy.snap(clamp(e.clientY - oy, -r.height / 2 + 20, r.height / 2 - 20))
  })
  const release = () => {
    dragging = false
    sx.target = 0
    sy.target = 0
  }
  dot.addEventListener('pointerup', release)
  dot.addEventListener('pointercancel', release)
  // Keyboard: a nudge in any direction, then the spring takes over.
  dot.tabIndex = 0
  dot.setAttribute('role', 'button')
  dot.setAttribute('aria-label', dot.dataset.label ?? 'Spring dot — nudge it with the arrow keys')
  dot.addEventListener('keydown', (e) => {
    const kick = 900
    if (e.key === 'ArrowLeft') sx.impulse(-kick)
    else if (e.key === 'ArrowRight') sx.impulse(kick)
    else if (e.key === 'ArrowUp') sy.impulse(-kick)
    else if (e.key === 'ArrowDown') sy.impulse(kick)
    else return
    e.preventDefault()
  })

  // Drawn while it shows; at rest, once the trail has drawn itself into the anchor, the last frame stays true.
  let restFrames = 0
  stage.onFrame((f) => {
    if (!dragging) {
      sx.step(f.delta)
      sy.step(f.delta)
    }
    if (!visible()) return
    restFrames = !dragging && sx.settled && sy.settled ? restFrames + 1 : 0
    if (restFrames > 92) return
    dot.style.transform = `translate3d(${sx.value}px, ${sy.value}px, 0)`
    points.push([sx.value, sy.value])
    if (points.length > 90) points.shift()
    const { w, h, dpr } = size
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    ctx.beginPath()
    points.forEach(([x, y], i) => {
      const X = w / 2 + x
      const Y = h / 2 + y
      if (i === 0) ctx.moveTo(X, Y)
      else ctx.lineTo(X, Y)
    })
    ctx.strokeStyle = 'rgba(224,65,42,0.55)'
    ctx.lineWidth = 1.4
    ctx.stroke()
    // The spring itself: a line from the anchor to the dot.
    ctx.beginPath()
    ctx.moveTo(w / 2, h / 2)
    ctx.lineTo(w / 2 + sx.value, h / 2 + sy.value)
    ctx.strokeStyle = 'rgba(241,237,228,0.35)'
    ctx.lineWidth = 1
    ctx.stroke()
  })
}

/** This card's own scroll progress. */
function scrollDemo(stage: Stage, root: HTMLElement) {
  const value = root.querySelector<HTMLOutputElement>('[data-scroll-value]')!
  const bar = root.querySelector<HTMLElement>('[data-scroll-bar]')!
  stage.scene(root, {
    start: 'top bottom',
    end: 'bottom top',
    onProgress(p) {
      value.textContent = num(p.toFixed(2))
      bar.parentElement!.style.setProperty('--p', p.toFixed(4))
      bar.style.setProperty('--p', p.toFixed(4))
    },
  })
}

/** Naive split vs Veyra split, waving continuously. */
function typeDemo(stage: Stage, root: HTMLElement, visible: () => boolean) {
  const naiveEl = root.querySelector<HTMLElement>('[data-type-naive]')!
  const veyraEl = root.querySelector<HTMLElement>('[data-type-veyra]')!
  // Naive: one inline-block per code point — what most splitters do.
  const text = naiveEl.textContent ?? ''
  naiveEl.setAttribute('aria-label', text)
  naiveEl.innerHTML = [...text].map((c) => (c === ' ' ? ' ' : `<span data-naive aria-hidden="true">${c}</span>`)).join('')
  const naive = Array.from(naiveEl.querySelectorAll<HTMLElement>('[data-naive]'))
  let veyra = splitText(veyraEl, { type: 'chars' }).chars
  void document.fonts.ready.then(() => (veyra = splitText(veyraEl, { type: 'chars' }).chars))
  stage.onFrame((f) => {
    if (!visible() || stage.reducedMotion.value) return
    const t = f.time
    const wave = (els: HTMLElement[]) =>
      els.forEach((el, i) => {
        el.style.transform = `translate3d(0, ${Math.sin(t * 3 - i * 0.55) * 0.09}em, 0)`
      })
    wave(naive)
    wave(veyra)
  })
}

/** Adaptive quality readout. */
function qualityDemo(stage: Stage, root: HTMLElement, tiers: Record<string, string>) {
  const bar = root.querySelector<HTMLElement>('[data-quality-bar]')!
  const tierEl = root.querySelector('[data-tier]')!
  const dprEl = root.querySelector('[data-dpr]')!
  const q = stage.quality
  if (!q) return
  q.level.subscribe((l) => bar.style.setProperty('--q', l.toFixed(3)), { immediate: true })
  q.tier.subscribe((t) => (tierEl.textContent = tiers[t] ?? t), { immediate: true })
  q.dpr.subscribe((d) => (dprEl.textContent = num(`${d.toFixed(2)}×`)), { immediate: true })
}

export function initDemos(stage: Stage, tiers: Record<string, string>): void {
  const caps = Array.from(document.querySelectorAll<HTMLElement>('[data-cap]'))
  const visibility = new Map<HTMLElement, boolean>()
  for (const cap of caps) {
    visibility.set(cap, false)
    stage.scene(cap, {
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => visibility.set(cap, true),
      onEnterBack: () => visibility.set(cap, true),
      onLeave: () => visibility.set(cap, false),
      onLeaveBack: () => visibility.set(cap, false),
      // Cards rise in as they enter.
      onProgress(p) {
        if (stage.reducedMotion.value) return
        cap.style.setProperty('--in', clamp(p * 4.5).toFixed(3))
      },
    })
  }
  const byId = (id: string) => caps.find((c) => c.dataset.cap === id)
  const vis = (el: HTMLElement | undefined) => () => (el ? visibility.get(el) ?? false : false)
  const loop = byId('loop')
  const motion = byId('motion')
  const scroll = byId('scroll')
  const type = byId('type')
  const quality = byId('quality')
  if (loop) loopDemo(stage, loop, vis(loop))
  if (motion) springDemo(stage, motion, vis(motion))
  if (scroll) scrollDemo(stage, scroll)
  if (type) typeDemo(stage, type, vis(type))
  if (quality) qualityDemo(stage, quality, tiers)
}
