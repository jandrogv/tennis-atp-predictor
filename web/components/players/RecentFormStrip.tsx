import type { PlayerRecentMatch } from "@/lib/data/types";
import { formatDate, formatNullable } from "@/lib/formatters";
import { selectRecentForm } from "@/lib/players/recent-form";

export function RecentFormStrip({ matches }: { matches: PlayerRecentMatch[] }) {
  const recentForm = selectRecentForm(matches);
  if (recentForm.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3" aria-label="Recent form from the latest completed matches">
      <p className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-slate-400">Recent form</p>
      <ol className="flex flex-wrap gap-2">
        {recentForm.map((match, index) => {
          const isWin = match.result.trim().toUpperCase() === "W";
          const accessibleLabel = [
            isWin ? "Win" : "Loss",
            `against ${formatNullable(match.opponent_name)}`,
            formatDate(match.match_date) !== "n/a" ? `on ${formatDate(match.match_date)}` : "",
            formatNullable(match.tournament_name) !== "n/a" ? `at ${match.tournament_name}` : ""
          ].filter(Boolean).join(" ");
          return (
            <li key={`${match.match_date}-${match.opponent_id}-${index}`}>
              <span
                aria-label={accessibleLabel}
                title={accessibleLabel}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                  isWin
                    ? "border-emerald-300/70 bg-emerald-50 text-emerald-700"
                    : "border-red-300/70 bg-red-50 text-red-700"
                }`}
              >
                {isWin ? "W" : "L"}
              </span>
            </li>
          );
        })}
      </ol>
      <span className="text-xs font-medium text-slate-500">Latest {recentForm.length} completed</span>
    </div>
  );
}
