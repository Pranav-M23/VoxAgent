"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, TrendingUp, CheckCircle, Clock, LucideIcon } from "lucide-react"

const API_BASE = ""  // Next.js proxy
import { getUser } from "@/lib/auth"

function authHeaders(): Record<string, string> {
  const user = getUser()
  return user ? { "X-User-Id": String(user.user_id) } : {}
}

interface MetricCardProps {
  title: string
  value: string
  sub?: string
  subType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  loading?: boolean
}

function MetricCard({ title, value, sub, subType = "neutral", icon: Icon, loading }: MetricCardProps) {
  return (
    <Card className="border-zinc-200">
      <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <Icon className="w-3.5 h-3.5 text-muted-foreground/60" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <div className="h-7 w-20 bg-zinc-100 rounded animate-pulse" />
        ) : (
          <div className="text-xl font-semibold text-foreground tracking-tight">{value}</div>
        )}
        {sub && !loading && (
          <p className={`text-xs mt-0.5 ${
            subType === "positive" ? "text-emerald-600" :
            subType === "negative" ? "text-red-500" :
            "text-muted-foreground"
          }`}>
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface Session {
  id: number
  status: string
  purpose: string
  analytics?: { satisfaction_score?: number; sentiment?: string } | null
}

interface MetricsGridProps {
  refreshKey?: number
}

export function MetricsGrid({ refreshKey = 0 }: MetricsGridProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/sessions`, { headers: authHeaders() })
        if (res.ok) setSessions(await res.json())
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [refreshKey])

  // Auto-refresh every 15 seconds
  useEffect(() => {
    async function silentLoad() {
      try {
        const res = await fetch(`${API_BASE}/api/sessions`, { headers: authHeaders() })
        if (res.ok) setSessions(await res.json())
      } catch {}
    }
    const interval = setInterval(silentLoad, 15000)
    return () => clearInterval(interval)
  }, [])

  const total = sessions.length
  const completed = sessions.filter((s) => s.status === "completed").length
  const withScores = sessions.filter((s) => s.analytics?.satisfaction_score != null)
  const avgScore = withScores.length
    ? (withScores.reduce((sum, s) => sum + (s.analytics!.satisfaction_score!), 0) / withScores.length).toFixed(1)
    : "—"

  // Most common purpose
  const purposeCounts: Record<string, number> = {}
  sessions.forEach((s) => {
    if (s.purpose) purposeCounts[s.purpose] = (purposeCounts[s.purpose] || 0) + 1
  })
  const topPurpose = Object.entries(purposeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <MetricCard
        title="Total Sessions"
        value={loading ? "—" : String(total)}
        sub={completed > 0 ? `${completed} completed` : undefined}
        subType="positive"
        icon={Phone}
        loading={loading}
      />
      <MetricCard
        title="Completed"
        value={loading ? "—" : String(completed)}
        sub={total > 0 ? `${Math.round((completed / total) * 100)}% completion rate` : undefined}
        subType="positive"
        icon={CheckCircle}
        loading={loading}
      />
      <MetricCard
        title="Avg Satisfaction"
        value={loading ? "—" : avgScore !== "—" ? `${avgScore}/10` : "—"}
        sub={withScores.length > 0 ? `Based on ${withScores.length} calls` : "No data yet"}
        subType={avgScore !== "—" && parseFloat(avgScore) >= 7 ? "positive" : "neutral"}
        icon={TrendingUp}
        loading={loading}
      />
      <MetricCard
        title="Top Purpose"
        value={loading ? "—" : topPurpose.length > 18 ? topPurpose.slice(0, 18) + "…" : topPurpose}
        sub={topPurpose !== "—" ? `${purposeCounts[topPurpose] || 0} sessions` : undefined}
        subType="neutral"
        icon={Clock}
        loading={loading}
      />
    </div>
  )
}
