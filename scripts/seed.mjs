// Plain-Node seed (no tsx needed). Validates seed JSON, inserts questions + reviews + feeds.
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
import Database from "better-sqlite3";

const DB_PATH = process.env.DB_PATH ?? "./data/app.db";
mkdirSync("./data", { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (id TEXT PRIMARY KEY, type TEXT NOT NULL, topic TEXT NOT NULL, tags JSON NOT NULL DEFAULT '[]', difficulty INTEGER NOT NULL DEFAULT 1, prompt TEXT NOT NULL, options JSON, answer TEXT NOT NULL, explanation TEXT NOT NULL DEFAULT '', source TEXT NOT NULL DEFAULT 'self-authored', license TEXT NOT NULL DEFAULT 'CC-BY-SA-4.0', archived INTEGER NOT NULL DEFAULT 0, fail_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS reviews (question_id TEXT PRIMARY KEY REFERENCES questions(id), ease REAL NOT NULL DEFAULT 2.5, interval INTEGER NOT NULL DEFAULT 0, reps INTEGER NOT NULL DEFAULT 0, next_due TEXT NOT NULL, last_grade INTEGER);
  CREATE TABLE IF NOT EXISTS feeds (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, url TEXT NOT NULL UNIQUE, topic TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, last_fetch TEXT, last_error TEXT);
`);
const today = new Date().toISOString().slice(0, 10);
const insQ = db.prepare(`INSERT OR IGNORE INTO questions (id,type,topic,tags,difficulty,prompt,options,answer,explanation,source,license,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
const insR = db.prepare(`INSERT OR IGNORE INTO reviews (question_id,ease,interval,reps,next_due) VALUES (?,?,?, ?,?)`);
const insF = db.prepare(`INSERT OR IGNORE INTO feeds (name,url,topic) VALUES (?,?,?)`);

let total = 0;
for (const f of readdirSync("./data/seed").filter((x) => x.endsWith(".json"))) {
  const raw = JSON.parse(readFileSync(`./data/seed/${f}`, "utf8"));
  for (const q of raw) {
    if (!q.id || !q.prompt || !q.answer || !["mcq", "flip"].includes(q.type) || !["swe", "ml"].includes(q.topic)) {
      console.error(`INVALID ${f}: ${q.id} (missing/invalid fields)`);
      continue;
    }
    if (q.type === "mcq" && (!Array.isArray(q.options) || q.options.length < 2 || !q.options.includes(q.answer))) {
      console.error(`INVALID ${f}: ${q.id} (mcq options/answer)`);
      continue;
    }
    insQ.run(q.id, q.type, q.topic, JSON.stringify(q.tags ?? []), q.difficulty ?? 1, q.prompt, q.options ? JSON.stringify(q.options) : null, q.answer, q.explanation ?? "", q.source ?? "self-authored", q.license ?? "CC-BY-SA-4.0", new Date().toISOString());
    insR.run(q.id, 2.5, 0, 0, today);
    total++;
  }
}
for (const f of [
  ["Hacker News Front", "https://hnrss.org/frontpage", "swe"],
  ["Martin Fowler", "https://martinfowler.com/feed.atom", "swe"],
  ["Google Research", "https://research.google/blog/rss/", "ml"],
  ["arXiv cs.LG", "https://rss.arxiv.org/rss/cs.LG", "ml"],
  ["arXiv cs.SE", "https://rss.arxiv.org/rss/cs.SE", "swe"],
]) insF.run(...f);
console.log(`Seeded ${total} questions + 5 feeds into ${DB_PATH}.`);
