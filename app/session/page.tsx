"use client";
import { useEffect, useMemo, useState } from "react";

interface Q {
  id: string; type: "mcq" | "flip"; topic: string; prompt: string;
  options: string[] | null; answer: string; explanation: string;
}

export default function SessionPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [qs, setQs] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);
  const [secsLeft, setSecsLeft] = useState(15 * 60);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/session/today").then((r) => r.json()).then((d) => {
      setIds(d.questionIds);
      setSecsLeft((d.timeboxMin ?? 15) * 60);
      if (d.questionIds.length) fetch(`/api/questions?ids=${d.questionIds.join(",")}`).then((r) => r.json()).then(setQs);
      else setDone(true);
    });
  }, []);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setSecsLeft((s) => {
      if (s <= 1) { clearInterval(t); setDone(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [done]);

  const q = qs[idx];
  const mmss = useMemo(() => `${Math.floor(secsLeft / 60)}:${String(secsLeft % 60).padStart(2, "0")}`, [secsLeft]);

  async function submitMcq() {
    if (!q || !picked) return;
    const correct = picked === q.answer;
    await fetch("/api/attempt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: q.id, grade: correct ? 4 : 0, correct, sessionId: new Date().toISOString().slice(0, 10) }) });
    next();
  }
  async function gradeFlip(grade: number) {
    if (!q) return;
    await fetch("/api/attempt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: q.id, grade, correct: grade >= 3, sessionId: new Date().toISOString().slice(0, 10) }) });
    setShowBack(false);
    next();
  }
  function next() {
    setPicked(null);
    if (idx + 1 >= qs.length) setDone(true);
    else setIdx(idx + 1);
  }

  if (done) return <div><h1 className="text-2xl font-bold">Session complete 🎉</h1><p>{idx}/{qs.length} answered · {mmss} left.</p><a className="underline" href="/reads">Go to reads →</a></div>;
  if (!q) return <p>Loading questions…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm"><span>Q {idx + 1}/{qs.length} · [{q.topic}] {q.id}</span><span className="font-mono">⏱ {mmss}</span></div>
      <div className="rounded border bg-white p-4">
        <p className="whitespace-pre-wrap font-medium">{q.prompt}</p>
        {q.type === "mcq" && q.options && (
          <div className="mt-3 space-y-2">
            {q.options.map((o) => (
              <label key={o} className={`block cursor-pointer rounded border p-2 ${picked === o ? "border-black bg-zinc-100" : ""}`}>
                <input type="radio" name="opt" className="mr-2" checked={picked === o} onChange={() => setPicked(o)} />{o}
              </label>
            ))}
            <button onClick={submitMcq} disabled={!picked} className="rounded bg-black px-4 py-2 text-white disabled:opacity-40">Submit</button>
          </div>
        )}
        {q.type === "flip" && (
          <div className="mt-3">
            {!showBack ? <button onClick={() => setShowBack(true)} className="rounded bg-black px-4 py-2 text-white">Show answer</button> : (
              <div>
                <p className="whitespace-pre-wrap rounded bg-zinc-100 p-3">{q.answer}</p>
                {q.explanation && <p className="mt-2 text-sm text-zinc-600">{q.explanation}</p>}
                <div className="mt-3 flex gap-2">
                  {[["Again", 0], ["Hard", 3], ["Good", 4], ["Easy", 5]].map(([label, g]) => (
                    <button key={label as string} onClick={() => gradeFlip(g as number)} className="rounded border px-3 py-2 hover:bg-zinc-100">{label as string}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
