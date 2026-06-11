FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    JWT_SECRET="dummy-secret-for-build-only-32chars" \
    UPSTASH_REDIS_REST_URL="https://dummy.upstash.io" \
    UPSTASH_REDIS_REST_TOKEN="dummy-token" \
    npm run build

RUN chmod +x start.sh

EXPOSE 3000

CMD ["sh", "start.sh"]
