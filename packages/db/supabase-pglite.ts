/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "../../supabase/migrations");

// Stubs the parts of Supabase the migrations rely on: the three API roles
// (with Supabase's default grants on new public tables), the `extensions`
// schema, and `auth.jwt()` reading the request claims.
const SUPABASE_STUBS = `
  create role anon nologin noinherit;
  create role authenticated nologin noinherit;
  create role service_role nologin noinherit bypassrls;
  create schema extensions;
  grant usage on schema extensions to anon, authenticated, service_role;
  create schema auth;
  grant usage on schema auth to anon, authenticated, service_role;
  create function auth.jwt() returns jsonb language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
  $$;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

export type ApiRole = "anon" | "authenticated" | "service_role";

/** A fresh in-memory database with the stubs and every migration applied in order. */
export async function createDb(): Promise<PGlite> {
  const db = await PGlite.create({ extensions: { vector } });
  await db.exec(SUPABASE_STUBS);
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await db.exec(readFileSync(join(migrationsDir, file), "utf8"));
  }
  return db;
}

/** Runs `fn` as an API role. `sub` is the Clerk user id in the JWT. Always rolls back. */
export async function asRole<T>(
  db: PGlite,
  role: ApiRole,
  sub: string | null,
  fn: (tx: { query: PGlite["query"] }) => Promise<T>,
): Promise<T> {
  let result: T | undefined;
  let error: unknown;
  let failed = false;
  try {
    await db.transaction(async (tx) => {
      const claims = sub === null ? "" : JSON.stringify({ sub, role });
      await tx.query("select set_config('request.jwt.claims', $1, true)", [claims]);
      await tx.exec(`set local role ${role}`);
      try {
        result = await fn(tx);
      } catch (e) {
        failed = true;
        error = e;
      }
      await tx.rollback();
    });
  } catch (e) {
    if (!failed) throw e;
  }
  if (failed) throw error;
  return result as T;
}
