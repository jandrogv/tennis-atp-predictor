import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { SurfaceBadge } from "@/components/cards/SurfaceBadge";
import { TournamentImagePanel } from "@/components/tournaments/TournamentImagePanel";
import type { TournamentDetail } from "@/lib/data/types";
import { formatDate, formatNullable } from "@/lib/formatters";
import {
  getTournamentImage,
  getTournamentStatus,
  type TournamentImageManifest,
  type TournamentStatus
} from "@/lib/tournaments/tournament-presentation";
import imageManifest from "@/public/images/tournaments/courts/manifest.json";

export function TournamentVisualHeader({
  tournament,
  completedMatches
}: {
  tournament: TournamentDetail;
  completedMatches?: string | number;
}) {
  const image = getTournamentImage(tournament, imageManifest as TournamentImageManifest);
  const currentDate = new Date().toISOString().slice(0, 10);
  const status = getTournamentStatus(tournament, currentDate);
  const location = [tournament.location, tournament.country].filter(hasValue).join(", ");
  const metadata = [
    { label: "Prize money", value: tournament.prize_money },
    { label: "Draw size", value: tournament.draw_size },
    { label: "Last winner", value: tournament.last_winner },
    { label: "Coverage", value: coverageLabel(tournament, completedMatches) }
  ].filter((item) => hasValue(item.value));

  return (
    <header className="group overflow-hidden rounded-2xl border border-white/[0.09] bg-[#050816] shadow-[0_24px_70px_rgba(5,8,22,0.18)]">
      <div className="grid min-h-[30rem] lg:grid-cols-[minmax(0,1.14fr)_minmax(22rem,0.86fr)]">
        <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div>
            <Link
              href="/tournaments"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-4 text-sm font-semibold text-slate-200 transition hover:border-lime-300/45 hover:bg-white/[0.10] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to tournaments
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <SurfaceBadge surface={tournament.surface} />
              <span className="rounded-full border border-white/[0.12] bg-white/[0.07] px-2.5 py-1 text-xs font-semibold text-slate-200">
                {formatNullable(tournament.year)}
              </span>
              {status ? <TournamentStatusBadge status={status} /> : null}
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {formatNullable(tournament.tournament_name)}
            </h1>

            <div className="mt-5 flex flex-col gap-2.5 text-sm font-medium text-slate-300 sm:flex-row sm:flex-wrap sm:gap-x-6">
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

          {metadata.length > 0 ? (
            <dl className="mt-10 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-white/[0.11] pt-6 lg:grid-cols-4">
              {metadata.map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">{item.label}</dt>
                  <dd className="mt-1.5 break-words text-sm font-semibold text-slate-100">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <TournamentImagePanel
          src={image.image}
          alt={image.isFallback ? `${tournament.surface} tennis court` : `${tournament.tournament_name} tournament venue`}
          sizes="(max-width: 1024px) 100vw, 44vw"
          className="order-first min-h-64 lg:order-last lg:min-h-full"
        />
      </div>
    </header>
  );
}

function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
  const tone =
    status === "In progress"
      ? "border-lime-300/35 bg-lime-300/[0.12] text-lime-200"
      : status === "Upcoming"
        ? "border-sky-300/25 bg-sky-300/[0.10] text-sky-100"
        : "border-white/[0.12] bg-white/[0.06] text-slate-300";

  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

function coverageLabel(tournament: TournamentDetail, completedMatches?: string | number): string {
  const completed = String(completedMatches ?? tournament.completed_matches_count ?? "").trim();
  const predictions = String(tournament.predictions_count ?? "").trim();
  const parts = [
    hasValue(completed) ? `${completed} completed` : "",
    hasValue(predictions) ? `${predictions} predictions` : ""
  ].filter(Boolean);
  return parts.join(" / ");
}

function hasValue(value: string | undefined): value is string {
  return Boolean(value && value.trim() && value.toLowerCase() !== "n/a" && value.toLowerCase() !== "nan");
}
