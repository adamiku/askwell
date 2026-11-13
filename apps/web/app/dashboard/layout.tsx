import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { APP_NAME } from "@askwell/shared";
import { GlassPanel } from "@/components/glass-panel";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ensureAccount } from "@/lib/accounts/ensure-account";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // The ID comes from the Clerk session on the server, never from the client.
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let accountError = false;
  try {
    await ensureAccount(userId);
  } catch (err) {
    console.error("dashboard: ensureAccount failed", err);
    accountError = true;
  }

  return (
    <div data-theme="light" className="min-h-screen bg-bg text-fg md:flex">
      <aside className="border-b border-border bg-surface backdrop-blur-glass md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center gap-3 px-4 py-2 md:h-full md:flex-col md:items-stretch md:gap-6 md:px-4 md:py-6">
          <span className="text-lg font-semibold">{APP_NAME}</span>
          <DashboardNav />
          <div className="flex items-center md:mt-auto">
            <UserButton />
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 md:px-10">
        {accountError ? (
          <GlassPanel role="alert" className="mx-auto flex max-w-3xl flex-col items-center gap-3 p-8 text-center">
            <h2 className="text-lg font-semibold text-danger">Could not set up your account</h2>
            <p className="max-w-prose text-sm text-fg-muted">Something went wrong on our side. Try again.</p>
            {/* A plain link, so the retry is a full page load that runs this check again. */}
            <a
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-control border border-border bg-surface px-4 text-sm font-medium text-fg backdrop-blur-glass hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Try again
            </a>
          </GlassPanel>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
