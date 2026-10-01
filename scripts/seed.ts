import { readFileSync, readdirSync } from "node:fs";
import { getDb } from "../lib/db";
import { questions, reviews, feeds } from "../lib/db/schema";
import { validateQuestions } from "../lib/import";
import { DEFAULT_FEEDS } from "../lib/feeds";
import { todayStr } from "../lib/srs";

const db = getDb();
const dir = "./data/seed";
let total = 0;
for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const raw = JSON.parse(readFileSync(`${dir}/${f}`, "utf8")) as unknown[];
  const { valid, errors } = validateQuestions(raw);
  for (const e of errors) console.error(`INVALID ${f}[${e.index}] ${e.id}: ${e.message}`);
  for (const q of valid) {
    db.insert(questions).values({ ...q, options: q.options ?? null, tags: q.tags ?? [] }).onConflictDoNothing().run();
    db.insert(reviews).values({ questionId: q.id, ease: 2.5, interval: 0, reps: 0, nextDue: todayStr() }).onConflictDoNothing().run();
    total++;
  }
}
for (const f of DEFAULT_FEEDS) {
  db.insert(feeds).values({ name: f.name, url: f.url, topic: f.topic as "swe" | "ml" }).onConflictDoNothing().run();
}
console.log(`Seeded ${total} questions + ${DEFAULT_FEEDS.length} feeds.`);
