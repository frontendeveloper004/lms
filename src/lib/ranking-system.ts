import prisma from "@/lib/prisma";

export const LEAGUE_LEVELS = [
  { name: "BRONZA", minXp: 0, nextLeagueXp: 500 },
  { name: "KUMUSH", minXp: 500, nextLeagueXp: 1500 },
  { name: "OLTIN", minXp: 1500, nextLeagueXp: 3500 },
  { name: "PLATINA", minXp: 3500, nextLeagueXp: 7500 },
  { name: "ALMOS", minXp: 7500, nextLeagueXp: -1 }, // Max league
];

/**
 * Finds or creates the current active season.
 * Seasons are created monthly.
 */
export async function getCurrentSeason() {
  const now = new Date();
  let season = await prisma.season.findFirst({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
      isActive: true,
    },
  });

  if (!season) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const monthName = startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    season = await prisma.season.create({
      data: {
        name: monthName,
        startDate: startOfMonth,
        endDate: endOfMonth,
        isActive: true,
      },
    });
  }

  return season;
}

/**
 * Awards XP to a user, handling weekly/monthly XP resets, streaks, and league progression.
 */
export async function awardRankingXp(userId: string, amount: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      lastActiveAt: true, 
      streak: true, 
      seasonalXp: true, 
      weeklyXp: true,
      xpPoints: true, 
      league: true,
      lastWeeklyReset: true,
      lastMonthlyReset: true
    }
  });

  if (!user) return null;

  const now = new Date();
  let streak = user.streak;
  const lastActive = user.lastActiveAt;
  
  // Streak logic
  if (lastActive) {
    const lastActiveDay = new Date(lastActive).setHours(0, 0, 0, 0);
    const today = new Date(now).setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastActiveDay) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays > 1) {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  // Determine resets
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfThisMonth.setHours(0, 0, 0, 0);

  const needsWeeklyReset = !user.lastWeeklyReset || new Date(user.lastWeeklyReset) < startOfThisWeek;
  const needsMonthlyReset = !user.lastMonthlyReset || new Date(user.lastMonthlyReset) < startOfThisMonth;

  // Streak Multiplier: +2% per day, max +30%
  const multiplier = 1 + Math.min(streak * 0.02, 0.3);
  const finalAmount = Math.round(amount * multiplier);

  // Update logic: reset if needed, then increment
  const updateData: any = {
    xpPoints: { increment: finalAmount },
    streak: streak,
    lastActiveAt: now,
  };

  if (needsWeeklyReset) {
    updateData.weeklyXp = finalAmount;
    updateData.lastWeeklyReset = now;
  } else {
    updateData.weeklyXp = { increment: finalAmount };
  }

  if (needsMonthlyReset) {
    updateData.seasonalXp = finalAmount; // We use seasonalXp for monthly
    updateData.lastMonthlyReset = now;
  } else {
    updateData.seasonalXp = { increment: finalAmount };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  // Handle League Progression (based on monthly XP)
  const leagueInfo = await updateLeagueInfo(userId, updatedUser.seasonalXp);

  return { 
    finalAmount, 
    streak, 
    totalXp: updatedUser.xpPoints,
    weeklyXp: updatedUser.weeklyXp,
    monthlyXp: updatedUser.seasonalXp,
    league: leagueInfo.currentLeague
  };
}

/**
 * Updates a user's league based on their seasonal XP.
 */
export async function updateLeagueInfo(userId: string, seasonalXp: number) {
  let currentLeague = "BRONZA";
  let nextLeagueXp = 500;

  for (let i = LEAGUE_LEVELS.length - 1; i >= 0; i--) {
    if (seasonalXp >= LEAGUE_LEVELS[i].minXp) {
      currentLeague = LEAGUE_LEVELS[i].name;
      nextLeagueXp = LEAGUE_LEVELS[i].nextLeagueXp;
      break;
    }
  }

  const pointsToNext = nextLeagueXp === -1 ? 0 : Math.max(0, nextLeagueXp - seasonalXp);

  await prisma.user.update({
    where: { id: userId },
    data: {
      league: currentLeague,
      pointsToNextLeague: pointsToNext
    }
  });

  return { currentLeague, pointsToNext };
}
