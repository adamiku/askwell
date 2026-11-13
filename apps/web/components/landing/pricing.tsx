import { GlassPanel } from "../glass-panel";
import { PLAN_SUMMARIES } from "./plans";

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="lp-reveal text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        Pricing
      </h2>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {PLAN_SUMMARIES.map((plan) => (
          <div key={plan.id} className="lp-reveal">
            <GlassPanel className="h-full p-6">
              <h3 className="text-xl font-medium">{plan.name}</h3>
              <dl className="mt-6 divide-y divide-border text-sm">
                {plan.rows.map((row) => (
                  <div key={row.label} className="flex justify-between gap-4 py-3">
                    <dt className="text-fg-muted">{row.label}</dt>
                    <dd className="text-right font-medium">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </GlassPanel>
          </div>
        ))}
      </div>
    </section>
  );
}
