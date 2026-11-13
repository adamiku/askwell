import { createOwnerClient } from "@/lib/supabase/owner";
import type { ProjectListItem } from "@/components/dashboard/project-list";

export type LoadProjectsResult =
  | { ok: true; projects: ProjectListItem[] }
  | { ok: false; message: string };

/**
 * Reads the signed-in owner's projects through the owner client, so RLS scopes the rows.
 * Errors are returned, not hidden. An auth error here means the Clerk to Supabase
 * third-party auth setup is missing, and the message says so.
 */
export async function loadProjects(): Promise<LoadProjectsResult> {
  try {
    const { data, error } = await createOwnerClient()
      .from("projects")
      .select("id, name, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("dashboard: loading projects failed", error.code, error.message);
      const authProblem =
        error.code === "PGRST301" || error.code === "401" || /jwt|jws|token/i.test(error.message);
      return {
        ok: false,
        message: authProblem
          ? "Supabase did not accept your sign-in token. The Clerk to Supabase auth setup may be missing."
          : "Something went wrong while loading your projects. Try again.",
      };
    }
    return { ok: true, projects: data };
  } catch (err) {
    console.error("dashboard: loading projects threw", err);
    return { ok: false, message: "Something went wrong while loading your projects. Try again." };
  }
}
