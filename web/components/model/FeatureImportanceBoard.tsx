"use client";

import { type ReactNode, useMemo, useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { FilterChip, FilterMenu, FilterSummary } from "@/components/filters";
import { TopNSelect, type TopNValue } from "@/components/rankings/RankingControls";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeatureImportance, ModelSummary } from "@/lib/data/types";
import { formatNumber, formatPercent, toNumber } from "@/lib/formatters";

type FeatureGroup = "all" | "elo" | "atp" | "h2h" | "form" | "stats" | "other";
type SpecificFeatureGroup = Exclude<FeatureGroup, "all">;

type LearningInsight = {
  group: string;
  feature: string;
  rank: string;
  importance: string;
  interpretation: string;
};

type SignalFamily = {
  group: SpecificFeatureGroup;
  label: string;
  count: number;
};

const featureGroups: Array<{ value: FeatureGroup; label: string }> = [
  { value: "all", label: "All groups" },
  { value: "elo", label: "Elo" },
  { value: "atp", label: "ATP" },
  { value: "h2h", label: "H2H" },
  { value: "form", label: "Form" },
  { value: "stats", label: "Stats" },
  { value: "other", label: "Other" }
];

const highlightedFeatures = new Set(["ELO_PRE_DIFF", "ELO_SURFACE_PRE_DIFF", "ATP_RANK_DIFF", "ATP_POINT_DIFF"]);

export function FeatureImportanceBoard({
  features,
  summary
}: {
  features: FeatureImportance[];
  summary: ModelSummary | null;
}) {
  const [group, setGroup] = useState<FeatureGroup>("all");
  const [topN, setTopN] = useState<TopNValue>("25");

  const sortedFeatures = useMemo(
    () => features.slice().sort((a, b) => (toNumber(a.rank) ?? 99999) - (toNumber(b.rank) ?? 99999)),
    [features]
  );

  const filteredFeatures = useMemo(() => {
    const grouped = group === "all" ? sortedFeatures : sortedFeatures.filter((feature) => classifyFeature(feature.feature) === group);
    const limit = topN === "all" ? grouped.length : Number(topN);
    return grouped.slice(0, limit);
  }, [group, sortedFeatures, topN]);

  const learningInsights = useMemo(() => buildLearningInsights(sortedFeatures), [sortedFeatures]);
  const signalFamilies = useMemo(() => buildSignalFamilies(sortedFeatures), [sortedFeatures]);
  const topFeature = sortedFeatures[0] ?? null;
  const selectedGroupLabel = featureGroups.find((option) => option.value === group)?.label ?? "All groups";
  const sourceModel = summary?.selected_model?.replace(/_/g, " ") ?? "n/a";

  if (features.length === 0) {
    return <EmptyState title="No feature importance found" description="No published feature ranking is available." />;
  }

  return (
    <div className="space-y-14">
      <FeatureImportanceOverview
        featureCount={features.length}
        sourceModel={sourceModel}
        topFeature={topFeature}
      />

      <WhatModelLearned insights={learningInsights} />

      <TopSignalFamilies families={signalFamilies} />

      <FeatureRankingControls
        group={group}
        topN={topN}
        filteredCount={filteredFeatures.length}
        selectedGroupLabel={selectedGroupLabel}
        onGroupChange={setGroup}
        onTopNChange={setTopN}
      />

      <FeatureImportanceTable features={filteredFeatures} />
    </div>
  );
}

