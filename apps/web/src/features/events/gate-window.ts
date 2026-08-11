const MS_PER_HOUR = 60 * 60 * 1000;

export const GATE_OPENS_HOURS_MAX = 48;

export function parseGateHours(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const hours = Number(trimmed);
  if (!Number.isInteger(hours) || hours < 0 || hours > GATE_OPENS_HOURS_MAX) {
    return null;
  }
  return hours;
}

export function gateOpensAtIso(startsAt: string, hoursBefore: number): string {
  return new Date(
    new Date(startsAt).getTime() - hoursBefore * MS_PER_HOUR,
  ).toISOString();
}

export function isGateOpen(
  startsAt: string,
  hoursBefore: number | null,
  now: Date = new Date(),
): boolean {
  if (hoursBefore === null) return true;
  return (
    now.getTime() >= new Date(gateOpensAtIso(startsAt, hoursBefore)).getTime()
  );
}

export function gateHoursLabel(hours: number | null): string {
  if (hours === null) return "sem limite";
  if (hours === 0) return "no horário do evento";
  if (hours === 1) return "1h antes";
  return `${hours}h antes`;
}

export function gateLimitNotice(hours: number | null): string | null {
  if (hours === null) return null;
  if (hours === 0) return "Portaria no horário do evento";
  if (hours === 1) return "Portaria abre 1h antes";
  return `Portaria abre ${hours}h antes`;
}
