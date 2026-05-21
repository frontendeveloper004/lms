"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Loader2, Terminal, Trash2, AlertCircle } from "lucide-react";

interface PythonRunnerProps {
  code: string;
  autoRun?: boolean;
  readOnly?: boolean;
}

type OutputLine = {
  type: "stdout" | "stderr" | "info";
  text: string;
};

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
    pyodide: any;
  }
}

export default function PythonRunner({ code, autoRun = false, readOnly = false }: PythonRunnerProps) {
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodideError, setPyodideError] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const pyodideRef = useRef<any>(null);
  const loadingRef = useRef(false);

  // Load Pyodide script once
  useEffect(() => {
    if (loadingRef.current || window.pyodide) {
      if (window.pyodide) {
        pyodideRef.current = window.pyodide;
        setPyodideReady(true);
      }
      return;
    }
    loadingRef.current = true;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js";
    script.async = true;
    script.onload = async () => {
      try {
        setIsLoading(true);
        setOutput([{ type: "info", text: "Python (Pyodide) yuklanmoqda..." }]);
        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
        });
        window.pyodide = pyodide;
        pyodideRef.current = pyodide;
        setPyodideReady(true);
        setOutput([{ type: "info", text: "✓ Python tayyor. Kodni ishga tushirish uchun ▶ tugmasini bosing." }]);
      } catch (err: any) {
        setPyodideError("Pyodide yuklanmadi: " + err.message);
        setOutput([{ type: "stderr", text: "Xatolik: Python yuklanmadi. Internet aloqasini tekshiring." }]);
      } finally {
        setIsLoading(false);
      }
    };
    script.onerror = () => {
      setPyodideError("Pyodide skripti yuklanmadi");
      setOutput([{ type: "stderr", text: "Xatolik: Pyodide CDN ga ulanib bo'lmadi." }]);
      setIsLoading(false);
    };
    document.head.appendChild(script);
  }, []);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const runCode = useCallback(async () => {
    if (!pyodideRef.current || !code.trim()) return;

    setIsLoading(true);
    setOutput([]);

    const lines: OutputLine[] = [];

    try {
      // Redirect stdout/stderr
      pyodideRef.current.setStdout({
        batched: (text: string) => {
          lines.push({ type: "stdout", text });
          setOutput([...lines]);
        },
      });
      pyodideRef.current.setStderr({
        batched: (text: string) => {
          lines.push({ type: "stderr", text });
          setOutput([...lines]);
        },
      });

      await pyodideRef.current.runPythonAsync(code);

      if (lines.length === 0) {
        lines.push({ type: "info", text: "(Hech qanday chiqish yo'q)" });
        setOutput([...lines]);
      }
    } catch (err: any) {
      lines.push({ type: "stderr", text: err.message || String(err) });
      setOutput([...lines]);
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  // Auto-run when code changes (debounced)
  useEffect(() => {
    if (!autoRun || !pyodideReady) return;
    const timer = setTimeout(() => runCode(), 1000);
    return () => clearTimeout(timer);
  }, [code, autoRun, pyodideReady, runCode]);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
            Python Terminal
          </span>
          {pyodideReady && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/50 border border-emerald-700 text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Tayyor
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOutput([])}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
            title="Tozalash"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {!readOnly && (
            <button
              onClick={runCode}
              disabled={isLoading || !pyodideReady}
              className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 text-xs font-black transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              Ishga tushirish
            </button>
          )}
        </div>
      </div>

      {/* Output area */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1"
        style={{ minHeight: 0 }}
      >
        {pyodideError && (
          <div className="flex items-start gap-2 text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{pyodideError}</span>
          </div>
        )}
        {output.length === 0 && !pyodideError && (
          <span className="text-slate-600 text-xs">
            {pyodideReady
              ? "▶ Ishga tushirish tugmasini bosing..."
              : "Python yuklanmoqda..."}
          </span>
        )}
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
        {isLoading && (
          <div className="flex items-center gap-2 text-yellow-400 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            Ishlamoqda...
          </div>
        )}
      </div>
    </div>
  );
}