function FeatureImportanceSection({
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

function FeatureImportanceOverview({
  featureCount,
  sourceModel,
  topFeature
}: {
  featureCount: number;
  sourceModel: string;
  topFeature: FeatureImportance | null;
}) {
  return (
    <FeatureImportanceSection
      eyebrow="Feature importance overview"
      title="What this ranking is showing"
      description="Feature importance is a global ranking of the pre-match signals used by the current model artifact. It helps inspect the model as a whole, not one individual prediction."
    >
      <Card className="atp-card atp-card-interactive overflow-hidden">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <OverviewStat label="Top signal" value={topFeature?.feature ?? "n/a"} detail="Highest-ranked row" />
            <OverviewStat label="Features ranked" value={formatNumber(featureCount)} detail="Rows in the artifact" />
            <OverviewStat label="Highest importance" value={formatPercent(topFeature?.importance, 3)} detail="Relative global weight" />
          </div>

          <div className="rounded-3xl border border-slate-950/6 bg-slate-950 p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lime-300">Reading guide</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Importance values come from the latest published evaluation for{" "}
                  <span className="font-semibold text-white">{sourceModel}</span>. They are useful for global inspection, but they do
                  not prove causality and do not explain one specific match by themselves.
                </p>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-3 lg:w-[34rem]">
                <GuidePoint label="Global" value="Model artifact overall" />
                <GuidePoint label="Not causal" value="No direct effect claim" />
                <GuidePoint label="Exact rows" value="Names and values unchanged" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </FeatureImportanceSection>
  );
}
function WhatModelLearned({ insights }: { insights: LearningInsight[] }) {
  const insightGroups = insights.map((insight) => insight.group).join(", ");
  const storyline = insights.slice(0, 4);

  return (
    <FeatureImportanceSection
      eyebrow="What the model learned"
      title="A readable storyline from the top signal families"
      description="The steps below translate the highest-ranked available feature families into tennis concepts. They summarize global model behavior, not a local match explanation."
    >
      <Card className="atp-card atp-card-interactive overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b border-slate-950/5 p-5 sm:p-6">
            <p className="max-w-3xl text-sm leading-6 text-slate-700">
              In this artifact, the strongest available families read as {insightGroups || "available model signals"}. The
              sequence is derived from ranked rows and existing feature names, then translated into human-readable checkpoints.
            </p>
          </div>

          <div className="relative grid divide-y divide-slate-950/5 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
            <div className="pointer-events-none absolute left-6 right-6 top-8 hidden h-px bg-slate-950/10 lg:block" />
            {storyline.map((insight, index) => (
              <StorylineStep key={`${insight.group}-${insight.feature}`} insight={insight} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    </FeatureImportanceSection>
  );
}
function TopSignalFamilies({ families }: { families: SignalFamily[] }) {
  return (
    <FeatureImportanceSection
      eyebrow="Top signal families"
      title="What each feature family means"
      description="Families are derived from the current feature names using the existing grouping rules. Counts are calculated from the loaded ranking rows."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {families.map((family) => (
          <FamilyCard key={family.group} family={family} />
        ))}
      </div>
    </FeatureImportanceSection>
  );
}

function FeatureRankingControls({
  group,
  topN,
  filteredCount,
  selectedGroupLabel,
  onGroupChange,
  onTopNChange
}: {
  group: FeatureGroup;
  topN: TopNValue;
  filteredCount: number;
  selectedGroupLabel: string;
  onGroupChange: (value: FeatureGroup) => void;
  onTopNChange: (value: TopNValue) => void;
}) {
  return (
    <FeatureImportanceSection
      eyebrow="Feature ranking controls"
      title="Filter the complete ranking"
      description="Use the controls to inspect a specific signal family or change how many rows are shown in the full table."
    >
      <section className="atp-filter-panel space-y-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">Ranking table view</p>
            <p className="mt-1 text-sm text-slate-500">Controls affect only the table below and preserve the existing filter behavior.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <FeatureGroupFilter value={group} onChange={onGroupChange} />
            <TopNSelect value={topN} onChange={onTopNChange} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <FilterSummary>
            Showing <strong className="text-slate-950">{filteredCount}</strong> features
          </FilterSummary>
          <FilterChip>{selectedGroupLabel}</FilterChip>
        </div>
      </section>
    </FeatureImportanceSection>
  );
}

function FeatureGroupFilter({
  value,
  onChange
}: {
  value: FeatureGroup;
  onChange: (value: FeatureGroup) => void;
}) {
  return (
    <div className="w-full min-w-[220px]">
      <FilterMenu label="Feature group" value={value} options={featureGroups} onChange={onChange} />
    </div>
  );
}

function FeatureImportanceTable({ features }: { features: FeatureImportance[] }) {
  const maxImportance = Math.max(...features.map((feature) => toNumber(feature.importance) ?? 0), 0);

  return (
    <FeatureImportanceSection
      eyebrow="Full feature ranking table"
      title="Complete inspectable ranking"
      description="Importance values are shown exactly from the artifact. Bars are relative to the highest visible value and help with scanning."
    >
      <Card className="atp-card overflow-hidden">
        <CardHeader className="pb-3">
          <div>
            <CardTitle>Feature ranking</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              The table preserves rank, feature name, group and importance from the current feature importance output.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {features.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="atp-table min-w-full">
                <thead className="text-left">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Feature</th>
                    <th className="px-4 py-3">Group</th>
                    <th className="px-4 py-3">Importance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {features.map((feature) => {
                    const highlighted = highlightedFeatures.has(feature.feature);
                    const importance = toNumber(feature.importance) ?? 0;
                    const width = maxImportance > 0 ? Math.max(4, (importance / maxImportance) * 100) : 0;
                    return (
                      <tr key={feature.feature} className={`transition hover:bg-lime-50/35 ${highlighted ? "bg-emerald-50/45" : ""}`}>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-950">
                          <span className="inline-flex min-w-10 justify-center rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold text-white">
                            #{formatNumber(feature.rank)}
                          </span>
                        </td>
                        <td className="min-w-[240px] px-4 py-3 font-semibold text-slate-950">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{feature.feature}</span>
                            {highlighted ? <Badge tone="success">Tracked signal</Badge> : null}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <Badge>{featureGroupLabel(classifyFeature(feature.feature))}</Badge>
                        </td>
                        <td className="min-w-[220px] px-4 py-3">
                          <ImportanceBar value={importance} max={maxImportance} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No feature rows found" description="Try another group or Top N value." />
          )}
        </CardContent>
      </Card>
    </FeatureImportanceSection>
  );
}

function OverviewStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="atp-hover-lift atp-inset p-4">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-slate-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function GuidePoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="atp-hover-lift rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{value}</p>
    </div>
  );
}

function StorylineStep({ insight, index }: { insight: LearningInsight; index: number }) {
  return (
    <div className="relative p-5 sm:p-6">
      <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-lime-300/35 bg-lime-50 text-xs font-bold text-court-grass shadow-sm">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Badge tone={highlightedFeatures.has(insight.feature) ? "success" : "neutral"}>{insight.group}</Badge>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Rank #{insight.rank}</span>
      </div>
      <p className="mt-3 font-semibold leading-6 text-slate-950">{insight.feature}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{insight.interpretation}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        Importance {formatPercent(insight.importance, 3)}
      </p>
    </div>
  );
}
function FamilyCard({ family }: { family: SignalFamily }) {
  return (
    <div className="atp-hover-lift rounded-2xl border border-slate-950/6 bg-white/55 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{family.count} features</p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-slate-950">{family.label}</h3>
        </div>
        <Badge tone={family.group === "elo" ? "success" : "neutral"}>{family.label}</Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{familyDescription(family.group)}</p>
      <p className="mt-4 rounded-xl border border-slate-950/5 bg-white/55 p-3 text-xs leading-5 text-slate-500">
        This family is shown to explain the type of signal represented in the ranking. Individual feature rows remain in the
        complete table below.
      </p>
    </div>
  );
}
function ImportanceBar({ value, max, dark = false }: { value: number; max: number; dark?: boolean }) {
  const width = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={dark ? "h-2 flex-1 overflow-hidden rounded-full bg-white/10" : "h-2 flex-1 overflow-hidden rounded-full bg-slate-100"}>
        <div className={dark ? "h-full rounded-full bg-lime-300" : "h-full rounded-full bg-slate-950"} style={{ width: `${width}%` }} />
      </div>
      <span className={dark ? "w-16 text-right font-semibold tabular-nums text-lime-200" : "w-16 text-right font-semibold tabular-nums text-slate-900"}>
        {formatPercent(value, 3)}
      </span>
    </div>
  );
}

function buildSignalFamilies(features: FeatureImportance[]): SignalFamily[] {
  const families = new Map<SpecificFeatureGroup, { count: number }>();

  for (const feature of features) {
    const group = classifyFeature(feature.feature);
    const current = families.get(group);
    if (!current) {
      families.set(group, { count: 1 });
      continue;
    }
    current.count += 1;
  }

  return featureGroups
    .filter((option): option is { value: SpecificFeatureGroup; label: string } => option.value !== "all")
    .map((option) => {
      const family = families.get(option.value);
      if (!family) return null;
      return {
        group: option.value,
        label: option.label,
        count: family.count
      };
    })
    .filter((family): family is SignalFamily => family !== null);
}

function buildLearningInsights(features: FeatureImportance[]) {
  const byGroup = new Map<SpecificFeatureGroup, FeatureImportance>();
  for (const feature of features) {
    const group = classifyFeature(feature.feature);
    if (!byGroup.has(group)) {
      byGroup.set(group, feature);
    }
  }

  const preferredOrder: SpecificFeatureGroup[] = ["elo", "form", "atp", "stats", "h2h", "other"];
  const insights: LearningInsight[] = [];
  for (const group of preferredOrder) {
    const feature = byGroup.get(group);
    if (!feature) continue;
    insights.push({
      group: narrativeGroupLabel(group),
      feature: feature.feature,
      rank: feature.rank,
      importance: feature.importance,
      interpretation: narrativeInterpretation(group, feature.feature)
    });
    if (insights.length >= 4) {
      break;
    }
  }
  if (insights.length === 0 && features[0]) {
    insights.push({
      group: "Top signal",
      feature: features[0].feature,
      rank: features[0].rank,
      importance: features[0].importance,
      interpretation: "This is the highest-ranked available feature in the current importance output."
    });
  }
  return insights;
}

function classifyFeature(feature: string): SpecificFeatureGroup {
  const normalized = feature.toUpperCase();
  if (normalized.includes("ELO")) return "elo";
  if (normalized.includes("ATP")) return "atp";
  if (normalized.includes("H2H")) return "h2h";
  if (normalized.includes("WIN_LAST")) return "form";
  if (
    normalized.includes("P_") ||
    normalized.includes("ACE") ||
    normalized.includes("DF") ||
    normalized.includes("1ST") ||
    normalized.includes("2ND") ||
    normalized.includes("BP")
  ) {
    return "stats";
  }
  return "other";
}

function featureGroupLabel(group: SpecificFeatureGroup): string {
  return featureGroups.find((option) => option.value === group)?.label ?? "Other";
}

function narrativeGroupLabel(group: SpecificFeatureGroup): string {
  if (group === "elo") return "Player strength";
  if (group === "form") return "Recent form";
  if (group === "atp") return "Ranking context";
  if (group === "stats") return "Match-stat context";
  if (group === "h2h") return "Head-to-head context";
  if (group === "other") return "Supporting context";
  return featureGroupLabel(group);
}

function narrativeInterpretation(group: SpecificFeatureGroup, feature: string): string {
  if (group === "elo") {
    return `${feature} describes pre-match player strength, including surface-adjusted strength when present.`;
  }
  if (group === "atp") {
    return `${feature} adds official ranking or points context before the match.`;
  }
  if (group === "h2h") {
    return `${feature} captures available player-vs-player context when matchup history exists.`;
  }
  if (group === "form") {
    return `${feature} summarizes short-term player performance through recent match windows.`;
  }
  if (group === "stats") {
    return `${feature} brings serve, return or match-stat history into the global ranking.`;
  }
  return `${feature} contributes context beyond the main Elo, ATP, H2H, form and stat groups.`;
}

function familyDescription(group: SpecificFeatureGroup): string {
  if (group === "elo") return "Strength-style model signals, including overall or surface-adjusted Elo features when present.";
  if (group === "atp") return "Official ranking and points context derived before the match.";
  if (group === "h2h") return "Player-vs-player and surface matchup context where history is available.";
  if (group === "form") return "Recent result windows that summarize short-term player performance.";
  if (group === "stats") return "Serve, return and match-stat history features used as supporting signals.";
  return "Other numeric model inputs that do not belong to the main tennis signal families.";
}
