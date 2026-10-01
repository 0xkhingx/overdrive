import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { questions, reviews, attempts, articles, feeds, sessions, settings } from "@/lib/db/schema";

export async function GET() {
  const db = getDb();
  return NextResponse.json({
    questions: db.select().from(questions).all(),
    reviews: db.select().from(reviews).all(),
    attempts: db.select().from(attempts).all(),
    articles: db.select().from(articles).all(),
    feeds: db.select().from(feeds).all(),
    sessions: db.select().from(sessions).all(),
    settings: db.select().from(settings).all(),
    exportedAt: new Date().toISOString(),
  });
}
