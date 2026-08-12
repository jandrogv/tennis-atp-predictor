import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { formatNumber, toNumber } from "@/lib/formatters";

export function RankingMovement({ value, suffix = "" }: { value: string | number | null | undefined; suffix?: string }) {
  const movement = toNumber(value);
  if (movement === null || movement === 0) {
    return (
      <span className="inline-flex items-center justify-center gap-1 text-slate-400" title="No ranking movement">
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">No ranking movement</span>
      </span>
    );
  }

  const movedUp = movement > 0;
  const Icon = movedUp ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 font-semibold tabular-nums",
        movedUp ? "text-emerald-700" : "text-rose-600"
      )}
      title={`${movedUp ? "Up" : "Down"} ${formatNumber(Math.abs(movement))}${suffix}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {formatNumber(Math.abs(movement))}{suffix}
    </span>
  );
}

export function SignedDelta({ value, digits = 0 }: { value: string | number | null | undefined; digits?: number }) {
  const delta = toNumber(value);
  if (delta === null) return <span className="text-slate-400">n/a</span>;
  if (delta === 0) return <span className="text-slate-400">-</span>;
  return <span className="font-medium tabular-nums text-slate-600">{delta > 0 ? "+" : ""}{formatNumber(delta, digits)}</span>;
}
