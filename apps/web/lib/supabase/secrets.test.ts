import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const webRoot = fileURLToPath(new URL("../..", import.meta.url));
const SKIP_DIRS = new Set(["node_modules", ".next", ".turbo"]);
const SELF = "lib/supabase/secrets.test.ts";
const ALLOWED = "lib/supabase/service.ts";
// Built from parts so this file never contains the name it scans for.
const SECRET_KEY_NAME = ["SUPABASE", "SECRET", "KEY"].join("_");

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return SKIP_DIRS.has(entry.name) ? [] : listFiles(join(dir, entry.name));
    return [join(dir, entry.name)];
  });
}

const files = listFiles(webRoot)
  .map((path) => ({ rel: relative(webRoot, path), path }))
  .filter(({ rel }) => rel !== SELF && !/\.(png|jpe?g|gif|ico|woff2?|tsbuildinfo)$/.test(rel));

describe("secret keys", () => {
  it("scans the app", () => {
    expect(files.length).toBeGreaterThan(5);
    expect(files.some(({ rel }) => rel === ALLOWED)).toBe(true);
  });

  it("reads the Supabase secret key only in lib/supabase/service.ts", () => {
    const offenders = files
      .filter(({ rel }) => rel !== ALLOWED)
      .filter(({ path }) => readFileSync(path, "utf8").includes(SECRET_KEY_NAME))
      .map(({ rel }) => rel);
    expect(offenders).toEqual([]);
  });

  it("has no NEXT_PUBLIC_ name containing SECRET", () => {
    const pattern = /NEXT_PUBLIC_[A-Z0-9_]*SECRET/i;
    const offenders = files
      .filter(({ path }) => pattern.test(readFileSync(path, "utf8")))
      .map(({ rel }) => rel);
    expect(offenders).toEqual([]);
  });
});
