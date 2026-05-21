import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LEAGUE_MAPPING = {
  "BRONZE": "BRONZA",
  "SILVER": "KUMUSH",
  "GOLD": "OLTIN",
  "PLATINUM": "PLATINA",
  "DIAMOND": "ALMOS"
};

async function main() {
  console.log("Starting league name migration...");
  
  for (const [oldName, newName] of Object.entries(LEAGUE_MAPPING)) {
    const result = await prisma.user.updateMany({
      where: { league: oldName },
      data: { league: newName }
    });
    console.log(`Updated ${result.count} users from ${oldName} to ${newName}`);
  }
  
  console.log("Migration finished.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
