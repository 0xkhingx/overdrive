# Daily Learning Platform (SWE + ML)

Self-hosted daily quiz + reads with SM-2 spaced repetition. No API keys, no accounts. Next.js + SQLite.

## Quick start (laptop)

```bash
npm install
npm run seed        # 60 starter questions (30 SWE / 30 ML) + 5 default feeds
npm run dev         # http://localhost:3000
```

Daily loop: **Today → Start 15-min session → Reads → Stats**.

## Data & backup

- SQLite file: `./data/app.db` (or `$DB_PATH`). Settings → Export downloads full JSON.
- Backup: `bash scripts/backup.sh` (copies `data/app.db` to `backups/` with date stamp). Add to cron daily.
- Docker: `docker build -t dlp .; docker run -p 3000:3000 -v dlp-data:/data dlp`

## Feeds

Reads → **Fetch feeds now**, or POST `/api/feeds/fetch`. Add feeds directly in the `feeds` table (v1). Each feed fails independently; errors show per-feed.

## Import questions

POST `/api/questions` with JSON array (validated w/ Zod, duplicates by `id` reported):

```json
[{"id":"swe-example","type":"mcq","topic":"swe","prompt":"…","options":["a","b"],"answer":"a","explanation":"…","source":"…","license":"CC-BY-SA-4.0"}]
```

## Tests

```bash
node node_modules/vitest/dist/cli.js run lib/srs.test.ts lib/session.test.ts
```
