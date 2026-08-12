import type { MatchStatisticsCurrentFile, MatchStatisticsRecord } from "./match-statistics-types";

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export type MatchStatisticsLoader = {
  load: () => Promise<MatchStatisticsCurrentFile>;
  getById: (matchId: string) => Promise<MatchStatisticsRecord | null>;
  getByIds: (matchIds: readonly string[]) => Promise<Record<string, MatchStatisticsRecord>>;
};

export function createMatchStatisticsLoader(fetcher: Fetcher, currentYear = new Date().getFullYear()): MatchStatisticsLoader {
  let statisticsPromise: Promise<MatchStatisticsCurrentFile> | null = null;

  const load = (): Promise<MatchStatisticsCurrentFile> => {
    if (statisticsPromise) return statisticsPromise;
    statisticsPromise = fetcher("/data/match-statistics-current.json", { cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Match statistics returned ${response.status}`);
        return validateMatchStatisticsFile(await response.json(), currentYear);
      })
      .catch((error: unknown) => {
        statisticsPromise = null;
        throw error;
      });
    return statisticsPromise;
  };

  return {
    load,
    async getById(matchId) {
      const normalized = matchId.trim();
      if (!normalized) return null;
      const file = await load();
      return file.matches[normalized] ?? null;
    },
    async getByIds(matchIds) {
      const file = await load();
      const result: Record<string, MatchStatisticsRecord> = {};
      for (const matchId of matchIds) {
        const normalized = matchId.trim();
        if (normalized && file.matches[normalized]) result[normalized] = file.matches[normalized];
      }
      return result;
    }
  };
}

const browserLoader = createMatchStatisticsLoader((input, init) => fetch(input, init));

export const loadCurrentYearMatchStatistics = browserLoader.load;
export const getMatchStatisticsById = browserLoader.getById;
export const getMatchStatisticsByIds = browserLoader.getByIds;

function validateMatchStatisticsFile(value: unknown, currentYear: number): MatchStatisticsCurrentFile {
  if (!isRecord(value)) throw new Error("Match statistics payload is not an object");
  if (value.schemaVersion !== 1) throw new Error(`Unsupported match statistics schema ${String(value.schemaVersion)}`);
  if (value.year !== currentYear) throw new Error(`Match statistics payload has year ${String(value.year)}; expected ${currentYear}`);
  if (!Number.isInteger(value.matchCount) || Number(value.matchCount) < 0) throw new Error("Match statistics matchCount is invalid");
  if (!isRecord(value.matches)) throw new Error("Match statistics matches index is invalid");
  const entries = Object.entries(value.matches);
  if (entries.length !== value.matchCount) throw new Error("Match statistics matchCount does not match the index");
  for (const [matchId, record] of entries) {
    if (!matchId || !isRecord(record) || record.matchId !== matchId || record.year !== currentYear) {
      throw new Error(`Invalid match statistics record ${matchId || "<blank>"}`);
    }
  }
  return value as MatchStatisticsCurrentFile;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
