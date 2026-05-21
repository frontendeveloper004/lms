import Link from "next/link";
import {
  ArrowRight, Code, ShieldAlert, TrendingUp, Palette,
  Dumbbell, Star, Users, CheckCircle, BookOpen, Award,
  Zap, Globe, Play, ChevronRight, GraduationCap, Clock,
  BarChart3, Shield, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    name: "Dasturlash",
    description: "Frontend, Backend va Mobil dasturlar yaratishni o'rganing.",
    icon: Code,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
    hover: "hover:border-green-300 hover:bg-green-50/80",
  },
  {
    name: "Kiberxavfsizlik",
    description: "Tizimlarni himoyalash va etik xakerlik sirlari.",
    icon: ShieldAlert,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    hover: "hover:border-red-300 hover:bg-red-50/80",
  },
  {
    name: "Marketing",
    description: "SMM, SEO va raqamli marketing strategiyalari.",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    hover: "hover:border-emerald-300 hover:bg-emerald-50/80",
  },
  {
    name: "Dizayn",
    description: "UI/UX, web dizayn va grafik dizayn asoslari.",
    icon: Palette,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
    hover: "hover:border-violet-300 hover:bg-violet-50/80",
  },
  {
    name: "Fitnes",
    description: "Sog'lom turmush tarzi va mashg'ulot dasturlari.",
    icon: Dumbbell,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    hover: "hover:border-orange-300 hover:bg-orange-50/80",
  },
  {
    name: "Boshqa ko'nikmalar",
    description: "Til o'rganish, biznes va shaxsiy rivojlanish.",
    icon: Star,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    hover: "hover:border-amber-300 hover:bg-amber-50/80",
  },
];

const features = [
  {
    icon: GraduationCap,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "Ekspert o'qituvchilar",
    desc: "Har bir kurs soha mutaxassislari tomonidan tayyorlangan.",
  },
  {
    icon: Clock,
    color: "text-green-700",
    bg: "bg-green-50",
    title: "O'z vaqtingizda o'rganing",
    desc: "Istalgan vaqt, istalgan joydan — mobil va desktop qurilmalarda.",
  },
  {
    icon: Award,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Sertifikat oling",
    desc: "Kursni tugatgach, rasmiy sertifikat bilan bilimingizni tasdiqlang.",
  },
  {
    icon: BarChart3,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Progress kuzating",
    desc: "Shaxsiy dashboard orqali o'z rivojlanishingizni real vaqtda kuzating.",
  },
];

