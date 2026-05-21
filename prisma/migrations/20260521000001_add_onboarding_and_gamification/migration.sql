-- Migration: add_onboarding_and_gamification
-- Faqat yangi ustunlar va jadvallar qo'shiladi. Hech narsa o'chirilmaydi.

-- ── User jadvaliga yangi ustunlar ─────────────────────────────────────────────

ALTER TABLE "User" ADD COLUMN "subjectType" TEXT DEFAULT 'PROGRAMMING';
ALTER TABLE "User" ADD COLUMN "weeklyXp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "seasonalXp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastWeeklyReset" DATETIME;
ALTER TABLE "User" ADD COLUMN "lastMonthlyReset" DATETIME;
ALTER TABLE "User" ADD COLUMN "league" TEXT NOT NULL DEFAULT 'BRONZA';
ALTER TABLE "User" ADD COLUMN "streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastActiveAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "highestLeague" TEXT DEFAULT 'BRONZA';
ALTER TABLE "User" ADD COLUMN "pointsToNextLeague" INTEGER NOT NULL DEFAULT 500;
ALTER TABLE "User" ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- ── AssignmentSubmission jadvaliga yangi ustun ────────────────────────────────

ALTER TABLE "AssignmentSubmission" ADD COLUMN "aiBreakdown" TEXT;

-- ── EnglishTeacherProfile jadvali ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "EnglishTeacherProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "teachingExperience" TEXT,
    "languages" TEXT,
    "availability" TEXT,
    "lessonFormat" TEXT,
    "universityDegree" TEXT,
    "teachingMaterials" TEXT,
    "studentResults" TEXT,
    "lessonPrice" REAL,
    "ieltsScore" REAL,
    "hasTesolTefl" BOOLEAN NOT NULL DEFAULT false,
    "hasTrialLesson" BOOLEAN NOT NULL DEFAULT false,
    "whatsappUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnglishTeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "EnglishTeacherProfile_userId_key" ON "EnglishTeacherProfile"("userId");

-- ── Season jadvali ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Season" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── SeasonWinner jadvali ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "SeasonWinner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rank" INTEGER NOT NULL,
    "xpPoints" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    CONSTRAINT "SeasonWinner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SeasonWinner_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "SeasonWinner_userId_seasonId_key" ON "SeasonWinner"("userId", "seasonId");
CREATE INDEX IF NOT EXISTS "SeasonWinner_userId_idx" ON "SeasonWinner"("userId");
CREATE INDEX IF NOT EXISTS "SeasonWinner_seasonId_idx" ON "SeasonWinner"("seasonId");

-- ── WeeklyChallenge jadvali ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "WeeklyChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rewardXp" INTEGER NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetCount" INTEGER NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── UserChallengeProgress jadvali ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "UserChallengeProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserChallengeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserChallengeProgress_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "WeeklyChallenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserChallengeProgress_userId_challengeId_key" ON "UserChallengeProgress"("userId", "challengeId");
CREATE INDEX IF NOT EXISTS "UserChallengeProgress_userId_idx" ON "UserChallengeProgress"("userId");
CREATE INDEX IF NOT EXISTS "UserChallengeProgress_challengeId_idx" ON "UserChallengeProgress"("challengeId");

-- ── UserOnlineStatus jadvali ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "UserOnlineStatus" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserOnlineStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "UserOnlineStatus_isOnline_idx" ON "UserOnlineStatus"("isOnline");
