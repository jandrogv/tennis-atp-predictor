"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SurfaceBadge } from "@/components/cards/SurfaceBadge";
import { TournamentImagePanel } from "@/components/tournaments/TournamentImagePanel";
import type { TournamentDetail } from "@/lib/data/types";
import type { TournamentImageManifest } from "@/lib/tournaments/tournament-presentation";
import { getTournamentImage } from "@/lib/tournaments/tournament-presentation";
import { formatDate, formatNullable } from "@/lib/formatters";
import { getTournamentDetailPath } from "@/lib/routes";

export function ActiveTournamentCarousel({
  tournaments,
  manifest,
  label
}: {
  tournaments: TournamentDetail[];
  manifest: TournamentImageManifest;
  label: "Tournaments in progress" | "Next tournament";
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    viewportRef.current?.scrollTo({ left: 0 });
  }, [tournaments]);

  function moveTo(index: number) {
    const viewport = viewportRef.current;
    const slide = viewport?.children.item(index) as HTMLElement | null;
    if (!viewport || !slide) return;
    viewport.scrollTo({
      left: slide.offsetLeft - viewport.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
    setActiveIndex(index);
  }

  function updateActiveIndex() {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const slides = Array.from(viewport.children) as HTMLElement[];
    const nearest = slides.reduce(
      (best, slide, index) => {
        const distance = Math.abs(slide.offsetLeft - viewport.offsetLeft - viewport.scrollLeft);
        return distance < best.distance ? { index, distance } : best;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY }
    );
    setActiveIndex(nearest.index);
  }

  return (
    <section aria-labelledby="featured-tournaments-title" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="atp-section-label">Current calendar</p>
          <h2 id="featured-tournaments-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {label}
          </h2>
        </div>
        {tournaments.length > 1 ? (
          <div className="flex items-center gap-2" aria-label="Tournament carousel controls">
            {activeIndex > 0 ? (
              <CarouselButton label="Previous tournament" onClick={() => moveTo(activeIndex - 1)}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </CarouselButton>
            ) : null}
            {activeIndex < tournaments.length - 1 ? (
              <CarouselButton label="Next tournament" onClick={() => moveTo(activeIndex + 1)}>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </CarouselButton>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={tournaments.length > 1 ? 0 : -1}
        onScroll={updateActiveIndex}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" && activeIndex > 0) {
            event.preventDefault();
            moveTo(activeIndex - 1);
          }
          if (event.key === "ArrowRight" && activeIndex < tournaments.length - 1) {
            event.preventDefault();
            moveTo(activeIndex + 1);
          }
        }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto rounded-2xl outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-lime-500/35 [&::-webkit-scrollbar]:hidden"
      >
        {tournaments.map((tournament, index) => (
          <div
            key={tournament.tournament_slug || tournament.tournament_id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${tournaments.length}`}
            className="min-w-full snap-start"
          >
            <ActiveTournamentCard tournament={tournament} image={getTournamentImage(tournament, manifest)} priority={index === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ActiveTournamentCard({
  tournament,
  image,
  priority
}: {
  tournament: TournamentDetail;
  image: { image: string; isFallback: boolean };
  priority: boolean;
}) {
  const href = getTournamentDetailPath(tournament.tournament_slug || tournament.tournament_id);
  const location = [tournament.location, tournament.country].filter(hasValue).join(", ");
  const metadata = [
    { label: "Prize money", value: tournament.prize_money },
    { label: "Draw size", value: tournament.draw_size },
    { label: "Last winner", value: tournament.last_winner },
    { label: "Coverage", value: coverageLabel(tournament) }
  ].filter((item) => hasValue(item.value));

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.09] bg-[#050816] shadow-[0_24px_70px_rgba(5,8,22,0.16)]">
      <div className="grid min-h-[26rem] lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)]">
        <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <SurfaceBadge surface={tournament.surface} />
              <span className="rounded-full border border-white/[0.12] bg-white/[0.07] px-2.5 py-1 text-xs font-semibold text-slate-200">
                {formatNullable(tournament.year)}
              </span>
              {image.isFallback ? <span className="text-xs font-medium text-slate-500">Surface image</span> : null}
            </div>
            <h3 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {formatNullable(tournament.tournament_name)}
            </h3>
            <div className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-300 sm:flex-row sm:flex-wrap sm:gap-x-5">
              {location ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-lime-300" aria-hidden="true" />
                  {location}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-lime-300" aria-hidden="true" />
                {formatDate(tournament.start_date || tournament.tournament_date)} - {formatDate(tournament.end_date)}
              </span>
            </div>
          </div>

          <div>
            {metadata.length > 0 ? (
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/[0.11] pt-6 lg:grid-cols-4">
                {metadata.map((item) => (
                  <div key={item.label} className="min-w-0">
                    <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">{item.label}</dt>
                    <dd className="mt-1.5 break-words text-sm font-semibold text-slate-100">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <Link
              href={href}
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-50 px-5 text-sm font-semibold text-[#050816] transition hover:bg-lime-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
            >
              Open tournament
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <TournamentImagePanel
          src={image.image}
          alt={image.isFallback ? `${tournament.surface} tennis court` : `${tournament.tournament_name} tournament venue`}
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 46vw"
          className="order-first min-h-60 lg:order-last lg:min-h-full"
        />
      </div>
    </article>
  );
}

function CarouselButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-950/[0.09] bg-white/75 text-slate-700 shadow-sm transition hover:border-lime-300 hover:bg-lime-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/35"
    >
      {children}
    </button>
  );
}

function coverageLabel(tournament: TournamentDetail): string {
  const parts = [
    hasValue(tournament.completed_matches_count) ? `${tournament.completed_matches_count} completed` : "",
    hasValue(tournament.predictions_count) ? `${tournament.predictions_count} predictions` : ""
  ].filter(Boolean);
  return parts.join(" / ");
}

function hasValue(value: string | undefined): value is string {
  return Boolean(value && value.trim() && value.toLowerCase() !== "n/a" && value.toLowerCase() !== "nan");
}
