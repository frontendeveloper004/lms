import Link from "next/link";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { status: "APPROVED" },
    include: { category: true, teacher: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="container max-w-6xl py-12 px-4 md:px-6">
          <div className="max-w-xl">
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-3">Barcha kurslar</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-3">
              LearnEdu Kurslari
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              O'zingizga qiziq bo'lgan yo'nalishdagi eng yaxshi kurslarni tanlang va o'rganishni boshlang.
            </p>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="container max-w-6xl py-10 px-4 md:px-6">
        {courses.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-slate-400 font-medium">Hozircha kurslar qo'shilmagan.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: any) => (
              <div
                key={course.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:shadow-slate-200/80 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Image — links to course */}
                <Link href={`/courses/${course.id}`} className="block h-48 bg-slate-100 w-full relative overflow-hidden">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-50 font-black text-2xl">
                      LearnEdu
                    </div>
                  )}
                  {/* Level badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200 shadow-sm">
                    {course.level === "BEGINNER" ? "Boshlang'ich" : course.level === "INTERMEDIATE" ? "O'rta" : "Ilg'or"}
                  </div>
                  {/* XP badge */}
                  {course.xpPoints > 0 && (
                    <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                      +{course.xpPoints} XP
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Category */}
                  <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600 ring-1 ring-inset ring-blue-100 mb-3 w-fit">
                    {course.category.name}
                  </span>

                  <Link href={`/courses/${course.id}`} className="block">
                    <h3 className="font-black text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-5 flex-1 font-medium leading-relaxed">
                    {course.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <Link
                      href={`/teachers/${course.teacher.id}`}
                      className="flex items-center gap-2 group/teacher"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-50 overflow-hidden flex items-center justify-center text-[10px] text-blue-600 font-black shrink-0">
                        {course.teacher.avatar
                          ? <img src={course.teacher.avatar} alt={course.teacher.name} className="w-full h-full object-cover" />
                          : course.teacher.name[0]}
                      </div>
                      <span className="font-medium text-slate-500 text-xs truncate max-w-[120px] group-hover/teacher:text-blue-600 transition-colors">
                        {course.teacher.name}
                      </span>
                    </Link>
                    <span className="font-black text-blue-600 text-sm shrink-0">
                      {course.price === 0 ? "Bepul" : `${course.price.toLocaleString()} UZS`}
                    </span>
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
