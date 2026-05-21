import { z } from "zod";
import { NextResponse } from "next/server";

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Parses and validates a request body against a Zod schema.
 * Returns { data } on success or { error: NextResponse } on failure.
 */
export async function validateBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return {
      data: null,
      error: NextResponse.json({ error: "So'rov tanasi noto'g'ri JSON formatda" }, { status: 400 }),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const messages = result.error.errors.map((e) => e.message).join("; ");
    return {
      data: null,
      error: NextResponse.json({ error: messages }, { status: 400 }),
    };
  }

  return { data: result.data, error: null };
}

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email kiritilishi shart" })
    .email("Email formati noto'g'ri")
    .max(255, "Email juda uzun"),
  password: z
    .string({ required_error: "Parol kiritilishi shart" })
    .min(1, "Parol kiritilishi shart"),
});

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Ism kiritilishi shart" })
    .min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(100, "Ism 100 belgidan oshmasligi kerak")
    .trim(),
  email: z
    .string({ required_error: "Email kiritilishi shart" })
    .email("Email formati noto'g'ri")
    .max(255, "Email juda uzun")
    .toLowerCase(),
  password: z
    .string({ required_error: "Parol kiritilishi shart" })
    .min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
    .max(128, "Parol 128 belgidan oshmasligi kerak"),
  role: z.enum(["TEACHER", "STUDENT"]).optional().default("STUDENT"),
  subjectType: z.enum(["PROGRAMMING", "ENGLISH"]).optional().default("PROGRAMMING"),
});

// ─── Profile Schemas ──────────────────────────────────────────────────────────

const httpsUrl = z
  .string()
  .url("URL formati noto'g'ri")
  .startsWith("https://", "URL https:// bilan boshlanishi kerak")
  .nullable()
  .optional();

const skillsField = z
  .array(z.string().max(50, "Ko'nikma nomi 50 belgidan oshmasligi kerak"))
  .max(15, "Maksimal 15 ta ko'nikma qo'shish mumkin")
  .optional();

export const teacherProfilePatchSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 ta belgi").max(100, "Ism 100 belgidan oshmasligi kerak").trim().optional(),
  avatar: z.string().nullable().optional(),
  coverPhoto: z.string().nullable().optional(),
  bio: z.string().max(500, "Bio 500 belgidan oshmasligi kerak").nullable().optional(),
  specialization: z.string().max(100, "Mutaxassislik 100 belgidan oshmasligi kerak").nullable().optional(),
  linkedinUrl: httpsUrl,
  githubUrl: httpsUrl,
  youtubeUrl: httpsUrl,
  websiteUrl: httpsUrl,
  telegramUrl: z
    .string()
    .refine(
      (v) => !v || v.startsWith("https://t.me/") || v.startsWith("@"),
      "Telegram URL https://t.me/ bilan boshlanishi yoki @ bilan boshlanishi kerak"
    )
    .nullable()
    .optional(),
  skills: skillsField,
  teachingExperience: z.string().max(200, "Tajriba 200 belgidan oshmasligi kerak").nullable().optional(),
  languages: z.string().max(200, "Tillar 200 belgidan oshmasligi kerak").nullable().optional(),
  availability: z.string().max(200, "Vaqtlar 200 belgidan oshmasligi kerak").nullable().optional(),
  lessonFormat: z.string().max(50, "Format 50 belgidan oshmasligi kerak").nullable().optional(),
  universityDegree: z.string().max(200, "Daraja 200 belgidan oshmasligi kerak").nullable().optional(),
  teachingMaterials: z.string().max(1000, "Materiallar 1000 belgidan oshmasligi kerak").nullable().optional(),
  studentResults: z.string().max(1000, "Natijalar 1000 belgidan oshmasligi kerak").nullable().optional(),
  lessonPrice: z.number().min(0).nullable().optional(),
  ieltsScore: z.number().min(0).max(9).nullable().optional(),
  hasTesolTefl: z.boolean().optional(),
  hasTrialLesson: z.boolean().optional(),
  whatsappUrl: z.string().max(100).nullable().optional(),
});

