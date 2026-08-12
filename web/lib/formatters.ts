export function formatPercent(value: string | number | null | undefined, digits = 1): string {
  const numeric = toNumber(value);
  if (numeric === null) {
    return "n/a";
  }
  return `${(numeric * 100).toFixed(digits)}%`;
}

export function formatNumber(value: string | number | null | undefined, digits = 0): string {
  const numeric = toNumber(value);
  if (numeric === null) {
    return "n/a";
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(numeric);
}

export function formatRanking(value: string | number | null | undefined): string {
  const numeric = toNumber(value);
  if (numeric === null) {
    return "n/a";
  }
  return `#${Math.round(numeric)}`;
}

export function formatNullable(value: string | number | null | undefined): string {
  if (value === null || value === undefined || String(value).trim() === "" || String(value).toLowerCase() === "nan") {
    return "n/a";
  }
  return String(value);
}

export function formatDate(value: unknown): string {
  if (value === null || value === undefined) {
    return "n/a";
  }

  const raw = String(value).trim();
  if (raw === "" || raw.toLowerCase() === "nan") {
    return "n/a";
  }

  const normalized = raw.replace(/\.0$/, "");
  const isoMatch = normalized.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) {
    return isoMatch[1];
  }

  if (/^\d{8}$/.test(normalized)) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}`;
  }

  const dayFirstMatch = normalized.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dayFirstMatch) {
    return `${dayFirstMatch[3]}-${dayFirstMatch[2]}-${dayFirstMatch[1]}`;
  }

  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return "n/a";
}

export function formatProductConfidenceBandShort(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);
  if (normalized === null) {
    return null;
  }
  const labels: Record<string, string> = {
    "Strong model agreement": "Strong agreement",
    "Moderate model agreement": "Moderate agreement",
    "Model-driven pick": "Model-driven",
    "Low visible-signal agreement": "Low visible support",
    "High uncertainty despite high model confidence": "High uncertainty"
  };
  return labels[normalized] ?? normalized;
}

export function formatRiskLabel(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);
  if (normalized === null) {
    return null;
  }
  const lower = normalized.toLowerCase();
  if (lower === "low" || lower === "medium" || lower === "high") {
    return `${lower.charAt(0).toUpperCase()}${lower.slice(1)} risk`;
  }
  return normalized;
}

export function surfaceTone(surface: string): "hard" | "clay" | "grass" | "carpet" | "neutral" {
  const normalized = surface.toLowerCase();
  if (normalized.includes("hard")) return "hard";
  if (normalized.includes("clay")) return "clay";
  if (normalized.includes("grass")) return "grass";
  if (normalized.includes("carpet")) return "carpet";
  return "neutral";
}

export function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const numeric = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeText(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = String(value).trim();
  if (trimmed === "" || trimmed.toLowerCase() === "nan") {
    return null;
  }
  return trimmed;
}
