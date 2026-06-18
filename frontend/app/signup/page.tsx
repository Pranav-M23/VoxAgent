"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";


const perks = [
  "AI voice calls delivered via SMS",
  "Real-time sentiment & scoring",
  "22 Indian language support",
  "Live dashboard with auto-refresh",
];

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", company: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim() || undefined,
          password: form.password,
        }),
      });

      let data: any = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        throw new Error(data?.detail || `Server error (${res.status}). Make sure the backend is running.`);
      }

      // ✅ Success — go to sign in with email pre-filled
      router.push(`/signin?email=${encodeURIComponent(form.email.trim())}`);
    } catch (err: any) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError("Cannot connect to backend. Make sure uvicorn is running.");
      } else {
        setError(err.message || "Sign up failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing-root min-h-screen flex items-center justify-center px-5 py-12">
      <div className="fixed inset-0 grid-bg pointer-events-none" style={{ maskImage: "radial-gradient(ellipse at center,black 40%,transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at center,black 40%,transparent 80%)" }} />
      <div className="fixed left-0 top-0 size-[600px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,rgba(0,255,198,0.1),transparent 60%)" }} />
      <div className="fixed right-0 bottom-0 size-[600px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,rgba(0,123,255,0.1),transparent 60%)" }} />

      <div className="relative w-full max-w-4xl grid lg:grid-cols-2 gap-10 items-center">
        {/* Left — value prop */}
        <div className="hidden lg:block fade-up">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <span className="grid size-9 place-items-center rounded-xl text-black font-bold text-base" style={{ background: "linear-gradient(135deg,#00FFC6,#007BFF)" }}>V</span>
            <span className="text-xl font-semibold tracking-tight text-white">VoxAgent</span>
          </Link>
          <h2 className="text-3xl lg:text-4xl font-semibold leading-tight text-white">
            Start having <span className="text-gradient">smarter conversations</span> with your customers.
          </h2>
          <p className="mt-4 text-white/55 leading-relaxed">
            Join businesses using VoxAgent to automate outreach, collect feedback, and turn every voice call into actionable insight.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-white/70">
                <span className="grid size-5 shrink-0 place-items-center rounded-full" style={{ background: "rgba(0,255,198,0.15)", border: "1px solid rgba(0,255,198,0.3)" }}>
                  <Check className="size-3 text-[#00FFC6]" />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-10 p-5 rounded-2xl glass glow-border">
            <p className="text-sm italic text-white/60">&ldquo;VoxAgent reduced our post-service follow-up time by 80%.&rdquo;</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="size-8 rounded-full flex items-center justify-center text-black text-xs font-bold" style={{ background: "linear-gradient(135deg,#00FFC6,#007BFF)" }}>A</div>
              <div>
                <div className="text-xs font-medium text-white">Arjun Mehta</div>
                <div className="text-[11px] text-white/40">Head of CX, AutoServ India</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="fade-up" style={{ animationDelay: "80ms" }}>
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl text-black font-bold" style={{ background: "linear-gradient(135deg,#00FFC6,#007BFF)" }}>V</span>
              <span className="text-xl font-semibold text-white">VoxAgent</span>
            </Link>
          </div>

          <div className="glass glow-border rounded-3xl p-8">
            <h1 className="text-2xl font-semibold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-white/50">Free to start · No credit card required</p>

            {error && (
              <div className="mt-4 rounded-xl px-4 py-3 text-sm flex items-start gap-2" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)" }}>
                <AlertCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5" htmlFor="name">Full name *</label>
                  <input id="name" type="text" autoComplete="name" required value={form.name} onChange={update("name")} placeholder="Pranav Kumar"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5" htmlFor="company">Company</label>
                  <input id="company" type="text" autoComplete="organization" value={form.company} onChange={update("company")} placeholder="Acme Corp"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5" htmlFor="su-email">Email address *</label>
                <input id="su-email" type="email" autoComplete="email" required value={form.email} onChange={update("email")} placeholder="you@company.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }} />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5" htmlFor="su-password">Password * (min 8 chars)</label>
                <div className="relative">
                  <input id="su-password" type={showPw ? "text" : "password"} autoComplete="new-password" required value={form.password} onChange={update("password")} placeholder="Min. 8 characters"
                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 flex gap-1">
                    {[2, 4, 6, 8].map((threshold, i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-colors" style={{
                        background: form.password.length >= threshold
                          ? i < 2 ? "#f87171" : i === 2 ? "#facc15" : "#00FFC6"
                          : "rgba(255,255,255,0.1)"
                      }} />
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-black disabled:opacity-60 disabled:cursor-not-allowed transition-shadow duration-300"
                style={{ background: "#00FFC6", boxShadow: "0 0 28px -6px rgba(0,255,198,0.6)" }}>
                {loading
                  ? <><Loader2 className="size-4 animate-spin" /> Creating account…</>
                  : <>Create Account <ArrowRight className="size-4" /></>
                }
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/50">
              Already have an account?{" "}
              <Link href="/signin" className="text-[#00FFC6] hover:underline font-medium">Sign in</Link>
            </p>
          </div>
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
