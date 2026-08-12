export const routes = [
  { href: "/predictions", label: "Predictions" },
  { href: "/compare", label: "Compare" },
  { href: "/players", label: "Players" },
  { href: "/rankings/elo", label: "Elo Rankings" },
  { href: "/rankings/atp", label: "ATP Rankings" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/model", label: "Model Performance" },
  { href: "/feature-importance", label: "Feature Importance" }
];

export function normalizePlayerId(playerId: string | number): string {
  return String(playerId).trim().replace(/\.0$/, "");
}

export function getPlayerProfilePath(playerId: string | number): string {
  return `/players/${encodeURIComponent(normalizePlayerId(playerId))}`;
}

export function getPredictionDetailPath(matchId: string | number): string {
  return `/predictions/${encodeURIComponent(String(matchId).trim())}`;
}

export function getTournamentDetailPath(tournamentId: string | number): string {
  return `/tournaments/${encodeURIComponent(String(tournamentId).trim())}`;
}

export function getTournamentMatchDetailPath(tournamentId: string | number, matchId: string | number): string {
  return `/tournaments/${encodeURIComponent(String(tournamentId).trim())}/matches/${encodeURIComponent(String(matchId).trim())}`;
}
