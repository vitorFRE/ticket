const MS_PER_HOUR = 60 * 60 * 1000;

export function gateOpensAt(startsAt: Date, hoursBefore: number): Date {
  return new Date(startsAt.getTime() - hoursBefore * MS_PER_HOUR);
}

export function isGateOpen(
  startsAt: Date,
  hoursBefore: number | null,
  now: Date = new Date(),
): boolean {
  if (hoursBefore === null) return true;
  return now.getTime() >= gateOpensAt(startsAt, hoursBefore).getTime();
}
