import Link from "next/link";
import { ArrowLeft, Award, CheckCircle, Download, Share2, Star, Shield, Zap } from "lucide-react";

const steps = [
  { num: "01", title: "Kursga yoziling", desc: "Qiziqtirgan kursni tanlang va ro'yxatdan o'ting. Bepul kurslar uchun darhol kirish beriladi." },
  { num: "02", title: "Barcha darslarni tugatng", desc: "Har bir modul va darsni ketma-ket o'tib chiqing. Progress avtomatik saqlanadi." },
  { num: "03", title: "Testlarni topshiring", desc: "Har bir modul oxiridagi testlarni muvaffaqiyatli topshiring." },
  { num: "04", title: "Sertifikat oling", desc: "Kursni 100% tugatgandan so'ng sertifikat avtomatik beriladi va yuklab olish mumkin." },
];

const features = [
  { icon: Shield, color: "text-blue-600", bg: "bg-blue-50", title: "Rasmiy tasdiqlangan", desc: "Har bir sertifikat LearnEdu tomonidan raqamli imzolangan va tekshirilishi mumkin." },
  { icon: Download, color: "text-emerald-600", bg: "bg-emerald-50", title: "Yuklab olish", desc: "PDF formatda yuklab oling va istalgan joyda foydalaning." },
  { icon: Share2, color: "text-violet-600", bg: "bg-violet-50", title: "Ulashish", desc: "LinkedIn, Telegram va boshqa ijtimoiy tarmoqlarda ulashing." },
  { icon: Star, color: "text-amber-600", bg: "bg-amber-50", title: "XP ballari", desc: "Har bir sertifikat bilan XP ballar yig'ing va reytingda yuqoriga chiqing." },
];

export default function CertificatesInfoPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-4xl px-4 md:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 font-medium transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-6">
            <Award className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Sertifikatlar</h1>
          <p className="text-slate-500 font-medium leading-relaxed max-w-xl mx-auto">
            LearnEdu sertifikatlari sizning bilim va ko'nikmalaringizni rasmiy tasdiqlaydi.
            Ish beruvchilar va hamkorlar uchun ishonchli hujjat.
          </p>
        </div>

        {/* Sample certificate */}
        <div className="mb-16 relative">
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-10 text-center text-white shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6">
                <img src="/logo.png" alt="LearnEdu" className="w-9 h-9 object-contain" />
              </div>
              <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-3">LearnEdu Sertifikati</p>
              <h2 className="text-2xl font-black mb-2">JavaScript Asoslari</h2>
              <p className="text-white/60 text-sm font-medium mb-6">Ushbu sertifikat quyidagi shaxsga beriladi</p>
              <p className="text-3xl font-black text-blue-300 mb-6">Talaba Ismi</p>
              <div className="flex items-center justify-center gap-6 text-xs text-white/40 font-medium">
                <span>2026-yil, 1-yanvar</span>
                <span>•</span>
                <span>LearnEdu.uz</span>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
            Namuna sertifikat
          </div>
        </div>

        {/* How to get */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Qanday olish mumkin?</h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={step.num} className="flex gap-5 p-5 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Sertifikat imkoniyatlari</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                <div className={`w-11 h-11 rounded-2xl ${f.bg} flex items-center justify-center shrink-0`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-500 font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
          <Award className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-3">Birinchi sertifikatni oling!</h3>
          <p className="text-slate-500 font-medium mb-6 text-sm">Hoziroq kursga yoziling va bilimingizni tasdiqlang</p>
          <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-sm shadow-blue-200">
            Kurslarni ko'rish <CheckCircle className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
