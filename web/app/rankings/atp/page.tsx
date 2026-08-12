import { createPageMetadata, staticPageSeo } from "@/lib/seo";
import type { Metadata } from "next";
import { AtpRankingsBoard } from "@/components/rankings/AtpRankingsBoard";
import { PageHeader } from "@/components/layout/PageHeader";
import { getInitialAtpRankingSnapshot } from "@/lib/data/loaders";

export const metadata: Metadata = createPageMetadata(staticPageSeo["/rankings/atp"]);

export default async function AtpRankingsPage() {
  const snapshot = await getInitialAtpRankingSnapshot();

  return (
    <div className="space-y-7">
      <PageHeader
        title="ATP official rankings"
      />
      <AtpRankingsBoard
        initialRankings={snapshot.rankings}
        rankingDates={snapshot.dates}
        initialDate={snapshot.selectedDate}
      />
    </div>
  );
}
