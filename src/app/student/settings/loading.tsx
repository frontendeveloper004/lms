// Student Settings — /student/settings
// Avatar + profile form + password change

export default function StudentSettingsLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-36 bg-slate-200 rounded-xl" />
        <div className="h-4 w-56 bg-slate-100 rounded-lg" />
      </div>

      {/* Avatar Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-slate-200" />
        <div className="space-y-3">
          <div className="h-5 w-32 bg-slate-200 rounded-lg" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
          <div className="h-9 w-32 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="h-6 w-32 bg-slate-200 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-11 w-full bg-slate-100 rounded-xl" />
          </div>
        ))}
        <div className="h-11 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* Password Change */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="h-6 w-40 bg-slate-200 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-28 bg-slate-200 rounded" />
            <div className="h-11 w-full bg-slate-100 rounded-xl" />
          </div>
        ))}
        <div className="h-11 w-40 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}
