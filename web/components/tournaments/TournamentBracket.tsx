"use client";

import Link from "next/link";
import { type MouseEvent, type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { FilterMenu, type FilterOption } from "@/components/filters";
import { cn } from "@/components/ui/utils";
import type { TournamentMatch } from "@/lib/data/types";
import { formatNullable, toNumber } from "@/lib/formatters";
import { getPlayerProfilePath, getTournamentMatchDetailPath } from "@/lib/routes";

const CARD_WIDTH = 264;
const CARD_HEIGHT = 108;
const COLUMN_GAP = 76;
const LEAF_STEP = 128;
const HEADER_HEIGHT = 52;
const CANVAS_PADDING = 24;

type MeasuredConnection = { path: string; child: number; parent: number };

const STAGE_LABELS: Record<number, string> = {
  0: "Final",
  1: "Semi-Finals",
  2: "Quarter-Finals",
  3: "Round of 16",
  4: "Round of 32",
  5: "Round of 64",
  6: "Round of 128"
};

export function TournamentBracket({ matches }: { matches: TournamentMatch[] }) {
  const bracket = useMemo(() => buildBracketData(matches), [matches]);
  const [selectedDepth, setSelectedDepth] = useState(() => Math.min(bracket.maxDepth, 3));
  const [expanded, setExpanded] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  useEffect(() => {
    if (!expanded && !selectedPlayerId) return;
    const previousOverflow = document.body.style.overflow;
    if (expanded) document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selectedPlayerId) {
        setSelectedPlayerId(null);
      } else {
        setExpanded(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [expanded, selectedPlayerId]);

  if (bracket.matchesByNode.size === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-950/[0.10] bg-white/40 px-6 py-10 text-center">
        <p className="text-sm font-semibold text-slate-900">Draw positions are not available for this tournament.</p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          The results table remains available. A bracket is shown only when ATP draw identifiers can place matches reliably.
        </p>
      </div>
    );
  }

  const stages = bracket.stages;
  const selectedIndex = Math.max(0, stages.indexOf(selectedDepth));
  const previousStage = stages[selectedIndex - 1];
  const nextStage = stages[selectedIndex + 1];
  const visibleDepths = expanded ? stages : compactStageWindow(stages, selectedIndex);
  const earliestVisibleDepth = Math.max(...visibleDepths);
  const canvasWidth = visibleDepths.length * CARD_WIDTH + Math.max(0, visibleDepths.length - 1) * COLUMN_GAP + CANVAS_PADDING * 2;
  const canvasHeight = HEADER_HEIGHT + 2 ** earliestVisibleDepth * LEAF_STEP + CANVAS_PADDING;
  const expandedGutter = expanded ? 96 : 0;
  const stageOptions: Array<FilterOption<string>> = stages.map((depth) => ({ value: String(depth), label: stageLabel(depth) }));

  const content = (
    <div
      className={cn(
        "relative border border-slate-950/[0.07] bg-[#f8faf4] shadow-[0_18px_54px_rgba(15,23,42,0.08)]",
        expanded ? "fixed inset-x-0 bottom-0 top-16 z-[220] flex flex-col rounded-none" : "rounded-2xl"
      )}
      role={expanded ? "dialog" : undefined}
      aria-modal={expanded || undefined}
      aria-label={expanded ? "Expanded tournament draw" : undefined}
    >
      <div className="relative z-20 rounded-t-[inherit] border-b border-slate-950/[0.07] bg-white/72 backdrop-blur">
        <div
          className={cn(
            "flex flex-col gap-4 py-4 sm:flex-row sm:items-end sm:justify-between",
            expanded ? "mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-12" : "px-4 sm:px-5"
          )}
        >
          <div>
            <p className="text-sm font-semibold text-slate-950">Tournament draw</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Follow completed matches and the paths that feed each later round.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <FilterMenu
              label="Stage"
              value={String(selectedDepth)}
              options={stageOptions}
              onChange={(value) => setSelectedDepth(Number(value))}
              className="w-[12.5rem]"
              ariaLabel="Select tournament stage"
            />
            <BracketIconButton
              label="Previous stage"
              disabled={previousStage === undefined}
              onClick={() => previousStage !== undefined && setSelectedDepth(previousStage)}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </BracketIconButton>
            <BracketIconButton
              label="Next stage"
              disabled={nextStage === undefined}
              onClick={() => nextStage !== undefined && setSelectedDepth(nextStage)}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </BracketIconButton>
            <BracketIconButton label={expanded ? "Close expanded draw" : "Expand draw"} onClick={() => setExpanded((current) => !current)}>
              {expanded ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
            </BracketIconButton>
          </div>
        </div>
      </div>

      <div className={cn("relative z-0 min-h-0 overflow-auto rounded-b-[inherit]", expanded ? "flex-1" : "max-h-[44rem]")}>
        <div
          className="hidden min-w-full items-start justify-center md:flex"
          style={{ width: `max(100%, ${canvasWidth + expandedGutter}px)`, height: canvasHeight }}
        >
          <BracketCanvas
            bracket={bracket}
            visibleDepths={visibleDepths}
            selectedDepth={selectedDepth}
            baseDepth={earliestVisibleDepth}
            width={canvasWidth}
            height={canvasHeight}
            selectedPlayerId={selectedPlayerId}
            hoveredNode={hoveredNode}
            onSelectPlayer={setSelectedPlayerId}
            onHoverNode={setHoveredNode}
          />
        </div>
        <div className="space-y-3 p-4 md:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{stageLabel(selectedDepth)}</p>
          {nodesAtDepth(selectedDepth).map((node) => (
            <BracketMatchCard
              key={node}
              node={node}
              match={bracket.matchesByNode.get(node)}
              potentialPlayers={potentialPlayers(node, bracket.matchesByNode)}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={setSelectedPlayerId}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return content;
}

function BracketCanvas({
  bracket,
  visibleDepths,
  selectedDepth,
  baseDepth,
  width,
  height,
  selectedPlayerId,
  hoveredNode,
  onSelectPlayer,
  onHoverNode
}: {
  bracket: BracketData;
  visibleDepths: number[];
  selectedDepth: number;
  baseDepth: number;
  width: number;
  height: number;
  selectedPlayerId: string | null;
  hoveredNode: number | null;
  onSelectPlayer: (playerId: string | null) => void;
  onHoverNode: (node: number | null) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<number, HTMLDivElement>());
  const [connections, setConnections] = useState<MeasuredConnection[]>([]);
  const selectedNodes = selectedPlayerId ? nodesForPlayer(selectedPlayerId, bracket.matchesByNode) : new Set<number>();
  const visibleDepthKey = visibleDepths.join(",");

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const measuredDepths = visibleDepthKey.split(",").filter(Boolean).map(Number);

    let animationFrame = 0;
    const measureConnections = () => {
      const canvasRect = canvas.getBoundingClientRect();
      const measured: MeasuredConnection[] = [];

      for (const depth of measuredDepths) {
        if (depth === 0 || !measuredDepths.includes(depth - 1)) continue;
        for (const child of nodesAtDepth(depth)) {
          const parent = Math.floor(child / 2);
          const childCard = cardRefs.current.get(child);
          const parentCard = cardRefs.current.get(parent);
          if (!childCard || !parentCard) continue;

          const childRect = childCard.getBoundingClientRect();
          const parentRect = parentCard.getBoundingClientRect();
          const childX = childRect.right - canvasRect.left;
          const childY = childRect.top - canvasRect.top + childRect.height / 2;
          const parentX = parentRect.left - canvasRect.left;
          const parentY = parentRect.top - canvasRect.top + parentRect.height / 2;
          const middleX = childX + (parentX - childX) / 2;
          measured.push({
            child,
            parent,
            path: `M ${childX} ${childY} H ${middleX} V ${parentY} H ${parentX}`
          });
        }
      }

      setConnections((current) => sameConnections(current, measured) ? current : measured);
    };
    const scheduleMeasurement = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(measureConnections);
    };

    const resizeObserver = new ResizeObserver(scheduleMeasurement);
    resizeObserver.observe(canvas);
    for (const card of Array.from(cardRefs.current.values())) resizeObserver.observe(card);
    window.addEventListener("resize", scheduleMeasurement);
    scheduleMeasurement();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleMeasurement);
    };
  }, [bracket, visibleDepthKey, width, height]);

  return (
    <div ref={canvasRef} className="relative" style={{ width, height }} onClick={() => onSelectPlayer(null)}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        {connections.map(({ path, child, parent }, index) => {
          const selected = selectedNodes.has(child) && selectedNodes.has(parent);
          const hovered = hoveredNode === child || hoveredNode === parent;
          return (
            <path
              key={`${path}-${index}`}
              d={path}
              fill="none"
              stroke={selected ? "rgba(101,163,13,0.82)" : hovered ? "rgba(132,204,22,0.48)" : "rgba(15,23,42,0.16)"}
              strokeWidth={selected ? 2 : hovered ? 1.6 : 1.25}
              className="transition-[stroke,stroke-width] duration-150"
            />
          );
        })}
      </svg>

      {visibleDepths.map((depth, columnIndex) => (
        <div key={depth}>
          <div
            className={cn(
              "absolute top-4 flex h-7 items-center rounded-full border px-3 text-[11px] font-semibold",
              depth === selectedDepth
                ? "border-lime-300/80 bg-lime-100/75 text-lime-900"
                : "border-slate-950/[0.07] bg-white/80 text-slate-600"
            )}
            style={{ left: columnX(columnIndex) }}
          >
            {stageLabel(depth)}
          </div>
          {nodesAtDepth(depth).map((node) => (
            <div
              key={node}
              ref={(element) => {
                if (element) cardRefs.current.set(node, element);
                else cardRefs.current.delete(node);
              }}
              className="absolute"
              style={{ left: columnX(columnIndex), top: HEADER_HEIGHT + nodeCenter(node, baseDepth) - CARD_HEIGHT / 2 }}
            >
              <BracketMatchCard
                node={node}
                match={bracket.matchesByNode.get(node)}
                potentialPlayers={potentialPlayers(node, bracket.matchesByNode)}
                selectedPlayerId={selectedPlayerId}
                onSelectPlayer={onSelectPlayer}
                onHoverNode={onHoverNode}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function BracketMatchCard({
  node,
  match,
  potentialPlayers,
  selectedPlayerId,
  onSelectPlayer,
  onHoverNode
}: {
  node: number;
  match?: TournamentMatch;
  potentialPlayers: string[];
  selectedPlayerId: string | null;
  onSelectPlayer: (playerId: string | null) => void;
  onHoverNode?: (node: number | null) => void;
}) {
  const players = match
    ? [
        { id: match.player_1_id, name: match.player_1_name, winner: match.player_1_id === match.winner_id },
        { id: match.player_2_id, name: match.player_2_name, winner: match.player_2_id === match.winner_id }
      ]
    : [
        { id: "", name: potentialPlayers[0] ?? "TBD", winner: false },
        { id: "", name: potentialPlayers[1] ?? "TBD", winner: false }
      ];
  const parsedScore = match ? parseMatchScore(match.score) : null;
  const matchContainsSelectedPlayer = players.some((player) => samePlayerId(player.id, selectedPlayerId));
  const dimmed = selectedPlayerId !== null && !matchContainsSelectedPlayer;

  const stopClearingSelection = (event: MouseEvent<HTMLElement>) => event.stopPropagation();

  return (
    <div
      className={cn("h-[108px] w-[264px] transition-opacity duration-150", dimmed && "opacity-60")}
      onClick={stopClearingSelection}
      onMouseEnter={() => onHoverNode?.(node)}
      onMouseLeave={() => onHoverNode?.(null)}
    >
      <article
        className={cn(
          "group grid h-full grid-rows-[1fr_1fr_1.75rem] overflow-hidden rounded-xl border bg-white/92 shadow-[0_6px_20px_rgba(15,23,42,0.07)] transition-[border-color,box-shadow,background-color] duration-150",
          match ? "border-slate-950/[0.09]" : "border-dashed border-slate-950/[0.10] bg-white/55",
          "hover:border-lime-300/80 hover:bg-white hover:shadow-[0_10px_28px_rgba(15,23,42,0.11)]",
          matchContainsSelectedPlayer && "border-lime-400/80 bg-lime-50/45 shadow-[0_10px_30px_rgba(101,163,13,0.12)]"
        )}
        aria-label={`${stageLabel(Math.floor(Math.log2(node)))} match`}
      >
        {players.map((player, index) => (
          <div
            key={`${player.name}-${index}`}
            className={cn(
              "flex min-w-0 items-center gap-2 border-slate-950/[0.06] px-3 first:border-b",
              samePlayerId(player.id, selectedPlayerId) && "bg-lime-100/55"
            )}
          >
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", player.winner ? "bg-lime-500" : "bg-slate-300")} aria-hidden="true" />
            <BracketPlayerControl
              playerId={player.id}
              name={player.name}
              winner={player.winner}
              selected={samePlayerId(player.id, selectedPlayerId)}
              onSelectPlayer={onSelectPlayer}
            />
            <SetScores parsedScore={parsedScore} playerIndex={index} originalScore={match?.score} />
          </div>
        ))}
        <div className="flex items-center justify-end border-t border-slate-950/[0.06] bg-slate-50/70 px-3">
          {match && isTruthy(match.has_match_statistics) && hasValue(match.match_id) ? (
            <Link
              href={getTournamentMatchDetailPath(match.tournament_slug, match.match_id)}
              onClick={stopClearingSelection}
              className="inline-flex items-center gap-1 rounded text-[10px] font-semibold text-slate-600 transition hover:text-lime-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/35"
            >
              View details
              <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </article>
    </div>
  );
}

function BracketPlayerControl({
  playerId,
  name,
  winner,
  selected,
  onSelectPlayer
}: {
  playerId: string;
  name: string;
  winner: boolean;
  selected: boolean;
  onSelectPlayer: (playerId: string | null) => void;
}) {
  const classes = cn("min-w-0 flex-1 truncate text-left text-xs", winner ? "font-semibold text-slate-950" : "font-medium text-slate-600");
  if (!hasValue(playerId)) return <span className={classes}>{formatNullable(name)}</span>;
  return (
    <div className="flex h-full min-w-0 flex-1 items-center gap-1">
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`${selected ? "Clear" : "Highlight"} ${formatNullable(name)} path`}
        onClick={() => onSelectPlayer(selected ? null : playerId)}
        className={cn(
          classes,
          "h-full cursor-pointer rounded px-0.5 py-1 transition-colors hover:bg-lime-100/70 hover:text-lime-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/40"
        )}
      >
        {formatNullable(name)}
      </button>
      <Link
        href={getPlayerProfilePath(playerId)}
        aria-label={`Open ${formatNullable(name)} player profile`}
        title="Open player profile"
        className="inline-flex shrink-0 items-center justify-center rounded p-0.5 text-slate-400 opacity-0 max-xl:h-10 max-xl:w-10 max-xl:opacity-100 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/35 group-hover:opacity-100"
      >
        <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
}

function SetScores({
  parsedScore,
  playerIndex,
  originalScore
}: {
  parsedScore: ParsedMatchScore | null;
  playerIndex: number;
  originalScore?: string;
}) {
  if (!parsedScore) {
    if (playerIndex === 0 || !hasValue(originalScore)) return null;
    return (
      <span className="max-w-[6.5rem] shrink-0 truncate text-right font-mono text-[10px] tabular-nums text-slate-500" title={originalScore}>
        {originalScore}
      </span>
    );
  }

  return (
    <span
      className="grid shrink-0 gap-0.5 font-mono text-xs font-semibold tabular-nums text-slate-800"
      style={{ gridTemplateColumns: `repeat(${parsedScore.length}, 1.15rem)` }}
      aria-label={`Set scores: ${parsedScore.map((set) => playerIndex === 0 ? set.player1 : set.player2).join(", ")}`}
    >
      {parsedScore.map((set, index) => {
        const score = playerIndex === 0 ? set.player1 : set.player2;
        const tieBreak = playerIndex === 0 ? set.player1TieBreak : set.player2TieBreak;
        return (
          <span key={index} className="relative text-center">
            {score}
            {tieBreak ? <sup className="absolute -right-0.5 -top-1 text-[7px] font-medium text-slate-500">{tieBreak}</sup> : null}
          </span>
        );
      })}
    </span>
  );
}

function BracketIconButton({
  label,
  disabled = false,
  onClick,
  children
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-950/[0.08] bg-white/75 text-slate-700 shadow-sm transition hover:border-lime-300/80 hover:bg-lime-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/35 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

type ParsedSetScore = {
  player1: string;
  player2: string;
  player1TieBreak?: string;
  player2TieBreak?: string;
};

type ParsedMatchScore = ParsedSetScore[];

function parseMatchScore(score: string): ParsedMatchScore | null {
  if (!hasValue(score)) return null;
  const tokens = score.trim().split(/\s+/);
  if (tokens.length === 0 || tokens.length > 5) return null;

  const sets: ParsedMatchScore = [];
  for (const token of tokens) {
    const match = token.match(/^(\d+)-(\d+)(?:\((\d+)\))?$/);
    if (!match) return null;
    const [, player1, player2, tieBreak] = match;
    const set: ParsedSetScore = { player1, player2 };
    if (tieBreak) {
      if (player1 === "7" && player2 === "6") set.player2TieBreak = tieBreak;
      else if (player1 === "6" && player2 === "7") set.player1TieBreak = tieBreak;
      else return null;
    }
    sets.push(set);
  }
  return sets;
}

type BracketData = {
  matchesByNode: Map<number, TournamentMatch>;
  maxDepth: number;
  stages: number[];
};

function buildBracketData(matches: TournamentMatch[]): BracketData {
  const matchesByNode = new Map<number, TournamentMatch>();
  for (const match of matches) {
    const node = toNumber(match.draw_match_number);
    if (node === null || node < 1 || !/^MS\d+$/i.test(match.id_num ?? "")) continue;
    if (!matchesByNode.has(node)) matchesByNode.set(node, match);
  }
  const maxNode = Math.max(1, ...Array.from(matchesByNode.keys()));
  const maxDepth = Math.min(6, Math.floor(Math.log2(maxNode)));
  const stages = Array.from({ length: maxDepth + 1 }, (_, index) => maxDepth - index);
  return { matchesByNode, maxDepth, stages };
}

function compactStageWindow(stages: number[], selectedIndex: number): number[] {
  if (stages.length <= 3) return stages;
  const start = Math.max(0, Math.min(selectedIndex - 1, stages.length - 3));
  return stages.slice(start, start + 3);
}

function potentialPlayers(node: number, matchesByNode: Map<number, TournamentMatch>): string[] {
  if (node <= 0) return [];
  return [matchesByNode.get(node * 2)?.winner_name, matchesByNode.get(node * 2 + 1)?.winner_name].filter(
    (name): name is string => hasValue(name)
  );
}

function nodesForPlayer(playerId: string, matchesByNode: Map<number, TournamentMatch>): Set<number> {
  const nodes = new Set<number>();
  for (const [node, match] of Array.from(matchesByNode.entries())) {
    if (samePlayerId(match.player_1_id, playerId) || samePlayerId(match.player_2_id, playerId)) nodes.add(node);
  }
  return nodes;
}

function nodesAtDepth(depth: number): number[] {
  const start = 2 ** depth;
  return Array.from({ length: start }, (_, index) => start + index);
}

function nodeCenter(node: number, baseDepth: number): number {
  const depth = Math.floor(Math.log2(node));
  const index = node - 2 ** depth;
  const span = 2 ** Math.max(0, baseDepth - depth);
  return (index * span + span / 2) * LEAF_STEP;
}

function columnX(columnIndex: number): number {
  return CANVAS_PADDING + columnIndex * (CARD_WIDTH + COLUMN_GAP);
}

function stageLabel(depth: number): string {
  return STAGE_LABELS[depth] ?? `Round ${depth}`;
}

function sameConnections(current: MeasuredConnection[], next: MeasuredConnection[]): boolean {
  return current.length === next.length && current.every((connection, index) => (
    connection.child === next[index]?.child
    && connection.parent === next[index]?.parent
    && connection.path === next[index]?.path
  ));
}

function hasValue(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== "" && !["nan", "n/a", "none"].includes(value.trim().toLowerCase());
}

function isTruthy(value: string | undefined): boolean {
  return ["true", "1", "yes"].includes(String(value ?? "").trim().toLowerCase());
}
function samePlayerId(value: string | undefined, selectedPlayerId: string | null): boolean {
  if (!selectedPlayerId || !hasValue(value)) return false;
  return value.trim().replace(/\.0$/, "") === selectedPlayerId.trim().replace(/\.0$/, "");
}
