"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Users, BookOpen, LayoutDashboard, ShieldCheck, 
  Search, CheckCircle2, XCircle,
  Settings, LogOut, Check, X,
  ChartBar, GraduationCap, Loader2, User, Trash2
} from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { AdminProfileTab } from "@/components/admin/admin-profile-tab";

interface Course {
  id: string;
  title: string;
  status: string;
  teacher: { name: string; email: string };
  category: { name: string };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { taughtCourses: number; enrollments: number };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'users' | 'profile'>('dashboard');

  // Read tab from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "users" || tab === "courses" || tab === "profile") {
      setActiveTab(tab);
    }
  }, []);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courseSearch, setCourseSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetch("/api/admin/courses"), fetch("/api/admin/users"), fetch("/api/admin/profile")])
      .then(async ([cr, ur, pr]) => {
        if (cr.ok) setCourses(await cr.json());
        if (ur.ok) setUsers(await ur.json());
        if (pr.ok) {
          const profile = await pr.json();
          setCurrentAdminId(profile.id);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  async function handleStatusChange(courseId: string, newStatus: string) {
    const res = await fetch(`/api/admin/courses/${courseId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setCourses(courses.map(c => c.id === courseId ? { ...c, status: newStatus } : c));
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const res = await fetch(`/api/admin/users/`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    if (res.ok) setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/"); router.refresh();
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
        toast.success(data.message || "Foydalanuvchi muvaffaqiyatli o'chirildi");
      } else {
        toast.error(data.error || "O'chirishda xatolik yuz berdi");
      }
    } catch (e) {
      toast.error("Tizimda xatolik yuz berdi");
    } finally {
      setIsDeleting(false);
    }
  }

  const pendingCourses = courses.filter(c => c.status === "PENDING").length;
  const approvedCourses = courses.filter(c => c.status === "APPROVED").length;
  const totalStudents = users.filter(u => u.role === "STUDENT").length;
  const totalTeachers = users.filter(u => u.role === "TEACHER").length;

  const menuItems = [
    { id: 'dashboard', label: "Umumnazorat", icon: LayoutDashboard },
    { id: 'courses', label: "Kurslar nazorati", icon: BookOpen, count: pendingCourses },
    { id: 'users', label: "Foydalanuvchilar", icon: Users },
    { id: 'profile', label: "Profil", icon: User },
  ];

  const SidebarNav = () => (
    <nav className="space-y-1">
      {menuItems.map((item) => (
        <button key={item.id} onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
          className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${
            activeTab === item.id ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}>
          {activeTab === item.id && <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />}
          <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
          {item.label}
          {item.count ? <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{item.count}</span> : null}
        </button>
      ))}
    </nav>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Foydalanuvchilar", value: users.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50", hover: "hover:border-blue-200" },
          { label: "Jami Kurslar", value: courses.length, icon: BookOpen, color: "text-violet-600", bg: "bg-violet-50", hover: "hover:border-violet-200" },
          { label: "Kutilayotganlar", value: pendingCourses, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50", hover: "hover:border-amber-200" },
          { label: "Tasdiqlanganlar", value: approvedCourses, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", hover: "hover:border-emerald-200" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4 transition-all ${stat.hover} hover:shadow-md`}>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm flex flex-col justify-center items-center h-64 border-dashed hover:border-blue-200 transition-all group">
          <Settings className="w-10 h-10 text-slate-300 mb-4 group-hover:text-blue-400 transition-colors" />
          <h3 className="font-black text-lg text-slate-700">Platforma Sozlamalari</h3>
          <p className="text-sm text-slate-400 mt-2 text-center font-medium">Tez orada ishga tushadi.</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-5 mb-6 flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-blue-600" /> Rollari bo'yicha tahlil
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Talabalar</span><span className="text-slate-900 font-black">{totalStudents} ta</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{width: users.length ? `${(totalStudents/users.length)*100}%` : '0%'}} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>O'qituvchilar</span><span className="text-slate-900 font-black">{totalTeachers} ta</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all" style={{width: users.length ? `${(totalTeachers/users.length)*100}%` : '0%'}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCourses = () => {
    const filtered = courses.filter(c =>
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.teacher.name.toLowerCase().includes(courseSearch.toLowerCase())
    );
    return (
      <div className="space-y-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input placeholder="Kurs yoki o'qituvchini qidirish..."
            value={courseSearch} onChange={e => setCourseSearch(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Kurs nomi", "O'qituvchi", "Kategoriya", "Holati", "Amallar"].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{course.title}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">{course.teacher.name}</p>
                    <p className="text-xs text-slate-400">{course.teacher.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 border border-blue-100">
                      {course.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      course.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      course.status === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {course.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> : course.status === 'REJECTED' ? <XCircle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                      {course.status === 'APPROVED' ? 'Tasdiqlangan' : course.status === 'REJECTED' ? 'Rad etilgan' : 'Kutilmoqda'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {course.status === "PENDING" && (<>
                        <Button size="sm" className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black gap-1 border-none" onClick={() => handleStatusChange(course.id, "APPROVED")}><Check className="w-3 h-3"/> Tasdiqlash</Button>
                        <Button size="sm" className="h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[10px] font-black gap-1 border-none" onClick={() => handleStatusChange(course.id, "REJECTED")}><X className="w-3 h-3"/> Rad etish</Button>
                      </>)}
                      {course.status === "APPROVED" && <Button size="sm" variant="ghost" className="h-8 rounded-lg text-red-500 hover:bg-red-50 text-xs font-bold" onClick={() => handleStatusChange(course.id, "REJECTED")}>Bekor qilish</Button>}
                      {course.status === "REJECTED" && <Button size="sm" variant="ghost" className="h-8 rounded-lg text-emerald-600 hover:bg-emerald-50 text-xs font-bold" onClick={() => handleStatusChange(course.id, "APPROVED")}>Tiklash</Button>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-16 text-slate-400 font-medium">Hech qanday kurs topilmadi.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-400 font-medium text-sm">Hech qanday kurs topilmadi.</p>
            </div>
          ) : filtered.map((course) => (
            <div key={course.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-black text-slate-900 text-sm leading-snug">{course.title}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{course.teacher.name}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                  course.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  course.status === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-200' :
                  'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {course.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> : course.status === 'REJECTED' ? <XCircle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                  {course.status === 'APPROVED' ? 'Tasdiqlangan' : course.status === 'REJECTED' ? 'Rad etilgan' : 'Kutilmoqda'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 border border-blue-100">
                  {course.category.name}
                </span>
                <span className="text-xs text-slate-400 font-medium truncate">{course.teacher.email}</span>
              </div>
              {course.status === "PENDING" && (
                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  <Button size="sm" className="flex-1 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black gap-1 border-none" onClick={() => handleStatusChange(course.id, "APPROVED")}><Check className="w-3 h-3"/> Tasdiqlash</Button>
                  <Button size="sm" className="flex-1 h-9 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[10px] font-black gap-1 border-none" onClick={() => handleStatusChange(course.id, "REJECTED")}><X className="w-3 h-3"/> Rad etish</Button>
                </div>
              )}
              {course.status === "APPROVED" && (
                <div className="pt-1 border-t border-slate-100">
                  <Button size="sm" variant="ghost" className="w-full h-9 rounded-xl text-red-500 hover:bg-red-50 text-xs font-bold border border-red-100" onClick={() => handleStatusChange(course.id, "REJECTED")}>Bekor qilish</Button>
                </div>
              )}
              {course.status === "REJECTED" && (
                <div className="pt-1 border-t border-slate-100">
                  <Button size="sm" variant="ghost" className="w-full h-9 rounded-xl text-emerald-600 hover:bg-emerald-50 text-xs font-bold border border-emerald-100" onClick={() => handleStatusChange(course.id, "APPROVED")}>Tiklash</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    const filtered = users.filter(u =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
    return (
      <div className="space-y-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input placeholder="Ism yoki email orqali qidirish..."
            value={userSearch} onChange={e => setUserSearch(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Ism-familiya", "Email", "Rol", "Statistika", "Boshqaruv"].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${i === 4 ? 'text-right' : ''} ${i === 3 ? 'text-center' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {user.role === 'STUDENT' ? (
                      <Link href={`/students/${user.id}?from=/admin%3Ftab%3Dusers`} className="hover:text-blue-600 hover:underline transition-colors">{user.name}</Link>
                    ) : user.role === 'TEACHER' ? (
                      <Link href={`/teachers/${user.id}?from=/admin%3Ftab%3Dusers`} className="hover:text-violet-600 hover:underline transition-colors">{user.name}</Link>
                    ) : user.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      user.role === 'ADMIN' ? 'bg-violet-50 text-violet-700 border border-violet-200' :
                      user.role === 'TEACHER' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500 font-semibold text-xs">
                    {user.role === 'TEACHER' ? `${user._count.taughtCourses} ta kurs` : `${user._count.enrollments} ta a'zolik`}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.role === 'ADMIN' && users.filter(u => u.role === 'ADMIN').length === 1}
                        className="h-9 w-28 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:opacity-40">
                        <option value="STUDENT">Student</option>
                        <option value="TEACHER">Teacher</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      {user.id !== currentAdminId && (
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50" onClick={() => setUserToDelete(user)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((user) => (
            <div key={user.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {user.role === 'STUDENT' ? (
                    <Link href={`/students/${user.id}?from=/admin%3Ftab%3Dusers`} className="font-black text-slate-900 text-sm hover:text-blue-600 transition-colors">{user.name}</Link>
                  ) : user.role === 'TEACHER' ? (
                    <Link href={`/teachers/${user.id}?from=/admin%3Ftab%3Dusers`} className="font-black text-slate-900 text-sm hover:text-violet-600 transition-colors">{user.name}</Link>
                  ) : (
                    <p className="font-black text-slate-900 text-sm">{user.name}</p>
                  )}
                  <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{user.email}</p>
                </div>
                <span className={`shrink-0 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                  user.role === 'ADMIN' ? 'bg-violet-50 text-violet-700 border border-violet-200' :
                  user.role === 'TEACHER' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>{user.role}</span>
              </div>

              {/* Stats */}
              <p className="text-xs text-slate-500 font-medium">
                {user.role === 'TEACHER' ? `${user._count.taughtCourses} ta kurs` : `${user._count.enrollments} ta a'zolik`}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={user.role === 'ADMIN' && users.filter(u => u.role === 'ADMIN').length === 1}
                  className="flex-1 h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer disabled:opacity-40">
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
                {user.id !== currentAdminId && (
                  <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl text-red-500 hover:bg-red-50 shrink-0" onClick={() => setUserToDelete(user)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
      {/* Mobile Nav */}
      <div className="lg:hidden">
        <MobileNav brandName="Admin" icon={ShieldCheck} side="right" isOpen={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <div className="flex flex-col h-full px-4 pt-2">
            <div className="mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-4">Boshqaruv</p>
              <SidebarNav />
            </div>
            <div className="mt-auto mb-8 border-t border-slate-100 pt-4">
              <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl font-bold h-11 px-4" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-3" /> Chiqish
              </Button>
            </div>
          </div>
        </MobileNav>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex-col shrink-0 hidden lg:flex h-screen sticky top-0 shadow-sm">
        <div className="px-6 py-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 uppercase">Admin</span>
          </div>
        </div>
        <div className="flex-1 px-4 py-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-4">Boshqaruv</p>
          <SidebarNav />
        </div>
        <div className="px-4 pb-8 border-t border-slate-100 pt-4">
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl font-bold h-11 px-4" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" /> Chiqish
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 lg:p-10 overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
              {activeTab === 'dashboard' && <><LayoutDashboard className="w-7 h-7 text-blue-600" /> Umumnazorat</>}
              {activeTab === 'courses' && <><BookOpen className="w-7 h-7 text-violet-600" /> Kurslar nazorati</>}
              {activeTab === 'users' && <><Users className="w-7 h-7 text-emerald-600" /> Foydalanuvchilar</>}
            </h1>
            <p className="text-slate-400 mt-1 text-sm font-medium">
              {activeTab === 'dashboard' && "Platformaning umumiy statistikalari va ko'rsatkichlari."}
              {activeTab === 'courses' && "Tizimga yuklangan kurslarni tasdiqlash yoki rad etish."}
              {activeTab === 'users' && "Foydalanuvchilar ro'yxati va rollarini boshqarish."}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
          ) : (
            <div className="animate-in fade-in duration-500">
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'courses' && renderCourses()}
              {activeTab === 'users' && renderUsers()}
              {activeTab === 'profile' && <AdminProfileTab />}
            </div>
          )}
        </div>
      </main>

      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-black text-slate-900 mb-2">Foydalanuvchini o'chirish</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              Siz rostdan ham <strong>{userToDelete.name}</strong> foydalanuvchisini o'chirmoqchimisiz? Agar o'qituvchi bo'lsa barcha kurslari qo'shilib o'chadi. Bu amaliyotni orqaga qaytarib bo'lmaydi.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setUserToDelete(null)} disabled={isDeleting}>
                Bekor qilish
              </Button>
              <Button className="rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white border-none" onClick={handleDeleteUser} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Tasdiqlash
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