export const studentProfilePatchSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 ta belgi").max(100, "Ism 100 belgidan oshmasligi kerak").trim().optional(),
  coverPhoto: z.string().nullable().optional(),
  bio: z.string().max(500, "Bio 500 belgidan oshmasligi kerak").nullable().optional(),
  location: z.string().max(100, "Joylashuv 100 belgidan oshmasligi kerak").nullable().optional(),
  goal: z.string().max(200, "Maqsad 200 belgidan oshmasligi kerak").nullable().optional(),
  skills: skillsField,
  linkedinUrl: httpsUrl,
  githubUrl: httpsUrl,
  telegramUrl: z
    .string()
    .refine(
      (v) => !v || v.startsWith("https://t.me/") || v.startsWith("@"),
      "Telegram URL https://t.me/ bilan boshlanishi yoki @ bilan boshlanishi kerak"
    )
    .nullable()
    .optional(),
  websiteUrl: httpsUrl,
});

// ─── Course Schemas ───────────────────────────────────────────────────────────

export const courseLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export const createCourseSchema = z.object({
  title: z.string().min(3, "Sarlavha kamida 3 ta belgi").max(200, "Sarlavha 200 belgidan oshmasligi kerak").trim(),
  description: z.string().min(10, "Tavsif kamida 10 ta belgi").max(5000, "Tavsif 5000 belgidan oshmasligi kerak").trim(),
  level: z.enum(courseLevels, { errorMap: () => ({ message: "Daraja noto'g'ri" }) }),
  categoryName: z.string().min(1, "Kategoriya kiritilishi shart").max(100).trim(),
  price: z.number().min(0, "Narx manfiy bo'lishi mumkin emas").max(10000, "Narx 10000 dan oshmasligi kerak").default(0),
  image: z.string().nullable().optional(),
  xpPoints: z.number().int().min(0).max(10000).default(100),
  introVideo: z.string().nullable().optional(),
  technologies: z.array(z.string().max(50)).max(20).nullable().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

// ─── Message Schemas ──────────────────────────────────────────────────────────

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1, "Qabul qiluvchi ID kiritilishi shart"),
  text: z.string().min(1, "Xabar bo'sh bo'lishi mumkin emas").max(5000, "Xabar 5000 belgidan oshmasligi kerak").trim(),
});

export const reactMessageSchema = z.object({
  emoji: z.string().min(1, "Emoji kiritilishi shart").max(10, "Emoji juda uzun"),
});

// ─── Assignment Schemas ───────────────────────────────────────────────────────

const validTaskTypes = [
  "HTML_CSS_JS", "REACT", "VUE", "VANILLA_TS", "PYTHON",
  "KOTLIN", "SWIFT", "CPP", "JAVA", "GO", "RUST", "PHP",
  "ENGLISH_READING", "ENGLISH_WRITING", "ENGLISH_LISTENING", "ENGLISH_SPEAKING",
] as const;

export const createAssignmentSchema = z.object({
  title: z.string().min(3, "Sarlavha kamida 3 ta belgi").max(200).trim(),
  description: z.string().min(1, "Tavsif kiritilishi shart").max(10000),
  rubric: z.string().min(5, "Baholash mezonlari kamida 5 ta belgi").max(5000).trim(),
  taskType: z.enum(validTaskTypes).default("HTML_CSS_JS"),
  starterCode: z.string().nullable().optional(),
  attachmentUrl: z.string().nullable().optional(),
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

// ─── Quiz Schemas ─────────────────────────────────────────────────────────────

export const questionSchema = z.object({
  text: z.string().min(3, "Savol kamida 3 ta belgi").max(1000).trim(),
  options: z.array(z.string().min(1).max(500)).min(2, "Kamida 2 ta variant kerak").max(6, "Maksimal 6 ta variant"),
  correctIdx: z.number().int().min(0, "To'g'ri javob indeksi noto'g'ri"),
});

export const createQuizSchema = z.object({
  title: z.string().min(3, "Sarlavha kamida 3 ta belgi").max(200).trim(),
  questions: z.array(questionSchema).min(1, "Kamida 1 ta savol kerak").max(50, "Maksimal 50 ta savol"),
});

// ─── Password Schema ──────────────────────────────────────────────────────────

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Joriy parol kiritilishi shart"),
  newPassword: z
    .string()
    .min(8, "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak")
    .max(128, "Parol 128 belgidan oshmasligi kerak"),
});

// ─── Env Validation ───────────────────────────────────────────────────────────

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  UPSTASH_REDIS_REST_URL: z.string().url("UPSTASH_REDIS_REST_URL must be a valid URL"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "UPSTASH_REDIS_REST_TOKEN is required"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("\n");
    throw new Error(`❌ Invalid environment variables:\n${missing}`);
  }
  return result.data;
}
