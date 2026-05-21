import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { badgeId } = body;

    if (!badgeId) {
       return NextResponse.json({ error: "Badge ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { xpPoints: true, claimedBadges: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: session.userId },
      select: { progress: true }
    });

    const completedLessonsCount = await prisma.completedLesson.count({
      where: { userId: session.userId }
    });

    const completedCourses = enrollments.filter((e: { progress: number }) => e.progress >= 100).length;
    const totalXp = user.xpPoints || 0;

    const allBadges = [
      { id: 'newbie', unlocked: enrollments.length > 0, rewardXp: 150 },
      { id: 'first_lesson', unlocked: completedLessonsCount >= 1, rewardXp: 100 },
      { id: 'collector', unlocked: enrollments.length >= 3, rewardXp: 200 },
      { id: 'learner_10', unlocked: completedLessonsCount >= 10, rewardXp: 300 },
      { id: 'scholar', unlocked: completedCourses > 0, rewardXp: 500 },
      { id: 'researcher_50', unlocked: completedLessonsCount >= 50, rewardXp: 1000 },
      { id: 'expert', unlocked: totalXp >= 2000, rewardXp: 1500 },
      { id: 'master', unlocked: totalXp >= 5000, rewardXp: 2500 }
    ];

    const badge = allBadges.find(b => b.id === badgeId);

    if (!badge) {
      return NextResponse.json({ error: "Badge not found" }, { status: 404 });
    }

    if (!badge.unlocked) {
      return NextResponse.json({ error: "Badge not unlocked yet" }, { status: 400 });
    }

    let claimedBadgesArr: string[] = [];
    try {
      const parsed = JSON.parse(user.claimedBadges as string);
      claimedBadgesArr = Array.isArray(parsed) ? parsed : [];
    } catch { claimedBadgesArr = []; }

    if (claimedBadgesArr.includes(badgeId)) {
       return NextResponse.json({ error: "Badge already claimed" }, { status: 400 });
    }

    // Add to claimed
    claimedBadgesArr.push(badgeId);

    // Update user
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        claimedBadges: JSON.stringify(claimedBadgesArr),
        xpPoints: { increment: badge.rewardXp }
      }
    });

    return NextResponse.json({ 
       success: true, 
       rewardXp: badge.rewardXp,
       newTotalXp: totalXp + badge.rewardXp 
    });

  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
