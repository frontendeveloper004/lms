"use client";

import { useState, Suspense } from "react";
import { Trophy, Zap, Crown, User, ArrowUp, Medal, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const UserCardWrapper = ({ userId, currentUserId, children, className }: { userId: string, currentUserId: string, children: React.ReactNode, className?: string }) => {
  if (userId === currentUserId) {
    return <div className={className}>{children}</div>;
  }
  return <Link href={`/students/${userId}?from=/student/ranking`} className={`${className} cursor-pointer`}>{children}</Link>;
};

interface RankingUser {
  id: string;
  name: string;
  avatar: string | null;
  xpPoints?: number;
  seasonalXp?: number;
  weeklyXp?: number;
  league: string;
}

interface Props {
  globalTop: RankingUser[];
  seasonalTop: RankingUser[];
  weeklyTop: RankingUser[];
  myStats: {
    id: string;
    name?: string;
    xpPoints?: number;
    seasonalXp?: number;
    weeklyXp?: number;
    league?: string;
    globalRank: number;
    seasonalRank: number;
    weeklyRank: number;
  };
}

export function RankingClient({ globalTop, seasonalTop, weeklyTop, myStats }: Props) {
  const [tab, setTab] = useState<"global" | "seasonal" | "weekly">("weekly");

  const currentList = tab === "global" 
    ? globalTop 
    : (tab === "seasonal" ? seasonalTop : weeklyTop);

  const myRank = tab === "global" 
    ? myStats.globalRank 
    : (tab === "seasonal" ? myStats.seasonalRank : myStats.weeklyRank);

  const myXp = tab === "global" 
    ? myStats.xpPoints 
    : (tab === "seasonal" ? myStats.seasonalXp : myStats.weeklyXp);

  const top3 = currentList.slice(0, 3);
  const rest = currentList.slice(3);

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10">
      <Suspense fallback={null}>
        <BackButton />
      </Suspense>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-50 border border-amber-100 mb-4">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reyting</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Barcha o'quvchilar orasida o'z o'rningizni ko'ring.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-10 max-w-lg mx-auto flex-wrap sm:flex-nowrap">
        <button
          onClick={() => setTab("weekly")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === "weekly" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Zap className="w-3.5 h-3.5" /> Haftalik
        </button>
        <button
          onClick={() => setTab("seasonal")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === "seasonal" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Zap className="w-3.5 h-3.5" /> Oylik
        </button>
        <button
          onClick={() => setTab("global")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === "global" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Star className="w-3.5 h-3.5" /> Umumiy
        </button>
      </div>

      {/* My Rank Summary (Always show for current tabs) */}
      {true && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-12 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <Trophy className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                 <h2 className="text-3xl font-black">#{myRank}</h2>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Mening o'rnim</p>
                <h3 className="text-xl font-bold">{myStats.name}</h3>
              </div>
            </div>
            <div className="flex gap-4">
               <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-70">Ochko</p>
                  <p className="text-lg font-black">{myXp} XP</p>
               </div>
               <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-70">Liga</p>
                  <p className="text-lg font-black">{myStats.league}</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Podium for Top 3 */}
      <div className="grid grid-cols-3 gap-4 items-end mb-12 px-2 h-64 md:h-72">
        {/* 2nd Place */}
        {top3[1] && (
          <UserCardWrapper userId={top3[1].id} currentUserId={myStats.id} className="flex flex-col items-center">
            <div className="relative mb-3 group">
               <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-slate-200 ${top3[1].id !== myStats.id ? "group-hover:border-blue-400" : ""} transition-colors bg-white`}>
                  {top3[1].avatar ? <img src={top3[1].avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><User className="text-slate-300" /></div>}
               </div>
               <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center border-2 border-white text-slate-600 font-bold text-xs ring-1 ring-slate-100">2</div>
            </div>
            <p className="text-[10px] font-bold text-slate-800 text-center line-clamp-1 mb-1">{top3[1].name}</p>
             <p className="text-[9px] font-black text-blue-600 uppercase tracking-tight">
                {tab === "global" ? (top3[1].xpPoints || 0) : (tab === "weekly" ? (top3[1].weeklyXp || 0) : (top3[1].seasonalXp || 0))} XP
             </p>
            <div className="w-full bg-slate-100 h-24 rounded-t-xl mt-4 flex flex-col items-center pt-2">
               <div className="w-4/5 h-1 bg-white/50 rounded-full mb-1" />
            </div>
          </UserCardWrapper>
        )}

        {/* 1st Place */}
        {top3[0] && (
          <UserCardWrapper userId={top3[0].id} currentUserId={myStats.id} className="flex flex-col items-center">
            <div className="relative mb-4 group">
               <Crown className="w-8 h-8 text-amber-500 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" />
               <div className={`w-20 h-20 md:w-28 md:h-28 rounded-3xl overflow-hidden border-4 border-amber-400 ${top3[0].id !== myStats.id ? "group-hover:scale-105" : ""} transition-transform shadow-lg bg-white`}>
                  {top3[0].avatar ? <img src={top3[0].avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-50 flex items-center justify-center"><User className="w-8 h-8 text-amber-200" /></div>}
               </div>
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center border-4 border-white text-white font-black text-sm shadow-md ring-1 ring-amber-100">1</div>
            </div>
            <p className="text-xs md:text-sm font-black text-slate-900 text-center line-clamp-1 mb-1">{top3[0].name}</p>
             <p className="text-[10px] font-black text-amber-600 uppercase tracking-wide">
                {tab === "global" ? (top3[0].xpPoints || 0) : (tab === "weekly" ? (top3[0].weeklyXp || 0) : (top3[0].seasonalXp || 0))} XP
             </p>
            <div className="w-full bg-gradient-to-b from-amber-200 to-amber-50 h-32 md:h-40 rounded-t-2xl mt-4 shadow-sm border-x border-t border-amber-100 flex flex-col items-center pt-4">
               <div className="w-3/4 h-1.5 bg-white/40 rounded-full mb-2" />
               <div className="w-1/2 h-1.5 bg-white/40 rounded-full mb-2" />
            </div>
          </UserCardWrapper>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <UserCardWrapper userId={top3[2].id} currentUserId={myStats.id} className="flex flex-col items-center">
            <div className="relative mb-3 group">
               <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 border-orange-200 ${top3[2].id !== myStats.id ? "group-hover:border-orange-400" : ""} transition-colors bg-white`}>
                  {top3[2].avatar ? <img src={top3[2].avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><User className="text-slate-300" /></div>}
               </div>
               <div className="absolute -bottom-2 -left-2 w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center border-2 border-white text-orange-600 font-bold text-xs ring-1 ring-orange-50">3</div>
            </div>
            <p className="text-[10px] font-bold text-slate-800 text-center line-clamp-1 mb-1">{top3[2].name}</p>
             <p className="text-[9px] font-black text-orange-600 uppercase tracking-tight">
                {tab === "global" ? (top3[2].xpPoints || 0) : (tab === "weekly" ? (top3[2].weeklyXp || 0) : (top3[2].seasonalXp || 0))} XP
             </p>
            <div className="w-full bg-slate-50 h-16 rounded-t-xl mt-4 flex flex-col items-center pt-2">
               <div className="w-4/5 h-1 bg-white/50 rounded-full mb-1" />
            </div>
          </UserCardWrapper>
        )}
      </div>

      {/* List for the rest */}
      <div className="space-y-3">
        {rest.map((user, idx) => (
          <UserCardWrapper key={user.id} userId={user.id} currentUserId={myStats.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${user.id !== myStats.id ? "hover:shadow-sm" : ""} ${user.id === myStats.id ? "bg-blue-50/30 border-blue-100 ring-1 ring-blue-50" : "bg-white border-slate-100"}`}>
             <div className="w-8 text-center text-sm font-black text-slate-400">
                {idx + 4}
             </div>
             <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-4 h-4 text-slate-200" /></div>}
             </div>
             <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate flex items-center gap-2">
                   {user.name}
                   {user.id === myStats.id && <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-600 text-[8px] font-black uppercase">Siz</span>}
                </h4>
                <div className="flex items-center gap-3 mt-0.5">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.league}</p>
                </div>
             </div>
             <div className="text-right shrink-0">
                <p className="text-sm font-black text-slate-900">
                    {tab === "global" ? (user.xpPoints || 0) : (tab === "weekly" ? (user.weeklyXp || 0) : (user.seasonalXp || 0))} XP
                </p>
                <div className="flex items-center justify-end gap-1 text-[8px] font-bold text-emerald-500">
                   <ArrowUp className="w-2.5 h-2.5" /> <span>Faol</span>
                </div>
             </div>
          </UserCardWrapper>
        ))}
      </div>

      {/* Empty State */}
      {currentList.length === 0 && (
        <div className="py-20 text-center">
           <Medal className="w-12 h-12 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-medium tracking-tight">Hozircha ma'lumotlar yo'q</p>
        </div>
      )}
    </div>
  );
}

function BackButton() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/student";

  return (
    <Link href={from} 
      className="inline-flex items-center gap-2 text-xs font-black text-white bg-slate-800 hover:bg-slate-900 px-3 py-2 rounded-xl transition-all hover:-translate-x-0.5 mb-6"
    >
      <ArrowLeft className="w-3.5 h-3.5" /> Ortga
    </Link>
  );
}
