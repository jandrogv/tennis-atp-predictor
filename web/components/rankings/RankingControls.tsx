"use client";

import { cn } from "@/components/ui/utils";
import { FilterMenu, FilterSearch } from "@/components/filters";

export type TopNValue = "10" | "25" | "50" | "all";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search player",
  label = "Player search"
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return <FilterSearch value={value} onChange={onChange} placeholder={placeholder} label={label} />;
}

export function TopNSelect({ value, onChange }: { value: TopNValue; onChange: (value: TopNValue) => void }) {
  return (
    <FilterMenu
      label="Rows"
      value={value}
      onChange={onChange}
      options={[
        { value: "10", label: "Top 10" },
        { value: "25", label: "Top 25" },
        { value: "50", label: "Top 50" },
        { value: "all", label: "All" }
      ]}
    />
  );
}

export function RankingTypeTabs<T extends string>({
  value,
  options,
  onChange
}: {
  value: T;
  options: Array<{ value: T; label: string; tone?: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-slate-950/[0.06] bg-white/45 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "min-h-11 rounded-full px-3 py-1.5 text-sm font-semibold xl:min-h-0 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/30",
            value === option.value
              ? "bg-slate-950 text-white shadow-sm"
              : "text-slate-600 hover:bg-lime-50/80 hover:text-slate-950"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
