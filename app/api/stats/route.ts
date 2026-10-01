import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { attempts, questions, reviews } from "@/lib/db/schema";
import { accuracyByTopic, currentStreak } from "@/lib/stats";
import { todayStr } from "@/lib/srs";

export async function GET() {
  const db = getDb();
  const rows = db.select().from(attempts).all();
  const qmap = new Map(db.select().from(questions).all().map((q) => [q.id, q.topic]));
  const byTopic = accuracyByTopic(rows.map((r) => ({ topic: qmap.get(r.questionId) ?? "swe", correct: r.correct })));
  const dates = [...new Set(rows.map((r) => r.date))];
  const streak = currentStreak(dates, todayStr());
  const forecast = db.select().from(reviews).all().reduce<Record<string, number>>((m, r) => {
    m[r.nextDue] = (m[r.nextDue] ?? 0) + 1;
    return m;
  }, {});
  return NextResponse.json({ answered: rows.length, byTopic, streak, forecast });
}
