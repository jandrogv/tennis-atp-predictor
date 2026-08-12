import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TournamentMatchStatisticsDetail } from "@/components/tournaments/TournamentMatchStatisticsDetail";
import { getCurrentMatchStatisticsById, getTournamentDetails } from "@/lib/data/loaders";
import { getTournamentMatchDetailPath } from "@/lib/routes";
import { createPageMetadata, createUnavailableMetadata } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: { tournamentId: string; matchId: string };
}): Promise<Metadata> {
  const [tournaments, match] = await Promise.all([
    getTournamentDetails(),
    getCurrentMatchStatisticsById(params.matchId)
  ]);
  const tournament = tournaments.find(
    (row) => row.tournament_slug === params.tournamentId || row.tournament_id === params.tournamentId
  );
  const playerOne = match?.players.player1.name;
  const playerTwo = match?.players.player2.name;
  if (
    !tournament?.tournament_slug ||
    !match ||
    match.status !== "completed" ||
    match.tournament.slug !== tournament.tournament_slug ||
    !playerOne ||
    !playerTwo
  ) {
    return createUnavailableMetadata();
  }

  return createPageMetadata({
    title: `${playerOne} vs ${playerTwo} — Match Statistics`,
    description: `Compare official match statistics, pre-match Elo, ranking, head-to-head and model signals for ${playerOne} vs ${playerTwo}.`,
    path: getTournamentMatchDetailPath(tournament.tournament_slug, match.matchId)
  });
}
export default async function TournamentMatchStatisticsPage({
  params
}: {
  params: { tournamentId: string; matchId: string };
}) {
  const tournaments = await getTournamentDetails();
  const tournament = tournaments.find(
    (row) => row.tournament_slug === params.tournamentId || row.tournament_id === params.tournamentId
  );
  if (!tournament) notFound();

  return (
    <TournamentMatchStatisticsDetail
      tournamentId={tournament.tournament_slug}
      tournamentName={tournament.tournament_name}
      matchId={params.matchId}
    />
  );
}
