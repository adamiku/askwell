import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
      <div className="mt-8">
        <LoadingSkeleton lines={4} />
      </div>
    </div>
  );
}
