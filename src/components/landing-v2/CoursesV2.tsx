"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Code, ShieldAlert, Palette, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const courses = [
  {
    name: "Frontend Dasturlash",
    desc: "React, Next.js va zamonaviy web texnologiyalar yordamida interfeyslarni yaratish.",
    icon: Code,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    name: "Backend Dasturlash",
    desc: "Node.js, Python, ma'lumotlar bazasi va API arxitekturasini chuqur o'rganing.",
    icon: Code,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    name: "Kiberxavfsizlik",
    desc: "Tizimlarni himoyalash va etik xakerlik sirlari, xavfsizlik testlarini o'tkazish.",
    icon: ShieldAlert,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    name: "UX/UI Dizayn",
    desc: "Figma orqali qulay va zamonaviy interfeyslar quramiz, foydalanuvchi tajribasini boyitamiz.",
    icon: Palette,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
];

export function CoursesV2() {
  return (
    <section className="py-24 bg-slate-50 w-full overflow-hidden relative">
      {/* Soft background shape */}
      <div className="absolute -left-40 top-40 w-96 h-96 bg-green-100/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
          <div className="space-y-4 max-w-2xl w-full">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              O'quv dasturlari
            </h2>
            <p className="text-slate-500 font-medium text-base md:text-lg">
              Sizga mos bo'lgan yo'nalishni tanlang va kelajak kasbini ekspertlardan o'rganing.
            </p>
          </div>
          <Button variant="outline" className="rounded-full shadow-sm hover:text-green-600 hover:border-green-200 w-full sm:w-auto" asChild>
            <Link href="/courses">
              Barcha kurslarni ko'rish <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-start group"
            >
              <div className={`w-12 h-12 rounded-2xl ${course.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <course.icon className={`w-6 h-6 ${course.color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{course.name}</h3>
              <p className="text-slate-500 font-medium text-sm mb-6 flex-1">{course.desc}</p>
              <Link 
                href={`/courses?category=${course.name}`}
                className={`text-sm font-bold uppercase tracking-wider ${course.color} flex items-center group-hover:translate-x-1 transition-transform`}
              >
                Batafsil <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
