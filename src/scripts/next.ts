/**
 * "New in 0.2": a row of live demos that is itself a horizontal section,
 * followed by a marquee band. Every effect is the page's own Veyra stage
 * at work — the row travels rightward on the Persian and Arabic pages,
 * leftward on the English and Turkish ones.
 */
import {
  damp,
  draggable,
  flip,
  horizontal,
  kashida,
  magnetic,
  marquee,
  Phase,
  scrambleText,
  seededRandom,
  stagger,
  tilt,
  whenVisible,
  type Draggable,
  type Stage,
  type Timeline,
} from '@veyra/core'
import { glslColor, glslMath, glslNoise, glslSdf } from '@veyra/core/glsl'
import { localNumber, pageLang } from '../i18n/numerals'

const lang = pageLang()
const rtl = document.documentElement.dir === 'rtl'
const num = (v: string | number) => localNumber(lang, v)
const two = (n: number) => num(String(n).padStart(2, '0'))

/** Runs `play` each time most of `panel` comes into view. */
const onShow = (panel: HTMLElement, play: () => void) => whenVisible(panel, play, { once: false, threshold: 0.6 })

/** Kashida: a slider stretches the words; until it is used, the panel stretches them each time it comes into view. */
function kashidaDemo(stage: Stage, panel: HTMLElement) {
  const target = panel.querySelector<HTMLElement>('[data-kashida]')
  const range = panel.querySelector<HTMLInputElement>('[data-kashida-range]')
  const output = panel.querySelector<HTMLOutputElement>('[data-kashida-level]')
  if (!target || !range || !output) return
  const k = kashida(target)
  const show = () => {
    const level = Math.floor(k.level)
    range.value = String(level)
    output.textContent = num(level)
  }
  let touched = false
  let auto: Timeline | null = null
  range.addEventListener('input', () => {
    touched = true
    auto?.kill()
    k.level = Number(range.value)
    show()
  })
  onShow(panel, () => {
    if (touched || stage.reducedMotion.value) return
    auto?.kill()
    auto = stage
      .timeline({ onUpdate: show })
      .to(k, { level: 8 }, { duration: 1.4, ease: 'drift' }, 0.25)
      .to(k, { level: 3 }, { duration: 1.1, ease: 'drift' }, '+=0.45')
    auto.play()
  })
}

/** A carousel to throw: inertia, edges that resist, snapping, arrow keys. */
function dragDemo(stage: Stage, panel: HTMLElement) {
  const track = panel.querySelector<HTMLElement>('[data-drag-track]')
  const viewport = track?.parentElement
  if (!track || !viewport) return
  // Snap points bring each card to where the first one rests.
  const snaps: number[] = []
  let drag: Draggable | null = null
  const measure = () => {
    const rtl = getComputedStyle(viewport).direction === 'rtl'
    const box = viewport.getBoundingClientRect()
    const x = drag?.x ?? 0
    const at = (card: Element) => {
      const r = card.getBoundingClientRect()
      return rtl ? box.right - r.right + x : r.left - box.left - x
    }
    const cards = Array.from(track.children)
    const first = cards[0] ? at(cards[0]) : 0
    snaps.length = 0
    for (const card of cards) snaps.push(rtl ? at(card) - first : first - at(card))
  }
  measure()
  drag = stage.use(draggable(track, { axis: 'x', bounds: 'parent', snap: snaps, keyboard: 'content' }))
  stage.onRefresh(measure)
}

/** FLIP: shuffle the tiles and promote one; every tile travels to its new box. */
function flipDemo(stage: Stage, panel: HTMLElement) {
  const grid = panel.querySelector<HTMLElement>('[data-flip-grid]')
  const button = panel.querySelector<HTMLButtonElement>('[data-flip-shuffle]')
  if (!grid || !button) return
  const random = seededRandom(7)
  const shuffle = () => {
    const tiles = Array.from(grid.children) as HTMLElement[]
    flip(
      tiles,
      () => {
        const order = [...tiles]
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1))
          ;[order[i], order[j]] = [order[j]!, order[i]!]
        }
        // The promoted tile takes an explicit 2×2 area so the others always fit around it.
        const big = order[Math.floor(random() * order.length)]
        const row = 1 + Math.floor(random() * 3)
        const column = 1 + Math.floor(random() * 3)
        for (const tile of order) {
          tile.classList.toggle('is-big', tile === big)
          tile.style.gridArea = tile === big ? `${row} / ${column} / span 2 / span 2` : ''
        }
        grid.append(...order)
      },
      {
        duration: 0.85,
        stagger: stagger(0.022, { grid: [4, 4], from: 'center', rtl }),
        immediate: stage.reducedMotion.value,
        ticker: stage.ticker,
      },
    )
  }
  button.addEventListener('click', shuffle)
  onShow(panel, () => {
    if (!stage.reducedMotion.value) stage.timeline().call(shuffle, 0.4).play()
  })
}

