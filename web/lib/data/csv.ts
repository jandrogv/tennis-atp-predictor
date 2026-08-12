import fs from "node:fs/promises";
import path from "node:path";
import { parseCsv } from "@/lib/data/csv-parser";
import { RetryablePromiseCache } from "@/lib/data/retryable-promise-cache";

export { parseCsv } from "@/lib/data/csv-parser";
export type { CsvRow } from "@/lib/data/csv-parser";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const dataFileCache = new RetryablePromiseCache();

export async function readCsv<T>(fileName: string): Promise<T[]> {
  return dataFileCache.get(`csv:${fileName}`, async () => {
    const filePath = path.join(DATA_DIR, fileName);
    const text = await fs.readFile(filePath, "utf-8");
    return parseCsv(text) as T[];
  });
}

export async function readJson<T>(fileName: string): Promise<T> {
  return dataFileCache.get(`json:${fileName}`, async () => {
    const filePath = path.join(DATA_DIR, fileName);
    const text = await fs.readFile(filePath, "utf-8");
    return JSON.parse(text) as T;
  });
}
