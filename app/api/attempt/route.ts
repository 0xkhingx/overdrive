import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { attempts, reviews, questions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { gradeSrs, todayStr } from "@/lib/srs";

export async function POST(req: Request) {
  const { questionId, grade, correct, latencyMs, sessionId } = await req.json() as {
    questionId: string; grade: number; correct: boolean; latencyMs?: number; sessionId?: string;
  };
  const db = getDb();
  const today = todayStr();
  db.insert(attempts).values({ questionId, date: today, correct, grade, latencyMs: latencyMs ?? 0, sessionId: sessionId ?? today }).run();
  const rev = db.select().from(reviews).where(eq(reviews.questionId, questionId)).get();
  const prev = rev ? { ease: rev.ease, interval: rev.interval, reps: rev.reps, nextDue: rev.nextDue } : { ease: 2.5, interval: 0, reps: 0, nextDue: today };
  const next = gradeSrs(prev, grade, today);
  if (rev) {
    db.update(reviews).set({ ease: next.ease, interval: next.interval, reps: next.reps, nextDue: next.nextDue, lastGrade: grade }).where(eq(reviews.questionId, questionId)).run();
  } else {
    db.insert(reviews).values({ questionId, ease: next.ease, interval: next.interval, reps: next.reps, nextDue: next.nextDue, lastGrade: grade }).run();
  }
  if (!correct) {
    const q = db.select().from(questions).where(eq(questions.id, questionId)).get();
    if (q) db.update(questions).set({ failCount: q.failCount + 1 }).where(eq(questions.id, questionId)).run();
  }
  return NextResponse.json({ nextDue: next.nextDue });
}
