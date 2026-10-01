#!/usr/bin/env bash
# Daily SQLite backup. Cron example: 0 2 * * * /path/to/daily-learning-platform/scripts/backup.sh
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$DIR/backups"
cp "$DIR/data/app.db" "$DIR/backups/app-$(date +%F).db"
ls -t "$DIR"/backups/app-*.db | tail -n +15 | xargs -r rm --
echo "Backed up to $DIR/backups/app-$(date +%F).db"
