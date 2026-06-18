"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { saveUser } from "@/lib/auth";


function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill email from ?email= param (after signup redirect)
  useEffect(() => {
    const e = params.get("email");
    if (e) setEmail(decodeURIComponent(e));
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data: any = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        throw new Error(data?.detail || `Server error (${res.status}). Check backend logs.`);
      }

      // ✅ Save user to localStorage then navigate
      saveUser({
        token: data.token,
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        company: data.company ?? null,
      });

      router.push("/dashboard");
    } catch (err: any) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError("Cannot connect to backend. Make sure uvicorn is running.");
      } else {
        setError(err.message || "Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing-root min-h-screen flex items-center justify-center px-5">
      <div className="fixed inset-0 grid-bg pointer-events-none" style={{ maskImage: "radial-gradient(ellipse at center,black 40%,transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at center,black 40%,transparent 80%)" }} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,rgba(0,255,198,0.1),transparent 60%)" }} />
      <div className="fixed right-0 top-0 size-[400px] rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,rgba(0,123,255,0.1),transparent 60%)" }} />

      <div className="relative w-full max-w-md fade-up">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl text-black font-bold text-base" style={{ background: "linear-gradient(135deg,#00FFC6,#007BFF)" }}>V</span>
            <span className="text-xl font-semibold tracking-tight text-white">VoxAgent</span>
          </Link>
        </div>

        <div className="glass glow-border rounded-3xl p-8">
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-white/50">Sign in to your dashboard</p>

          {/* Error banner — always visible */}
          {error && (
            <div className="mt-4 rounded-xl px-4 py-3 text-sm flex items-start gap-2" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)" }}>
              <AlertCircle className="size-4 text-red-400 mt-0.5 shrink-0" />
              <span className="text-red-300">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5" htmlFor="si-email">Email address</label>
              <input
                id="si-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/60" htmlFor="si-password">Password</label>
                <a href="#" className="text-xs text-[#00FFC6]/80 hover:text-[#00FFC6] transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  id="si-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors">
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-black disabled:opacity-60 disabled:cursor-not-allowed transition-shadow duration-300"
              style={{ background: "#00FFC6", boxShadow: "0 0 28px -6px rgba(0,255,198,0.6)" }}
            >
              {loading
                ? <><Loader2 className="size-4 animate-spin" /> Signing in…</>
                : <>Sign In <ArrowRight className="size-4" /></>
              }
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <p className="mt-6 text-center text-sm text-white/50">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#00FFC6] hover:underline font-medium">Sign up free</Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="landing-root min-h-screen" />}>
      <SignInForm />
    </Suspense>
  );
}
