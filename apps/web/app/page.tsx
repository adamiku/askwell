import type { Metadata } from "next";
import { APP_NAME } from "@askwell/shared";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InstallSnippet } from "@/components/landing/install-snippet";
import { LandingStyles } from "@/components/landing/landing-styles";
import { LiveDemo } from "@/components/landing/live-demo";
import { Pricing } from "@/components/landing/pricing";

export const metadata: Metadata = {
  title: `${APP_NAME}: AI support chat for your website`,
  description:
    "Add your product info, paste one script tag, and your site gets a chat that answers visitor questions from it.",
};

export default function Home() {
  return (
    <div data-theme="dark" className="min-h-screen bg-bg text-fg">
      <LandingStyles />
      <main>
        <Hero />
        <HowItWorks />
        <LiveDemo />
        <Pricing />
        <InstallSnippet />
      </main>
      <Footer />
    </div>
  );
}
