"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Trophy, Star, Award, Zap, Loader2, Sparkles, Target,
  Sprout, Book, Flame, Crown, ShieldCheck,
} from "lucide-react";
import { PremiumModal } from "@/components/ui/premium-modal";
import { HorizontalScrollRow } from "@/components/ui/horizontal-scroll-row";
import confetti from "canvas-confetti";

const IconMap: Record<string, any> = {
  sprout: Sprout, book: Book, flame: Flame, crown: Crown,
  star: Star, zap: Zap, target: Target, trophy: Trophy,
};

interface Badge {
  id: string; name: string; icon: string; description: string;
  unlocked: boolean; claimed: boolean; rewardXp: number;
}
interface Certificate {
  id: string; issuedAt: string;
  course: { title: string; certificateImage: string | null };
}
interface AchievementsData {
  xp: number; level: number; badges: Badge[];
  totalCourses: number; completedCourses: number;
  certificates: Certificate[];
}

export function AchievementsClient({ initialData }: { initialData: AchievementsData }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    if (!selectedBadge || isClaiming) return;
    setIsClaiming(true);
    try {
      const res = await fetch("/api/student/achievements/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId: selectedBadge.id }),
      });
      const result = await res.json();
      if (result.success) {
        const end = Date.now() + 3000;
        const frame = () => {
          confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#3b82f6", "#10b981", "#f59e0b"] });
          confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#3b82f6", "#10b981", "#f59e0b"] });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
        // Optimistic update
        setData((prev) => ({
          ...prev,
          xp: result.newXp ?? prev.xp,
          badges: prev.badges.map((b) => b.id === selectedBadge.id ? { ...b, claimed: true } : b),
        }));
        setSelectedBadge((prev) => prev ? { ...prev, claimed: true } : null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsClaiming(false);
    }
  };

  const nextLevelXp = data.level * 100;
  const progressToNext = ((data.xp % 100) / 100) * 100;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 md:px-10 space-y-14">
      {/* Certificates */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-900">
            <Crown className="w-7 h-7 text-amber-500" /> Mening sertifikatlarim
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Tasdiqlangan va yakunlangan o'quv natijalari.</p>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 md:p-8">
          {data.certificates.length === 0 ? (
            <div className="py-12 text-center">
              <Crown className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-bold text-slate-400 text-sm">Sertifikatlar hozircha mavjud emas</p>
            </div>
          ) : (
            <HorizontalScrollRow>
              {data.certificates.map((cert) => (
                <div key={cert.id} className="min-w-[260px] sm:min-w-[300px] group bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:border-amber-200 transition-all p-3 snap-center">
                  <div className="aspect-[1.414] bg-slate-50 rounded-xl overflow-hidden relative flex flex-col items-center justify-center p-5 text-center border border-slate-100">
                    {cert.course.certificateImage ? (
                      <img src={cert.course.certificateImage} alt="Certificate" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-900 via-amber-200 to-blue-900" />
                        <Crown className="w-8 h-8 text-amber-600/20 mb-3" />
                        <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3 w-4/5">TUGATGANLIK SERTIFIKATI</h3>
                        <p className="text-[7px] text-slate-400 uppercase tracking-widest mb-1">Topshirildi</p>
                        <h4 className="text-[11px] font-bold text-slate-900 italic">O'quvchi</h4>
                      </>
                    )}
                  </div>
                  <div className="p-4 pb-2">
                    <h4 className="font-black text-sm mb-3 text-slate-900 line-clamp-1">{cert.course.title}</h4>
                    <Button onClick={() => router.push(`/student/certificates/${cert.id}`)}
                      className="w-full rounded-xl h-10 uppercase font-black text-[10px] tracking-widest bg-slate-50 border border-slate-200 text-slate-700 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all">
                      Yuklab olish
                    </Button>
                  </div>
                </div>
              ))}
            </HorizontalScrollRow>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-900">
            <Trophy className="w-7 h-7 text-yellow-500" /> Mening yutuqlarim
          </h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">Sizning o'quv jarayonidagi yutuqlaringiz va tajribangiz.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Progress */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-8 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-100">
                <Zap className="w-10 h-10 text-blue-600" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Darajangiz</p>
              <h2 className="text-7xl font-black mb-6 tracking-tighter text-slate-900">{data.level}</h2>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>XP: {data.xp}</span><span>Keyingi: {nextLevelXp}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${progressToNext}%` }} />
                </div>
                <p className="text-[10px] text-center font-bold text-slate-400 uppercase">{Math.floor(progressToNext)}% yakunlandi</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kurslar</p>
                <h4 className="text-3xl font-black text-slate-900">{data.totalCourses}</h4>
              </div>
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tugatilgan</p>
                <h4 className="text-3xl font-black text-emerald-500">{data.completedCourses}</h4>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 md:p-8 h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black flex items-center gap-2 text-slate-900">
                  <Award className="w-6 h-6 text-amber-500" /> Unvonlar
                </h2>
                <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-widest">
                  {data.badges.filter((b) => b.unlocked).length} / {data.badges.length} erishildi
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.badges.map((badge) => {
                  const Icon = IconMap[badge.icon] || Award;
                  const canClaim = badge.unlocked && !badge.claimed;
                  return (
                    <div key={badge.id} onClick={() => setSelectedBadge(badge)}
                      className={`group p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                        badge.unlocked
                          ? canClaim ? "border-amber-300 bg-amber-50 hover:border-amber-400 shadow-md shadow-amber-100"
                            : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200"
                          : "border-slate-100 bg-slate-50 opacity-50 grayscale hover:opacity-80 hover:grayscale-0"
                      }`}>
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                          badge.unlocked ? canClaim ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-black text-sm mb-1 text-slate-900">{badge.name}</h3>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4 line-clamp-2">{badge.description}</p>
                        {badge.unlocked ? (
                          canClaim ? (
                            <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest">Olish! (+{badge.rewardXp})</div>
                          ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-200">Erishildi</div>
                          )
                        ) : (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">Hali yo'q</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badge Modal */}
      <PremiumModal isOpen={!!selectedBadge} onClose={() => { if (!isClaiming) setSelectedBadge(null); }} title="" description="">
        <div className="space-y-5">
          {selectedBadge?.unlocked ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                {(() => { const Icon = IconMap[selectedBadge.icon] || Award; return <Icon className="w-10 h-10 text-amber-500" />; })()}
              </div>
              <h3 className="text-3xl font-black mb-3 text-white uppercase tracking-tighter">{selectedBadge.name}</h3>
              <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">{selectedBadge.description}</p>
              {!selectedBadge.claimed ? (
                <Button className="w-full h-14 rounded-2xl font-black text-base bg-amber-500 hover:bg-amber-400 text-white border-0" onClick={handleClaim} disabled={isClaiming}>
                  {isClaiming ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5 mr-2" /> Mukofotni Olish</>}
                </Button>
              ) : (
                <Button variant="ghost" className="w-full h-12 rounded-2xl font-black text-xs uppercase text-slate-500" onClick={() => setSelectedBadge(null)}>Yopish</Button>
              )}
            </div>
          ) : (
            <div className="text-center py-5 opacity-60">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="w-8 h-8 text-slate-600" />
              </div>
              <h4 className="font-black text-xl text-white mb-2">{selectedBadge?.name}</h4>
              <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto mb-6">Ushbu yutuqqa hali erishilmagan.</p>
              <Button variant="outline" className="w-full h-12 rounded-2xl font-black text-xs uppercase border-white/10 text-white" onClick={() => setSelectedBadge(null)}>Qaytish</Button>
            </div>
          )}
        </div>
      </PremiumModal>
    </div>
  );
}
