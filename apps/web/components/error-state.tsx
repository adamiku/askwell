"use client";

import { Button } from "./button";
import { GlassPanel } from "./glass-panel";

export type ErrorStateProps = {
  title?: string;
  /** Rendered as plain text, never HTML. */
  message: string;
  onRetry: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <GlassPanel
      role="alert"
      className={`flex flex-col items-center gap-3 p-8 text-center ${className}`}
    >
      <h2 className="text-lg font-semibold text-danger">{title}</h2>
      <p className="max-w-prose text-sm text-fg-muted">{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </GlassPanel>
  );
}
