import Link from "next/link";
import { ArrowLeft, FileText, Shield, AlertCircle, Users, BookOpen, CreditCard } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-3xl px-4 md:px-6 py-12">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 font-medium transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">Foydalanish Shartlari</h1>
          <p className="text-slate-500 font-medium">Oxirgi yangilanish: 1-yanvar, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">

          <section className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
            <p className="text-slate-700 font-medium leading-relaxed text-sm">
              LearnEdu platformasidan foydalanish orqali siz ushbu foydalanish shartlarini to'liq qabul qilasiz.
              Agar siz ushbu shartlarga rozi bo'lmasangiz, platformadan foydalanmang.
            </p>
          </section>

          {[
            {
              icon: Users,
              title: "1. Ro'yxatdan o'tish va hisob",
              content: [
                "Platformadan foydalanish uchun ro'yxatdan o'tish talab etiladi.",
                "Siz to'g'ri va to'liq ma'lumot kiritishingiz shart.",
                "Hisobingiz xavfsizligi uchun siz javobgarsiz.",
                "Bir shaxs faqat bitta hisob yaratishi mumkin.",
                "18 yoshdan kichik foydalanuvchilar ota-ona ruxsati bilan ro'yxatdan o'tishi kerak.",
              ]
            },
            {
              icon: BookOpen,
              title: "2. Kurslar va kontent",
              content: [
                "Barcha kurs materiallari mualliflik huquqi bilan himoyalangan.",
                "Kurs materiallarini uchinchi shaxslarga tarqatish taqiqlanadi.",
                "O'qituvchilar o'z kurslarining sifati uchun javobgar.",
                "LearnEdu kurs kontentini moderatsiya qilish huquqini o'zida saqlab qoladi.",
                "Kursga yozilgandan so'ng materiallar cheksiz muddatga foydalanish uchun ochiq bo'ladi.",
              ]
            },
            {
              icon: Shield,
              title: "3. Foydalanuvchi majburiyatlari",
              content: [
                "Platformada boshqa foydalanuvchilarga hurmat bilan munosabatda bo'ling.",
                "Spam, reklama yoki zararli kontent joylash taqiqlanadi.",
                "Platformaning texnik tizimlariga zarar yetkazish taqiqlanadi.",
                "Boshqa foydalanuvchilarning shaxsiy ma'lumotlarini to'plash taqiqlanadi.",
              ]
            },
            {
              icon: CreditCard,
              title: "4. To'lov va qaytarish",
              content: [
                "Pullik kurslarga to'lov amalga oshirilgandan so'ng kursga kirish beriladi.",
                "Kursni boshlashdan oldin 7 kun ichida to'liq qaytarish mumkin.",
                "Kursning 30% dan ko'prog'ini o'rganib bo'lgandan so'ng qaytarish amalga oshirilmaydi.",
                "Bepul kurslar uchun hech qanday to'lov talab etilmaydi.",
              ]
            },
            {
              icon: AlertCircle,
              title: "5. Mas'uliyatni cheklash",
              content: [
                "LearnEdu kurslar orqali olingan bilimlarning amaliy natijalarini kafolatlamaydi.",
                "Platforma texnik nosozliklar uchun cheklangan mas'uliyat oladi.",
                "Uchinchi tomon saytlariga havolalar uchun LearnEdu javobgar emas.",
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
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Savollaringiz bormi?{" "}
              <a href="https://t.me/Web_Frontend_Developer" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 font-bold hover:underline">
                Biz bilan bog'laning
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
