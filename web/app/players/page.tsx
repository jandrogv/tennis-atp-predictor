import { createPageMetadata, staticPageSeo } from "@/lib/seo";
import type { Metadata } from "next";
import { MetricCard } from "@/components/cards/MetricCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayersDirectoryBoard } from "@/components/players/PlayersDirectoryBoard";
import { getPlayersDirectory } from "@/lib/data/loaders";
import { formatNumber } from "@/lib/formatters";

export const metadata: Metadata = createPageMetadata(staticPageSeo["/players"]);

export default async function PlayersPage() {
  const players = await getPlayersDirectory();
  const initialPlayers = players.filter((player) => player.is_active.toLowerCase() === "true");
  const activePlayers = players.filter((player) => player.is_active.toLowerCase() === "true").length;
  const playersWithAtp = players.filter((player) => player.atp_rank).length;
  const playersWithElo = players.filter((player) => player.elo_rank || player.overall_elo).length;

  return (
    <div>
      <PageHeader
        title="Players directory"
      />
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total players" value={formatNumber(players.length)} detail="Players in the current publication" />
        <MetricCard label="Active players" value={formatNumber(activePlayers)} detail="ATP ranked or in predictions" />
        <MetricCard label="With ATP rank" value={formatNumber(playersWithAtp)} detail="Current official ranking" />
        <MetricCard label="With Elo rank" value={formatNumber(playersWithElo)} detail="Custom model rating" />
      </section>
      <PlayersDirectoryBoard players={initialPlayers} totalPlayerCount={players.length} />
    </div>
  );
}
