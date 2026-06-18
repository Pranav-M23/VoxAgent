"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Phone, ClipboardList, Clock,
  Mic, Smartphone, Globe2, BarChart3, RefreshCw, Shield, Zap, Target,
  Radio, Wallet, Car, ShoppingBag, Stethoscope, GraduationCap, Github,
} from "lucide-react";
import { Globe } from "@/components/landing/Globe";

/* ── Lightweight fade-in hook (IntersectionObserver, no library) ── */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("in-view"); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ─── HERO ─── */
export function Hero() {
  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg" style={{ maskImage: "radial-gradient(ellipse at center,black 30%,transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at center,black 30%,transparent 75%)" }} />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 size-[700px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle,rgba(0,255,198,0.15),transparent 60%)" }} />
      <div className="absolute right-0 top-1/2 size-[500px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle,rgba(0,123,255,0.12),transparent 60%)" }} />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="fade-up" style={{ animationDelay: "0ms" }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/80">
              <span className="size-1.5 rounded-full bg-[#00FFC6] vox-pulse" />
              AI-Powered Voice Intelligence
            </div>
          </div>

          <h1 className="fade-up mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] text-white" style={{ animationDelay: "80ms" }}>
            Turn every customer call into a{" "}
            <span className="text-gradient">conversation that converts</span>
          </h1>

          <p className="fade-up mt-6 max-w-xl text-base lg:text-lg text-white/65 leading-relaxed" style={{ animationDelay: "160ms" }}>
            VoxAgent sends personalised AI voice calls directly to your customers via SMS — no app downloads, no hold music. Just natural, two-way conversations that collect feedback, drive sales, and update your dashboard in real time.
          </p>

          <div className="fade-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
            <Link href="/signup" className="group inline-flex items-center gap-2 rounded-full bg-[#00FFC6] px-6 py-3 text-sm font-medium text-black shadow-[0_0_30px_-8px_rgba(0,255,198,0.6)] hover:shadow-[0_0_50px_-5px_rgba(0,255,198,0.8)] transition-shadow duration-300">
              Start Free <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#dashboard" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white hover:bg-white/[0.08] transition-colors duration-200">
              See the Dashboard
            </a>
          </div>

          <p className="fade-up mt-8 text-xs text-white/40" style={{ animationDelay: "320ms" }}>
            Powered by Google Gemini · Sarvam AI · Twilio<br />
            Built for enterprise customer engagement
          </p>
        </div>

        <div className="relative aspect-square w-full max-w-[500px] mx-auto fade-up" style={{ animationDelay: "100ms" }}>
          <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: "radial-gradient(circle,rgba(0,255,198,0.15),transparent 60%)" }} />
          <Globe />
        </div>
      </div>
    </section>
  );
}

/* ─── PROBLEM ─── */
const problems = [
  { icon: Phone, title: "Cold Calls Are Ignored", body: "Customers hang up on unknown numbers before the first word is spoken. Engagement rates are at an all-time low." },
  { icon: ClipboardList, title: "Surveys Go Unanswered", body: "Email and SMS surveys average under 5% completion. You're flying blind on what your customers actually think." },
  { icon: Clock, title: "Agents Waste Time", body: "Your human team spends hours on templated calls that a well-designed AI can handle in seconds — consistently." },
];

