"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Mic, MicOff } from "lucide-react"
import { PulseWaveVisualizer } from "./pulse-wave-visualizer"

interface Message {
  id: string
  role: "ai" | "customer"
  content: string
  isStreaming?: boolean
}

const INITIAL_AI_PROMPTS = [
  "Hi there! I'd love to hear about your experience today. What brought you in?",
  "How would you rate your overall satisfaction with our service?",
  "Is there anything specific we could have done better?",
  "What was the highlight of your visit today?",
]

export function VoiceFeedbackPortal() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioData, setAudioData] = useState<number[]>([])
  const [status, setStatus] = useState<"idle" | "recording" | "processing">("idle")
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", content: INITIAL_AI_PROMPTS[0] }
  ])
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [promptIndex, setPromptIndex] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)

  // Simulate live transcription while recording
  useEffect(() => {
    if (!isRecording) return
    
    const simulatedPhrases = [
      "I really ",
      "I really enjoyed ",
      "I really enjoyed the ",
      "I really enjoyed the service ",
      "I really enjoyed the service today, ",
      "I really enjoyed the service today, especially ",
      "I really enjoyed the service today, especially the ",
      "I really enjoyed the service today, especially the quick ",
      "I really enjoyed the service today, especially the quick response ",
      "I really enjoyed the service today, especially the quick response time.",
    ]
    
    let index = 0
    const interval = setInterval(() => {
      if (index < simulatedPhrases.length) {
        setCurrentTranscript(simulatedPhrases[index])
        index++
      }
    }, 300)
    
    return () => clearInterval(interval)
  }, [isRecording])

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [messages, currentTranscript])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
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

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      const updateAudioData = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray)
          const normalized = Array.from(dataArray).map(v => v / 255)
          setAudioData(normalized)
        }
        animationRef.current = requestAnimationFrame(updateAudioData)
      }
      updateAudioData()

    } catch (error) {
      console.error("Error accessing microphone:", error)
      setStatus("idle")
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    setIsRecording(false)
    setAudioData([])
    setStatus("processing")
    
    // Add the customer message
    const finalTranscript = currentTranscript || "I really enjoyed the service today, especially the quick response time."
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "customer",
      content: finalTranscript
    }])
    setCurrentTranscript("")
    
    // Simulate AI response after a brief delay
    setTimeout(() => {
      const nextIndex = (promptIndex + 1) % INITIAL_AI_PROMPTS.length
      setPromptIndex(nextIndex)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: INITIAL_AI_PROMPTS[nextIndex]
      }])
      setStatus("idle")
    }, 1000)
  }, [currentTranscript, promptIndex])

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
