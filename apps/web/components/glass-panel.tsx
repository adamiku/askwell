import type { ComponentPropsWithoutRef } from "react";

export type GlassPanelProps = ComponentPropsWithoutRef<"div"> & {
  /** Stronger blur and fill, for panels that sit on busy backgrounds. */
  strong?: boolean;
};

export function GlassPanel({ strong = false, className = "", ...props }: GlassPanelProps) {
  const fill = strong
    ? "bg-surface-strong backdrop-blur-glass-strong"
    : "bg-surface backdrop-blur-glass";
  return (
    <div
      className={`rounded-glass border border-border shadow-glass ${fill} ${className}`}
      {...props}
    />
  );
}
