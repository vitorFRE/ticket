const STORAGE_KEY = "ticketim.gate.eventId";

export function getStoredGateEventId(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredGateEventId(id: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore quota / private mode
  }
}
