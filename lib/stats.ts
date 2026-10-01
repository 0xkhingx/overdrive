export interface AttemptRow { questionId: string; topic: string; tag: string; correct: boolean; date: string; }

export function accuracyByTopic(rows: { topic: string; correct: boolean }[]) {
  const map = new Map<string, { total: number; correct: number }>();
  for (const r of rows) {
    const e = map.get(r.topic) ?? { total: 0, correct: 0 };
    e.total++;
    if (r.correct) e.correct++;
    map.set(r.topic, e);
  }
  return [...map.entries()].map(([topic, v]) => ({ topic, ...v, acc: v.total ? v.correct / v.total : 0 }))
    .sort((a, b) => a.acc - b.acc);
}

export function currentStreak(dates: string[], today: string): { current: number; longest: number } {
  const set = new Set(dates);
  let current = 0;
  const cursor = new Date(today + "T00:00:00Z");
  if (!set.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (set.has(cursor.toISOString().slice(0, 10))) {
    current++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const sorted = [...set].sort();
  let longest = 0, run = 0, prev = "";
  for (const d of sorted) {
    const dd = new Date(d + "T00:00:00Z");
    if (prev) {
      const diff = (dd.getTime() - new Date(prev + "T00:00:00Z").getTime()) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else run = 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest };
}
