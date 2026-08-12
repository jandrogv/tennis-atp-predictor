"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";

export function ZoomableChartFrame({
  title,
  description,
  controls,
  children,
  expandedContent
}: {
  title: string;
  description: string;
  controls?: ReactNode;
  children: ReactNode;
  expandedContent: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="mb-2 flex min-h-9 flex-wrap items-center gap-2">
        {controls ? <div className="flex flex-wrap items-center gap-2">{controls}</div> : null}
        <ChartExpandButton title={title} onClick={() => setOpen(true)} />
      </div>
      {children}
      <ChartZoomModal
        title={title}
        description={description}
        controls={controls}
        open={open}
        onClose={() => setOpen(false)}
      >
        {expandedContent}
      </ChartZoomModal>
    </div>
  );
}

function ChartExpandButton({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${title} chart in a larger view`}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full max-xl:w-11 max-xl:justify-center xl:min-h-0 border border-lime-300/60 bg-white/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-lime-400 hover:bg-lime-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/45 focus-visible:ring-offset-2"
    >
      <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Expand</span>
    </button>
  );
}

function ChartZoomModal({
  title,
  description,
  controls,
  open,
  onClose,
  children
}: {
  title: string;
  description: string;
  controls?: ReactNode;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="max-h-[85vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-white/40 bg-[#f8faf5] shadow-2xl shadow-slate-950/30"
      >
        <div className="flex flex-col gap-4 border-b border-slate-950/[0.06] bg-white/65 p-5 backdrop-blur sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 id={titleId} className="text-xl font-semibold tracking-tight text-slate-950">
                {title}
              </h2>
              {controls ? <div className="flex flex-wrap items-center gap-2">{controls}</div> : null}
            </div>
            <p id={descriptionId} className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Close expanded chart"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-950/[0.08] bg-white/80 text-slate-600 shadow-sm transition hover:border-lime-300 hover:bg-lime-50/70 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/45 focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>,
    document.body
  );
}
