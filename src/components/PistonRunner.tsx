"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play, Loader2, Trash2, Terminal,
  ExternalLink, ChevronDown, AlertCircle,
} from "lucide-react";

export interface PistonRunnerProps {
  /** Piston language identifier e.g. "cpp", "java", "go", "rust", "php" */
  language: string;
  /** Display label e.g. "C++", "Java" */
  label: string;
  /** Emoji icon */
  icon: string;
  /** Tailwind accent color classes */
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  /** Map of filename → code */
  files: Record<string, string>;
  /** Main file name (entry point) */
  mainFile: string;
  readOnly?: boolean;
  /** Optional stdin input */
  showStdin?: boolean;
}

type OutputLine = {
  type: "stdout" | "stderr" | "compile_err" | "info" | "success";
  text: string;
};

export default function PistonRunner({
  language,
  label,
  icon,
  accentColor,
  accentBg,
  accentBorder,
  files,
  mainFile,
  readOnly = false,
  showStdin = false,
}: PistonRunnerProps) {
  const [output, setOutput] = useState<OutputLine[]>([
    { type: "info", text: `▶ "${label}" kodini ishga tushirish uchun tugmani bosing.` },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [stdin, setStdin] = useState("");
  const [showStdinPanel, setShowStdinPanel] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const runCode = useCallback(async () => {
    if (isRunning) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsRunning(true);
    setExecTime(null);
    setOutput([{ type: "info", text: `${icon} ${label} kompilyatsiya qilinmoqda...` }]);

    const startTime = Date.now();

    try {
      // Build files array for Piston
      const pistonFiles = Object.entries(files).map(([name, content]) => ({
        name: name.replace(/^\//, ""), // strip leading slash
        content,
      }));

      // Ensure main file is first
      const mainIdx = pistonFiles.findIndex(
        (f) => f.name === mainFile.replace(/^\//, "")
      );
      if (mainIdx > 0) {
        const [main] = pistonFiles.splice(mainIdx, 1);
        pistonFiles.unshift(main);
      }

      const res = await fetch("/api/piston", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          files: pistonFiles,
          stdin: stdin || "",
          compile_timeout: 15000,
          run_timeout: 10000,
        }),
        signal: abortRef.current.signal,
      });

      const elapsed = Date.now() - startTime;
      setExecTime(elapsed);

      if (!res.ok) {
        const err = await res.json();
        setOutput([{ type: "stderr", text: err.error ?? "Server xatosi" }]);
        return;
      }

      const data = await res.json();
      const lines: OutputLine[] = [];

      // Compile errors (C++, Java, Go, Rust)
      if (data.compile?.stderr) {
        const compileErr = data.compile.stderr.trim();
        if (compileErr) {
          lines.push({ type: "info", text: "── Kompilyatsiya xatolari ──" });
          compileErr.split("\n").forEach((l: string) => {
            if (l.trim()) lines.push({ type: "compile_err", text: l });
          });
        }
      }

      // Compile stdout (rare but possible)
      if (data.compile?.stdout?.trim()) {
        data.compile.stdout.split("\n").forEach((l: string) => {
          if (l.trim()) lines.push({ type: "stdout", text: l });
        });
      }

      // Runtime stdout
      if (data.run?.stdout?.trim()) {
        if (lines.length > 0) lines.push({ type: "info", text: "── Natija ──" });
        data.run.stdout.split("\n").forEach((l: string) => {
          lines.push({ type: "stdout", text: l });
        });
      }

      // Runtime stderr
      if (data.run?.stderr?.trim()) {
        lines.push({ type: "info", text: "── Xatolik ──" });
        data.run.stderr.split("\n").forEach((l: string) => {
          if (l.trim()) lines.push({ type: "stderr", text: l });
        });
      }

      // Exit code
      const exitCode = data.run?.code ?? data.compile?.code;
      if (exitCode !== undefined && exitCode !== null) {
        if (exitCode === 0 && lines.some((l) => l.type === "stdout")) {
          lines.push({
            type: "success",
            text: `✓ Muvaffaqiyatli bajarildi (${elapsed}ms)`,
          });
        } else if (exitCode !== 0) {
          lines.push({
            type: "stderr",
            text: `✗ Dastur ${exitCode} kod bilan tugadi`,
          });
        }
      }

      if (lines.length === 0) {
        lines.push({ type: "info", text: "(Hech qanday chiqish yo'q)" });
      }

      setOutput(lines);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setOutput([
        {
          type: "stderr",
          text: `Xatolik: ${err.message}`,
        },
        {
          type: "info",
          text: "💡 Internet aloqasini tekshiring yoki keyinroq urinib ko'ring.",
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [files, language, label, icon, mainFile, stdin, isRunning]);

  const clearOutput = () => {
    setOutput([{ type: "info", text: "Terminal tozalandi." }]);
    setExecTime(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
            {label} Terminal
          </span>
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${accentBg} ${accentColor} ${accentBorder}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${accentColor.replace("text-", "bg-")}`} />
            {language.toUpperCase()}
          </span>
          {execTime !== null && (
            <span className="text-[10px] text-slate-500 font-mono">
              {execTime}ms
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Stdin toggle */}
          {showStdin && (
            <button
              onClick={() => setShowStdinPanel((v) => !v)}
              className={`flex items-center gap-1 h-7 px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                showStdinPanel
                  ? "bg-slate-600 text-slate-200"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-700"
              }`}
            >
              stdin
              <ChevronDown
                className={`w-3 h-3 transition-transform ${showStdinPanel ? "rotate-180" : ""}`}
              />
            </button>
          )}

          {/* Clear */}
          <button
            onClick={clearOutput}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
            title="Tozalash"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Run */}
          {!readOnly && (
            <button
              onClick={runCode}
              disabled={isRunning}
              className={`flex items-center gap-1.5 h-7 px-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black transition-colors ${accentBg.replace("bg-", "bg-").replace("-50", "-600")} hover:opacity-90`}
              style={{ backgroundColor: undefined }}
            >
              {isRunning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              Ishga tushirish
            </button>
          )}
        </div>
      </div>

      {/* ── Stdin panel ── */}
      {showStdin && showStdinPanel && (
        <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 shrink-0">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">
            stdin (kirish ma'lumotlari)
          </label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            rows={2}
            placeholder="Dasturga kirish ma'lumotlarini yozing..."
            className="w-full bg-slate-900 text-slate-300 font-mono text-xs p-2 rounded-lg border border-slate-700 outline-none focus:border-slate-500 resize-none"
          />
        </div>
      )}

      {/* ── Output ── */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-0.5"
        style={{ minHeight: 0 }}
      >
        {output.map((line, i) => (
          <div key={i} className={getLineClass(line.type)}>
            {line.type === "stderr" && (
              <span className="text-red-500 mr-1.5 shrink-0">✗</span>
            )}
            {line.type === "compile_err" && (
              <span className="text-amber-500 mr-1.5 shrink-0">⚠</span>
            )}
            {line.type === "stdout" && (
              <span className="text-slate-600 mr-1.5 select-none shrink-0">›</span>
            )}
            {line.type === "success" && (
              <span className="text-emerald-500 mr-1.5 shrink-0">✓</span>
            )}
            <span className="whitespace-pre-wrap break-all">{line.text}</span>
          </div>
        ))}
        {isRunning && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pt-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Kompilyatsiya va ishga tushirish...
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-3 py-1.5 bg-slate-800 border-t border-slate-700 flex items-center justify-between shrink-0">
        <p className="text-[10px] text-slate-500">
          {icon} Piston API · emkc.org
        </p>
        <a
          href="https://emkc.org/api/v2/piston"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Piston API
        </a>
      </div>
    </div>
  );
}

function getLineClass(type: OutputLine["type"]): string {
  const base = "flex items-start leading-relaxed";
  switch (type) {
    case "stderr":
      return `${base} text-red-400`;
    case "compile_err":
      return `${base} text-amber-400`;
    case "info":
      return `${base} text-slate-500 text-xs`;
    case "success":
      return `${base} text-emerald-400 text-xs font-bold`;
    default:
      return `${base} text-emerald-300`;
  }
}
