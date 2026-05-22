import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-50/60 border-t border-slate-100">
      <div className="container max-w-6xl px-4 md:px-6 py-16">

        {/* Main grid: desktop = 3 col, mobile = centered */}
        <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-12">

          {/* LEFT — Brand */}
          <div className="flex flex-col items-center md:items-start gap-5 md:w-1/3">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="i.Dargoh" className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
              Zamonaviy usulda o'rganing. Ekspert o'qituvchilar, sertifikatlar va amaliy bilimlar — barchasi bir joyda.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://t.me/idargoh_official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm"
                aria-label="Telegram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.697l-2.95-.924c-.64-.203-.654-.64.136-.953l11.57-4.461c.537-.194 1.006.131.326.889z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-pink-500 hover:border-pink-200 transition-all shadow-sm"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@iDargoh"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* RIGHT — Links (pushed to right on desktop) */}
          <div className="flex gap-16 md:gap-24 md:ml-auto">
            {/* Platform */}
            <div className="text-center md:text-left">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-5">Platforma</h4>
              <ul className="space-y-3">
                {[
                  { label: "Kurslar", href: "/courses" },
                  { label: "Sertifikatlar", href: "/certificates-info" },
                  { label: "Yutuqlar", href: "/achievements-info" },
                  { label: "Biz haqimizda", href: "/about" },
                  { label: "O'qituvchi bo'lish", href: "/register" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors flex items-center gap-2 justify-center md:justify-start group">
                      <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-green-400 transition-colors shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="text-center md:text-left">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-5">Qoidalar</h4>
              <ul className="space-y-3">
                {[
                  { label: "Foydalanish shartlari", href: "/terms", external: false },
                  { label: "Maxfiylik siyosati", href: "/privacy", external: false },
                  { label: "Ko'p beriladigan savollar", href: "/faq", external: false },
                  { label: "Bog'lanish", href: "https://t.me/Web_Frontend_Developer", external: true },
                ].map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-slate-500 hover:text-green-600 font-medium transition-colors">
                        {item.label}
                      </a>
                    ) : (
                      <Link href={item.href} className="text-sm text-slate-500 hover:text-green-600 font-medium transition-colors">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-100 mt-12 pt-8">
          <p className="text-xs text-slate-400 font-medium text-center md:text-left">
            © 2026 Ai.Dargoh. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </footer>
  );
}
