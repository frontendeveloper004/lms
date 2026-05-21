"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react";

const faqs = [
  {
    category: "Ro'yxatdan o'tish",
    questions: [
      {
        q: "LearnEdu ga ro'yxatdan o'tish bepulmi?",
        a: "Ha, LearnEdu ga ro'yxatdan o'tish mutlaqo bepul. Siz talaba yoki o'qituvchi sifatida bepul hisob yaratishingiz mumkin.",
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
    questions: [
      {
        q: "O'qituvchi sifatida qanday kurs yarataman?",
        a: "O'qituvchi hisobi bilan kiring, 'Kurslarim' bo'limiga o'ting va 'Yangi kurs' tugmasini bosing. Kurs ma'lumotlarini to'ldiring, modullar va darslar qo'shing.",
      },
      {
        q: "Kursim qachon platformada ko'rinadi?",
        a: "Kurs yaratilgandan so'ng admin tomonidan ko'rib chiqiladi. Tasdiqlangandan so'ng platforma da barcha foydalanuvchilarga ko'rinadi. Bu jarayon odatda 1-2 ish kuni davom etadi.",
      },
      {
        q: "O'qituvchi sifatida daromad olamanmi?",
        a: "Ha! Pullik kurslaringizga yozilgan har bir talabadan daromad olasiz. To'lov tizimi tez orada to'liq ishga tushiriladi.",
      },
    ],
  },
  {
    category: "Texnik savollar",
    questions: [
      {
        q: "Mobil qurilmada ishlayaptimi?",
        a: "Ha, LearnEdu barcha qurilmalarda — telefon, planshet va kompyuterlarda mukammal ishlaydi.",
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
    <div className={`border rounded-2xl overflow-hidden transition-all ${open ? "border-blue-200 bg-blue-50/30" : "border-slate-100 bg-white hover:border-slate-200"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-bold text-slate-800">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-blue-500" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-slate-600 font-medium leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-3xl px-4 md:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 font-medium transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>

        <div className="mb-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-5">
            <HelpCircle className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">Ko'p Beriladigan Savollar</h1>
          <p className="text-slate-500 font-medium">Eng ko'p so'raladigan savollarga javoblar</p>
        </div>

        <div className="space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-1">
                {section.category}
              </h2>
              <div className="space-y-2">
                {section.questions.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
          <p className="text-slate-600 font-bold mb-2">Savolingizga javob topa olmadingizmi?</p>
          <p className="text-sm text-slate-500 font-medium mb-4">Biz bilan to'g'ridan-to'g'ri bog'laning</p>
          <a
            href="https://t.me/Web_Frontend_Developer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-sm shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.697l-2.95-.924c-.64-.203-.654-.64.136-.953l11.57-4.461c.537-.194 1.006.131.326.889z"/>
            </svg>
            Telegram orqali yozing
          </a>
        </div>
      </div>
    </div>
  );
}
