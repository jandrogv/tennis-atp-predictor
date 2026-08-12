import type { PlayerRecentMatch } from "../data/types.ts";

export function selectRecentForm(matches: PlayerRecentMatch[], limit = 5): PlayerRecentMatch[] {
  return matches
    .filter((match) => {
      const result = match.result.trim().toUpperCase();
      return result === "W" || result === "L";
    })
    .sort((a, b) => dateValue(b.match_date) - dateValue(a.match_date))
    .slice(0, limit);
}

function dateValue(value: string): number {
  const normalized = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return Number.MIN_SAFE_INTEGER;
  const timestamp = Date.parse(`${normalized}T00:00:00Z`);
  return Number.isFinite(timestamp) ? timestamp : Number.MIN_SAFE_INTEGER;
}
