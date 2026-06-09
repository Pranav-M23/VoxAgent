"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import {
  Bot,
  Mic,
  Clock,
  Bell,
  KeyRound,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Globe,
  Sliders,
  Volume2,
  MessageSquareText,
  Shield,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsState {
  // Agent Config
  systemPrompt: string
  aiModel: string
  responseLanguage: string
  maxTurns: number
  endCallPhrase: string

  // Voice & TTS
  voiceGender: string
  voiceSpeed: number
  ttsProvider: string
  enableTTS: boolean

  // Session Defaults
  sessionExpiryMinutes: number
  sessionBaseUrl: string
  autoCompleteOnEnd: boolean

  // Notifications
  notifyOnSessionStart: boolean
  notifyOnSessionComplete: boolean
  notifyOnLowSentiment: boolean
  sentimentThreshold: number
}

const DEFAULT_SETTINGS: SettingsState = {
  systemPrompt:
    "You are a professional voice agent for {company_name}. Your goal is to {purpose}. Be concise, empathetic, and helpful. Wrap up naturally when the conversation is complete.",
  aiModel: "gemini-2.0-flash",
  responseLanguage: "en-IN",
  maxTurns: 20,
  endCallPhrase: "END_CALL",

  voiceGender: "female",
  voiceSpeed: 1.0,
  ttsProvider: "sarvam",
  enableTTS: true,

  sessionExpiryMinutes: 1440,
  sessionBaseUrl: "http://localhost:3000/session",
  autoCompleteOnEnd: true,

  notifyOnSessionStart: false,
  notifyOnSessionComplete: true,
  notifyOnLowSentiment: true,
  sentimentThreshold: 40,
}

const AI_MODELS = [
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", badge: "Fast" },
  { value: "gemini-2.0-pro", label: "Gemini 2.0 Pro", badge: "Powerful" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", badge: "Stable" },
]

const LANGUAGES = [
  { value: "en-IN", label: "English (India)" },
  { value: "hi-IN", label: "Hindi" },
  { value: "ta-IN", label: "Tamil" },
  { value: "te-IN", label: "Telugu" },
  { value: "kn-IN", label: "Kannada" },
  { value: "ml-IN", label: "Malayalam" },
  { value: "mr-IN", label: "Marathi" },
  { value: "bn-IN", label: "Bengali" },
  { value: "gu-IN", label: "Gujarati" },
]

// Mock API key statuses — in production these would come from the backend
const API_INTEGRATIONS = [
  { key: "GEMINI_API_KEY", label: "Google Gemini", description: "AI conversation engine", status: "connected" as const },
  { key: "SARVAM_API_KEY", label: "Sarvam AI", description: "Text-to-speech provider", status: "connected" as const },
  { key: "TWILIO_ACCOUNT_SID", label: "Twilio SMS", description: "Session link delivery", status: "connected" as const },
  { key: "LIVEKIT_API_KEY", label: "LiveKit", description: "Real-time audio (future)", status: "not_configured" as const },
]

// ─── Section wrapper ──────────────────────────────────────────────────────────

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-start gap-3 px-5 py-4 border-b border-zinc-100 bg-zinc-50/60">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  )
}

