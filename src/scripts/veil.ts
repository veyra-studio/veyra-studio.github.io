/**
 * The veil: a warp of fine threads woven through the wordmark. Threads are
 * spring chains disturbed by a slow flow field, the pointer and scroll
 * velocity. Every other thread passes *over* the letters (drawn in paper
 * color across the ink), the rest pass under — a woven look built from
 * the real HTML heading via Veyra's DOM text mirroring.
 */
import { clamp, damp, drawElementText, type Stage } from '@veyra/core'

interface Thread {
  y0: number
  off: Float32Array
  vel: Float32Array
}

export interface Veil {
  /** Re-reads layout (size, wordmark position) and redraws the text layer. */
  refresh(): void
  setActive(active: boolean): void
  destroy(): void
}

export function createVeil(stage: Stage, canvas: HTMLCanvasElement, wordmark: HTMLElement): Veil {
  const ctx = canvas.getContext('2d')!
  const textCanvas = document.createElement('canvas')
  const layer = document.createElement('canvas')
  const lctx = layer.getContext('2d')!
  const styles = getComputedStyle(document.documentElement)
  const ink = styles.getPropertyValue('--ink').trim() || '#131311'
  const paper = styles.getPropertyValue('--paper').trim() || '#f1ede4'
  const signal = styles.getPropertyValue('--signal').trim() || '#e0412a'

  let w = 1
  let h = 1
  let dpr = 1
  let threads: Thread[] = []
  let segs = 80
  let textX = 0
  let textY = 0
  let active = true
  let wave = 0
  let drawnOnce = false

  const build = () => {
    const rect = canvas.getBoundingClientRect()
    w = Math.max(1, rect.width)
    h = Math.max(1, rect.height)
    dpr = Math.min(2, window.devicePixelRatio || 1, stage.quality?.dpr.value ?? 2)
    for (const c of [canvas, layer]) {
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
    }
    const spacing = w < 700 ? 11 : 9
    const count = clamp(Math.round(h / spacing), 30, 120)
    segs = clamp(Math.round(w / 14), 40, 140)
    threads = Array.from({ length: count }, (_, i) => ({
      y0: ((i + 0.5) / count) * h,
      off: new Float32Array(segs + 1),
      vel: new Float32Array(segs + 1),
    }))
    // The wordmark, drawn from the live DOM (font, size, line breaks).
    const drawn = drawElementText(wordmark, { scale: dpr, canvas: textCanvas, color: ink })
    const wr = wordmark.getBoundingClientRect()
    textX = wr.left - rect.left - drawn.padding
    textY = wr.top - rect.top - drawn.padding
    document.documentElement.classList.add('veil-text')
    drawnOnce = false
  }

  const step = (dt: number, time: number) => {
    const p = stage.pointer
    const rect = canvas.getBoundingClientRect()
    const px = p ? p.sx - rect.left : -9999
    const py = p ? p.sy - rect.top : -9999
    const speed = p ? Math.min(1, p.speed / 1500) : 0
    const radius = 120 + speed * 120
    const scrollV = stage.scroll ? stage.scroll.velocity : 0
    wave = damp(wave, clamp(scrollV / 2500, -1, 1), 4, dt)
    const k = 90
    const c = Math.exp(-9 * dt)
    for (let i = 0; i < threads.length; i++) {
      const t = threads[i]!
      for (let j = 0; j <= segs; j++) {
        const x = (j / segs) * w
        let target =
          Math.sin(x * 0.0042 + time * 0.55 + i * 0.31) * 5 +
          Math.sin(x * 0.011 - time * 0.8 + i * 0.12) * 2.4 +
          Math.sin(i * 0.9 + x * 0.002 + time * 0.3) * wave * 28
        const dx = x - px
        const dy = t.y0 + t.off[j]! - py
        const d2 = dx * dx + dy * dy
        if (d2 < radius * radius) {
          const d = Math.sqrt(d2)
          const f = (1 - d / radius) ** 2
          target += (dy >= 0 ? 1 : -1) * f * (26 + speed * 30)
        }
        t.vel[j] = (t.vel[j]! + (target - t.off[j]!) * k * dt) * c
        t.off[j] = t.off[j]! + t.vel[j]! * dt
      }
    }
  }

  const tracePath = (c: CanvasRenderingContext2D, filter: (i: number) => boolean) => {
    c.beginPath()
    for (let i = 0; i < threads.length; i++) {
      if (!filter(i)) continue
      const t = threads[i]!
      c.moveTo(0, t.y0 + t.off[0]!)
      for (let j = 1; j <= segs; j++) c.lineTo((j / segs) * w, t.y0 + t.off[j]!)
    }
  }

  const draw = () => {
    const p = stage.pointer
    const rect = canvas.getBoundingClientRect()
    const py = p && p.inside ? p.sy - rect.top : -9999
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    ctx.lineWidth = 1
    ctx.strokeStyle = ink
    ctx.globalAlpha = 0.16
    tracePath(ctx, () => true)
    ctx.stroke()
    // Threads near the pointer take the signal color.
    ctx.globalAlpha = 0.9
    ctx.strokeStyle = signal
    ctx.lineWidth = 1.2
    tracePath(ctx, (i) => Math.abs(threads[i]!.y0 - py) < 14)
    ctx.stroke()
    ctx.globalAlpha = 1

    // Text layer: the wordmark, with the "over" threads cut across it in paper.
    lctx.setTransform(1, 0, 0, 1, 0, 0)
    lctx.clearRect(0, 0, layer.width, layer.height)
    lctx.drawImage(textCanvas, textX * dpr, textY * dpr)
    lctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    lctx.globalCompositeOperation = 'source-atop'
    lctx.strokeStyle = paper
    lctx.lineWidth = 1.5
    tracePath(lctx, (i) => i % 2 === 0)
    lctx.stroke()
    lctx.globalCompositeOperation = 'source-over'
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.drawImage(layer, 0, 0)
    drawnOnce = true
  }

  build()
  const offFrame = stage.onFrame((f) => {
    if (!active) return
    if (stage.reducedMotion.value) {
      if (!drawnOnce) draw()
      return
    }
    step(Math.min(f.delta, 1 / 30), f.time)
    draw()
  })
  const offLayout = stage.viewport.onLayout(() => build())

  return {
    refresh: build,
    setActive(v) {
      active = v
    },
    destroy() {
      offFrame()
      offLayout()
      document.documentElement.classList.remove('veil-text')
    },
  }
}
