import Link from "next/link";
import { ArrowLeft, Lock, Eye, Database, Bell, Trash2, Globe } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-3xl px-4 md:px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 font-medium transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>

        <div className="mb-10">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-5">
            <Lock className="w-6 h-6 text-violet-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">Maxfiylik Siyosati</h1>
          <p className="text-slate-500 font-medium">Oxirgi yangilanish: 1-yanvar, 2026</p>
        </div>

        <div className="space-y-8">

          <section className="p-6 rounded-2xl bg-violet-50 border border-violet-100">
            <p className="text-slate-700 font-medium leading-relaxed text-sm">
              LearnEdu sizning shaxsiy ma'lumotlaringizni himoya qilishni jiddiy qabul qiladi.
              Ushbu siyosat qanday ma'lumotlar to'planishi va ulardan qanday foydalanilishi haqida ma'lumot beradi.
            </p>
          </section>

          {[
            {
              icon: Database,
              title: "1. To'planadigan ma'lumotlar",
              items: [
                "Ism va familiya — ro'yxatdan o'tishda",
                "Email manzil — kirish va xabarnomalar uchun",
                "O'quv faoliyati — kurs progressi va yutuqlar",
                "Qurilma ma'lumotlari — texnik maqsadlar uchun",
                "To'lov ma'lumotlari — pullik kurslar uchun (xavfsiz tarzda)",
              ]
            },
            {
              icon: Eye,
              title: "2. Ma'lumotlardan foydalanish",
              items: [
                "Platformani yaxshilash va xizmat sifatini oshirish",
                "Yangi kurslar va materiallar haqida xabardor qilish",
                "Texnik muammolarni hal qilish",
                "Foydalanuvchi tajribasini shaxsiylashtirish",
                "Qonuniy majburiyatlarni bajarish",
              ]
            },
            {
              icon: Globe,
              title: "3. Ma'lumotlarni ulashish",
              items: [
                "Biz sizning ma'lumotlaringizni uchinchi shaxslarga sotmaymiz.",
                "Ma'lumotlar faqat xizmat ko'rsatuvchi hamkorlar bilan ulashilishi mumkin.",
                "Qonuniy talablar bo'yicha davlat organlariga ma'lumot berilishi mumkin.",
                "O'qituvchilar faqat o'z kurslaridagi talabalar ma'lumotlarini ko'radi.",
              ]
            },
            {
              icon: Bell,
              title: "4. Cookie fayllar",
              items: [
                "Biz sessiya va autentifikatsiya uchun cookie fayllardan foydalanamiz.",
                "Analitika uchun anonim ma'lumotlar to'planadi.",
                "Brauzer sozlamalarida cookie fayllarni o'chirib qo'yishingiz mumkin.",
              ]
            },
            {
              icon: Trash2,
              title: "5. Sizning huquqlaringiz",
              items: [
                "Shaxsiy ma'lumotlaringizni ko'rish va tahrirlash huquqi",
                "Ma'lumotlaringizni o'chirish talabi (hisobni o'chirish orqali)",
                "Marketing xabarnomalaridan voz kechish huquqi",
                "Ma'lumotlaringizni eksport qilish huquqi",
              ]
            },
          ].map((section) => (
            <section key={section.title} className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <section.icon className="w-4 h-4 text-slate-600" />
                </div>
                {section.title}
              </h2>
              <ul className="space-y-2 ml-11">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Maxfiylik bo'yicha savollar uchun{" "}
              <a href="https://t.me/Web_Frontend_Developer" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 font-bold hover:underline">
                biz bilan bog'laning
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
