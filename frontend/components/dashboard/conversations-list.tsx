"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Clock, User, FileText, Tag, Phone, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"

interface Customer {
  id: number
  name: string
  phone: string
}

interface Analytics {
  sentiment?: string
  satisfaction_score?: number
  summary?: string
  complaint_category?: string
  escalation_required?: boolean
}

interface Session {
  id: number
  token: string
  company_name: string
  purpose: string
  status: string
  created_at: string
  duration?: number
  transcript?: string
  customer?: Customer
  analytics?: Analytics
}

const sentimentConfig: Record<string, { label: string; className: string }> = {
  positive: { label: "Positive", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  neutral:  { label: "Neutral",  className: "bg-amber-50 text-amber-700 border-amber-200" },
  negative: { label: "Negative", className: "bg-red-50 text-red-600 border-red-200" },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:    { label: "Pending",   className: "bg-zinc-50 text-zinc-500 border-zinc-200" },
  sms_sent:   { label: "SMS Sent",  className: "bg-blue-50 text-blue-600 border-blue-200" },
  joined:     { label: "Active",    className: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  completed:  { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  expired:    { label: "Expired",   className: "bg-zinc-50 text-zinc-400 border-zinc-200" },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = diffMs / (1000 * 60 * 60)
  if (diffH < 24) return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  if (diffH < 48) return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  return d.toLocaleDateString([], { month: "short", day: "numeric" })
}

function formatDuration(secs?: number) {
  if (!secs) return null
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

interface ConversationsListProps {
  refreshKey?: number
}

export function ConversationsList({ refreshKey = 0 }: ConversationsListProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Session | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function loadSessions(quiet = false) {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch(`${API_BASE}/api/sessions`)
      if (res.ok) setSessions(await res.json())
    } catch {}
    finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadSessions() }, [refreshKey])

  return (
    <div className="flex gap-4 h-[calc(100vh-13.5rem)]">
      {/* Sessions List */}
      <Card className={cn(
        "flex flex-col transition-all duration-300 border-zinc-200",
        selected ? "w-1/2" : "w-full"
      )}>
        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Sessions</CardTitle>
          <button
            onClick={() => loadSessions(true)}
            className="p-1 rounded-md hover:bg-accent transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", refreshing && "animate-spin")} />
          </button>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg mb-1 space-y-2">
                    <div className="h-3.5 bg-zinc-100 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-zinc-100 rounded w-1/2 animate-pulse" />
                  </div>
                ))
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Phone className="w-8 h-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No sessions yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Create a new session to get started</p>
                </div>
              ) : (
                sessions.map((session) => {
                  const sentiment = session.analytics?.sentiment
                  const sConfig = sentiment ? sentimentConfig[sentiment] : null
                  const stConfig = statusConfig[session.status] ?? statusConfig.pending

                  return (
                    <button
                      key={session.id}
                      onClick={() => setSelected(session)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-colors mb-1",
                        selected?.id === session.id ? "bg-zinc-100" : "hover:bg-zinc-50"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {session.customer?.name ?? "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(session.created_at)}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          {sConfig ? (
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 font-medium rounded-full", sConfig.className)}>
                              {sConfig.label}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 font-medium rounded-full", stConfig.className)}>
                              {stConfig.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {formatDuration(session.duration) && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(session.duration)}
                          </span>
                        )}
                        <span className="truncate">{session.company_name} · {session.purpose}</span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Pane */}
      {selected && (
        <div className="w-1/2 flex flex-col gap-3 overflow-hidden">
          {/* Header Card */}
          <Card className="border-zinc-200 shrink-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{selected.customer?.name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{selected.customer?.phone ?? "—"}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-full px-2.5 py-1 text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  {selected.company_name}
                </span>
                <span className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-full px-2.5 py-1 text-muted-foreground">
                  {selected.purpose}
                </span>
                <span className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 border",
                  statusConfig[selected.status]?.className ?? statusConfig.pending.className
                )}>
                  {statusConfig[selected.status]?.label ?? selected.status}
                </span>
                {selected.duration && (
                  <span className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-full px-2.5 py-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDuration(selected.duration)}
                  </span>
                )}
                {selected.analytics?.satisfaction_score != null && (
                  <span className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-full px-2.5 py-1 text-muted-foreground">
                    Score: {selected.analytics.satisfaction_score}/10
                  </span>
                )}
              </div>

              {/* Session link */}
              <div className="mt-3 p-2 bg-zinc-50 rounded-lg">
                <p className="text-[10px] text-muted-foreground mb-0.5">Session link</p>
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/session/${selected.token}`)}
                  className="text-xs text-foreground font-mono truncate w-full text-left hover:text-indigo-600 transition-colors"
                  title="Click to copy"
                >
                  /session/{selected.token.slice(0, 20)}…
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Scrollable content */}
          <div className="flex-1 overflow-auto space-y-3">
            {/* Summary */}
            {selected.analytics?.summary ? (
              <Card className="border-zinc-200">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="w-3.5 h-3.5" />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-sm text-foreground leading-relaxed">{selected.analytics.summary}</p>
                  {selected.analytics.complaint_category && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Category: <span className="font-medium text-foreground">{selected.analytics.complaint_category}</span>
                    </p>
                  )}
                  {selected.analytics.escalation_required && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5">
                      ⚠ Escalation required
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : selected.status === "completed" ? (
              <Card className="border-zinc-200">
                <CardContent className="px-4 py-4">
                  <p className="text-xs text-muted-foreground text-center">Analytics processing...</p>
                </CardContent>
              </Card>
            ) : null}

            {/* Transcript */}
            {selected.transcript && (
              <Card className="border-zinc-200">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="w-3.5 h-3.5" />
                    Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <ScrollArea className="h-48">
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-mono">
                      {selected.transcript}
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Pending state */}
            {!selected.analytics?.summary && selected.status !== "completed" && (
              <Card className="border-zinc-200">
                <CardContent className="px-4 py-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    {selected.status === "pending" && "Waiting for customer to join..."}
                    {selected.status === "sms_sent" && "SMS sent. Waiting for customer to open the link..."}
                    {selected.status === "joined" && "Call in progress..."}
                    {selected.status === "expired" && "This session has expired."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
