import { createPageMetadata, staticPageSeo } from "@/lib/seo";
import type { Metadata } from "next";
import { EloRankingsBoard } from "@/components/rankings/EloRankingsBoard";
import { MetricCard } from "@/components/cards/MetricCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { getPlayerRankings } from "@/lib/data/loaders";
import { formatNumber } from "@/lib/formatters";

export const metadata: Metadata = createPageMetadata(staticPageSeo["/rankings/elo"]);

export default async function EloRankingsPage() {
  const rankings = await getPlayerRankings();
  const playersWithOverallElo = rankings.filter((player) => player.elo_rank).length;
  const playersWithHard = rankings.filter((player) => player.hard_elo_rank).length;
  const playersWithClay = rankings.filter((player) => player.clay_elo_rank).length;
  const playersWithGrass = rankings.filter((player) => player.grass_elo_rank).length;

  return (
    <div className="space-y-7">
      <PageHeader
        title="Elo rankings"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Overall Elo coverage" value={formatNumber(playersWithOverallElo)} detail="Players with general rating" />
        <MetricCard label="Hard court ratings" value={formatNumber(playersWithHard)} detail="Surface-specific entries" />
        <MetricCard label="Clay court ratings" value={formatNumber(playersWithClay)} detail="Surface-specific entries" />
        <MetricCard label="Grass court ratings" value={formatNumber(playersWithGrass)} detail="Surface-specific entries" />
      </section>
      <EloRankingsBoard rankings={rankings} />
    </div>
  );
}
