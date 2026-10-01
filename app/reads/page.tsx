"use client";
import { useEffect, useState } from "react";

interface A { id: number; title: string; source: string; url: string; summary: string; topic: string; status: string; note: string; }

export default function Reads() {
  const [items, setItems] = useState<A[]>([]);
  useEffect(() => { fetch("/api/articles").then((r) => r.json()).then(setItems); }, []);
  async function setStatus(id: number, status: string) {
    await fetch("/api/articles", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status } : x)));
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reads</h1>
        <button onClick={() => fetch("/api/feeds/fetch", { method: "POST" }).then(() => location.reload())} className="rounded border px-3 py-2 text-sm">Fetch feeds now</button>
      </div>
      {items.filter((a) => a.status === "new" || a.status === "saved").map((a) => (
        <article key={a.id} className="rounded border bg-white p-4">
          <div className="text-xs text-zinc-500">[{a.topic}] {a.source} · {a.status}</div>
          <h2 className="font-semibold">{a.title}</h2>
          <p className="text-sm text-zinc-600">{a.summary?.slice(0, 300)}</p>
          <div className="mt-2 flex gap-2 text-sm">
            <a href={a.url} target="_blank" className="underline">Open original</a>
            <button onClick={() => setStatus(a.id, "read")} className="underline">Mark read</button>
            <button onClick={() => setStatus(a.id, "skipped")} className="underline">Skip</button>
            <button onClick={() => setStatus(a.id, "saved")} className="underline">Save</button>
            <a href={`/bank?fromArticle=${a.id}`} className="underline">Make question</a>
          </div>
        </article>
      ))}
      {!items.length && <p>No articles yet — click “Fetch feeds now”.</p>}
    </div>
  );
}
