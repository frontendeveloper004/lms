"use server";

/**
 * ASL Service — Real-time American Sign Language pipeline (SERVER ONLY)
 *
 * Pipeline:
 *   YouTube video ID
 *     → YouTube Data API v3  (captions / auto-transcript)
 *     → Groq llama-3.3-70b   (English → ASL gloss sequence with timestamps)
 *     → ASL-LEX clip mapping  (gloss → Handspeak video URL)
 *     → Fingerspelling fallback (unknown words → letter-by-letter)
 *
 * Client-side utilities (getFingerspellUrl, getASLClipUrl, extractYouTubeId)
 * live in asl-client-utils.ts — safe to import from client components.
 */

import Groq from "groq-sdk";
import { getASLClipUrl, extractYouTubeId } from "./asl-client-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignType = "clip" | "fingerspell" | "pause" | "pose";

export interface TimedSign {
  /** Start time in seconds (relative to video) */
  start: number;
  /** End time in seconds */
  end: number;
  /** ASL gloss label shown in the UI, e.g. "HELLO" */
  gloss: string;
  /** How to render this sign */
  type: SignType;
  /**
   * For type="clip"       → URL of the ASL video clip (Handspeak)
   * For type="fingerspell" → the word to spell letter by letter
   * For type="pause"      → undefined
   */
  payload?: string;
}

export interface ASLProcessResult {
  videoId: string;
  /** Total duration used for the gloss timeline (seconds) */
  duration: number;
  signs: TimedSign[];
  /** Raw transcript text */
  transcript: string;
}

/**
 * Fetches the auto-generated or manual caption track from YouTube Data API v3.
 * Returns plain text with rough timestamps, or null if unavailable.
 *
 * NOTE: Requires YOUTUBE_API_KEY in env.
 * Falls back to lesson text content if API key is missing.
 */
async function fetchYouTubeTranscript(videoId: string): Promise<{ text: string; segments: { text: string; start: number; duration: number }[] } | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    // Step 1: list caption tracks
    const listRes = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`
    );
    if (!listRes.ok) return null;
    const listData = await listRes.json();

    // Prefer English manual captions, then auto-generated
    const tracks: any[] = listData.items || [];
    const track =
      tracks.find((t: any) => t.snippet.language === "en" && t.snippet.trackKind === "standard") ||
      tracks.find((t: any) => t.snippet.language === "en" && t.snippet.trackKind === "asr") ||
      tracks.find((t: any) => t.snippet.language === "en") ||
      tracks[0];

    if (!track) return null;

    // Step 2: download the caption track (SRV3 / ttml format)
    const dlRes = await fetch(
      `https://www.googleapis.com/youtube/v3/captions/${track.id}?tfmt=srv3&key=${apiKey}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    if (!dlRes.ok) return null;

    const xml = await dlRes.text();
    // Parse SRV3 XML: <text start="1.23" dur="2.5">Hello world</text>
    const segments: { text: string; start: number; duration: number }[] = [];
    const regex = /<text[^>]+start="([\d.]+)"[^>]*dur="([\d.]+)"[^>]*>([^<]*)<\/text>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      segments.push({
        start: parseFloat(match[1]),
        duration: parseFloat(match[2]),
        text: match[3].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      });
    }

    if (segments.length === 0) return null;

    return {
      text: segments.map((s) => s.text).join(" "),
      segments,
    };
  } catch {
    return null;
  }
}

// ─── Groq: English → ASL gloss ───────────────────────────────────────────────

interface GlossEntry {
  start: number;
  end: number;
  gloss: string;
}

async function generateASLGlosses(
  transcript: string,
  segments: { text: string; start: number; duration: number }[],
  estimatedDuration: number
): Promise<GlossEntry[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const groq = new Groq({ apiKey });

  // Build a compact representation of the transcript with timestamps
  const timedText = segments.length > 0
    ? segments.slice(0, 80).map((s) => `[${s.start.toFixed(1)}s] ${s.text}`).join("\n")
    : transcript.slice(0, 3000);

  const prompt = `You are an expert ASL (American Sign Language) interpreter.
Convert the following English transcript into ASL gloss notation with precise timestamps.

RULES for ASL gloss:
- Use UPPERCASE single words (ASL signs)
- Drop articles (a, an, the), most prepositions, and auxiliary verbs
- Use ASL word order (topic-comment, time first)
- Each gloss entry covers 3-6 seconds of video
- Use only common English words that have direct ASL signs
- Provide 1 gloss per 4-5 seconds of video content
- Total video duration: ~${estimatedDuration} seconds

TRANSCRIPT (with timestamps):
${timedText}

Return ONLY a JSON array, no explanation:
[
  { "start": 0.0, "end": 4.5, "gloss": "HELLO" },
  { "start": 4.5, "end": 9.0, "gloss": "TODAY LEARN" },
  { "start": 9.0, "end": 14.0, "gloss": "COMPUTER PROGRAM" }
]`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 2048,
  });

  const raw = completion.choices[0]?.message?.content || "{}";

  // The model sometimes wraps the array in an object
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const arr: any[] = Array.isArray(parsed) ? parsed : (parsed.glosses || parsed.signs || parsed.data || []);

  return arr
    .filter((e: any) => typeof e.start === "number" && typeof e.end === "number" && typeof e.gloss === "string")
    .map((e: any) => ({
      start: e.start,
      end: e.end,
      gloss: String(e.gloss).toUpperCase().trim(),
    }));
}

