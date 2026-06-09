"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { Mic, MicOff, PhoneOff, CheckCircle } from "lucide-react"
import { PulseWaveVisualizer } from "./pulse-wave-visualizer"


declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface Message {
  id: string
  role: "ai" | "customer"
  content: string
  isStreaming?: boolean
}


interface Props {
  // token is read from the URL via useParams() — no prop needed
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"

// ── Detect Web Speech API support ──────────────────────────────────────────
// Returns true on desktop Chrome/Edge; false on iOS Safari and most mobile browsers.
function hasSpeechRecognition(): boolean {
  if (typeof window === "undefined") return false
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

// ── Detect best MediaRecorder MIME type ────────────────────────────────────
function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
  ]
  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t
  }
  return ""
}

export function VoiceFeedbackPortal({}: Props = {}) {
  const params = useParams()
  const token = (params?.token as string) ?? ""
  const [isRecording, setIsRecording] = useState(false)
  const [audioData, setAudioData] = useState<number[]>([])
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "speaking">("idle")
  const [sessionEnded, setSessionEnded] = useState(false)
  // "loading" while we validate the token, then "ready", "invalid", or "expired"
  const [sessionLoadStatus, setSessionLoadStatus] = useState<
    "loading" | "ready" | "invalid" | "expired"
  >("loading")
  const [messages, setMessages] = useState<Message[]>([])
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [sessionMeta, setSessionMeta] = useState<{ company: string; purpose: string } | null>(null)
  // Track join time for duration calculation
  const joinTimeRef = useRef<number>(Date.now())
 
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  // Tracks the currently playing AI audio so it can be interrupted
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Mobile STT: accumulated audio chunks while recording
  const audioChunksRef = useRef<Blob[]>([])
  const mimeTypeRef = useRef<string>("")

  // ── buildTranscriptText ──────────────────────────────────────────────────
  // Converts the current messages array into a readable transcript string.
  function buildTranscriptText(msgs: Message[]): string {
    return msgs
      .map((m) => `${m.role === "ai" ? "Agent" : "Customer"}: ${m.content}`)
      .join("\n")
  }

  // ── completeSessionOnBackend ─────────────────────────────────────────────
  // Marks the session as completed on the server, triggering analytics.
  async function completeSessionOnBackend(msgs: Message[]) {
    const transcript = buildTranscriptText(msgs)
    const duration = Math.round((Date.now() - joinTimeRef.current) / 1000)
    try {
      await fetch(`${API_BASE}/api/session/${token}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, duration }),
      })
      console.log("[Session] Marked completed on backend.")
    } catch (e) {
      console.warn("[Session] Could not mark session completed:", e)
    }
  }

  // ── endSession ─────────────────────────────────────────────────────────────
  // Stops mic + audio, calls backend to complete session, shows thank-you screen.
  const endSession = useCallback((currentMessages?: Message[]) => {
    // Stop media recorder + mic tracks
    if (mediaRecorderRef.current) {
      try { mediaRecorderRef.current.stop() } catch {}
      try { mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop()) } catch {}
    }
    // Stop audio context
    if (audioContextRef.current) {
      try { audioContextRef.current.close() } catch {}
    }
    // Cancel animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    // Stop speech recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    // Interrupt any playing AI audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsRecording(false)
    setAudioData([])
    setStatus("idle")
    setSessionEnded(true)
  }, [])

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [messages, currentTranscript])

  // ── Session validation on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!token) return
    joinTimeRef.current = Date.now()

    async function validateSession() {
      try {
        const res = await fetch(`${API_BASE}/api/session/${token}`)
        if (res.status === 410) { setSessionLoadStatus("expired"); return }
        if (!res.ok)            { setSessionLoadStatus("invalid");  return }

        const sessionData = await res.json()
        const company = sessionData.company_name || "us"
        const purpose = sessionData.purpose || "assist you"
        const customerName = sessionData.customer?.name || ""
        const firstName = customerName.split(" ")[0] || ""
        const nameGreeting = firstName ? `, ${firstName}` : ""

        setSessionMeta({ company, purpose })

        const greeting = `Hi${nameGreeting}! I'm calling from ${company} regarding ${purpose}. Could you spare a moment?`

        setMessages([{ id: "1", role: "ai", content: greeting }])

        // Mark it as joined — fire-and-forget
        fetch(`${API_BASE}/api/session/${token}/join`, {
          method: "POST",
        }).catch(() => {})

        setSessionLoadStatus("ready")
      } catch {
        setSessionLoadStatus("invalid")
      }
    }
    validateSession()
  }, [token])

  // ── Intro voice on page load ─────────────────────────────────────────────
  useEffect(() => {
    if (sessionLoadStatus !== "ready" || messages.length === 0) return
    const introText = messages[0]?.content
    if (!introText) return

    async function playIntro() {
      setStatus("speaking")
      try {
        const res = await fetch(`${API_BASE}/api/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: introText }),
        })
        const data = await res.json()
        if (data.audio) {
          await new Promise<void>((resolve) => {
            const audio = new Audio(`data:audio/wav;base64,${data.audio}`)
            audioRef.current = audio
            audio.onended = () => { audioRef.current = null; resolve() }
            audio.onerror = () => { audioRef.current = null; resolve() }
            audio.play().catch(() => { audioRef.current = null; resolve() })
          })
        }
      } catch (e) {
        console.warn("[Intro TTS] Could not play intro audio:", e)
      }
      setStatus("idle")
    }
    playIntro()
  }, [sessionLoadStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── transcribeWithSarvam ─────────────────────────────────────────────────
  // Sends recorded audio blobs to the backend /api/stt endpoint (Sarvam STT).
  // Used on mobile where Web Speech API is unavailable.
  async function transcribeWithSarvam(chunks: Blob[], mimeType: string): Promise<string> {
    if (chunks.length === 0) return ""
    const blob = new Blob(chunks, { type: mimeType || "audio/webm" })
    const formData = new FormData()
    // Use the correct file extension so the backend can infer MIME
    const ext = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "mp4" : "webm"
    formData.append("audio", blob, `recording.${ext}`)
    try {
      const res = await fetch(`${API_BASE}/api/stt`, {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        return data.transcript || ""
      }
    } catch (e) {
      console.warn("[STT] Sarvam STT request failed:", e)
    }
    return ""
  }

 const startRecording = useCallback(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000,
      },
    })

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)

    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8

    source.connect(analyser)

    audioContextRef.current = audioContext
    analyserRef.current = analyser

    // Determine the best supported MIME type for this device
    const mimeType = getSupportedMimeType()
    mimeTypeRef.current = mimeType
    audioChunksRef.current = []

    const recorderOptions = mimeType ? { mimeType } : {}
    const mediaRecorder = new MediaRecorder(stream, recorderOptions)
    mediaRecorderRef.current = mediaRecorder

    // Collect audio chunks for Sarvam STT fallback
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunksRef.current.push(e.data)
      }
    }

    mediaRecorder.start(250) // collect chunks every 250ms

    setIsRecording(true)
    setStatus("recording")
    setCurrentTranscript("")

    // ── Use Web Speech API if available (desktop Chrome/Edge) ────────────
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        let transcript = ""

        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }

        setCurrentTranscript(transcript)
      }

      recognition.onerror = (event: any) => {
        // On mobile, if it errors just ignore — we'll use Sarvam STT
        console.warn("[SpeechRecognition] error:", event.error)
      }

      try {
        recognition.start()
        recognitionRef.current = recognition
      } catch {
        recognitionRef.current = null
      }
    }

    const dataArray = new Uint8Array(
      analyser.frequencyBinCount
    )

    const updateAudioData = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray)

        const normalized = Array.from(dataArray).map(
          (v) => v / 255
        )

        setAudioData(normalized)
      }

      animationRef.current =
        requestAnimationFrame(updateAudioData)
    }

    updateAudioData()
  } catch (error) {
    console.error("Error accessing microphone:", error)
    setStatus("idle")
  }
}, [])

  const stopRecording = useCallback(async () => {
  if (mediaRecorderRef.current) {
    mediaRecorderRef.current.stop()
    mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
  }

  if (audioContextRef.current) {
    audioContextRef.current.close()
  }

  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current)
  }
  if (recognitionRef.current) {
    try { recognitionRef.current.stop() } catch {}
    recognitionRef.current = null
  }

  setIsRecording(false)
  setAudioData([])
  setStatus("processing")

  // ── Determine the final transcript ──────────────────────────────────────
  // On desktop: use the live Web Speech API transcript.
  // On mobile: fall back to Sarvam STT on the recorded audio chunks.
  let finalTranscript = currentTranscript

  if (!finalTranscript && !hasSpeechRecognition()) {
    // Mobile path — wait a tick for the last ondataavailable to fire
    await new Promise((r) => setTimeout(r, 300))
    finalTranscript = await transcribeWithSarvam(
      audioChunksRef.current,
      mimeTypeRef.current
    )
  }

  // Ultimate fallback so the conversation can continue even if STT fails
  if (!finalTranscript) {
    finalTranscript = "(no speech detected)"
  }

  setMessages((prev) => [
    ...prev,
    {
      id: Date.now().toString(),
      role: "customer",
      content: finalTranscript,
    },
  ])

  setCurrentTranscript("")

  try {
    const response = await fetch(
      `${API_BASE}/api/conversation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_token: token,
          message: finalTranscript,
        }),
      }
    )

    const data = await response.json()

    const updatedMessages: Message[] = []
    setMessages((prev) => {
      const next = [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai" as const,
          content: data.reply,
        },
      ]
      updatedMessages.push(...next)
      return next
    })

    // ── Play TTS audio ──────────────────────────────────────────────────────
    if (data.audio) {
      setStatus("speaking")
      try {
        await new Promise<void>((resolve) => {
          const audio = new Audio(`data:audio/wav;base64,${data.audio}`)
          audioRef.current = audio
          audio.onended = () => { audioRef.current = null; resolve() }
          audio.onerror = () => { audioRef.current = null; resolve() }
          audio.play().catch(() => { audioRef.current = null; resolve() })
        })
      } catch (audioErr) {
        console.error("Audio playback error:", audioErr)
      }
    }

    // ── Handle end_call signal from AI ──────────────────────────────────────
    if (data.end_call) {
      // AI triggered the end — complete session on backend then show thank-you
      await completeSessionOnBackend(updatedMessages)
      endSession(updatedMessages)
      return
    }

    // Normal turn: audio done, restart mic for next customer input
    startRecording()
    return // skip setStatus("idle") below
  } catch (error) {
    console.error("Conversation API error:", error)

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content:
          "Sorry, I couldn't process your feedback right now.",
      },
    ])
  }

  setStatus("idle")
}, [currentTranscript, token, endSession, startRecording])
    
  const handleTapToSpeak = () => {
    if (isRecording) {
      stopRecording()
    } else {
      // If AI is speaking, interrupt it and take the mic
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      startRecording()
    }
  }

  // ── handleEndCall ──────────────────────────────────────────────────────────
  // User manually pressed End Call — complete session and show thank-you.
  const handleEndCall = useCallback(async () => {
    // Capture current messages before state teardown
    let currentMsgs: Message[] = []
    setMessages((prev) => { currentMsgs = prev; return prev })

    // Small delay to ensure state is captured
    await new Promise((r) => setTimeout(r, 50))

    // Stop everything immediately for instant UI feedback
    if (mediaRecorderRef.current) {
      try { mediaRecorderRef.current.stop() } catch {}
      try { mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop()) } catch {}
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close() } catch {}
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsRecording(false)
    setAudioData([])
    setStatus("idle")
    setSessionEnded(true)

    // Complete session on backend (fire-and-forget — UI already shows thank-you)
    if (currentMsgs.length > 0) {
      const transcript = buildTranscriptText(currentMsgs)
      const duration = Math.round((Date.now() - joinTimeRef.current) / 1000)
      fetch(`${API_BASE}/api/session/${token}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, duration }),
      }).catch((e) => console.warn("[Session] Complete failed:", e))
    }
  }, [token])

  // ── Session loading / error screens ───────────────────────────────────────
  if (sessionLoadStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Connecting…</p>
        </div>
      </div>
    )
  }

  if (sessionLoadStatus === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="text-center space-y-3 max-w-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto">
            <PhoneOff className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Link expired</h2>
          <p className="text-sm text-muted-foreground">
            This feedback link has expired. Please contact us if you'd like to share your experience.
          </p>
        </div>
      </div>
    )
  }

  if (sessionLoadStatus === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="text-center space-y-3 max-w-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
            <PhoneOff className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Invalid link</h2>
          <p className="text-sm text-muted-foreground">
            This link is not valid. Please check your SMS or contact support.
          </p>
        </div>
      </div>
    )
  }

  // ── Thank-you screen ──────────────────────────────────────────────────────
  if (sessionEnded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">Thank you!</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
              Your feedback has been recorded. We appreciate you taking the time to share your experience.
            </p>
          </div>
          <p className="text-xs text-muted-foreground/50 pt-2">You may close this window.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8 bg-background">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-medium text-foreground tracking-tight">
          {sessionMeta
            ? `${sessionMeta.company} · ${sessionMeta.purpose}`
            : "Voice Assistant"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {status === "idle"       && "Tap to share your thoughts"}
          {status === "recording"  && "Listening — tap to stop"}
          {status === "processing" && "Thinking..."}
          {status === "speaking"   && "Speaking — tap to interrupt"}
        </p>
      </div>

      {/* Visualizer — moves up slightly when active */}
      <div className={`w-full max-w-md transition-all duration-500 ease-out ${isRecording ? "mb-4 -mt-2" : "mb-6"}`}>
        <PulseWaveVisualizer isRecording={isRecording} audioData={audioData} />
      </div>

      {/* Tap to Speak Button */}
      <button
        onClick={handleTapToSpeak}
        disabled={status === "processing"}
        className={`
          flex items-center justify-center gap-2.5
          px-6 py-3 rounded-xl
          font-medium text-sm
          transition-all duration-200
          border
          ${
            isRecording
              ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25"
              : status === "speaking"
              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25"
              : "bg-card text-foreground border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300"
          }
          ${status === "processing" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {isRecording ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        <span>
          {status === "idle"       && "Tap to Speak"}
          {status === "recording"  && "Tap to Stop"}
          {status === "processing" && "Thinking..."}
          {status === "speaking"   && "Tap to Interrupt"}
        </span>
      </button>

      {/* End Call button */}
      <button
        onClick={handleEndCall}
        className="
          flex items-center justify-center gap-2
          px-5 py-2.5 rounded-xl mt-3
          bg-red-600 text-white text-sm font-medium
          hover:bg-red-700 active:bg-red-800
          transition-colors duration-150
          shadow-sm shadow-red-600/30
          cursor-pointer
        "
      >
        <PhoneOff className="w-4 h-4" />
        End Call
      </button>

      {/* Conversation Transcript */}
      <div className="w-full max-w-md mt-6">
        <div 
          ref={transcriptRef}
          className="h-56 overflow-y-auto px-1 space-y-3 scroll-smooth"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "customer" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed
                  ${message.role === "ai" 
                    ? "bg-zinc-100 text-zinc-700 rounded-tl-md" 
                    : "bg-emerald-600 text-white rounded-tr-md"
                  }
                `}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {/* Live streaming customer transcript */}
          {isRecording && currentTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tr-md text-[13px] leading-relaxed bg-emerald-600/80 text-white">
                {currentTranscript}
                <span className="inline-block w-1 h-3.5 ml-0.5 bg-white/70 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 text-center">
        <p className="text-xs text-muted-foreground/60">
          Your feedback helps us improve
        </p>
      </div>
    </div>
  )
}
