"use server";

/**
 * Accessibility Service — AI-driven content adaptation for hearing impaired users.
 * Uses Groq (llama-3.3-70b-versatile) for simplification and glossing.
 */

import Groq from "groq-sdk";

export interface TimestampedGloss {
  text: string;
  start: number;
  end: number;
}

export interface AccessibleContent {
  simplifiedText: string;
  glosses: TimestampedGloss[];
  visualSummary: string[];
}

export async function generateAccessibleContent(params: {
  content: string;
  title: string;
}): Promise<AccessibleContent> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const groq = new Groq({ apiKey });

  const prompt = `You are an expert in accessibility for the deaf and hard of hearing. 
Your task is to transform the following lesson content into an accessible format.

LESSON TITLE: ${params.title}
LESSON CONTENT:
${params.content.replace(/<[^>]*>/g, "")}

Please provide the following in Uzbek:
1. **Simplified Text**: Rewrite the content in very simple, direct, and visual-friendly Uzbek. Avoid complex grammatical structures.
2. **Sign Language Glosses**: Create a real-time synchronized timeline of Sign Language Glosses. For each key segment of the lesson, provide the "text" (the ASL/UZSL gloss format, e.g., "BUGUN MEN MAKTAB BORDI"), "start" (start time in seconds), and "end" (end time in seconds). Space them logically across an estimated 0 to 60 seconds timeframe since we don't have the exact video length. Provide at least 5-10 timestamped glosses.
3. **Visual Summary**: A list of 3-5 key visual points/steps to help understand the core message.

Return ONLY a JSON object in this format:
{
  "simplifiedText": "...",
  "glosses": [
    { "text": "GLOSS 1", "start": 0, "end": 5 },
    { "text": "GLOSS 2", "start": 6, "end": 12 }
  ],
  "visualSummary": ["Point 1", "Point 2"]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const rawData = JSON.parse(responseText);

    // Robust normalization to guarantee TimestampedGloss[]
    let validGlosses: TimestampedGloss[] = [];
    if (Array.isArray(rawData.glosses)) {
      validGlosses = rawData.glosses.map((item: any, index: number) => {
        if (typeof item === "string") {
          return { text: item, start: index * 5, end: (index * 5) + 4 };
        } else if (typeof item === "object" && item !== null) {
          return {
            text: item.text ? String(item.text) : "...",
            start: typeof item.start === "number" ? item.start : index * 5,
            end: typeof item.end === "number" ? item.end : (index * 5) + 4
          };
        }
        return { text: "...", start: index * 5, end: (index * 5) + 4 };
      });
    }

    if (validGlosses.length === 0) {
      validGlosses = [
        { text: "SALOM", start: 0, end: 4 },
        { text: "BUGUN DASTURLASH DARSI", start: 5, end: 9 },
        { text: "DIQQAT BILAN KO'RING", start: 10, end: 14 }
      ];
    }

    return {
      simplifiedText: rawData.simplifiedText || "Kechirasiz, ma'lumot topilmadi.",
      glosses: validGlosses,
      visualSummary: Array.isArray(rawData.visualSummary) ? rawData.visualSummary : ["Dars videoda batafsil"]
    };

  } catch (error) {
    console.error("Accessibility Service Error:", error);
    return {
      simplifiedText: "Kechirasiz, AI orqali ma'lumotni soddalashtirishda xatolik yuz berdi.",
      glosses: [
        { text: "XATOLIK YUZ BERDI", start: 0, end: 4 },
        { text: "QAYTADAN URINING", start: 5, end: 9 }
      ],
      visualSummary: ["Dars mazmunini videodan o'rganishda davom eting."]
    };
  }
}
