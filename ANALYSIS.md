# LMS-UZ — To'liq Loyiha Tahlili (v3)

> Tahlil sanasi: 18-May 2026  
> Avvalgi tahlildan barcha yangilanishlar hisobga olingan

---

## Loyiha haqida

**LMS-UZ** — O'zbekiston uchun to'liq funksional Learning Management System. Dasturlash va ingliz tili kurslarini o'qitishga mo'ljallangan, 3 rollik (Admin / Teacher / Student) platforma.

---

## Texnologiyalar Stack

### Frontend
| Texnologiya | Versiya | Maqsad |
|---|---|---|
| **Next.js** | 16.1.7 | Full-stack React framework (App Router) |
| **React** | 19.2.3 | UI library |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | ^4 | Styling |
| **Lucide React** | ^0.577 | Ikonlar |
| **Sonner** | ^2.0.7 | Toast notifications |
| **TipTap** | ^3.23 | Rich text editor (kurs kontenti uchun) |
| **Monaco Editor** | ^4.7 | VS Code-like kod muharriri |
| **Sandpack** | ^2.20 | In-browser React/Vue/TS sandbox |
| **canvas-confetti** | ^1.9 | Animatsiyalar (sertifikat olishda) |
| **jsPDF + html2canvas** | latest | Sertifikat PDF export |
| **dom-to-image-more** | ^3.7 | DOM → rasm konvertatsiya |

