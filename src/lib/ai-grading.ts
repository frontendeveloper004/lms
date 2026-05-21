/**
 * AI Grading Service — Groq (llama-3.3-70b-versatile)
 * 100% tekin, tez, kod baholashda kuchli
 */

import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

export interface AIGradingResult {
  score: number;
  feedback: string;
  xpBonus: number;
  confidence: number;
  breakdown?: {
    criterion: string;
    score: number;
    explanation: string;
  }[];
}

function formatCodeForAI(
  filesCode: Record<string, string> | null,
  htmlCode: string,
  cssCode: string,
  jsCode: string
): string {
  if (filesCode && Object.keys(filesCode).length > 0) {
    return Object.entries(filesCode)
      .map(([filename, code]) => `### ${filename}\n\`\`\`\n${code}\n\`\`\``)
      .join("\n\n");
  }
  const parts: string[] = [];
  if (htmlCode?.trim()) parts.push(`### index.html\n\`\`\`html\n${htmlCode}\n\`\`\``);
  if (cssCode?.trim()) parts.push(`### style.css\n\`\`\`css\n${cssCode}\n\`\`\``);
  if (jsCode?.trim()) parts.push(`### script.js\n\`\`\`javascript\n${jsCode}\n\`\`\``);
  return parts.join("\n\n") || "(Kod bo'sh)";
}

function calculateXpBonus(score: number): number {
  if (score >= 95) return 1000;
  if (score >= 85) return 800;
  if (score >= 75) return 600;
  if (score >= 60) return 400;
  if (score >= 40) return 200;
  if (score >= 20) return 100;
  return 0;
}

export async function gradeSubmissionWithAI(params: {
  taskType: string;
  rubric: string;
  assignmentTitle: string;
  assignmentDescription: string;
  aiGradingPrompt?: string | null;
  filesCode: Record<string, string> | null;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}): Promise<AIGradingResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "your-groq-api-key-here") {
    throw new Error("GROQ_API_KEY sozlanmagan");
  }

  const groq = new Groq({ apiKey });

  const isWriting = params.taskType === "ENGLISH_WRITING";
  const isSpeaking = params.taskType === "ENGLISH_SPEAKING";
  const isReading = params.taskType === "ENGLISH_READING";
  
  let formattedCode = "";
  let transcript = "";

  if (isSpeaking && params.htmlCode) {
    try {
      const audioPath = path.join(process.cwd(), "public", params.htmlCode);
      if (fs.existsSync(audioPath)) {
        const transcription = await groq.audio.transcriptions.create({
          file: fs.createReadStream(audioPath),
          model: "whisper-large-v3",
          response_format: "text",
        });
        transcript = transcription as unknown as string;
        formattedCode = `[AUDIO TRANSCRIPT]\n${transcript}`;
      } else {
        formattedCode = "[XATOLIK: Audio fayl topilmadi]";
      }
    } catch (err) {
      console.error("Transcription error:", err);
      formattedCode = "[XATOLIK: Audio transkripsiyada xatolik yuz berdi]";
    }
  } else {
    formattedCode = isWriting ? params.htmlCode : formatCodeForAI(
      params.filesCode,
      params.htmlCode,
      params.cssCode,
      params.jsCode
    );
  }

  let systemPrompt = "";
  if (isWriting) {
    systemPrompt = `Siz IELTS/Academic English bo'yicha ekspert o'qituvchisiz. Student yozgan inshoni (essay) IELTS mezonlari asosida juda qat'iy va haqqoniy baholang.
    
    ## Baholash mezonlari:
    1. **Task Response / Achievement** (Savolga to'liq javob berilganmi?)
    2. **Coherence and Cohesion** (Mantiqiy bog'liqlik va struktura)
    3. **Lexical Resource** (Lug'at boyligi)
    4. **Grammatical Range and Accuracy** (Grammatik xilma-xillik va aniqlik)
    
    ## Muhammad Ali (Grok/Groq) AI Baholash Qoidalari:
    - O'zbek tilida feedback bering.
    - Ballni 100 ballik tizimda hisoblang (IELTS 9.0 ballni 100 ga proporional o'girib).
    - Feedback studentga BEVOSITA ("Siz", "Sizning...") qaratilgan bo'lsin.
    - Har bir mezon bo'yicha alohida tushuntirish bering.`;
  } else if (params.taskType === "ENGLISH_READING") {
    systemPrompt = `Siz IELTS Reading bo'yicha ekspert o'qituvchisiz. Studentning savollarga bergan javoblarini matn asosida baholang.
    
    ## Baholash mezonlari:
    1. **Accuracy** (Javoblarning to'g'riligi)
    2. **Evidence-based Explanation** (Nega aynan shu javob to'g'ri ekanligini matndan dalil bilan tushuntirish)
    3. **Vocabulary Understanding** (Matndagi so'zlarni qay darajada tushunganligi)
    
    ## Muhammad Ali (Grok/Groq) AI Baholash Qoidalari:
    - O'zbek tilida batafsil feedback bering.
    - Noto'g'ri javoblar bo'lsa, ularning to'g'ri variantini va matndagi o'rnini (paragraph/sentence) ko'rsating.
    - Feedback studentga BEVOSITA ("Siz", "Sizning...") qaratilgan bo'lsin.`;
  } else if (isSpeaking) {
    systemPrompt = `Siz IELTS Speaking bo'yicha ekspert imtihonchisiz. Studentning og'zaki javobini (transkriptini) IELTS Speaking band descriptors asosida juda qat'iy baholang.
    
    ## Baholash mezonlari:
    1. **Fluency and Coherence** (Ravonlik va mantiqiy bog'liqlik)
    2. **Lexical Resource** (So'z boyligi va to'g'ri qo'llanilishi)
    3. **Grammatical Range and Accuracy** (Grammatik xilma-xillik va xatosizlik)
    4. **Pronunciation** (Talaffuz - transkript bo'yicha xulosa qiling)
    
    ## Muhammad Ali (Grok/Groq) AI Baholash Qoidalari:
    - O'zbek tilida feedback bering.
    - Ballni 100 ballik tizimda hisoblang (IELTS 9.0 -> 100).
    - Feedback studentga BEVOSITA ("Siz", "Sizning...") qaratilgan bo'lsin.
    - Har bir mezon bo'yicha alohida tushuntirish bering.`;
  } else {
    systemPrompt = `Siz dasturlash bo'yicha tajribali va qat'iy o'qituvchisiz. Quyidagi student topshirig'ini HAQQONIY baholang.
    
    ## MUHIM BAHOLASH QOIDALARI (qat'iy rioya qiling):
    1. **Topshiriq turiga moslik** — Agar topshiriq turi "${params.taskType}" bo'lsa va student butunlay boshqa turdagi kod yuborgan bo'lsa, 0-20 ball bering.
    2. **Topshiriq mavzusiga moslik** — Agar kod mavzuga mutlaqo aloqasiz bo'lsa, 0-20 ball bering.
    3. **Nusxa ko'chirish/Bo'sh kod** — Minimal yoki starter code bilan bir xil bo'lsa, 0-15 ball bering.
    4. Feedback O'ZBEK TILIDA yozilsin.`;
  }

  const prompt = `${systemPrompt}

## Topshiriq ma'lumotlari
**Sarlavha:** ${params.assignmentTitle}
**Tur:** ${params.taskType}
**Tavsif:** ${params.assignmentDescription.replace(/<[^>]*>/g, "")}

## Baholash mezonlari (Rubric/Instructions)
${params.rubric}

${params.aiGradingPrompt ? `## Qo'shimcha ko'rsatmalar\n${params.aiGradingPrompt}\n` : ""}

