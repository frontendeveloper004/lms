# LMS-UZ Loyihasi

> **Tahlil sanasi:** 25-May 2026  
> **Loyiha nomi:** lms-uz (Ai.Dargoh LMS)  
> **Maqsad:** O'zbek bozori uchun mo'ljallangan to'liq funksional ta'lim boshqaruv tizimi

---

## 1. Loyiha Haqida Umumiy Ma'lumot

Bu loyiha **Next.js App Router** asosida qurilgan, O'zbek tilidagi to'liq funksional LMS (Learning Management System). Platforma dasturlash va ingliz tili kurslarini qamrab oladi, AI baholash, gamifikatsiya, real-vaqt xabar almashish va imzo tili (ASL) qo'llab-quvvatlash kabi ilg'or xususiyatlarga ega.

**Asosiy rollar:** ADMIN | TEACHER | STUDENT  
**Til:** O'zbek tili (UI to'liq o'zbek tilida)  
**Bozor:** O'zbekiston

---

## 2. Texnologiyalar Steki

### Frontend
| Texnologiya | Versiya | Maqsad |
|---|---|---|
| Next.js | 16.1.7 | App Router, SSR, API Routes |
| React | 19.2.3 | UI framework |
| TypeScript | ^5 | Tip xavfsizligi |
| Tailwind CSS | ^4 | Stilizatsiya |
| Framer Motion | ^12.39.0 | Animatsiyalar |
| Three.js / R3F | ^0.184.0 / ^9.6.1 | 3D WebGL (ASL avatar) |
| TipTap | ^3.23.1 | Rich text editor |
| Monaco Editor | ^4.7.0 | Kod muharriri |
| Sandpack | ^2.20.0 | Live HTML/CSS/JS preview |
| Lucide React | ^0.577.0 | Ikonlar |
| Sonner | ^2.0.7 | Toast bildirishnomalar |

### Backend / Infratuzilma
| Texnologiya | Versiya | Maqsad |
|---|---|---|
| Prisma | ^6.19.2 | ORM |
| SQLite | — | Ma'lumotlar bazasi (dev) |
| jose | ^6.2.1 | JWT (access + refresh tokenlar) |
| bcryptjs | ^3.0.3 | Parol xeshlash |
| Zod | 3.25.28 | Schema validatsiya |
| Upstash Redis | 1.34.8 | SSE fallback + rate limiting |
| Groq SDK | ^1.2.0 | AI baholash (llama-3.3-70b) |
| Cloudinary | 2.6.1 | Rasm/video yuklash |

### Tashqi Xizmatlar
| Xizmat | Maqsad |
|---|---|
| Groq API (llama-3.3-70b-versatile) | AI baholash |
| Groq Whisper (whisper-large-v3) | Audio transkripsiya |
| Judge0 CE API | Kod bajarish (Python, Java, C++, Go, Rust...) |
| Upstash Redis | Real-vaqt SSE fallback |
| Cloudinary | Media saqlash |

---

## 3. Loyiha Arxitekturasi

### Papka Tuzilmasi
```
lms-uz/
├── prisma/
│   ├── schema.prisma          # 20 ta model
│   ├── seed.mjs               # Test ma'lumotlari
│   └── migrations/            # 2 ta migratsiya
├── public/
│   ├── assets/                # Statik fayllar (video, 3D model)
│   └── uploads/               # Foydalanuvchi yuklagan fayllar
│       ├── avatars/
│       └── assignments/
└── src/
    ├── app/
    │   ├── (auth)/            # Login, Register (route group)
    │   ├── admin/             # Admin paneli
    │   ├── student/           # Student portali
    │   ├── teacher/           # O'qituvchi portali
    │   ├── courses/           # Ommaviy kurs katalogi
    │   ├── teachers/          # Ommaviy o'qituvchi profillari
    │   ├── students/          # Ommaviy student profillari
    │   └── api/               # ~50+ API endpoint
    │       ├── admin/
    │       ├── asl/
    │       ├── auth/
    │       ├── courses/
    │       ├── keep-alive/
    │       ├── messages/
    │       ├── piston/
    │       ├── search/
    │       ├── student/
    │       ├── students/
    │       ├── teacher/
    │       ├── teachers/
    │       ├── test-ai/
    │       └── upload/
    ├── components/
    │   ├── admin/
    │   ├── chat/
    │   ├── landing-v2/
    │   ├── student/           # ASL, bildirishnomalar, sidebar
    │   ├── teacher/
    │   ├── ui/                # Umumiy UI komponentlar
    │   └── [shared].tsx       # CodeEditor, LivePreview, va h.k.
    └── lib/
        ├── ai-grading.ts      # Groq AI baholash
        ├── auth.ts            # JWT encrypt/decrypt
        ├── challenges.ts      # Haftalik challengelar
        ├── course-completion.ts # Kurs yakunlash logikasi
        ├── notification-service.ts # Bildirishnoma xizmati
        ├── ranking-system.ts  # XP, liga, streak
        ├── redis-pubsub.ts    # Upstash Redis
        ├── sse-manager.ts     # In-memory SSE
        ├── validations.ts     # Zod schemalar
        └── ...
```

