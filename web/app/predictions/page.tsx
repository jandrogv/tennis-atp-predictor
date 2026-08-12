import { createPageMetadata, staticPageSeo } from "@/lib/seo";
import type { Metadata } from "next";
import { MetricCard } from "@/components/cards/MetricCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { PredictionsBoard } from "@/components/predictions/PredictionsBoard";
import { getMatchCards, getSanityCheckerPredictions } from "@/lib/data/loaders";
import { formatNumber } from "@/lib/formatters";

export const metadata: Metadata = createPageMetadata(staticPageSeo["/predictions"]);

export default async function PredictionsPage() {
  const [matches, sanityChecks] = await Promise.all([getMatchCards(), getSanityCheckerPredictions()]);
  const tournaments = new Set(matches.map((match) => match.tournament_name).filter(Boolean)).size;
  const surfaces = new Set(matches.map((match) => match.surface).filter(Boolean)).size;

  return (
    <div>
      <PageHeader
        title="Upcoming ATP match probabilities"
      />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard label="Predicted matches" value={formatNumber(matches.length)} detail="Upcoming fixtures in the current publication" />
        <MetricCard label="Tournaments" value={formatNumber(tournaments)} detail="Events represented in current predictions" />
        <MetricCard label="Surfaces" value={formatNumber(surfaces)} detail="Surface contexts available" />
      </section>
      <PredictionsBoard matches={matches} sanityChecks={sanityChecks} />
    </div>
  );
}
