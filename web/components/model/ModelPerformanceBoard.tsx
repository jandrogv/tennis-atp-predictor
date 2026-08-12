import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ConfusionMatrixCell,
  ModelBaseline,
  ModelDiagnostics,
  ModelMetric,
  ModelSummary,
  ProbabilityBin
} from "@/lib/data/types";
import { formatNumber, formatNullable, formatPercent, toNumber } from "@/lib/formatters";

type PrimaryMetricKey = "accuracy" | "roc_auc" | "precision" | "recall" | "f1";

const primaryMetrics: Array<{
  key: PrimaryMetricKey;
  label: string;
  detail: string;
  emphasis?: "strong";
}> = [
  {
    key: "roc_auc",
    label: "ROC AUC",
    detail: "How well the model ranks winners above losers.",
    emphasis: "strong"
  },
  {
    key: "accuracy",
    label: "Accuracy",
    detail: "Share of temporal test matches predicted correctly."
  },
  {
    key: "precision",
    label: "Precision",
    detail: "How often predicted positives were correct."
  },
  {
    key: "recall",
    label: "Recall",
    detail: "How many actual positives the model found."
  },
  {
    key: "f1",
    label: "F1",
    detail: "Balanced view of precision and recall."
  }
];

const comparisonMetrics: Array<{ key: PrimaryMetricKey; label: string }> = [
  { key: "roc_auc", label: "ROC AUC" },
  { key: "accuracy", label: "Accuracy" },
  { key: "precision", label: "Precision" },
  { key: "recall", label: "Recall" },
  { key: "f1", label: "F1" }
];

function getModelLabel(model: string | null | undefined) {
  if (!model) return "Model artifact unavailable";
  return model.replace(/_/g, " ");
}

function getCalibrationLabel(model: string | null | undefined) {
  if (!model) return "Calibration status unavailable";
  const lower = model.toLowerCase();
  if (lower.includes("calibrated_sigmoid")) return "Sigmoid calibrated probabilities";
  if (lower.includes("calibrated")) return "Calibrated probabilities";
  return "Raw model probabilities";
}

function getBaseLearnerLabel(model: string | null | undefined) {
  if (!model) return "Model artifact";
  const lower = model.toLowerCase();
  if (lower.includes("xgboost")) return "XGBoost family";
  if (lower.includes("random_forest")) return "Random Forest family";
  if (lower.includes("tensorflow")) return "TensorFlow family";
  return "Model artifact";
}

export function ModelPerformanceBoard({
  summary,
  metrics,
  baseline,
  confusionMatrix,
  probabilityBins,
  diagnostics
}: {
  summary: ModelSummary | null;
  metrics: ModelMetric[];
  baseline: ModelBaseline[];
  confusionMatrix: ConfusionMatrixCell[];
  probabilityBins: ProbabilityBin[];
  diagnostics: ModelDiagnostics | null;
}) {
  if (!summary && metrics.length === 0) {
    return <EmptyState title="Model data unavailable" description="Published model data is not available for this release." />;
  }

  const baselineRow = baseline[0] ?? null;
  const selectedModel = summary?.selected_model ?? diagnostics?.selected_model ?? baselineRow?.selected_model ?? metrics[0]?.model ?? "";

  return (
    <div className="space-y-14">
      <ModelOverview summary={summary} selectedModel={selectedModel} />

      <PerformanceAtGlance summary={summary} metrics={metrics} selectedModel={selectedModel} />

      <BaselineComparison baseline={baselineRow} diagnostics={diagnostics} selectedModel={selectedModel} />

      <CalibrationAndErrors confusionMatrix={confusionMatrix} probabilityBins={probabilityBins} />

      <MetricsExplainer />

      <MethodologyNotes summary={summary} selectedModel={selectedModel} />

      <ModelComparisonSection metrics={metrics} selectedModel={selectedModel} />
    </div>
  );
}

