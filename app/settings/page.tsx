"use client";
import { useState } from "react";

export default function Settings() {
  const [msg, setMsg] = useState("");
  async function exportAll() {
    const r = await fetch("/api/export");
    const blob = new Blob([JSON.stringify(await r.json(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dlp-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setMsg("Exported.");
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <section className="rounded border bg-white p-4 text-sm space-y-2">
        <p>Session defaults: 10 questions (5 SWE / 5 ML), 15-min timebox. Configurable via Settings API/DB in v1.</p>
        <p>Reminder: browser notifications are best-effort (esp. iOS). Add a calendar event as fallback.</p>
        <button onClick={exportAll} className="rounded bg-black px-4 py-2 text-white">Export all data (JSON)</button>
        <button onClick={() => { if (Notification.permission === "default") Notification.requestPermission(); new Notification("Daily Learning", { body: "Time for your 15-min session!" }); setMsg("Reminder test sent."); }} className="ml-2 rounded border px-4 py-2">Test reminder</button>
        {msg && <p>{msg}</p>}
      </section>
      <section className="rounded border bg-white p-4 text-sm">
        <h2 className="font-semibold">Backup</h2>
        <p>SQLite file lives at <code>./data/app.db</code>. Back it up with: <code>scripts/backup.sh</code>. Docker volume: <code>/data</code>.</p>
      </section>
    </div>
  );
}