### Backend (Next.js API Routes)
| Texnologiya | Maqsad |
|---|---|
| **Next.js API Routes** | REST API endpointlar (Middleware orqali himoyalangan) |
| **Jose** | JWT access token (24h) + refresh token (30d), HS256 |
| **bcryptjs** | Parol hashing |
| **Zod** | Input validation (barcha API'larda) |
| **Sharp** | Rasm optimizatsiyasi |

### Database
| Texnologiya | Maqsad |
|---|---|
| **Prisma ORM** | ^6.19 — Type-safe database abstraction |
| **SQLite** (hozir) | Local development DB |
| **PostgreSQL** (rejalashtirilgan) | Production uchun (POSTGRESQL_MIGRATION.md mavjud) |

### AI / Tashqi Servislar
| Texnologiya | Maqsad |
|---|---|
| **Groq** — `llama-3.3-70b-versatile` | Asosiy AI baholash (kod, essay, reading) |
| **Groq** — `whisper-large-v3` | Speaking topshiriqlari uchun audio transkripsiya |
| **OpenAI SDK** | O'rnatilgan, lekin to'liq integratsiya yo'q |
| **@google/genai** | O'rnatilgan, lekin to'liq integratsiya yo'q |
| **Cloudinary** | Rasm/video upload va CDN |
| **Upstash Redis** | Rate limiting + SSE fallback queue + online status |

### Real-time Arxitektura
| Texnologiya | Maqsad |
|---|---|
| **SSE (Server-Sent Events)** | Real-time chat + notifikatsiyalar — bitta endpoint |
| **In-memory Map** | Layer 1: 0ms delivery (bir server instance) |
| **Upstash Redis Queue** | Layer 2: 300ms polling fallback (multi-tab, multi-instance) |

### Kod Execution Muhitlari
| Muhit | Tillar | Mexanizm |
|---|---|---|
| **Judge0 CE** (bepul) | C++, Java, Go, Rust, PHP, Python, Kotlin | `/api/piston` orqali server-side |
| **Pyodide** | Python | Browser-side (WebAssembly) |
| **Sandpack** | React, Vue, TypeScript | Browser-side sandbox |
| **KotlinPlayground** | Kotlin | JetBrains embed |
| **SwiftFiddle** | Swift | Online compiler embed |
| **iframe** | HTML/CSS/JS | Browser-side live preview |

---

## Arxitektura

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/login & register   # Autentifikatsiya
│   ├── admin/                    # Admin panel
│   ├── teacher/                  # O'qituvchi dashboard
│   ├── student/
│   │   ├── ranking/              # ★ YANGI: Reyting sahifasi
│   │   ├── achievements/
│   │   ├── catalog/
│   │   ├── certificates/
│   │   ├── courses/
│   │   ├── messages/
│   │   └── settings/
│   ├── students/[studentId]/     # ★ YANGI: Public talaba profili
│   ├── courses/                  # Public kurslar
│   ├── teachers/                 # Public o'qituvchilar
│   └── api/
│       ├── auth/                 # login, register, logout, logout-all, refresh
│       ├── courses/              # kurs CRUD, enroll, comments, modules
│       ├── student/              # profil, achievements, notifications, chat
│       ├── teacher/              # profil, submissions, projects, certificates
│       ├── admin/                # users, courses management
│       ├── messages/             # chat + SSE stream
│       ├── students/[studentId]/ # ★ YANGI: Public talaba profili API
│       ├── piston/               # kod execution (Judge0 CE)
│       ├── upload/               # fayl yuklash
│       ├── search/               # kurs qidirish
│       └── keep-alive/           # DB ping (CRON_SECRET himoyalangan)
├── components/
│   ├── ui/                       # Base UI (button, modal, uploader)
│   ├── chat/                     # ChatWindow, ConversationList, MessagesBadge
│   ├── student/                  # Sidebar, NotificationBell, NotificationDropdown
│   ├── teacher/                  # Sidebar, NotificationBell, NotificationBadge
│   └── admin/                    # AdminProfileTab
├── lib/
│   ├── auth.ts                   # JWT encrypt/decrypt
│   ├── session.ts                # Cookie'dan session o'qish
│   ├── cookies.ts                # setAuthCookies / clearAuthCookies
│   ├── require-role.ts           # API route role guard
│   ├── prisma.ts                 # Singleton PrismaClient + validateEnv()
│   ├── validations.ts            # Barcha Zod schemalar
│   ├── ai-grading.ts             # Groq AI baholash servisi
│   ├── course-completion.ts      # Kurs tugash + sertifikat yaratish
│   ├── notification-service.ts   # NotificationService class
│   ├── notification-triggers.ts  # Submission/grading trigger funksiyalari
│   ├── notification-utils.ts     # formatBadgeCount, formatRelativeTime
│   ├── sse-manager.ts            # In-memory SSE connection registry
│   ├── redis-pubsub.ts           # Upstash Redis singleton + online status
│   ├── rate-limit.ts             # Upstash rate limiters (5 ta)
│   ├── streak.ts                 # computeStreak() — ketma-ket o'qish kunlari
│   ├── task-types.ts             # 16 ta task type konfiguratsiyasi
│   ├── ranking-system.ts         # ★ YANGI: Liga, XP, streak multiplier
│   ├── challenges.ts             # ★ YANGI: Haftalik challengelar
│   ├── file-system.ts            # Fayl tizimi yordamchi funksiyalar
│   └── data/
│       ├── student.ts            # Server-side data fetchers + getRankingData()
│       └── teacher.ts            # Server-side teacher data fetchers
├── proxy.ts                      # Next.js Middleware (rate limit + auth guard)
└── types/
    └── profile.ts
```

---

## ★ YANGI: Reyting (Leaderboard) Tizimi

Bu versiyaning asosiy yangiligi — to'liq gamification va reyting tizimi.

### Liga Tizimi
| Liga | Minimal XP (oylik) | Keyingi liga |
|---|---|---|
| 🥉 BRONZA | 0 | 500 XP |
| 🥈 KUMUSH | 500 | 1500 XP |
| 🥇 OLTIN | 1500 | 3500 XP |
| 💎 PLATINA | 3500 | 7500 XP |
| 💠 ALMOS | 7500 | — (max) |

### XP Tizimi
- **Uch xil XP:** `xpPoints` (umumiy), `weeklyXp` (haftalik), `seasonalXp` (oylik)
- **Streak multiplier:** Har bir ketma-ket kun +2% bonus, maksimal +30%
- **Avtomatik reset:** Haftalik va oylik XP har davr boshida nollanadi
- **Liga yangilanishi:** Oylik XP asosida avtomatik liga o'zgarishi

### Reyting Sahifasi (`/student/ranking`)
- **3 tab:** Haftalik / Oylik / Umumiy
- **Podium:** Top 3 uchun animatsiyali podyum (toj, oltin/kumush/bronza)
- **Mening o'rnim:** Har bir tabda foydalanuvchining o'rni va XP'si
- **Profil linki:** Boshqa talabalar nomiga bosib ularning public profiliga o'tish

### Haftalik Challengelar
Har hafta avtomatik 3 ta challenge yaratiladi:
| Challenge | Maqsad | Mukofot |
|---|---|---|
| Haftalik darslar | 5 ta darsni yakunlash | 300 XP |
| Testlar ustasi | 3 ta quizni topshirish | 200 XP |
| XP to'plovchi | 500 XP to'plash | 500 XP |

### Mavsumlar (Seasons)
- Har oy yangi mavsim avtomatik yaratiladi
- `SeasonWinner` modeli — top 3 g'oliblar saqlanadi
- Hozircha frontend'da ko'rsatilmaydi (backend tayyor)

### Public Talaba Profili (`/students/[studentId]`)
- Cover foto, avatar, bio, joylashuv, maqsad
- Ko'nikmalar, ijtimoiy havolalar
- XP, liga, streak statistikasi
- Faol va tugatilgan kurslar (progress bar bilan)
- Sertifikatlar ro'yxati
- Barcha login qilgan rollar ko'ra oladi (STUDENT, TEACHER, ADMIN)

---

## Database Modellari (Yangilangan)

### User modeli — yangi maydonlar
```prisma
weeklyXp          Int      @default(0)      // Haftalik XP
seasonalXp        Int      @default(0)      // Oylik XP
lastWeeklyReset   DateTime?                 // Haftalik reset vaqti
lastMonthlyReset  DateTime?                 // Oylik reset vaqti
league            String   @default("BRONZA")
streak            Int      @default(0)      // Persistent streak (DB'da)
lastActiveAt      DateTime?                 // Oxirgi faollik vaqti
highestLeague     String?  @default("BRONZA")
pointsToNextLeague Int     @default(500)
```

### Yangi Modellar
| Model | Tavsif |
|---|---|
| **Season** | Oylik mavsimlar (name, startDate, endDate, isActive) |
| **SeasonWinner** | Mavsum g'oliblari (rank 1-3, xpPoints, userId, seasonId) |
| **WeeklyChallenge** | Haftalik topshiriqlar (title, rewardXp, targetType, targetCount) |
| **UserChallengeProgress** | Foydalanuvchi challenge progressi (currentCount, isCompleted) |

### Barcha Modellar
| Model | Asosiy maydonlar |
|---|---|
| **User** | id, name, email, role, xpPoints, weeklyXp, seasonalXp, league, streak, tokenVersion |
| **EnglishTeacherProfile** | teachingExperience, ieltsScore, hasTesolTefl, lessonPrice, lessonFormat |
| **Category** | name, description |
| **Course** | title, level, price, status (PENDING/APPROVED/REJECTED), xpPoints |
| **Module** | title, orderIdx |
| **Lesson** | title, videoUrl, content, attachmentUrl, orderIdx |
| **Quiz** | title, orderIdx |
| **Question** | text, options (JSON), correctIdx |
| **Enrollment** | progress (0-100), completedAt |
| **CompletedLesson** | userId, lessonId |
| **CompletedQuiz** | userId, quizId, score |
| **Certificate** | code (unique), issuedAt |
| **Assignment** | title, rubric, taskType, starterCode, aiGradingEnabled, aiGradingPrompt |
| **AssignmentSubmission** | status, score, aiScore, aiFeedback, aiConfidence, aiBreakdown |
| **TeacherProject** | title, description, url, imageUrl |
| **TeacherCertificate** | name, issuer, year, imageUrl |
| **Notification** | type, isRead, referenceId |
| **CourseComment** | text, isPinned, isEdited, parentId (nested) |
| **CommentLike** | userId, commentId |
| **Message** | text, isRead, isEdited, deletedAt, reactions (JSON) |
| **UserOnlineStatus** | isOnline, lastSeen |
| **Season** | ★ YANGI |
| **SeasonWinner** | ★ YANGI |
| **WeeklyChallenge** | ★ YANGI |
| **UserChallengeProgress** | ★ YANGI |

---

## API Endpointlar (To'liq ro'yxat)

### Auth
| Method | Endpoint | Tavsif |
|---|---|---|
| POST | `/api/auth/login` | Login, ikki cookie o'rnatadi |
| POST | `/api/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/logout-all` | Barcha qurilmalardan chiqish (tokenVersion++) |
| GET | `/api/auth/refresh` | Refresh token → yangi session cookie |

### Kurslar
| Method | Endpoint | Tavsif |
|---|---|---|
| GET/POST | `/api/courses` | Kurslar ro'yxati / yangi kurs |
| GET/PATCH/DELETE | `/api/courses/[courseId]` | Kurs detail / tahrirlash / o'chirish |
| POST | `/api/courses/[courseId]/enroll` | Kursga yozilish |
| GET/POST | `/api/courses/[courseId]/comments` | Izohlar (nested, @mention) |
| GET/POST | `/api/courses/[courseId]/modules` | Modullar |

### Xabarlar (Chat)
| Method | Endpoint | Tavsif |
|---|---|---|
| GET/POST | `/api/messages` | Suhbat tarixi / xabar yuborish |
| PATCH/DELETE | `/api/messages/[messageId]` | Tahrirlash / soft-delete |
| POST | `/api/messages/[messageId]/react` | Emoji reaksiya |
| GET | `/api/messages/conversations` | Barcha suhbatlar (batch-optimized) |
| GET | `/api/messages/unread-count` | O'qilmagan soni |
| GET | `/api/messages/sse` | SSE stream (chat + notifikatsiyalar) |

### Student
| Method | Endpoint | Tavsif |
|---|---|---|
| GET/PATCH | `/api/student/profile` | Profil |
| GET/PATCH | `/api/student/account` | Hisob sozlamalari |
| GET | `/api/student/achievements` | XP, badge, daraja |
| POST | `/api/student/achievements/claim` | Badge mukofotini olish |
| GET | `/api/student/certificates` | Sertifikatlar |
| GET | `/api/student/chat-teachers` | Chat uchun o'qituvchilar |
| GET | `/api/student/enrollments` | Yozilgan kurslar |
| GET | `/api/student/notifications` | Bildirishnomalar |
| PATCH | `/api/student/notifications/[id]` | O'qilgan deb belgilash |
| POST | `/api/student/notifications/read-all` | Barchasini o'qilgan |
| GET | `/api/student/notifications/unread-count` | O'qilmagan soni |
| POST | `/api/student/password` | Parol o'zgartirish |
| POST | `/api/student/upload/assignment-speaking` | Audio yuklash |

### O'qituvchi
| Method | Endpoint | Tavsif |
|---|---|---|
| GET/PATCH | `/api/teacher/profile` | Profil (EnglishTeacherProfile upsert) |
| GET/PATCH | `/api/teacher/account` | Hisob sozlamalari |
| GET | `/api/teacher/students` | Talabalar ro'yxati |
| GET | `/api/teacher/submissions` | Barcha topshiriqlar |
| GET | `/api/teacher/chat-students` | Chat uchun talabalar |
| GET/PATCH | `/api/teacher/notifications/...` | Bildirishnomalar |
| POST | `/api/teacher/password` | Parol o'zgartirish |
| GET/POST/PATCH/DELETE | `/api/teacher/projects/...` | Portfolio loyihalari |
| GET/POST/PATCH/DELETE | `/api/teacher/certificates/...` | Portfolio sertifikatlari |

### Admin
| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/api/admin/courses` | Barcha kurslar |
| PATCH | `/api/admin/courses/[courseId]` | Tasdiqlash/rad etish |
| GET/PATCH | `/api/admin/users` | Foydalanuvchilar / rol o'zgartirish |
| DELETE | `/api/admin/users/[id]` | O'chirish (cascade) |
| GET/PATCH | `/api/admin/profile` | Admin profili |
| POST | `/api/admin/password` | Parol o'zgartirish |

### Umumiy
| Method | Endpoint | Tavsif |
|---|---|---|
| GET | `/api/search?q=` | Kurs qidirish |
| GET/POST | `/api/piston` | Kod execution (Judge0 CE) |
| GET | `/api/keep-alive` | DB ping (CRON_SECRET himoyalangan) |
| GET | `/api/students/[studentId]` | ★ YANGI: Public talaba profili |
| GET | `/api/teachers/[teacherId]` | Public o'qituvchi profili |
| POST | `/api/upload/avatar` | Avatar yuklash |
| POST | `/api/upload/cover` | Kurs muqovasi |
| POST | `/api/upload/teacher-cover` | O'qituvchi muqovasi |
| POST | `/api/upload/image` | Umumiy rasm |
| POST | `/api/upload/assignment-attachment` | Topshiriq fayli |
| POST | `/api/upload/lesson-attachment` | Dars fayli |
| GET | `/api/test-ai` | AI grading test |

---

## Middleware (proxy.ts)

```
/api/auth/*     → authLimiter    (10 req/60s per IP)
/api/upload/*   → uploadLimiter  (20 req/60s per IP)
/api/piston     → pistonLimiter  (30 req/60s per IP)
/api/messages/* → messageLimiter (60 req/60s per user)
/api/*          → apiLimiter     (100 req/60s per IP)

/student, /teacher, /admin → Auth guard
  → session yo'q + refresh_token bor → /api/auth/refresh?redirect=...
  → session yo'q + refresh_token yo'q → /login
  → Rol mos kelmasa → /
```

---

## Hal Qilingan Kamchiliklar ✅

Avvalgi tahlilda aytilgan muammolardan quyidagilari hal qilindi:

| Muammo | Holat |
|---|---|
| `.env` fayl git'da | ✅ **Hal qilindi** — `.gitignore`'da `.env*` wildcard qo'shilgan |
| `tmp/debug_user.js` debug fayl | ✅ **O'chirildi** |
| `setup-admin.js` root'da | ✅ **O'chirildi** |
| SQLite fayllari git'da | ✅ **Hal qilindi** — `*.db`, `*.db-journal`, `*.db-shm`, `*.db-wal` gitignore'da |

---

## Afzalliklar ✅

### Texnik Kuchli Tomonlar
- **Dual-layer real-time:** In-memory (0ms) + Redis fallback — professional arxitektura
- **JWT revoke mexanizmi:** `tokenVersion` orqali barcha qurilmalardan chiqish
- **Shaffof token yangilash:** Middleware'da foydalanuvchi sezmasdan refresh
- **Batch query optimizatsiyasi:** NotificationService'da N+1 muammosi hal qilingan
- **Rate limiting:** 5 ta alohida limiter, har biri o'z maqsadiga mos
- **Zod validation:** Barcha API'larda input tekshiruvi
- **Server-side data fetching:** `data/student.ts`, `data/teacher.ts` — HTTP round-trip yo'q
- **Singleton pattern:** PrismaClient, Redis client — hot reload'da saqlanadi
- **Env validation:** Startup'da `validateEnv()` — noto'g'ri konfiguratsiya darhol aniqlanadi
- **Judge0 CE:** Bepul, ochiq manba kod execution

### Funksional Kuchli Tomonlar
- **16 ta topshiriq turi** — juda keng qamrov
- **IELTS baholash:** Writing + Speaking (audio transkripsiya bilan)
- **Ingliz tili o'qituvchisi profili:** Alohida `EnglishTeacherProfile` modeli
- **Reyting tizimi:** 3 xil leaderboard (haftalik/oylik/umumiy), liga tizimi
- **Streak multiplier:** O'qishni davom ettirish uchun bonus XP
- **Haftalik challengelar:** Avtomatik yaratiladi, XP mukofoti bilan
- **Public talaba profili:** Boshqa talabalar profilini ko'rish imkoni
- **Mavsumlar:** Backend tayyor, g'oliblar saqlanadi
- **Soft-delete xabarlar:** Ma'lumot yo'qolmaydi
- **Emoji reaksiyalar:** Chat'da zamonaviy UX

---

## Qolgan Kamchiliklar ⚠️

### Kritik Muammolar
- **SQLite production'da ishlatilmaydi** — serverless (Vercel) muhitida SQLite ishlamaydi. PostgreSQL'ga migration hali amalga oshirilmagan
- **Schema va migration o'rtasida farq** — Yangi modellar (`Season`, `SeasonWinner`, `WeeklyChallenge`, `UserChallengeProgress`) va yangi User maydonlari (`weeklyXp`, `seasonalXp`, `league`, `streak` va boshqalar) schema'da bor, lekin migration SQL'da yo'q. `prisma migrate dev` ishlatilishi kerak

### Arxitektura Muammolari
- **Reyting sahifasi sidebar'da yo'q** — `/student/ranking` sahifasi mavjud, lekin `student-sidebar.tsx`'da havola yo'q. Foydalanuvchilar bu sahifani topa olmaydi
- **Mavsumlar frontend'da ko'rsatilmaydi** — `Season` va `SeasonWinner` modellari tayyor, lekin hech qanday UI yo'q
- **Fayl saqlash ikki xil** — `public/uploads/` (local) + Cloudinary (CDN) — production'da local fayl saqlash serverless'da ishlamaydi
- **AI provider uchta** (Groq, OpenAI, Gemini) — faqat Groq ishlatilmoqda, boshqalari `node_modules` hajmini oshiradi
- **`next.config.ts` bo'sh** — `images.remotePatterns`, security headers, CORS sozlanmagan
- **Test coverage juda past** — faqat 1 ta test fayl (`notification-utils.test.ts`)

### Kichik Muammolar
- **Sertifikat kodi zaif** — `Math.random().toString(36)` ishlatilmoqda. `crypto.randomUUID()` yoki `nanoid` ishlatish kerak
- **`AssignmentSubmission.gradedBy`** — `String @default("PENDING")` — mantiqiy emas, `String?` bo'lishi kerak
- **`Message.updatedAt`** — `DateTime? @updatedAt` — optional `@updatedAt` Prisma'da noto'g'ri, `DateTime @updatedAt` bo'lishi kerak
- **`aiBreakdown` maydoni** — Schema'da bor, lekin migration SQL'da yo'q (schema drift)
- **Bitta git commit** — butun loyiha bitta "Initial commit" bilan qo'shilgan

---

## Environment Variables

```env
DATABASE_URL              # SQLite yoki PostgreSQL connection string
JWT_SECRET                # JWT imzolash uchun (kamida 16 belgi)
UPSTASH_REDIS_REST_URL    # Upstash Redis URL
UPSTASH_REDIS_REST_TOKEN  # Upstash Redis token
CRON_SECRET               # Keep-alive endpoint himoyasi
GROQ_API_KEY              # Groq AI API kaliti
```

---

## Xulosa

**LMS-UZ** bu versiyada jiddiy yangilanishlar oldi. Reyting tizimi (liga, haftalik/oylik/umumiy leaderboard, streak multiplier, haftalik challengelar) va public talaba profili qo'shildi. Xavfsizlik muammolari (`.env` gitignore, debug fayllar) ham hal qilindi.

**Keyingi muhim qadamlar:**
1. `prisma migrate dev` — yangi modellar uchun migration yaratish
2. Reyting sahifasini sidebar'ga qo'shish (`/student/ranking`)
3. SQLite → PostgreSQL migratsiyasi
4. `next.config.ts` security headers bilan to'ldirish
5. Mavsumlar UI'ni yaratish (g'oliblar e'lon qilish)
