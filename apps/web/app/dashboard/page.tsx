import type { Metadata } from "next";
import { APP_NAME } from "@askwell/shared";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/empty-state";
import { ProjectList } from "@/components/dashboard/project-list";
import { ProjectsError } from "@/components/dashboard/projects-error";
import { loadProjects } from "./load-projects";

export const metadata: Metadata = { title: `Projects | ${APP_NAME}` };

// Reads the signed-in owner's rows, so it can never be prerendered.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const result = await loadProjects();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <div className="flex flex-col items-end gap-1">
          <Button disabled>New project</Button>
          <span className="text-xs text-fg-muted">Creating projects comes next.</span>
        </div>
      </div>

      <div className="mt-8">
        {!result.ok ? (
          <ProjectsError message={result.message} />
        ) : result.projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Projects you create will show up here."
          />
        ) : (
          <ProjectList projects={result.projects} />
        )}
      </div>
    </div>
  );
}
