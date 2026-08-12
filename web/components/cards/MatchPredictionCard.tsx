import Link from "next/link";
import type { MatchCard, SanityCheckerPrediction } from "@/lib/data/types";
import {
  formatDate,
  formatNullable,
  formatPercent,
  formatProductConfidenceBandShort,
  formatRiskLabel
} from "@/lib/formatters";
import { getPlayerProfilePath, getPredictionDetailPath } from "@/lib/routes";
import { Card, CardContent } from "@/components/ui/card";
import { SurfaceBadge } from "@/components/cards/SurfaceBadge";
import { Badge } from "@/components/ui/badge";

type PlayerSummary = {
  playerId: string;
  name: string;
  probability: string;
};

type PredictionContext = Pick<
  SanityCheckerPrediction,
  | "confidence_band"
  | "product_confidence_band"
  | "explanation_risk_level"
  | "model_agreement_score"
  | "visible_signal_agreement_score"
  | "visible_signal_conflict_reasons"
  | "recommended_explanation_copy"
>;

export function MatchPredictionCard({ match, sanityCheck }: { match: MatchCard; sanityCheck?: SanityCheckerPrediction }) {
  const p1Wins = Number(match.player_1_win_probability) >= Number(match.player_2_win_probability);
  const favorite: PlayerSummary = p1Wins
    ? {
        playerId: match.player_1_id,
        name: match.player_1_name,
        probability: match.player_1_win_probability
      }
    : {
        playerId: match.player_2_id,
        name: match.player_2_name,
        probability: match.player_2_win_probability
      };
  const underdog: PlayerSummary = p1Wins
    ? {
        playerId: match.player_2_id,
        name: match.player_2_name,
        probability: match.player_2_win_probability
      }
    : {
        playerId: match.player_1_id,
        name: match.player_1_name,
        probability: match.player_1_win_probability
      };
  const detailPath = getPredictionDetailPath(match.match_id);
  const context = getPredictionContext(match, sanityCheck);
  const highConfidenceHighRisk = isHighConfidenceHighRisk(context);
  const highRisk = normalizeRisk(context.explanation_risk_level) === "high";

  return (
    <Card
      className={`group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift ${
        highRisk ? "hover:border-amber-300/80" : "hover:border-lime-300/80"
      }`}
    >
      <CardContent className="space-y-3.5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {formatNullable(match.tournament_name)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SurfaceBadge surface={match.surface} />
              <span className="rounded-full border border-slate-950/[0.06] bg-white/55 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {formatNullable(match.round)}
              </span>
            </div>
          </div>
          <span className="rounded-md border border-slate-950/[0.06] bg-white/65 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {formatDate(match.match_date)}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Favorite</p>
              <PlayerNameLink
                playerId={favorite.playerId}
                name={favorite.name}
                className="mt-1 block truncate text-base font-semibold tracking-tight text-slate-950 transition hover:text-court-grass"
              />
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-semibold tracking-tight text-slate-950">{formatPercent(favorite.probability)}</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">win prob.</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-950/[0.05] bg-slate-50/55 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Rival</p>
              <PlayerNameLink
                playerId={underdog.playerId}
                name={underdog.name}
                className="mt-0.5 block truncate text-sm font-semibold text-slate-700 transition hover:text-court-grass"
              />
            </div>
            <p className="shrink-0 text-right text-base font-semibold tabular-nums text-slate-700">{formatPercent(underdog.probability)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-950/[0.06] pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <AgreementBadge context={context} highConfidenceHighRisk={highConfidenceHighRisk} />
            <RiskBadge context={context} />
          </div>
          <Link
            href={detailPath}
            className="inline-flex min-h-11 items-center rounded-md xl:min-h-9 bg-slate-950 px-3 py-2 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(15,23,42,0.12)] transition-[background-color,box-shadow,transform] duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_12px_28px_rgba(15,23,42,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70"
          >
            View details
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function AgreementBadge({
  context,
  highConfidenceHighRisk
}: {
  context: PredictionContext;
  highConfidenceHighRisk: boolean;
}) {
  const label = formatProductConfidenceBandShort(context.product_confidence_band);
  if (!label) {
    return <Badge tone="neutral">Checks unavailable</Badge>;
  }

  return (
    <Badge tone={highConfidenceHighRisk ? "neutral" : confidenceTone(context.product_confidence_band)} title={formatNullable(context.product_confidence_band)}>
      {label}
    </Badge>
  );
}

function RiskBadge({ context }: { context: PredictionContext }) {
  const label = formatRiskLabel(context.explanation_risk_level);
  if (!label) {
    return null;
  }
  return <Badge tone={riskTone(context.explanation_risk_level)}>{label}</Badge>;
}

function PlayerNameLink({
  playerId,
  name,
  align = "left",
  className
}: {
  playerId: string;
  name: string;
  align?: "left" | "right";
  className?: string;
}) {
  const label = formatNullable(name);
  const hasPlayerId = formatNullable(playerId) !== "n/a";
  const baseClassName =
    className ??
    `block text-sm font-semibold text-slate-950 transition hover:text-court-grass ${align === "right" ? "text-right" : ""}`;

  if (!hasPlayerId) {
    return <span className={baseClassName}>{label}</span>;
  }

  return (
    <Link href={getPlayerProfilePath(playerId)} className={`${baseClassName} max-xl:flex max-xl:min-h-11 max-xl:w-full max-xl:items-center`}>
      {label}
    </Link>
  );
}

function riskTone(riskLevel: string | null | undefined): "neutral" | "success" | "warning" | "info" {
  const normalized = normalizeRisk(riskLevel);
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

function confidenceTone(confidenceBand: string | null | undefined): "neutral" | "success" | "warning" | "info" {
  const normalized = formatNullable(confidenceBand).toLowerCase();
  if (normalized.includes("strong model agreement")) {
    return "success";
  }
  if (normalized.includes("high uncertainty") || normalized.includes("low visible")) {
    return "warning";
  }
  if (normalized.includes("moderate") || normalized.includes("model-driven")) {
    return "info";
  }
  return "neutral";
}

function isHighConfidenceHighRisk(context: PredictionContext): boolean {
  const confidenceBand = formatNullable(context.confidence_band).toLowerCase();
  const riskLevel = normalizeRisk(context.explanation_risk_level);
  return confidenceBand === "high model confidence" && riskLevel === "high";
}

function getPredictionContext(match: MatchCard, sanityCheck?: SanityCheckerPrediction): PredictionContext {
  return {
    confidence_band: sanityCheck?.confidence_band ?? match.confidence_band,
    product_confidence_band: sanityCheck?.product_confidence_band ?? match.product_confidence_band,
    explanation_risk_level: sanityCheck?.explanation_risk_level ?? match.explanation_risk_level,
    model_agreement_score: sanityCheck?.model_agreement_score ?? match.model_agreement_score,
    visible_signal_agreement_score: sanityCheck?.visible_signal_agreement_score ?? match.visible_signal_agreement_score,
    visible_signal_conflict_reasons: sanityCheck?.visible_signal_conflict_reasons ?? match.visible_signal_conflict_reasons,
    recommended_explanation_copy: sanityCheck?.recommended_explanation_copy ?? match.recommended_explanation_copy
  };
}

function normalizeRisk(riskLevel: string | null | undefined): "high" | "medium" | "low" | null {
  const normalized = formatNullable(riskLevel).toLowerCase();
  if (normalized === "high" || normalized === "medium" || normalized === "low") {
    return normalized;
  }
  return null;
}
