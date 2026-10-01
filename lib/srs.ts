// SM-2 scheduler. Grade 0-5. Returns next review state.
export interface ReviewState {
  ease: number;
  interval: number;
  reps: number;
  nextDue: string; // YYYY-MM-DD
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayStr(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function gradeSrs(prev: ReviewState, grade: number, today: string): ReviewState {
  const g = Math.max(0, Math.min(5, Math.round(grade)));
  if (g < 3) {
    // Wrong: reset to due tomorrow (PRD 7.3)
    return { ease: Math.max(1.3, prev.ease - 0.2), interval: 0, reps: 0, nextDue: addDays(today, 1) };
  }
  let { ease, interval, reps } = prev;
  ease = Math.max(1.3, ease + (0.1 - (5 - g) * (0.08 + (5 - g) * 0.02)));
  reps += 1;
  if (reps === 1) interval = 1;
  else if (reps === 2) interval = 6;
  else interval = Math.round(interval * ease);
  return { ease, interval, reps, nextDue: addDays(today, interval) };
}

export function isLeech(failCount: number): boolean {
  return failCount >= 5;
}