export function Problem() {
  const ref = useFadeIn();
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader label="Why VoxAgent Exists" title="Traditional customer outreach is broken." />
        <div ref={ref} className="scroll-fade mt-14 grid gap-6 md:grid-cols-3">
          {problems.map((p, i) => (
            <div key={p.title} className="group glow-border relative rounded-2xl glass p-7 hover:-translate-y-1 transition-transform duration-300">
              <div className="grid size-12 place-items-center rounded-xl border border-white/10" style={{ background: "linear-gradient(135deg,rgba(0,255,198,0.15),rgba(0,123,255,0.08))" }}>
                <p.icon className="size-5 text-[#00FFC6]" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{p.title}</h3>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SOLUTION ─── */
const steps = [
  { n: "01", title: "Create a Session", body: "From your dashboard, enter the customer's name, phone number, company, and the purpose of the call. Hit Send." },
  { n: "02", title: "Customer Receives an SMS", body: "A personalised link opens a mobile voice portal — no app, no login. The AI agent greets by name and begins." },
  { n: "03", title: "Dashboard Updates Live", body: "The moment the call ends, sentiment, satisfaction score, summary, and transcript appear — ready to act on." },
];

export function Solution() {
  const ref = useFadeIn();
  return (
    <section id="how" className="relative py-24 lg:py-32">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at top,rgba(0,123,255,0.07),transparent 60%)" }} />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader label="What is VoxAgent?" title="An AI agent that calls your customers — so you don't have to." />
        <p className="mx-auto mt-5 max-w-2xl text-center text-white/60">
          Define who to call, what to say, and what outcome you want. VoxAgent handles the rest.
        </p>
        <div ref={ref} className="scroll-fade relative mt-16 grid gap-6 md:grid-cols-3">
          <div className="hidden md:block absolute top-9 left-[16.6%] right-[16.6%] h-px" style={{ background: "linear-gradient(90deg,#00FFC6,#007BFF,#00FFC6)", opacity: 0.4 }} />
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-2xl glass p-7 glow-border">
              <div className="relative z-10 mx-auto grid size-[72px] place-items-center rounded-full bg-black border border-[#00FFC6]/40 -mt-14 mb-5">
                <span className="font-display text-lg font-semibold text-gradient">{s.n}</span>
              </div>
              <h3 className="text-lg font-semibold text-center text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-white/60 text-center leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES ─── */
const features = [
  { icon: Mic, title: "Natural Two-Way Voice", body: "Powered by Google Gemini 2.5 Flash. Genuine multi-turn dialogue.", tag: "Gemini 2.5 Flash" },
  { icon: Smartphone, title: "Zero-Install SMS Experience", body: "One SMS. One tap. A mobile-first voice portal. No app, no friction.", tag: "iOS & Android" },
  { icon: Globe2, title: "22 Indian Languages", body: "Sarvam AI saaras:v3 STT + TTS across India's diverse customer base.", tag: "Sarvam AI" },
  { icon: BarChart3, title: "Real-Time Analytics", body: "Sentiment, score, summary, complaint category, escalation flags — instantly.", tag: "Instant insights" },
  { icon: RefreshCw, title: "Session Lifecycle", body: "Pending → Sent → Active → Completed with 15s auto-refresh.", tag: "Live status" },
  { icon: Shield, title: "Secure Backend", body: "FastAPI + PostgreSQL. CORS, per-session tokens, env-based secrets.", tag: "FastAPI · Postgres" },
  { icon: Zap, title: "Escalation Detection", body: "Gemini flags serious dissatisfaction so urgent issues never slip.", tag: "AI escalation" },
  { icon: Target, title: "Configurable Purpose", body: "Feedback, sales, reminders, onboarding — the AI adapts its strategy.", tag: "Any use case" },
];

export function Features() {
  const ref = useFadeIn();
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader label="Everything You Need" title="Built for real business outcomes." />
        <div ref={ref} className="scroll-fade mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="group glow-border relative overflow-hidden rounded-2xl glass p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="relative grid size-11 place-items-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-[#00FFC6]/10 transition-colors duration-200">
                <f.icon className="size-5 text-[#00FFC6]" />
              </div>
              <h3 className="mt-5 font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-white/55 leading-relaxed">{f.body}</p>
              <div className="mt-4 inline-flex rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-white/70">
                {f.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── AI SECTION (no scroll parallax, no JS) ─── */
export function AIScrollSection() {
  const ref = useFadeIn();
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Static neural SVG background */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-25" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ln2" x1="0" x2="1">
            <stop offset="0" stopColor="#00FFC6" stopOpacity="0" />
            <stop offset="0.5" stopColor="#00FFC6" stopOpacity="0.6" />
            <stop offset="1" stopColor="#007BFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[[10,20,40,60],[20,70,60,30],[50,10,80,70],[15,50,75,40],[30,80,70,20],[60,15,90,55]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#ln2)" strokeWidth="0.2" opacity="0.5" />
        ))}
        {[[10,20],[40,60],[20,70],[60,30],[50,10],[80,70],[15,50],[75,40],[30,80],[70,20]].map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r="0.4" fill="#00FFC6" opacity="0.5" />
        ))}
      </svg>

      <div ref={ref} className="scroll-fade relative mx-auto max-w-3xl text-center px-5">
        <p className="text-xs uppercase tracking-[0.3em] text-[#00FFC6]">Voice → Intelligence</p>
        <h2 className="mt-4 text-3xl lg:text-5xl font-semibold leading-tight text-white">
          Every voice becomes <span className="text-gradient">structured insight</span>.
        </h2>
        <p className="mt-5 text-white/60">
          Real-time speech-to-text, sentiment vectors, and contextual reasoning flow through our neural pipeline — turning ambient conversation into decisions you can act on instantly.
        </p>
      </div>
    </section>
  );
}

/* ─── USE CASES ─── */
const useCases = [
  { icon: Radio, title: "Telecom & ISPs", body: "\"Switch to our network — we'll highlight your savings.\"", outcome: "AI handles objections, captures intent, flags hot leads." },
  { icon: Wallet, title: "Banking & Fintech", body: "\"Your EMI is due in 3 days. Need any help?\"", outcome: "Proactive reminders with zero agent cost." },
  { icon: Car, title: "Automotive", body: "\"How was your recent service experience?\"", outcome: "Post-service NPS collection with full transcript." },
  { icon: ShoppingBag, title: "E-Commerce & D2C", body: "\"We noticed you abandoned your cart — can we help?\"", outcome: "Recovery conversation with personalised offers." },
  { icon: Stethoscope, title: "Healthcare", body: "\"Your appointment is tomorrow. Any questions?\"", outcome: "Confirmation + FAQ handling at scale." },
  { icon: GraduationCap, title: "EdTech", body: "\"How's the course going so far?\"", outcome: "Drop-off detection and personalised support routing." },
];

export function UseCases() {
  const ref = useFadeIn();
  return (
    <section id="usecases" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader label="Use Cases" title="Who is VoxAgent built for?" />
        <div ref={ref} className="scroll-fade mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((u) => (
            <div key={u.title} className="group glow-border rounded-2xl glass p-6 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg border border-white/10" style={{ background: "rgba(0,123,255,0.12)" }}>
                  <u.icon className="size-5 text-[#00FFC6]" />
                </div>
                <h3 className="font-semibold text-white">{u.title}</h3>
              </div>
              <p className="mt-4 text-sm italic text-white/75">{u.body}</p>
              <p className="mt-3 text-xs text-white/50 leading-relaxed">→ {u.outcome}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── TECH STACK ─── */
const stack = ["Google Gemini", "Sarvam AI", "Twilio", "FastAPI", "PostgreSQL", "Next.js", "Vercel", "Render"];

export function TechStack() {
  const ref = useFadeIn();
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader label="Under the Hood" title="Enterprise-grade technology, elegantly assembled." />
        <div ref={ref} className="scroll-fade mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stack.map((s) => (
            <div key={s} className="rounded-xl border border-white/10 bg-white/[0.02] py-6 text-center text-sm text-white/60 hover:text-white hover:border-[#00FFC6]/40 hover:bg-[#00FFC6]/[0.04] hover:-translate-y-0.5 transition-all duration-200">
              {s}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── DASHBOARD PREVIEW ─── */
export function DashboardPreview() {
  const ref = useFadeIn();
  const stats = [
    { label: "Sessions Tracked", value: "12,480" },
    { label: "Completion Rate", value: "94%" },
    { label: "Avg Satisfaction", value: "9.2/10" },
    { label: "Escalations Flagged", value: "312" },
  ];
  return (
    <section id="dashboard" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader label="The Dashboard" title="Your command centre for every conversation." />
        <p className="mx-auto mt-5 max-w-2xl text-center text-white/60">
          Bird's-eye view of every session — active, completed, pending, expired. Updates automatically.
        </p>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glow-border rounded-2xl glass p-6">
              <div className="text-3xl lg:text-4xl font-semibold text-gradient">{s.value}</div>
              <div className="mt-2 text-xs uppercase tracking-wider text-white/50">{s.label}</div>
            </div>
          ))}
        </div>

        <div ref={ref} className="scroll-fade relative mt-16 rounded-3xl glass p-2 glow-cyan">
          <div className="rounded-2xl bg-black/60 p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-red-400/70" />
                <span className="size-2.5 rounded-full bg-yellow-400/70" />
                <span className="size-2.5 rounded-full bg-green-400/70" />
                <span className="ml-3 text-xs text-white/40">voxagent.app / dashboard</span>
              </div>
              <span className="text-xs text-white/40">Live · auto-refresh 15s</span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { name: "Pranav Kumar", co: "Acme Telecom", status: "Completed", score: "9.4" },
                { name: "Aanya Sharma", co: "Zenith Bank", status: "Active", score: null },
                { name: "Rohan Verma", co: "DriveCo", status: "Sent", score: null },
              ].map((c) => (
                <div key={c.name} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white">{c.name}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      c.status === "Completed" ? "border-[#00FFC6]/40 text-[#00FFC6] bg-[#00FFC6]/5" :
                      c.status === "Active" ? "border-[#007BFF]/50 text-[#007BFF] bg-[#007BFF]/10 vox-pulse" :
                      "border-white/20 text-white/60"
                    }`}>{c.status}</span>
                  </div>
                  <div className="mt-1 text-xs text-white/50">{c.co}</div>
                  <div className="mt-4 flex items-end justify-between">
                    <div className="flex gap-0.5 items-end">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <span key={i} className="block w-0.5 rounded-full bg-[#00FFC6]/60" style={{ height: `${8 + Math.abs(Math.sin(i * 0.7)) * 18}px` }} />
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-white/40">Score</div>
                      <div className="text-sm font-semibold text-white">{c.score ?? "—"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FINAL CTA ─── */
export function FinalCTA() {
  const ref = useFadeIn();
  return (
    <section className="relative py-28">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center,rgba(0,255,198,0.1),transparent 60%)" }} />
      <div ref={ref} className="scroll-fade relative mx-auto max-w-3xl px-5 text-center">
        <h2 className="text-3xl lg:text-5xl font-semibold leading-tight text-white">
          Ready to transform your <span className="text-gradient">customer outreach?</span>
        </h2>
        <p className="mt-5 text-white/65">
          Join businesses using VoxAgent for smarter, faster, data-driven conversations at scale.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className="group inline-flex items-center gap-2 rounded-full bg-[#00FFC6] px-6 py-3 text-sm font-medium text-black shadow-[0_0_30px_-8px_rgba(0,255,198,0.6)] hover:shadow-[0_0_60px_-5px_rgba(0,255,198,0.9)] transition-shadow duration-300">
            Create Your Account <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/signin" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white hover:bg-white/[0.08] transition-colors duration-200">
            Sign In to Dashboard
          </Link>
        </div>
        <p className="mt-6 text-xs text-white/40">Free to get started · No credit card required</p>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-5 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md text-black font-bold text-xs" style={{ background: "linear-gradient(135deg,#00FFC6,#007BFF)" }}>V</span>
            <span className="font-display font-semibold text-white">VoxAgent</span>
          </div>
          <p className="mt-2 text-xs text-white/40">AI voice conversations, at scale.</p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm text-white/60">
          <Link href="/signin" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/signin" className="hover:text-white transition-colors">Sign In</Link>
          <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">
            <Github className="size-4" /> GitHub
          </a>
        </nav>
        <p className="text-xs text-white/40">© 2025 VoxAgent. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ─── SECTION HEADER ─── */
function SectionHeader({ label, title }: { label: string; title: string }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} className="scroll-fade text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/70">
        <span className="size-1.5 rounded-full bg-[#00FFC6]" />
        {label}
      </div>
      <h2 className="mx-auto mt-5 max-w-3xl text-3xl lg:text-5xl font-semibold leading-tight text-white">
        {title}
      </h2>
    </div>
  );
}
