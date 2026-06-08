"use client"

import { Bell, Plus, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface DashboardHeaderProps {
  title: string
  description?: string
  onNewSession?: () => void
}

export function DashboardHeader({ title, description, onNewSession }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between h-14 px-5 border-b border-zinc-200 bg-card">
      <div>
        <h1 className="text-base font-semibold text-foreground tracking-tight">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* New Session Button */}
        {onNewSession && (
          <button
            onClick={onNewSession}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            New Session
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-1.5 rounded-lg hover:bg-accent transition-colors">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-0.5 rounded-lg hover:bg-accent transition-colors">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs font-medium">
                  VA
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem>
              <User className="w-3.5 h-3.5 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
