import { APP_NAME } from "@askwell/shared";
import { GlassPanel } from "../glass-panel";

/**
 * Placeholder for the live demo.
 * Phase 6 replaces this component with the app's own widget.
 * It is the only place on the landing page that needs to change.
 */
export function LandingWidget() {
  return (
    <GlassPanel strong className="mx-auto flex min-h-64 max-w-md flex-col justify-between p-6">
      <div>
        <p className="text-sm font-medium">{APP_NAME} chat</p>
        <p className="mt-3 text-sm text-fg-muted">
          The live chat will appear here. Until then, this panel is a placeholder.
        </p>
      </div>
      <div className="mt-8 rounded-control border border-border bg-surface px-3 py-3 text-sm text-fg-muted">
        Ask a question
      </div>
    </GlassPanel>
  );
}
