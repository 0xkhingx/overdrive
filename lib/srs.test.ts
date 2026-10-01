import { describe, expect, it } from "vitest";
import { gradeSrs, isLeech, todayStr } from "./srs";

describe("srs", () => {
  it("wrong answer resets to tomorrow", () => {
    const t = todayStr();
    const n = gradeSrs({ ease: 2.5, interval: 10, reps: 3, nextDue: t }, 0, t);
    expect(n.reps).toBe(0);
    expect(n.interval).toBe(0);
  });
  it("good grades grow interval", () => {
    const t = "2026-01-01";
    const s1 = gradeSrs({ ease: 2.5, interval: 0, reps: 0, nextDue: t }, 4, t);
    expect(s1.nextDue).toBe("2026-01-02");
    const s2 = gradeSrs(s1, 4, s1.nextDue);
    expect(s2.nextDue).toBe("2026-01-08");
  });
  it("leech at 5 fails", () => {
    expect(isLeech(4)).toBe(false);
    expect(isLeech(5)).toBe(true);
  });
});
