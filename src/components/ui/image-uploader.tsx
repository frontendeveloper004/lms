"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  /** Current image URL to preview */
  value: string;
  /** Called with the new public URL after successful upload */
  onChange: (url: string) => void;
  /** Upload endpoint — e.g. "/api/upload/avatar" or "/api/upload/image?folder=projects" */
  uploadUrl: string;
  /** Max file size label shown to user */
  maxSizeLabel?: string;
  /** Aspect ratio hint shown in empty state */
  aspectHint?: string;
  /** Height of the preview area */
  previewHeight?: string;
  /** Shape: "square" | "wide" | "circle" */
  shape?: "square" | "wide" | "circle";
}

export function ImageUploader({
  value,
  onChange,
  uploadUrl,
  maxSizeLabel = "3 MB",
  aspectHint,
  previewHeight = "h-40",
  shape = "square",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "wide"
      ? "rounded-xl"
      : "rounded-xl";

  const handleFile = async (file: File) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Faqat JPG, PNG yoki WebP formatlar qabul qilinadi.");
      return;
    }

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(uploadUrl, { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
        toast.success("Rasm yuklandi!");
      } else {
        toast.error(data.error ?? "Yuklashda xatolik.");
      }
    } catch {
      toast.error("Kutilmagan xatolik yuz berdi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {value ? (
        /* ── Preview ── */
        <div className={`relative overflow-hidden border-2 border-slate-200 bg-slate-50 ${shapeClass} ${previewHeight}`}>
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 text-xs font-black text-white bg-white/20 hover:bg-white/30 border border-white/40 px-3 py-2 rounded-xl backdrop-blur-sm transition-all"
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              O'zgartirish
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 text-xs font-black text-white bg-red-500/70 hover:bg-red-500 border border-red-400/40 px-3 py-2 rounded-xl backdrop-blur-sm transition-all"
            >
              <X className="w-3.5 h-3.5" /> O'chirish
            </button>
          </div>
        </div>
      ) : (
        /* ── Drop zone ── */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={isUploading}
          className={`w-full ${previewHeight} ${shapeClass} border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer
            ${dragOver
              ? "border-violet-400 bg-violet-50"
              : "border-slate-200 bg-slate-50 hover:border-violet-300 hover:bg-violet-50/50"
            }`}
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-violet-400" />
            </div>
          )}
          <div className="text-center">
            <p className="text-xs font-bold text-slate-500">
              {isUploading ? "Yuklanmoqda..." : "Rasm yuklash"}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              JPG, PNG, WebP · max {maxSizeLabel}
              {aspectHint && ` · ${aspectHint}`}
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
