// Teacher Dashboard — /teacher
// 3 stat card + gradient CTA banner skeleton

export default function TeacherDashboardLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-10 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="h-4 w-80 bg-slate-100 rounded-lg" />
      </div>

      {/* 3 Stat Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Earnings card */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-4">
          <div className="h-3 w-28 bg-slate-200 rounded-full" />
          <div className="h-9 w-40 bg-slate-200 rounded-xl" />
          <div className="h-6 w-32 bg-slate-100 rounded-full" />
        </div>

        {/* Students card */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-slate-200" />
            <div className="h-4 w-12 bg-slate-100 rounded-full" />
          </div>
          <div className="h-3 w-28 bg-slate-200 rounded-full" />
          <div className="h-9 w-16 bg-slate-200 rounded-xl" />
        </div>

        {/* Courses card */}
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-slate-200" />
            <div className="h-4 w-16 bg-slate-100 rounded-full" />
          </div>
          <div className="h-3 w-24 bg-slate-200 rounded-full" />
          <div className="h-9 w-12 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* Gradient CTA Banner */}
      <div className="bg-slate-200 rounded-2xl p-8 md:p-12 space-y-4">
        <div className="h-8 w-72 bg-slate-300 rounded-xl" />
        <div className="h-4 w-96 bg-slate-300 rounded-lg" />
        <div className="h-4 w-80 bg-slate-300 rounded-lg" />
        <div className="h-12 w-44 bg-slate-300 rounded-xl mt-4" />
      </div>
    </div>
  );
}
