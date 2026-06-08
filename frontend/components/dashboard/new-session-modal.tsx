"use client"

import { useState } from "react"
import { X, Send, Loader2, CheckCircle } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function NewSessionModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    company_name: "",
    purpose: "",
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ session_url: string; token: string } | null>(null)
  const [error, setError] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch(`${API_BASE}/api/send-session-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.detail || `Error ${res.status}`)
      }

      const data = await res.json()
      setResult({ session_url: data.session_url, token: data.token })
      onSuccess()
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setForm({ customer_name: "", phone: "", company_name: "", purpose: "" })
    setResult(null)
    setError("")
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-card border border-zinc-200 rounded-2xl shadow-2xl shadow-black/10 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div>
            <h2 className="text-sm font-semibold text-foreground">New Session</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Send a voice session link via SMS</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {result ? (
          /* Success state */
          <div className="p-5 space-y-4">
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Session created!</p>
                <p className="text-xs text-muted-foreground mt-0.5">SMS sent to customer</p>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-xl p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Session link</p>
              <p className="text-xs text-foreground break-all font-mono">{result.session_url}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(result.session_url)}
                className="flex-1 text-xs py-2 px-3 rounded-lg border border-zinc-200 text-foreground hover:bg-accent transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={handleClose}
                className="flex-1 text-xs py-2 px-3 rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Customer Name</label>
                <input
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  required
                  placeholder="Ravi Sharma"
                  className="w-full h-8 px-3 text-sm rounded-lg border border-zinc-200 bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="+919999999999"
                  className="w-full h-8 px-3 text-sm rounded-lg border border-zinc-200 bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Company Name</label>
              <input
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                required
                placeholder="Samsung, Airtel, HDFC..."
                className="w-full h-8 px-3 text-sm rounded-lg border border-zinc-200 bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Purpose of Call</label>
              <textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                required
                rows={2}
                placeholder="e.g. Post-service feedback, Galaxy S25 upgrade offer, Bill payment reminder..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-zinc-300 resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? "Sending..." : "Send Session Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
