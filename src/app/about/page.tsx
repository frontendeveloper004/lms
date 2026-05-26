"use client";

import Link from "next/link";
import { ArrowLeft, Target, Users, BookOpen, Award, Zap, Heart, Globe, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { value: "10K+", label: "Faol talabalar", icon: Users },
  { value: "200+", label: "Professional kurslar", icon: BookOpen },
  { value: "50+", label: "Ekspert o'qituvchilar", icon: GraduationCap },
  { value: "95%", label: "Mamnunlik darajasi", icon: Heart },
];

const values = [
  {
    icon: Target,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "Maqsadga yo'naltirilgan",
    desc: "Har bir kurs real hayotda qo'llaniladigan bilim va ko'nikmalarni o'rgatish uchun yaratilgan.",
  },
  {
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Zamonaviy yondashuv",
    desc: "Eng yangi texnologiyalar va o'qitish metodlari bilan qurilgan platforma.",
  },
  {
    icon: Globe,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Hammaga ochiq",
    desc: "O'zbekistonning har bir burchagidan, istalgan vaqt o'rganish imkoniyati.",
  },
  {
    icon: Heart,
    color: "text-red-500",
    bg: "bg-red-50",
    title: "Jamiyat uchun",
    desc: "IT sohasida malakali kadrlar tayyorlash orqali O'zbekiston iqtisodiyotiga hissa qo'shish.",
  },
];

const team = [
  {
    name: "Hasanxon Saydullaxonov",
    role: "FullStack & Middle-Senior dasturchi",
    avatarUrl: "/hasanxon.jpg", // The user will drop their image here as hasanxon.jpg
    color: "bg-green-500",
    desc: "4+ yillik tajribaga ega tajribali injener. React, Next.js, Node.js va keng qamrovli zamonaviy web texnologiyalari mutaxassisi.",
    telegram: "https://t.me/Web_Frontend_Developer",
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
} as const;

const slideUpItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
} as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Background Decorators */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-green-200/30 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-0 h-[400px] w-[400px] rounded-full bg-emerald-200/20 blur-[100px] pointer-events-none" />

      <div className="container relative z-10 max-w-5xl px-4 md:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#16a34a] font-bold transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>

        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          {/* Unbounded Logo */}
          <div className="mx-auto mb-8 flex justify-center">
             <img src="/logo.png" alt="Ai.Dargoh" className="h-16 md:h-20 w-auto object-contain drop-shadow-md" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Biz haqimizda
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto text-lg">
            Ai.Dargoh — O'zbekistondagi zamonaviy online ta'lim platformasi. Bizning maqsadimiz
            har bir o'zbek yoshiga sifatli IT ta'limini yetkazib berish va kelajak mutaxassislarini tayyorlash.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
        >
          {stats.map((stat) => (
            <motion.div 
              key={stat.label} 
              variants={slideUpItem}
              className="text-center p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-transform"
            >
              <div className="w-12 h-12 mx-auto bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                 <stat.icon className="w-6 h-6 text-[#16a34a]" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mb-2">{stat.value}</p>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>        {/* Mission */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-24 p-8 md:p-16 rounded-[3rem] bg-gradient-to-br from-[#16a34a] to-emerald-800 text-white shadow-2xl shadow-green-900/20 relative overflow-hidden"
        >
          {/* subtle background decor */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-green-400/30 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10 text-center md:text-left flex flex-col md:flex-row items-center gap-6 md:gap-10">
             <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0 shadow-inner">
               <Target className="w-10 h-10 md:w-12 md:h-12 text-white" />
             </div>
             <div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-4 tracking-tight">Bizning missiyamiz</h2>
                <p className="text-green-50 font-medium leading-relaxed text-base md:text-lg max-w-3xl">
                   O'zbekistonda IT sohasidagi bilim va ko'nikmalar bo'shlig'ini to'ldirish. Har bir talabaga
                   ekspert o'qituvchilardan sifatli ta'lim olish, sertifikat qo'lga kiritish va karyerasini
                   rivojlantirish imkoniyatini yaratish — bu Ai.Dargoh ning asosiy maqsadi.
                </p>
             </div>
          </div>
        </motion.div>

        {/* Values */}
        <div className="mb-24">
          <div className="text-center mb-12">
             <p className="text-sm font-black text-[#16a34a] uppercase tracking-widest mb-3">Tamoyillar</p>
             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight px-4">Bizning qadriyatlarimiz</h2>
          </div>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {values.map((v) => (
              <motion.div 
                key={v.title}
                variants={slideUpItem} 
                className="flex flex-col sm:flex-row gap-5 p-6 md:p-7 rounded-3xl border border-slate-100 bg-white hover:border-green-200 hover:shadow-xl hover:shadow-green-900/5 transition-all duration-300 items-center sm:items-start text-center sm:text-left"
              >
                <div className={`w-14 h-14 rounded-2xl ${v.bg} flex items-center justify-center shrink-0`}>
                  <v.icon className={`w-6 h-6 ${v.color}`} />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Team */}
        <div className="mb-24">
          <div className="text-center mb-12 px-4">
             <p className="text-sm font-black text-[#16a34a] uppercase tracking-widest mb-3">Murabbiylar</p>
             <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Jamoa</h2>
          </div>
          <div className="flex justify-center px-4 md:px-0">
            {team.map((member) => (
              <motion.div 
                key={member.name} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center p-6 md:p-10 rounded-[3rem] bg-white border border-slate-100 hover:border-green-200 hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-500 max-w-md w-full group"
              >
                <div className="w-56 md:w-64 aspect-[3/4] rounded-[2rem] mx-auto mb-8 shadow-2xl overflow-hidden border-4 border-white ring-4 ring-green-50 group-hover:scale-105 transition-transform duration-500 bg-slate-100">
                  <img 
                     src={member.avatarUrl} 
                     onError={(e) => {
                        const img = e.currentTarget;
                        img.src = "https://api.dicebear.com/7.x/notionists/svg?seed=Hasanxon&backgroundColor=16a34a";
                     }}
                     alt={member.name} 
                     className="w-full h-full object-cover object-top" 
                  />
                </div>
                <h3 className="font-extrabold text-slate-900 text-2xl mb-2">{member.name}</h3>
                <p className="text-[11px] font-black text-[#16a34a] uppercase tracking-widest mb-4 bg-green-50 inline-block px-4 py-1.5 rounded-full border border-green-100">{member.role}</p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 px-2">{member.desc}</p>
                <a href={member.telegram} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-50 text-blue-600 text-sm font-bold hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all w-full leading-none">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.697l-2.95-.924c-.64-.203-.654-.64.136-.953l11.57-4.461c.537-.194 1.006.131.326.889z"/>
                  </svg>
                  Telegram orqali bog'lanish
                </a>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 md:p-16 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6">
            <Users className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight px-4">Bizga qo'shiling!</h3>
          <p className="text-slate-500 font-medium mb-8 text-sm md:text-base max-w-sm mx-auto px-4">10,000+ muvaffaqiyatli talaba bilan birga o'rganishni boshlang.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link href="/register" className="px-8 py-4 rounded-xl bg-[#16a34a] hover:bg-green-700 hover:-translate-y-1 text-white text-sm font-bold transition-all shadow-xl shadow-green-600/20 w-full sm:w-auto">
              Bepul ro'yxatdan o'tish
            </Link>
            <Link href="/courses" className="px-8 py-4 rounded-xl border border-slate-200 bg-transparent hover:bg-slate-50 hover:-translate-y-1 text-slate-700 text-sm font-bold transition-all w-full sm:w-auto">
              Barcha kurslarni ko'rish
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
