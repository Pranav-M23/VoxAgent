"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // ── Replace with your real auth API call ──
      // const res = await fetch("/api/auth/signin", { method: "POST", body: JSON.stringify({ email, password }) });
      // if (!res.ok) throw new Error("Invalid credentials");
      await new Promise((r) => setTimeout(r, 900)); // simulate API
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing-root min-h-screen flex items-center justify-center px-5">
      {/* Background */}
      <div className="fixed inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[700px] rounded-full bg-[radial-gradient(circle,rgba(0,255,198,0.12),transparent_60%)] blur-3xl pointer-events-none" />
      <div className="fixed right-0 top-0 size-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,123,255,0.12),transparent_60%)] blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md fade-up">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#00FFC6] to-[#007BFF]">
              <span className="text-black font-bold text-base z-10">V</span>
              <span className="absolute inset-0 rounded-xl blur-md bg-[#00FFC6]/40 group-hover:bg-[#00FFC6]/70 transition" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight text-white">VoxAgent</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass glow-border rounded-3xl p-8">
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-white/50">Sign in to your dashboard</p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFC6]/50 focus:ring-1 focus:ring-[#00FFC6]/30 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-white/60" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs text-[#00FFC6]/80 hover:text-[#00FFC6] transition">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFC6]/50 focus:ring-1 focus:ring-[#00FFC6]/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition"
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 group flex w-full items-center justify-center gap-2 rounded-xl bg-[#00FFC6] px-6 py-3 text-sm font-medium text-black shadow-[0_0_40px_-8px_rgba(0,255,198,0.7)] hover:shadow-[0_0_60px_-5px_rgba(0,255,198,0.9)] disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="mt-6 text-center text-sm text-white/50">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#00FFC6] hover:underline font-medium">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
