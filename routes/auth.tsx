import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { NeuralBg, ParticleField } from "@/components/landing/shared";
import { z } from "zod";

const search = z.object({
  mode: z.enum(["signin", "signup"]).optional().default("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Sign in to VoxAgent" },
      { name: "description", content: "Sign in or create your VoxAgent account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  return (
    <main className="relative min-h-screen grid lg:grid-cols-2 bg-black text-white overflow-hidden">
      {/* LEFT — animation */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,198,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,123,255,0.2),transparent_60%)]" />
          <NeuralBg />
          <ParticleField />
          {/* concentric pulse rings */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 rounded-full border border-[color:var(--cyan-glow)]/30"
                style={{ width: 120 + i * 110, height: 120 + i * 110, marginLeft: -(60 + i * 55), marginTop: -(60 + i * 55) }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.15, 0.5] }}
                transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
            <div className="size-20 rounded-full bg-gradient-to-br from-[color:var(--cyan-glow)] to-[color:var(--blue-glow)] grid place-items-center shadow-[0_0_80px_-10px_rgba(0,255,198,0.8)]">
              <span className="text-2xl font-bold text-black">V</span>
            </div>
          </div>
        </div>

        <Link to="/" className="relative z-10 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <ArrowLeft className="size-4" /> Back to site
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="font-display text-3xl font-semibold leading-tight">
            Voice intelligence,<br/>
            <span className="text-gradient">delivered at scale.</span>
          </h2>
          <p className="mt-3 text-sm text-white/55">
            Join teams using VoxAgent to have smarter, faster, data-driven conversations with every customer.
          </p>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="relative flex items-center justify-center p-6 lg:p-12">
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,198,0.12),transparent_60%)]" />
          <ParticleField />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md rounded-2xl glass p-8 glow-border"
        >
          <Link to="/" className="lg:hidden mb-6 inline-flex items-center gap-2 text-xs text-white/60 hover:text-white">
            <ArrowLeft className="size-3.5" /> Back
          </Link>

          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-[color:var(--cyan-glow)] to-[color:var(--blue-glow)] text-black font-bold text-sm">V</span>
            <span className="font-display text-lg font-semibold">VoxAgent</span>
          </div>

          <h1 className="mt-6 text-2xl font-semibold">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-white/55">
            {isSignup
              ? "Start having smarter customer conversations."
              : "Sign in to access your dashboard."}
          </p>

          {/* tab toggle */}
          <div className="relative mt-6 grid grid-cols-2 rounded-full border border-white/10 bg-white/[0.03] p-1 text-sm">
            <motion.div
              layout
              className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-[color:var(--cyan-glow)]/15 border border-[color:var(--cyan-glow)]/40"
              animate={{ x: isSignup ? "calc(100% + 4px)" : 4 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            />
            <button
              onClick={() => navigate({ to: "/auth", search: { mode: "signin" } })}
              className={`relative z-10 py-2 rounded-full transition-colors ${!isSignup ? "text-[color:var(--cyan-glow)]" : "text-white/60"}`}
            >Sign In</button>
            <button
              onClick={() => navigate({ to: "/auth", search: { mode: "signup" } })}
              className={`relative z-10 py-2 rounded-full transition-colors ${isSignup ? "text-[color:var(--cyan-glow)]" : "text-white/60"}`}
            >Sign Up</button>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }}
            className="mt-6 space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {isSignup && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Field icon={User} label="Name" type="text" placeholder="Jane Doe"
                    value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                </motion.div>
              )}
            </AnimatePresence>
            <Field icon={Mail} label="Email" type="email" placeholder="you@company.com"
              value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field icon={Lock} label="Password" type="password" placeholder="••••••••"
              value={form.password} onChange={(v) => setForm({ ...form, password: v })} />

            {!isSignup && (
              <div className="text-right">
                <a href="#" className="text-xs text-white/50 hover:text-[color:var(--cyan-glow)]">Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-full bg-[color:var(--cyan-glow)] py-3 text-sm font-medium text-black shadow-[0_0_30px_-8px_rgba(0,255,198,0.7)] hover:shadow-[0_0_50px_-5px_rgba(0,255,198,1)] transition-shadow"
            >
              <span className="relative inline-flex items-center gap-2">
                {isSignup ? "Create Account" : "Sign In"}
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/40">
            By continuing you agree to our Terms & Privacy.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function Field({
  icon: Icon, label, type, placeholder, value, onChange,
}: {
  icon: any; label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/50">{label}</span>
      <div className={`mt-1.5 relative flex items-center rounded-xl border bg-black/40 transition-all ${focus ? "border-[color:var(--cyan-glow)]/70 shadow-[0_0_0_3px_rgba(0,255,198,0.12)]" : "border-white/10"}`}>
        <Icon className={`ml-3 size-4 transition-colors ${focus ? "text-[color:var(--cyan-glow)]" : "text-white/40"}`} />
        <input
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-white/30"
        />
      </div>
    </label>
  );
}
