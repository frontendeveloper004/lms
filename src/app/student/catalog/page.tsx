import Link from "next/link";
import prisma from "@/lib/prisma";
import { Compass } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentCatalogPage() {
  const courses = await prisma.course.findMany({
    where: { status: "APPROVED" },
    include: {
      category: true,
      teacher: { select: { id: true, name: true, avatar: true } },
      modules: {
        select: {
          _count: { select: { lessons: true, quizzes: true } },
          assignment: { select: { id: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900">
          <Compass className="w-8 h-8 text-primary" />
          Katalog
        </h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Barcha mavjud kurslar ro'yxati. Yangiliklarni o'tkazib yubormang.</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-400">Hozircha kurslar mavjud emas.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => (
            <div key={course.id} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:shadow-slate-200/80 hover:border-slate-300 transition-all flex flex-col">
              <Link href={`/courses/${course.id}`} className="block h-48 bg-slate-50 w-full relative overflow-hidden">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50 font-black text-2xl">
                    LearnEdu
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 text-slate-600 shadow-sm">
                  {course.level}
                </div>
                {course.xpPoints > 0 && (
                  <div className="absolute bottom-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                    +{course.xpPoints} XP
                  </div>
                )}
              </Link>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary ring-1 ring-inset ring-primary/20">
                    {course.category.name}
                  </span>
                </div>
                <Link href={`/courses/${course.id}`}>
                  <h3 className="font-black text-xl mb-2 text-slate-900 group-hover:text-primary transition-colors">{course.title}</h3>
                </Link>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1 font-medium">{course.description}</p>
                
                {/* Content Counts */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                    <span className="text-primary">{course.modules.reduce((acc: any, m: any) => acc + m._count.lessons, 0)}</span> darslar
                  </div>
                  {course.modules.reduce((acc: any, m: any) => acc + m._count.quizzes, 0) > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      <span className="text-violet-600">{course.modules.reduce((acc: any, m: any) => acc + m._count.quizzes, 0)}</span> testlar
                    </div>
                  )}
                  {course.modules.filter((m: any) => m.assignment).length > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      <span className="text-amber-600">{course.modules.filter((m: any) => m.assignment).length}</span> vazifalar
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-4">
                  <Link href={`/teachers/${course.teacher.id}?from=/student/catalog`} className="flex items-center gap-2 group/teacher">
                    <div className="w-6 h-6 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-[10px] text-primary font-black shrink-0">
                      {course.teacher.avatar
                        ? <img src={course.teacher.avatar} alt={course.teacher.name} className="w-full h-full object-cover" />
                        : course.teacher.name[0]}
                    </div>
                    <span className="font-medium text-slate-500 text-xs truncate max-w-[130px] group-hover/teacher:text-primary transition-colors">
                      {course.teacher.name}
                    </span>
                  </Link>
                  <span className="font-black text-primary text-sm shrink-0">
                    {course.price === 0 ? "Bepul" : `${course.price.toLocaleString()} UZS`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
