import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted/60",
        className
      )}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-7 w-52" />
          <Bone className="h-4 w-72" />
        </div>
        <Bone className="h-9 w-24 rounded-md" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Bone className="h-4 w-24" />
              <Bone className="h-5 w-5 rounded" />
            </div>
            <Bone className="h-8 w-20" />
            <Bone className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <Bone className="h-4 w-28 mb-6" />
              <div className="flex justify-center">
                <Bone className="h-40 w-40 rounded-full" />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <Bone className="h-4 w-32" />
              <Bone className="h-20 w-full" />
              <Bone className="h-9 w-full rounded-md" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Bone className="h-5 w-36 mb-4" />
            <Bone className="h-48 w-full" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Bone className="h-5 w-28" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 p-3 rounded-lg border border-border">
              <Bone className="h-4 w-3/4" />
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DisputesSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-7 w-44" />
          <Bone className="h-4 w-64" />
        </div>
        <Bone className="h-9 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <Bone className="h-3 w-20" />
            <Bone className="h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-4">
              <Bone className="h-9 w-9 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Bone className="h-5 w-40" />
                <Bone className="h-4 w-56" />
                <div className="flex gap-3">
                  <Bone className="h-3 w-20" />
                  <Bone className="h-3 w-28" />
                </div>
              </div>
              <Bone className="h-6 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreditReportSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone className="h-7 w-40" />
          <Bone className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-9 w-28 rounded-md" />
          <Bone className="h-9 w-28 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 flex items-center gap-6">
            <Bone className="h-24 w-24 rounded-full flex-shrink-0" />
            <div className="space-y-2">
              <Bone className="h-4 w-20" />
              <Bone className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <Bone className="h-3 w-24" />
            <Bone className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Bone className="h-7 w-48" />
        <Bone className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <Bone className="h-4 w-24" />
            <Bone className="h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <Bone className="h-5 w-40" />
        <Bone className="h-64 w-full" />
      </div>
    </div>
  );
}
