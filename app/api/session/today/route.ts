import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { questions, reviews, sessions, articles, settings } from "@/lib/db/schema";
import { eq, lte, and } from "drizzle-orm";
import { buildSession } from "@/lib/session";
import { todayStr } from "@/lib/srs";

function getSetting(db: ReturnType<typeof getDb>, key: string, fallback: number): number {
  const row = db.select().from(settings).where(eq(settings.key, key)).get() as { value: number } | undefined;
  return typeof row?.value === "number" ? row.value : fallback;
}

export async function GET() {
  const db = getDb();
  const today = todayStr();
  const existing = db.select().from(sessions).where(eq(sessions.date, today)).get();
  if (existing) {
    const dueCount = db.select().from(reviews).where(lte(reviews.nextDue, today)).all().length;
    return NextResponse.json({ date: today, questionIds: existing.questionIds, articleIds: existing.articleIds, dueCount, timeboxMin: getSetting(db, "timeboxMin", 15) });
  }
  const size = getSetting(db, "sessionSize", 10);
  const sweWeight = getSetting(db, "sweWeight", 5);
  const mlWeight = getSetting(db, "mlWeight", 5);
  const timeboxMin = getSetting(db, "timeboxMin", 15);

  const qs = db.select({ id: questions.id, topic: questions.topic, archived: questions.archived }).from(questions).all()
    .filter((q) => !q.archived);
  const revMap = new Map(db.select().from(reviews).all().map((r) => [r.questionId, r.nextDue]));
  const pool = qs.map((q) => ({ id: q.id, topic: q.topic as "swe" | "ml", nextDue: revMap.get(q.id) ?? null }));
  const ids = buildSession(today, pool, { size, sweWeight, mlWeight });

  const unread = db.select().from(articles)
    .where(and(eq(articles.status, "new"))).all();
  const swe = unread.filter((a) => a.topic === "swe").sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))[0];
  const ml = unread.filter((a) => a.topic === "ml").sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))[0];
  const articleIds = [swe?.id, ml?.id].filter((x): x is number => x !== undefined);

  db.insert(sessions).values({ date: today, questionIds: ids, articleIds }).onConflictDoNothing().run();
  const dueCount = pool.filter((p) => p.nextDue !== null && p.nextDue <= today).length;
  return NextResponse.json({ date: today, questionIds: ids, articleIds, dueCount, timeboxMin });
}
