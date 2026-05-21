// Teacher Settings — /teacher/settings
// Professional card (cover + avatar + info) + form fields + skills + projects

export default function TeacherSettingsLoading() {
  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Professional Card */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Cover photo */}
        <div className="h-36 bg-slate-200" />
        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <div className="w-20 h-20 rounded-2xl bg-slate-300 border-4 border-white shadow-md" />
            <div className="pb-1 space-y-2">
              <div className="h-6 w-40 bg-slate-200 rounded-xl" />
              <div className="h-4 w-24 bg-slate-100 rounded-lg" />
            </div>
          </div>
          {/* Social links row */}
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-9 h-9 rounded-xl bg-slate-200" />
            ))}
          </div>
        </div>
      </div>

      {/* 2 Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="h-3 w-20 bg-slate-200 rounded-full" />
            <div className="h-8 w-12 bg-slate-200 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="h-6 w-36 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-11 w-full bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
        {/* Bio textarea */}
        <div className="space-y-2">
          <div className="h-3 w-12 bg-slate-200 rounded" />
          <div className="h-24 w-full bg-slate-100 rounded-xl" />
        </div>
        {/* Social URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="h-11 w-full bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="h-11 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* Skills Section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="h-6 w-24 bg-slate-200 rounded-xl" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-7 w-20 bg-slate-200 rounded-full" />
          ))}
        </div>
        <div className="h-11 w-full bg-slate-100 rounded-xl" />
      </div>

      {/* Projects Section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-28 bg-slate-200 rounded-xl" />
          <div className="h-9 w-28 bg-slate-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden">
              <div className="h-32 bg-slate-200" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-36 bg-slate-200 rounded-lg" />
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-3/4 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
