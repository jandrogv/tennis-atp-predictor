"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, ListFilter, RotateCcw, Search, X } from "lucide-react";
import { cn } from "@/components/ui/utils";

export type FilterOption<T extends string = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export function FilterSearch({
  value,
  onChange,
  placeholder,
  label,
  className
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="atp-filter-label">{label}</span>
      <span className="relative mt-2 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full control-surface pl-9"
        />
      </span>
    </label>
  );
}

export function FilterMenu<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  ariaLabel
}: {
  label: string;
  value: T;
  options: Array<FilterOption<T>>;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", open ? "z-[90]" : "z-10", className)}>
      <span className="atp-filter-label">{label}</span>
      <button
        type="button"
        aria-label={ariaLabel ?? label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-slate-950/[0.08] bg-white/70 px-3 text-left text-sm font-semibold text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.035)] backdrop-blur transition-[background-color,border-color,box-shadow,color] duration-150 ease-out hover:border-lime-300/80 hover:bg-lime-50/45 hover:shadow-[0_4px_16px_rgba(15,23,42,0.055)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/30"
      >
        <span className="truncate">{selectedOption?.label ?? "Select"}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", open ? "rotate-180 text-lime-700" : "")} aria-hidden="true" />
      </button>
      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-72 overflow-auto rounded-xl border border-slate-950/[0.08] bg-[#fbfcf7]/95 p-1.5 text-sm shadow-[0_18px_44px_rgba(15,23,42,0.13)] backdrop-blur-xl"
        >
          {options.map((option) => {
            const selected = option.value === value;
            const disabled = option.disabled ?? false;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                aria-disabled={disabled || undefined}
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex min-h-11 w-full items-center xl:min-h-9 justify-between gap-3 rounded-lg px-3 py-2 text-left font-medium transition-[background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/30",
                  disabled
                    ? "cursor-not-allowed text-slate-300 opacity-60"
                    : selected
                      ? "bg-lime-100/70 text-slate-950"
                      : "text-slate-600 hover:bg-white/90 hover:text-slate-950"
                )}
              >
                <span className="truncate">{option.label}</span>
                {selected ? <Check className="h-4 w-4 text-lime-700" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function MobileFiltersPanel({
  children,
  activeCount = 0
}: {
  children: ReactNode;
  activeCount?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-950/[0.08] bg-white/70 px-3 text-sm font-semibold text-slate-800 shadow-sm transition-[background-color,border-color,box-shadow,color] duration-150 ease-out hover:border-lime-300/80 hover:bg-lime-50/45 hover:shadow-[0_4px_16px_rgba(15,23,42,0.055)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/30"
      >
        <span className="inline-flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-lime-700" aria-hidden="true" />
          Filters
          {activeCount > 0 ? (
            <span className="rounded-full bg-lime-100 px-2 py-0.5 text-[11px] font-bold text-lime-800">
              {activeCount}
            </span>
          ) : null}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition", open ? "rotate-180 text-lime-700" : "")} aria-hidden="true" />
      </button>
      {open ? <div className="mt-3 grid gap-3 rounded-xl border border-slate-950/[0.06] bg-white/55 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur">{children}</div> : null}
    </div>
  );
}

export function FilterChip({
  children,
  onRemove
}: {
  children: ReactNode;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex min-h-6 items-center gap-1.5 rounded-full border border-lime-300/70 bg-lime-50/75 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="-my-2 -mr-1 inline-flex min-h-10 min-w-10 items-center justify-center rounded-full p-2 xl:my-0 xl:min-h-0 xl:min-w-0 xl:p-0.5 text-lime-800 transition hover:bg-lime-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/30"
          aria-label="Remove filter"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}

export function FilterSummary({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("atp-filter-summary gap-1.5", className)}>
      {children}
    </div>
  );
}

export function FilterReset({ onClick, children = "Reset filters" }: { onClick: () => void; children?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center xl:min-h-8 gap-1.5 rounded-full border border-slate-950/[0.08] bg-white/55 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-[background-color,border-color,color,box-shadow] duration-150 ease-out hover:border-lime-300/80 hover:bg-lime-50/75 hover:text-slate-950 hover:shadow-[0_4px_14px_rgba(15,23,42,0.045)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/30"
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </button>
  );
}

export function allOption<T extends string = string>(label = "All"): FilterOption<T> {
  return { value: "all" as T, label };
}
