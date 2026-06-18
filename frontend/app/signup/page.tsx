"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ArrowRight, Eye, EyeOff, Loader2, Check } from "lucide-react";

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
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
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
      // ── Replace with your real auth API call ──
      // const res = await fetch("/api/auth/signup", { method: "POST", body: JSON.stringify(form) });
      // if (!res.ok) throw new Error("Registration failed");
      await new Promise((r) => setTimeout(r, 1000)); // simulate API
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing-root min-h-screen flex items-center justify-center px-5 py-12">
      {/* Background */}
      <div className="fixed inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" />
      <div className="fixed left-0 top-0 size-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,255,198,0.1),transparent_60%)] blur-3xl pointer-events-none" />
      <div className="fixed right-0 bottom-0 size-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,123,255,0.1),transparent_60%)] blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-4xl grid lg:grid-cols-2 gap-10 items-center">
        {/* Left — value prop */}
        <div className="hidden lg:block fade-up">
          <Link href="/" className="flex items-center gap-2 group mb-10">
            <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#00FFC6] to-[#007BFF]">
              <span className="text-black font-bold text-base z-10">V</span>
              <span className="absolute inset-0 rounded-xl blur-md bg-[#00FFC6]/40 group-hover:bg-[#00FFC6]/70 transition" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight text-white">VoxAgent</span>
          </Link>

          <h2 className="text-3xl lg:text-4xl font-semibold leading-tight text-white">
            Start having <span className="text-gradient">smarter conversations</span> with your customers.
          </h2>
          <p className="mt-4 text-white/55 leading-relaxed">
            Join businesses using VoxAgent to automate outreach, collect feedback, and turn every voice call into actionable insight — in real time.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-white/70">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#00FFC6]/15 border border-[#00FFC6]/30">
                  <Check className="size-3 text-[#00FFC6]" />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-10 p-5 rounded-2xl glass glow-border">
            <p className="text-sm italic text-white/60">
              "VoxAgent reduced our post-service follow-up time by 80% while doubling our NPS response rate."
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="size-8 rounded-full bg-gradient-to-br from-[#00FFC6] to-[#007BFF] flex items-center justify-center text-black text-xs font-bold">A</div>
              <div>
                <div className="text-xs font-medium text-white">Arjun Mehta</div>
                <div className="text-[11px] text-white/40">Head of CX, AutoServ India</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div className="fade-up" style={{ animationDelay: '80ms' }}>
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#00FFC6] to-[#007BFF]">
                <span className="text-black font-bold text-base z-10">V</span>
                <span className="absolute inset-0 rounded-xl blur-md bg-[#00FFC6]/40 group-hover:bg-[#00FFC6]/70 transition" />
              </span>
              <span className="font-display text-xl font-semibold text-white">VoxAgent</span>
            </Link>
          </div>

          <div className="glass glow-border rounded-3xl p-8">
            <h1 className="text-2xl font-semibold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-white/50">Free to start · No credit card required</p>

            {error && (
              <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5" htmlFor="name">Full name</label>
                  <input
                    id="name" type="text" autoComplete="name" required
                    value={form.name} onChange={update("name")} placeholder="Pranav Kumar"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFC6]/50 focus:ring-1 focus:ring-[#00FFC6]/30 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5" htmlFor="company">Company</label>
                  <input
                    id="company" type="text" autoComplete="organization"
                    value={form.company} onChange={update("company")} placeholder="Acme Corp"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFC6]/50 focus:ring-1 focus:ring-[#00FFC6]/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5" htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email" type="email" autoComplete="email" required
                  value={form.email} onChange={update("email")} placeholder="you@company.com"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFC6]/50 focus:ring-1 focus:ring-[#00FFC6]/30 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5" htmlFor="signup-password">Password</label>
                <div className="relative">
                  <input
                    id="signup-password" type={showPw ? "text" : "password"} autoComplete="new-password" required
                    value={form.password} onChange={update("password")} placeholder="Min. 8 characters"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFC6]/50 focus:ring-1 focus:ring-[#00FFC6]/30 transition"
                  />
                  <button
                    type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                        form.password.length >= i * 2
                          ? i <= 2 ? "bg-red-400" : i === 3 ? "bg-yellow-400" : "bg-[#00FFC6]"
                          : "bg-white/10"
                      }`} />
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-white/30 leading-relaxed">
                By creating an account you agree to our{" "}
                <a href="#" className="text-[#00FFC6]/70 hover:underline">Terms of Service</a> and{" "}
                <a href="#" className="text-[#00FFC6]/70 hover:underline">Privacy Policy</a>.
              </p>

              <button
                type="submit" disabled={loading}
                className="mt-1 group flex w-full items-center justify-center gap-2 rounded-xl bg-[#00FFC6] px-6 py-3 text-sm font-medium text-black shadow-[0_0_40px_-8px_rgba(0,255,198,0.7)] hover:shadow-[0_0_60px_-5px_rgba(0,255,198,0.9)] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>Create Account <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/50">
              Already have an account?{" "}
              <Link href="/signin" className="text-[#00FFC6] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
