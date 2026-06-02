import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, TrendingUp, AlertCircle, LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
}

function MetricCard({ title, value, change, changeType = "neutral", icon: Icon }: MetricCardProps) {
  return (
    <Card className="border-zinc-200">
      <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <Icon className="w-3.5 h-3.5 text-muted-foreground/60" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-xl font-semibold text-foreground tracking-tight">{value}</div>
        {change && (
          <p className={`text-xs mt-0.5 ${
            changeType === "positive" ? "text-emerald-600" :
            changeType === "negative" ? "text-red-500" :
            "text-muted-foreground"
          }`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function MetricsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <MetricCard
        title="Total Calls"
        value="1,284"
        change="+12% from last month"
        changeType="positive"
        icon={Phone}
      />
      <MetricCard
        title="Average Sentiment"
        value="7.4/10"
        change="+0.3 from last month"
        changeType="positive"
        icon={TrendingUp}
      />
      <MetricCard
        title="Top Issue"
        value="Wait Times"
        change="24% of conversations"
        changeType="neutral"
        icon={AlertCircle}
      />
    </div>
  )
}
