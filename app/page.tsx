"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface TodayData {
  date: string;
  questionIds: string[];
  articleIds: number[];
  dueCount: number;
  timeboxMin: number;
}

export default function Today() {
  const [data, setData] = useState<TodayData | null>(null);
  useEffect(() => {
    fetch("/api/session/today").then((r) => r.json()).then(setData);
  }, []);
  if (!data) return <p>Loading today&apos;s session…</p>;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Today — {data.date}</h1>
        <p className="text-zinc-600">
          {data.questionIds.length} questions ({data.dueCount} due reviews) · {data.timeboxMin}-min timer · {data.articleIds.length} reads
        </p>
      </div>
      <Link href="/session" className="inline-block rounded bg-black px-5 py-3 text-white">
        Start 15-min session
      </Link>
      <section className="rounded border bg-white p-4">
        <h2 className="font-semibold">How it works</h2>
        <ol className="list-decimal pl-5 text-sm text-zinc-700">
          <li>Answer due reviews first, then new cards.</li>
          <li>MCQ = instant feedback. Flip cards = Again/Hard/Good/Easy.</li>
          <li>Read 2 articles, mark read, optionally make a question.</li>
        </ol>
      </section>
    </div>
  );
}
