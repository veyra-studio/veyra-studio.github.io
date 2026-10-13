/**
 * The veil: a warp of fine threads woven through the wordmark. Threads are
 * spring chains disturbed by a slow flow field, the pointer and scroll
 * velocity. Every other thread passes *over* the letters (drawn in paper
 * color across the ink), the rest pass under — a woven look built from
 * the real HTML heading via Veyra's DOM text mirroring.
 *
 * Drawn with WebGL: every segment of every thread is an instance of one
 * small quad, so a frame is four draw calls and one upload of the threads'
 * heights — where a 2D canvas spent most of the GPU's time rasterizing
 * thousands of path segments. It draws only while the hero is on screen,
 * at most 60 times a second, and 30 while nothing stirs it. Without
 * WebGL the woven wordmark is drawn once, still.
 */
import { clamp, damp, drawElementText, whenVisible, type Stage } from '@veyra/core'

export interface Veil {
  /** Re-reads layout (size, wordmark position) and redraws the text layer. */
  refresh(): void
  destroy(): void
}

type GL = WebGLRenderingContext | WebGL2RenderingContext

/** Instanced drawing in WebGL 2, or through the extension in WebGL 1. */
interface Instancing {
  divisor(index: number, divisor: number): void
  draw(count: number, instances: number): void
}

const LINE_VS = `
attribute vec2 aCorner;
attribute float aYA;
attribute float aYB;
attribute vec3 aPoint;
uniform vec2 uSize;
uniform float uStep;
uniform float uHalf;
uniform float uPad;
uniform float uMode;
uniform vec2 uBand;
uniform vec4 uText;
varying float vSide;
varying vec2 vUv;
void main() {
  // aPoint: x, the thread's rest height, flags (1: a segment starts here, 2: an over-thread).
  float keep = mod(aPoint.z, 2.0);
  if (uMode > 0.5 && uMode < 1.5) keep *= floor(aPoint.z * 0.5 + 0.25);
  if (uMode > 1.5) keep *= step(uBand.x, aPoint.y) * step(aPoint.y, uBand.y);
  vec2 a = vec2(aPoint.x, aYA);
  vec2 b = vec2(aPoint.x + uStep, aYB);
  vec2 d = normalize(b - a);
  vec2 p = mix(a, b, aCorner.x) + vec2(-d.y, d.x) * aCorner.y * (uHalf + uPad) * keep;
  vSide = aCorner.y;
  vUv = (p - uText.xy) / uText.zw;
  gl_Position = vec4(p.x / uSize.x * 2.0 - 1.0, 1.0 - p.y / uSize.y * 2.0, 0.0, 1.0);
}`

const PRECISION = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif`

const LINE_FS = `${PRECISION}
uniform vec4 uColor;
uniform float uHalfPx;
uniform float uQuadPx;
uniform float uMasked;
uniform sampler2D uTex;
varying float vSide;
varying vec2 vUv;
void main() {
  // Coverage across the line, antialiased over one device pixel.
  float a = uColor.a * clamp(uHalfPx + 0.5 - abs(vSide) * uQuadPx, 0.0, 1.0);
  if (uMasked > 0.5) a *= texture2D(uTex, vUv).a;
  gl_FragColor = vec4(uColor.rgb * a, a);
}`

const TEXT_VS = `
attribute vec2 aCorner;
uniform vec2 uSize;
uniform vec4 uText;
varying vec2 vUv;
void main() {
  vUv = vec2(aCorner.x, aCorner.y * 0.5 + 0.5);
  vec2 p = uText.xy + vUv * uText.zw;
  gl_Position = vec4(p.x / uSize.x * 2.0 - 1.0, 1.0 - p.y / uSize.y * 2.0, 0.0, 1.0);
}`

const TEXT_FS = `${PRECISION}
uniform sampler2D uTex;
varying vec2 vUv;
void main() { gl_FragColor = texture2D(uTex, vUv); }`

/** `#rrggbb` (or `#rgb`) → 0…1 channels. */
function rgb(hex: string, fallback: [number, number, number]): [number, number, number] {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return fallback
  const h = m[1]!.length === 3 ? [...m[1]!].map((c) => c + c).join('') : m[1]!
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number]
}

