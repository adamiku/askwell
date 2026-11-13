import { GlassPanel } from "./glass-panel";

export type LoadingSkeletonProps = {
  /** Number of placeholder text lines. */
  lines?: number;
  className?: string;
};

export function LoadingSkeleton({ lines = 3, className = "" }: LoadingSkeletonProps) {
  return (
    <GlassPanel
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={`flex flex-col gap-3 p-6 ${className}`}
    >
      <span className="sr-only">Loading</span>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`animate-skeleton h-4 rounded-control bg-surface-strong ${
            i === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </GlassPanel>
  );
}
