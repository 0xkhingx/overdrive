import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "./schema";

const DB_PATH = process.env.DB_PATH ?? "./data/app.db";

let _db: BetterSQLite3Database<typeof schema> | null = null;

export function getDb() {
  if (_db) return _db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS questions (id TEXT PRIMARY KEY, type TEXT NOT NULL, topic TEXT NOT NULL, tags JSON NOT NULL DEFAULT '[]', difficulty INTEGER NOT NULL DEFAULT 1, prompt TEXT NOT NULL, options JSON, answer TEXT NOT NULL, explanation TEXT NOT NULL DEFAULT '', source TEXT NOT NULL DEFAULT 'self-authored', license TEXT NOT NULL DEFAULT 'CC-BY-SA-4.0', archived INTEGER NOT NULL DEFAULT 0, fail_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS reviews (question_id TEXT PRIMARY KEY REFERENCES questions(id), ease REAL NOT NULL DEFAULT 2.5, interval INTEGER NOT NULL DEFAULT 0, reps INTEGER NOT NULL DEFAULT 0, next_due TEXT NOT NULL, last_grade INTEGER);
    CREATE TABLE IF NOT EXISTS attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, question_id TEXT NOT NULL REFERENCES questions(id), date TEXT NOT NULL, correct INTEGER NOT NULL, grade INTEGER NOT NULL, latency_ms INTEGER NOT NULL DEFAULT 0, session_id TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS feeds (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, url TEXT NOT NULL UNIQUE, topic TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, last_fetch TEXT, last_error TEXT);
    CREATE TABLE IF NOT EXISTS articles (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, source TEXT NOT NULL, url TEXT NOT NULL UNIQUE, summary TEXT NOT NULL DEFAULT '', content_html TEXT, published_at TEXT, topic TEXT NOT NULL, feed_id INTEGER REFERENCES feeds(id), status TEXT NOT NULL DEFAULT 'new', note TEXT NOT NULL DEFAULT '');
    CREATE TABLE IF NOT EXISTS sessions (date TEXT PRIMARY KEY, question_ids JSON NOT NULL DEFAULT '[]', article_ids JSON NOT NULL DEFAULT '[]', started_at TEXT, finished_at TEXT, time_spent_s INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value JSON NOT NULL);
    CREATE INDEX IF NOT EXISTS idx_reviews_due ON reviews(next_due);
    CREATE INDEX IF NOT EXISTS idx_attempts_date ON attempts(date);
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
  `);
  _db = drizzle(sqlite, { schema });
  return _db;
}
