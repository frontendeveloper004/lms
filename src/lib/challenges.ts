import prisma from "@/lib/prisma";
import { awardRankingXp } from "./ranking-system";

/**
 * Tracks student activity and updates relevant weekly challenges.
 * @param userId - The student's ID
 * @param type - The type of activity ("LESSONS", "QUIZZES", "XP")
 * @param count - How much to increment the progress
 */
export async function trackActivity(userId: string, type: "LESSONS" | "QUIZZES" | "XP", count: number = 1) {
  const now = new Date();

  // Find active challenges for this period and type
  const activeChallenges = await prisma.weeklyChallenge.findMany({
    where: {
      startsAt: { lte: now },
      endsAt: { gte: now },
      targetType: type,
    },
  });

  for (const challenge of activeChallenges) {
    // Upsert progress
    const progress = await prisma.userChallengeProgress.upsert({
      where: {
        userId_challengeId: {
          userId,
          challengeId: challenge.id,
        },
      },
      update: {
        currentCount: { increment: count },
      },
      create: {
        userId,
        challengeId: challenge.id,
        currentCount: count,
      },
    });

    // Check if just completed
    if (!progress.isCompleted && progress.currentCount + count >= challenge.targetCount) {
      // Mark as completed and award XP
      await prisma.userChallengeProgress.update({
        where: { id: progress.id },
        data: { isCompleted: true },
      });

      // Award bonus XP via the ranking system (centralized)
      await awardRankingXp(userId, challenge.rewardXp);
      
      // Optionally: Trigger notification here
    }
  }
}

/**
 * Ensures some default challenges exist for the current week if none are found.
 * This can be called from a dashboard or cron job.
 */
export async function seedWeeklyChallenges() {
  const now = new Date();
  const existing = await prisma.weeklyChallenge.count({
    where: {
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
  });

  if (existing === 0) {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    await prisma.weeklyChallenge.createMany({
      data: [
        {
          title: "Haftalik darslar",
          description: "Bu hafta 5 ta darsni yakunlang",
          rewardXp: 300,
          targetType: "LESSONS",
          targetCount: 5,
          startsAt: startOfWeek,
          endsAt: endOfWeek,
        },
        {
          title: "Testlar ustasi",
          description: "3 ta testni (quiz) muvaffaqiyatli topshiring",
          rewardXp: 200,
          targetType: "QUIZZES",
          targetCount: 3,
          startsAt: startOfWeek,
          endsAt: endOfWeek,
        },
        {
          title: "XP to'plovchi",
          description: "Bu hafta 500 XP to'plang",
          rewardXp: 500,
          targetType: "XP",
          targetCount: 500,
          startsAt: startOfWeek,
          endsAt: endOfWeek,
        },
      ],
    });
  }
}

export async function getStudentChallenges(userId: string) {
  const now = new Date();
  const challenges = await prisma.weeklyChallenge.findMany({
    where: {
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    include: {
      userProgress: {
        where: { userId },
      },
    },
  });

  return challenges.map((c: any) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    rewardXp: c.rewardXp,
    targetCount: c.targetCount,
    currentCount: c.userProgress[0]?.currentCount || 0,
    isCompleted: c.userProgress[0]?.isCompleted || false,
  }));
}
