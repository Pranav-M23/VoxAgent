import { DashboardHeader } from "@/components/dashboard/header"
import { ConversationsList } from "@/components/dashboard/conversations-list"

export default function ConversationsPage() {
  return (
    <>
      <DashboardHeader 
        title="Conversations" 
        description="Browse and analyze all voice feedback"
      />
      <div className="flex-1 overflow-auto p-6">
        <ConversationsList />
      </div>
    </>
  )
}
