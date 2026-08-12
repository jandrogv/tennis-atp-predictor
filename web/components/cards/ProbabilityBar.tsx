import { formatPercent, toNumber } from "@/lib/formatters";

export function ProbabilityBar({
  playerOneProbability,
  playerTwoProbability
}: {
  playerOneProbability: string;
  playerTwoProbability: string;
}) {
  const p1 = Math.max(0, Math.min(100, (toNumber(playerOneProbability) ?? 0) * 100));
  const p2 = Math.max(0, Math.min(100, (toNumber(playerTwoProbability) ?? 0) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
        <span>{formatPercent(playerOneProbability)}</span>
        <span>{formatPercent(playerTwoProbability)}</span>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/70">
        <div className="bg-gradient-to-r from-emerald-500 to-lime-500" style={{ width: `${p1}%` }} />
        <div className="bg-slate-300" style={{ width: `${p2}%` }} />
      </div>
    </div>
  );
}
