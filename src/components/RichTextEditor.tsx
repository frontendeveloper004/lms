"use client";

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import CodeBlock from "@tiptap/extension-code-block";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Code, Code2, Highlighter,
  Minus, Undo, Redo, Quote, ChevronDown, X
} from "lucide-react";

// Custom FontSize extension
const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [{
      types: ["textStyle"],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el) => el.style.fontSize || null,
          renderHTML: (attrs) => {
            if (!attrs.fontSize) return {};
            return { style: `font-size: ${attrs.fontSize}` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: any) =>
        chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: any) =>
        chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const FONT_SIZES = [
  { label: "Kichik",     value: "12px" },
  { label: "Normal",     value: "14px" },
  { label: "O'rta",      value: "16px" },
  { label: "Katta",      value: "20px" },
  { label: "Juda katta", value: "26px" },
  { label: "Sarlavha",   value: "32px" },
];

const HIGHLIGHT_COLORS = [
  { label: "Sariq",      value: "#fef08a" },
  { label: "Yashil",     value: "#bbf7d0" },
  { label: "Ko'k",       value: "#bfdbfe" },
  { label: "Pushti",     value: "#fbcfe8" },
  { label: "To'q sariq", value: "#fed7aa" },
  { label: "Binafsha",   value: "#ddd6fe" },
  { label: "Qizil",      value: "#fecaca" },
  { label: "Moviy",      value: "#a5f3fc" },
];

const ToolbarBtn = ({ onClick, active, title, children }: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) => (
  <button type="button" title={title} onClick={onClick}
    className={`p-1.5 rounded-lg transition-all ${
      active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`}>
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-slate-200 mx-1" />;

export default function RichTextEditor({ value, onChange }: Props) {
  const [sizeOpen, setSizeOpen] = useState(false);
  const [hlOpen, setHlOpen] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);
  const hlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) setSizeOpen(false);
      if (hlRef.current && !hlRef.current.contains(e.target as Node)) setHlOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false }),
      Underline,
      TextAlign.configure({ types: ["paragraph"] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      FontSize,
      CodeBlock,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[180px] px-4 py-3 text-sm text-slate-800 leading-relaxed outline-none",
      },
    },
  });

  if (!editor) return null;

  const currentSize = editor.getAttributes("textStyle").fontSize || "";
  const currentSizeLabel = FONT_SIZES.find(f => f.value === currentSize)?.label || "Hajm";
  const currentHlColor = editor.getAttributes("highlight").color || "";

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50">

        {/* Undo / Redo */}
        <ToolbarBtn title="Orqaga" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Oldinga" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Font size dropdown */}
        <div className="relative" ref={sizeRef}>
          <button type="button"
            onMouseDown={(e) => { e.preventDefault(); setSizeOpen(o => !o); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200 bg-white">
            {currentSizeLabel}
            <ChevronDown className="w-3 h-3" />
          </button>
          {sizeOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[130px]">
              <button type="button"
                onMouseDown={(e) => { e.preventDefault(); (editor.chain().focus() as any).unsetFontSize().run(); setSizeOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 border-b border-slate-100">
                Standart
              </button>
              {FONT_SIZES.map(({ label, value: sz }) => (
                <button key={sz} type="button"
                  onMouseDown={(e) => { e.preventDefault(); (editor.chain().focus() as any).setFontSize(sz).run(); setSizeOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors ${currentSize === sz ? "bg-blue-50 text-blue-700" : "text-slate-700"}`}
                  style={{ fontSize: sz }}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Divider />

        {/* Text style */}
        <ToolbarBtn title="Qalin (Bold)" active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Kursiv (Italic)" active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Tagiga chiziq" active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Ustiga chiziq" active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolbarBtn>

        {/* Highlight color picker */}
        <div className="relative" ref={hlRef}>
          <button type="button" title="Rang bilan ajratish"
            onMouseDown={(e) => { e.preventDefault(); setHlOpen(o => !o); }}
            className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
              editor.isActive("highlight") ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}>
            <Highlighter className="w-3.5 h-3.5" />
            {/* current color dot */}
            <span className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
              style={{ backgroundColor: currentHlColor || "#fef08a" }} />
          </button>
          {hlOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-2 min-w-[160px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">Rang tanlang</p>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {HIGHLIGHT_COLORS.map(({ label, value: color }) => (
                  <button key={color} type="button" title={label}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().setHighlight({ color }).run();
                      setHlOpen(false);
                    }}
                    className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                      currentHlColor === color ? "border-blue-500 scale-110" : "border-transparent hover:border-slate-300"
                    }`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
              {/* Remove highlight */}
              <button type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().unsetHighlight().run();
                  setHlOpen(false);
                }}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors border-t border-slate-100 mt-1 pt-2">
                <X className="w-3 h-3" /> Rangni olib tashlash
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn title="Chapga" active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Markazga" active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="O'ngga" active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Tekislash" active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn title="Ro'yxat" active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Raqamli ro'yxat" active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* Quote & Code */}
        <ToolbarBtn title="Iqtibos" active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Kod (inline)" active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Kod bloki (butun paragraf)" active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code2 className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Gorizontal chiziq"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-3.5 h-3.5" />
        </ToolbarBtn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
