import { cn } from "@/components/ui/utils";
import { formatNullable } from "@/lib/formatters";

export function DataValue({
  value,
  className,
  naLabel = "n/a"
}: {
  value: string | number | null | undefined;
  className?: string;
  naLabel?: string;
}) {
  const label = formatNullable(value);
  if (label === "n/a") {
    return <span className={cn("text-slate-400", className)}>{naLabel}</span>;
  }
  return <span className={className}>{label}</span>;
}

export function NumericValue({
  value,
  className
}: {
  value: string | number | null | undefined;
  className?: string;
}) {
  return <DataValue value={value} className={cn("tabular-nums", className)} />;
}
