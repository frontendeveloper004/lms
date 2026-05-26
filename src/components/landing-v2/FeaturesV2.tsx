"use client";

import { motion } from "framer-motion";
import { Map, Zap, Target, BookOpen, Headset, Trophy } from "lucide-react";

const features = [
  {
    icon: Map,
    title: "Bepul Kovorking",
    desc: "Talabalarimiz uchun qulay ish joyi va yuqori tezlikdagi internet - mutlaqo bepul.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Target,
    title: "Amaliyotga asoslangan",
    desc: "Faqat nazariya emas, balki real loyihalar ustida ishlash imkoniyati.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Trophy,
    title: "Turnirlar va Musobaqalar",
    desc: "Hackathon va turli IT musobaqalarda qatnashib, o'z bilimingizni sinab ko'ring.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: BookOpen,
    title: "Sifatli Ta'lim",
    desc: "Xalqaro standartlarga mos, tajribali mutaxassislar tomonidan tuzilgan dastur.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Zap,
    title: "Karyerada Qo'llab-quvvatlash",
    desc: "Rezyume yaratishdan tortib, ish topishgacha bo'lgan jarayonda bepul yordam.",
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    icon: Headset,
    title: "24/7 Mentorlik",
    desc: "Darslardan tashqari vaqtda ham ustozlardan doimiy yordam olish imkoniyati.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesV2() {
  return (
    <section className="py-24 bg-white w-full">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-black text-[#16a34a] uppercase tracking-widest">
            Nima uchun Ai.Dargoh?
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Nima uchun bizda o'qishingiz kerak?
          </h2>
          <p className="max-w-2xl mx-auto text-slate-500 font-medium">
            Biz shunchaki dars o'tmaymiz, balki sizning muvaffaqiyatli IT mutaxassis bo'lib yetishishingiz uchun barcha sharoitlarni yaratamiz.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              variants={itemVariants}
              className="p-8 rounded-3xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-green-900/5 transition-all duration-300 hover:-translate-y-1 group cursor-default"
            >
              <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className={`w-7 h-7 ${f.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-600 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
