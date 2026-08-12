import { createPageMetadata, staticPageSeo } from "@/lib/seo";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { TournamentsBoard } from "@/components/tournaments/TournamentsBoard";
import { getTournamentDetails } from "@/lib/data/loaders";

export async function generateMetadata(): Promise<Metadata> {
  const tournaments = await getTournamentDetails();
  const latestYear = tournaments
    .map((tournament) => Number(tournament.year))
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];
  const definition = staticPageSeo["/tournaments"];

  return createPageMetadata({
    ...definition,
    title: latestYear ? `ATP Tournaments ${latestYear}` : definition.title,
    description: latestYear
      ? `Browse the ${latestYear} ATP tournament calendar, surfaces, draws, results, winners and available match coverage.`
      : definition.description
  });
}
export default async function TournamentsPage() {
  const tournaments = await getTournamentDetails();

  return (
    <div className="space-y-7">
      <PageHeader
        title="ATP tournaments"
      />
      <TournamentsBoard tournaments={tournaments} />
    </div>
  );
}