## Student ${isWriting ? "Matni (Essay)" : isSpeaking ? "Nutqi (Transcript)" : "Kodi"}
${formattedCode}

Faqat quyidagi JSON formatda javob bering:
{
  "score": <0-100 orasidagi butun son>,
  "feedback": "<o'zbek tilida batafsil umumiy izoh>",
  "breakdown": [
    { "criterion": isReading ? "Reading Accuracy" : isSpeaking ? "Fluency" : "Task Response", "score": <0-100>, "explanation": "<izoh>" },
    { "criterion": isReading ? "Evidence-based" : isSpeaking ? "Lexical Resource" : "Coherence and Cohesion", "score": <0-100>, "explanation": "<izoh>" },
    { "criterion": isReading ? "Vocabulary" : isSpeaking ? "Grammar" : "Lexical Resource", "score": <0-100>, "explanation": "<izoh>" },
    { "criterion": isSpeaking ? "Pronunciation" : "Grammatical Range", "score": <0-100>, "explanation": "<izoh>" }
  ],
  "confidence": <0.0-1.0 orasidagi kasr son>
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 1000,
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? "";

  let parsed: { 
    score: number; 
    feedback: string; 
    confidence: number; 
    breakdown?: { criterion: string; score: number; explanation: string }[] 
  };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`AI javobini parse qilib bo'lmadi: ${text.substring(0, 200)}`);
  }

  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
  const feedback = String(parsed.feedback || "AI baholash yakunlandi.").trim();
  const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0.7));
  const xpBonus = calculateXpBonus(score);
  const breakdown = parsed.breakdown;

  return { score, feedback, xpBonus, confidence, breakdown };
}
