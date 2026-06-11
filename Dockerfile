FROM node:20-alpine

WORKDIR /app

# Copy package.json AND prisma schema before npm install
COPY package.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps

# Copy the rest of the source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js — pass dummy env vars so validation passes at build time
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    JWT_SECRET="dummy-secret-for-build-only-32chars" \
    UPSTASH_REDIS_REST_URL="https://dummy.upstash.io" \
    UPSTASH_REDIS_REST_TOKEN="dummy-token" \
    npm run build

EXPOSE 3000

# Use db push instead of migrate deploy — more reliable for fresh databases
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node prisma/seed.mjs && npm start"]
