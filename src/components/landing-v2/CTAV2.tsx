"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTAV2() {
  return (
    <section className="py-24 bg-slate-50 w-full">
      <div className="container px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-green-500 px-6 py-16 md:p-20 text-center shadow-2xl shadow-green-500/20">
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -m-10 h-64 w-64 rounded-full bg-green-400/30 blur-[60px]" />
          <div className="absolute bottom-0 left-0 -m-10 h-64 w-64 rounded-full bg-green-800/30 blur-[60px]" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              Dasturlash olamiga qadam qo'ying!
            </h2>
            
            <p className="mb-8 max-w-xl text-base md:text-lg font-medium text-green-100 px-4 md:px-0">
              Biz bilan bepul konsultatsiya qiling yoki qulay vaqtda darslarni boshlang. Hozir ro'yxatdan o'ting va kelajagingizni o'zgartiring.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Button size="lg" className="h-14 px-8 text-base font-bold rounded-[1rem] bg-white text-[#16a34a] hover:bg-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all gap-2 w-full sm:w-auto" asChild>
                <Link href="/register">
                  Ro'yxatdan o'tish <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-[1rem] bg-transparent border-white/30 text-white hover:bg-white/10 hover:-translate-y-1 transition-all gap-2 w-full sm:w-auto" asChild>
                <a href="https://t.me/Web_Frontend_Developer" target="_blank" rel="noopener noreferrer">
                  Bepul konsultatsiya
                </a>
              </Button>
            </div>
            
            <p className="mt-8 text-xs md:text-sm font-medium text-green-200 px-4">
              Dastlabki 3 dars mutlaqo bepul! Hech qanday karta talab qilinmaydi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
