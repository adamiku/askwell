import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { asRole, createDb } from "../supabase-pglite";

const A = "user_a";
const B = "user_b";
const ZERO_VECTOR = `[${new Array<number>(1536).fill(0).join(",")}]`;
const TABLES = [
  "accounts",
  "projects",
  "widget_configs",
  "knowledge_sources",
  "knowledge_chunks",
  "conversations",
  "messages",
] as const;

const UPDATE_COLUMN: Record<(typeof TABLES)[number], string> = {
  accounts: "plan",
  projects: "name",
  widget_configs: "show_badge",
  knowledge_sources: "title",
  knowledge_chunks: "content",
  conversations: "visitor_id",
  messages: "body",
};

const ids = {
  projA: "00000000-0000-0000-0000-0000000000a1",
  projB: "00000000-0000-0000-0000-0000000000b1",
  srcA: "00000000-0000-0000-0000-0000000000a2",
  srcB: "00000000-0000-0000-0000-0000000000b2",
  convA: "00000000-0000-0000-0000-0000000000a3",
  convB: "00000000-0000-0000-0000-0000000000b3",
};

let db: PGlite;

async function count(role: Parameters<typeof asRole>[1], sub: string | null, table: string) {
  return asRole(db, role, sub, async (tx) => {
    const r = await tx.query<{ n: number }>(`select count(*)::int as n from public.${table}`);
    return r.rows[0]?.n;
  });
}

beforeAll(async () => {
  db = await createDb();
  await db.exec(`
    insert into accounts (clerk_user_id) values ('${A}'), ('${B}');
    insert into projects (id, owner_id, name, public_key) values
      ('${ids.projA}', '${A}', 'A project', 'pk_a'),
      ('${ids.projB}', '${B}', 'B project', 'pk_b');
    insert into widget_configs (project_id) values ('${ids.projA}'), ('${ids.projB}');
    insert into knowledge_sources (id, project_id, title, type) values
      ('${ids.srcA}', '${ids.projA}', 'A doc', 'text'),
      ('${ids.srcB}', '${ids.projB}', 'B doc', 'text');
    insert into knowledge_chunks (project_id, source_id, content, embedding) values
      ('${ids.projA}', '${ids.srcA}', 'a chunk', '${ZERO_VECTOR}'),
      ('${ids.projB}', '${ids.srcB}', 'b chunk', '${ZERO_VECTOR}');
    insert into conversations (id, project_id, visitor_id) values
      ('${ids.convA}', '${ids.projA}', 'v1'),
      ('${ids.convB}', '${ids.projB}', 'v2');
    insert into messages (conversation_id, role, body) values
      ('${ids.convA}', 'visitor', 'hi a'),
      ('${ids.convB}', 'visitor', 'hi b');
  `);
});

afterAll(async () => {
  await db.close();
});

describe("tenant isolation", () => {
  it.each(TABLES)("owner A sees only their own rows in %s", async (table) => {
    expect(await count("authenticated", A, table)).toBe(1);
    expect(await count("authenticated", B, table)).toBe(1);
  });

  it("owner A cannot read owner B's projects, conversations or messages", async () => {
    await asRole(db, "authenticated", A, async (tx) => {
      const p = await tx.query(`select 1 from projects where id = '${ids.projB}'`);
      const c = await tx.query(`select 1 from conversations where id = '${ids.convB}'`);
      const m = await tx.query(`select 1 from messages where conversation_id = '${ids.convB}'`);
      expect(p.rows).toHaveLength(0);
      expect(c.rows).toHaveLength(0);
      expect(m.rows).toHaveLength(0);
    });
  });

  it("a user with no account sees nothing", async () => {
    for (const table of TABLES) {
      expect(await count("authenticated", "user_nobody", table)).toBe(0);
    }
  });

  it("a request with no token sees nothing", async () => {
    for (const table of TABLES) {
      expect(await count("authenticated", null, table)).toBe(0);
    }
  });

  it("owner A cannot rename or delete owner B's project", async () => {
    await asRole(db, "authenticated", A, async (tx) => {
      const u = await tx.query(`update projects set name = 'x' where id = '${ids.projB}'`);
      const d = await tx.query(`delete from projects where id = '${ids.projB}'`);
      expect(u.affectedRows).toBe(0);
      expect(d.affectedRows).toBe(0);
    });
  });
});