/** A magnetic link and a card that tilts toward the pointer (both off on touch). */
function pointerDemo(stage: Stage, panel: HTMLElement) {
  const magnet = panel.querySelector<HTMLElement>('[data-magnet]')
  const card = panel.querySelector<HTMLElement>('[data-tilt]')
  // The row moves while pinned: re-measure the magnet every frame.
  if (magnet) stage.use(magnetic(magnet, { inner: 'span', strength: 0.4, radius: 72, live: true }))
  if (card) stage.use(tilt(card, { max: 11, scale: 1.03, glare: true }))
}

/** Lines that decode in their own script whenever the panel comes into view. */
function scrambleDemo(stage: Stage, panel: HTMLElement) {
  const lines = Array.from(panel.querySelectorAll<HTMLElement>('[data-scramble]'))
  const replay = panel.querySelector<HTMLButtonElement>('[data-scramble-replay]')
  if (!lines.length) return
  let seed = 3
  const play = () => {
    if (stage.reducedMotion.value) return
    seed += 1
    lines.forEach((line, i) => scrambleText(line, { duration: 1.5, delay: i * 0.35, seed: seed * 31 + i, ticker: stage.ticker }))
  }
  replay?.addEventListener('click', play)
  onShow(panel, play)
}

const VERTEX = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`

const FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform float uTime;
uniform vec2 uSize;
uniform vec2 uPoint;
${glslNoise}
${glslSdf}
${glslColor}
${glslMath}
void main() {
  vec2 p = (vUv - 0.5) * vec2(uSize.x / uSize.y, 1.0);
  // A slowly folding height field: domain-warped fractal noise.
  float t = uTime * 0.04;
  vec2 q = p * 1.5;
  vec2 warp = vec2(fbm(vec3(q, t), 2), fbm(vec3(q + 4.7, t), 2));
  float h = fbm(vec3(q + 0.9 * warp, t * 0.5), 4);
  // Contour lines; every fourth one stronger.
  float k = h * 12.0;
  float aa = fwidth(k);
  float iso = 1.0 - smoothstep(0.0, aa * 1.25, abs(fract(k + 0.5) - 0.5));
  float major = 1.0 - smoothstep(0.0, aa * 1.6, abs(fract(k / 4.0 + 0.5) - 0.5) * 4.0);
  float lines = max(iso * 0.45, major * 0.8);
  // A sun that wobbles on noise and leans toward the pointer.
  float d = sdCircle(p - uPoint, 0.23 + 0.018 * gnoise(vec3(p * 5.0, uTime * 0.35)));
  float sun = fillAA(d, fwidth(d));
  float glow = exp(-max(d, 0.0) * 7.0);
  vec3 ink = srgbToLinear(vec3(0.075, 0.075, 0.067));
  vec3 umber = srgbToLinear(vec3(0.17, 0.155, 0.135));
  vec3 paper = srgbToLinear(vec3(0.945, 0.929, 0.894));
  vec3 signal = srgbToLinear(vec3(0.878, 0.255, 0.165));
  vec3 ground = mixOklab(ink, umber, smootherstep(-0.5, 0.7, h));
  vec3 outside = mix(ground, paper, lines * 0.5) + signal * glow * 0.22;
  vec3 inside = mix(signal, ink, lines * 0.6);
  outColor = vec4(linearToSrgb(mix(outside, inside, sun)), 1.0);
}`

