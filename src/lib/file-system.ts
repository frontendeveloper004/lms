// File system utilities for the IDE-like editor

import type { TaskType } from "./task-types";

// ── Allowed extensions per task type ─────────────────────────
export const ALLOWED_EXTENSIONS: Record<TaskType, string[]> = {
  HTML_CSS_JS:       [".html", ".css", ".js"],
  VANILLA_TS:        [".ts", ".html", ".css"],
  REACT:             [".jsx", ".tsx", ".js", ".ts", ".css", ".json"],
  VUE:               [".vue", ".js", ".ts", ".css", ".json"],
  PYTHON:            [".py"],
  KOTLIN:            [".kt"],
  SWIFT:             [".swift"],
  CPP:               [".cpp", ".h", ".hpp", ".cc", ".cxx"],
  JAVA:              [".java"],
  GO:                [".go"],
  RUST:              [".rs", ".toml"],
  PHP:               [".php", ".html", ".css", ".js"],
  ENGLISH_READING:   [".txt", ".md"],
  ENGLISH_WRITING:   [".txt", ".md"],
  ENGLISH_LISTENING: [".txt", ".md"],
  ENGLISH_SPEAKING:  [".txt", ".md"],
};

// ── File templates (bo'sh fayl yaratganda) ────────────────────
export const FILE_TEMPLATES: Record<string, string> = {
  ".html": `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Yangi sahifa</title>
</head>
<body>

</body>
</html>`,
  ".css": `/* CSS stillar */\n`,
  ".js": `// JavaScript\n`,
  ".jsx": `export default function Component() {\n  return (\n    <div>\n\n    </div>\n  );\n}\n`,
  ".tsx": `export default function Component() {\n  return (\n    <div>\n\n    </div>\n  );\n}\n`,
  ".ts": `// TypeScript\n`,
  ".vue": `<template>\n  <div>\n\n  </div>\n</template>\n\n<script setup>\n</script>\n\n<style scoped>\n</style>\n`,
  ".py": `# Python\n`,
  ".kt": `fun main() {\n    \n}\n`,
  ".swift": `import Foundation\n\n`,
  ".dart": ``,
  ".cpp": `#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n`,
  ".h": `#pragma once\n\n`,
  ".hpp": `#pragma once\n\n`,
  ".java": `public class FileName {\n    public static void main(String[] args) {\n        \n    }\n}\n`,
  ".go": `package main\n\nimport "fmt"\n\nfunc main() {\n    \n}\n`,
  ".rs": `fn main() {\n    \n}\n`,
  ".php": `<?php\n\n`,
  ".json": `{\n  \n}\n`,
  ".toml": ``,
};

// ── Monaco language map ───────────────────────────────────────
export const MONACO_LANGUAGE_MAP: Record<string, string> = {
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
  h: "cpp",
  hpp: "cpp",
  java: "java",
  go: "go",
  rs: "rust",
  php: "php",
  json: "json",
  toml: "ini",
  md: "markdown",
  env: "plaintext",
};

export function getMonacoLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MONACO_LANGUAGE_MAP[ext] ?? "plaintext";
}

// ── File icons ────────────────────────────────────────────────
export const FILE_ICONS: Record<string, string> = {
  html: "🟠", css: "🔵", js: "🟡", jsx: "⚛️",
  ts: "🔷", tsx: "⚛️", vue: "💚", py: "🐍",
  kt: "🟣", swift: "🧡", dart: "🐦",
  cpp: "⚙️", cc: "⚙️", cxx: "⚙️", h: "📋", hpp: "📋",
  java: "☕", go: "🐹", rs: "🦀", php: "🐘",
  json: "📦", toml: "📦", md: "📝", env: "🔒",
};

export function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return FILE_ICONS[ext] ?? "📄";
}

// ── Tab colors ────────────────────────────────────────────────
export const TAB_ACTIVE_COLORS: Record<string, string> = {
  html:  "text-orange-400 border-orange-400 bg-orange-950/30",
  css:   "text-blue-400   border-blue-400   bg-blue-950/30",
  js:    "text-yellow-400 border-yellow-400 bg-yellow-950/30",
  jsx:   "text-cyan-400   border-cyan-400   bg-cyan-950/30",
  ts:    "text-blue-400   border-blue-400   bg-blue-950/30",
  tsx:   "text-cyan-400   border-cyan-400   bg-cyan-950/30",
  vue:   "text-green-400  border-green-400  bg-green-950/30",
  py:    "text-yellow-400 border-yellow-400 bg-yellow-950/30",
  kt:    "text-purple-400 border-purple-400 bg-purple-950/30",
  swift: "text-orange-400 border-orange-400 bg-orange-950/30",
  dart:  "text-sky-400    border-sky-400    bg-sky-950/30",
  cpp:   "text-blue-400   border-blue-400   bg-blue-950/30",
  java:  "text-red-400    border-red-400    bg-red-950/30",
  go:    "text-cyan-400   border-cyan-400   bg-cyan-950/30",
  rs:    "text-orange-400 border-orange-400 bg-orange-950/30",
  php:   "text-violet-400 border-violet-400 bg-violet-950/30",
  json:  "text-amber-400  border-amber-400  bg-amber-950/30",
};

