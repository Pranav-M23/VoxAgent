"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AudioWaveformPlayerProps {
  duration: number // in seconds
}

export function AudioWaveformPlayer({ duration }: AudioWaveformPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [waveformData] = useState(() => 
    Array.from({ length: 80 }, () => Math.random() * 0.6 + 0.2)
  )
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const barWidth = width / waveformData.length
    const progressIndex = Math.floor((progress / 100) * waveformData.length)

    ctx.clearRect(0, 0, width, height)

    waveformData.forEach((amplitude, index) => {
      const barHeight = amplitude * height * 0.75
      const x = index * barWidth
      const y = (height - barHeight) / 2

      if (index < progressIndex) {
        ctx.fillStyle = "rgba(99, 102, 241, 0.8)"
      } else {
        ctx.fillStyle = "rgba(161, 161, 170, 0.3)"
      }

      // Rounded bar caps
      const radius = Math.min(barWidth / 2 - 1, 2)
      ctx.beginPath()
      ctx.roundRect(x + 1.5, y, barWidth - 3, barHeight, radius)
      ctx.fill()
    })
  }, [progress, waveformData])

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 100 / (duration * 10)
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, duration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentTime = (progress / 100) * duration

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg shrink-0 border-zinc-200"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 ml-0.5" />
          )}
        </Button>

        <div className="flex-1">
          <canvas
            ref={canvasRef}
            width={400}
            height={40}
            className="w-full h-10 cursor-pointer rounded-lg"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const newProgress = (x / rect.width) * 100
              setProgress(Math.max(0, Math.min(100, newProgress)))
            }}
          />
        </div>

        <div className="text-xs text-muted-foreground tabular-nums shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  )
}
