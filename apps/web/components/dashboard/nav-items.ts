/**
 * Dashboard nav. One item per line, so later phases add entries without merge conflicts.
 * Project pages live under /dashboard/projects/[projectId]/...
 */
export type NavItem = { label: string; href: string };

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Projects", href: "/dashboard" },
  { label: "Billing", href: "/dashboard/billing" },
];
