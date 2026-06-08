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
 
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  // Tracks the currently playing AI audio so it can be interrupted
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ── endSession ─────────────────────────────────────────────────────────────
  // Stops mic + audio and shows the thank-you screen.
  // Called by: End Call button, AI end_call signal.
  const endSession = useCallback(() => {
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

  // Simulate live transcription while recording
 
  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [messages, currentTranscript])

  // ── Session validation on mount ──────────────────────────────────────────
  // Validates the URL token against the backend. On success, marks the
  // session as "joined" and unlocks the intro voice + conversation.
  useEffect(() => {
    // Don't fire until useParams() has resolved the token from the URL
    if (!token) return
    async function validateSession() {
      try {
        // 1. Check that the session exists and is active
        const res = await fetch(`${API_BASE}/api/session/${token}`)
        if (res.status === 410) { setSessionLoadStatus("expired"); return }
        if (!res.ok)            { setSessionLoadStatus("invalid");  return }

        const sessionData = await res.json()
        const company = sessionData.company_name || "us"
        const purpose = (sessionData.purpose || "feedback").toLowerCase()

        // Build a dynamic greeting based on purpose
        const greetingMap: Record<string, string> = {
          feedback: `Hi! I'm calling from ${company} to collect your feedback about your recent experience. Could you share how it went?`,
          sales: `Hi! I'm calling from ${company} to share some exciting offers that might be a great fit for you. Do you have a moment to chat?`,
          bill_payment: `Hello! I'm calling from ${company} regarding your recent bill. I'd like to help you with your payment — could you confirm your account details?`,
          bill_due: `Hi, I'm reaching out from ${company} because your bill is due soon. I wanted to give you a heads-up and help with any questions about payment.`,
          autopay_reminder: `Hi! I'm calling from ${company} to let you know that your autopay is scheduled soon. I just wanted to make sure everything looks good on your end.`,
          support: `Hello! I'm from ${company}'s support team. I'm here to help resolve any issues you might be facing. Could you describe what's going on?`,
        }
        const greeting = greetingMap[purpose] ?? greetingMap["feedback"].replace("us", company)

        setMessages([{ id: "1", role: "ai", content: greeting }])

        // 2. Mark it as joined — fire-and-forget, don't block the UI
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
  // Speaks the greeting message (already set in messages[0]) via TTS.
  useEffect(() => {
    // Only play intro once the session has been validated and greeting is set
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

 const startRecording = useCallback(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)

    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.8

    source.connect(analyser)

    audioContextRef.current = audioContext
    analyserRef.current = analyser

    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.start()

    setIsRecording(true)
    setStatus("recording")
    setCurrentTranscript("")

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

      recognition.start()

      recognitionRef.current = recognition
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
  recognitionRef.current.stop()
}

  setIsRecording(false)
  
  setAudioData([])
  setStatus("processing")

  const finalTranscript =
    currentTranscript ||
    "I really enjoyed the service today, especially the quick response time."

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

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.reply,
      },
    ])

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

    // ── Handle end_call signal ──────────────────────────────────────────────
    // Audio has already played above; now decide what comes next.
    if (data.end_call) {
      endSession()
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
}, [currentTranscript])
    
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
            This link is not valid. Please check your SMS or contact Toyota support.
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
          Voice Feedback
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
        onClick={endSession}
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
