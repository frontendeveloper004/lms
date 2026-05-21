"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { getTaskTypeConfig, type TaskType } from "@/lib/task-types";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

// Monaco language map
const LANGUAGE_MAP: Record<string, string> = {
  html: "html",
  css: "css",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  vue: "html",
  py: "python",
  kt: "kotlin",
  swift: "swift",
  dart: "dart",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  java: "java",
  go: "go",
  rs: "rust",
  php: "php",
  json: "json",
  md: "markdown",
};

function getMonacoLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return LANGUAGE_MAP[ext] ?? "plaintext";
}

interface MultiFileEditorProps {
  taskType: TaskType;
  files: Record<string, string>;
  onFilesChange?: (files: Record<string, string>) => void;
  readOnly?: boolean;
  height?: string;
}

export default function MultiFileEditor({
  taskType,
  files,
  onFilesChange,
  readOnly = false,
  height = "100%",
}: MultiFileEditorProps) {
  const config = getTaskTypeConfig(taskType);
  const fileNames = Object.keys(files);
  const [activeFile, setActiveFile] = useState<string>(fileNames[0] ?? "");
  const [monacoFailed, setMonacoFailed] = useState(false);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!onFilesChange) return;
      onFilesChange({ ...files, [activeFile]: value ?? "" });
    },
    [files, activeFile, onFilesChange]
  );

  // File tab color based on extension
  function getTabStyle(filename: string, isActive: boolean): string {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const activeStyles: Record<string, string> = {
      html: "text-orange-400 border-orange-400 bg-orange-950/30",
      css: "text-blue-400 border-blue-400 bg-blue-950/30",
      js: "text-yellow-400 border-yellow-400 bg-yellow-950/30",
      jsx: "text-cyan-400 border-cyan-400 bg-cyan-950/30",
      ts: "text-blue-400 border-blue-400 bg-blue-950/30",
      tsx: "text-cyan-400 border-cyan-400 bg-cyan-950/30",
      vue: "text-green-400 border-green-400 bg-green-950/30",
      py: "text-yellow-400 border-yellow-400 bg-yellow-950/30",
      json: "text-amber-400 border-amber-400 bg-amber-950/30",
    };
    if (isActive) {
      return activeStyles[ext] ?? "text-slate-200 border-slate-400 bg-slate-700";
    }
    return "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700";
  }

  // File icon
  function getFileIcon(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const icons: Record<string, string> = {
      html: "🟠", css: "🔵", js: "🟡", jsx: "⚛️",
      ts: "🔷", tsx: "⚛️", vue: "💚", py: "🐍",
      kt: "🟣", swift: "🧡", dart: "🐦",
      cpp: "⚙️", cc: "⚙️", java: "☕",
      go: "🐹", rs: "🦀", php: "🐘",
      json: "📦", md: "📝",
    };
    return icons[ext] ?? "📄";
  }

  const currentCode = files[activeFile] ?? "";
  const monacoLanguage = getMonacoLanguage(activeFile);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden">
      {/* Task type badge + file tabs */}
      <div className="flex items-center gap-0 px-3 pt-2 pb-0 bg-slate-800 border-b border-slate-700 shrink-0 overflow-x-auto">
        {/* Task type badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 mr-3 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0 ${config.bgColor} ${config.color} border ${config.borderColor}`}
        >
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </div>

        {/* File tabs */}
        {fileNames.map((filename) => {
          const isActive = filename === activeFile;
          return (
            <button
              key={filename}
              onClick={() => setActiveFile(filename)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap shrink-0 ${getTabStyle(
                filename,
                isActive
              )}`}
            >
              <span className="text-[11px]">{getFileIcon(filename)}</span>
              {filename.replace(/^\//, "")}
            </button>
          );
        })}
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden">
        {monacoFailed ? (
          <textarea
            value={currentCode}
            onChange={(e) => handleChange(e.target.value)}
            readOnly={readOnly}
            className="w-full h-full bg-slate-900 text-slate-100 font-mono text-sm p-4 resize-none outline-none border-0"
            spellCheck={false}
          />
        ) : (
          <MonacoEditor
            height={height}
            language={monacoLanguage}
            value={currentCode}
            onChange={handleChange}
            theme="vs-dark"
            options={{
              readOnly,
              readOnlyMessage: { value: "Bu maydon faqat o'qish uchun" },
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
              padding: { top: 12, bottom: 12 },
            }}
            loading={
              <div className="flex items-center justify-center h-full bg-slate-900">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
