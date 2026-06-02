"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Mic, MicOff } from "lucide-react"
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


export function VoiceFeedbackPortal() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioData, setAudioData] = useState<number[]>([])
  const [status, setStatus] = useState<"idle" | "recording" | "processing">("idle")
  const [messages, setMessages] = useState<Message[]>([
  {
    id: "1",
    role: "ai",
    content:
      "Hi there! I'd love to hear about your experience today. What brought you in?",
  },
])
  const [currentTranscript, setCurrentTranscript] = useState("")
 
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Simulate live transcription while recording
 
  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [messages, currentTranscript])

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
      "http://127.0.0.1:8000/api/conversation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: 1,
          session_token: "test123",
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
    startRecording()
  }
}
    

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-8 bg-background">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-medium text-foreground tracking-tight">
          Voice Feedback
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {status === "idle" && "Tap to share your thoughts"}
          {status === "recording" && "Listening..."}
          {status === "processing" && "Processing..."}
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
          ${isRecording 
            ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25" 
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
          {status === "idle" && "Tap to Speak"}
          {status === "recording" && "Tap to Stop"}
          {status === "processing" && "Processing..."}
        </span>
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
