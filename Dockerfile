FROM node:20-alpine

WORKDIR /app

# Copy package.json AND prisma schema before npm install
# so that postinstall (prisma generate) can find the schema
COPY package.json ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps

# Copy the rest of the source
COPY . .

# Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.mjs && npm start"]
