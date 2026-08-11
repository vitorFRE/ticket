import { describe, expect, it } from "vitest";
import {
  kindFromSource,
  kindLabel,
  kindLabelFromSource,
  parseKind,
  sourceFromKind,
} from "@/features/events/catalog-kind";

describe("catalog-kind", () => {
  it("parses filme and show from the query", () => {
    expect(parseKind("filme")).toBe("filme");
    expect(parseKind("show")).toBe("show");
    expect(parseKind("assentos")).toBeNull();
    expect(parseKind(null)).toBeNull();
  });

  it("maps kind to catalog source and back", () => {
    expect(sourceFromKind("filme")).toBe("tmdb");
    expect(sourceFromKind("show")).toBe("ticketmaster");
    expect(kindFromSource("TMDB")).toBe("filme");
    expect(kindFromSource("TICKETMASTER")).toBe("show");
  });

  it("labels Filme / Show, not inventory mode", () => {
    expect(kindLabel("filme")).toBe("Filme");
    expect(kindLabel("show")).toBe("Show");
    expect(kindLabelFromSource("TMDB")).toBe("Filme");
    expect(kindLabelFromSource("TICKETMASTER")).toBe("Show");
  });
});
