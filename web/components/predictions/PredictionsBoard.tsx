"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { MatchCard, SanityCheckerPrediction } from "@/lib/data/types";
import { MatchPredictionCard } from "@/components/cards/MatchPredictionCard";
import { EmptyState } from "@/components/EmptyState";
import {
  FilterChip,
  FilterMenu,
  FilterReset,
  FilterSearch,
  FilterSummary,
  MobileFiltersPanel,
  allOption,
  type FilterOption
} from "@/components/filters";
import {
  formatDate,
  formatNullable,
  formatProductConfidenceBandShort,
  formatRiskLabel,
  toNumber
} from "@/lib/formatters";

type SortMode = "confidence-desc" | "confidence-asc" | "risk-desc" | "agreement-desc" | "date" | "tournament";

type PredictionContext = Pick<
  SanityCheckerPrediction,
  | "product_confidence_band"
  | "explanation_risk_level"
  | "model_agreement_score"
  | "visible_signal_agreement_score"
>;

const DEFAULT_SORT: SortMode = "confidence-desc";
const sortOptions: Array<FilterOption<SortMode>> = [
  { value: "confidence-desc", label: "Highest confidence" },
  { value: "confidence-asc", label: "Lowest confidence" },
  { value: "risk-desc", label: "Highest risk" },
  { value: "agreement-desc", label: "Strongest agreement" },
  { value: "date", label: "Date" },
  { value: "tournament", label: "Tournament" }
];

