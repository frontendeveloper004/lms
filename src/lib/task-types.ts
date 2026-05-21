// Task type definitions for multi-environment assignment support

export type TaskType =
  | "HTML_CSS_JS"
  | "REACT"
  | "VUE"
  | "VANILLA_TS"
  | "PYTHON"
  | "KOTLIN"
  | "SWIFT"
  | "CPP"
  | "JAVA"
  | "GO"
  | "RUST"
  | "PHP"
  | "ENGLISH_READING"
  | "ENGLISH_LISTENING"
  | "ENGLISH_WRITING"
  | "ENGLISH_SPEAKING";

export interface TaskTypeConfig {
  id: TaskType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  category: "web" | "scripting" | "framework" | "systems" | "english";
  previewEngine: "iframe" | "sandpack" | "pyodide" | "kotlin-playground" | "swiftfiddle" | "piston";
  // Piston language id (only for piston engine)
  pistonLanguage?: string;
  // Main entry file for piston
  pistonMainFile?: string;
  files: {
    name: string;
    language: string;
    icon: string;
  }[];
}

export const TASK_TYPES: TaskTypeConfig[] = [
  // ── WEB ──────────────────────────────────────────────────────
  {
    id: "HTML_CSS_JS",
    label: "HTML / CSS / JS",
    description: "Klassik web — HTML, CSS va JavaScript",
    icon: "🌐",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    category: "web",
    previewEngine: "iframe",
    files: [
      { name: "index.html", language: "html", icon: "🟠" },
      { name: "style.css", language: "css", icon: "🔵" },
      { name: "script.js", language: "javascript", icon: "🟡" },
    ],
  },
  {
    id: "VANILLA_TS",
    label: "TypeScript",
    description: "Vanilla TypeScript, Sandpack orqali",
    icon: "🔷",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    category: "web",
    previewEngine: "sandpack",
    files: [
      { name: "index.ts", language: "typescript", icon: "🔷" },
      { name: "index.html", language: "html", icon: "🟠" },
    ],
  },

  // ── FRAMEWORK ────────────────────────────────────────────────
  {
    id: "REACT",
    label: "React",
    description: "React + JSX, Sandpack orqali live preview",
    icon: "⚛️",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    category: "framework",
    previewEngine: "sandpack",
    files: [
      { name: "App.jsx", language: "jsx", icon: "⚛️" },
      { name: "styles.css", language: "css", icon: "🔵" },
    ],
  },
  {
    id: "VUE",
    label: "Vue.js",
    description: "Vue 3 SFC, Sandpack orqali live preview",
    icon: "💚",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    category: "framework",
    previewEngine: "sandpack",
    files: [
      { name: "App.vue", language: "vue", icon: "💚" },
    ],
  },

  // ── SCRIPTING ────────────────────────────────────────────────
  {
    id: "PYTHON",
    label: "Python",
    description: "Python — Pyodide orqali browser'da ishlaydi",
    icon: "🐍",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    category: "scripting",
    previewEngine: "pyodide",
    files: [
      { name: "main.py", language: "python", icon: "🐍" },
    ],
  },
  {
    id: "KOTLIN",
    label: "Kotlin",
    description: "Kotlin — JetBrains Playground orqali",
    icon: "🟣",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    category: "scripting",
    previewEngine: "kotlin-playground",
    files: [
      { name: "main.kt", language: "kotlin", icon: "🟣" },
    ],
  },
  {
    id: "SWIFT",
    label: "Swift",
    description: "Swift — SwiftFiddle orqali online compiler",
    icon: "🧡",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    category: "scripting",
    previewEngine: "swiftfiddle",
    files: [
      { name: "main.swift", language: "swift", icon: "🧡" },
    ],
  },

  // ── MOBILE ───────────────────────────────────────────────────

  // ── SYSTEMS (Piston API) ──────────────────────────────────────
  {
    id: "CPP",
    label: "C++",
    description: "C++ — Piston API orqali compile va run",
    icon: "⚙️",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    category: "systems",
    previewEngine: "piston",
    pistonLanguage: "cpp",
    pistonMainFile: "main.cpp",
    files: [
      { name: "main.cpp", language: "cpp", icon: "⚙️" },
    ],
  },
  {
    id: "JAVA",
    label: "Java",
    description: "Java — Piston API orqali compile va run",
    icon: "☕",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    category: "systems",
    previewEngine: "piston",
    pistonLanguage: "java",
    pistonMainFile: "Main.java",
    files: [
      { name: "Main.java", language: "java", icon: "☕" },
    ],
  },
  {
    id: "GO",
    label: "Go",
    description: "Go (Golang) — Piston API orqali compile va run",
    icon: "🐹",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-300",
    category: "systems",
    previewEngine: "piston",
    pistonLanguage: "go",
    pistonMainFile: "main.go",
    files: [
      { name: "main.go", language: "go", icon: "🐹" },
    ],
  },
  {
    id: "RUST",
    label: "Rust",
    description: "Rust — Piston API orqali compile va run",
    icon: "🦀",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    category: "systems",
    previewEngine: "piston",
    pistonLanguage: "rust",
    pistonMainFile: "main.rs",
    files: [
      { name: "main.rs", language: "rust", icon: "🦀" },
    ],
  },
  {
    id: "PHP",
    label: "PHP",
    description: "PHP — Piston API orqali run",
    icon: "🐘",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    category: "systems",
    previewEngine: "piston",
    pistonLanguage: "php",
    pistonMainFile: "index.php",
    files: [
      { name: "index.php", language: "php", icon: "🐘" },
    ],
  },
  // ── ENGLISH ──────────────────────────────────────────────────
  {
    id: "ENGLISH_READING",
    label: "English Reading",
    description: "Matnni o'qish va tushunish topshiriqlari",
    icon: "📖",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    category: "english",
    previewEngine: "iframe",
    files: [{ name: "reading.txt", language: "markdown", icon: "📖" }],
  },
  {
    id: "ENGLISH_WRITING",
    label: "English Writing",
    description: "Insho va yozma ish topshiriqlari",
    icon: "✍️",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    category: "english",
    previewEngine: "iframe",
    files: [{ name: "essay.txt", language: "markdown", icon: "✍️" }],
  },
  {
    id: "ENGLISH_LISTENING",
    label: "English Listening",
    description: "Audio eshitish va savollarga javob berish",
    icon: "🎧",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    category: "english",
    previewEngine: "iframe",
    files: [{ name: "instructions.txt", language: "markdown", icon: "🎧" }],
  },
  {
    id: "ENGLISH_SPEAKING",
    label: "English Speaking",
    description: "IELTS Speaking va nutqiy qobiliyatlarni baholash",
    icon: "🗣️",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    category: "english",
    previewEngine: "iframe",
    files: [{ name: "speaking_notes.txt", language: "markdown", icon: "🗣️" }],
  },
];

