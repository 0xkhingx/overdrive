import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["mcq", "flip"] }).notNull(),
  topic: text("topic", { enum: ["swe", "ml"] }).notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),
  difficulty: integer("difficulty").notNull().default(1),
  prompt: text("prompt").notNull(),
  options: text("options", { mode: "json" }).$type<string[] | null>(),
  answer: text("answer").notNull(),
  explanation: text("explanation").notNull().default(""),
  source: text("source").notNull().default("self-authored"),
  license: text("license").notNull().default("CC-BY-SA-4.0"),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  failCount: integer("fail_count").notNull().default(0),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const reviews = sqliteTable("reviews", {
  questionId: text("question_id").primaryKey().references(() => questions.id),
  ease: real("ease").notNull().default(2.5),
  interval: integer("interval").notNull().default(0),
  reps: integer("reps").notNull().default(0),
  nextDue: text("next_due").notNull().$defaultFn(() => new Date().toISOString().slice(0, 10)),
  lastGrade: integer("last_grade"),
});

export const attempts = sqliteTable("attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questionId: text("question_id").notNull().references(() => questions.id),
  date: text("date").notNull(),
  correct: integer("correct", { mode: "boolean" }).notNull(),
  grade: integer("grade").notNull(),
  latencyMs: integer("latency_ms").notNull().default(0),
  sessionId: text("session_id").notNull(),
});

export const feeds = sqliteTable("feeds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  topic: text("topic", { enum: ["swe", "ml"] }).notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  lastFetch: text("last_fetch"),
  lastError: text("last_error"),
});

export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  source: text("source").notNull(),
  url: text("url").notNull().unique(),
  summary: text("summary").notNull().default(""),
  contentHtml: text("content_html"),
  publishedAt: text("published_at"),
  topic: text("topic", { enum: ["swe", "ml"] }).notNull(),
  feedId: integer("feed_id").references(() => feeds.id),
  status: text("status", { enum: ["new", "read", "skipped", "saved"] }).notNull().default("new"),
  note: text("note").notNull().default(""),
});

export const sessions = sqliteTable("sessions", {
  date: text("date").primaryKey(),
  questionIds: text("question_ids", { mode: "json" }).$type<string[]>().notNull().default([]),
  articleIds: text("article_ids", { mode: "json" }).$type<number[]>().notNull().default([]),
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
  timeSpentS: integer("time_spent_s").notNull().default(0),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).$type<unknown>().notNull(),
});