export function PredictionsBoard({
  matches,
  sanityChecks = []
}: {
  matches: MatchCard[];
  sanityChecks?: SanityCheckerPrediction[];
}) {
  const [tournament, setTournament] = useState("all");
  const [surface, setSurface] = useState("all");
  const [round, setRound] = useState("all");
  const [risk, setRisk] = useState("all");
  const [confidenceSignal, setConfidenceSignal] = useState("all");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>(DEFAULT_SORT);
  const deferredQuery = useDeferredValue(query);

  const tournaments = useMemo(() => buildOptions(matches.map((match) => match.tournament_name)), [matches]);
  const surfaces = useMemo(() => buildOptions(matches.map((match) => match.surface)), [matches]);
  const rounds = useMemo(() => buildOptions(matches.map((match) => match.round)), [matches]);
  const sanityCheckByMatchId = useMemo(() => {
    return new Map(sanityChecks.map((row) => [row.match_id, row]));
  }, [sanityChecks]);
  const riskOptions = useMemo(() => {
    const values = new Set<string>();
    for (const match of matches) {
      const value = normalizeRisk(getPredictionContext(match, sanityCheckByMatchId).explanation_risk_level);
      if (value) values.add(value);
    }
    return Array.from(values)
      .sort((a, b) => riskRankValue(b) - riskRankValue(a))
      .map((value) => ({ value, label: formatRiskLabel(value) ?? value }));
  }, [matches, sanityCheckByMatchId]);
  const confidenceSignalOptions = useMemo(() => {
    const values = new Set<string>();
    for (const match of matches) {
      const value = normalizeText(getPredictionContext(match, sanityCheckByMatchId).product_confidence_band);
      if (value) values.add(value);
    }
    return Array.from(values)
      .sort()
      .map((value) => ({ value, label: formatProductConfidenceBandShort(value) ?? value }));
  }, [matches, sanityCheckByMatchId]);

  const filteredMatches = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return matches
      .filter((match) => tournament === "all" || match.tournament_name === tournament)
      .filter((match) => surface === "all" || match.surface === surface)
      .filter((match) => round === "all" || match.round === round)
      .filter((match) => risk === "all" || normalizeRisk(getPredictionContext(match, sanityCheckByMatchId).explanation_risk_level) === risk)
      .filter(
        (match) =>
          confidenceSignal === "all" ||
          normalizeText(getPredictionContext(match, sanityCheckByMatchId).product_confidence_band) === confidenceSignal
      )
      .filter((match) => {
        if (!normalizedQuery) {
          return true;
        }
        return `${match.player_1_name} ${match.player_2_name}`.toLowerCase().includes(normalizedQuery);
      })
      .sort((a, b) => compareMatches(a, b, sortMode, sanityCheckByMatchId));
  }, [confidenceSignal, deferredQuery, matches, risk, round, sanityCheckByMatchId, sortMode, surface, tournament]);
  const groupedMatches = useMemo(() => groupByTournamentAndRound(filteredMatches), [filteredMatches]);
  const activeFilters = [
    tournament !== "all" ? `Tournament: ${tournament}` : null,
    surface !== "all" ? `Surface: ${surface}` : null,
    round !== "all" ? `Round: ${round}` : null,
    risk !== "all" ? `Risk: ${formatRiskLabel(risk) ?? risk}` : null,
    confidenceSignal !== "all" ? `Signal: ${formatProductConfidenceBandShort(confidenceSignal) ?? confidenceSignal}` : null,
    query.trim() ? `Player: ${query.trim()}` : null
  ].filter((value): value is string => Boolean(value));

  const secondaryFilters = (
    <>
      <FilterMenu label="Tournament" value={tournament} options={[allOption("All tournaments"), ...tournaments]} onChange={setTournament} />
      <FilterMenu label="Surface" value={surface} options={[allOption("All surfaces"), ...surfaces]} onChange={setSurface} />
      <FilterMenu label="Round" value={round} options={[allOption("All rounds"), ...rounds]} onChange={setRound} />
      <FilterMenu label="Risk" value={risk} options={[allOption("All risks"), ...riskOptions]} onChange={setRisk} />
      <FilterMenu
        label="Signal"
        value={confidenceSignal}
        options={[allOption("All signals"), ...confidenceSignalOptions]}
        onChange={setConfidenceSignal}
      />
    </>
  );

  return (
    <div className="space-y-6">
      <section className="atp-filter-panel space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Prediction filters</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Search first, then refine upcoming matches by context, risk and signal agreement.
            </p>
          </div>
          <FilterSummary>
            <strong className="text-slate-950">{filteredMatches.length}</strong>
            <span>/</span>
            <span>{matches.length} matches</span>
          </FilterSummary>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_230px] lg:items-end">
          <FilterSearch value={query} onChange={setQuery} placeholder="Search player" label="Player search" />
          <FilterMenu label="Sort by" value={sortMode} options={sortOptions} onChange={setSortMode} />
        </div>

        <div className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-5">{secondaryFilters}</div>
        <MobileFiltersPanel activeCount={activeFilters.length}>{secondaryFilters}</MobileFiltersPanel>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-950/[0.06] pt-4 text-sm text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>{sortLabel(sortMode)}</span>
            <span className="text-slate-300" aria-hidden="true">/</span>
            {activeFilters.length > 0 ? (
              activeFilters.map((label) => <FilterChip key={label}>{label}</FilterChip>)
            ) : (
              <span className="atp-chip px-2.5 py-1 text-slate-500">No filters active</span>
            )}
          </div>
          <FilterReset
            onClick={() => {
              setTournament("all");
              setSurface("all");
              setRound("all");
              setRisk("all");
              setConfidenceSignal("all");
              setQuery("");
              setSortMode(DEFAULT_SORT);
            }}
          />
        </div>
      </section>

      {filteredMatches.length > 0 ? (
        <section className="space-y-6">
          {groupedMatches.map((group) => (
            <div key={group.key} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-slate-950">{group.tournament}</h2>
                <span className="rounded-full border border-slate-950/[0.06] bg-white/60 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {group.round}
                </span>
                <span className="text-sm text-slate-500">{group.matches.length} matches</span>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                {group.matches.map((match, index) => (
                  <MatchPredictionCard
                    key={match.match_id || `${match.player_1_id}-${match.player_2_id}-${match.round}-${index}`}
                    match={match}
                    sanityCheck={sanityCheckByMatchId.get(match.match_id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <EmptyState
          title="No predictions found"
          description="Try clearing filters or choosing a broader tournament, surface, round, risk or signal."
        />
      )}
    </div>
  );
}

function groupByTournamentAndRound(matches: MatchCard[]): Array<{ key: string; tournament: string; round: string; matches: MatchCard[] }> {
  const groups = new Map<string, { key: string; tournament: string; round: string; matches: MatchCard[] }>();
  for (const match of matches) {
    const tournament = match.tournament_name || "Unknown tournament";
    const roundLabel = match.round || "Unknown round";
    const key = `${tournament}__${roundLabel}`;
    const group = groups.get(key) ?? { key, tournament, round: roundLabel, matches: [] };
    group.matches.push(match);
    groups.set(key, group);
  }
  return Array.from(groups.values());
}

function buildOptions(values: string[]): Array<FilterOption> {
  return Array.from(new Set(values.filter(Boolean))).sort().map((value) => ({ value, label: value }));
}

function compareMatches(
  a: MatchCard,
  b: MatchCard,
  sortMode: SortMode,
  sanityCheckByMatchId: Map<string, SanityCheckerPrediction>
): number {
  if (sortMode === "date") {
    return dateSortValue(a.match_date) - dateSortValue(b.match_date);
  }
  if (sortMode === "tournament") {
    return a.tournament_name.localeCompare(b.tournament_name) || a.round.localeCompare(b.round);
  }
  if (sortMode === "confidence-asc") {
    return confidence(a) - confidence(b);
  }
  if (sortMode === "risk-desc") {
    return (
      riskRank(getPredictionContext(b, sanityCheckByMatchId)) - riskRank(getPredictionContext(a, sanityCheckByMatchId)) ||
      confidence(b) - confidence(a)
    );
  }
  if (sortMode === "agreement-desc") {
    return (
      agreementScore(getPredictionContext(b, sanityCheckByMatchId)) - agreementScore(getPredictionContext(a, sanityCheckByMatchId)) ||
      visibleSignalScore(getPredictionContext(b, sanityCheckByMatchId)) - visibleSignalScore(getPredictionContext(a, sanityCheckByMatchId)) ||
      confidence(b) - confidence(a)
    );
  }
  return confidence(b) - confidence(a);
}

function confidence(match: MatchCard): number {
  return Math.max(toNumber(match.player_1_win_probability) ?? 0, toNumber(match.player_2_win_probability) ?? 0);
}

function dateSortValue(value: string): number {
  const formatted = formatDate(value);
  return formatted === "n/a" ? 0 : Date.parse(formatted);
}

function riskRank(context: PredictionContext): number {
  return riskRankValue(normalizeRisk(context.explanation_risk_level));
}

function riskRankValue(value: string | null): number {
  if (value === "high") return 3;
  if (value === "medium") return 2;
  if (value === "low") return 1;
  return 0;
}

function agreementScore(context: PredictionContext): number {
  return toNumber(context.model_agreement_score) ?? -1;
}

function visibleSignalScore(context: PredictionContext): number {
  return toNumber(context.visible_signal_agreement_score) ?? -1;
}

function getPredictionContext(match: MatchCard, sanityCheckByMatchId: Map<string, SanityCheckerPrediction>): PredictionContext {
  const sanityCheck = sanityCheckByMatchId.get(match.match_id);
  return {
    product_confidence_band: sanityCheck?.product_confidence_band ?? match.product_confidence_band,
    explanation_risk_level: sanityCheck?.explanation_risk_level ?? match.explanation_risk_level,
    model_agreement_score: sanityCheck?.model_agreement_score ?? match.model_agreement_score,
    visible_signal_agreement_score: sanityCheck?.visible_signal_agreement_score ?? match.visible_signal_agreement_score
  };
}

function normalizeRisk(value: string | null | undefined): string | null {
  const normalized = normalizeText(value)?.toLowerCase();
  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized;
  }
  return null;
}

function normalizeText(value: string | null | undefined): string | null {
  const formatted = formatNullable(value);
  return formatted === "n/a" ? null : formatted;
}

function sortLabel(sortMode: SortMode): string {
  const labels: Record<SortMode, string> = {
    "confidence-desc": "Sorted by highest confidence",
    "confidence-asc": "Sorted by lowest confidence",
    "risk-desc": "Sorted by highest risk",
    "agreement-desc": "Sorted by strongest agreement",
    date: "Sorted by date",
    tournament: "Sorted by tournament"
  };
  return labels[sortMode];
}
