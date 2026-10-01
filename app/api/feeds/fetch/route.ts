import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { getDb } from "@/lib/db";
import { feeds, articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { assignTopic } from "@/lib/feeds";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const parser = new Parser({ timeout: 15000 });

async function extractFullText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    const html = await res.text();
    const doc = new JSDOM(html, { url }).window.document;
    const reader = new Readability(doc);
    const article = reader.parse();
    return article?.content ?? null;
  } catch {
    return null;
  }
}

export async function POST() {
  const db = getDb();
  const all = db.select().from(feeds).where(eq(feeds.enabled, true)).all();
  const results: { feed: string; added: number; error?: string }[] = [];
  for (const f of all) {
    try {
      const parsed = await parser.parseURL(f.url);
      let added = 0;
      for (const item of (parsed.items ?? []).slice(0, 20)) {
        const url = item.link;
        if (!url) continue;
        const exists = db.select().from(articles).where(eq(articles.url, url)).get();
        if (exists) continue;
        const title = item.title ?? url;
        const summary = item.contentSnippet ?? "";
        const topic = assignTopic(f.topic as "swe" | "ml", title, summary);
        const contentHtml = await extractFullText(url);
        db.insert(articles).values({
          title, source: f.name, url, summary: summary.slice(0, 2000),
          contentHtml, publishedAt: item.isoDate ?? null, topic, feedId: f.id,
        }).onConflictDoNothing().run();
        added++;
      }
      db.update(feeds).set({ lastFetch: new Date().toISOString(), lastError: null }).where(eq(feeds.id, f.id)).run();
      results.push({ feed: f.name, added });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      db.update(feeds).set({ lastError: msg }).where(eq(feeds.id, f.id)).run();
      results.push({ feed: f.name, added: 0, error: msg });
    }
  }
  return NextResponse.json({ results });
}
