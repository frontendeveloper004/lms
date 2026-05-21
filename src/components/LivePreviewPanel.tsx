"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getTaskTypeConfig, type TaskType } from "@/lib/task-types";

// ── Lazy-loaded preview components ───────────────────────────
const SandpackPreview = dynamic(() => import("./SandpackPreview"), {
  ssr: false,
  loading: () => <PreviewLoader icon="⚙️" label="Sandpack yuklanmoqda..." />,
});
const PythonRunner = dynamic(() => import("./PythonRunner"), {
  ssr: false,
  loading: () => <PreviewLoader icon="🐍" label="Python yuklanmoqda..." />,
});
const KotlinPlaygroundPreview = dynamic(() => import("./KotlinPlaygroundPreview"), {
  ssr: false,
  loading: () => <PreviewLoader icon="🟣" label="Kotlin yuklanmoqda..." />,
});
const SwiftPreview = dynamic(() => import("./SwiftPreview"), {
  ssr: false,
  loading: () => <PreviewLoader icon="🧡" label="Swift yuklanmoqda..." />,
});
const PistonRunner = dynamic(() => import("./PistonRunner"), {
  ssr: false,
  loading: () => <PreviewLoader icon="⚙️" label="Yuklanmoqda..." />,
});

// ── Shared loading placeholder ────────────────────────────────
function PreviewLoader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-slate-400 text-sm gap-3">
      <span className="text-3xl animate-pulse">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// ── HTML/CSS/JS iframe preview ────────────────────────────────
function HtmlPreview({ files }: { files: Record<string, string> }) {
  const html = files["index.html"] ?? "";
  const css = files["style.css"] ?? "";
  const js = files["script.js"] ?? "";
  const [srcdoc, setSrcdoc] = useState(() => buildSrcdoc(html, css, js));

  useEffect(() => {
    const t = setTimeout(() => setSrcdoc(buildSrcdoc(html, css, js)), 500);
    return () => clearTimeout(t);
  }, [html, css, js]);

  return (
    <iframe
      sandbox="allow-scripts"
      srcDoc={srcdoc}
      scrolling="yes"
      className="w-full h-full border-0"
      title="Jonli Ko'rinish"
    />
  );
}

function buildSrcdoc(html: string, css: string, js: string): string {
  return `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
}
 
// ── English content preview ──────────────────────────────────
function EnglishPreview({ files, type }: { files: Record<string, string>; type: TaskType }) {
  const fileName = type === "ENGLISH_READING" ? "reading.txt" :
                 type === "ENGLISH_WRITING" ? "essay.txt" :
                 type === "ENGLISH_LISTENING" ? "instructions.txt" :
                 "speaking.txt";
  const content = files[fileName] ?? "";
 
  // Simple markdown-ish to HTML converter (very basic)
  const html = content
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
 
  return (
    <div className="p-6 bg-white h-full overflow-auto text-slate-800 font-medium">
      <div className="max-w-prose mx-auto" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
interface LivePreviewPanelProps {
  taskType: TaskType;
  files: Record<string, string>;
  readOnly?: boolean;
}

export default function LivePreviewPanel({
  taskType,
  files,
  readOnly = false,
}: LivePreviewPanelProps) {
  const config = getTaskTypeConfig(taskType);

  switch (taskType) {
    // Web — iframe
    case "HTML_CSS_JS":
      return <HtmlPreview files={files} />;

    // Sandpack — React, Vue, TypeScript
    case "REACT":
    case "VUE":
    case "VANILLA_TS":
      return (
        <SandpackPreview
          taskType={taskType}
          files={files}
          showConsole={false}
        />
      );

    // Pyodide — Python (browser-native)
    case "PYTHON":
      return <PythonRunner code={files["main.py"] ?? ""} readOnly={readOnly} />;

    // Scripting — JetBrains Kotlin Playground
    case "KOTLIN":
      return <KotlinPlaygroundPreview code={files["main.kt"] ?? ""} readOnly={readOnly} />;

    // Scripting — SwiftFiddle
    case "SWIFT":
      return <SwiftPreview code={files["main.swift"] ?? ""} readOnly={readOnly} />;

    // Systems — Piston API (C++, Java, Go, Rust, PHP)
    case "CPP":
    case "JAVA":
    case "GO":
    case "RUST":
    case "PHP":
      return (
        <PistonRunner
          language={config.pistonLanguage!}
          label={config.label}
          icon={config.icon}
          accentColor={config.color}
          accentBg={config.bgColor}
          accentBorder={config.borderColor}
          files={files}
          mainFile={config.pistonMainFile!}
          readOnly={readOnly}
          showStdin
        />
      );

    // English Tasks
    case "ENGLISH_READING":
    case "ENGLISH_WRITING":
    case "ENGLISH_LISTENING":
    case "ENGLISH_SPEAKING":
      return <EnglishPreview files={files} type={taskType} />;
 
    default:
      return <HtmlPreview files={files} />;
  }
}
