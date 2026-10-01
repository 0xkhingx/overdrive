// Deterministic daily session builder (seeded by date string).
export interface SessionPoolItem {
  id: string;
  topic: "swe" | "ml";
  nextDue: string | null; // null = new card
}

export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildSession(
  dateStr: string,
  pool: SessionPoolItem[],
  opts: { size?: number; sweWeight?: number; mlWeight?: number } = {},
): string[] {
  const size = opts.size ?? 10;
  const sweW = opts.sweWeight ?? 5;
  const mlW = opts.mlWeight ?? 5;
  const rand = mulberry32(hashSeed("dlp-" + dateStr));

  const due = shuffled(pool.filter((c) => c.nextDue !== null && c.nextDue <= dateStr), rand);
  const fresh = shuffled(pool.filter((c) => c.nextDue === null || c.nextDue > dateStr), rand);

  // Target ~70% reviews when enough are due
  const reviewTarget = Math.min(due.length, Math.round(size * 0.7));
  const picked: SessionPoolItem[] = [];
  picked.push(...due.slice(0, reviewTarget));

  const remaining = size - picked.length;
  // Fill remaining with topic-weighted new/due-leftover cards
  const rest = shuffled([...due.slice(reviewTarget), ...fresh], rand);
  const swePool = rest.filter((c) => c.topic === "swe");
  const mlPool = rest.filter((c) => c.topic === "ml");
  const totalW = sweW + mlW || 1;
  const sweCount = Math.round((remaining * sweW) / totalW);
  picked.push(...swePool.slice(0, sweCount));
  picked.push(...mlPool.slice(0, remaining - swePool.slice(0, sweCount).length));

  // Final deterministic shuffle so reviews aren't always first-blocked in UI order
  // (data still records due-first composition). Keep stable per day.
  return shuffled(picked, rand).map((c) => c.id);
}

export function shuffleOptions(options: string[], seedKey: string): string[] {
  return shuffled(options, mulberry32(hashSeed(seedKey)));
}