export function getTaskTypeConfig(taskType: string): TaskTypeConfig {
  return TASK_TYPES.find((t) => t.id === taskType) ?? TASK_TYPES[0];
}

// ── Default starter code — har bir til uchun "Hello World" ───
export const DEFAULT_STARTER_CODE: Record<TaskType, Record<string, string>> = {
  // ── Web ──────────────────────────────────────────────────────
  HTML_CSS_JS: {
    "index.html": `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Hello World</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Hello, World!</h1>
  <script src="script.js"></script>
</body>
</html>`,
    "style.css": `body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  background: #f0f4f8;
}

h1 {
  color: #2d3748;
  font-size: 2.5rem;
}`,
    "script.js": `console.log("Hello, World!");`,
  },

  VANILLA_TS: {
    "/index.ts": `const message: string = "Hello, World!";
console.log(message);

const heading = document.querySelector("h1");
if (heading) {
  heading.textContent = message;
}`,
    "/index.html": `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <title>Hello World</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <script src="index.ts"></script>
</body>
</html>`,
  },

  // ── Framework ─────────────────────────────────────────────────
  REACT: {
    "/App.jsx": `import "./styles.css";

export default function App() {
  return (
    <div className="container">
      <h1>Hello, World!</h1>
    </div>
  );
}`,
    "/styles.css": `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: sans-serif;
  background: #f0f4f8;
}

h1 {
  color: #2d3748;
  font-size: 2.5rem;
}`,
  },

  VUE: {
    "/src/App.vue": `<template>
  <div class="container">
    <h1>{{ message }}</h1>
  </div>
</template>

<script setup>
import { ref } from "vue";

const message = ref("Hello, World!");
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: sans-serif;
  background: #f0f4f8;
}

h1 {
  color: #2d3748;
  font-size: 2.5rem;
}
</style>`,
  },

  // ── Scripting ─────────────────────────────────────────────────
  PYTHON: {
    "main.py": `print("Hello, World!")`,
  },

  KOTLIN: {
    "main.kt": `fun main() {
    println("Hello, World!")
}`,
  },

  SWIFT: {
    "main.swift": `import Foundation

print("Hello, World!")`,
  },

  // ── Systems ───────────────────────────────────────────────────
  CPP: {
    "main.cpp": `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  },

  JAVA: {
    "Main.java": `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  },

  GO: {
    "main.go": `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
  },

  RUST: {
    "main.rs": `fn main() {
    println!("Hello, World!");
}`,
  },

  PHP: {
    "index.php": `<?php

echo "Hello, World!";`,
  },
  ENGLISH_READING: {
    "reading.txt": `# Title: The Future of AI
 
Read the text below and answer the questions...`,
  },
  ENGLISH_WRITING: {
    "essay.txt": `# Task: Write an essay
 
Topic: Discuss the advantages and disadvantages of online education...`,
  },
  ENGLISH_LISTENING: {
    "instructions.txt": `# Listening Task
 
Please listen to the audio file attached to this assignment and answer accordingly.`,
  },
  ENGLISH_SPEAKING: {
    "grammar.txt": `# Grammar Exercise
 
Fill in the blanks with the correct form of the verb...`,
  },
};
