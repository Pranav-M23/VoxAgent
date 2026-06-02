import { DashboardHeader } from "@/components/dashboard/header"
import { MetricsGrid } from "@/components/dashboard/metrics-grid"
import { ConversationsList } from "@/components/dashboard/conversations-list"

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader 
        title="Overview" 
        description="Monitor voice feedback and customer insights"
      />
      <div className="flex-1 overflow-auto p-5 space-y-4">
        <MetricsGrid />
        <ConversationsList />
      </div>
    </>
  )
}
