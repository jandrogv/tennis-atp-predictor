import { readJson } from "@/lib/data/csv";
import {
  getCurrentMatchStatistics,
  getPlayersDirectory,
  getTournamentDetails,
  getTournamentMatches,
  type DataPartitionIndex
} from "@/lib/data/loaders";

export {
  getCurrentMatchStatistics,
  getPlayersDirectory,
  getTournamentDetails,
  getTournamentMatches
};

export function readPartitionIndex(fileName: string): Promise<DataPartitionIndex> {
  return readJson<DataPartitionIndex>(fileName);
}
