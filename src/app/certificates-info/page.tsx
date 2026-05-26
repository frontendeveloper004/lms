"use client";

import Link from "next/link";
import { ArrowLeft, Award, CheckCircle, Download, Share2, Star, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Kursga yoziling", desc: "Qiziqtirgan kursni tanlang va ro'yxatdan o'ting. Bepul kurslar uchun darhol kirish beriladi." },
  { num: "02", title: "Barcha darslarni tugating", desc: "Har bir modul va darsni ketma-ket o'tib chiqing. Progress avtomatik saqlanadi." },
  { num: "03", title: "Testlarni topshiring", desc: "Har bir modul oxiridagi testlarni muvaffaqiyatli topshiring." },
  { num: "04", title: "Sertifikat oling", desc: "Kursni 100% tugatgandan so'ng sertifikat avtomatik beriladi va yuklab olish mumkin." },
];

const features = [
  { icon: Shield, color: "text-green-600", bg: "bg-green-50", title: "Rasmiy tasdiqlangan", desc: "Har bir sertifikat Ai.Dargoh tomonidan raqamli imzolangan va tekshirilishi mumkin." },
  { icon: Download, color: "text-emerald-600", bg: "bg-emerald-50", title: "Yuklab olish", desc: "PDF formatda yuklab oling va istalgan joyda foydalaning." },
  { icon: Share2, color: "text-teal-600", bg: "bg-teal-50", title: "Ulashish", desc: "LinkedIn, Telegram va boshqa ijtimoiy tarmoqlarda ulashing." },
  { icon: Star, color: "text-lime-600", bg: "bg-lime-50", title: "XP ballari", desc: "Har bir sertifikat bilan XP ballar yig'ing va reytingda yuqoriga chiqing." },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const slideUpItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
} as const;

export default function CertificatesInfoPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-green-200/30 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-0 h-[300px] w-[300px] rounded-full bg-emerald-200/20 blur-[80px] pointer-events-none" />

      <div className="container relative z-10 max-w-4xl px-4 md:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#16a34a] font-bold transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>

        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/10">
            <Award className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Sertifikatlar</h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-xl mx-auto text-lg">
            Ai.Dargoh sertifikatlari sizning bilim va ko'nikmalaringizni rasmiy tasdiqlaydi.
            Ish beruvchilar va hamkorlar uchun ishonchli hujjat.
          </p>
        </motion.div>

        {/* Sample certificate */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-24 relative px-2 md:px-0"
        >
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-green-950 rounded-[2rem] p-6 md:p-12 text-center text-white shadow-2xl shadow-green-900/20 overflow-hidden border border-slate-700">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-green-500 to-lime-400" />
            <div className="absolute -top-20 -right-20 w-64 h-64 md:w-80 md:h-80 bg-green-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-xl">
                <img src="/logo.png" alt="Ai.Dargoh" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              </div>
              <p className="text-green-300/80 text-[10px] md:text-xs font-black uppercase tracking-[0.25em] mb-4">Ai.Dargoh Sertifikati</p>
              <h2 className="text-xl md:text-3xl font-black mb-3 text-white tracking-wide">JavaScript Asoslari</h2>
              <p className="text-white/60 text-xs md:text-sm font-medium mb-6 md:mb-8">Ushbu sertifikat quyidagi shaxsga beriladi</p>
              <p className="text-2xl md:text-4xl font-extrabold text-green-300 mb-6 md:mb-8 drop-shadow-md">Talaba Ismi</p>
              <div className="flex items-center justify-center gap-4 md:gap-6 text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest">
                <span>2026-yil, 1-yanvar</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>Ai.Dargoh UZ</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] md:text-xs font-black px-4 md:px-6 py-1.5 md:py-2 rounded-full shadow-lg border-2 border-white/20 whitespace-nowrap">
            Namuna sertifikat
          </div>
        </motion.div>

        {/* How to get */}
        <div className="mb-24 px-2 md:px-0">
          <div className="text-center mb-10">
             <p className="text-sm font-black text-[#16a34a] uppercase tracking-widest mb-3">Jarayon</p>
             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Qanday olish mumkin?</h2>
          </div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            {steps.map((step) => (
              <motion.div 
                key={step.num}
                variants={slideUpItem} 
                className="group flex flex-col sm:flex-row gap-5 md:gap-6 p-6 rounded-3xl border border-slate-100 bg-white hover:border-green-200 hover:shadow-xl hover:shadow-green-900/5 transition-all duration-300 items-center sm:items-start text-center sm:text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#16a34a] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                  {step.num}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-[#16a34a] transition-colors">{step.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Features */}
        <div className="mb-24 px-2 md:px-0">
          <div className="text-center mb-10">
             <p className="text-sm font-black text-[#16a34a] uppercase tracking-widest mb-3">Imkoniyatlar</p>
             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight px-4">Sertifikat imkoniyatlari</h2>
          </div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((f) => (
              <motion.div 
                key={f.title}
                variants={slideUpItem}
                className="flex flex-col sm:flex-row gap-5 p-6 md:p-7 rounded-3xl border border-slate-100 bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 items-center sm:items-start text-center sm:text-left"
              >
                <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center shrink-0`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
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
          className="text-center p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 relative overflow-hidden"
        >
          {/* subtle background ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-green-200/50 rounded-full pointer-events-none" />

          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-100 border-4 border-white flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
            <Award className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight relative z-10 px-4">Birinchi sertifikatni oling!</h3>
          <p className="text-slate-500 font-medium mb-8 text-sm md:text-base max-w-sm mx-auto relative z-10 px-4">Hoziroq kursga yoziling va bilimingizni AI dasturlari yordamida tasdiqlang.</p>
          <Link href="/courses" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#16a34a] hover:bg-green-700 hover:-translate-y-1 text-white text-sm font-bold transition-all shadow-xl shadow-green-500/20 relative z-10 w-full sm:w-auto">
            Kurslarni ko'rish <CheckCircle className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
