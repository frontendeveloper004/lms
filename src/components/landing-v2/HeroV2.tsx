"use client";

import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroV2() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f8fafc] pt-2 pb-24 md:pt-5 md:pb-40">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-green-100/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[400px] w-[400px] rounded-full bg-emerald-100/40 blur-[100px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" as const }}
            className="flex-1 space-y-8 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50/80 px-4 py-1.5 text-[12px] font-bold text-green-700 uppercase tracking-widest shadow-sm">
              <Sparkles className="h-4 w-4" />
              IT-Ta'limda yangi davr
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] md:leading-[1.05] text-slate-900">
              G'oyadan — <br className="hidden md:block" />
              <span className="text-[#16a34a]">Biznesgacha</span>
            </h1>

            <p className="max-w-xl mx-auto lg:mx-0 text-[15px] sm:text-base text-slate-600 md:text-lg font-medium leading-relaxed px-2 md:px-0">
              O'zbekistondagi eng ilg'or raqamli ta'lim platformasi. Dasturlash, kiberxavfsizlik, dizayn va boshqa sohalarda amaliy bilimlarni o'rganing, tajriba orttiring va mutaxassisga aylaning.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 px-4 sm:px-0">
              <Button size="lg" className="h-14 px-8 text-base font-bold rounded-[1rem] bg-[#16a34a] hover:bg-[#15803d] text-white shadow-xl shadow-green-600/20 transition-all hover:-translate-y-1 gap-2 w-full sm:w-auto" asChild>
                <Link href="/courses">
                  O'rganishni boshlash <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-[1rem] border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-all shadow-sm hover:-translate-y-1 gap-2 w-full sm:w-auto" asChild>
                <Link href="/register">
                  <Play className="h-5 w-5 fill-slate-800" /> Bepul tanishuv
                </Link>
              </Button>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 text-sm text-slate-500 font-medium">
              <div className="flex -space-x-3">
                <div className="w-9 h-9 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-xs font-bold text-green-600">J</div>
                <div className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-xs font-bold text-emerald-600">A</div>
                <div className="w-9 h-9 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-xs font-bold text-orange-600">M</div>
                <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600">+1k</div>
              </div>
              <span className="text-center sm:text-left">Talabalar ishonch bildirishgan</span>
            </div>
          </motion.div>

          {/* Graphical/Image Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" as const }}
            className="flex-1 w-full max-w-lg lg:max-w-none relative px-4 md:px-0"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-slate-100 aspect-video lg:aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <img
                  src="/hero-graphic.png"
                  alt="LMS Platform Hero Graphic"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>

              {/* Floating Badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-4 left-4 lg:top-6 lg:left-6 bg-white/95 backdrop-blur-md p-3 md:p-4 rounded-2xl shadow-xl border border-slate-100 border-opacity-50 z-20"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-green-100 text-green-600 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-base md:text-lg font-bold">✓</div>
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-500 font-medium whitespace-nowrap">Sertifikatlangan</p>
                    <p className="text-xs md:text-sm font-bold tracking-tight text-slate-900">Kurslar</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
