import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { questions, reviews } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { validateQuestions } from "@/lib/import";
import { todayStr } from "@/lib/srs";

export async function GET(req: Request) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids");
  if (ids) {
    const list = ids.split(",").filter(Boolean);
    if (!list.length) return NextResponse.json([]);
    const rows = db.select().from(questions).where(inArray(questions.id, list)).all();
    const order = new Map(list.map((id, i) => [id, i]));
    rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return NextResponse.json(rows);
  }
  return NextResponse.json(db.select().from(questions).all());
}

export async function POST(req: Request) {
  const body = await req.json();
  const items = Array.isArray(body) ? body : [body];
  const { valid, errors } = validateQuestions(items);
  if (!valid.length) return NextResponse.json({ inserted: 0, errors }, { status: 400 });
  const db = getDb();
  for (const q of valid) {
    const exists = db.select().from(questions).where(eq(questions.id, q.id)).get();
    if (exists) {
      errors.push({ index: -1, id: q.id, message: "duplicate id already in db" });
      continue;
    }
    db.insert(questions).values({ ...q, options: q.options ?? null, tags: q.tags ?? [] }).run();
    db.insert(reviews).values({ questionId: q.id, ease: 2.5, interval: 0, reps: 0, nextDue: todayStr() }).run();
  }
  return NextResponse.json({ inserted: valid.length, errors });
}
