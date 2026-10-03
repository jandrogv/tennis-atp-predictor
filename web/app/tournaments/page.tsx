import { createPageMetadata, staticPageSeo } from "@/lib/seo";
import type { Metadata } from "next";
import { connection } from "next/server";
import { cache } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TournamentsBoard } from "@/components/tournaments/TournamentsBoard";
import { getTournamentDetails } from "@/lib/data/loaders";
import { resolveTournamentYear } from "@/lib/tournaments/tournament-presentation";

const getCurrentDate = cache(() => new Date().toISOString().slice(0, 10));

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ year?: string | string[] }> }): Promise<Metadata> {
  await connection();
  const { year: requestedYear } = await searchParams;
  const year = resolveTournamentYear((Array.isArray(requestedYear) ? requestedYear[0] : requestedYear) ?? null, getCurrentDate());
  const definition = staticPageSeo["/tournaments"];

  return createPageMetadata({
    ...definition,
    title: year !== "all" ? `ATP Tournaments ${year}` : definition.title,
    description: year !== "all"
      ? `Browse the ${year} ATP tournament calendar, surfaces, draws, results, winners and available match coverage.`
      : definition.description
  });
}
export default async function TournamentsPage() {
  await connection();
  const currentDate = getCurrentDate();
  const tournaments = await getTournamentDetails();

  return (
    <div className="space-y-7">
      <PageHeader
        title="ATP tournaments"
      />
      <TournamentsBoard tournaments={tournaments} currentDate={currentDate} />
    </div>
  );
}
