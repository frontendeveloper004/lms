import Link from "next/link";
import { ArrowLeft, Target, Users, BookOpen, Award, Zap, Heart, Globe, GraduationCap } from "lucide-react";

const stats = [
  { value: "10K+", label: "Faol talabalar", icon: Users },
  { value: "200+", label: "Professional kurslar", icon: BookOpen },
  { value: "50+", label: "Ekspert o'qituvchilar", icon: GraduationCap },
  { value: "95%", label: "Mamnunlik darajasi", icon: Heart },
];

const values = [
  {
    icon: Target,
    color: "text-blue-600",
    bg: "bg-blue-50",
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
    role: "Asoschisi & Bosh o'qituvchi",
    avatar: "H",
    color: "bg-blue-500",
    desc: "Frontend dasturlash bo'yicha 5+ yillik tajriba. React, Next.js mutaxassisi.",
    telegram: "https://t.me/Web_Frontend_Developer",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-4xl px-4 md:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 font-medium transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <img src="/logo.png" alt="LearnEdu" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Biz haqimizda
          </h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-xl mx-auto text-base">
            LearnEdu — O'zbekistondagi zamonaviy online ta'lim platformasi. Bizning maqsadimiz
            har bir o'zbek yoshiga sifatli IT ta'limini yetkazib berish.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="mb-16 p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
          <h2 className="text-2xl font-black mb-4">Bizning missiyamiz</h2>
          <p className="text-white/80 font-medium leading-relaxed text-base">
            O'zbekistonda IT sohasidagi bilim va ko'nikmalar bo'shlig'ini to'ldirish. Har bir talabaga
            ekspert o'qituvchilardan sifatli ta'lim olish, sertifikat qo'lga kiritish va karyerasini
            rivojlantirish imkoniyatini yaratish — bu LearnEdu ning asosiy maqsadi.
          </p>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Bizning qadriyatlarimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {values.map((v) => (
              <div key={v.title} className="flex gap-4 p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all">
                <div className={`w-11 h-11 rounded-2xl ${v.bg} flex items-center justify-center shrink-0`}>
                  <v.icon className={`w-5 h-5 ${v.color}`} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Jamoa</h2>
          <div className="flex justify-center">
            {team.map((member) => (
              <div key={member.name} className="text-center p-8 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all max-w-xs w-full">
                <div className={`w-20 h-20 rounded-3xl ${member.color} flex items-center justify-center text-white font-black text-2xl mx-auto mb-5 shadow-lg`}>
                  {member.avatar}
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-1">{member.name}</h3>
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">{member.role}</p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-5">{member.desc}</p>
                <a href={member.telegram} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.697l-2.95-.924c-.64-.203-.654-.64.136-.953l11.57-4.461c.537-.194 1.006.131.326.889z"/>
                  </svg>
                  Telegram
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 rounded-3xl bg-slate-50 border border-slate-100">
          <h3 className="text-xl font-black text-slate-900 mb-3">Bizga qo'shiling!</h3>
          <p className="text-slate-500 font-medium mb-6 text-sm">10,000+ talaba bilan birga o'rganishni boshlang</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-sm shadow-blue-200">
              Bepul ro'yxatdan o'tish
            </Link>
            <Link href="/courses" className="px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all">
              Kurslarni ko'rish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