describe("anon", () => {
  it.each(TABLES)("is refused on %s", async (table) => {
    await expect(count("anon", null, table)).rejects.toThrow(/permission denied/);
  });

  it.each(TABLES)("cannot write to %s", async (table) => {
    await expect(
      asRole(db, "anon", null, (tx) => tx.query(`delete from public.${table}`)),
    ).rejects.toThrow(/permission denied/);
  });

  it("cannot execute the RLS helpers", async () => {
    await expect(
      asRole(db, "anon", null, (tx) => tx.query("select * from public.owned_project_ids()")),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asRole(db, "anon", null, (tx) => tx.query("select * from public.owned_conversation_ids()")),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("authenticated writes", () => {
  it.each(TABLES)("cannot INSERT into %s", async (table) => {
    await expect(
      asRole(db, "authenticated", A, (tx) => tx.query(`insert into public.${table} default values`)),
    ).rejects.toThrow(/permission denied/);
  });

  it.each(TABLES.filter((t) => t !== "projects"))("cannot UPDATE or DELETE %s", async (table) => {
    await expect(
      asRole(db, "authenticated", A, (tx) => tx.query(`delete from public.${table}`)),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asRole(db, "authenticated", A, (tx) =>
        tx.query(`update public.${table} set ${UPDATE_COLUMN[table]} = ${UPDATE_COLUMN[table]}`),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it.each(["owner_id", "public_key", "messages_used", "period_start", "created_at", "id"])(
    "cannot UPDATE projects.%s",
    async (col) => {
      await expect(
        asRole(db, "authenticated", A, (tx) =>
          tx.query(`update projects set ${col} = ${col} where id = '${ids.projA}'`),
        ),
      ).rejects.toThrow(/permission denied/);
    },
  );

  it("can rename their own project", async () => {
    await asRole(db, "authenticated", A, async (tx) => {
      const u = await tx.query(`update projects set name = 'Renamed' where id = '${ids.projA}'`);
      expect(u.affectedRows).toBe(1);
    });
  });

  it("can delete their own project", async () => {
    await asRole(db, "authenticated", A, async (tx) => {
      const d = await tx.query(`delete from projects where id = '${ids.projA}'`);
      expect(d.affectedRows).toBe(1);
    });
  });

  it("cannot TRUNCATE any table", async () => {
    for (const role of ["anon", "authenticated", "service_role"] as const) {
      for (const table of TABLES) {
        await expect(
          asRole(db, role, A, (tx) => tx.query(`truncate public.${table} cascade`)),
        ).rejects.toThrow(/permission denied/);
      }
    }
  });
});

describe("service_role", () => {
  it.each(TABLES)("reads all rows in %s", async (table) => {
    expect(await count("service_role", null, table)).toBe(2);
  });

  it("can write", async () => {
    await asRole(db, "service_role", null, async (tx) => {
      const r = await tx.query(
        "insert into accounts (clerk_user_id, plan) values ('user_c', 'pro')",
      );
      expect(r.affectedRows).toBe(1);
    });
  });
});

describe("constraints", () => {
  const bad = (sql: string) => db.exec(sql);

  it("rejects values outside the enums", async () => {
    await expect(bad("insert into accounts (clerk_user_id, plan) values ('u', 'gold')")).rejects.toThrow();
    await expect(
      bad(`insert into knowledge_sources (project_id, title, type) values ('${ids.projA}', 't', 'doc')`),
    ).rejects.toThrow();
    await expect(
      bad(`insert into knowledge_sources (project_id, title, type, status) values ('${ids.projA}', 't', 'text', 'x')`),
    ).rejects.toThrow();
    await expect(
      bad(`insert into messages (conversation_id, role, body) values ('${ids.convA}', 'admin', 'x')`),
    ).rejects.toThrow();
  });

  it("requires a unique public_key", async () => {
    await expect(
      bad(`insert into projects (owner_id, name, public_key) values ('${A}', 'dup', 'pk_b')`),
    ).rejects.toThrow(/unique/);
  });

  it("defines no function other than the two RLS helpers", async () => {
    const r = await db.query<{ proname: string }>(`
      select p.proname from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and not exists (
        select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
      order by 1`);
    expect(r.rows.map((x) => x.proname)).toEqual(["owned_conversation_ids", "owned_project_ids"]);
  });
});

describe("cascade", () => {
  it("removes chunks with their source", async () => {
    const d = await createDb();
    await d.exec(`
      insert into accounts (clerk_user_id) values ('${A}');
      insert into projects (id, owner_id, name, public_key) values ('${ids.projA}', '${A}', 'p', 'k');
      insert into knowledge_sources (id, project_id, title, type) values ('${ids.srcA}', '${ids.projA}', 't', 'text');
      insert into knowledge_chunks (project_id, source_id, content, embedding)
        values ('${ids.projA}', '${ids.srcA}', 'c', '${ZERO_VECTOR}');
      delete from knowledge_sources;
    `);
    const r = await d.query<{ n: number }>("select count(*)::int as n from knowledge_chunks");
    expect(r.rows[0]?.n).toBe(0);
    expect((await d.query("select 1 from projects")).rows).toHaveLength(1);
    await d.close();
  });

  it("removes all children with their project", async () => {
    const d = await createDb();
    await d.exec(`
      insert into accounts (clerk_user_id) values ('${A}');
      insert into projects (id, owner_id, name, public_key) values ('${ids.projA}', '${A}', 'p', 'k');
      insert into widget_configs (project_id) values ('${ids.projA}');
      insert into knowledge_sources (id, project_id, title, type) values ('${ids.srcA}', '${ids.projA}', 't', 'text');
      insert into knowledge_chunks (project_id, source_id, content, embedding)
        values ('${ids.projA}', '${ids.srcA}', 'c', '${ZERO_VECTOR}');
      insert into conversations (id, project_id, visitor_id) values ('${ids.convA}', '${ids.projA}', 'v');
      insert into messages (conversation_id, role, body) values ('${ids.convA}', 'bot', 'b');
      delete from projects;
    `);
    for (const table of TABLES.filter((t) => t !== "accounts")) {
      const r = await d.query<{ n: number }>(`select count(*)::int as n from ${table}`);
      expect(r.rows[0]?.n, table).toBe(0);
    }
    await d.close();
  });
});
