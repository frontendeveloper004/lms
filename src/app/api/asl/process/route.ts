import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { z } from "zod";

const SIGN_SERVICE_URL = process.env.SIGN_SERVICE_URL || "http://localhost:5050";

const schema = z.object({
  videoUrl:    z.string().nullable().optional(),
  lessonText:  z.string().nullable().optional(),
  lessonTitle: z.string().min(1),
});

// ── Helper: call Python sign service ─────────────────────────────────────────

async function callSignService(text: string): Promise<{
  poses: any[];
  glosses: string[];
  fps?: number;
  total_frames?: number;
  warning?: string;
} | null> {
  try {
    const res = await fetch(`${SIGN_SERVICE_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language: "ase" }),
      // 30s timeout — pipeline can be slow on first call
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Helper: check if sign service is alive ────────────────────────────────────

async function isSignServiceAlive(): Promise<boolean> {
  try {
    const res = await fetch(`${SIGN_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(3_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Helper: extract plain text from lesson content ────────────────────────────

function extractText(html: string | null | undefined, title: string): string {
  if (!html) return title;
  // Strip HTML tags, collapse whitespace, limit to 500 chars for the service
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500) || title;
}

// ── Helper: convert pose frames → TimedSign array for ASLPlayer ───────────────

function posesToTimedSigns(
  poses: any[],
  glosses: string[],
  fps: number
): any[] {
  if (!poses || poses.length === 0) return [];

  const signs: any[] = [];
  const totalDuration = poses[poses.length - 1]?.timestamp ?? poses.length / fps;
  const perGloss = totalDuration / Math.max(glosses.length, 1);

  glosses.forEach((gloss, i) => {
    signs.push({
      start:   parseFloat((i * perGloss).toFixed(2)),
      end:     parseFloat(((i + 1) * perGloss).toFixed(2)),
      gloss:   gloss.toUpperCase(),
      type:    "pose",
      // Attach the pose frames that belong to this gloss window
      frames:  poses.filter((p) => {
        const t = p.timestamp ?? 0;
        return t >= i * perGloss && t < (i + 1) * perGloss;
      }),
    });
  });

  return signs;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { videoUrl, lessonText, lessonTitle } = parsed.data;

  // Build the text to translate
  const text = extractText(lessonText, lessonTitle);

  // Check if Python service is running
  const serviceAlive = await isSignServiceAlive();

  if (!serviceAlive) {
    return NextResponse.json({
      signs: [],
      glosses: [],
      serviceDown: true,
      message: "Sign service is not running. Start it with: python sign-service/app.py",
    });
  }

  // Call the sign service
  const result = await callSignService(text);

  if (!result) {
    return NextResponse.json({
      signs: [],
      glosses: [],
      serviceDown: false,
      message: "Sign service returned an error",
    });
  }

  const fps    = result.fps ?? 25;
  const signs  = posesToTimedSigns(result.poses, result.glosses, fps);

  return NextResponse.json({
    signs,
    glosses:      result.glosses,
    fps,
    totalFrames:  result.total_frames ?? result.poses.length,
    warning:      result.warning,
    videoId:      videoUrl ?? "",
    serviceDown:  false,
  });
}
