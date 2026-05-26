"use client";

import { motion } from "framer-motion";
import { ArrowRight, Code, Trophy, Users, Zap } from "lucide-react";
import Link from "next/link";

export function MentorsV2() {
  return (
    <section className="py-24 bg-white w-full">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            TOP ekspertlar va murabbiylar
          </h2>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row gap-6 w-full"
        >
          {/* Left: Mentor Photo */}
          <div className="w-full lg:w-1/3">
             <div className="relative w-full h-[350px] md:h-[500px] lg:h-full min-h-[350px] md:min-h-[500px] rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-200">
                <img 
                   src="/hasanxon.jpg" 
                   alt="Hasanxon Saydullaxonov" 
                   className="w-full h-full object-cover"
                   onError={(e) => {
                     (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/notionists/svg?seed=Hasanxon&backgroundColor=16a34a";
                   }}
                />
             </div>
          </div>

          {/* Right: Data Card (Light Mode) */}
          <div className="w-full lg:w-2/3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden flex flex-col justify-between shadow-xl shadow-green-900/5">
              
              {/* Background abstract element mimicking the 3d cylinder (but keeping it a clean platform glow) */}
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/60 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10 text-center sm:text-left">
                 <h3 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-6 md:mb-8">
                   Hasanxon Saydullaxonov
                 </h3>

                 <ul className="space-y-4 text-slate-600 font-medium text-[15px] md:text-lg mb-10 md:mb-12 text-left">
                   <li className="flex gap-4">
                     <span className="text-[#16a34a] font-black">1.</span>
                     <span>Ai.Dargoh platformasi asoschisi va bosh o'qituvchisi.</span>
                   </li>
                   <li className="flex gap-4">
                     <span className="text-[#16a34a] font-black">2.</span>
                     <span>4+ yillik FullStack va Middle-Senior dasturlash tajribasi.</span>
                   </li>
                   <li className="flex gap-4">
                     <span className="text-[#16a34a] font-black">3.</span>
                     <span>Haqiqiy biznes loyihalarida qatnashib, murakkab tizimlarning arxitekturasini 0 dan yaratish darajasida tajribaga ega.</span>
                   </li>
                   <li className="flex gap-4">
                     <span className="text-[#16a34a] font-black">4.</span>
                     <span>React, Next.js, Node.js va keng qamrovli zamonaviy web texnologiyalari mutaxassisi.</span>
                   </li>
                   <li className="flex gap-4">
                     <span className="text-[#16a34a] font-black">5.</span>
                     <span>Bir qancha yirik startap va logistika loyihalarida asosiy muhandis.</span>
                   </li>
                 </ul>
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-8 mt-4">
                 
                 {/* Fake partner/tech logos matching the bottom left of the image */}
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 md:p-2.5 shadow-sm hover:-translate-y-1 transition-transform">
                       <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" className="w-full h-full object-contain" />
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 md:p-2.5 shadow-sm hover:-translate-y-1 transition-transform">
                       <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" alt="Next.js" className="w-full h-full object-contain opacity-80" />
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 md:p-2.5 shadow-sm hover:-translate-y-1 transition-transform">
                       <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" className="w-full h-full object-contain" />
                    </div>
                 </div>

                 {/* Action Button */}
                 <Link 
                    href="/courses" 
                    className="inline-flex items-center gap-3 py-4 pl-8 pr-4 bg-[#16a34a] hover:bg-green-500 transition-colors rounded-full text-white font-bold group shadow-xl shadow-green-900/30 w-full sm:w-auto justify-between sm:justify-start"
                 >
                    Darslarni ko'rish
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                       <ArrowRight className="w-5 h-5 text-[#16a34a] -rotate-45" />
                    </div>
                 </Link>
              </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
