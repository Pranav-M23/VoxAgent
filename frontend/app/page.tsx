import type { Metadata } from "next";
import { Navbar } from "@/components/landing/shared";
import {
  Hero,
  Problem,
  Solution,
  Features,
  AIScrollSection,
  UseCases,
  TechStack,
  DashboardPreview,
  FinalCTA,
  Footer,
} from "@/components/landing/sections";

export const metadata: Metadata = {
  title: "VoxAgent — AI Voice Conversations at Scale",
  description:
    "VoxAgent sends personalised AI voice calls directly to your customers via SMS. Collect feedback, drive sales, and update your dashboard in real time.",
};

export default function LandingPage() {
  return (
    <div className="landing-root min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <AIScrollSection />
        <UseCases />
        <TechStack />
        <DashboardPreview />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
