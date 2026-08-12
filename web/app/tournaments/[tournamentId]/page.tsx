import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TournamentDetailLoader } from "@/components/tournaments/TournamentDetailLoader";
import { getTournamentDetails } from "@/lib/data/loaders";
import { getTournamentDetailPath } from "@/lib/routes";
import { createPageMetadata, createUnavailableMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { tournamentId: string } }): Promise<Metadata> {
  const tournaments = await getTournamentDetails();
  const tournament = tournaments.find(
    (row) => row.tournament_slug === params.tournamentId || row.tournament_id === params.tournamentId
  );
  if (!tournament?.tournament_name || !tournament.tournament_slug) {
    return createUnavailableMetadata();
  }
  const yearLabel = tournament.year ? ` ${tournament.year}` : "";

  return createPageMetadata({
    title: `${tournament.tournament_name}${yearLabel} — Draw, Results & Predictions`,
    description: `Explore the draw, completed matches, tournament information and prediction coverage for ${tournament.tournament_name}${yearLabel}.`,
    path: getTournamentDetailPath(tournament.tournament_slug)
  });
}
export default async function TournamentDetailPage({ params }: { params: { tournamentId: string } }) {
  const tournaments = await getTournamentDetails();
  const tournament = tournaments.find(
    (row) => row.tournament_slug === params.tournamentId || row.tournament_id === params.tournamentId
  );

  if (!tournament) {
    notFound();
  }

  return (
    <div className="space-y-7">
      <TournamentDetailLoader tournament={tournament} />
    </div>
  );
}
