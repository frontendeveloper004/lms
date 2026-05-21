import { requireStudentSession, getRankingData } from "@/lib/data/student";
import { RankingClient } from "./RankingClient";

export default async function RankingPage() {
  const session = await requireStudentSession();
  const data = await getRankingData(session.userId);

  // Serialize and provide defaults for type safety
  const globalTop = data.globalTop.map(u => ({
    ...u,
    xpPoints: u.xpPoints || 0
  }));

  const seasonalTop = data.seasonalTop.map(u => ({
    ...u,
    seasonalXp: u.seasonalXp || 0
  }));

  const weeklyTop = data.weeklyTop.map(u => ({
    ...u,
    weeklyXp: u.weeklyXp || 0
  }));

  const myStats = {
    ...data.myStats,
    id: session.userId,
    xpPoints: data.myStats?.xpPoints || 0,
    seasonalXp: data.myStats?.seasonalXp || 0,
    weeklyXp: data.myStats?.weeklyXp || 0,
    league: data.myStats?.league || "BRONZA",
    globalRank: data.myStats.globalRank,
    seasonalRank: data.myStats.seasonalRank,
    weeklyRank: data.myStats.weeklyRank,
  };

  return (
    <RankingClient 
      globalTop={globalTop} 
      seasonalTop={seasonalTop}
      weeklyTop={weeklyTop}
      myStats={myStats} 
    />
  );
}