export function createVeil(stage: Stage, canvas: HTMLCanvasElement, wordmark: HTMLElement): Veil {
  const styles = getComputedStyle(document.documentElement)
  const inkHex = styles.getPropertyValue('--ink').trim() || '#131311'
  const ink = rgb(inkHex, [0.075, 0.075, 0.067])
  const paper = rgb(styles.getPropertyValue('--paper'), [0.945, 0.929, 0.894])
  const signal = rgb(styles.getPropertyValue('--signal'), [0.878, 0.255, 0.165])
  const textCanvas = document.createElement('canvas')

  // Layout (CSS px), threads and the flow field's fixed half.
  let w = 1
  let h = 1
  let dpr = 1
  let left = 0
  /** The canvas's top in the document: its place on screen is this minus the scroll. */
  let top = 0
  let count = 0
  let segs = 0
  let S = 0
  let restY = new Float32Array(0)
  let off = new Float32Array(0)
  let vel = new Float32Array(0)
  let ys = new Float32Array(0)
  /** sin/cos of each point's x in the flow field's three waves. */
  let wx = new Float32Array(0)
  const text = { x: 0, y: 0, w: 1, h: 1 }

  let visible = false
  let lost = false
  let drawnOnce = false
  let wave = 0
  let stirred = true
  let lastStep = -1
  let lastDraw = -1

  // ---------------------------------------------------------------------
  // WebGL, or a still 2D drawing without it.
  // ---------------------------------------------------------------------
  const options: WebGLContextAttributes = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' }
  let gl: GL | null = (canvas.getContext('webgl2', options) as WebGL2RenderingContext | null) ?? (canvas.getContext('webgl', options) as WebGLRenderingContext | null)
  const isGL2 = (g: GL): g is WebGL2RenderingContext => typeof WebGL2RenderingContext !== 'undefined' && g instanceof WebGL2RenderingContext
  let inst: Instancing | null = null
  if (gl) {
    if (isGL2(gl)) {
      const g = gl
      inst = { divisor: (i, d) => g.vertexAttribDivisor(i, d), draw: (c, n) => g.drawArraysInstanced(g.TRIANGLE_STRIP, 0, c, n) }
    } else {
      const g = gl
      const ext = g.getExtension('ANGLE_instanced_arrays')
      if (ext) inst = { divisor: (i, d) => ext.vertexAttribDivisorANGLE(i, d), draw: (c, n) => ext.drawArraysInstancedANGLE(g.TRIANGLE_STRIP, 0, c, n) }
    }
    if (!inst) {
      // WebGL without instancing (very rare): give the canvas up for a 2D one.
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      gl = null
      const fresh = canvas.cloneNode() as HTMLCanvasElement
      canvas.replaceWith(fresh)
      canvas = fresh
    }
  }
  /** MAX blending: overlapping ink threads keep one thread's tone, as in a single 2D path. */
  const maxEquation = gl ? (isGL2(gl) ? gl.MAX : (gl.getExtension('EXT_blend_minmax')?.MAX_EXT ?? 0)) : 0

  interface Resources {
    line: WebGLProgram
    textProgram: WebGLProgram
    u: Record<string, WebGLUniformLocation | null>
    tu: Record<string, WebGLUniformLocation | null>
    corners: WebGLBuffer
    heights: WebGLBuffer
    points: WebGLBuffer
    texture: WebGLTexture
  }
  let res: Resources | null = null

  const compile = (g: GL, vs: string, fs: string, attributes: string[]) => {
    const program = g.createProgram()!
    for (const [type, source] of [[g.VERTEX_SHADER, vs], [g.FRAGMENT_SHADER, fs]] as const) {
      const shader = g.createShader(type)!
      g.shaderSource(shader, source)
      g.compileShader(shader)
      if (!g.getShaderParameter(shader, g.COMPILE_STATUS) && !g.isContextLost()) throw new Error(g.getShaderInfoLog(shader) ?? 'veil: shader')
      g.attachShader(program, shader)
    }
    attributes.forEach((name, i) => g.bindAttribLocation(program, i, name))
    g.linkProgram(program)
    if (!g.getProgramParameter(program, g.LINK_STATUS) && !g.isContextLost()) throw new Error(g.getProgramInfoLog(program) ?? 'veil: link')
    return program
  }
  const uniforms = (g: GL, program: WebGLProgram, names: string[]) => Object.fromEntries(names.map((n) => [n, g.getUniformLocation(program, n)]))

  const init = (g: GL): Resources => {
    const line = compile(g, LINE_VS, LINE_FS, ['aCorner', 'aYA', 'aYB', 'aPoint'])
    const textProgram = compile(g, TEXT_VS, TEXT_FS, ['aCorner'])
    const corners = g.createBuffer()!
    g.bindBuffer(g.ARRAY_BUFFER, corners)
    // A quad as a strip: (along the segment 0…1, across −1…1).
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([0, -1, 0, 1, 1, -1, 1, 1]), g.STATIC_DRAW)
    const texture = g.createTexture()!
    g.bindTexture(g.TEXTURE_2D, texture)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
    g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    g.disable(g.DEPTH_TEST)
    g.enable(g.BLEND)
    g.clearColor(0, 0, 0, 0)
    return {
      line,
      textProgram,
      u: uniforms(g, line, ['uSize', 'uStep', 'uHalf', 'uPad', 'uMode', 'uBand', 'uText', 'uColor', 'uHalfPx', 'uQuadPx', 'uMasked', 'uTex']),
      tu: uniforms(g, textProgram, ['uSize', 'uText', 'uTex']),
      corners,
      heights: g.createBuffer()!,
      points: g.createBuffer()!,
      texture,
    }
  }
  if (gl) {
    try {
      res = init(gl)
    } catch (error) {
      console.warn('[veyra-studio] veil: WebGL unavailable', error)
      gl = null
    }
  }

  // ---------------------------------------------------------------------
  // Layout: threads, the GPU's copy of them, the wordmark.
  // ---------------------------------------------------------------------
  const build = () => {
    const rect = canvas.getBoundingClientRect()
    w = Math.max(1, rect.width)
    h = Math.max(1, rect.height)
    left = rect.left
    top = rect.top + window.scrollY
    dpr = Math.min(2, window.devicePixelRatio || 1, stage.quality?.dpr.value ?? 2)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    const spacing = w < 700 ? 11 : 9
    const nextCount = clamp(Math.round(h / spacing), 30, 120)
    const nextSegs = clamp(Math.round(w / 14), 40, 140)
    // Same grid: the threads keep their motion through a resize.
    if (nextCount !== count || nextSegs !== segs) {
      count = nextCount
      segs = nextSegs
      S = segs + 1
      off = new Float32Array(count * S)
      vel = new Float32Array(count * S)
      ys = new Float32Array(count * S)
      restY = Float32Array.from({ length: count }, (_, i) => ((i + 0.5) / count) * h)
    } else for (let i = 0; i < count; i++) restY[i] = ((i + 0.5) / count) * h
    wx = new Float32Array(S * 6)
    for (let j = 0; j < S; j++) {
      const x = (j / segs) * w
      wx[j * 6] = Math.sin(x * 0.0042)
      wx[j * 6 + 1] = Math.cos(x * 0.0042)
      wx[j * 6 + 2] = Math.sin(x * 0.011)
      wx[j * 6 + 3] = Math.cos(x * 0.011)
      wx[j * 6 + 4] = Math.sin(x * 0.002)
      wx[j * 6 + 5] = Math.cos(x * 0.002)
    }
    // The wordmark, drawn from the live DOM (font, size, line breaks), placed on whole device pixels.
    const drawn = drawElementText(wordmark, { scale: dpr, canvas: textCanvas, color: inkHex })
    const wr = wordmark.getBoundingClientRect()
    text.x = Math.round((wr.left - rect.left - drawn.padding) * dpr) / dpr
    text.y = Math.round((wr.top - rect.top - drawn.padding) * dpr) / dpr
    text.w = textCanvas.width / dpr
    text.h = textCanvas.height / dpr
    if (gl && res) upload(gl, res)
    drawnOnce = false
    lastDraw = -1
  }

  const upload = (g: GL, r: Resources) => {
    g.viewport(0, 0, canvas.width, canvas.height)
    // Per point: x, the thread's rest height, flags (a segment starts here; an over-thread).
    const points = new Float32Array(count * S * 3)
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < S; j++) {
        const k = (i * S + j) * 3
        points[k] = (j / segs) * w
        points[k + 1] = restY[i]!
        points[k + 2] = (j < segs ? 1 : 0) + (i % 2 === 0 ? 2 : 0)
      }
    }
    g.bindBuffer(g.ARRAY_BUFFER, r.points)
    g.bufferData(g.ARRAY_BUFFER, points, g.STATIC_DRAW)
    g.bindBuffer(g.ARRAY_BUFFER, r.heights)
    g.bufferData(g.ARRAY_BUFFER, ys.byteLength, g.DYNAMIC_DRAW)
    g.bindTexture(g.TEXTURE_2D, r.texture)
    if (textCanvas.width && textCanvas.height) g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, textCanvas)
  }

  // ---------------------------------------------------------------------
  // The threads' motion.
  // ---------------------------------------------------------------------
  const step = (dt: number, time: number) => {
    const p = stage.pointer
    const on = p?.inside === true
    const px = on ? p!.sx - left : -9999
    const py = on ? p!.sy - (top - stage.scrollY) : -9999
    const speed = p ? Math.min(1, p.speed / 1500) : 0
    const radius = 120 + speed * 120
    const r2 = radius * radius
    const push = 26 + speed * 30
    const scrollV = stage.scroll ? stage.scroll.velocity : 0
    wave = damp(wave, clamp(scrollV / 2500, -1, 1), 4, dt)
    const k = 90 * dt
    const c = Math.exp(-9 * dt)
    let fastest = 0
    for (let i = 0; i < count; i++) {
      // sin(a + b) = sin a·cos b + cos a·sin b: the points' half (a) is fixed, the thread's (b) moves.
      const b1 = time * 0.55 + i * 0.31
      const b2 = -time * 0.8 + i * 0.12
      const b3 = i * 0.9 + time * 0.3
      const s1 = Math.sin(b1) * 5
      const c1 = Math.cos(b1) * 5
      const s2 = Math.sin(b2) * 2.4
      const c2 = Math.cos(b2) * 2.4
      const s3 = Math.sin(b3) * wave * 28
      const c3 = Math.cos(b3) * wave * 28
      const y0 = restY[i]!
      // (A thread strays at most ~90 px from its rest.)
      const near = Math.abs(y0 - py) < radius + 100
      for (let j = 0; j < S; j++) {
        const q = j * 6
        let target = wx[q]! * c1 + wx[q + 1]! * s1 + wx[q + 2]! * c2 + wx[q + 3]! * s2 + wx[q + 4]! * c3 + wx[q + 5]! * s3
        const n = i * S + j
        if (near) {
          const dx = (j / segs) * w - px
          const dy = y0 + off[n]! - py
          const d2 = dx * dx + dy * dy
          if (d2 < r2) {
            const f = (1 - Math.sqrt(d2) / radius) ** 2
            target += (dy >= 0 ? 1 : -1) * f * push
          }
        }
        const v = (vel[n]! + (target - off[n]!) * k) * c
        vel[n] = v
        off[n] = off[n]! + v * dt
        if (v > fastest) fastest = v
        else if (-v > fastest) fastest = -v
      }
    }
    // Something still moves it: the pointer sweeping over it, the scroll, or the springs settling.
    const sweeping = on && p!.speed > 30 && py > -radius && py < h + radius
    stirred = sweeping || Math.abs(wave) > 0.02 || fastest > 6
  }

  // ---------------------------------------------------------------------
  // Drawing.
  // ---------------------------------------------------------------------
  const draw = () => {
    if (!gl || !res || !inst) return drawStill()
    const g = gl
    const r = res
    for (let i = 0; i < count; i++) {
      const y0 = restY[i]!
      for (let j = 0, n = i * S; j < S; j++, n++) ys[n] = y0 + off[n]!
    }
    g.bindBuffer(g.ARRAY_BUFFER, r.heights)
    g.bufferSubData(g.ARRAY_BUFFER, 0, ys)
    g.clear(g.COLOR_BUFFER_BIT)

    const p = stage.pointer
    const py = p?.inside ? p.sy - (top - stage.scrollY) : -9999
    const lines = (pass: { mode: number; width: number; color: [number, number, number]; alpha: number; masked: boolean; band?: [number, number] }) => {
      g.useProgram(r.line)
      g.bindBuffer(g.ARRAY_BUFFER, r.corners)
      g.enableVertexAttribArray(0)
      g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0)
      inst!.divisor(0, 0)
      g.bindBuffer(g.ARRAY_BUFFER, r.heights)
      g.enableVertexAttribArray(1)
      g.vertexAttribPointer(1, 1, g.FLOAT, false, 4, 0)
      inst!.divisor(1, 1)
      g.enableVertexAttribArray(2)
      g.vertexAttribPointer(2, 1, g.FLOAT, false, 4, 4)
      inst!.divisor(2, 1)
      g.bindBuffer(g.ARRAY_BUFFER, r.points)
      g.enableVertexAttribArray(3)
      g.vertexAttribPointer(3, 3, g.FLOAT, false, 12, 0)
      inst!.divisor(3, 1)
      const half = pass.width / 2
      g.uniform2f(r.u.uSize!, w, h)
      g.uniform1f(r.u.uStep!, w / segs)
      g.uniform1f(r.u.uHalf!, half)
      g.uniform1f(r.u.uPad!, 1 / dpr)
      g.uniform1f(r.u.uMode!, pass.mode)
      g.uniform2f(r.u.uBand!, pass.band?.[0] ?? 0, pass.band?.[1] ?? 0)
      g.uniform4f(r.u.uText!, text.x, text.y, text.w, text.h)
      g.uniform4f(r.u.uColor!, pass.color[0], pass.color[1], pass.color[2], pass.alpha)
      g.uniform1f(r.u.uHalfPx!, half * dpr)
      g.uniform1f(r.u.uQuadPx!, (half + 1 / dpr) * dpr)
      g.uniform1f(r.u.uMasked!, pass.masked ? 1 : 0)
      g.uniform1i(r.u.uTex!, 0)
      inst!.draw(4, count * S - 1)
    }
    g.activeTexture(g.TEXTURE0)
    g.bindTexture(g.TEXTURE_2D, r.texture)
    // 1. Every thread, faint ink — one tone where threads cross.
    if (maxEquation) g.blendEquation(maxEquation)
    else g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA)
    lines({ mode: 0, width: 1, color: ink, alpha: 0.16, masked: false })
    g.blendEquation(g.FUNC_ADD)
    g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA)
    // 2. Threads near the pointer take the signal color.
    if (py > -9000) lines({ mode: 2, width: 1.2, color: signal, alpha: 0.9, masked: false, band: [py - 14, py + 14] })
    // 3. The wordmark over them…
    for (let i = 1; i <= 3; i++) g.disableVertexAttribArray(i)
    g.useProgram(r.textProgram)
    g.bindBuffer(g.ARRAY_BUFFER, r.corners)
    g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0)
    g.uniform2f(r.tu.uSize!, w, h)
    g.uniform4f(r.tu.uText!, text.x, text.y, text.w, text.h)
    g.uniform1i(r.tu.uTex!, 0)
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4)
    // 4. …and every other thread over the letters, in paper.
    lines({ mode: 1, width: 1.5, color: paper, alpha: 1, masked: true })
    reveal()
  }

  /** Without WebGL: the flow field at rest, drawn once in 2D. */
  const drawStill = () => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const layer = document.createElement('canvas')
    layer.width = canvas.width
    layer.height = canvas.height
    const lctx = layer.getContext('2d')!
    const trace = (c: CanvasRenderingContext2D, keep: (i: number) => boolean) => {
      c.beginPath()
      for (let i = 0; i < count; i++) {
        if (!keep(i)) continue
        for (let j = 0; j < S; j++) {
          const y = restY[i]! + off[i * S + j]!
          if (j) c.lineTo((j / segs) * w, y)
          else c.moveTo(0, y)
        }
      }
    }
    const css = (c: [number, number, number]) => `rgb(${c.map((v) => Math.round(v * 255)).join(' ')})`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = css(ink)
    ctx.globalAlpha = 0.16
    ctx.lineWidth = 1
    trace(ctx, () => true)
    ctx.stroke()
    ctx.globalAlpha = 1
    lctx.drawImage(textCanvas, text.x * dpr, text.y * dpr)
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    lctx.globalCompositeOperation = 'source-atop'
    lctx.strokeStyle = css(paper)
    lctx.lineWidth = 1.5
    trace(lctx, (i) => i % 2 === 0)
    lctx.stroke()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.drawImage(layer, 0, 0)
    reveal()
  }

  /** The DOM wordmark steps back once the canvas carries it. */
  const reveal = () => {
    drawnOnce = true
    document.documentElement.classList.add('veil-text')
  }

  // ---------------------------------------------------------------------
  // The loop: only while the hero shows; ≤ 60 fps, 30 while nothing stirs it.
  // ---------------------------------------------------------------------
  /** The threads eased into the flow field's shape, for a still frame. */
  const settle = () => {
    for (let n = 0; n < 40; n++) step(1 / 30, 0)
  }
  build()
  const animated = !!gl
  if (!animated) {
    settle()
    drawStill()
  }
  const offVisible = whenVisible(
    canvas,
    () => {
      visible = true
      return () => (visible = false)
    },
    { once: false },
  )
  const offFrame = stage.onFrame((f) => {
    if (!animated || !visible || lost) return
    if (stage.reducedMotion.value) {
      if (!drawnOnce) {
        settle()
        draw()
      }
      return
    }
    const now = f.time
    const interval = stirred ? 1 / 61 : 1 / 31
    if (drawnOnce && lastDraw >= 0 && now - lastDraw < interval) return
    step(lastStep < 0 ? 1 / 60 : Math.min(now - lastStep, 1 / 30), now)
    lastStep = now
    lastDraw = now
    draw()
  })
  const offLayout = stage.viewport.onLayout(() => build())
  const offDpr = stage.quality?.dpr.subscribe(() => build()) ?? (() => {})

  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
    res = null
  }
  const onRestored = () => {
    if (!gl) return
    try {
      res = init(gl)
      lost = false
      build()
    } catch {
      // Stays still: the DOM wordmark comes back.
      document.documentElement.classList.remove('veil-text')
    }
  }
  canvas.addEventListener('webglcontextlost', onLost)
  canvas.addEventListener('webglcontextrestored', onRestored)

  return {
    refresh: build,
    destroy() {
      offFrame()
      offLayout()
      offDpr()
      offVisible()
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      document.documentElement.classList.remove('veil-text')
    },
  }
}
