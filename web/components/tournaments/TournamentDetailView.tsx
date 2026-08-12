import { TournamentResultsExplorer } from "@/components/tournaments/TournamentResultsExplorer";
import { TournamentVisualHeader } from "@/components/tournaments/TournamentVisualHeader";
import { EmptyState } from "@/components/EmptyState";
import type { TournamentDetail, TournamentMatch } from "@/lib/data/types";

export function TournamentDetailView({
  tournament,
  matches,
  loadError
}: {
  tournament: TournamentDetail;
  matches: TournamentMatch[] | null;
  loadError?: string | null;
}) {
  return (
    <div className="space-y-10">
      <TournamentVisualHeader
        tournament={tournament}
        completedMatches={matches?.length ?? tournament.completed_matches_count}
      />

      {matches === null ? (
        <div className="atp-panel px-6 py-12 text-center" role="status" aria-live="polite">
          <p className="text-sm font-semibold text-slate-900">Loading tournament results</p>
          <p className="mt-2 text-sm text-slate-500">The selected draw and match table are loaded only for this tournament.</p>
        </div>
      ) : loadError ? (
        <EmptyState title="Tournament results unavailable" description={loadError} />
      ) : (
        <TournamentResultsExplorer matches={matches} />
      )}
    </div>
  );
}
