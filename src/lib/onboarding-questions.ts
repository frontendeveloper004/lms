// Onboarding savollar — server va client ikkalasida ham import qilish mumkin
// (server-only import yo'q)

export const QUESTIONS = [
  {
    id: 1,
    text: "Yangi qurilma yoki dastur olganingizda birinchi nima qilasiz?",
    emoji: "📱",
    options: [
      { label: "Darhol ishlatib ko'raman, o'zim o'rganaman", value: "explore_independently" },
      { label: "Qo'llanmani o'qib, keyin boshlayman", value: "read_manual_first" },
      { label: "YouTube'dan video ko'rib o'rganaman", value: "watch_tutorial" },
    ],
  },
  {
    id: 2,
    text: "Muammo yechishda qaysi usul sizga yaqinroq?",
    emoji: "🧩",
    options: [
      { label: "Vizual sxema yoki diagramma chizaman", value: "visual_diagram" },
      { label: "Mantiqiy qadamlar ketma-ketligini yozaman", value: "logical_steps" },
      { label: "Bir nechta yechim sinab ko'raman", value: "trial_and_error" },
    ],
  },
  {
    id: 3,
    text: "Qaysi loyiha turi sizni ko'proq qiziqtiradi?",
    emoji: "🚀",
    options: [
      { label: "Ko'rinadigan, chiroyli interfeys yaratish", value: "visual_ui" },
      { label: "Murakkab algoritmlar va tizimlar qurish", value: "complex_systems" },
      { label: "Real muammolarni hal qiluvchi ilovalar", value: "problem_solving_apps" },
    ],
  },
  {
    id: 4,
    text: "Siz qanday muhitda yaxshi ishlaysiz?",
    emoji: "🏠",
    options: [
      { label: "Yolg'iz, tinch muhitda chuqur fikrlab", value: "solo_deep_focus" },
      { label: "Jamoa bilan fikr almashib", value: "team_collaboration" },
      { label: "Erkin, o'z jadvalimda", value: "flexible_schedule" },
    ],
  },
  {
    id: 5,
    text: "Qaysi fan yoki soha sizga maktabda eng qiziqarli edi?",
    emoji: "📚",
    options: [
      { label: "Matematika va mantiq", value: "math_logic" },
      { label: "Tasviriy san'at va dizayn", value: "art_design" },
      { label: "Fizika va texnologiya", value: "physics_tech" },
    ],
  },
  {
    id: 6,
    text: "Kelajakda qanday ish qilishni orzu qilasiz?",
    emoji: "💼",
    options: [
      { label: "Odamlar kundalik hayotida foydalanadigan mahsulot yaratish", value: "consumer_products" },
      { label: "Katta kompaniyalar uchun murakkab tizimlar qurish", value: "enterprise_systems" },
      { label: "Yangi texnologiyalar tadqiq qilish va ixtiro qilish", value: "research_innovation" },
    ],
  },
  {
    id: 7,
    text: "Biror narsa ishlamay qolsa, odatda nima qilasiz?",
    emoji: "🔧",
    options: [
      { label: "Sabr bilan xatoni qidiraman, tizimli tekshiraman", value: "systematic_debug" },
      { label: "Internetdan yechim izlayman, hamjamiyatdan so'rayman", value: "community_search" },
      { label: "Boshqacha yondashuv sinab ko'raman", value: "alternative_approach" },
    ],
  },
  {
    id: 8,
    text: "Qaysi texnologiya sohasi sizni ko'proq hayratga soladi?",
    emoji: "✨",
    options: [
      { label: "Mobil ilovalar va foydalanuvchi tajribasi", value: "mobile_ux" },
      { label: "Sun'iy intellekt va ma'lumotlar tahlili", value: "ai_data" },
      { label: "Xavfsizlik va tizimlarni himoya qilish", value: "security" },
    ],
  },
  {
    id: 9,
    text: "Yangi loyiha boshlaganda birinchi nima qilasiz?",
    emoji: "📋",
    options: [
      { label: "Dizayn va ko'rinishini rejalashtiraman", value: "design_first" },
      { label: "Ma'lumotlar tuzilmasi va arxitekturani o'ylayman", value: "architecture_first" },
      { label: "Tezda prototip yasab, keyin takomillashtiraman", value: "prototype_first" },
    ],
  },
  {
    id: 10,
    text: "5 yildan keyin o'zingizni qanday ko'rasiz?",
    emoji: "🎯",
    options: [
      { label: "Mashhur mahsulot yoki startup asoschisi", value: "founder_creator" },
      { label: "Yirik texnologiya kompaniyasida senior muhandis", value: "senior_engineer" },
      { label: "O'z sohamda mustaqil mutaxassis (freelancer/konsultant)", value: "independent_expert" },
    ],
  },
] as const;

export type Question = (typeof QUESTIONS)[number];
