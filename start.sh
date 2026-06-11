#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Migrations done!"

echo "Running seed..."
node prisma/seed.mjs || echo "Seed skipped (may already exist)"

echo "Starting Next.js..."
exec npm start