const testimonials = [
  {
    name: "Jasur Toshmatov",
    role: "Frontend Developer",
    text: "i.Dargoh orqali 3 oyda React ni o'rgandim va ish topdim. Kurslar juda tushunarli va amaliy.",
    avatar: "J",
    color: "bg-green-500",
  },
  {
    name: "Malika Yusupova",
    role: "UI/UX Designer",
    text: "Dizayn kurslarining sifati ajoyib. O'qituvchilar har doim yordam berishga tayyor.",
    avatar: "M",
    color: "bg-green-600",
  },
  {
    name: "Bobur Rahimov",
    role: "Digital Marketer",
    text: "Marketing kursidan keyin o'z biznesimni boshladim. Amaliy bilimlar juda foydali bo'ldi.",
    avatar: "B",
    color: "bg-emerald-500",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center bg-white">

      {/* ── HERO ── */}
      <section className="w-full relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Subtle background blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-100/60 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-green-100/40 rounded-full blur-[100px] -z-10" />

        <div className="container px-4 md:px-6 text-center relative z-10">
          <div className="mx-auto max-w-4xl space-y-8">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-[11px] font-black text-green-600 uppercase tracking-[0.25em] shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Zamonaviy Ta'lim Platformasi
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-slate-900">
              Kelajakni{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  i.Dargoh
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 9 Q75 2 150 8 Q225 14 298 6" stroke="url(#u)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="u" x1="0" y1="0" x2="300" y2="0">
                      <stop stopColor="#16a34a"/>
                      <stop offset="1" stopColor="#22c55e"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>{" "}
              bilan bunyod eting
            </h1>

            {/* Subtext */}
            <p className="mx-auto max-w-xl text-base text-slate-500 sm:text-lg font-medium leading-relaxed">
              Ekspertlar tomonidan yaratilgan <strong className="text-slate-700">200+</strong> professional kurs.
              O'z sohangizning eng yaxshisi bo'ling — hoziroq boshlang.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Button size="lg" className="h-13 px-8 text-sm font-black rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all gap-2" asChild>
                <Link href="/courses">
                  O'rganishni boshlash <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-13 px-8 text-sm font-black rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-sm gap-2" asChild>
                <Link href="/register">
                  <Play className="h-4 w-4 fill-slate-700" /> Bepul boshlash
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="pt-4 flex flex-wrap justify-center items-center gap-3 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Ro'yxatdan o'tish bepul</span>
              <span className="text-slate-200">|</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Kredit karta shart emas</span>
              <span className="text-slate-200">|</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Istalgan vaqt bekor qilish</span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-20 mx-auto max-w-2xl">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 p-6 grid grid-cols-3 divide-x divide-slate-100">
              <div className="flex flex-col items-center gap-1 px-4">
                <span className="text-3xl font-black text-slate-900">10K+</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> Talabalar
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 px-4">
                <span className="text-3xl font-black text-slate-900">200+</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3" /> Kurslar
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 px-4">
                <span className="text-3xl font-black text-slate-900">50+</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Star className="h-3 w-3" /> Ekspertlar
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="w-full py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-14 space-y-3">
            <p className="text-[11px] font-black text-green-600 uppercase tracking-[0.3em]">Nima uchun i.Dargoh?</p>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl text-slate-900">
              O'rganish hech qachon bu qadar <span className="text-green-600">oson</span> bo'lmagan
            </h2>
            <p className="max-w-md mx-auto text-slate-500 text-sm font-medium leading-relaxed">
              Zamonaviy ta'lim texnologiyalari va tajribali o'qituvchilar bilan maqsadingizga erishing.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="group p-7 rounded-3xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-black text-slate-900 mb-2 text-base">{f.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="w-full py-24 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-14 space-y-3">
            <p className="text-[11px] font-black text-green-600 uppercase tracking-[0.3em]">Yo'nalishlar</p>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl text-slate-900">
              Yo'nalishingizni tanlang
            </h2>
            <p className="max-w-md mx-auto text-slate-500 text-sm font-medium leading-relaxed">
              Zamonaviy bozor talablariga mos kadr bo'lish uchun maxsus ishlab chiqilgan kurslar.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/courses?category=${cat.name}`}
                className={`group relative overflow-hidden rounded-3xl bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80 ${cat.border} border ${cat.hover}`}
              >
                <div className="flex items-start gap-5">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <cat.icon className={`w-7 h-7 ${cat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 text-lg mb-1">{cat.name}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">{cat.description}</p>
                  </div>
                </div>
                <div className={`mt-5 flex items-center text-[11px] font-black uppercase tracking-[0.2em] ${cat.color} gap-1.5`}>
                  Kurslarni ko'rish <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="w-full py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-14 space-y-3">
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">Talabalar fikri</p>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl text-slate-900">
              Ular allaqachon muvaffaqiyatga erishdi
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="p-8 rounded-3xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-black text-sm`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="w-full py-24 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-10 md:p-16 shadow-2xl shadow-green-200">
            {/* Decorative blobs */}
            <div className="absolute -top-1/2 -right-1/4 w-[80%] h-[200%] bg-white/10 rounded-full blur-[80px]" />
            <div className="absolute top-1/2 -left-1/4 w-[50%] h-[100%] bg-black/10 rounded-full blur-[80px]" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-[11px] font-black text-white uppercase tracking-[0.25em]">
                  <Zap className="w-3.5 h-3.5" /> O'qituvchi bo'ling
                </div>
                <h2 className="text-3xl font-black tracking-tight sm:text-5xl leading-[1.1] text-white">
                  Bilimingizni dunyoga ulashing
                </h2>
                <p className="text-white/75 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                  O'z kurslaringizni yarating, minglab talabalar bilan ulashing va daromad oling.
                  i.Dargoh bilan o'qituvchilik yangi bosqichga chiqadi.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="h-13 px-8 text-sm font-black rounded-2xl bg-white text-green-700 hover:bg-slate-50 shadow-xl hover:scale-105 transition-all gap-2" asChild>
                    <Link href="/register">
                      <GraduationCap className="w-4 h-4" /> O'qituvchi bo'lish
                    </Link>
                  </Button>
                  <Button size="lg" className="h-13 px-8 text-sm font-black rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all gap-2" asChild>
                    <Link href="/courses">
                      <Globe className="w-4 h-4" /> Kurslarni ko'rish
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right side card */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-sm">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-black text-sm">O'qituvchi statistikasi</p>
                        <p className="text-white/50 text-xs font-medium">Oylik hisobot</p>
                      </div>
                    </div>
                    {[
                      { label: "Jami talabalar", value: "1,240", icon: Users, color: "text-green-300" },
                      { label: "Faol kurslar", value: "8", icon: BookOpen, color: "text-green-200" },
                      { label: "Sertifikatlar", value: "340", icon: Award, color: "text-amber-300" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-white/60 text-xs font-medium">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          {item.label}
                        </span>
                        <span className="text-white font-black text-sm">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -top-4 -right-4 bg-amber-400 text-amber-900 rounded-2xl px-4 py-2 shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest">Top O'qituvchi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="w-full py-24 bg-white">
        <div className="container px-4 md:px-6 text-center">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-black tracking-tight md:text-5xl text-slate-900 leading-tight">
              Bugun boshlang.<br />
              <span className="text-green-600">Kelajak kutmoqda.</span>
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              10,000+ talaba allaqachon o'z kelajagini quryapti. Siz ham qo'shiling.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Button size="lg" className="h-13 px-10 text-sm font-black rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 hover:scale-[1.02] transition-all gap-2" asChild>
                <Link href="/register">
                  Bepul ro'yxatdan o'tish <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-13 px-10 text-sm font-black rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all gap-2" asChild>
                <Link href="/courses">Kurslarni ko'rish</Link>
              </Button>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Kredit karta talab qilinmaydi · Istalgan vaqt bekor qilish mumkin
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
