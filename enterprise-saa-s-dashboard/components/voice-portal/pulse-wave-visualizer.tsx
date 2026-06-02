"use client"

import { useEffect, useRef } from "react"

interface PulseWaveVisualizerProps {
  isRecording: boolean
  audioData: number[]
}

// Exact CSS background colour from globals.css: oklch(0.985 0 0) ≈ #fafafa
const BG = "#fafafa"

const FILAMENTS = [
  { fm: 0.8,  po: 0,             af: 1.00, ob: 0.20, rgb: "22,110,55"   },
  { fm: 1.5,  po: Math.PI / 3,   af: 0.78, ob: 0.17, rgb: "38,155,75"   },
  { fm: 2.2,  po: Math.PI * 0.7, af: 0.55, ob: 0.28, rgb: "80,195,105"  },
  { fm: 0.65, po: Math.PI * 1.2, af: 0.62, ob: 0.13, rgb: "14, 80,38"   },
  { fm: 1.25, po: Math.PI * 0.5, af: 0.32, ob: 0.45, rgb: "155,225,155" },
]

export function PulseWaveVisualizer({ isRecording, audioData }: PulseWaveVisualizerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const rafRef     = useRef<number | null>(null)
  const tRef       = useRef(0)
  const sizeRef    = useRef({ W: 480, H: 240 })

  // Keep canvas pixel dimensions in sync with the wrapper element
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      const dpr = window.devicePixelRatio || 1
      const W = Math.round(width  * dpr)
      const H = Math.round(height * dpr)
      sizeRef.current = { W, H }
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width  = W
        canvas.height = H
      }
    })
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { willReadFrequently: false })
    if (!ctx) return

    const draw = () => {
      const { W, H } = sizeRef.current
      if (canvas.width !== W) canvas.width  = W
      if (canvas.height !== H) canvas.height = H

      const cx = W / 2
      const cy = H / 2
      const t  = tRef.current

      // Paint the exact same colour as the page background — no border visible
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, W, H)

      // Audio energy 0-1
      let energy = 0
      if (audioData.length > 0) {
        energy = audioData.reduce((s, v) => s + v, 0) / audioData.length
      }
      const live  = isRecording ? 1 : 0
      const scale = 0.22 + live * (0.68 + energy * 0.55)

      // ── Ambient glow — very soft, fully transparent at edges ──────────
      const glowR = Math.min(W, H) * 0.52 + live * 24
      const glow  = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR)
      glow.addColorStop(0,    `rgba(120,185,130,${(0.10 + live * 0.16).toFixed(2)})`)
      glow.addColorStop(0.6,  `rgba(120,185,130,${(0.03 + live * 0.05).toFixed(2)})`)
      glow.addColorStop(1,    `rgba(250,250,250,0)`)
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)           // fill whole canvas — radial already fades to 0

      // ── Flowing ribbon filaments ───────────────────────────────────────
      const SEGS = 200

      for (const f of FILAMENTS) {
        const upper: [number, number][] = []
        const lower: [number, number][] = []

        for (let i = 0; i <= SEGS; i++) {
          const r  = i / SEGS                    // 0 → 1
          const x  = r * W

          // Sine envelope — tapers wave height to 0 at left & right edges
          const env = Math.sin(r * Math.PI)

          const amp = scale * f.af * H * 0.22 * env

          // Multi-frequency superposition for organic feel
          const wave =
            Math.sin(r * Math.PI * 2.0 * f.fm + t * 1.35 + f.po)              * amp
          + Math.sin(r * Math.PI * 3.1 * f.fm - t * 0.85 + f.po * 0.65) * 0.40 * amp
          + Math.sin(r * Math.PI * 5.3 * f.fm + t * 0.50 + f.po * 1.30) * 0.18 * amp

          // Per-column audio bump
          let bump = 0
          if (isRecording && audioData.length > 0) {
            const ai = Math.floor(r * (audioData.length - 1))
            bump = (audioData[ai] - 0.45) * H * 0.08 * env * f.af
          }

          const yMid  = cy + wave + bump
          const thick = (H * 0.058 + live * H * 0.022) * f.af * env * (1 + energy * 0.35)

          upper.push([x, yMid - thick])
          lower.push([x, yMid + thick])
        }

        // ── Closed ribbon fill ─────────────────────────────────────────
        ctx.beginPath()
        // Upper edge L→R
        ctx.moveTo(upper[0][0], upper[0][1])
        for (let i = 1; i <= SEGS; i++) {
          const [ax, ay] = upper[i - 1]
          const [bx, by] = upper[i]
          ctx.quadraticCurveTo(ax, ay, (ax + bx) / 2, (ay + by) / 2)
        }
        ctx.lineTo(lower[SEGS][0], lower[SEGS][1])
        // Lower edge R→L
        for (let i = SEGS - 1; i >= 0; i--) {
          const [ax, ay] = lower[i + 1]
          const [bx, by] = lower[i]
          ctx.quadraticCurveTo(ax, ay, (ax + bx) / 2, (ay + by) / 2)
        }
        ctx.closePath()

        // Horizontal gradient — fades in from left, peaks at centre, fades out right
        const fillG = ctx.createLinearGradient(0, 0, W, 0)
        fillG.addColorStop(0,   `rgba(${f.rgb},0)`)
        fillG.addColorStop(0.18,`rgba(${f.rgb},${(f.ob * 0.55).toFixed(2)})`)
        fillG.addColorStop(0.5, `rgba(${f.rgb},${f.ob.toFixed(2)})`)
        fillG.addColorStop(0.82,`rgba(${f.rgb},${(f.ob * 0.55).toFixed(2)})`)
        fillG.addColorStop(1,   `rgba(${f.rgb},0)`)
        ctx.fillStyle = fillG
        ctx.fill()

        // ── Upper edge stroke for definition ──────────────────────────
        const strokeG = ctx.createLinearGradient(0, 0, W, 0)
        const so = Math.min(f.ob * 1.35, 0.82)
        strokeG.addColorStop(0,   `rgba(${f.rgb},0)`)
        strokeG.addColorStop(0.12,`rgba(${f.rgb},${(so * 0.7).toFixed(2)})`)
        strokeG.addColorStop(0.5, `rgba(${f.rgb},${so.toFixed(2)})`)
        strokeG.addColorStop(0.88,`rgba(${f.rgb},${(so * 0.7).toFixed(2)})`)
        strokeG.addColorStop(1,   `rgba(${f.rgb},0)`)

        ctx.beginPath()
        ctx.moveTo(upper[0][0], upper[0][1])
        for (let i = 1; i <= SEGS; i++) {
          const [ax, ay] = upper[i - 1]
          const [bx, by] = upper[i]
          ctx.quadraticCurveTo(ax, ay, (ax + bx) / 2, (ay + by) / 2)
        }
        ctx.strokeStyle = strokeG
        ctx.lineWidth   = 1.4
        ctx.stroke()
      }

      // ── Bright centre core streak (recording only) ────────────────────
      if (isRecording && energy > 0.04) {
        const sw = W * (0.42 + energy * 0.18)
        const sh = 2.5 + energy * 5
        const sg = ctx.createLinearGradient(cx - sw / 2, cy, cx + sw / 2, cy)
        sg.addColorStop(0,   "rgba(180,245,185,0)")
        sg.addColorStop(0.28,`rgba(210,255,215,${(0.38 + energy * 0.38).toFixed(2)})`)
        sg.addColorStop(0.5, `rgba(240,255,242,${(0.65 + energy * 0.30).toFixed(2)})`)
        sg.addColorStop(0.72,`rgba(210,255,215,${(0.38 + energy * 0.38).toFixed(2)})`)
        sg.addColorStop(1,   "rgba(180,245,185,0)")
        ctx.beginPath()
        ctx.ellipse(cx, cy, sw / 2, sh, 0, 0, Math.PI * 2)
        ctx.fillStyle = sg
        ctx.fill()
      }

      tRef.current  += isRecording ? 0.030 : 0.007
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isRecording, audioData])

  return (
    // Wrapper is transparent — no bg, no border, no shadow
    // Canvas fills it 100% via CSS; pixel dimensions are driven by ResizeObserver
    <div ref={wrapperRef} className="w-full" style={{ height: 240 }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  )
}