export function getTabActiveColor(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return TAB_ACTIVE_COLORS[ext] ?? "text-slate-200 border-slate-400 bg-slate-700";
}

// ── Path helpers ──────────────────────────────────────────────
export function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function getFileName(path: string): string {
  return path.split("/").pop() ?? path;
}

export function getFileDir(path: string): string {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/") || "/";
}

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot) : "";
}

// ── Build file tree from flat paths ──────────────────────────
export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
  depth: number;
}

export function buildFileTree(filePaths: string[]): TreeNode[] {
  const root: TreeNode[] = [];
  const folderMap = new Map<string, TreeNode>();

  // Sort: folders first, then files, alphabetically
  const sorted = [...filePaths].sort((a, b) => {
    const aClean = a.replace(/^\//, "");
    const bClean = b.replace(/^\//, "");
    return aClean.localeCompare(bClean);
  });

  for (const rawPath of sorted) {
    const path = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
    const parts = path.split("/").filter(Boolean);

    let currentLevel = root;
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath += `/${part}`;
      const isLast = i === parts.length - 1;

      if (isLast) {
        // File node
        currentLevel.push({
          name: part,
          path: rawPath, // keep original key
          type: "file",
          depth: i,
        });
      } else {
        // Folder node
        if (!folderMap.has(currentPath)) {
          const folder: TreeNode = {
            name: part,
            path: currentPath,
            type: "folder",
            children: [],
            depth: i,
          };
          folderMap.set(currentPath, folder);
          currentLevel.push(folder);
        }
        currentLevel = folderMap.get(currentPath)!.children!;
      }
    }
  }

  return root;
}

// ── Hint messages per task type ───────────────────────────────
export const TASK_FILE_HINTS: Record<TaskType, string> = {
  HTML_CSS_JS: `💡 Qo'shimcha fayllar qo'shish mumkin:
  • about.html, contact.html — boshqa sahifalar
  • components/header.html — komponentlar
  • css/reset.css, css/theme.css — CSS modullari
  • js/utils.js, js/api.js — JS modullari`,

  VANILLA_TS: `💡 Qo'shimcha fayllar qo'shish mumkin:
  • types.ts — TypeScript interfeyslari
  • utils.ts — yordamchi funksiyalar
  • api.ts — API chaqiruvlari`,

  REACT: `💡 Qo'shimcha fayllar qo'shish mumkin:
  • components/Button.jsx — komponentlar
  • hooks/useCounter.js — custom hooks
  • utils/helpers.js — yordamchi funksiyalar
  • context/AppContext.jsx — React Context`,

  VUE: `💡 Qo'shimcha fayllar qo'shish mumkin:
  • components/MyButton.vue — komponentlar
  • composables/useCounter.js — composables
  • store/index.js — Pinia/Vuex store`,

  PYTHON: `💡 Qo'shimcha fayllar qo'shish mumkin:
  • utils.py — yordamchi funksiyalar
  • models.py — ma'lumot modellari
  • tests.py — testlar`,

  KOTLIN: `💡 Qo'shimcha fayllar qo'shish mumkin:
  • Utils.kt — yordamchi funksiyalar
  • Models.kt — data class'lar`,

  SWIFT: `💡 Qo'shimcha fayllar qo'shish mumkin:
  • Utils.swift — yordamchi funksiyalar
  • Models.swift — struct/class'lar`,

  CPP: `💡 Qo'shimcha fayllar qo'shish mumkin:
  • utils.h / utils.cpp — yordamchi funksiyalar
  • models.h — struct/class ta'riflari
  • algorithms.cpp — algoritmlar`,

  JAVA: `💡 Qo'shimcha fayllar qo'shish mumkin:
  • Utils.java — yordamchi metodlar
  • Student.java — sinf ta'rifi
  • Interface.java — interfeys`,

  GO: `💡 Qo'shimcha fayllar qo'shish mumkin:
  • utils.go — yordamchi funksiyalar
  • models.go — struct ta'riflari
  • handlers.go — handler funksiyalar`,

  RUST: `💡 Qo'shimcha fayllar qo'shish mumkin:
  • utils.rs — yordamchi funksiyalar
  • models.rs — struct ta'riflari`,

  PHP: `💡 Qo'shimcha fayllar qo'shish mumkin:
  • functions.php — yordamchi funksiyalar
  • config.php — konfiguratsiya
  • db.php — ma'lumotlar bazasi`,

  ENGLISH_READING:   `📖 Matnni o'qing va savollarga javob bering.`,
  ENGLISH_WRITING:   `✍️ Insho yoki yozma ish bajaring.`,
  ENGLISH_LISTENING: `🎧 Audio faylni eshiting va savollarga javob bering.`,
  ENGLISH_SPEAKING:  `🗣️ Ovozli topshiriqni bajaring va audio yuklang.`,
};
