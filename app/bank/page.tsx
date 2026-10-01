"use client";
import { useEffect, useState } from "react";

interface Q { id: string; type: string; topic: string; prompt: string; answer: string; }

export default function Bank() {
  const [qs, setQs] = useState<Q[]>([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ id: "", type: "mcq", topic: "swe", prompt: "", options: "", answer: "", explanation: "" });
  useEffect(() => { fetch("/api/questions").then((r) => r.json()).then(setQs); }, []);
  const shown = qs.filter((q) => !filter || q.id.includes(filter) || q.prompt.toLowerCase().includes(filter.toLowerCase()) || q.topic === filter);

  async function add() {
    const payload = {
      ...form,
      options: form.options ? form.options.split("\n").map((s) => s.trim()).filter(Boolean) : undefined,
      tags: [], difficulty: 1, source: "self-authored", license: "CC-BY-SA-4.0",
    };
    const r = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await r.json();
    alert(r.ok ? `Added ${d.inserted}` : `Error: ${JSON.stringify(d.errors)}`);
    if (r.ok) location.reload();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bank ({qs.length})</h1>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="filter by text/topic…" className="w-full rounded border p-2" />
      <div className="space-y-2">
        {shown.slice(0, 100).map((q) => (
          <div key={q.id} className="rounded border bg-white p-3 text-sm">
            <span className="font-mono text-xs">[{q.topic}/{q.type}] {q.id}</span>
            <p>{q.prompt}</p>
          </div>
        ))}
      </div>
      <section className="rounded border bg-white p-4 space-y-2">
        <h2 className="font-semibold">Add question (Markdown + code blocks supported)</h2>
        {(["id", "prompt", "answer", "explanation"] as const).map((k) => (
          <input key={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={k} className="w-full rounded border p-2 text-sm" />
        ))}
        <div className="flex gap-2 text-sm">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded border p-2"><option value="mcq">mcq</option><option value="flip">flip</option></select>
          <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="rounded border p-2"><option value="swe">swe</option><option value="ml">ml</option></select>
        </div>
        <textarea value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} placeholder="options (one per line, mcq only)" className="w-full rounded border p-2 text-sm" rows={3} />
        <button onClick={add} className="rounded bg-black px-4 py-2 text-white text-sm">Add</button>
      </section>
    </div>
  );
}
