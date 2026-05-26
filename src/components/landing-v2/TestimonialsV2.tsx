"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    text: "Dasturlashni o'rganish orzum edi. Bu yerda esa orzu emas, reja bo'lib qoldi. O'rganganlarimni portfolioga joylashni boshladim — natija ko'rinishi kuchli rag'bat beradi.",
    name: "Akmal Qodirov",
    role: "Backend o'quvchisi",
    initials: "AQ",
    color: "bg-[#16a34a]",
  },
  {
    text: "Har kuni o'qishga ishtiyoq bilan boraman. Murakkab mavzularni oddiy misollar bilan tushuntirib berishadi. O'zimni haqiqatdan ham IT yo'lida katayotganimni his qilyapman.",
    name: "Madina Yusupova",
    role: "Frontend o'quvchisi",
    initials: "MY",
    color: "bg-emerald-500",
  },
  {
    text: "Jamoa juda samimiy va e'tiborli. Har bir savolimga javob berishadi. Platforma orqali birinchi loyihamni yozdim va mijozga topshirdim!",
    name: "Dilnoza Karimova",
    role: "Fullstack o'quvchisi",
    initials: "DK",
    color: "bg-teal-500",
  },
  {
    text: "Sertifikat olganimdan keyin rezyumeimga qo'shdim. Intervyuga taklif keldi! Ai.Dargoh platformasi haqiqatan ham karyeramni boshlab berdi.",
    name: "Jasur Toshmatov",
    role: "React dasturchi",
    initials: "JT",
    color: "bg-green-600",
  },
  {
    text: "O'zbek tilida bunday chuqur va sifatli kurs topa olmagan edim. Endi har kuni yangi narsa o'rganaman. To'lov tizimi ham juda qulay.",
    name: "Sarvinoz Hasanova",
    role: "UI/UX o'quvchisi",
    initials: "SH",
    color: "bg-lime-600",
  },
  {
    text: "Avval uydan ishlash mumkinmi deb shubha qilardim. Hozir esa to'liq remote ishlayman. Bu platformasiz bu natijaga erishish ancha qiyin bo'lardi.",
    name: "Bobur Raximov",
    role: "Node.js dasturchi",
    initials: "BR",
    color: "bg-emerald-600",
  },
  {
    text: "Mentor bilan ishlash tajribasi ajoyib! Har haftada video muloqot, kod review va real loyiha. Bunday formatni boshqa platformalarda ko'rmagan edim.",
    name: "Kamola Ergasheva",
    role: "Python o'quvchisi",
    initials: "KE",
    color: "bg-[#16a34a]",
  },
];

// Duplicate for seamless infinite scroll
const doubled = [...testimonials, ...testimonials];

// Rating stars helper
function Stars() {
  return (
    <div className="flex items-center gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsV2() {
  return (
    <section className="py-24 bg-slate-50 w-full overflow-hidden">
      <div className="container mx-auto px-4 mb-14 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-black text-[#16a34a] uppercase tracking-widest mb-4">O'quvchilar fikri</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Ular nima deydi?
          </h2>
          <p className="mt-4 text-slate-500 font-medium max-w-xl mx-auto">
            Minglab o'quvchilarimiz hayotini o'zgartirmoqda. Ularning so'zlatgan taassurotlari.
          </p>
        </motion.div>
      </div>

      {/* Fade masks on left and right */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-28 md:w-48 z-10 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 md:w-48 z-10 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

        {/* Scrolling track using Framer Motion for reliability */}
        <div className="flex gap-6 overflow-hidden">
          <motion.div 
            className="flex gap-6 w-max"
            animate={{
              x: [0, "-50%"]
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 60,
                ease: "linear",
              },
            }}
          >
            {doubled.map((t, i) => (
              <div
                key={i}
                className="w-[320px] md:w-[380px] shrink-0 bg-white rounded-3xl p-8 border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col justify-between hover:bg-gradient-to-br hover:from-white hover:to-green-50/50 hover:border-green-200 hover:shadow-xl hover:shadow-green-900/5 hover:-translate-y-1 transition-all duration-500 group"
              >
                {/* Quote icon */}
                <div className="mb-1">
                  <svg className="w-8 h-8 text-green-100 fill-current mb-3" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                  <Stars />
                  <p className="text-slate-700 font-medium text-[15px] leading-relaxed">{t.text}</p>
                </div>

                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-100">
                  <div className={`w-11 h-11 rounded-full ${t.color} text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-md`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
