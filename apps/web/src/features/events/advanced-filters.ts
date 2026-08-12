export type AdvancedEventFilters = {
  from?: string;
  to?: string;
  priceMin?: number;
  priceMax?: number;
  venue?: string;
};

export function parseAdvancedFilters(
  params: URLSearchParams,
): AdvancedEventFilters {
  const from = params.get("from")?.trim() || undefined;
  const to = params.get("to")?.trim() || undefined;
  const venue = params.get("venue")?.trim() || undefined;
  const priceMin = parseOptionalCents(params.get("priceMin"));
  const priceMax = parseOptionalCents(params.get("priceMax"));
  return {
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    ...(venue ? { venue } : {}),
    ...(priceMin !== undefined ? { priceMin } : {}),
    ...(priceMax !== undefined ? { priceMax } : {}),
  };
}

export function hasAdvancedFilters(filters: AdvancedEventFilters) {
  return Boolean(
    filters.from ||
      filters.to ||
      filters.venue ||
      filters.priceMin !== undefined ||
      filters.priceMax !== undefined,
  );
}

export function dateInputValue(isoOrDate: string | undefined) {
  if (!isoOrDate) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) return isoOrDate;
  const date = new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Start of local day as ISO for API `from`. */
export function dateInputToFromIso(value: string) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

/** End of local day as ISO for API `to`. */
export function dateInputToToIso(value: string) {
  if (!value) return undefined;
  const date = new Date(`${value}T23:59:59.999`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function centsToReaisFilterInput(cents: number | undefined) {
  if (cents === undefined) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function reaisFilterToCents(value: string) {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return undefined;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function parseOptionalCents(raw: string | null) {
  if (raw === null || raw.trim() === "") return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) return undefined;
  return n;
}
