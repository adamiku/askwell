import { GlassPanel } from "../glass-panel";

const SNIPPET = `<script src="https://YOUR-APP-URL/widget.js" data-key="pk_YOUR_PROJECT_KEY"></script>`;

export function InstallSnippet() {
  return (
    <section id="install" className="mx-auto max-w-3xl px-4 py-16">
      <h2 className="lp-reveal text-center text-2xl font-semibold tracking-tight sm:text-3xl">
        One script tag
      </h2>
      <p className="lp-reveal mx-auto mt-3 max-w-xl text-center text-fg-muted">
        Paste this into your page. Use the key from your project.
      </p>
      <GlassPanel className="lp-reveal mt-10 overflow-x-auto p-5">
        <pre className="text-sm leading-relaxed">
          <code>{SNIPPET}</code>
        </pre>
      </GlassPanel>
    </section>
  );
}
