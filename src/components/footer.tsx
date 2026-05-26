import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-50 text-slate-500 pt-20 pb-10 w-full border-t border-slate-200 relative">
      <div className="container max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Phone Section */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="inline-block">
              <img src="/logo.png" alt="Ai.Dargoh" className="h-12 w-auto object-contain hover:opacity-80 transition-opacity" />
            </Link>
            
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Telefon raqam:</p>
              <a href="tel:+998942891245" className="text-2xl md:text-3xl font-extrabold text-[#16a34a] hover:opacity-80 transition-opacity">
                +998 94 289 12 45
              </a>
            </div>

            <p className="text-slate-500 text-[15px] font-medium leading-relaxed max-w-sm">
              Zamonaviy usulda o'rganing. Ekspert o'qituvchilar, sertifikatlar va amaliy bilimlar — barchasi bir joyda. O'zbekistonning IT platformasi.
            </p>
          </div>

          {/* Links Section: 2 columns on mobile */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Links: Havolalar */}
            <div className="space-y-6">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Havolalar</h4>
              <ul className="space-y-4">
                {[
                  { label: "Kurslar", href: "/courses" },
                  { label: "Sertifikatlar", href: "/certificates-info" },
                  { label: "Yutuqlar", href: "/achievements-info" },
                  { label: "Biz haqimizda", href: "/about" },
                  { label: "O'qituvchi bo'lish", href: "/register" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-[15px] text-slate-600 hover:text-[#16a34a] font-bold transition-all hover:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links: Resurslar */}
            <div className="space-y-6">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Resurslar</h4>
              <ul className="space-y-4">
                {[
                  { label: "FAQ", href: "/faq" },
                  { label: "Blog", href: "#" },
                  { label: "Maxfiylik siyosati", href: "/privacy" },
                  { label: "Foydalanish shartlari", href: "/terms" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-[15px] text-slate-600 hover:text-[#16a34a] font-bold transition-all hover:translate-x-1 inline-block">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Manzil - visible on desktop/tablet as 3rd column, on mobile it stacks usually */}
            <div className="col-span-2 md:col-span-1 space-y-6">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Manzil</h4>
              <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                Qo'qon shahar, Sulaymon mahallasi, Toshkent ko'chasi 33-uy.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[14px] text-slate-400 font-bold">
            © {new Date().getFullYear()} Ai.Dargoh | Barcha huquqlar himoyalangan.
          </p>
          
          <div className="flex items-center gap-4">
            <a href="https://t.me/Web_Frontend_Developer" target="_blank" rel="noopener noreferrer" 
               className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#16a34a] hover:border-[#16a34a] transition-all group shadow-sm">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 14.697l-2.95-.924c-.64-.203-.654-.64.136-.953l11.57-4.461c.537-.194 1.006.131.326.889z" />
              </svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-pink-600 hover:border-pink-600 transition-all group shadow-sm">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
