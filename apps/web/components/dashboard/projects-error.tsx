"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "../error-state";

/** Error state for the project list. Retry asks the server to render the page again. */
export function ProjectsError({ message }: { message: string }) {
  const router = useRouter();
  return (
    <ErrorState title="Could not load your projects" message={message} onRetry={() => router.refresh()} />
  );
}
