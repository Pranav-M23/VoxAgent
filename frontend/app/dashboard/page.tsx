"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { MetricsGrid } from "@/components/dashboard/metrics-grid"
import { ConversationsList } from "@/components/dashboard/conversations-list"
import { NewSessionModal } from "@/components/dashboard/new-session-modal"

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleSessionCreated() {
    // Bump refreshKey to trigger data reload in child components
    setRefreshKey((k) => k + 1)
  }

  return (
    <>
      <DashboardHeader
        title="Overview"
        description="Monitor voice sessions and customer insights"
        onNewSession={() => setModalOpen(true)}
      />
      <div className="flex-1 overflow-auto p-5 space-y-4">
        <MetricsGrid refreshKey={refreshKey} />
        <ConversationsList refreshKey={refreshKey} />
      </div>

      <NewSessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSessionCreated}
      />
    </>
  )
}
