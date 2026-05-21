import { NextRequest, NextResponse } from "next/server";

// Judge0 CE — bepul, ochiq manba online kod bajarish tizimi
// https://ce.judge0.com
const JUDGE0_API = "https://ce.judge0.com";

// Piston language name → Judge0 language ID
const LANGUAGE_IDS: Record<string, number> = {
  cpp:    105, // C++ (GCC 14.1.0)
  java:   91,  // Java (JDK 17.0.6)
  go:     107, // Go (1.23.5)
  rust:   108, // Rust (1.85.0)
  php:    98,  // PHP (8.3.11)
  python: 100, // Python (3.12.5)
  kotlin: 111, // Kotlin (2.1.10)
  // fallbacks
  "c++":  105,
  "c":    103,
};

interface PistonFile {
  name: string;
  content: string;
}

interface ExecuteRequest {
  language: string;
  files: PistonFile[];
  stdin?: string;
  compile_timeout?: number;
  run_timeout?: number;
}

// GET /api/piston — returns mock runtimes list (for compatibility)
export async function GET() {
  const runtimes = Object.entries(LANGUAGE_IDS).map(([lang, id]) => ({
    language: lang,
    version: "*",
    aliases: [],
  }));
  return NextResponse.json(runtimes);
}

// POST /api/piston — executes code via Judge0 CE
export async function POST(req: NextRequest) {
  try {
    const body: ExecuteRequest = await req.json();

    if (!body.language || !body.files?.length) {
      return NextResponse.json(
        { error: "language va files majburiy" },
        { status: 400 }
      );
    }

    const langKey = body.language.toLowerCase();
    const languageId = LANGUAGE_IDS[langKey];

    if (!languageId) {
      return NextResponse.json(
        { error: `Qo'llab-quvvatlanmaydigan til: ${body.language}` },
        { status: 400 }
      );
    }

    // Sanitize: limit code size (max 64KB per file)
    for (const file of body.files) {
      if (file.content.length > 65536) {
        return NextResponse.json(
          { error: "Kod hajmi juda katta (max 64KB)" },
          { status: 400 }
        );
      }
    }

    // Judge0 supports multi-file via "additional_files" (base64 zip),
    // but for simplicity we concatenate all files into source_code.
    // For Java, the main file must be first.
    const mainFile = body.files[0];
    const sourceCode = body.files.length === 1
      ? mainFile.content
      : body.files.map((f) => f.content).join("\n\n");

    // Submit to Judge0 (synchronous mode with wait=true)
    const submitRes = await fetch(`${JUDGE0_API}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: sourceCode,
        stdin: body.stdin ?? "",
        cpu_time_limit: (body.run_timeout ?? 10000) / 1000,
        wall_time_limit: ((body.compile_timeout ?? 15000) + (body.run_timeout ?? 10000)) / 1000,
      }),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      return NextResponse.json(
        { error: `Judge0 xatosi: ${errText}` },
        { status: submitRes.status }
      );
    }

    const result = await submitRes.json();

    // Map Judge0 response → Piston-compatible response format
    // Judge0 status IDs: 3=Accepted, 4=Wrong Answer, 5=TLE, 6=CE, 11=RE, etc.
    const statusId = result.status?.id ?? 0;
    const isCompileError = statusId === 6; // Compilation Error
    const isSuccess = statusId === 3;      // Accepted

    const pistonResponse = {
      compile: isCompileError
        ? {
            stdout: "",
            stderr: result.compile_output ?? result.message ?? "",
            code: 1,
          }
        : {
            stdout: "",
            stderr: "",
            code: 0,
          },
      run: {
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? (isCompileError ? "" : (result.message ?? "")),
        code: isSuccess ? 0 : 1,
      },
    };

    return NextResponse.json(pistonResponse);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Server xatosi" },
      { status: 500 }
    );
  }
}
