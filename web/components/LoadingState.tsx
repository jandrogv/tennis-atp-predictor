import { cn } from "@/components/ui/utils";

export function LoadingState({
  title = "Loading data",
  description = "Preparing the latest ATP Insight view.",
  rows = 3,
  className
}: {
  title?: string;
  description?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("atp-panel p-5 sm:p-6", className)} role="status" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-lime-400 shadow-[0_0_0_6px_rgba(190,242,100,0.22)]" />
      </div>
      <div className="mt-5 grid gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-950/[0.05] bg-white/45 p-4">
            <div className="atp-skeleton h-3 w-1/3" />
            <div className="mt-3 grid gap-2">
              <div className="atp-skeleton h-2.5 w-full" />
              <div className="atp-skeleton h-2.5 w-5/6" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
