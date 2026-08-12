export type CsvRow = Record<string, string>;

export function parseCsv(text: string): CsvRow[] {
  const rows = parseCsvRows(text.trim());
  if (rows.length === 0) {
    return [];
  }
  const [headers, ...records] = rows;
  return records
    .filter((record) => record.some((value) => value.trim() !== ""))
    .map((record) => {
      const row: CsvRow = {};
      headers.forEach((header, index) => {
        row[header] = record[index] ?? "";
      });
      return row;
    });
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += char;
  }

  row.push(value);
  rows.push(row);
  return rows;
}
