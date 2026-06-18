"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

/* ── Navbar: pure CSS scroll effect via class toggle ── */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How It Works" },
    { href: "#usecases", label: "Use Cases" },
    { href: "#dashboard", label: "Dashboard" },
  ];

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(0,0,0,0.78)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottomColor: scrolled ? "rgba(255,255,255,0.07)" : "transparent",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="relative grid size-8 place-items-center rounded-lg z-10" style={{ background: "linear-gradient(135deg,#00FFC6,#007BFF)" }}>
            <span className="text-black font-bold text-sm z-10">V</span>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-white">VoxAgent</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-white transition-colors duration-200">{l.label}</a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/signin" className="text-sm text-white/80 hover:text-white px-3 py-2 transition-colors duration-200">
            Sign In
          </Link>
          <Link href="/signup" className="inline-flex items-center gap-1.5 rounded-full bg-[#00FFC6] px-4 py-2 text-sm font-medium text-black hover:shadow-[0_0_24px_-4px_rgba(0,255,198,0.7)] transition-shadow duration-300">
            Get Started <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <button className="md:hidden text-white p-1" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-white/5 px-5 py-4 flex flex-col gap-3 text-sm">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">{l.label}</a>
          ))}
          <div className="flex gap-2 pt-2">
            <Link href="/signin" className="flex-1 text-center rounded-full border border-white/10 py-2 text-white text-sm">Sign In</Link>
            <Link href="/signup" className="flex-1 text-center rounded-full bg-[#00FFC6] text-black py-2 font-medium text-sm">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── useMounted: kept for compatibility, lightweight ── */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/* ── NeuralBg / ParticleField: static SVG only, zero JS loops ── */
export function NeuralBg() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="lnbg" x1="0" x2="1">
          <stop offset="0" stopColor="#00FFC6" stopOpacity="0" />
          <stop offset="0.5" stopColor="#00FFC6" stopOpacity="0.6" />
          <stop offset="1" stopColor="#007BFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[[10,20,40,60],[20,70,60,30],[50,10,80,70],[15,50,75,40],[30,80,70,20]].map(([x1,y1,x2,y2],i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#lnbg)" strokeWidth="0.2" opacity="0.5" />
      ))}
      {[[10,20],[40,60],[20,70],[60,30],[50,10],[80,70],[15,50],[75,40]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="0.45" fill="#00FFC6" opacity="0.45" />
      ))}
    </svg>
  );
}

export function ParticleField() {
  // Removed — was 40 framer-motion infinite animations = heavy
  return null;
}
