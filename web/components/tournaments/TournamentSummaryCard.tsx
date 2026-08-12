import Link from "next/link";
import { SurfaceBadge } from "@/components/cards/SurfaceBadge";
import { Card, CardContent } from "@/components/ui/card";
import type { TournamentDetail } from "@/lib/data/types";
import { formatDate, formatNullable, formatNumber, toNumber } from "@/lib/formatters";

type TournamentSummaryCardProps = {
  tournament: TournamentDetail;
  href?: string;
  actionHref?: string;
  actionLabel?: string;
  completedMatches?: string | number;
};

export function TournamentSummaryCard({
  tournament,
  href,
  actionHref,
  actionLabel = "Open tournament",
  completedMatches
}: TournamentSummaryCardProps) {
  const location = getLocationLabel(tournament);
  const mainMetadata = getMainTournamentMetadata(tournament);
  const coverage = getCoverageMetadata(tournament, completedMatches);
  const content = (
    <Card className="atp-card overflow-hidden border-slate-950/[0.06] transition duration-200 group-hover:border-lime-300/55 group-hover:shadow-[0_18px_48px_rgba(15,23,42,0.075)] group-focus-visible:border-lime-300/70">
      <CardContent className="p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <SurfaceBadge surface={tournament.surface} />
              <span className="atp-chip px-2.5 py-1 text-xs">{formatNullable(tournament.year)}</span>
            </div>
            {href ? (
              <span className="inline-flex min-h-11 items-center rounded-full xl:min-h-9 border border-slate-950/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 transition group-hover:border-lime-300/60 group-hover:bg-lime-50/80 group-hover:text-lime-700">
                {actionLabel}
              </span>
            ) : actionHref ? (
              <Link
                href={actionHref}
                className="inline-flex min-h-11 items-center rounded-full xl:min-h-9 border border-slate-950/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-lime-300/60 hover:bg-lime-50/80 hover:text-lime-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400/70"
              >
                {actionLabel}
              </Link>
            ) : null}
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 transition group-hover:text-lime-700 sm:text-3xl">
              {formatNullable(tournament.tournament_name)}
            </h2>
            {location ? <p className="mt-2 text-sm font-medium text-slate-500">{location}</p> : null}
            <p className="mt-4 text-sm font-semibold text-slate-700">
              {formatDate(tournament.start_date || tournament.tournament_date)} <span className="px-1 text-slate-300">-</span>{" "}
              {formatDate(tournament.end_date)}
            </p>
          </div>

          {mainMetadata.length > 0 ? (
            <div className="grid gap-x-8 gap-y-4 border-t border-slate-950/[0.06] pt-5 md:grid-cols-3">
              {mainMetadata.map((item) => (
                <TournamentEditorialMeta key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          ) : null}

          {coverage ? (
            <div className="border-t border-slate-950/[0.06] pt-4 text-sm">
              <span className="font-semibold text-slate-950">Coverage</span>
              <span className="mx-2 text-slate-300">/</span>
              <span className="font-medium text-slate-600">{coverage}</span>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`Open ${formatNullable(tournament.tournament_name)}`}
        className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-400/70"
      >
        {content}
      </Link>
    );
  }

  return <section className="group rounded-2xl">{content}</section>;
}

function TournamentEditorialMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1.5 truncate text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function getMainTournamentMetadata(tournament: TournamentDetail): Array<{ label: string; value: string }> {
  const prizeMoney = getOptionalTournamentValue(tournament, ["prize_money", "prize_pool", "prize", "prizeMoney"]);
  const players = getOptionalTournamentValue(tournament, ["draw_size", "drawSize", "players"]);
  const lastWinner = getOptionalTournamentValue(tournament, ["last_winner", "winner_name", "champion", "defending_champion"]);

  return [
    prizeMoney ? { label: "Prize money", value: prizeMoney } : undefined,
    players ? { label: "Players", value: formatIntegerish(players) } : undefined,
    lastWinner ? { label: "Last winner", value: lastWinner } : undefined
  ].filter((item): item is { label: string; value: string } => Boolean(item));
}

function getCoverageMetadata(tournament: TournamentDetail, completedMatches?: string | number): string | null {
  const completed = completedMatches ?? getOptionalTournamentValue(tournament, ["completed_matches_count"]);
  const predictions = getOptionalTournamentValue(tournament, ["predictions_count"]);
  const parts = [
    hasValue(String(completed ?? "")) ? `${formatIntegerish(completed)} completed ${Number(completed) === 1 ? "match" : "matches"}` : undefined,
    predictions ? `${formatIntegerish(predictions)} ${Number(predictions) === 1 ? "prediction" : "predictions"}` : undefined
  ].filter((value): value is string => Boolean(value));
  return parts.length > 0 ? parts.join(" / ") : null;
}

function getLocationLabel(tournament: TournamentDetail): string | undefined {
  const parts = [tournament.location, tournament.country].filter(hasValue);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function getOptionalTournamentValue(tournament: TournamentDetail, keys: string[]): string | undefined {
  const record = tournament as unknown as Record<string, string | undefined>;
  for (const key of keys) {
    const value = record[key];
    if (hasValue(value)) {
      return value;
    }
  }
  return undefined;
}

function formatIntegerish(value: string | number | null | undefined): string {
  const numericValue = toNumber(value);
  if (numericValue === null) {
    return formatNullable(value);
  }
  const digits = Number.isInteger(numericValue) ? 0 : 1;
  return formatNumber(numericValue, digits);
}

function hasValue(value: string | undefined): boolean {
  return value !== undefined && value.trim() !== "" && value.toLowerCase() !== "nan" && value.toLowerCase() !== "n/a";
}