### Arxitektura Patterni

**Server Components birinchi** — barcha dashboard sahifalari `async` server komponentlar sifatida ma'lumot oladi va uni `*Client.tsx` komponentlarga props orqali uzatadi. Bu `useEffect`/`fetch` dan foydalanishni minimallashtirib, SEO va ishlash tezligini yaxshilaydi.

```
page.tsx (Server Component — DB dan ma'lumot oladi)
  └── PageClient.tsx (Client Component — interaktivlik)
```

**Istisno:** `src/app/admin/page.tsx` — `"use client"` + `useEffect` + `fetch()` ishlatadi. Bu boshqa sahifalar bilan nomuvofiq.

---

## 4. Ma'lumotlar Bazasi Sxemasi (20 ta Model)

### Asosiy Modellar

```
User (markaziy model)
├── EnglishTeacherProfile (1:1)
├── UserOnlineStatus (1:1)
├── Course[] (o'qituvchi sifatida)
├── Enrollment[] (student sifatida)
├── CompletedLesson[], CompletedQuiz[]
├── Certificate[]
├── AssignmentSubmission[]
├── Notification[] (yuborilgan + qabul qilingan)
├── CourseComment[], CommentLike[]
├── Message[] (yuborilgan + qabul qilingan)
├── TeacherProject[], TeacherCertificate[]
├── SeasonWinner[]
└── UserChallengeProgress[]

Course
└── Module[]
    ├── Lesson[]
    ├── Quiz[]
    │   └── Question[]
    └── Assignment (1:1)
        └── AssignmentSubmission[]
```

### Gamifikatsiya Modellari
```
Season → SeasonWinner[]
WeeklyChallenge → UserChallengeProgress[]
User: xpPoints, weeklyXp, seasonalXp, streak, league, ...
```

### Muhim Sxema Qarorlari

**To'g'ri qarorlar:**
- `@@index` — barcha asosiy so'rovlar uchun kompozit indekslar mavjud
- `@@unique([studentId, courseId])` — takroriy enrollment oldini oladi
- `@@unique([userId, courseId])` — sertifikat duplikatsiyasini oldini oladi
- `onDelete: Cascade` — bog'liq ma'lumotlar avtomatik o'chiriladi

**Muammoli qarorlar:**
- Rollar, notification turlari, kurs darajalari `String` sifatida saqlangan (SQLite enum qo'llab-quvvatlamaydi, lekin DB darajasida tip xavfsizligi yo'q)
- `options` (quiz), `claimedBadges`, `skills`, `reactions`, `technologies`, `filesCode` — JSON string sifatida saqlangan, qo'lda `JSON.parse/stringify` talab qiladi
- `filesCode` in `AssignmentSubmission` — JSON string, Prisma `Json` tipi ishlatilmagan

---

## 5. Autentifikatsiya Tizimi

### Dual-Token JWT Arxitekturasi

```
Login/Register
    ↓
Access Token (session cookie)    Refresh Token (refresh_token cookie)
  - 24 soat muddati               - 30 kun muddati
  - { userId, role }              - { userId, version }
  - httpOnly, secure, sameSite    - httpOnly, secure, sameSite
```

### Token Revokatsiya
`User.tokenVersion` maydoni — bu raqamni oshirish barcha refresh tokenlarni bekor qiladi (barcha qurilmalardan chiqish).

### Middleware Himoyasi (`src/proxy.ts`)

```
/student  → faqat STUDENT
/teacher  → TEACHER yoki ADMIN
/admin    → faqat ADMIN
/login, /register → autentifikatsiya qilingan foydalanuvchilarni dashboard ga yo'naltiradi
```

