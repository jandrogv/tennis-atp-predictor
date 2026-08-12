import { cn } from "@/components/ui/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "hard" | "clay" | "grass" | "carpet" | "success" | "warning" | "danger" | "info";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "border-slate-950/[0.06] bg-white/65 text-slate-700",
  hard: "border-blue-200/80 bg-blue-50/70 text-blue-700",
  clay: "border-orange-200/80 bg-orange-50/70 text-orange-700",
  grass: "border-lime-300/70 bg-lime-50/80 text-lime-800",
  carpet: "border-violet-200/80 bg-violet-50/70 text-violet-700",
  success: "border-lime-300/70 bg-lime-50/80 text-lime-800",
  warning: "border-amber-200/80 bg-amber-50/75 text-amber-800",
  danger: "border-red-200/80 bg-red-50/75 text-red-700",
  info: "border-blue-200/80 bg-blue-50/70 text-blue-700"
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold leading-none tracking-[0.01em] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
