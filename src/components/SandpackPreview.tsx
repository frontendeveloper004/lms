"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TaskType } from "@/lib/task-types";
import {
  SandpackProvider,
  SandpackPreview as SandpackPreviewComp,
  SandpackConsole,
} from "@codesandbox/sandpack-react";

type SandpackTemplate = "react" | "vue" | "vanilla-ts" | "static";

function getTemplate(taskType: TaskType): SandpackTemplate {
  switch (taskType) {
    case "REACT":      return "react";
    case "VUE":        return "vue";
    case "VANILLA_TS": return "vanilla-ts";
    default:           return "static";
  }
}

const PLACEHOLDERS: Record<SandpackTemplate, Record<string, string>> = {
  react:        { "/App.jsx": `export default function App() { return <div></div>; }` },
  vue:          { "/src/App.vue": `<template><div></div></template>` },
  "vanilla-ts": { "/index.ts": `// TypeScript`, "/index.html": `<!DOCTYPE html><html><body></body></html>` },
  static:       { "/index.html": `<!DOCTYPE html><html><body></body></html>` },
};

function np(p: string) { return p.startsWith("/") ? p : `/${p}`; }
function sc(code: string) { return code.trim().length > 0 ? code : " "; }

function buildFiles(template: SandpackTemplate, files: Record<string, string>) {
  const out: Record<string, { code: string; active?: boolean }> = {};
  for (const [p, c] of Object.entries(PLACEHOLDERS[template] ?? {})) out[p] = { code: c };
  for (const [p, c] of Object.entries(files)) out[np(p)] = { code: sc(c) };
  const first = Object.keys(files)[0];
  if (first && out[np(first)]) out[np(first)] = { ...out[np(first)], active: true };
  return out;
}

interface Props {
  taskType: TaskType;
  files: Record<string, string>;
  showConsole?: boolean;
}

export default function SandpackPreviewWrapper({ taskType, files, showConsole = false }: Props) {
  const template = getTemplate(taskType);

  // The key that forces SandpackProvider to remount
  const [key, setKey] = useState(0);
  // The files snapshot that is actually rendered
  const [snap, setSnap] = useState(() => files);

  // Refs to track previous values without causing re-renders
  const prevTaskTypeRef = useRef(taskType);
  const prevSnapRef = useRef(JSON.stringify(files));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Called when we want to commit new files to Sandpack
  const commit = useCallback((newFiles: Record<string, string>) => {
    setSnap(newFiles);
    setKey((k) => k + 1);
    prevSnapRef.current = JSON.stringify(newFiles);
  }, []);

  // Watch for prop changes using a layout effect so it runs synchronously
  useEffect(() => {
    const taskTypeChanged = taskType !== prevTaskTypeRef.current;
    const serialized = JSON.stringify(files);
    const filesChanged = serialized !== prevSnapRef.current;

    if (!taskTypeChanged && !filesChanged) return;

    if (taskTypeChanged) {
      prevTaskTypeRef.current = taskType;
      if (timerRef.current) clearTimeout(timerRef.current);
      commit(files);
      return;
    }

    // Debounce file changes by 700ms
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commit(files), 700);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  });  // <-- no dependency array: runs after every render, manual guard above

  const sandpackFiles = buildFiles(template, snap);

  return (
    <div className="h-full w-full">
      <SandpackProvider
        key={key}
        template={template}
        files={sandpackFiles}
        theme="dark"
        options={{
          recompileMode: "immediate",
          initMode: "immediate",
          autorun: true,
          externalResources: taskType === "REACT" ? ["https://cdn.tailwindcss.com"] : [],
        }}
      >
        <div className="h-full flex flex-col">
          {showConsole ? (
            <>
              <div className="flex-1 overflow-hidden">
                <SandpackPreviewComp style={{ height: "100%" }} showNavigator={false} showOpenInCodeSandbox={false} showRefreshButton />
              </div>
              <div className="h-32 border-t border-slate-700 overflow-hidden">
                <SandpackConsole style={{ height: "100%" }} />
              </div>
            </>
          ) : (
            <SandpackPreviewComp style={{ height: "100%" }} showNavigator={false} showOpenInCodeSandbox={false} showRefreshButton />
          )}
        </div>
      </SandpackProvider>
    </div>
  );
}