**Onboarding redirect:** Student birinchi marta kirganida `/student/onboarding` ga yo'naltiriladi (DB tekshiruvi sahifa darajasida amalga oshiriladi, middleware da emas — to'g'ri qaror).

---

## 6. API Endpointlar (~50+)

### Auth (`/api/auth/`)
- `POST /login` — bcrypt solishtirish, cookie o'rnatish
- `POST /register` — parol xeshlash, foydalanuvchi yaratish
- `GET /refresh` — token yangilash
- `POST /logout` — cookie tozalash
- `POST /logout-all` — tokenVersion oshirish + cookie tozalash

### Kurslar (`/api/courses/`)
- Kurs ro'yxati, detail, enrollment
- Threaded kommentlar (CRUD)
- Modullar boshqaruvi

### Student (`/api/student/`)
- Profil, parol, hisob o'chirish
- Enrollmentlar, sertifikatlar
- Yutuqlar (achievements) + da'vo qilish
- Bildirishnomalar (CRUD + barchasini o'qilgan belgilash)
- Onboarding yakunlash
- Kurs progressi (darslar, testlar, topshiriqlar)
- Yuklash: avatar, cover, audio (speaking topshiriqlari)

### O'qituvchi (`/api/teacher/`)
- Profil, parol, hisob o'chirish
- Kurslar + modullar + darslar + testlar + topshiriqlar (to'liq CRUD)
- Topshiriq baholash (qo'lda + AI)
- Studentlar ro'yxati
- Portfolio (loyihalar, sertifikatlar)

### Admin (`/api/admin/`)
- Kurs tasdiqlash/rad etish
- Foydalanuvchi boshqaruvi (rol o'zgartirish, o'chirish)

### Xabarlar (`/api/messages/`)
- Xabar yuborish/olish
- Suhbatlar ro'yxati
- SSE stream (real-vaqt)
- Emoji reaksiyalar
- Xabar tahrirlash/o'chirish (soft delete)

### Boshqalar
- `POST /api/piston` — kod bajarish proksi (Judge0 CE)
- `POST /api/asl/process` — ASL imzo tili tarjimasi
- `GET /api/search` — global qidiruv
- `GET /api/keep-alive` — Vercel cron (har 4 daqiqada)

---

## 7. Asosiy Xususiyatlar

### 7.1 Kurs Tizimi
- Kurs yaratish: modullar, darslar (video + rich text + qo'shimchalar), testlar, topshiriqlar
- Kurs tasdiqlash jarayoni: PENDING → APPROVED/REJECTED (admin tomonidan)
- Student enrollment + progress kuzatish (dars, test, topshiriq darajasida)
- Avtomatik sertifikat berish (100% yakunlanganda)
- Sertifikat PDF/rasm eksporti (`html2canvas`, `jspdf`, `dom-to-image-more`)

### 7.2 Topshiriq Turlari (16 ta)
```
Dasturlash:
  HTML_CSS_JS, REACT, VUE, VANILLA_TS
  PYTHON, KOTLIN, SWIFT, CPP, JAVA, GO, RUST, PHP

Ingliz tili:
  ENGLISH_READING, ENGLISH_WRITING, ENGLISH_LISTENING, ENGLISH_SPEAKING
```

### 7.3 AI Baholash (Groq)
- **Model:** llama-3.3-70b-versatile
- **Audio:** Whisper (whisper-large-v3) — speaking topshiriqlari uchun transkripsiya
- **Baholash:** 0-100 ball, har bir mezon bo'yicha breakdown, ishonch darajasi
- **IELTS mezonlari:** Writing (Task Response, Coherence, Lexical, Grammar), Speaking (Fluency, Lexical, Grammar, Pronunciation), Reading (Accuracy, Evidence, Vocabulary)
- **XP bonus:** Ball asosida (95+ → 1000 XP, 85+ → 800 XP, ...)
- **Feedback:** O'zbek tilida, studentga bevosita murojaat

### 7.4 Kod Bajarish
- **Live preview:** Sandpack (HTML/CSS/JS, React, Vue)
- **Server-side:** Judge0 CE (Python, Java, C++, Go, Rust, Kotlin, PHP)
- **Ko'p fayllik loyiha:** `FileSystemEditor`, `MultiFileEditor`
- **Maxsus:** `KotlinPlaygroundPreview`, `SwiftPreview`

### 7.5 Gamifikatsiya
```
XP tizimi:
  - Dars yakunlash → XP
  - Test o'tish → XP
  - Topshiriq baholash → XP + AI bonus
  - Streak multiplikatori: +2% har kun, max +30%

Liga tizimi (oylik XP asosida):
  BRONZA (0) → KUMUSH (500) → OLTIN (1500) → PLATINA (3500) → ALMOS (7500)

Streak:
  - Ketma-ket kunlik faollik
  - 1 kun o'tkazib yuborilsa — streak nolga tushadi

Haftalik challengelar:
  - Maqsad turlari: LESSONS, QUIZZES, SCORE, XP
  - Mukofot: XP

Oylik mavsumlar:
  - Har oy yangi mavsum avtomatik yaratiladi
  - Top-3 g'oliblar saqlanadi
```

### 7.6 Real-Vaqt Tizimi (SSE)

**Dual-layer arxitektura:**
```
notifyUser() chaqiriladi
    ↓
Layer 1: In-memory (0ms)
  sse-manager Map → to'g'ridan-to'g'ri SSE controller

Layer 2: Upstash Redis fallback (300ms polling)
  Redis RPUSH → polling → SSE
  (ko'p tab, boshqa server instance uchun)
```

**Bildirishnomalar:**
- `ASSIGNMENT_SUBMITTED` — o'qituvchiga
- `ASSIGNMENT_GRADED` — studentga
- `COURSE_COMPLETED` — studentga
- `COMMENT_REPLY`, `COMMENT_MENTION`, `COMMENT_LIKED` — tegishli foydalanuvchiga

**Online holat:** `UserOnlineStatus` modeli + Redis orqali kuzatiladi

### 7.7 Xabar Almashish
- Student ↔ O'qituvchi to'g'ridan-to'g'ri xabar
- Emoji reaksiyalar (JSON sifatida saqlangan)
- Xabar tahrirlash + soft delete (`deletedAt`)
- O'qilmagan xabarlar soni
- Real-vaqt yetkazib berish (SSE orqali)

### 7.8 Ijtimoiy Xususiyatlar
- Kurs izohlari (threaded, like, pin, tahrirlash)
- @mention qo'llab-quvvatlash
- Ommaviy o'qituvchi/student profillari
- O'qituvchi portfolio (loyihalar, sertifikatlar)

### 7.9 Maxsus Imkoniyatlar (Accessibility)
- **ASL (American Sign Language)** tarjimasi dars mazmuni uchun
- Python mikroxizmati: matn → glosslar → pose kalit nuqtalari
- 3D animatsiyali avatar (Three.js/R3F) imzo tilini ko'rsatadi
- `AccessibilityPanel` komponenti
- Fallback demo pozalar (Python xizmati mavjud bo'lmaganda)

### 7.10 Ingliz Tili O'qituvchilari
Kengaytirilgan profil:
- IELTS bali, TESOL/TEFL sertifikati
- Dars narxi, sinov darsi mavjudligi
- O'qitish formati (Online/Offline/Ikkalasi)
- WhatsApp URL, mavjudlik jadvali

---

## 8. Kod Sifati Tahlili

### Kuchli Tomonlar

**1. Server Component patterni izchil qo'llanilgan**
```typescript
// page.tsx — server component, DB dan ma'lumot oladi
export default async function StudentDashboard() {
  const data = await prisma.enrollment.findMany(...)
  return <DashboardClient data={data} />
}
```

**2. N+1 so'rov muammosi hal qilingan**
`NotificationService.getNotifications()` — notification turlariga qarab guruhlash + batch queries + lookup Map'lar. Kod ichida izoh bilan hujjatlashtirilgan.

**3. Zod validatsiya hamma joyda**
```typescript
export async function validateBody<T>(req, schema) { ... }
// Barcha API route'larda ishlatiladi
```

**4. Token revokatsiya tizimi**
`tokenVersion` patterni — barcha qurilmalardan chiqish uchun token blacklist siz.

**5. Yaxshi indekslash**
```prisma
@@index([status, createdAt])
@@index([teacherId, status])
@@index([senderId, receiverId])
```

**6. Biznes logikasi ajratilgan**
`src/lib/` papkasida: `ai-grading.ts`, `course-completion.ts`, `ranking-system.ts`, `notification-service.ts` — route handler'lardan alohida.

**7. Rate limiting ikki qatlamli**
- Middleware: in-memory (tez, lekin instance-specific)
- API routes: Upstash Redis (ishonchli, multi-instance)

**8. Kurs yakunlash logikasi samarali**
`checkCourseCompletion()` — bitta so'rovda barcha modullar, darslar, testlar, topshiriqlarni yuklaydi.

---

### Muammolar va Yaxshilash Kerak Bo'lgan Joylar

#### 🔴 Kritik (Production uchun)

**1. SQLite production da ishlatilmoqda**
```
prisma/schema.prisma:
  provider = "sqlite"
```
SQLite bir vaqtda yozishni qo'llab-quvvatlamaydi, gorizontal masshtablash imkonsiz, fayl asosida saqlash. Vercel da deploy qilinsa, har redeployda ma'lumotlar yo'qoladi.

**Yechim:** PostgreSQL ga o'tish (Neon, Supabase, PlanetScale)

**2. Vercel ephemeral filesystem**
`/api/keep-alive` cron (har 4 daqiqada) — bu Vercel free tier da cold start oldini olish uchun. Lekin SQLite fayli Vercel serverining vaqtinchalik xotirasida — redeploy da yo'qoladi.

**3. Python ASL xizmati deployment strategiyasi yo'q**
`localhost:5050` ga ulanadi — production da bu ishlaydi, lekin alohida deploy qilish kerak (Docker, Railway, va h.k.)

#### 🟡 O'rta (Kod sifati)

**4. Admin dashboard client component**
```typescript
// src/app/admin/page.tsx
"use client"
// useEffect + fetch() — boshqa sahifalar bilan nomuvofiq
```
Server component ga o'tkazish kerak.

**5. JSON string'lar o'rniga to'g'ri tiplar**
```prisma
// Hozir:
options  String  // "[\"A\", \"B\", \"C\"]"
skills   String  // "[\"React\", \"Node\"]"
reactions String // "{\"👍\": [\"userId1\"]}"

// Kerak:
// PostgreSQL ga o'tgandan keyin Prisma Json tipi ishlatish
```

**6. `any` tipi ishlatilgan**
```typescript
// src/lib/ranking-system.ts
const updateData: any = { ... }
```
Prisma update tipi bilan to'g'ri yozish kerak.

**7. Sertifikat kodi xavfsiz emas**
```typescript
// Hozir:
code: `CR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
// Kriptografik jihatdan xavfsiz emas, to'qnashuv ehtimoli bor

// Yaxshiroq:
code: `CR-${crypto.randomUUID().substring(0, 8).toUpperCase()}`
```

**8. Middleware in-memory rate limiter ishonchsiz**
```typescript
// src/proxy.ts
const store = new Map<string, RateLimitEntry>()
// Cold start da tozalanadi, multi-instance da ishlamaydi
```
Upstash rate limiter API route'larda to'g'ri yondashuv — middleware dagi in-memory versiya ortiqcha.

#### 🟢 Kichik (Yaxshilash mumkin)

**9. `next` versiyasi noodatiy**
`"next": "16.1.7"` — Next.js ommaviy versiyalari 14.x → 15.x ketma-ketligida. Bu versiya raqami tekshirilishi kerak.

**10. `middleware.ts` fayli yo'q (ehtimol)**
Middleware logikasi `src/proxy.ts` da — `src/middleware.ts` uni re-export qilishi kerak. Bu to'g'ri ishlayotganini tasdiqlash kerak.

**11. Onboarding redirect middleware da to'liq emas**
```typescript
// src/proxy.ts — izoh bor:
// "Bu yerda faqat /student/onboarding ga yo'naltirish logikasi sahifada bo'ladi"
// Middleware da DB yo'q — shuning uchun sahifa darajasida tekshiriladi
```
Bu to'g'ri yondashuv, lekin izoh qoldirilgan kod (commented-out logic) chalkashlik yaratishi mumkin.

---

## 9. Xavfsizlik Tahlili

### Yaxshi Amalga Oshirilgan
- ✅ `bcryptjs` — parol xeshlash
- ✅ `httpOnly` cookie — XSS dan himoya
- ✅ `secure` flag production da
- ✅ `sameSite: lax` — CSRF himoyasi
- ✅ JWT imzolash (HS256)
- ✅ Token revokatsiya (`tokenVersion`)
- ✅ Role-based access control (middleware + API route'larda)
- ✅ Zod validatsiya — injection oldini oladi
- ✅ Rate limiting (auth, upload, piston, umumiy)
- ✅ `require-role.ts` — API route'larda rol tekshiruvi

### Diqqat Talab Qiladigan Joylar
- ⚠️ JWT secret minimal uzunlik tekshiruvi bor (`min(16)`) — production da kamida 32 belgi tavsiya etiladi
- ⚠️ File upload — Cloudinary ishlatiladi (yaxshi), lekin `public/uploads/` papkasida ham fayllar bor — bu fayllar server da to'g'ridan-to'g'ri saqlanmoqda
- ⚠️ `test-ai` endpoint — production da o'chirilishi kerak

---

## 10. Ishlash Tezligi (Performance)

### Yaxshi Optimizatsiyalar
- ✅ Server Components — client-side fetch minimal
- ✅ Batch queries (N+1 muammosi hal qilingan)
- ✅ Prisma indekslari
- ✅ SSE dual-layer (in-memory 0ms + Redis fallback)
- ✅ `Promise.all()` parallel so'rovlar uchun

### Yaxshilash Mumkin
- ⚠️ `checkCourseCompletion()` — har topshiriq yuborilganda barcha kurs ma'lumotlarini yuklaydi. Katta kurslarda sekin bo'lishi mumkin
- ⚠️ Rasm optimizatsiyasi — `next/image` ishlatilganini tekshirish kerak
- ⚠️ SQLite — concurrent write bottleneck

---

## 11. Test Qamrovi

`jest.config.ts` mavjud, lekin test fayllari topilmadi. Loyihada avtomatlashtirilgan testlar yo'q ko'rinadi.

**Tavsiya:** Kamida quyidagilar uchun unit testlar:
- `ranking-system.ts` (XP hisoblash, streak logikasi)
- `course-completion.ts` (progress hisoblash)
- `ai-grading.ts` (score normalizatsiya)
- `validations.ts` (Zod schemalar)

---

## 12. Umumiy Baho

### Kuchli Tomonlar Xulosasi
1. **Keng qamrovli funksionallik** — oddiy LMS dan ancha ko'p: AI baholash, gamifikatsiya, ASL, real-vaqt xabar almashish
2. **Izchil arxitektura** — Server Components patterni yaxshi qo'llanilgan
3. **Yaxshi kod tashkili** — biznes logikasi `lib/` da ajratilgan
4. **Xavfsizlik asoslari** — JWT, bcrypt, RBAC, rate limiting barchasi mavjud
5. **O'zbek bozori uchun moslashtirilgan** — UI to'liq o'zbek tilida, liga nomlari ham o'zbekcha

### Asosiy Muammolar Xulosasi
1. **SQLite** — production uchun mos emas, PostgreSQL ga o'tish zarur
2. **Testlar yo'q** — `jest.config.ts` bor, lekin test fayllari yo'q
3. **Admin dashboard** — boshqa sahifalar bilan nomuvofiq pattern
4. **JSON string'lar** — PostgreSQL ga o'tgandan keyin to'g'ri tiplar ishlatish kerak
5. **Python xizmati** — deployment strategiyasi aniq emas

### Umumiy Baho: **7.5/10**

Bu loyiha solo yoki kichik jamoa uchun juda katta va yaxshi amalga oshirilgan. Asosiy muammo — production deployment uchun tayyor emas (SQLite, ephemeral storage). Kod sifati va arxitektura esa professional darajada.

---

## 13. Keyingi Qadamlar (Tavsiyalar)

### Muhim (Birinchi navbatda)
1. **PostgreSQL ga o'tish** — Neon yoki Supabase (bepul tier mavjud)
2. **Prisma schema yangilash** — `Json` tipi, enum'lar
3. **Test yozish** — kamida asosiy biznes logikasi uchun

### O'rta muhimlik
4. **Admin dashboard** — server component ga o'tkazish
5. **Sertifikat kodi** — `crypto.randomUUID()` ishlatish
6. **Python ASL xizmati** — Docker yoki Railway ga deploy qilish
7. **`test-ai` endpoint** — production da o'chirish yoki himoyalash

### Kichik yaxshilanishlar
8. **`any` tiplarini** to'g'ri TypeScript tiplari bilan almashtirish
9. **Middleware in-memory rate limiter** — olib tashlash (Upstash yetarli)
10. **`next` versiyasini** tekshirish va rasmiy versiyaga o'tkazish

---

*Tahlil 25-May 2026 da tayyorlandi*
