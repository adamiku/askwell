import { LandingWidget } from "./landing-widget";

export function LiveDemo() {
  return (
    <section id="demo" className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="lp-reveal text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Try it
      </h2>
      <p className="lp-reveal mx-auto mt-3 max-w-xl text-center text-fg-muted">
        Ask the chat a product question and see how it answers.
      </p>
      <div className="lp-reveal mt-10">
        <LandingWidget />
      </div>
    </section>
  );
}
