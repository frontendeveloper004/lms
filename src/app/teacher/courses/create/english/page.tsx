"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, Upload, Trash2 } from "lucide-react";

export default function CreateEnglishCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("BEGINNER");
  const [categoryName, setCategoryName] = useState("Ingliz tili");
  const [price, setPrice] = useState("0");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState("");
  const [xpPoints, setXpPoints] = useState("100");
  const [introVideo, setIntroVideo] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Image upload ────────────────────────────────────────────────────────────
  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageError("Faqat rasm fayllari qabul qilinadi.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Rasm hajmi 2MB dan oshmasligi kerak.");
      return;
    }
    setImageError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImage(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImage("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const addTopic = () => {
    const val = topicInput.trim();
    if (val && !topics.includes(val)) setTopics([...topics, val]);
    setTopicInput("");
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); setError("");
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description, 
          level, 
          categoryName, 
          price: parseFloat(price), 
          image, 
          xpPoints: parseInt(xpPoints), 
          introVideo, 
          technologies: topics // We send topics as technologies to stay compatible with existing schema
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kursni yaratishda xatolik");
      router.push("/teacher/courses"); router.refresh();
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  }

  const inputCls = "w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm";

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="pb-6 border-b border-slate-100 mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 font-medium text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </button>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1">Yangi Ingliz Tili Kursi</h1>
        <p className="text-slate-500 text-sm font-medium">O'quvchilar uchun yangi ingliz tili modulini shakllantiring.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 bg-white border border-slate-100 shadow-sm p-6 md:p-8 rounded-2xl">
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">Kurs nomi</label>
          <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="IELTS Preparation Course / General English" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Kategoriya</label>
            <input required type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} className={inputCls} placeholder="Ingliz tili" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">XP Ballar</label>
            <input required type="number" min="1" max="1000" value={xpPoints} onChange={e => setXpPoints(e.target.value)} className={inputCls} placeholder="100" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">Kurs rasmi</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageFile}
            className="hidden"
            id="course-image-input"
          />
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img src={imagePreview} alt="Kurs rasmi" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="course-image-input"
              className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                <Upload className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">Rasm yuklash uchun bosing</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP — max 2MB</p>
            </label>
          )}
          {imageError && (
            <p className="text-xs text-red-500 font-semibold">{imageError}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">Bepul Tanishuv Video URL</label>
          <input type="url" value={introVideo} onChange={e => setIntroVideo(e.target.value)} className={inputCls} placeholder="https://youtube.com/watch?v=..." />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">O'rganiladigan Mavzular</label>
          <div className="flex gap-2">
            <input type="text" value={topicInput} onChange={e => setTopicInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTopic(); } }}
              className={`${inputCls} flex-1`} placeholder="Grammar, Vocabulary, Speaking, Listening..." />
            <Button type="button" onClick={addTopic} className="h-11 px-5 rounded-xl font-black text-xs uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white border-0 shrink-0">
              + Qo'shish
            </Button>
          </div>
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {topics.map(t => (
                <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold">
                  {t}
                  <button type="button" onClick={() => setTopics(topics.filter(x => x !== t))} className="text-blue-400 hover:text-blue-700">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">Tavsif</label>
          <textarea required value={description} onChange={e => setDescription(e.target.value)}
            className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 outline-none transition-all font-semibold text-sm"
            placeholder="Ushbu kurs davomida siz ingliz tilining barcha qirralarini..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Daraja</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className={inputCls}>
              <option value="BEGINNER">Boshlang'ich</option>
              <option value="INTERMEDIATE">O'rta</option>
              <option value="ADVANCED">Ilg'or</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Narxi (UZS)</label>
            <input required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 font-medium p-3 bg-red-50 rounded-xl border border-red-200">{error}</p>}

        <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
          <Button type="button" variant="ghost" className="h-11 px-5 rounded-xl font-bold text-slate-500 hover:text-slate-900" onClick={() => router.back()} disabled={isLoading}>
            Bekor qilish
          </Button>
          <Button type="submit" className="h-11 px-8 rounded-xl font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm shadow-emerald-200" disabled={isLoading}>
            {isLoading ? "Yaratilmoqda..." : "Kursni saqlash"}
          </Button>
        </div>
      </form>
    </div>
  );
}
