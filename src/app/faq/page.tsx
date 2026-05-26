"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    category: "Ro'yxatdan o'tish",
    color: "text-[#16a34a]",
    bg: "bg-green-50",
    questions: [
      {
        q: "Ai.Dargoh ga ro'yxatdan o'tish bepulmi?",
        a: "Ha, Ai.Dargoh ga ro'yxatdan o'tish mutlaqo bepul. Siz talaba yoki o'qituvchi sifatida bepul hisob yaratishingiz mumkin.",
      },
      {
        q: "Talaba va o'qituvchi hisobi o'rtasidagi farq nima?",
        a: "Talaba hisobi kurslarga yozilish, darslarni ko'rish va sertifikat olish imkonini beradi. O'qituvchi hisobi esa kurs yaratish, talabalarni boshqarish va daromad olish imkonini beradi.",
      },
      {
        q: "Hisobimni o'chirib tashlasam ma'lumotlarim yo'qoladimi?",
        a: "Ha, hisobingizni o'chirganda barcha ma'lumotlaringiz, kurs progressingiz va sertifikatlaringiz butunlay o'chib ketadi. Bu amalni ortga qaytarib bo'lmaydi.",
      },
    ],
  },
  {
    category: "Kurslar",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    questions: [
      {
        q: "Kurslarga qanday yozilaman?",
        a: "Kurs sahifasiga o'tib 'Kursni ko'rish' tugmasini bosing. Bepul kurslarga darhol yozilasiz, pullik kurslarda esa to'lov amalga oshiriladi.",
      },
      {
        q: "Kursni tugatgandan so'ng sertifikat olamanmi?",
        a: "Ha! Kursning barcha dars va testlarini muvaffaqiyatli tugatgandan so'ng avtomatik ravishda sertifikat beriladi. Sertifikatni yuklab olish va ulashish mumkin.",
      },
      {
        q: "Kurslarga qancha vaqt kirish imkonim bo'ladi?",
        a: "Kursga yozilgandan so'ng materiallar cheksiz muddatga sizga ochiq bo'ladi. Istalgan vaqt, istalgan joydan o'rganishingiz mumkin.",
      },
      {
        q: "Kurs materiallari qaysi tilda?",
        a: "Hozirda asosiy kurslar o'zbek tilida. Ba'zi kurslar rus va ingliz tillarida ham mavjud. Har bir kurs sahifasida til ko'rsatilgan.",
      },
    ],
  },
  {
    category: "To'lov",
    color: "text-teal-600",
    bg: "bg-teal-50",
    questions: [
      {
        q: "Qanday to'lov usullari mavjud?",
        a: "Hozirda Click, Payme va bank kartasi orqali to'lov qabul qilinadi. Tez orada boshqa to'lov usullari ham qo'shiladi.",
      },
      {
        q: "Pulimni qaytarib olishim mumkinmi?",
        a: "Kursni boshlashdan oldin 7 kun ichida to'liq qaytarish mumkin. Kursning 30% dan ko'prog'ini o'rganib bo'lgandan so'ng qaytarish amalga oshirilmaydi.",
      },
    ],
  },
  {
    category: "O'qituvchilar",
    color: "text-lime-600",
    bg: "bg-lime-50",
    questions: [
      {
        q: "O'qituvchi sifatida qanday kurs yarataman?",
        a: "O'qituvchi hisobi bilan kiring, 'Kurslarim' bo'limiga o'ting va 'Yangi kurs' tugmasini bosing. Kurs ma'lumotlarini to'ldiring, modullar va darslar qo'shing.",
      },
      {
        q: "Kursim qachon platformada ko'rinadi?",
        a: "Kurs yaratilgandan so'ng admin tomonidan ko'rib chiqiladi. Tasdiqlangandan so'ng platformada barcha foydalanuvchilarga ko'rinadi. Bu jarayon odatda 1-2 ish kuni davom etadi.",
      },
      {
        q: "O'qituvchi sifatida daromad olamanmi?",
        a: "Ha! Pullik kurslaringizga yozilgan har bir talabadan daromad olasiz. To'lov tizimi tez orada to'liq ishga tushiriladi.",
      },
    ],
  },
  {
    category: "Texnik savollar",
    color: "text-orange-500",
    bg: "bg-orange-50",
    questions: [
      {
        q: "Mobil qurilmada ishlayaptimi?",
        a: "Ha, Ai.Dargoh barcha qurilmalarda — telefon, planshet va kompyuterlarda mukammal ishlaydi.",
      },
      {
        q: "Parolimni unutdim, nima qilaman?",
        a: "Hozirda parolni tiklash funksiyasi ishlab chiqilmoqda. Muammo yuzaga kelsa, Telegram orqali biz bilan bog'laning.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
        open ? "border-green-200 bg-green-50/40 shadow-md shadow-green-900/5" : "border-slate-100 bg-white hover:border-green-100"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-[15px] font-bold text-slate-800">{q}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 transition-all duration-300 ${open ? "bg-[#16a34a] border-[#16a34a]" : "bg-slate-50 border-slate-200"}`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180 text-white" : "text-slate-400"}`} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" as const }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <p className="text-sm text-slate-600 font-medium leading-relaxed border-t border-green-200 pt-4">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-green-200/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-0 h-[300px] w-[300px] rounded-full bg-emerald-200/20 blur-[80px] pointer-events-none" />

      <div className="container relative z-10 max-w-3xl px-4 md:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#16a34a] font-bold transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/10">
            <HelpCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Ko'p Beriladigan Savollar</h1>
          <p className="text-slate-500 font-medium text-lg">Eng ko'p so'raladigan savollarga javoblar</p>
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-12 px-2 md:px-0">
          {faqs.map((section, si) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: si * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-5 px-2 md:px-0">
                <div className={`w-9 h-9 rounded-2xl ${section.bg} flex items-center justify-center shrink-0`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${section.color.replace("text-", "bg-")}`} />
                </div>
                <h2 className={`text-[13px] md:text-sm font-extrabold ${section.color} uppercase tracking-widest`}>
                  {section.category}
                </h2>
              </div>
              <div className="space-y-3">
                {section.questions.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="mt-16 p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mx-auto mb-5 shadow-md">
            <MessageCircle className="w-7 h-7 text-[#16a34a]" />
          </div>
          <p className="text-slate-900 font-extrabold text-lg md:text-xl mb-2 px-2">Savolingizga javob topa olmadingizmi?</p>
          <p className="text-slate-500 font-medium text-xs md:text-sm mb-8 px-4">Biz bilan to'g'ridan-to'g'ri bog'laning — tez javob beramiz!</p>
          <a href="https://t.me/Web_Frontend_Developer" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#16a34a] hover:bg-green-700 hover:-translate-y-1 text-white text-sm font-bold transition-all shadow-xl shadow-green-500/20 w-full md:w-auto">
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.697l-2.95-.924c-.64-.203-.654-.64.136-.953l11.57-4.461c.537-.194 1.006.131.326.889z"/>
            </svg>
            Telegram orqali yozing
          </a>
        </motion.div>
      </div>
    </div>
  );
}
