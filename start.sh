#!/bin/sh

echo "=== Starting LMS ==="
echo "DATABASE_URL is set: $([ -n "$DATABASE_URL" ] && echo YES || echo NO)"

echo "=== Running Prisma migrate deploy ==="
npx prisma migrate deploy
MIGRATE_EXIT=$?
echo "=== migrate deploy exit code: $MIGRATE_EXIT ==="

if [ $MIGRATE_EXIT -ne 0 ]; then
  echo "=== migrate failed, trying db push ==="
  npx prisma db push --accept-data-loss
fi

echo "=== Running seed ==="
node prisma/seed.mjs || echo "=== Seed failed, continuing anyway ==="

echo "=== Starting Next.js app ==="
exec npm start
