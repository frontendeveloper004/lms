"use client";

import {
  useState, useCallback, useRef, useEffect, useMemo,
} from "react";
import dynamic from "next/dynamic";
import {
  FilePlus, Trash2, Edit2, ChevronRight,
  ChevronDown, Loader2, X, Check, AlertCircle, Info,
} from "lucide-react";
import {
  getTaskTypeConfig, type TaskType,
} from "@/lib/task-types";
import {
  ALLOWED_EXTENSIONS, FILE_TEMPLATES, getMonacoLanguage,
  getFileIcon, getTabActiveColor, buildFileTree,
  getFileName, getFileExtension, TASK_FILE_HINTS,
  type TreeNode,
} from "@/lib/file-system";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false }
);

// ── Props ─────────────────────────────────────────────────────
interface FileSystemEditorProps {
  taskType: TaskType;
  files: Record<string, string>;
  onFilesChange?: (files: Record<string, string>) => void;
  readOnly?: boolean;
  showHint?: boolean;
}

// ── New file/folder input ─────────────────────────────────────
interface NewItemState {
  type: "file" | "folder";
  parentPath: string;
  value: string;
}

// ── Rename state ──────────────────────────────────────────────
interface RenameState {
  path: string;
  value: string;
}

export default function FileSystemEditor({
  taskType,
  files,
  onFilesChange,
  readOnly = false,
  showHint = true,
}: FileSystemEditorProps) {
  const config = getTaskTypeConfig(taskType);
  const allowed = ALLOWED_EXTENSIONS[taskType] ?? [".html", ".css", ".js"];
  const hint = TASK_FILE_HINTS[taskType] ?? "";

  const fileNames = useMemo(() => Object.keys(files), [files]);

  // Active file in editor
  const [activeFile, setActiveFile] = useState<string>(() => fileNames[0] ?? "");
  // Open tabs (recently opened files)
  const [openTabs, setOpenTabs] = useState<string[]>(() => fileNames.slice(0, 5));
  // Expanded folders
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([""]));
  // New item input
  const [newItem, setNewItem] = useState<NewItemState | null>(null);
  // Rename state
  const [renaming, setRenaming] = useState<RenameState | null>(null);
  // Context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string; type: "file" | "folder" } | null>(null);
  // Error
  const [error, setError] = useState<string | null>(null);
  // Hint panel
  const [hintOpen, setHintOpen] = useState(false);
  // Sidebar width (resizable)
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const resizingRef = useRef(false);

  const newItemInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Sync active file when files change
  useEffect(() => {
    if (activeFile && !files[activeFile]) {
      const first = Object.keys(files)[0] ?? "";
      setActiveFile(first);
    }
  }, [files, activeFile]);

  // Focus new item input
  useEffect(() => {
    if (newItem) setTimeout(() => newItemInputRef.current?.focus(), 50);
  }, [newItem]);

  // Focus rename input
  useEffect(() => {
    if (renaming) setTimeout(() => {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }, 50);
  }, [renaming]);

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  // ── File tree ─────────────────────────────────────────────
  const tree = useMemo(() => buildFileTree(fileNames), [fileNames]);

  // ── Open file ─────────────────────────────────────────────
  const openFile = useCallback((path: string) => {
    setActiveFile(path);
    setOpenTabs((prev) => {
      if (prev.includes(path)) return prev;
      return [...prev, path];
    });
  }, []);

  // ── Close tab ─────────────────────────────────────────────
  const closeTab = useCallback((path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenTabs((prev) => {
      const next = prev.filter((p) => p !== path);
      if (activeFile === path) {
        setActiveFile(next[next.length - 1] ?? Object.keys(files)[0] ?? "");
      }
      return next;
    });
  }, [activeFile, files]);

  // ── Validate filename ─────────────────────────────────────
  const validateFilename = useCallback((name: string, isFolder: boolean): string | null => {
    if (!name.trim()) return "Nom bo'sh bo'lishi mumkin emas";
    if (name.includes("/") && !isFolder) return "Fayl nomida / bo'lishi mumkin emas";
    if (!isFolder) {
      const ext = getFileExtension(name);
      if (!ext) return `Kengaytma kerak (masalan: ${allowed[0]})`;
      if (!allowed.includes(ext)) {
        return `Bu task type uchun ruxsat etilgan kengaytmalar: ${allowed.join(", ")}`;
      }
    }
    return null;
  }, [allowed]);

  // ── Create new file/folder ────────────────────────────────
  const confirmNewItem = useCallback(() => {
    if (!newItem || !onFilesChange) return;
    const name = newItem.value.trim();
    if (!name) { setNewItem(null); return; }

    if (newItem.type === "file") {
      const err = validateFilename(name, false);
      if (err) { setError(err); return; }

      const parent = newItem.parentPath;
      const fullPath = parent ? `${parent}/${name}` : name;

      if (files[fullPath] !== undefined) {
        setError("Bu nomli fayl allaqachon mavjud");
        return;
      }

      const ext = getFileExtension(name);
      const template = FILE_TEMPLATES[ext] ?? "";
      const newFiles = { ...files, [fullPath]: template };
      onFilesChange(newFiles);
      openFile(fullPath);
    } else {
      // Folder — just expand it (folders are virtual, no actual entry needed)
      const parent = newItem.parentPath;
      const folderPath = parent ? `${parent}/${name}` : name;
      setExpandedFolders((prev) => new Set([...prev, `/${folderPath}`]));
    }

    setNewItem(null);
    setError(null);
  }, [newItem, files, onFilesChange, openFile, validateFilename]);

  // ── Delete file ───────────────────────────────────────────
  const deleteFile = useCallback((path: string) => {
    if (!onFilesChange) return;
    // Don't delete if it's the only file
    if (Object.keys(files).length <= 1) {
      setError("Kamida bitta fayl bo'lishi kerak");
      return;
    }
    const newFiles = { ...files };
    delete newFiles[path];
    onFilesChange(newFiles);
    setOpenTabs((prev) => prev.filter((p) => p !== path));
    if (activeFile === path) {
      setActiveFile(Object.keys(newFiles)[0] ?? "");
    }
    setContextMenu(null);
  }, [files, onFilesChange, activeFile]);

  // ── Rename file ───────────────────────────────────────────
  const confirmRename = useCallback(() => {
    if (!renaming || !onFilesChange) return;
    const newName = renaming.value.trim();
    const oldPath = renaming.path;

    if (!newName || newName === getFileName(oldPath)) {
      setRenaming(null);
      return;
    }

    const err = validateFilename(newName, false);
    if (err) { setError(err); return; }

    // Build new path
    const parts = oldPath.split("/");
    parts[parts.length - 1] = newName;
    const newPath = parts.join("/");

    if (files[newPath] !== undefined) {
      setError("Bu nomli fayl allaqachon mavjud");
      return;
    }

    const newFiles: Record<string, string> = {};
    for (const [k, v] of Object.entries(files)) {
      newFiles[k === oldPath ? newPath : k] = v;
    }
    onFilesChange(newFiles);

    setOpenTabs((prev) => prev.map((p) => (p === oldPath ? newPath : p)));
    if (activeFile === oldPath) setActiveFile(newPath);
    setRenaming(null);
    setError(null);
  }, [renaming, files, onFilesChange, activeFile, validateFilename]);

  // ── Editor change ─────────────────────────────────────────
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!onFilesChange || !activeFile) return;
    onFilesChange({ ...files, [activeFile]: value ?? "" });
  }, [files, activeFile, onFilesChange]);

  // ── Sidebar resize ────────────────────────────────────────
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    const startX = e.clientX;
    const startW = sidebarWidth;
    const onMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = ev.clientX - startX;
      setSidebarWidth(Math.max(140, Math.min(320, startW + delta)));
    };
    const onUp = () => { resizingRef.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [sidebarWidth]);

  // ── Render tree node ──────────────────────────────────────
  const renderNode = (node: TreeNode): React.ReactNode => {
    if (node.type === "folder") {
      const isExpanded = expandedFolders.has(node.path);
      return (
        <div key={node.path}>
          <button
            onClick={() => setExpandedFolders((prev) => {
              const next = new Set(prev);
              isExpanded ? next.delete(node.path) : next.add(node.path);
              return next;
            })}
            className="w-full flex items-center gap-1 px-2 py-1 hover:bg-slate-700/50 text-slate-300 text-xs font-semibold transition-colors text-left"
            style={{ paddingLeft: `${8 + node.depth * 12}px` }}
          >
            {isExpanded
              ? <ChevronDown className="w-3 h-3 shrink-0 text-slate-500" />
              : <ChevronRight className="w-3 h-3 shrink-0 text-slate-500" />}
            <span className="text-slate-400 mr-1">📁</span>
            <span className="truncate">{node.name}</span>
          </button>
          {isExpanded && node.children?.map(renderNode)}
        </div>
      );
    }

    // File node
    const isActive = node.path === activeFile;
    const isRenaming = renaming?.path === node.path;

    return (
      <div key={node.path} className="relative group">
        {isRenaming ? (
          <div className="flex items-center gap-1 px-2 py-0.5" style={{ paddingLeft: `${8 + node.depth * 12 + 16}px` }}>
            <input
              ref={renameInputRef}
              value={renaming.value}
              onChange={(e) => setRenaming({ ...renaming, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmRename();
                if (e.key === "Escape") { setRenaming(null); setError(null); }
              }}
              className="flex-1 bg-slate-600 text-slate-100 text-xs px-1.5 py-0.5 rounded outline-none border border-blue-500 min-w-0"
            />
            <button onClick={confirmRename} className="text-emerald-400 hover:text-emerald-300 shrink-0"><Check className="w-3 h-3" /></button>
            <button onClick={() => { setRenaming(null); setError(null); }} className="text-slate-500 hover:text-slate-300 shrink-0"><X className="w-3 h-3" /></button>
          </div>
        ) : (
          <button
            onClick={() => openFile(node.path)}
            onContextMenu={(e) => {
              if (readOnly) return;
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, path: node.path, type: "file" });
            }}
            className={`w-full flex items-center gap-1.5 px-2 py-1 text-xs transition-colors text-left ${
              isActive
                ? "bg-slate-600 text-slate-100"
                : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
            }`}
            style={{ paddingLeft: `${8 + node.depth * 12 + 16}px` }}
          >
            <span className="text-[11px] shrink-0">{getFileIcon(node.name)}</span>
            <span className="truncate font-mono">{node.name}</span>
          </button>
        )}

        {/* Hover action buttons */}
        {!readOnly && !isRenaming && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); setRenaming({ path: node.path, value: getFileName(node.path) }); }}
              className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-slate-200 hover:bg-slate-600 transition-colors"
              title="Nomini o'zgartirish"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteFile(node.path); }}
              className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-red-400 hover:bg-slate-600 transition-colors"
              title="O'chirish"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const currentCode = files[activeFile] ?? "";
  const monacoLang = getMonacoLanguage(activeFile);

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden select-none">

      {/* ── Top bar: task type badge + hint ── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700 shrink-0">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${config.bgColor} ${config.color} border ${config.borderColor}`}>
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </div>
        {showHint && (
          <button
            onClick={() => setHintOpen((v) => !v)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              hintOpen ? "bg-blue-900/50 text-blue-400 border border-blue-700" : "text-slate-500 hover:text-slate-300 hover:bg-slate-700"
            }`}
            title="Fayl qo'shish bo'yicha maslahat"
          >
            <Info className="w-3 h-3" />
            Maslahat
          </button>
        )}
      </div>

      {/* ── Hint panel ── */}
      {hintOpen && (
        <div className="px-4 py-3 bg-blue-950/40 border-b border-blue-800/50 shrink-0">
          <pre className="text-[11px] text-blue-300 whitespace-pre-wrap font-sans leading-relaxed">{hint}</pre>
        </div>
      )}

      {/* ── Error bar ── */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-950/50 border-b border-red-800 text-red-400 text-xs shrink-0">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 hover:text-red-200"><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* ── Main area: sidebar + editor ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── File tree sidebar ── */}
        <div
          className="flex flex-col bg-slate-850 border-r border-slate-700 shrink-0 overflow-hidden"
          style={{ width: sidebarWidth, backgroundColor: "#0f172a" }}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-700 shrink-0">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Fayllar</span>
            {!readOnly && (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setNewItem({ type: "file", parentPath: "", value: "" })}
                  className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                  title="Yangi fayl"
                >
                  <FilePlus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* File tree */}
          <div className="flex-1 overflow-y-auto py-1">
            {tree.map(renderNode)}

            {/* New item input */}
            {newItem && (
              <div className="flex items-center gap-1 px-2 py-0.5 mt-0.5" style={{ paddingLeft: "20px" }}>
                <span className="text-[11px]">{newItem.type === "file" ? "📄" : "📁"}</span>
                <input
                  ref={newItemInputRef}
                  value={newItem.value}
                  onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmNewItem();
                    if (e.key === "Escape") { setNewItem(null); setError(null); }
                  }}
                  placeholder={newItem.type === "file" ? "fayl.html" : "papka"}
                  className="flex-1 bg-slate-600 text-slate-100 text-xs px-1.5 py-0.5 rounded outline-none border border-blue-500 min-w-0 font-mono"
                />
                <button onClick={confirmNewItem} className="text-emerald-400 hover:text-emerald-300 shrink-0"><Check className="w-3 h-3" /></button>
                <button onClick={() => { setNewItem(null); setError(null); }} className="text-slate-500 hover:text-slate-300 shrink-0"><X className="w-3 h-3" /></button>
              </div>
            )}
          </div>

          {/* Allowed extensions hint */}
          <div className="px-2 py-1.5 border-t border-slate-700 shrink-0">
            <p className="text-[9px] text-slate-600 leading-relaxed">
              {allowed.join("  ")}
            </p>
          </div>
        </div>

        {/* ── Resize handle ── */}
        <div
          onMouseDown={startResize}
          className="w-1 bg-slate-700 hover:bg-blue-500 cursor-col-resize transition-colors shrink-0"
          style={{ cursor: "col-resize" }}
        />

        {/* ── Editor area ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Open file tabs */}
          <div className="flex items-center bg-slate-800 border-b border-slate-700 overflow-x-auto shrink-0" style={{ minHeight: "36px" }}>
            {openTabs.filter((t) => files[t] !== undefined).map((tab) => {
              const isActive = tab === activeFile;
              const activeColor = getTabActiveColor(tab);
              return (
                <div
                  key={tab}
                  onClick={() => setActiveFile(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border-b-2 cursor-pointer whitespace-nowrap shrink-0 transition-all ${
                    isActive ? activeColor : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  <span className="text-[10px]">{getFileIcon(getFileName(tab))}</span>
                  <span>{getFileName(tab)}</span>
                  {!readOnly && (
                    <button
                      onClick={(e) => closeTab(tab, e)}
                      className="ml-0.5 w-3.5 h-3.5 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 hover:bg-slate-600 hover:text-slate-200 transition-all"
                      style={{ opacity: isActive ? 0.7 : undefined }}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            {activeFile ? (
              <MonacoEditor
                height="100%"
                language={monacoLang}
                value={currentCode}
                onChange={handleEditorChange}
                theme="vs-dark"
                path={activeFile} // key per file — Monaco keeps separate undo history
                options={{
                  readOnly,
                  readOnlyMessage: { value: "Bu maydon faqat o'qish uchun" },
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true,
                  tabSize: 2,
                  padding: { top: 10, bottom: 10 },
                  folding: true,
                  bracketPairColorization: { enabled: true },
                  suggest: { showKeywords: true },
                  quickSuggestions: true,
                }}
                loading={
                  <div className="flex items-center justify-center h-full bg-slate-900">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                  </div>
                }
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                <span className="text-4xl">📄</span>
                <p className="text-sm">Fayl tanlang yoki yangi fayl yarating</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Context menu ── */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1 min-w-36"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { setRenaming({ path: contextMenu.path, value: getFileName(contextMenu.path) }); setContextMenu(null); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition-colors text-left"
          >
            <Edit2 className="w-3 h-3" /> Nomini o'zgartirish
          </button>
          <button
            onClick={() => deleteFile(contextMenu.path)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-slate-700 transition-colors text-left"
          >
            <Trash2 className="w-3 h-3" /> O'chirish
          </button>
        </div>
      )}
    </div>
  );
}
