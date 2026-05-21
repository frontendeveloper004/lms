import Link from "next/link";
import { ArrowLeft, Zap, Trophy, Star, Target, TrendingUp, Award, Shield, Flame } from "lucide-react";

const xpLevels = [
  { level: 1, name: "Yangi boshlovchi", xp: "0 – 500 XP", color: "bg-slate-100 text-slate-600", badge: "🌱" },
  { level: 2, name: "O'rganuvchi", xp: "500 – 1,500 XP", color: "bg-blue-100 text-blue-700", badge: "📚" },
  { level: 3, name: "Rivojlanuvchi", xp: "1,500 – 3,000 XP", color: "bg-violet-100 text-violet-700", badge: "⚡" },
  { level: 4, name: "Malakali", xp: "3,000 – 6,000 XP", color: "bg-amber-100 text-amber-700", badge: "🏆" },
  { level: 5, name: "Ekspert", xp: "6,000 – 10,000 XP", color: "bg-emerald-100 text-emerald-700", badge: "🎯" },
  { level: 6, name: "Master", xp: "10,000+ XP", color: "bg-red-100 text-red-700", badge: "👑" },
];

const achievements = [
  { icon: "🎓", title: "Birinchi kurs", desc: "Birinchi kursni muvaffaqiyatli tugatish", xp: "+200 XP" },
  { icon: "🔥", title: "7 kunlik streak", desc: "7 kun ketma-ket o'rganish", xp: "+150 XP" },
  { icon: "⚡", title: "Tez o'rganuvchi", desc: "Kursni 3 kunda tugatish", xp: "+300 XP" },
  { icon: "🏆", title: "Test ustasi", desc: "10 ta testni 100% natija bilan topshirish", xp: "+500 XP" },
  { icon: "📚", title: "Bilim izlovchi", desc: "5 ta turli kategoriyadan kurs tugatish", xp: "+400 XP" },
  { icon: "👑", title: "LearnEdu Legend", desc: "10,000 XP yig'ish", xp: "Maxsus unvon" },
];

const howToEarn = [
  { icon: Award, color: "text-blue-600", bg: "bg-blue-50", title: "Kurs tugatish", desc: "Har bir kursni tugatganda kurs uchun belgilangan XP ballar beriladi." },
  { icon: Target, color: "text-emerald-600", bg: "bg-emerald-50", title: "Test topshirish", desc: "Har bir modul testini muvaffaqiyatli topshirganda qo'shimcha XP olasiz." },
  { icon: Flame, color: "text-orange-600", bg: "bg-orange-50", title: "Kunlik streak", desc: "Har kuni platformaga kirib o'rganishni davom ettirsangiz streak bonuslari beriladi." },
  { icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", title: "Yutuqlar", desc: "Maxsus yutuqlarni qo'lga kiritib qo'shimcha XP va unvonlar oling." },
];

export default function AchievementsInfoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-4xl px-4 md:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 font-medium transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-3xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Yutuqlar & XP Tizimi</h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
            LearnEdu da o'rganish qiziqarli! XP ballar yig'ing, darajalar oshiring
            va maxsus yutuqlarni qo'lga kiriting.
          </p>
        </div>

        {/* XP Levels */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">XP Darajalari</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {xpLevels.map((lvl) => (
              <div key={lvl.level} className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all text-center">
                <div className="text-3xl mb-3">{lvl.badge}</div>
                <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${lvl.color}`}>
                  Daraja {lvl.level}
                </div>
                <p className="font-black text-slate-900 text-sm mb-1">{lvl.name}</p>
                <p className="text-xs text-slate-400 font-medium">{lvl.xp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How to earn */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">XP qanday yig'iladi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {howToEarn.map((item) => (
              <div key={item.title} className="flex gap-4 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                <div className={`w-11 h-11 rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Maxsus Yutuqlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((a) => (
              <div key={a.title} className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all">
                <div className="text-3xl shrink-0">{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 text-sm">{a.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">{a.desc}</p>
                </div>
                <span className="text-xs font-black text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full shrink-0">
                  {a.xp}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-100">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-black text-slate-900 mb-3">XP yig'ishni boshlang!</h3>
          <p className="text-slate-500 font-medium mb-6 text-sm">Birinchi kursga yoziling va o'rganish sayohatingizni boshlang</p>
          <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-all shadow-sm shadow-violet-200">
            Kurslarni ko'rish <Zap className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