// ─── Form field helpers ───────────────────────────────────────────────────────

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0 flex-shrink-0 w-48">
        <p className="text-sm font-medium text-zinc-800">{label}</p>
        {hint && <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

const inputCls =
  "w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 transition-shadow"

const selectCls =
  "w-full h-9 px-3 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 transition-shadow appearance-none cursor-pointer"

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-1 ${
        checked ? "bg-zinc-900" : "bg-zinc-200"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("voxagent_settings")
      if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
    } catch {}
  }, [])

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
    setSaved(false)
  }

  function handleSave() {
    localStorage.setItem("voxagent_settings", JSON.stringify(settings))
    setSaved(true)
    setDirty(false)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleReset() {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem("voxagent_settings")
    setDirty(false)
    setSaved(false)
  }

  return (
    <>
      <DashboardHeader title="Settings" description="Configure your voice analytics preferences" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* ── Agent Configuration ─────────────────────────────────────── */}
          <SettingsSection icon={Bot} title="Agent Configuration" description="AI model, language, and conversation behaviour">

            <FieldRow label="AI Model" hint="The Gemini model used for generating replies">
              <div className="relative">
                <select
                  value={settings.aiModel}
                  onChange={(e) => update("aiModel", e.target.value)}
                  className={selectCls}
                >
                  {AI_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label} — {m.badge}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 rotate-90 pointer-events-none" />
              </div>
            </FieldRow>

            <FieldRow label="Response Language" hint="The language Sarvam TTS will speak in">
              <div className="relative">
                <select
                  value={settings.responseLanguage}
                  onChange={(e) => update("responseLanguage", e.target.value)}
                  className={selectCls}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 rotate-90 pointer-events-none" />
              </div>
            </FieldRow>

            <FieldRow label="Max Turns" hint="Max back-and-forth exchanges before auto-end">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={settings.maxTurns}
                  onChange={(e) => update("maxTurns", Number(e.target.value))}
                  className="flex-1 accent-zinc-900"
                />
                <span className="text-sm font-mono font-medium text-zinc-800 w-8 text-right">
                  {settings.maxTurns}
                </span>
              </div>
            </FieldRow>

            <FieldRow label="End-Call Signal" hint="The phrase Gemini must output to end the session">
              <input
                type="text"
                value={settings.endCallPhrase}
                onChange={(e) => update("endCallPhrase", e.target.value)}
                className={inputCls}
                placeholder="e.g. END_CALL"
              />
            </FieldRow>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-3.5 h-3.5 text-zinc-400" />
                <p className="text-sm font-medium text-zinc-800">System Prompt</p>
              </div>
              <p className="text-xs text-zinc-400">
                Use <code className="bg-zinc-100 px-1 rounded text-zinc-600">{"{company_name}"}</code> and{" "}
                <code className="bg-zinc-100 px-1 rounded text-zinc-600">{"{purpose}"}</code> as dynamic placeholders.
              </p>
              <textarea
                value={settings.systemPrompt}
                onChange={(e) => update("systemPrompt", e.target.value)}
                rows={5}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 transition-shadow resize-none font-mono leading-relaxed"
              />
            </div>
          </SettingsSection>

          {/* ── Voice & TTS ─────────────────────────────────────────────── */}
          <SettingsSection icon={Mic} title="Voice & TTS" description="Sarvam text-to-speech configuration">

            <FieldRow label="Enable TTS" hint="Play agent replies as audio to the customer">
              <Toggle checked={settings.enableTTS} onChange={(v) => update("enableTTS", v)} />
            </FieldRow>

            <FieldRow label="TTS Provider" hint="Speech synthesis service">
              <div className="relative">
                <select
                  value={settings.ttsProvider}
                  onChange={(e) => update("ttsProvider", e.target.value)}
                  className={selectCls}
                  disabled={!settings.enableTTS}
                >
                  <option value="sarvam">Sarvam AI</option>
                  <option value="google" disabled>Google TTS (coming soon)</option>
                </select>
                <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 rotate-90 pointer-events-none" />
              </div>
            </FieldRow>

            <FieldRow label="Voice Gender" hint="Preferred voice for the AI agent">
              <div className="flex gap-2">
                {["female", "male"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    disabled={!settings.enableTTS}
                    onClick={() => update("voiceGender", g)}
                    className={`flex-1 h-9 rounded-lg border text-sm font-medium capitalize transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      settings.voiceGender === g
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </FieldRow>

            <FieldRow label="Speech Speed" hint="Playback rate for TTS audio">
              <div className="flex items-center gap-3">
                <Volume2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={settings.voiceSpeed}
                  disabled={!settings.enableTTS}
                  onChange={(e) => update("voiceSpeed", Number(e.target.value))}
                  className="flex-1 accent-zinc-900 disabled:opacity-40"
                />
                <span className="text-sm font-mono font-medium text-zinc-800 w-8 text-right">
                  {settings.voiceSpeed.toFixed(1)}×
                </span>
              </div>
            </FieldRow>
          </SettingsSection>

          {/* ── Session Defaults ─────────────────────────────────────────── */}
          <SettingsSection icon={Clock} title="Session Defaults" description="Link expiry and session lifecycle behaviour">

            <FieldRow label="Session Expiry" hint="Minutes before a session link expires">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={10080}
                  value={settings.sessionExpiryMinutes}
                  onChange={(e) => update("sessionExpiryMinutes", Number(e.target.value))}
                  className={`${inputCls} w-32`}
                />
                <span className="text-xs text-zinc-500">
                  ≈ {(settings.sessionExpiryMinutes / 60).toFixed(1)}h
                </span>
              </div>
            </FieldRow>

            <FieldRow label="Session Base URL" hint="Base URL for generated session links sent via SMS">
              <div className="relative">
                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="url"
                  value={settings.sessionBaseUrl}
                  onChange={(e) => update("sessionBaseUrl", e.target.value)}
                  className={`${inputCls} pl-8`}
                  placeholder="https://your-domain.com/session"
                />
              </div>
            </FieldRow>

            <FieldRow label="Auto-complete on END_CALL" hint="Automatically mark session complete when agent signals end">
              <Toggle checked={settings.autoCompleteOnEnd} onChange={(v) => update("autoCompleteOnEnd", v)} />
            </FieldRow>
          </SettingsSection>

          {/* ── Notifications ────────────────────────────────────────────── */}
          <SettingsSection icon={Bell} title="Notifications" description="Alert preferences for session events">

            <FieldRow label="Session Started" hint="Notify when a new voice session begins">
              <Toggle
                checked={settings.notifyOnSessionStart}
                onChange={(v) => update("notifyOnSessionStart", v)}
              />
            </FieldRow>

            <FieldRow label="Session Completed" hint="Notify when a session is marked complete">
              <Toggle
                checked={settings.notifyOnSessionComplete}
                onChange={(v) => update("notifyOnSessionComplete", v)}
              />
            </FieldRow>

            <FieldRow label="Low Sentiment Alert" hint="Notify when customer sentiment drops below threshold">
              <Toggle
                checked={settings.notifyOnLowSentiment}
                onChange={(v) => update("notifyOnLowSentiment", v)}
              />
            </FieldRow>

            {settings.notifyOnLowSentiment && (
              <FieldRow label="Sentiment Threshold" hint="Trigger alert when score falls below this value (0–100)">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={70}
                    step={5}
                    value={settings.sentimentThreshold}
                    onChange={(e) => update("sentimentThreshold", Number(e.target.value))}
                    className="flex-1 accent-zinc-900"
                  />
                  <span
                    className={`text-sm font-mono font-semibold w-10 text-right ${
                      settings.sentimentThreshold < 30
                        ? "text-red-500"
                        : settings.sentimentThreshold < 50
                        ? "text-amber-500"
                        : "text-zinc-800"
                    }`}
                  >
                    {settings.sentimentThreshold}
                  </span>
                </div>
              </FieldRow>
            )}
          </SettingsSection>

          {/* ── API & Integrations ───────────────────────────────────────── */}
          <SettingsSection icon={KeyRound} title="API & Integrations" description="External service connection status">
            <div className="space-y-2">
              {API_INTEGRATIONS.map((api) => (
                <div
                  key={api.key}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-zinc-50 border border-zinc-100"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        api.status === "connected" ? "bg-emerald-400" : "bg-zinc-300"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-800">{api.label}</p>
                      <p className="text-xs text-zinc-400">{api.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {api.status === "connected" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-medium text-emerald-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-xs font-medium text-zinc-400">Not configured</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              API keys are stored securely in the backend environment and are never exposed to the frontend.
            </p>
          </SettingsSection>

          {/* ── Save / Reset bar ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between py-3 px-5 rounded-xl border border-zinc-200 bg-white">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to defaults
            </button>

            <div className="flex items-center gap-3">
              {saved && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={!dirty}
                className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5" />
                Save changes
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
