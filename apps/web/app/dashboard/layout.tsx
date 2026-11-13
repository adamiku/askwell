import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";
import { APP_NAME } from "@askwell/shared";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
      <main className="min-w-0 flex-1 px-4 py-8 md:px-10">{children}</main>
    </div>
  );
}
