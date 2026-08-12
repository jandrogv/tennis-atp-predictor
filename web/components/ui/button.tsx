import { cn } from "@/components/ui/utils";

type ButtonLikeProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "subtle" | "danger";
  size?: "sm" | "md" | "lg";
};

const variants: Record<NonNullable<ButtonLikeProps["variant"]>, string> = {
  primary: "bg-slate-950 text-white shadow-sm hover:bg-slate-800 hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)]",
  secondary:
    "border border-slate-950/[0.08] bg-white/75 text-slate-800 shadow-sm hover:border-lime-300/60 hover:bg-white hover:text-slate-950",
  outline:
    "border border-slate-950/[0.1] bg-white/35 text-slate-800 hover:border-lime-300/60 hover:bg-white/80 hover:text-slate-950",
  ghost: "bg-transparent text-slate-700 hover:bg-lime-400/10 hover:text-slate-950",
  subtle: "border border-slate-950/[0.05] bg-lime-50/55 text-slate-800 hover:border-lime-300/60 hover:bg-lime-50",
  danger: "bg-red-700 text-white shadow-sm hover:bg-red-800"
};

const sizes: Record<NonNullable<ButtonLikeProps["size"]>, string> = {
  sm: "min-h-11 px-3 py-1.5 text-xs xl:min-h-8",
  md: "min-h-11 px-4 py-2 text-sm xl:min-h-10",
  lg: "min-h-11 px-5 py-2.5 text-sm"
};

export function LinkButton({ className, variant = "primary", size = "md", ...props }: ButtonLikeProps) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold transition-[background-color,border-color,color,box-shadow] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
