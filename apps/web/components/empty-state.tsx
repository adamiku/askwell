import type { ReactNode } from "react";
import { GlassPanel } from "./glass-panel";

export type EmptyStateProps = {
  title: string;
  description?: string;
  /** Optional call to action, usually a Button. */
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className = "" }: EmptyStateProps) {
  return (
    <GlassPanel className={`flex flex-col items-center gap-3 p-8 text-center ${className}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="max-w-prose text-sm text-fg-muted">{description}</p> : null}
      {action}
    </GlassPanel>
  );
}
