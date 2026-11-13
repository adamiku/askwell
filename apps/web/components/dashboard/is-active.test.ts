import { describe, expect, it } from "vitest";
import { isNavItemActive } from "./is-active";

describe("isNavItemActive", () => {
  it("marks Projects on /dashboard and project pages", () => {
    expect(isNavItemActive("/dashboard", "/dashboard")).toBe(true);
    expect(isNavItemActive("/dashboard", "/dashboard/")).toBe(true);
    expect(isNavItemActive("/dashboard", "/dashboard/projects/abc/knowledge")).toBe(true);
  });

  it("does not mark Projects on other sections", () => {
    expect(isNavItemActive("/dashboard", "/dashboard/billing")).toBe(false);
  });

  it("marks Billing only on its own pages", () => {
    expect(isNavItemActive("/dashboard/billing", "/dashboard/billing")).toBe(true);
    expect(isNavItemActive("/dashboard/billing", "/dashboard/billing/invoices")).toBe(true);
    expect(isNavItemActive("/dashboard/billing", "/dashboard")).toBe(false);
    expect(isNavItemActive("/dashboard/billing", "/dashboard/billing-x")).toBe(false);
  });
});
