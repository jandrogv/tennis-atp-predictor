import { createPageMetadata, staticPageSeo } from "@/lib/seo";
import type { Metadata } from "next";
import { FeatureImportanceBoard } from "@/components/model/FeatureImportanceBoard";
import { getFeatureImportance, getModelSummary } from "@/lib/data/loaders";

export const metadata: Metadata = createPageMetadata(staticPageSeo["/feature-importance"]);

export default async function FeatureImportancePage() {
  const [features, summary] = await Promise.all([getFeatureImportance(), getModelSummary()]);

  return (
    <div className="space-y-10">
      <header className="mx-auto max-w-3xl space-y-3 text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl">Feature importance</h1>
        <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Inspect which pre-match signals drive the current model artifact, with filters for Elo, ATP, head-to-head,
          form and match-stat feature groups.
        </p>
      </header>
      <FeatureImportanceBoard features={features} summary={summary} />
    </div>
  );
}
