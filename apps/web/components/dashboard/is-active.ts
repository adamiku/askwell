/**
 * Whether a nav item is the current page.
 * "/dashboard" (Projects) also owns /dashboard/projects/..., but not other sections.
 */
export function isNavItemActive(href: string, pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (href === "/dashboard") {
    return path === "/dashboard" || path.startsWith("/dashboard/projects");
  }
  return path === href || path.startsWith(`${href}/`);
}