// ─── Gloss → TimedSign (clip or fingerspell) ──────────────────────────────────

function glossToTimedSigns(glossEntries: GlossEntry[]): TimedSign[] {
  const signs: TimedSign[] = [];

  for (const entry of glossEntries) {
    // A gloss entry may contain multiple words, e.g. "TODAY LEARN"
    const words = entry.gloss.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    const segDuration = (entry.end - entry.start) / words.length;

    words.forEach((word, i) => {
      const start = entry.start + i * segDuration;
      const end = start + segDuration;
      const clipUrl = getASLClipUrl(word);

      if (clipUrl) {
        signs.push({ start, end, gloss: word, type: "clip", payload: clipUrl });
      } else {
        // Fingerspell unknown word
        signs.push({ start, end, gloss: word, type: "fingerspell", payload: word });
      }
    });
  }

  return signs.sort((a, b) => a.start - b.start);
}

// ─── Fallback: generate glosses from lesson text (no YouTube API) ─────────────

async function generateGlossesFromText(lessonText: string, lessonTitle: string): Promise<GlossEntry[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const groq = new Groq({ apiKey });

  const cleanText = lessonText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 3000);

  const prompt = `You are an expert ASL interpreter. Convert this lesson content into a timed ASL gloss sequence.

LESSON TITLE: ${lessonTitle}
LESSON CONTENT: ${cleanText}

Create a timeline of ASL glosses spread across 120 seconds (2 minutes).
Each gloss covers 4-6 seconds. Use UPPERCASE single ASL signs.
Drop articles, prepositions, auxiliary verbs. Use ASL word order.

Return ONLY a JSON array:
[
  { "start": 0, "end": 5, "gloss": "HELLO WELCOME" },
  { "start": 5, "end": 10, "gloss": "TODAY LEARN" }
]`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
    max_tokens: 1500,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  let parsed: any;
  try { parsed = JSON.parse(raw); } catch { return []; }

  const arr: any[] = Array.isArray(parsed) ? parsed : (parsed.glosses || parsed.signs || parsed.data || []);
  return arr
    .filter((e: any) => typeof e.start === "number" && typeof e.end === "number" && typeof e.gloss === "string")
    .map((e: any) => ({ start: e.start, end: e.end, gloss: String(e.gloss).toUpperCase().trim() }));
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Full ASL processing pipeline for a lesson.
 *
 * @param videoUrl  - YouTube URL (or any URL) of the lesson video
 * @param lessonText - Fallback: lesson HTML content (used when no YouTube captions)
 * @param lessonTitle - Lesson title (used in fallback prompt)
 */
export async function processASLForLesson(params: {
  videoUrl: string | null;
  lessonText: string | null;
  lessonTitle: string;
}): Promise<ASLProcessResult> {
  const { videoUrl, lessonText, lessonTitle } = params;

  let transcript = "";
  let glossEntries: GlossEntry[] = [];
  let duration = 120; // default 2 min estimate

  const videoId = videoUrl ? extractYouTubeId(videoUrl) : null;

  if (videoId) {
    // Try YouTube captions first
    const captionData = await fetchYouTubeTranscript(videoId);

    if (captionData && captionData.segments.length > 0) {
      transcript = captionData.text;
      const lastSeg = captionData.segments[captionData.segments.length - 1];
      duration = lastSeg.start + lastSeg.duration + 5;
      glossEntries = await generateASLGlosses(transcript, captionData.segments, duration);
    } else {
      // No captions — fall back to lesson text
      const fallbackText = lessonText || lessonTitle;
      glossEntries = await generateGlossesFromText(fallbackText, lessonTitle);
      transcript = fallbackText.replace(/<[^>]*>/g, " ").trim();
    }
  } else if (lessonText) {
    // No video at all — use lesson text
    glossEntries = await generateGlossesFromText(lessonText, lessonTitle);
    transcript = lessonText.replace(/<[^>]*>/g, " ").trim();
  }

  // Ensure we always have something
  if (glossEntries.length === 0) {
    glossEntries = [
      { start: 0, end: 5, gloss: "HELLO WELCOME" },
      { start: 5, end: 10, gloss: "TODAY LEARN" },
      { start: 10, end: 15, gloss: "WATCH UNDERSTAND" },
    ];
  }

  const signs = glossToTimedSigns(glossEntries);

  return { videoId: videoId || "", duration, signs, transcript };
}
