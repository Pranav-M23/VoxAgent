import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/shared";
import {
  Hero, Problem, Solution, Features, AIScrollSection,
  UseCases, TechStack, DashboardPreview, FinalCTA, Footer,
} from "@/components/landing/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoxAgent — AI Voice Conversations, at Scale" },
      { name: "description", content: "VoxAgent sends personalised AI voice calls via SMS — natural two-way conversations that collect feedback, drive sales, and update your dashboard in real time." },
      { property: "og:title", content: "VoxAgent — AI Voice Conversations, at Scale" },
      { property: "og:description", content: "Turn every customer call into a conversation that converts. AI-powered voice intelligence for enterprise." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative min-h-screen bg-black text-white antialiased">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <AIScrollSection />
      <UseCases />
      <TechStack />
      <DashboardPreview />
      <FinalCTA />
      <Footer />
    </main>
  );
}
