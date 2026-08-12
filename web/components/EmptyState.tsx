import type { ReactNode } from "react";
import { cn } from "@/components/ui/utils";

export function EmptyState({
  title,
  description,
  action,
  className
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("atp-panel border-dashed px-5 py-8 text-center sm:px-8", className)}>
      <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-lime-300/70 bg-lime-50/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
        <span className="h-1.5 w-1.5 rounded-full bg-lime-500" aria-hidden="true" />
      </div>
      <p className="text-base font-semibold tracking-tight text-slate-950">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
