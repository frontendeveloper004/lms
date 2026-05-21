"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

type TabType = "html" | "css" | "javascript";

interface CodeEditorTabsProps {
  html: string;
  css: string;
  js: string;
  onHtmlChange?: (value: string) => void;
  onCssChange?: (value: string) => void;
  onJsChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

const TAB_LABELS: { key: TabType; label: string; color: string }[] = [
  { key: "html", label: "HTML", color: "text-orange-600 border-orange-500 bg-orange-50" },
  { key: "css", label: "CSS", color: "text-blue-600 border-blue-500 bg-blue-50" },
  { key: "javascript", label: "JavaScript", color: "text-yellow-600 border-yellow-500 bg-yellow-50" },
];

export default function CodeEditorTabs({
  html,
  css,
  js,
  onHtmlChange,
  onCssChange,
  onJsChange,
  readOnly = false,
  height = "100%",
}: CodeEditorTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("html");
  const [monacoFailed, setMonacoFailed] = useState(false);

  const getValue = (tab: TabType) => {
    if (tab === "html") return html;
    if (tab === "css") return css;
    return js;
  };

  const handleChange = (tab: TabType, value: string | undefined) => {
    const v = value ?? "";
    if (tab === "html") onHtmlChange?.(v);
    else if (tab === "css") onCssChange?.(v);
    else onJsChange?.(v);
  };

  const activeTabConfig = TAB_LABELS.find((t) => t.key === activeTab)!;

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-0 bg-slate-800 border-b border-slate-700 shrink-0">
        {TAB_LABELS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-t-lg border-b-2 transition-all ${
              activeTab === tab.key
                ? tab.color
                : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden">
        {monacoFailed ? (
          <textarea
            value={getValue(activeTab)}
            onChange={(e) => handleChange(activeTab, e.target.value)}
            readOnly={readOnly}
            className="w-full h-full bg-slate-900 text-slate-100 font-mono text-sm p-4 resize-none outline-none border-0"
            spellCheck={false}
          />
        ) : (
          <MonacoEditor
            height={height}
            language={activeTab}
            value={getValue(activeTab)}
            onChange={(value) => handleChange(activeTab, value)}
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
            onMount={(editor, monaco) => {
              // Monaco loaded successfully
            }}
          />
        )}
      </div>
    </div>
  );
}
