import { GlassPanel } from "../glass-panel";

const STEPS = [
  {
    title: "Add knowledge",
    body: "Upload a PDF or paste text about your product.",
  },
  {
    title: "Copy the snippet",
    body: "Paste one script tag into any web page.",
  },
  {
    title: "Get answers",
    body: "Visitors ask in the chat and get replies based on what you added.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="lp-reveal text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        How it works
      </h2>
      <ol className="mt-10 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="lp-reveal">
            <GlassPanel className="h-full p-6">
              <span className="text-sm text-fg-muted">Step {i + 1}</span>
              <h3 className="mt-2 text-lg font-medium">{step.title}</h3>
              <p className="mt-2 text-sm text-fg-muted">{step.body}</p>
            </GlassPanel>
          </li>
        ))}
      </ol>
    </section>
  );
}
