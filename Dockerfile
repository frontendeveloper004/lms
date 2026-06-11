FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma/

RUN cp prisma/schema.production.prisma prisma/schema.prisma

RUN npm install --legacy-peer-deps

COPY . .

RUN cp prisma/schema.production.prisma prisma/schema.prisma

RUN npx prisma generate

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    JWT_SECRET="dummy-secret-for-build-only-32chars" \
    UPSTASH_REDIS_REST_URL="https://dummy.upstash.io" \
    UPSTASH_REDIS_REST_TOKEN="dummy-token" \
    npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
