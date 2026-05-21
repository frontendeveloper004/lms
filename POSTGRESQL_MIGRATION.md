# PostgreSQL Migration Guide

## 1. PostgreSQL o'rnatish

### Local development uchun:
- **Windows**: [PostgreSQL installer](https://www.postgresql.org/download/windows/) yuklab o'rnating
- **yoki Docker**: `docker run --name lms-pg -e POSTGRES_PASSWORD=password -e POSTGRES_DB=lms_uz -p 5432:5432 -d postgres:16`

### Production uchun (tavsiya):
- **[Neon.tech](https://neon.tech)** — bepul tier, serverless PostgreSQL
- **[Supabase](https://supabase.com)** — bepul tier, PostgreSQL + extras

---

## 2. .env faylini yangilash

`.env` faylida `DATABASE_URL` ni o'zgartiring:

```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/lms_uz?schema=public"

# Neon.tech
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/lms_uz?sslmode=require"

# Supabase
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

---

## 3. Migration yaratish va ishlatish

```bash
# Yangi migration yaratish (SQLite migration'larini o'chirish kerak emas)
npx prisma migrate dev --name init_postgresql

# yoki production uchun:
npx prisma migrate deploy
```

---

## 4. Eski SQLite migration'lari haqida

`prisma/migrations/` papkasidagi eski migration'lar PostgreSQL bilan ishlamaydi.
Yangi migration yaratilganda Prisma ularni avtomatik boshqaradi.

Agar xato chiqsa:
```bash
# Migration history'ni reset qilish (faqat dev uchun!)
npx prisma migrate reset
```

---

## 5. Ma'lumotlarni ko'chirish (agar kerak bo'lsa)

SQLite'dan PostgreSQL'ga ma'lumot ko'chirish uchun:

```bash
# SQLite'dan export
node -e "
const { PrismaClient } = require('@prisma/client');
// ... export script
"
```

Yoki pgloader ishlatish mumkin.

---

## 6. Tekshirish

```bash
# Prisma Studio orqali ma'lumotlarni ko'rish
npx prisma studio
```
