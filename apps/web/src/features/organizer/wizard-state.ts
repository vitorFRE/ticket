import type { CatalogItem, CatalogSource } from "@/features/organizer/types";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export type SectorDraft = {
  name: string;
  capacity: string;
  price: string;
};

export type WizardState = {
  step: WizardStep;
  source: CatalogSource;
  query: string;
  item: CatalogItem | null;
  venue: string;
  startsAt: string;
  price: string;
  inventoryMode: "SEAT_MAP" | "GA_SECTOR";
  rows: string;
  seatsPerRow: string;
  sectors: SectorDraft[];
};

export const initialWizardState: WizardState = {
  step: 1,
  source: "tmdb",
  query: "",
  item: null,
  venue: "",
  startsAt: "",
  price: "",
  inventoryMode: "SEAT_MAP",
  rows: "A,B,C,D,E,F,G,H,I,J",
  seatsPerRow: "12",
  sectors: [
    { name: "Pista", capacity: "100", price: "" },
    { name: "Camarote", capacity: "20", price: "" },
  ],
};
