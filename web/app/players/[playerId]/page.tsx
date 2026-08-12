import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerProfileView } from "@/components/players/PlayerProfileView";
import {
  getMatchCards,
  getPlayerEloHistory,
  getPlayerProfiles,
  getPlayerRankings,
  getPlayerRecentMatches,
  getPlayerSurfaceSummary,
  getPlayerSurfaceEloHistory
} from "@/lib/data/loaders";
import { getPlayerProfilePath, normalizePlayerId } from "@/lib/routes";
import { createPageMetadata, createUnavailableMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { playerId: string } }): Promise<Metadata> {
  const playerId = normalizePlayerId(params.playerId);
  const profiles = await getPlayerProfiles();
  const profile = profiles.find((player) => normalizePlayerId(player.player_id) === playerId);
  if (!profile?.player_name) {
    return createUnavailableMetadata();
  }

  return createPageMetadata({
    title: `${profile.player_name} — ATP Ranking, Elo & Recent Form`,
    description: `View ${profile.player_name}'s ATP ranking, Elo rating, recent form, surface performance and match history on ATP Insight.`,
    path: getPlayerProfilePath(playerId)
  });
}
export default async function PlayerProfilePage({ params }: { params: { playerId: string } }) {
  const playerId = normalizePlayerId(params.playerId);
  const [profiles, rankings, matchCards, eloHistory, surfaceEloHistory, recentMatches, surfaceSummary] = await Promise.all([
    getPlayerProfiles(),
    getPlayerRankings(),
    getMatchCards(),
    getPlayerEloHistory(playerId),
    getPlayerSurfaceEloHistory(playerId),
    getPlayerRecentMatches(playerId),
    getPlayerSurfaceSummary(playerId)
  ]);
  const profile = profiles.find((player) => normalizePlayerId(player.player_id) === playerId);
  if (!profile) {
    notFound();
  }
  const ranking = rankings.find((player) => normalizePlayerId(player.player_id) === playerId);
  const playerNameById: Record<string, string> = Object.fromEntries(
    [
      ...profiles.map((player) => [normalizePlayerId(player.player_id), player.player_name] as const),
      ...rankings.map((player) => [normalizePlayerId(player.player_id), player.player_name] as const)
    ]
      .filter(([id, name]) => id && name)
  );
  const relatedMatches = matchCards.filter(
    (match) => normalizePlayerId(match.player_1_id) === playerId || normalizePlayerId(match.player_2_id) === playerId
  );

  return (
    <div>
      <PageHeader
        title={profile.player_name}
      />
      <PlayerProfileView
        profile={profile}
        ranking={ranking}
        relatedMatches={relatedMatches}
        eloHistory={eloHistory}
        surfaceEloHistory={surfaceEloHistory}
        recentMatches={recentMatches}
        surfaceSummary={surfaceSummary}
        playerNameById={playerNameById}
      />
    </div>
  );
}
