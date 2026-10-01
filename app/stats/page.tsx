"use client";
import { useEffect, useState } from "react";

export default function Stats() {
  const [s, setS] = useState<{ answered: number; streak: { current: number; longest: number }; byTopic: { topic: string; acc: number; correct: number; total: number }[] } | null>(null);
  useEffect(() => { fetch("/api/stats").then((r) => r.json()).then(setS); }, []);
  if (!s) return <p>Loading stats…</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Stats</h1>
      <p>Streak: <b>{s.streak.current}</b> days (longest {s.streak.longest}) · Answered: {s.answered}</p>
      {s.byTopic.map((t) => (
        <div key={t.topic} className="rounded border bg-white p-3">
          <b>{t.topic}</b>: {(t.acc * 100).toFixed(1)}% ({t.correct}/{t.total})
          <div className="mt-1 h-2 rounded bg-zinc-200"><div className="h-2 rounded bg-black" style={{ width: `${t.acc * 100}%` }} /></div>
        </div>
      ))}
      {s.byTopic.length > 1 && <p className="text-sm text-zinc-600">Weakest: <b>{s.byTopic[0].topic}</b> — focus there.</p>}
    </div>
  );
}
