"use client";

import Link from "next/link";
import { ArrowLeft, Lock, Eye, Database, Bell, Trash2, Globe } from "lucide-react";
import { motion } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } }
} as const;
const slideUpItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
} as const;

const sections = [
  {
    icon: Database,
    color: "text-[#16a34a]",
    bg: "bg-green-50",
    title: "1. To'planadigan ma'lumotlar",
    items: [
      "Ism va familiya — ro'yxatdan o'tishda",
      "Email manzil — kirish va xabarnomalar uchun",
      "O'quv faoliyati — kurs progressi va yutuqlar",
      "Qurilma ma'lumotlari — texnik maqsadlar uchun",
      "To'lov ma'lumotlari — pullik kurslar uchun (xavfsiz tarzda)",
    ]
  },
  {
    icon: Eye,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "2. Ma'lumotlardan foydalanish",
    items: [
      "Platformani yaxshilash va xizmat sifatini oshirish",
      "Yangi kurslar va materiallar haqida xabardor qilish",
      "Texnik muammolarni hal qilish",
      "Foydalanuvchi tajribasini shaxsiylashtirish",
      "Qonuniy majburiyatlarni bajarish",
    ]
  },
  {
    icon: Globe,
    color: "text-teal-600",
    bg: "bg-teal-50",
    title: "3. Ma'lumotlarni ulashish",
    items: [
      "Biz sizning ma'lumotlaringizni uchinchi shaxslarga sotmaymiz.",
      "Ma'lumotlar faqat xizmat ko'rsatuvchi hamkorlar bilan ulashilishi mumkin.",
      "Qonuniy talablar bo'yicha davlat organlariga ma'lumot berilishi mumkin.",
      "O'qituvchilar faqat o'z kurslaridagi talabalar ma'lumotlarini ko'radi.",
    ]
  },
  {
    icon: Bell,
    color: "text-lime-600",
    bg: "bg-lime-50",
    title: "4. Cookie fayllar",
    items: [
      "Biz sessiya va autentifikatsiya uchun cookie fayllardan foydalanamiz.",
      "Analitika uchun anonim ma'lumotlar to'planadi.",
      "Brauzer sozlamalarida cookie fayllarni o'chirib qo'yishingiz mumkin.",
    ]
  },
  {
    icon: Trash2,
    color: "text-orange-500",
    bg: "bg-orange-50",
    title: "5. Sizning huquqlaringiz",
    items: [
      "Shaxsiy ma'lumotlaringizni ko'rish va tahrirlash huquqi",
      "Ma'lumotlaringizni o'chirish talabi (hisobni o'chirish orqali)",
      "Marketing xabarnomalaridan voz kechish huquqi",
      "Ma'lumotlaringizni eksport qilish huquqi",
    ]
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-green-200/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[30%] left-0 h-[300px] w-[300px] rounded-full bg-emerald-200/20 blur-[80px] pointer-events-none" />

      <div className="container relative z-10 max-w-3xl px-4 md:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#16a34a] font-bold transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
          <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mb-6 shadow-lg shadow-green-500/10">
            <Lock className="w-8 h-8 text-[#16a34a]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Maxfiylik Siyosati</h1>
          <p className="text-slate-500 font-medium">Oxirgi yangilanish: 1-yanvar, 2026</p>
        </motion.div>

        {/* Intro */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-12 p-6 rounded-3xl bg-white border border-green-100 shadow-xl shadow-green-900/5">
          <p className="text-slate-700 font-medium leading-relaxed text-[15px]">
            Ai.Dargoh sizning shaxsiy ma'lumotlaringizni himoya qilishni jiddiy qabul qiladi.
            Ushbu siyosat qanday ma'lumotlar to'planishi va ulardan qanday foydalanilishi haqida ma'lumot beradi.
          </p>
        </motion.div>

        {/* Sections */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="space-y-6">
          {sections.map((section) => (
            <motion.div key={section.title} variants={slideUpItem}
              className="p-6 md:p-8 rounded-3xl bg-white border border-slate-100 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/5 transition-all duration-300 group">
              <h2 className="text-base md:text-lg font-extrabold text-slate-900 flex items-center gap-3 md:gap-4 mb-6">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl ${section.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <section.icon className={`w-4 h-4 md:w-5 md:h-5 ${section.color}`} />
                </div>
                {section.title}
              </h2>
              <ul className="space-y-3 ml-4 md:ml-16">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-[#16a34a] mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="mt-12 p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 text-center">
          <p className="text-slate-700 font-bold mb-2 text-base">Maxfiylik bo'yicha savollar uchun</p>
          <p className="text-slate-500 font-medium text-xs md:text-sm mb-6">Murojaat qiling, darhol javob beramiz</p>
          <a href="https://t.me/Web_Frontend_Developer" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#16a34a] hover:bg-green-700 hover:-translate-y-1 text-white text-sm font-bold transition-all shadow-xl shadow-green-500/20 w-full md:w-auto">
            Biz bilan bog'laning
          </a>
        </motion.div>
      </div>
    </div>
  );
}
