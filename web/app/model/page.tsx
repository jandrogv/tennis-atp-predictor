import { createPageMetadata, staticPageSeo } from "@/lib/seo";
import type { Metadata } from "next";
import { ModelPerformanceBoard } from "@/components/model/ModelPerformanceBoard";
import {
  getConfusionMatrix,
  getModelBaseline,
  getModelDiagnostics,
  getModelMetrics,
  getModelSummary,
  getProbabilityBins
} from "@/lib/data/loaders";

export const metadata: Metadata = createPageMetadata(staticPageSeo["/model"]);

export default async function ModelPage() {
  const [summary, metrics, baseline, confusionMatrix, probabilityBins, diagnostics] = await Promise.all([
    getModelSummary(),
    getModelMetrics(),
    getModelBaseline(),
    getConfusionMatrix(),
    getProbabilityBins(),
    getModelDiagnostics()
  ]);

  return (
    <div className="space-y-10">
      <header className="mx-auto max-w-3xl space-y-3 text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl">Model performance</h1>
        <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Review the current prediction model, temporal test metrics and model comparison results produced by the
          training pipeline.
        </p>
      </header>
      <ModelPerformanceBoard
        summary={summary}
        metrics={metrics}
        baseline={baseline}
        confusionMatrix={confusionMatrix}
        probabilityBins={probabilityBins}
        diagnostics={diagnostics}
      />
    </div>
  );
}
