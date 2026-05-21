import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Award, Lock, CheckCircle2, Calendar, Hash } from "lucide-react";
import Link from "next/link";
import { ExportCertificateButton } from "@/components/ExportCertificateButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificatePage({ params }: PageProps) {
  const { id: certId } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id: certId },
    include: { user: true, course: true },
  });

  if (!certificate) return notFound();

  const formattedDate = new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit", month: "long", year: "numeric",
  }).format(certificate.issuedAt);

  const verificationUrl = `https://lms-uz.com/verify/${certificate.code}`;

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Yutuqlar</p>
              <h1 className="text-base font-black text-slate-900 flex items-center gap-1.5 leading-tight">
                <Award className="w-4 h-4 text-blue-600" /> Sertifikat
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportCertificateButton targetId="certificate-print" filename={certificate.course.title} type="jpg" compact />
            <ExportCertificateButton targetId="certificate-print" filename={certificate.course.title} type="pdf" compact />
          </div>
        </div>
      </div>

      {/* ── Responsive preview card ── */}
      <div className="max-w-2xl mx-auto px-4 py-8 print:hidden">

        {/* Certificate card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">

          {/* Top accent */}
          <div className="h-2 bg-gradient-to-r from-blue-900 via-amber-400 to-blue-900" />

          {/* Main content */}
          <div className="px-8 py-10 text-center space-y-6">

            {/* Logo */}
            <div className="flex justify-center">
              <img src="/logo.png" alt="i.Dargoh" className="h-12 object-contain" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-[#1e3a8a] uppercase tracking-[0.15em]"
                style={{ fontFamily: "Times New Roman, serif" }}>
                Sertifikat
              </h2>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">
                  Muvaffaqiyat tasdiqnomasi
                </span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500" />
              </div>
            </div>

            {/* Recipient */}
            <div className="space-y-2 py-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Ushbu hujjat beriladi:</p>
              <div className="relative inline-block">
                <h3 className="text-2xl md:text-3xl font-black text-[#1e3a8a] italic"
                  style={{ fontFamily: "Georgia, serif" }}>
                  {certificate.user.name}
                </h3>
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
              </div>
            </div>

            {/* Description */}
            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium max-w-md mx-auto italic">
              <strong className="text-[#1e3a8a] not-italic">"{certificate.course.title}"</strong>{" "}
              nomli o'quv dasturini a'lo natijalar bilan tamomlagani munosabati bilan tantanali ravishda taqdim etiladi.
            </p>

            {/* Badge */}
            <div className="flex justify-center py-2">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg shadow-amber-200">
                <div className="w-14 h-14 border-2 border-white/40 rounded-full flex flex-col items-center justify-center text-white">
                  <Award className="w-7 h-7 mb-0.5" />
                  <span className="text-[7px] font-black uppercase tracking-widest">Tasdiqlangan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-8 py-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sertifikat ID</p>
                <p className="text-xs font-black text-[#1e3a8a] font-mono">{certificate.code}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Platforma</p>
                <p className="text-xs font-black text-slate-700" style={{ fontFamily: "cursive" }}>i.Dargoh</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sana</p>
                <p className="text-xs font-black text-[#1e3a8a]">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-1 bg-gradient-to-r from-blue-900 via-amber-400 to-blue-900" />
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Holat</p>
              <p className="text-sm font-black text-emerald-600">Tasdiqlangan</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Berilgan sana</p>
              <p className="text-sm font-black text-slate-900">{formattedDate}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Hash className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kod</p>
              <p className="text-sm font-black text-slate-900 font-mono">{certificate.code}</p>
            </div>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          <Lock className="w-3.5 h-3.5 text-blue-500" />
          Xavfsiz va Tasdiqlangan Sertifikat Tizimi
        </div>
      </div>

      {/* ── Hidden canvas for export — fixed pixel size, all inline styles (no Tailwind colors → no lab() errors) ── */}
      <div style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none", overflow: "hidden" }} aria-hidden="true">
        <div
          id="certificate-print"
          style={{
            position: "relative",
            backgroundColor: "#ffffff",
            width: "1240px",
            height: "877px",
            overflow: "hidden",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Decorative SVG border — only side bars + corner accents, no inner rect borders */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 1240 877" fill="none" preserveAspectRatio="none">
            {/* Left & right side bars */}
            <rect x="0" y="0" width="25" height="877" fill="#1e3a8a" />
            <rect x="1215" y="0" width="25" height="877" fill="#1e3a8a" />
            {/* Top & bottom thin accent lines */}
            <rect x="25" y="0" width="1190" height="6" fill="#d97706" opacity="0.7" />
            <rect x="25" y="871" width="1190" height="6" fill="#d97706" opacity="0.7" />
            {/* Corner accents — top-left */}
            <path d="M55 30 H135" stroke="#d97706" strokeWidth="12" strokeLinecap="square" />
            <path d="M55 30 V110" stroke="#d97706" strokeWidth="12" strokeLinecap="square" />
            {/* Corner accents — top-right */}
            <path d="M1185 30 H1105" stroke="#d97706" strokeWidth="12" strokeLinecap="square" />
            <path d="M1185 30 V110" stroke="#d97706" strokeWidth="12" strokeLinecap="square" />
            {/* Corner accents — bottom-left */}
            <path d="M55 847 H135" stroke="#d97706" strokeWidth="12" strokeLinecap="square" />
            <path d="M55 847 V767" stroke="#d97706" strokeWidth="12" strokeLinecap="square" />
            {/* Corner accents — bottom-right */}
            <path d="M1185 847 H1105" stroke="#d97706" strokeWidth="12" strokeLinecap="square" />
            <path d="M1185 847 V767" stroke="#d97706" strokeWidth="12" strokeLinecap="square" />
          </svg>

          {/* Content */}
          <div style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            textAlign: "center",
            padding: "60px 100px 50px",
            boxSizing: "border-box",
          }}>

            {/* Top: Logo + Title */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <img src="/logo.png" alt="i.Dargoh" style={{ height: "48px", opacity: 0.85, objectFit: "contain" }} />
              <div>
                <h2 style={{
                  fontSize: "72px", fontWeight: 900, textTransform: "uppercase",
                  color: "#1e3a8a", letterSpacing: "0.2em", lineHeight: 1,
                  fontFamily: "Times New Roman, serif", margin: 0,
                }}>Sertifikat</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginTop: "10px" }}>
                  <div style={{ height: "2px", width: "80px", background: "linear-gradient(to right, transparent, #d97706)" }} />
                  <span style={{ fontSize: "14px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.45em", color: "#d97706" }}>
                    Muvaffaqiyat tasdiqnomasi
                  </span>
                  <div style={{ height: "2px", width: "80px", background: "linear-gradient(to left, transparent, #d97706)" }} />
                </div>
              </div>
            </div>

            {/* Middle: Recipient */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <p style={{ fontSize: "18px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4em", margin: 0 }}>
                Ushbu hujjat beriladi:
              </p>
              <div style={{ position: "relative", paddingBottom: "14px" }}>
                <h3 style={{
                  fontSize: "68px", fontWeight: 900, color: "#1e3a8a",
                  fontStyle: "italic", fontFamily: "Georgia, serif",
                  margin: 0, lineHeight: 1.1,
                }}>{certificate.user.name}</h3>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, width: "100%", height: "4px",
                  background: "linear-gradient(to right, transparent, #d97706, transparent)",
                }} />
              </div>
            </div>

            {/* Description */}
            <div style={{ maxWidth: "72%" }}>
              <p style={{ fontSize: "20px", color: "#334155", lineHeight: 1.65, fontWeight: 600, fontStyle: "italic", margin: 0 }}>
                <strong style={{ color: "#1e3a8a", fontStyle: "normal" }}>"{certificate.course.title}"</strong>{" "}
                nomli o'quv dasturini a'lo natijalar bilan tamomlagani va nazariy-amaliy bilimlarni
                to'laqonli o'zlashtirgani munosabati bilan tantanali ravishda taqdim etiladi.
              </p>
            </div>

            {/* Footer row */}
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>

              {/* Left: QR + ID */}
              <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "10px" }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verificationUrl)}&bgcolor=ffffff&color=1e3a8a`}
                  alt="QR"
                  style={{ width: "100px", height: "100px" }}
                />
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                    Sertifikat ID:
                  </p>
                  <p style={{ fontWeight: 700, fontSize: "14px", color: "#1e3a8a", fontFamily: "monospace", margin: "2px 0 0" }}>
                    {certificate.code}
                  </p>
                </div>
              </div>

              {/* Center: Badge */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "-20px" }}>
                <div style={{
                  width: "160px", height: "160px",
                  background: "linear-gradient(135deg, #fbbf24 0%, #d97706 50%, #b45309 100%)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 20px 40px rgba(217,119,6,0.35), 0 0 0 12px white",
                }}>
                  <div style={{
                    width: "108px", height: "108px",
                    border: "2px solid rgba(255,255,255,0.35)",
                    borderRadius: "50%",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    color: "white",
                  }}>
                    <Award style={{ width: "52px", height: "52px", marginBottom: "4px" }} />
                    <span style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.3em" }}>Tasdiqlangan</span>
                  </div>
                </div>
              </div>

              {/* Right: Signature */}
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "40px", fontWeight: 900, color: "#16a34a", fontFamily: "cursive" }}>i.Dargoh</div>
                <div style={{ width: "180px", height: "2px", backgroundColor: "#cbd5e1", marginLeft: "auto" }} />
                <div>
                  <p style={{ fontWeight: 900, fontSize: "15px", color: "#1e3a8a", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                    {formattedDate}
                  </p>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px", marginBottom: 0 }}>
                    Sana / Tashkilotchi
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
