"use client";

import { useEffect, useState } from "react";
import { TournamentDetailView } from "@/components/tournaments/TournamentDetailView";
import { parseCsv } from "@/lib/data/csv-parser";
import type { TournamentDetail, TournamentMatch } from "@/lib/data/types";

export function TournamentDetailLoader({ tournament }: { tournament: TournamentDetail }) {
  const [matches, setMatches] = useState<TournamentMatch[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const partition = encodeURIComponent(tournament.tournament_slug);

    fetch(`/data/tournaments/${partition}.csv`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Tournament data returned ${response.status}`);
        return response.text();
      })
      .then((text) => setMatches(parseCsv(text) as TournamentMatch[]))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMatches([]);
        setLoadError("Tournament results could not be loaded. Return to the tournament list and try again.");
      });

    return () => controller.abort();
  }, [tournament.tournament_slug]);

  return <TournamentDetailView tournament={tournament} matches={matches} loadError={loadError} />;
}
