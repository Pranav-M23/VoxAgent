import { VoiceFeedbackPortal } from "@/components/voice-portal/voice-feedback-portal";

// Server component — params are always resolved correctly here.
// The portal itself is a client component via its own "use client" directive.
export default function SessionPage() {
  return <VoiceFeedbackPortal />;
}