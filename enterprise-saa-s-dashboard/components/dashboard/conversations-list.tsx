"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AudioWaveformPlayer } from "./audio-waveform-player"
import { X, Clock, User, Lightbulb, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  customerName: string
  date: string
  duration: string
  sentiment: "positive" | "neutral" | "negative"
  topic: string
  summary: string
  suggestions: string[]
}

const conversations: Conversation[] = [
  {
    id: "1",
    customerName: "Sarah Mitchell",
    date: "Today, 2:34 PM",
    duration: "4:23",
    sentiment: "negative",
    topic: "Wait Times",
    summary: "Customer expressed frustration with extended hold times during peak hours. They mentioned waiting over 15 minutes before reaching support. Despite the initial frustration, the issue was resolved satisfactorily.",
    suggestions: [
      "Implement callback queue system during peak hours",
      "Add estimated wait time announcements",
      "Consider expanding support team for 2-4 PM window",
    ],
  },
  {
    id: "2",
    customerName: "James Rodriguez",
    date: "Today, 1:12 PM",
    duration: "2:45",
    sentiment: "positive",
    topic: "Product Inquiry",
    summary: "Customer called to inquire about premium subscription features. They were particularly interested in the analytics dashboard and team collaboration tools. Expressed strong interest in upgrading.",
    suggestions: [
      "Send follow-up email with premium feature comparison",
      "Offer limited-time trial of premium features",
      "Schedule product demo call within 48 hours",
    ],
  },
  {
    id: "3",
    customerName: "Emily Chen",
    date: "Today, 11:45 AM",
    duration: "6:12",
    sentiment: "neutral",
    topic: "Technical Support",
    summary: "Customer needed help with API integration. The technical complexity required escalation to the engineering team. Customer was understanding about the process and appreciated the thorough documentation provided.",
    suggestions: [
      "Create video tutorial for common API setup issues",
      "Update integration documentation with edge cases",
      "Follow up with solution within 24 hours",
    ],
  },
  {
    id: "4",
    customerName: "Michael Thompson",
    date: "Yesterday, 4:56 PM",
    duration: "3:18",
    sentiment: "positive",
    topic: "Billing",
    summary: "Customer requested clarification on recent invoice charges. After explaining the itemized breakdown, they were satisfied with the explanation and appreciated the transparency.",
    suggestions: [
      "Add itemized tooltips to invoice PDF",
      "Send proactive billing summary emails",
      "Consider monthly billing breakdown dashboard",
    ],
  },
  {
    id: "5",
    customerName: "Lisa Park",
    date: "Yesterday, 2:30 PM",
    duration: "5:45",
    sentiment: "negative",
    topic: "Service Outage",
    summary: "Customer reported service disruption affecting their team's workflow. They needed urgent resolution and status updates. Issue was related to scheduled maintenance that wasn't properly communicated.",
    suggestions: [
      "Improve maintenance notification system",
      "Create status page with real-time updates",
      "Implement SMS alerts for critical accounts",
    ],
  },
]

const sentimentConfig = {
  positive: { 
    label: "Positive",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200" 
  },
  neutral: { 
    label: "Neutral",
    className: "bg-amber-50 text-amber-700 border-amber-200" 
  },
  negative: { 
    label: "Negative",
    className: "bg-red-50 text-red-600 border-red-200" 
  },
}

export function ConversationsList() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  return (
    <div className="flex gap-4 h-[calc(100vh-11rem)]">
      {/* Conversations List */}
      <Card className={cn(
        "flex flex-col transition-all duration-300 border-zinc-200",
        selectedConversation ? "w-1/2" : "w-full"
      )}>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium">Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors mb-1",
                    selectedConversation?.id === conversation.id
                      ? "bg-zinc-100"
                      : "hover:bg-zinc-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {conversation.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {conversation.date}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-5 font-medium shrink-0 rounded-full",
                        sentimentConfig[conversation.sentiment].className
                      )}
                    >
                      {sentimentConfig[conversation.sentiment].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {conversation.duration}
                    </span>
                    <span className="truncate">{conversation.topic}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Pane */}
      {selectedConversation && (
        <div className="w-1/2 flex flex-col gap-3 overflow-hidden">
          {/* Header */}
          <Card className="border-zinc-200 shrink-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {selectedConversation.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.date}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              
              {/* Audio Player */}
              <AudioWaveformPlayer duration={parseInt(selectedConversation.duration.split(":")[0]) * 60 + parseInt(selectedConversation.duration.split(":")[1])} />
            </CardContent>
          </Card>

          {/* Scrollable content */}
          <div className="flex-1 overflow-auto space-y-3">
            {/* Summary Card */}
            <Card className="border-zinc-200">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="w-3.5 h-3.5" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-foreground leading-relaxed">
                  {selectedConversation.summary}
                </p>
              </CardContent>
            </Card>

            {/* Suggested Improvements */}
            <Card className="border-zinc-200">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Suggested Improvements
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ul className="space-y-2.5">
                  {selectedConversation.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm text-foreground leading-relaxed">
                        {suggestion}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
