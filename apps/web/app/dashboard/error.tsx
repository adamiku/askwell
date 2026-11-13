"use client";

import { ErrorState } from "@/components/error-state";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl">
      <ErrorState message="The dashboard could not load. Try again." onRetry={reset} />
    </div>
  );
}
