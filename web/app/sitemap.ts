import type { MetadataRoute } from "next";

import {
  getPlayersDirectory,
  getTournamentDetails,
  readPartitionIndex
} from "@/lib/data/seo-loaders";
import { siteConfig } from "@/lib/site";
import { buildSitemapEntries } from "@/lib/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [players, tournaments, tournamentIndex] = await Promise.all([
    getPlayersDirectory(),
    getTournamentDetails(),
    readPartitionIndex("tournaments/index.json")
  ]);

  return buildSitemapEntries({
    siteUrl: siteConfig.siteUrl,
    players,
    tournaments,
    tournamentPartitionKeys: tournamentIndex.entries.map((entry) => entry.key)
  });
}
