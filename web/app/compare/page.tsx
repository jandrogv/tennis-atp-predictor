import { createPageMetadata, staticPageSeo } from "@/lib/seo";
import type { Metadata } from "next";
import { MetricCard } from "@/components/cards/MetricCard";
import { PlayerComparator } from "@/components/compare/PlayerComparator";
import { PageHeader } from "@/components/layout/PageHeader";
import { getActiveComparePlayers } from "@/lib/data/loaders";
import { formatNumber } from "@/lib/formatters";

export const metadata: Metadata = createPageMetadata(staticPageSeo["/compare"]);

export default async function ComparePage() {
  const players = await getActiveComparePlayers();
  const rankedPlayers = players.filter((player) => player.atp_rank).length;
  const playersWithElo = players.filter((player) => player.elo).length;

  return (
    <div>
      <PageHeader
        title="Compare active players"
      />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard label="Selectable players" value={formatNumber(players.length)} detail="Active profiles available" />
        <MetricCard label="With ATP rank" value={formatNumber(rankedPlayers)} detail="Current ranking signal" />
        <MetricCard label="With Elo" value={formatNumber(playersWithElo)} detail="Custom rating available" />
      </section>
      <PlayerComparator players={players} />
    </div>
  );
}
