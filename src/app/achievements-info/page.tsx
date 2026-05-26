"use client";

import Link from "next/link";
import { ArrowLeft, Zap, Trophy, Star, Target, TrendingUp, Award, Shield, Flame } from "lucide-react";
import { motion } from "framer-motion";

const xpLevels = [
  { level: 1, name: "Yangi boshlovchi", xp: "0 – 500 XP", color: "bg-slate-100 text-slate-600 border-slate-200", badge: "🌱" },
  { level: 2, name: "O'rganuvchi", xp: "500 – 1,500 XP", color: "bg-blue-100 text-blue-700 border-blue-200", badge: "📚" },
  { level: 3, name: "Rivojlanuvchi", xp: "1,500 – 3,000 XP", color: "bg-indigo-100 text-indigo-700 border-indigo-200", badge: "⚡" },
  { level: 4, name: "Malakali", xp: "3,000 – 6,000 XP", color: "bg-amber-100 text-amber-700 border-amber-200", badge: "🏆" },
  { level: 5, name: "Ekspert", xp: "6,000 – 10,000 XP", color: "bg-emerald-100 text-emerald-700 border-emerald-200", badge: "🎯" },
  { level: 6, name: "Master", xp: "10,000+ XP", color: "bg-red-100 text-red-700 border-red-200", badge: "👑" },
];

const achievements = [
  { icon: "🎓", title: "Birinchi kurs", desc: "Birinchi kursni muvaffaqiyatli tugatish", xp: "+200 XP" },
  { icon: "🔥", title: "7 kunlik streak", desc: "7 kun ketma-ket o'rganish", xp: "+150 XP" },
  { icon: "⚡", title: "Tez o'rganuvchi", desc: "Kursni 3 kunda tugatish", xp: "+300 XP" },
  { icon: "🏆", title: "Test ustasi", desc: "10 ta testni 100% natija bilan topshirish", xp: "+500 XP" },
  { icon: "📚", title: "Bilim izlovchi", desc: "5 ta turli kategoriyadan kurs tugatish", xp: "+400 XP" },
  { icon: "👑", title: "Ai.Dargoh Legend", desc: "10,000 XP yig'ish", xp: "Maxsus unvon" },
];

const howToEarn = [
  { icon: Award, color: "text-[#16a34a]", bg: "bg-green-50", title: "Kurs tugatish", desc: "Har bir kursni tugatganda kurs uchun belgilangan XP ballar beriladi." },
  { icon: Target, color: "text-emerald-600", bg: "bg-emerald-50", title: "Test topshirish", desc: "Har bir modul testini muvaffaqiyatli topshirganda qo'shimcha XP olasiz." },
  { icon: Flame, color: "text-orange-600", bg: "bg-orange-50", title: "Kunlik streak", desc: "Har kuni platformaga kirib o'rganishni davom ettirsangiz streak bonuslari beriladi." },
  { icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50", title: "Yutuqlar", desc: "Maxsus yutuqlarni qo'lga kiritib qo'shimcha XP va unvonlar oling." },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const slideUpItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
} as const;

export default function AchievementsInfoPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-green-200/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-0 h-[300px] w-[300px] rounded-full bg-emerald-200/20 blur-[80px] pointer-events-none" />

      <div className="container relative z-10 max-w-5xl px-4 md:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#16a34a] font-bold transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>

        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <div className="w-20 h-20 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/10">
            <Trophy className="w-10 h-10 text-[#16a34a]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Yutuqlar & XP Tizimi</h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto text-lg">
            Ai.Dargoh da o'rganish nafaqat foydali balki juda qiziqarli! XP ballar yig'ing, darajalar bo'ylab ko'tariling va top mutaxassislar reytingida o'z o'rningizni toping.
          </p>
        </motion.div>

        {/* XP Levels */}
        <div className="mb-24 px-2 md:px-0">
          <div className="text-center mb-10">
             <p className="text-sm font-black text-[#16a34a] uppercase tracking-widest mb-3">O'sish yo'li</p>
             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight px-4">XP Darajalari</h2>
          </div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {xpLevels.map((lvl) => (
              <motion.div 
                key={lvl.level}
                variants={slideUpItem} 
                className="group relative p-8 rounded-3xl border border-slate-100 bg-white hover:shadow-xl hover:shadow-green-900/5 hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity pointer-events-none" />
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">{lvl.badge}</div>
                <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-4 border ${lvl.color} relative z-10 shadow-sm`}>
                  Daraja {lvl.level}
                </div>
                <p className="font-extrabold text-slate-900 text-lg mb-2 relative z-10">{lvl.name}</p>
                <p className="text-sm text-slate-500 font-bold tracking-wide relative z-10">{lvl.xp}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* How to earn */}
        <div className="mb-24 px-2 md:px-0">
          <div className="text-center mb-10">
             <p className="text-sm font-black text-[#16a34a] uppercase tracking-widest mb-3">Imkoniyatlar</p>
             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">XP qanday yig'iladi?</h2>
          </div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {howToEarn.map((item) => (
              <motion.div 
                key={item.title} 
                variants={slideUpItem}
                className="flex flex-col sm:flex-row gap-5 p-6 md:p-7 rounded-3xl border border-slate-100 bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group items-center sm:items-start text-center sm:text-left"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Achievements */}
        <div className="mb-24 px-2 md:px-0">
          <div className="text-center mb-10">
             <p className="text-sm font-black text-[#16a34a] uppercase tracking-widest mb-3">Sovrinlar</p>
             <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Maxsus Yutuqlar</h2>
          </div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {achievements.map((a) => (
              <motion.div 
                key={a.title} 
                variants={slideUpItem}
                className="flex flex-col sm:flex-row items-center gap-4 md:gap-5 p-5 md:p-6 rounded-3xl border border-slate-100 bg-white hover:border-green-200 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 text-center sm:text-left"
              >
                <div className="text-3xl md:text-4xl shrink-0 p-3 rounded-2xl bg-slate-50 border border-slate-100">{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base mb-1 truncate">{a.title}</h3>
                  <p className="text-xs text-slate-500 font-medium truncate">{a.desc}</p>
                </div>
                <span className="text-[10px] md:text-xs font-black text-[#16a34a] bg-green-50 border border-green-100 px-3 py-1.5 rounded-full shrink-0 shadow-sm">
                  {a.xp}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 md:p-12 lg:p-16 rounded-[2.5rem] bg-gradient-to-br from-[#16a34a] to-emerald-800 border border-transparent relative overflow-hidden shadow-2xl shadow-green-900/20"
        >
          {/* subtle background decor */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-green-400/30 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-900/40 blur-3xl rounded-full pointer-events-none" />

          <div className="text-4xl md:text-5xl mb-6 relative z-10 drop-shadow-xl inline-block bg-white/10 p-4 md:p-5 rounded-3xl border border-white/20 backdrop-blur-sm">
            🏆
          </div>
          <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-4 tracking-tight relative z-10 px-4">XP yig'ishni boshlang!</h3>
          <p className="text-green-50 font-medium mb-10 text-sm md:text-base max-w-lg mx-auto relative z-10 px-4">
            Birinchi kursga yoziling, vazifalarni bajaring va do'stlaringiz orasida yetakchiga aylaning.
          </p>
          <Link href="/courses" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-slate-50 hover:-translate-y-1 text-[#16a34a] text-sm font-bold transition-all shadow-xl shadow-green-900/50 relative z-10 w-full sm:w-auto">
            Kurslarni ko'rish <Zap className="w-5 h-5 fill-[#16a34a]" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