/** The GLSL chunks compiled into one fragment shader, drawn only while visible. */
function noiseDemo(stage: Stage, panel: HTMLElement) {
  const demo = panel.querySelector<HTMLElement>('[data-demo="noise"]')
  const canvas = panel.querySelector<HTMLCanvasElement>('[data-noise]')
  const fallback = panel.querySelector<HTMLElement>('[data-noise-fallback]')
  if (!demo || !canvas) return
  const fail = () => {
    demo.dataset.state = 'fallback'
    if (fallback) fallback.hidden = false
  }
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false })
  if (!gl) return fail()

  let uniforms: { time: WebGLUniformLocation | null; size: WebGLUniformLocation | null; point: WebGLUniformLocation | null } | null = null
  let visible = false
  let drawn = false
  const init = () => {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'compile error')
      return shader
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link error')
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    uniforms = {
      time: gl.getUniformLocation(program, 'uTime'),
      size: gl.getUniformLocation(program, 'uSize'),
      point: gl.getUniformLocation(program, 'uPoint'),
    }
    demo.dataset.state = 'ok'
  }
  try {
    init()
  } catch (error) {
    console.warn('[veyra-studio] shader unavailable', error)
    return fail()
  }
  whenVisible(canvas, () => {
    visible = true
    return () => (visible = false)
  }, { once: false })
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, stage.quality?.dpr.value ?? 1, 1.5)
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr))
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr))
    gl.viewport(0, 0, canvas.width, canvas.height)
    drawn = false
  }
  resize()
  stage.onRefresh(resize)
  stage.quality?.dpr.subscribe(resize)
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault()
    uniforms = null
  })
  canvas.addEventListener('webglcontextrestored', () => {
    try {
      init()
      resize()
    } catch {
      fail()
    }
  })

  // The sun drifts on its own and eases toward the pointer while it is over the canvas.
  const point = { x: 0, y: 0 }
  const target = { x: 0, y: 0, on: false }
  demo.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect()
    if (!r.width || !r.height) return
    target.x = ((e.clientX - r.left) / r.width - 0.5) * (r.width / r.height)
    target.y = 0.5 - (e.clientY - r.top) / r.height
    target.on = true
  })
  demo.addEventListener('pointerleave', () => (target.on = false))

  stage.onFrame(({ time, delta }) => {
    if (!visible || !uniforms) return
    const still = stage.reducedMotion.value
    if (still && drawn) return
    const aspect = canvas.width / canvas.height
    const gx = target.on ? target.x : 0.22 * aspect * Math.cos(time * 0.21)
    const gy = target.on ? target.y : 0.13 * Math.sin(time * 0.29)
    point.x = still ? 0.18 * aspect : damp(point.x, gx, 2.6, delta)
    point.y = still ? 0.06 : damp(point.y, gy, 2.6, delta)
    gl.uniform1f(uniforms.time, still ? 24 : time)
    gl.uniform2f(uniforms.size, canvas.width, canvas.height)
    gl.uniform2f(uniforms.point, point.x, point.y)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    drawn = true
  }, Phase.render)
}

export function initNext(stage: Stage): void {
  const section = document.querySelector<HTMLElement>('.next')
  if (!section) return
  const panel = (id: string) => section.querySelector<HTMLElement>(`[data-panel="${id}"]`)
  const demos: Array<[string, (stage: Stage, panel: HTMLElement) => void]> = [
    ['kashida', kashidaDemo],
    ['drag', dragDemo],
    ['flip', flipDemo],
    ['pointer', pointerDemo],
    ['scramble', scrambleDemo],
    ['noise', noiseDemo],
  ]
  for (const [id, init] of demos) {
    const el = panel(id)
    if (el) init(stage, el)
  }

  // The row itself: vertical scrolling moves it along the reading direction.
  const count = section.querySelector<HTMLElement>('[data-next-count]')
  const bar = section.querySelector<HTMLElement>('[data-next-bar]')
  stage.use(
    horizontal(section, {
      track: '[data-next-track]',
      speed: 0.85,
      snap: true,
      panelVar: false,
      onPanel: (index) => {
        if (count) count.textContent = two(index + 1)
      },
      onProgress: (progress) => bar?.style.setProperty('--p', progress.toFixed(4)),
    }),
  )

  const band = document.querySelector<HTMLElement>('[data-marquee]')
  if (band) stage.use(marquee(band, { speed: 48, followScroll: true, scrollFactor: 0.2 }))
}
