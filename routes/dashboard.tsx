import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard, MessageSquare, BarChart3, Settings as SettingsIcon,
  Bell, Plus, Phone, CheckCircle2, TrendingUp, Clock, RefreshCw, ChevronLeft, LogOut,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — VoxAgent" },
      { name: "description", content: "Monitor voice sessions and customer insights in real time." },
    ],
  }),
  component: DashboardPage,
});

type Session = {
  name: string; when: string; duration: string; brand: string; purpose: string;
  sentiment: "Negative" | "Neutral" | "Positive";
};

const sessions: Session[] = [
  { name: "Pranav", when: "Today, 02:48 PM", duration: "3:09", brand: "HDFC", purpose: "Credit card", sentiment: "Negative" },
  { name: "Pranav", when: "Jun 9", duration: "0:10", brand: "Chatgpt", purpose: "Autopay Reminder", sentiment: "Neutral" },
  { name: "Pranav", when: "Jun 9", duration: "0:34", brand: "Jio", purpose: "Switching to jio—convince to switch network operator by highlighting cheap brands", sentiment: "Neutral" },
  { name: "Pranav", when: "Jun 9", duration: "0:22", brand: "Jio", purpose: "Whether User wants to switch from Airtel to Jio, try to convince", sentiment: "Neutral" },
  { name: "Aarav", when: "Jun 8", duration: "1:42", brand: "Swiggy", purpose: "Refund follow-up for cancelled order", sentiment: "Positive" },
  { name: "Meera", when: "Jun 8", duration: "2:11", brand: "Airtel", purpose: "Plan renewal & data top-up", sentiment: "Positive" },
];

const nav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function DashboardPage() {
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 size-[500px] rounded-full bg-[color:var(--cyan-glow)]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 size-[600px] rounded-full bg-[color:var(--blue-glow)]/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_60%)]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 76 : 248 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="relative shrink-0 border-r border-white/5 bg-black/60 backdrop-blur-xl flex flex-col"
        >
          <div className="flex items-center gap-2 px-5 py-5">
            <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-[color:var(--cyan-glow)] to-[color:var(--blue-glow)] text-black font-bold shadow-[0_0_30px_-8px_rgba(0,255,198,0.8)]">V</span>
            {!collapsed && <span className="font-display text-lg font-semibold">VoxAgent</span>}
          </div>

          <nav className="px-3 mt-2 space-y-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive ? "text-white" : "text-white/55 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg border border-[color:var(--cyan-glow)]/30 bg-[color:var(--cyan-glow)]/10"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    />
                  )}
                  <Icon className={`relative size-4 ${isActive ? "text-[color:var(--cyan-glow)]" : ""}`} />
                  {!collapsed && <span className="relative">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto p-3 space-y-1">
            <button
              onClick={() => navigate({ to: "/auth", search: { mode: "signin" } })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/55 hover:text-white"
            >
              <LogOut className="size-4" />
              {!collapsed && <span>Sign out</span>}
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-white/40 hover:text-white/80"
            >
              <ChevronLeft className={`size-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        </motion.aside>

        {/* main */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* topbar */}
          <header className="flex items-center justify-between px-8 py-6 border-b border-white/5">
            <div>
              <h1 className="font-display text-2xl font-semibold">Overview</h1>
              <p className="text-sm text-white/50 mt-0.5">Monitor voice sessions and customer insights</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--cyan-glow)] px-4 py-2 text-sm font-medium text-black shadow-[0_0_30px_-8px_rgba(0,255,198,0.7)] hover:shadow-[0_0_50px_-5px_rgba(0,255,198,1)] transition-shadow">
                <Plus className="size-4" /> New Session
              </button>
              <button className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                <Bell className="size-4 text-white/70" />
              </button>
              <Link to="/" className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-[color:var(--cyan-glow)] to-[color:var(--blue-glow)] text-xs font-bold text-black">VA</Link>
            </div>
          </header>

          {/* content */}
          <div className="flex-1 px-8 py-8 space-y-8">
            {/* stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <StatCard icon={Phone} label="Total Sessions" value="6" sub="4 completed" subTone="muted" />
              <StatCard icon={CheckCircle2} label="Completed" value="4" sub="67% completion rate" subTone="cyan" />
              <StatCard icon={TrendingUp} label="Avg Satisfaction" value="4.0/10" sub="Based on 4 calls" subTone="muted" />
              <StatCard icon={Clock} label="Top Purpose" value="Credit card" sub="1 session" subTone="muted" valueSize="lg" />
            </div>

            {/* recent sessions */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl glass glow-border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold">Recent Sessions</h2>
                <button className="grid size-8 place-items-center rounded-full border border-white/10 hover:border-[color:var(--cyan-glow)]/40 hover:text-[color:var(--cyan-glow)] text-white/60 transition-colors">
                  <RefreshCw className="size-3.5" />
                </button>
              </div>

              <ul className="divide-y divide-white/5">
                {sessions.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 * i }}
                    className="group flex items-start justify-between gap-4 py-4 px-2 -mx-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium">
                          {s.name[0]}
                        </span>
                        <div>
                          <div className="text-sm font-medium">{s.name}</div>
                          <div className="text-xs text-white/40">{s.when}</div>
                        </div>
                      </div>
                      <div className="mt-2 ml-10 flex items-center gap-2 text-xs text-white/55">
                        <Clock className="size-3 text-white/30" />
                        <span className="font-mono text-white/70">{s.duration}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-white/60">{s.brand}</span>
                        <span className="text-white/20">•</span>
                        <span className="truncate">{s.purpose}</span>
                      </div>
                    </div>
                    <SentimentBadge tone={s.sentiment} />
                  </motion.li>
                ))}
              </ul>
            </motion.section>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon: Icon, label, value, sub, subTone, valueSize = "xl",
}: {
  icon: any; label: string; value: string; sub: string;
  subTone: "cyan" | "muted"; valueSize?: "xl" | "lg";
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-2xl glass glow-border p-5"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--cyan-glow)]/40 to-transparent" />
      <div className="flex items-start justify-between">
        <span className="text-[11px] tracking-[0.15em] uppercase text-white/45">{label}</span>
        <Icon className="size-4 text-white/40" />
      </div>
      <div className={`mt-4 font-display font-semibold ${valueSize === "lg" ? "text-2xl" : "text-3xl"}`}>
        {value}
      </div>
      <div className={`mt-2 text-xs ${subTone === "cyan" ? "text-[color:var(--cyan-glow)]" : "text-white/45"}`}>
        {sub}
      </div>
    </motion.div>
  );
}

function SentimentBadge({ tone }: { tone: "Negative" | "Neutral" | "Positive" }) {
  const map = {
    Negative: "bg-rose-500/10 text-rose-300 border-rose-400/30",
    Neutral: "bg-amber-500/10 text-amber-300 border-amber-400/30",
    Positive: "bg-emerald-500/10 text-emerald-300 border-emerald-400/30",
  } as const;
  return (
    <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${map[tone]}`}>
      {tone}
    </span>
  );
}
