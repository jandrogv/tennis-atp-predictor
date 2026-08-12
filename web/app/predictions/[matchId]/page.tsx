import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { SurfaceBadge } from "@/components/cards/SurfaceBadge";
import { ProbabilityBar } from "@/components/cards/ProbabilityBar";
import { PlayerComparisonCard } from "@/components/predictions/PlayerComparisonCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMatchDetails, getPlayerRankings, getSanityCheckerPredictionByMatchId } from "@/lib/data/loaders";
import type { MatchDetail, SanityCheckerPrediction } from "@/lib/data/types";
import { formatDate, formatNullable, formatPercent, toNumber } from "@/lib/formatters";
import { getPlayerProfilePath, getPredictionDetailPath, normalizePlayerId } from "@/lib/routes";
import { createPageMetadata, createUnavailableMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { matchId: string } }): Promise<Metadata> {
  const decodedMatchId = decodeURIComponent(params.matchId);
  const details = await getMatchDetails();
  const match = details.find((row) => row.match_id === decodedMatchId);
  if (!match?.player_1_name || !match.player_2_name) {
    return createUnavailableMetadata();
  }

  return createPageMetadata({
    title: `${match.player_1_name} vs ${match.player_2_name} — Match Prediction`,
    description: `View the ATP Insight pre-match prediction, player comparison, confidence and model context for ${match.player_1_name} vs ${match.player_2_name}.`,
    path: getPredictionDetailPath(decodedMatchId)
  });
}
export default async function PredictionDetailPage({ params }: { params: { matchId: string } }) {
  const { matchId } = params;
  const decodedMatchId = decodeURIComponent(matchId);
  const [details, sanityCheck, playerRankings] = await Promise.all([
    getMatchDetails(),
    getSanityCheckerPredictionByMatchId(decodedMatchId),
    getPlayerRankings()
  ]);
  const match = details.find((row) => row.match_id === decodedMatchId);

  if (!match) {
    notFound();
  }

  const favoriteExplanation = buildFavoriteExplanation(match);
  const localExplanation = buildLocalModelExplanation(match);
  const rankingByPlayerId = new Map(playerRankings.map((ranking) => [normalizePlayerId(ranking.player_id), ranking]));
  const playerOneRanking = rankingByPlayerId.get(normalizePlayerId(match.player_1_id));
  const playerTwoRanking = rankingByPlayerId.get(normalizePlayerId(match.player_2_id));

  return (
    <div className="space-y-6">
      <Link href="/predictions" className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-600 transition xl:min-h-0 hover:text-court-grass">
        Back to predictions
      </Link>

      <PageHeader
        title={`${formatNullable(match.player_1_name)} vs ${formatNullable(match.player_2_name)}`}
      />

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{formatNullable(match.tournament_name)}</Badge>
              <SurfaceBadge surface={match.surface} />
              <Badge>{formatNullable(match.round)}</Badge>
              <span className="text-sm font-medium text-slate-500">{formatDate(match.match_date)}</span>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <PlayerPanel playerId={match.player_1_id} name={match.player_1_name} probability={match.player_1_win_probability} />
              <div className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">vs</div>
              <PlayerPanel playerId={match.player_2_id} name={match.player_2_name} probability={match.player_2_win_probability} align="right" />
            </div>

            <ProbabilityBar
              playerOneProbability={match.player_1_win_probability}
              playerTwoProbability={match.player_2_win_probability}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model favorite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-950">{formatNullable(match.favorite_player_name)}</p>
              <p className="mt-1 text-sm text-slate-500">Confidence {formatPercent(match.confidence)}</p>
            </div>
            <p className="atp-inset p-3 text-sm leading-6 text-slate-600">
              {favoriteExplanation}
            </p>
          </CardContent>
        </Card>
      </section>

      <PlayerComparisonCard
        match={match}
        playerOneRanking={playerOneRanking}
        playerTwoRanking={playerTwoRanking}
      />

      <Card>
        <CardHeader>
          <CardTitle>Model explanation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <PredictionInterpretationCard match={match} sanityCheck={sanityCheck} />

          <div className="rounded-xl border border-lime-300/35 bg-lime-50/45 p-4 shadow-sm shadow-lime-200/20">
            <p className="text-base font-semibold tracking-tight text-slate-950">{localExplanation.summary}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {localExplanation.context}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Main signals</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                {localExplanation.mainSignals.map((signal) => (
                  <li key={signal} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-500/80" />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-950">Visible disagreement</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{localExplanation.disagreement}</p>
            </div>
          </div>

          <p className="border-t border-slate-950/[0.05] pt-4 text-xs leading-5 text-slate-500">
            Probabilities are calibrated estimates, not certainties. This explanation is based on the visible match features
            and the model output; the model can also use engineered features beyond the comparison table.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}

function PredictionInterpretationCard({ match, sanityCheck }: { match: MatchDetail; sanityCheck?: SanityCheckerPrediction }) {
  const context = getPredictionContext(match, sanityCheck);
  const productBand = cleanText(context.product_confidence_band);
  const confidenceBand = cleanText(context.confidence_band);
  const riskLevel = cleanText(context.explanation_risk_level);
  const copy = cleanText(context.recommended_explanation_copy) ?? fallbackExplanationCopy(productBand);
  const auxiliaryChecks = agreementLabel(toNumber(context.model_agreement_score), {
    strong: "aligned",
    moderate: "mixed",
    low: "conflicting"
  });
  const visibleSignals = agreementLabel(toNumber(context.visible_signal_agreement_score), {
    strong: "aligned",
    moderate: "mixed",
    low: "low agreement"
  });
  const conflictReasons = cleanText(context.visible_signal_conflict_reasons);

  return (
    <div className={interpretationClassName(riskLevel)}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto text-sm font-semibold text-slate-950">Prediction interpretation</p>
        <Badge tone={riskTone(riskLevel)}>{productBand ?? "Diagnostics unavailable"}</Badge>
        <Badge tone={riskTone(riskLevel)}>Risk: {riskLevel ?? "n/a"}</Badge>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Model confidence</dt>
          <dd className="mt-1 font-semibold text-slate-900">{confidenceBand ?? "n/a"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Auxiliary checks</dt>
          <dd className="mt-1 font-semibold text-slate-900">{auxiliaryChecks}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Visible signals</dt>
          <dd className="mt-1 font-semibold text-slate-900">{visibleSignals}</dd>
        </div>
      </dl>

      <p className="text-sm leading-6 text-slate-600">{copy}</p>
      {conflictReasons ? (
        <p className="border-t border-slate-950/[0.05] pt-3 text-xs leading-5 text-slate-500">
          Visible signal notes: {conflictReasons}
        </p>
      ) : null}
    </div>
  );
}

function getPredictionContext(match: MatchDetail, sanityCheck?: SanityCheckerPrediction): SanityCheckerPrediction {
  return {
    match_id: match.match_id,
    confidence_band: sanityCheck?.confidence_band ?? match.confidence_band,
    product_confidence_band: sanityCheck?.product_confidence_band ?? match.product_confidence_band,
    explanation_risk_level: sanityCheck?.explanation_risk_level ?? match.explanation_risk_level,
    recommended_explanation_copy: sanityCheck?.recommended_explanation_copy ?? match.recommended_explanation_copy,
    model_agreement_score: sanityCheck?.model_agreement_score ?? match.model_agreement_score,
    visible_signal_agreement_score: sanityCheck?.visible_signal_agreement_score ?? match.visible_signal_agreement_score,
    visible_signal_conflict_reasons: sanityCheck?.visible_signal_conflict_reasons ?? match.visible_signal_conflict_reasons
  };
}

function PlayerPanel({
  playerId,
  name,
  probability,
  align = "left"
}: {
  playerId: string;
  name: string;
  probability: string;
  align?: "left" | "right";
}) {
  const content = (
    <>
      <p className="text-xl font-semibold tracking-tight text-slate-950">{formatNullable(name)}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{formatPercent(probability)}</p>
    </>
  );

  return (
    <div className={align === "right" ? "text-right" : ""}>
      {formatNullable(playerId) !== "n/a" ? (
        <Link href={getPlayerProfilePath(playerId)} className="block atp-inset p-4 transition hover:border-lime-300 hover:bg-white/75 hover:shadow-card">
          {content}
        </Link>
      ) : (
        <div className="atp-inset p-4">{content}</div>
      )}
    </div>
  );
}

function buildFavoriteExplanation(match: MatchDetail): string {
  const favorite = formatNullable(match.favorite_player_name);
  const reason = match.favorite_reason_group;
  const reasonText: Record<string, string> = {
    overall_elo: "a stronger pre-match Elo profile",
    surface_elo: "a stronger surface-adjusted Elo profile",
    atp_points: "a stronger ATP points profile",
    atp_rank: "a better ATP ranking position",
    head_to_head: "a stronger head-to-head signal",
    surface_head_to_head: "a stronger surface head-to-head signal",
    model_probability: "the combined probability estimated from the available pre-match signals"
  };
  return `The model favors ${favorite} mainly because of ${reasonText[reason] ?? reasonText.model_probability}. This explanation uses only the pre-match features available in the prediction file.`;
}

function cleanText(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = String(value).trim();
  if (trimmed === "" || trimmed.toLowerCase() === "nan") {
    return null;
  }
  return trimmed;
}

function fallbackExplanationCopy(productBand: string | null): string {
  const copyByBand: Record<string, string> = {
    "Strong model agreement":
      "The official model favors this player, and the visible pre-match signals generally support that prediction.",
    "Moderate model agreement":
      "The official model favors this player, with mixed supporting signals. Treat this as a probabilistic edge rather than a certainty.",
    "Model-driven pick":
      "The official model strongly favors this player, but visible pre-match signals are mixed. Treat this as a model-driven prediction rather than a simple ranking or Elo edge.",
    "Low visible-signal agreement":
      "The official model favors this player, but several visible indicators point the other way. This prediction may require more cautious interpretation.",
    "High uncertainty despite high model confidence":
      "The model confidence is high, but auxiliary checks do not fully agree. Consider this a high-confidence model-driven pick with limited visible-signal support."
  };
  return productBand ? copyByBand[productBand] ?? genericPredictionCopy : genericPredictionCopy;
}

const genericPredictionCopy =
  "This prediction is a calibrated model estimate. Treat it as a probabilistic edge, not a certainty.";

function agreementLabel(
  value: number | null,
  labels: { strong: string; moderate: string; low: string }
): string {
  if (value === null) {
    return "n/a";
  }
  if (value >= 0.67) {
    return labels.strong;
  }
  if (value >= 0.4) {
    return labels.moderate;
  }
  return labels.low;
}

function riskTone(riskLevel: string | null): "neutral" | "success" | "warning" | "info" {
  const normalized = riskLevel?.toLowerCase();
  if (normalized === "high") {
    return "warning";
  }
  if (normalized === "low") {
    return "success";
  }
  if (normalized === "medium") {
    return "info";
  }
  return "neutral";
}

function interpretationClassName(riskLevel: string | null): string {
  const base = "space-y-4 rounded-xl border p-4 shadow-sm shadow-slate-950/[0.02]";
  const normalized = riskLevel?.toLowerCase();
  if (normalized === "high") {
    return `${base} border-amber-400/25 bg-amber-50/45`;
  }
  if (normalized === "low") {
    return `${base} border-emerald-400/20 bg-emerald-50/35`;
  }
  if (normalized === "medium") {
    return `${base} border-blue-400/18 bg-blue-50/30`;
  }
  return `${base} border-slate-950/[0.06] bg-white/45`;
}

type PlayerSide = "player_1" | "player_2";
type SignalDirection = PlayerSide | "neutral" | "unknown";

type VisibleSignal = {
  key:
    | "ELO_PRE_DIFF"
    | "ELO_SURFACE_PRE_DIFF"
    | "ATP_RANK_DIFF"
    | "ATP_POINT_DIFF"
    | "H2H_DIFF"
    | "H2H_SURFACE_DIFF";
  label: string;
  lowerIsBetter?: boolean;
};

const visibleSignals: VisibleSignal[] = [
  { key: "ELO_PRE_DIFF", label: "overall Elo" },
  { key: "ELO_SURFACE_PRE_DIFF", label: "surface-adjusted Elo" },
  { key: "ATP_RANK_DIFF", label: "ATP ranking", lowerIsBetter: true },
  { key: "ATP_POINT_DIFF", label: "ATP points" },
  { key: "H2H_DIFF", label: "head-to-head record" },
  { key: "H2H_SURFACE_DIFF", label: "surface head-to-head record" }
];

function buildLocalModelExplanation(match: MatchDetail): {
  summary: string;
  context: string;
  mainSignals: string[];
  disagreement: string;
} {
  const favoriteSide = getFavoriteSide(match);
  const favorite = formatNullable(match.favorite_player_name || match.predicted_winner_name);
  const underdog = favoriteSide === "player_1" ? formatNullable(match.player_2_name) : formatNullable(match.player_1_name);
  const confidence = getConfidence(match);
  const confidenceLabel = getConfidenceLabel(confidence);
  const visibleSupport = favoriteSide
    ? visibleSignals.filter((signal) => signalDirection(match, signal) === favoriteSide)
    : [];
  const visibleDisagreements = favoriteSide
    ? visibleSignals.filter((signal) => oppositeSide(signalDirection(match, signal), favoriteSide))
    : [];

  const summary =
    confidence !== null && confidence < 0.7
      ? `The model gives ${favorite} a narrow edge.`
      : `The model favors ${favorite} with ${confidenceLabel}.`;

  const reasonSignal = getReasonSignal(match.favorite_reason_group);
  const mainSignals = [
    reasonSignal,
    visibleSupport.length > 0
      ? `Visible indicators supporting ${favorite}: ${formatList(visibleSupport.map((signal) => signal.label))}.`
      : `The visible comparison does not show one simple dominant metric for ${favorite}.`,
    "The prediction is not based only on ATP ranking; it comes from the model's learned combination of available match features."
  ].filter(Boolean);

  const disagreement =
    visibleDisagreements.length > 0
      ? `${formatList(capitalizeLabels(visibleDisagreements.map((signal) => signal.label)))} favor ${underdog}, so this is a model-driven pick rather than a simple visible-metric pick.`
      : `The visible indicators do not show a strong contradiction against ${favorite} in this matchup.`;

  return {
    summary,
    context:
      confidence !== null
        ? `${favorite}'s displayed confidence is ${formatPercent(confidence)}. Treat this as a probability estimate, not a guarantee.`
        : `The displayed confidence is not available for this match, so the explanation uses the model favorite and visible comparison fields.`,
    mainSignals,
    disagreement
  };
}

function getFavoriteSide(match: MatchDetail): PlayerSide {
  if (sameId(match.favorite_player_id, match.player_1_id) || sameName(match.favorite_player_name, match.player_1_name)) {
    return "player_1";
  }
  if (sameId(match.favorite_player_id, match.player_2_id) || sameName(match.favorite_player_name, match.player_2_name)) {
    return "player_2";
  }
  const playerOneProbability = toNumber(match.player_1_win_probability) ?? 0;
  const playerTwoProbability = toNumber(match.player_2_win_probability) ?? 0;
  return playerOneProbability >= playerTwoProbability ? "player_1" : "player_2";
}

function getConfidence(match: MatchDetail): number | null {
  const confidence = toNumber(match.confidence);
  if (confidence !== null) {
    return confidence;
  }
  const fallback = Math.max(toNumber(match.player_1_win_probability) ?? Number.NaN, toNumber(match.player_2_win_probability) ?? Number.NaN);
  return Number.isFinite(fallback) ? fallback : null;
}

function getConfidenceLabel(confidence: number | null): string {
  if (confidence === null || !Number.isFinite(confidence)) {
    return "the available model confidence";
  }
  if (confidence >= 0.9) {
    return "high confidence";
  }
  if (confidence >= 0.7) {
    return "moderate confidence";
  }
  return "a narrow edge";
}

function getReasonSignal(reason: string): string {
  const reasonText: Record<string, string> = {
    overall_elo: "The prediction file tags overall Elo as the clearest visible support signal.",
    surface_elo: "The prediction file tags surface-adjusted Elo as the clearest visible support signal.",
    atp_points: "The prediction file tags ATP points as the clearest visible support signal.",
    atp_rank: "The prediction file tags ATP ranking as the clearest visible support signal.",
    head_to_head: "The prediction file tags head-to-head record as the clearest visible support signal.",
    surface_head_to_head: "The prediction file tags surface head-to-head record as the clearest visible support signal.",
    model_probability: "No single visible metric dominates; the final calibrated probability comes from the learned feature combination."
  };
  return reasonText[reason] ?? reasonText.model_probability;
}

function signalDirection(match: MatchDetail, signal: VisibleSignal): SignalDirection {
  const value = toNumber(match[signal.key]);
  if (value === null) {
    return "unknown";
  }
  if (Math.abs(value) < 1e-9) {
    return "neutral";
  }
  if (signal.lowerIsBetter) {
    return value < 0 ? "player_1" : "player_2";
  }
  return value > 0 ? "player_1" : "player_2";
}

function oppositeSide(direction: SignalDirection, side: PlayerSide): boolean {
  return direction !== "unknown" && direction !== "neutral" && direction !== side;
}

function sameId(left: string, right: string): boolean {
  const normalizedLeft = formatNullable(left).toLowerCase();
  const normalizedRight = formatNullable(right).toLowerCase();
  return normalizedLeft !== "n/a" && normalizedLeft === normalizedRight;
}

function sameName(left: string, right: string): boolean {
  const normalizedLeft = formatNullable(left).toLowerCase();
  const normalizedRight = formatNullable(right).toLowerCase();
  return normalizedLeft !== "n/a" && normalizedLeft === normalizedRight;
}

function formatList(items: string[]): string {
  if (items.length === 0) {
    return "n/a";
  }
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function capitalizeLabels(items: string[]): string[] {
  return items.map((item) => item.charAt(0).toUpperCase() + item.slice(1));
}
