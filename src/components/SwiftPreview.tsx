"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Loader2, Trash2, Terminal, ExternalLink } from "lucide-react";

interface SwiftPreviewProps {
  code: string;
  readOnly?: boolean;
}

type OutputLine = { type: "stdout" | "stderr" | "info"; text: string };

export default function SwiftPreview({ code, readOnly = false }: SwiftPreviewProps) {
  const [output, setOutput] = useState<OutputLine[]>([
    { type: "info", text: "▶ Ishga tushirish tugmasini bosing..." },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll
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
    setOutput([{ type: "info", text: "Swift kompilyatsiya qilinmoqda..." }]);

    try {
      // SwiftFiddle API — open source Swift online compiler
      const res = await fetch("https://swiftfiddle.com/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          swiftVersion: "5.10",
          command: "swift",
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`Server xatosi: ${res.status}`);
      }

      const data = await res.json();
      const lines: OutputLine[] = [];

      if (data.output) {
        data.output.split("\n").forEach((line: string) => {
          if (line.trim()) lines.push({ type: "stdout", text: line });
        });
      }

      if (data.errors) {
        data.errors.split("\n").forEach((line: string) => {
          if (line.trim()) lines.push({ type: "stderr", text: line });
        });
      }

      if (lines.length === 0) {
        lines.push({ type: "info", text: "(Hech qanday chiqish yo'q)" });
      }

      setOutput(lines);
    } catch (err: any) {
      if (err.name === "AbortError") return;

      // Fallback: try Replit-style or show helpful message
      setOutput([
        {
          type: "stderr",
          text: `Xatolik: ${err.message}`,
        },
        {
          type: "info",
          text: "💡 SwiftFiddle.com ga o'tib kodingizni ishga tushiring",
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [code, isRunning]);

  // Build SwiftFiddle share URL with code
  const swiftFiddleUrl = `https://swiftfiddle.com/?code=${encodeURIComponent(code)}`;

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
            Swift Terminal
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-900/50 border border-orange-700 text-orange-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            Swift 5.10
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setOutput([{ type: "info", text: "Terminal tozalandi." }])
            }
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {!readOnly && (
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-black transition-colors"
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

      {/* Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1"
        style={{ minHeight: 0 }}
      >
        {output.map((line, i) => (
          <div
            key={i}
            className={
              line.type === "stderr"
                ? "text-red-400"
                : line.type === "info"
                ? "text-slate-500 text-xs"
                : "text-emerald-300"
            }
          >
            {line.type === "stderr" && (
              <span className="text-red-500 mr-1">✗</span>
            )}
            {line.type === "stdout" && (
              <span className="text-slate-600 mr-1 select-none">›</span>
            )}
            <span className="whitespace-pre-wrap">{line.text}</span>
          </div>
        ))}
        {isRunning && (
          <div className="flex items-center gap-2 text-orange-400 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            Kompilyatsiya va ishga tushirish...
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 bg-slate-800 border-t border-slate-700 flex items-center justify-between shrink-0">
        <p className="text-[10px] text-slate-500">
          🧡 Swift 5.10 · SwiftFiddle API
        </p>
        <a
          href={swiftFiddleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-orange-400 hover:text-orange-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          SwiftFiddle'da ochish
        </a>
      </div>
    </div>
  );
}
