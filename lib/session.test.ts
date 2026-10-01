import { describe, expect, it } from "vitest";
import { buildSession } from "./session";

describe("session", () => {
  it("is deterministic per day", () => {
    const pool = Array.from({ length: 20 }, (_, i) => ({ id: `q${i}`, topic: (i % 2 ? "swe" : "ml") as "swe" | "ml", nextDue: "2026-01-01" }));
    expect(buildSession("2026-01-01", pool)).toEqual(buildSession("2026-01-01", pool));
  });
  it("prefers due reviews", () => {
    const pool = [
      ...Array.from({ length: 8 }, (_, i) => ({ id: `due${i}`, topic: "swe" as const, nextDue: "2026-01-01" })),
      ...Array.from({ length: 8 }, (_, i) => ({ id: `new${i}`, topic: "ml" as const, nextDue: null })),
    ];
    const ids = buildSession("2026-01-02", pool, { size: 10 });
    expect(ids).toHaveLength(10);
    expect(ids.filter((x) => x.startsWith("due")).length).toBeGreaterThanOrEqual(7);
  });
});
