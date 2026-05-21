// Admin Dashboard — /admin
// 4 stat cards + role distribution bar + table rows

function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-4 px-4">
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-slate-200 rounded-lg" />
          <div className="h-3 w-44 bg-slate-100 rounded-lg" />
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="h-5 w-20 bg-slate-200 rounded-full" />
      </td>
      <td className="py-4 px-4">
        <div className="h-4 w-16 bg-slate-100 rounded-lg" />
      </td>
      <td className="py-4 px-4">
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-slate-200 rounded-xl" />
          <div className="h-8 w-20 bg-slate-100 rounded-xl" />
        </div>
      </td>
    </tr>
  );
}

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      {/* Top nav bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-200" />
          <div className="h-5 w-24 bg-slate-200 rounded-lg" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            "bg-blue-100",
            "bg-emerald-100",
            "bg-amber-100",
            "bg-violet-100",
          ].map((color, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className={`w-10 h-10 rounded-xl ${color}`} />
              <div className="h-3 w-20 bg-slate-200 rounded-full" />
              <div className="h-8 w-14 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Role Distribution Bar */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="h-5 w-40 bg-slate-200 rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                  <div className="h-3 w-8 bg-slate-100 rounded" />
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full">
                  <div
                    className="h-3 bg-slate-300 rounded-full"
                    style={{ width: `${30 + i * 20}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div className="h-11 w-full max-w-sm bg-slate-200 rounded-xl" />

        {/* Table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Foydalanuvchi", "Rol", "Sana", "Amallar"].map((h) => (
                  <th key={h} className="py-3 px-4 text-left">
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