function ModelSection({
  eyebrow,
  title,
  description,
  children,
  className = ""
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-5 ${className}`}>
      <div className="max-w-3xl border-l border-lime-300/55 pl-4">
        <p className="atp-eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function ModelOverview({
  summary,
  selectedModel
}: {
  summary: ModelSummary | null;
  selectedModel: string;
}) {
  return (
    <section className="atp-dark-panel overflow-hidden p-5 sm:p-7 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="flex h-full flex-col justify-center space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-lime-300">Current prediction model</p>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                {getModelLabel(selectedModel)}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                This is the model currently used to publish match probabilities. The metrics below come from a later-season offline evaluation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">{getBaseLearnerLabel(selectedModel)}</Badge>
            <Badge className="border-lime-300/30 bg-lime-300/10 text-lime-200 hover:bg-lime-300/10">
              {getCalibrationLabel(selectedModel)}
            </Badge>
            <Badge className="border-white/15 bg-white/10 text-slate-200 hover:bg-white/10">Web artifact</Badge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <DarkStat label="Test rows" value={formatNullable(summary?.n_test_rows)} />
          <DarkStat label="Feature count" value={formatNullable(summary?.n_features)} />
          <DarkStat label="Probability output" value={getCalibrationLabel(selectedModel)} />
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-5">
        <p className="text-sm leading-6 text-slate-300">
          Feature names are explained with context in <Link href="/feature-importance" className="inline-flex min-h-11 items-center font-semibold text-lime-200 underline xl:min-h-0 decoration-lime-300/40 underline-offset-4 transition hover:text-lime-100">Feature Importance</Link>.
        </p>
      </div>
    </section>
  );
}

function PerformanceAtGlance({
  summary,
  metrics,
  selectedModel
}: {
  summary: ModelSummary | null;
  metrics: ModelMetric[];
  selectedModel: string;
}) {
  return (
    <ModelSection
      eyebrow="Performance at a glance"
      title="Temporal test metrics, grouped for scanning"
      description="These metrics summarize how the current model performed on the later-season evaluation split."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {primaryMetrics.map((metric) => (
          <MetricTile
            key={metric.key}
            label={metric.label}
            detail={metric.detail}
            value={formatPercent(getPrimaryMetricValue(summary, metrics, selectedModel, metric.key))}
            emphasis={metric.emphasis === "strong"}
          />
        ))}
      </div>
    </ModelSection>
  );
}

function BaselineComparison({
  baseline,
  diagnostics,
  selectedModel
}: {
  baseline: ModelBaseline | null;
  diagnostics: ModelDiagnostics | null;
  selectedModel: string;
}) {
  if (!baseline && !diagnostics) {
    return (
      <ModelSection
        eyebrow="Baseline vs model"
        title="Ranking baseline comparison"
        description="The baseline comparison is included when the required ranking fields are available."
      >
        <EmptyState title="Baseline comparison unavailable" description="This run did not publish baseline metrics." />
      </ModelSection>
    );
  }

  const baselineName = baseline?.baseline_name ?? "Higher ATP ranked player";
  const modelAccuracy = diagnostics?.accuracy ?? baseline?.model_accuracy;
  const modelRocAuc = diagnostics?.roc_auc ?? baseline?.model_roc_auc;
  const baselineAccuracy = diagnostics?.baseline_accuracy ?? baseline?.accuracy;
  const baselineRocAuc = diagnostics?.baseline_roc_auc ?? baseline?.roc_auc;
  const accuracyLift = diagnostics?.accuracy_lift ?? baseline?.accuracy_lift;
  const rocAucLift = diagnostics?.roc_auc_lift ?? baseline?.roc_auc_lift;
  const rows = diagnostics?.n_test_rows ?? baseline?.n_test_rows;

  return (
    <ModelSection
      eyebrow="Baseline vs model"
      title="Does the model beat a simple ranking rule?"
      description="The baseline predicts the winner as the player with the better ATP ranking. The model is compared against this simple rule to show whether it adds value beyond ranking alone."
    >
      <Card className="atp-card atp-card-interactive overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
            <ComparisonPanel
              label="Baseline"
              name={baselineName}
              accuracy={baselineAccuracy}
              rocAuc={baselineRocAuc}
              rows={rows}
            />
            <div className="hidden items-center justify-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 lg:flex">
              vs
            </div>
            <ComparisonPanel
              label="Current model"
              name={getModelLabel(selectedModel)}
              accuracy={modelAccuracy}
              rocAuc={modelRocAuc}
              rows={rows}
              tone="model"
            />
          </div>

          <div className="mt-5 border-t border-slate-950/5 pt-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-950">Model improvement over baseline</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                These values show how much the trained model improves over the simple ATP-ranking rule.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <LiftStat label="Accuracy lift" value={formatSignedPercent(accuracyLift)} />
              <LiftStat label="ROC AUC lift" value={formatSignedPercent(rocAucLift)} />
            </div>
          </div>

          {baseline?.notes || diagnostics?.notes ? (
            <p className="mt-4 text-xs leading-5 text-slate-500">{baseline?.notes ?? diagnostics?.notes}</p>
          ) : null}
        </CardContent>
      </Card>
    </ModelSection>
  );
}

function CalibrationAndErrors({
  confusionMatrix,
  probabilityBins
}: {
  confusionMatrix: ConfusionMatrixCell[];
  probabilityBins: ProbabilityBin[];
}) {
  return (
    <ModelSection
      eyebrow="Calibration and errors"
      title="Where the model is right, wrong and overconfident"
      description="This section separates outcome errors from probability behavior so the model can be inspected beyond headline scores."
    >
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <ConfusionMatrixView cells={confusionMatrix} />
        <ProbabilityBinsView bins={probabilityBins} />
      </div>
    </ModelSection>
  );
}

function MetricsExplainer() {
  return (
    <ModelSection
      eyebrow="How to read these metrics"
      title="A compact guide for non-technical review"
      description="Accuracy and ROC AUC answer different questions. Reading them together gives a more reliable picture than either metric alone."
    >
      <Card className="atp-card atp-card-interactive">
        <CardContent className="grid gap-0 divide-y divide-slate-950/5 p-0 md:grid-cols-2 md:divide-x md:divide-y-0">
          <ExplanationItem
            label="Accuracy"
            value="The percentage of test matches where the predicted winner was correct."
          />
          <ExplanationItem
            label="ROC AUC"
            value="How well the model ranks the eventual winner above the loser across probability thresholds."
          />
          <ExplanationItem
            label="Why both matter"
            value="Accuracy is intuitive, while ROC AUC shows ranking quality even when probabilities need calibration."
          />
          <ExplanationItem
            label="Baseline"
            value="A simple ATP ranking rule gives a reference point for whether the model adds signal."
          />
        </CardContent>
      </Card>
    </ModelSection>
  );
}

function MethodologyNotes({
  summary,
  selectedModel
}: {
  summary: ModelSummary | null;
  selectedModel: string;
}) {
  return (
    <ModelSection
      eyebrow="Methodology notes"
      title="What this artifact represents"
      description="The page reads curated evaluation outputs. Metrics are calculated before publication, not in the browser."
    >
      <Card className="atp-card atp-card-interactive overflow-hidden">
        <CardContent className="grid gap-0 p-0 lg:grid-cols-[0.9fr_1.1fr] lg:divide-x lg:divide-slate-950/5">
          <div className="space-y-4 p-5 sm:p-6">
            <div>
              <CardTitle className="text-base">Artifact summary</CardTitle>
              <p className="mt-1 text-sm leading-6 text-slate-500">The current deployed model metadata, read from web artifacts.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MethodologyPoint label="Model artifact" value={getModelLabel(selectedModel)} />
              <MethodologyPoint label="Probability output" value={getCalibrationLabel(selectedModel)} />
              <MethodologyPoint label="Evaluation rows" value={formatNullable(summary?.n_test_rows)} />
              <MethodologyPoint label="Feature count" value={formatNullable(summary?.n_features)} />
            </div>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <div>
              <CardTitle className="text-base">Pipeline context</CardTitle>
              <p className="mt-1 text-sm leading-6 text-slate-500">Training, evaluation and prediction remain separate pipeline stages.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <CompactStat label="Training data" value={formatNumber(toNumber(summary?.n_train_rows))} />
              <CompactStat label="Test data" value={formatNumber(toNumber(summary?.n_test_rows))} />
              <CompactStat label="Features" value={formatNumber(toNumber(summary?.n_features))} />
            </div>
            <div className="atp-hover-lift rounded-2xl border border-slate-950/5 bg-white/55 p-4">
              <p className="text-sm leading-6 text-slate-600">
                The web page displays generated CSV artifacts so metrics stay tied to the run that produced the deployed model files.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ModelSection>
  );
}

function ModelComparisonSection({ metrics, selectedModel }: { metrics: ModelMetric[]; selectedModel: string }) {
  return (
    <ModelSection
      eyebrow="Model comparison"
      title="Candidate model results from the same evaluation run"
      description="The comparison table keeps the raw candidate metrics visible, while the compact bars help scan accuracy and ROC AUC quickly."
    >
      {metrics.length > 0 ? (
        <div className="space-y-5">
          <ModelMetricsTable metrics={metrics} selectedModel={selectedModel} />
          <ModelMetricsBars metrics={metrics} selectedModel={selectedModel} />
        </div>
      ) : (
        <EmptyState title="Model comparison unavailable" description="No candidate model metrics were published for this run." />
      )}
    </ModelSection>
  );
}

function getPrimaryMetricValue(
  summary: ModelSummary | null,
  metrics: ModelMetric[],
  selectedModel: string,
  key: PrimaryMetricKey
) {
  const summaryValue = toNumber(summary?.[key]);
  if (summaryValue !== null) return summaryValue;
  const selectedMetric = metrics.find((metric) => metric.model === selectedModel) ?? metrics[0];
  return toNumber(selectedMetric?.[key]);
}

function MetricTile({
  label,
  value,
  detail,
  emphasis = false
}: {
  label: string;
  value: string;
  detail: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={
        emphasis
          ? "atp-hover-lift rounded-2xl border border-lime-300/35 bg-lime-100/35 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
          : "atp-hover-lift rounded-2xl border border-slate-950/6 bg-white/60 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)]"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
      <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function ComparisonPanel({
  label,
  name,
  accuracy,
  rocAuc,
  rows,
  tone = "baseline"
}: {
  label: string;
  name: string;
  accuracy: string | number | null | undefined;
  rocAuc: string | number | null | undefined;
  rows?: string | number | null | undefined;
  tone?: "baseline" | "model";
}) {
  return (
    <div
      className={
        tone === "model"
          ? "atp-hover-lift rounded-2xl border border-lime-300/30 bg-lime-100/30 p-5"
          : "atp-hover-lift rounded-2xl border border-slate-950/6 bg-white/65 p-5"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-slate-950">{name}</h3>
        </div>
        {tone === "model" ? <Badge className="border-lime-300/40 bg-lime-100 text-slate-800 hover:bg-lime-100">Current</Badge> : null}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
        <CompactStat label="Accuracy" value={formatPercent(toNumber(accuracy))} />
        <CompactStat label="ROC AUC" value={formatPercent(toNumber(rocAuc))} />
        <CompactStat label="Rows" value={formatNullable(rows)} />
      </div>
    </div>
  );
}

function ConfusionMatrixView({ cells }: { cells: ConfusionMatrixCell[] }) {
  const cellCount = (actual: string, predicted: string) =>
    cells.find((cell) => String(cell.actual_class) === actual && String(cell.predicted_class) === predicted)?.count ?? 0;

  return (
    <Card className="atp-card atp-card-interactive">
      <CardHeader className="pb-3">
        <p className="atp-eyebrow">Error map</p>
        <CardTitle className="text-lg">Confusion matrix</CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          The confusion matrix shows where the model was correct and where it confused the two match outcomes.
        </p>
      </CardHeader>
      <CardContent>
        {cells.length === 0 ? (
          <EmptyState title="Confusion matrix unavailable" description="No confusion matrix rows were published." />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <MatrixCell label="True negative" helper="Actual 0, predicted 0" value={cellCount("0", "0")} tone="good" />
            <MatrixCell label="False positive" helper="Actual 0, predicted 1" value={cellCount("0", "1")} tone="warn" />
            <MatrixCell label="False negative" helper="Actual 1, predicted 0" value={cellCount("1", "0")} tone="warn" />
            <MatrixCell label="True positive" helper="Actual 1, predicted 1" value={cellCount("1", "1")} tone="good" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProbabilityBinsView({ bins }: { bins: ProbabilityBin[] }) {
  return (
    <Card className="atp-card atp-card-interactive overflow-hidden">
      <CardHeader className="pb-3">
        <p className="atp-eyebrow">Calibration</p>
        <CardTitle className="text-lg">Probability calibration</CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          This view groups predictions by confidence range and compares predicted probability with actual outcomes.
        </p>
      </CardHeader>
      <CardContent>
        {bins.length === 0 ? (
          <EmptyState title="Probability bins unavailable" description="No probability distribution rows were published." />
        ) : (
          <div className="overflow-x-auto">
            <table className="atp-table min-w-full text-sm">
              <thead>
                <tr>
                  <th>Bin</th>
                  <th>Rows</th>
                  <th>Predicted</th>
                  <th>Actual</th>
                  <th>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {bins.map((bin) => (
                  <tr key={bin.probability_bin}>
                    <td className="font-medium text-slate-900">{bin.probability_bin}</td>
                    <td>{formatNullable(bin.rows)}</td>
                    <td>
                      <MetricBar label="" value={toNumber(bin.mean_probability)} />
                    </td>
                    <td>{formatPercent(toNumber(bin.actual_positive_rate))}</td>
                    <td>{formatPercent(toNumber(bin.accuracy))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ModelMetricsTable({ metrics, selectedModel }: { metrics: ModelMetric[]; selectedModel: string }) {
  return (
    <Card className="atp-card overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Candidate metrics</CardTitle>
        <p className="text-sm text-slate-600">Every row is read from the published model metrics artifact.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto px-5 pb-5 sm:px-6 sm:pb-6">
          <table className="atp-table min-w-full text-[0.94rem]">
            <thead>
              <tr>
                <th className="px-4 py-4 text-left">Model</th>
                {comparisonMetrics.map((metric) => (
                  <th key={metric.key} className="px-4 py-4 text-center">{metric.label}</th>
                ))}
                <th className="px-4 py-4 text-center">Train</th>
                <th className="px-4 py-4 text-center">Test</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => {
                const isSelected = metric.model === selectedModel;
                return (
                  <tr key={metric.model} className={isSelected ? "bg-lime-100/30" : undefined}>
                    <td className="min-w-[15rem] px-4 py-4 font-semibold text-slate-950">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{getModelLabel(metric.model)}</span>
                        {isSelected ? <Badge>Current</Badge> : null}
                      </div>
                    </td>
                    {comparisonMetrics.map((item) => (
                      <td key={item.key} className="px-4 py-4 text-center font-semibold tabular-nums text-slate-900">
                        {formatPercent(toNumber(metric[item.key]))}
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center font-semibold tabular-nums text-slate-900">{formatNullable(metric.n_train)}</td>
                    <td className="px-4 py-4 text-center font-semibold tabular-nums text-slate-900">{formatNullable(metric.n_test)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ModelMetricsBars({ metrics, selectedModel }: { metrics: ModelMetric[]; selectedModel: string }) {
  const displayedMetrics = selectBarMetrics(metrics);

  return (
    <Card className="atp-card atp-card-interactive">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Accuracy vs ROC AUC</CardTitle>
        <p className="text-sm text-slate-600">Two-column scan of the XGBoost candidates when available. Highlighted rows match the current model.</p>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {displayedMetrics.map((metric) => {
          const selected = metric.model === selectedModel;
          return (
            <div
              key={metric.model}
              className={
                selected
                  ? "rounded-2xl border border-lime-300/30 bg-lime-100/30 p-4"
                  : "rounded-2xl border border-slate-950/6 bg-white/55 p-4"
              }
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{getModelLabel(metric.model)}</p>
                {selected ? <Badge>Current</Badge> : null}
              </div>
              <div className="space-y-4">
                <MetricBar label="Accuracy" value={toNumber(metric.accuracy)} tone="lime" />
                <MetricBar label="ROC AUC" value={toNumber(metric.roc_auc)} tone="slate" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function selectBarMetrics(metrics: ModelMetric[]) {
  const preferredModels = ["xgboost", "xgboost_calibrated_sigmoid"];
  const preferred = preferredModels
    .map((modelName) => metrics.find((metric) => metric.model === modelName))
    .filter((metric): metric is ModelMetric => Boolean(metric));
  if (preferred.length > 0) return preferred;
  return metrics.slice(0, 2);
}

function MetricBar({ label, value, tone = "lime" }: { label: string; value: number | null; tone?: "lime" | "slate" }) {
  const width = value === null ? 0 : Math.max(0, Math.min(100, value * 100));
  return (
    <div className="space-y-1.5">
      {label ? (
        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
          <span>{label}</span>
          <span>{formatPercent(value)}</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-slate-950/6">
        <div className={tone === "lime" ? "h-full rounded-full bg-lime-400" : "h-full rounded-full bg-slate-800"} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function MatrixCell({ label, helper, value, tone }: { label: string; helper: string; value: string | number; tone: "good" | "warn" }) {
  return (
    <div
      className={
        tone === "good"
          ? "atp-hover-lift rounded-2xl border border-lime-300/30 bg-lime-100/35 p-4"
          : "atp-hover-lift rounded-2xl border border-amber-300/30 bg-amber-50/70 p-4"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{formatNumber(value)}</p>
      <p className="mt-2 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function LiftStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="atp-hover-lift rounded-2xl border border-slate-950/5 bg-white/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{value}</p>
    </div>
  );
}

function DarkStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="atp-hover-lift rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{value}</p>
    </div>
  );
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="atp-hover-lift atp-inset p-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function MethodologyPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="atp-hover-lift rounded-2xl border border-slate-950/5 bg-white/55 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium leading-5 text-slate-900">{value}</p>
    </div>
  );
}

function ExplanationItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 sm:p-6">
      <p className="text-sm font-semibold text-slate-950">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{value}</p>
    </div>
  );
}

function formatSignedPercent(value: string | number | null | undefined) {
  const numeric = toNumber(value);
  if (numeric === null) return "n/a";
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${formatPercent(numeric)}`;
}
