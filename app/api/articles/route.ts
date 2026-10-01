import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.select().from(articles).all().slice(0, 100));
}

export async function PATCH(req: Request) {
  const { id, status, note } = await req.json() as { id: number; status?: "new" | "read" | "skipped" | "saved"; note?: string };
  const db = getDb();
  const patch: Partial<{ status: typeof status; note: string }> = {};
  if (status) patch.status = status;
  if (note !== undefined) patch.note = note;
  db.update(articles).set(patch).where(eq(articles.id, id)).run();
  return NextResponse.json({ ok: true });
}
