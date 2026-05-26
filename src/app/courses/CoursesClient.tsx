"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, SortDesc, Users, Star, BookOpen, Clock, ChevronDown, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  image: string | null;
  level: string;
  price: number;
  xpPoints: number;
  category: Category;
  teacher: {
    id: string;
    name: string;
    avatar: string | null;
  };
  _count: {
    enrollments: number;
  };
  createdAt: Date;
}

interface Props {
  initialCourses: Course[];
  categories: Category[];
}

export default function CoursesClient({ initialCourses, categories }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedPrice, setSelectedPrice] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Filtering & Sorting Logic
  const filteredCourses = useMemo(() => {
    let result = initialCourses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || course.category.id === selectedCategory;
      const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
      const matchesPrice = selectedPrice === "all" || 
                          (selectedPrice === "free" ? course.price === 0 : course.price > 0);
      
      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });

    // Sorting
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "popular") {
      result.sort((a, b) => b._count.enrollments - a._count.enrollments);
    } else if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [initialCourses, searchQuery, selectedCategory, selectedLevel, selectedPrice, sortBy]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden flex items-center justify-between mb-2">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm"
        >
          <Filter className="w-4 h-4" /> Flitrlash
        </button>
        <div className="text-xs font-bold text-slate-400">
          {filteredCourses.length} ta kurs topildi
        </div>
      </div>

      {/* Sidebar Filters */}
      <aside className={`
        fixed inset-0 z-50 bg-white p-6 lg:relative lg:inset-auto lg:z-0 lg:bg-transparent lg:p-0
        transition-transform duration-300 transform lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:block"}
        flex flex-col gap-8 w-full lg:w-64 shrink-0 overflow-y-auto lg:overflow-y-visible
      `}>
        <div className="flex items-center justify-between lg:hidden mb-4">
          <h2 className="text-xl font-black text-slate-900">Filtrlash</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Qidiruv</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Kurs qidirishi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Yo'nalishlar</label>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-sm font-bold text-left transition-all ${selectedCategory === "all" ? "bg-[#16a34a] text-white shadow-lg shadow-green-200" : "bg-white text-slate-600 border border-slate-200 hover:border-[#16a34a]"}`}
            >
              Barchasi
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold text-left transition-all ${selectedCategory === cat.id ? "bg-[#16a34a] text-white shadow-lg shadow-green-200" : "bg-white text-slate-600 border border-slate-200 hover:border-[#16a34a]"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Daraja</label>
          <div className="flex flex-col gap-2">
            {[
              { id: "all", label: "Barchasi" },
              { id: "BEGINNER", label: "Boshlang'ich" },
              { id: "INTERMEDIATE", label: "O'rta" },
              { id: "ADVANCED", label: "Ilg'or" },
            ].map((lvl) => (
              <button 
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold text-left transition-all ${selectedLevel === lvl.id ? "bg-[#16a34a] text-white shadow-lg shadow-green-200" : "bg-white text-slate-600 border border-slate-200 hover:border-[#16a34a]"}`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Narx</label>
          <div className="flex flex-col gap-2">
            {[
              { id: "all", label: "Barchasi" },
              { id: "free", label: "Bepul" },
              { id: "paid", label: "Pullik" },
            ].map((p) => (
              <button 
                key={p.id}
                onClick={() => setSelectedPrice(p.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold text-left transition-all ${selectedPrice === p.id ? "bg-[#16a34a] text-white shadow-lg shadow-green-200" : "bg-white text-slate-600 border border-slate-200 hover:border-[#16a34a]"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs mt-4"
        >
          Natijalarni ko'rish
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Sort & Stats */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <div className="text-sm font-bold text-slate-400 italic">
            Topilgan natijalar: <span className="text-slate-900 not-italic">{filteredCourses.length} ta kurs</span>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saralash:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm font-black text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="newest">Eng yangilari</option>
              <option value="popular">Mashhurlari</option>
              <option value="price-low">Narxi: Arzonlashish</option>
              <option value="price-high">Narxi: Qimmatlashish</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-32 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Bunday kurs topilmadi</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">
              Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring.
            </p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedLevel("all");
                setSelectedPrice("all");
              }}
              className="mt-8 text-sm font-black text-[#16a34a] hover:underline"
            >
              Barcha filtrlarni tozalash
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group relative flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-[#16a34a]/5 hover:border-[#16a34a]/20 transition-all duration-500 overflow-hidden"
              >
                {/* Course Image */}
                <Link href={`/courses/${course.id}`} className="relative h-56 block overflow-hidden">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-200 font-black text-3xl italic tracking-tighter">
                      LearnEdu
                    </div>
                  )}
                  {/* Badges Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <div className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-slate-700 border border-white shadow-sm">
                      {course.level === "BEGINNER" ? "Boshlang'ich" : course.level === "INTERMEDIATE" ? "O'rta" : "Ilg'or"}
                    </div>
                    {course.xpPoints > 0 && (
                      <div className="px-3 py-1 bg-[#16a34a] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-green-200">
                        +{course.xpPoints} XP
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info Container */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-lg border border-slate-100">
                      {course.category.name}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto text-slate-400">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">{course._count.enrollments}</span>
                    </div>
                  </div>

                  <Link href={`/courses/${course.id}`} className="block group/title">
                    <h3 className="text-lg font-black text-slate-900 mb-3 group-hover/title:text-[#16a34a] transition-colors leading-tight line-clamp-2">
                      {course.title}
                    </h3>
                  </Link>

                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2 mb-6 flex-1">
                    {course.description}
                  </p>

                  {/* Teacher & Price Area */}
                  <div className="pt-5 border-t border-slate-50 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-[10px] text-slate-400 font-black">
                        {course.teacher.avatar ? (
                          <img src={course.teacher.avatar} alt={course.teacher.name} className="w-full h-full object-cover" />
                        ) : (
                          course.teacher.name[0]
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mentor</span>
                        <span className="text-xs font-bold text-slate-900 truncate max-w-[100px]">{course.teacher.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[15px] font-black text-[#16a34a]">
                        {course.price === 0 ? "BEPUL" : `${course.price.toLocaleString()} UZS`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
