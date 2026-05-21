/**
 * Prisma seed — admin user va asosiy kategoriyalarni yaratadi
 * Ishlatish: npx ts-node prisma/seed.ts
 * yoki: node -e "require('./prisma/seed.js')"
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminEmail = "saydullaxonovhasanxonn@gmail.com";
  const adminPassword = "admin123";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log(`✅ Admin already exists: ${adminEmail}`);
  } else {
    const passwordHash = await hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        claimedBadges: "[]",
      },
    });
    console.log(`✅ Admin created: ${adminEmail}`);
  }

  // ── Default categories ────────────────────────────────────────────────────
  const categories = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Design",
    "DevOps",
    "Cybersecurity",
    "Game Development",
    "Artificial Intelligence",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✅ ${categories.length} categories upserted`);

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
