import prisma from "@/lib/prisma";
import CoursesClient from "./CoursesClient";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  // Fetch courses with enrollment count
  const courses = await prisma.course.findMany({
    where: { status: "APPROVED" },
    include: { 
      category: true, 
      teacher: { select: { id: true, name: true, avatar: true } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all categories for the filter
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Header */}
      <div className="bg-gradient-to-b from-slate-50 to-white pt-20 pb-16 border-b border-slate-100">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16a34a]/10 text-[#16a34a] rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 bg-[#16a34a] rounded-full animate-pulse" />
              Ochiq ta'lim platformasi
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
              Premium <span className="text-[#16a34a]">LMS</span> Kurslari
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed md:text-lg">
              Sohangiz mutaxassislari tomonidan tayyorlangan interaktiv darsliklar orqali o'z mahoratingizni yangi darajaga olib chiqing.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Section */}
      <div className="container max-w-7xl mx-auto py-16 px-4 md:px-6">
        <CoursesClient initialCourses={courses as any} categories={categories} />
      </div>
    </div>
  );
}
