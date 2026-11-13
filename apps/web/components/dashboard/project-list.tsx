import { GlassPanel } from "../glass-panel";

export type ProjectListItem = { id: string; name: string; created_at: string };

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

export function ProjectList({ projects }: { projects: readonly ProjectListItem[] }) {
  return (
    <GlassPanel>
      <ul className="divide-y divide-border">
        {projects.map((project) => (
          <li key={project.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="min-w-0 truncate font-medium">{project.name}</span>
            <span className="shrink-0 text-sm text-fg-muted">
              Created {dateFormat.format(new Date(project.created_at))}
            </span>
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}
