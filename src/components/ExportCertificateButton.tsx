"use client";
import { Download, Loader2, Printer } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";

/**
 * Walk every element in the cloned tree.
 * For each element, read its *computed* style and write safe inline values,
 * replacing any CSS lab() / oklch() / color() tokens that html2canvas can't parse.
 */
function inlineAndFixColors(root: HTMLElement, sourceDoc: Document) {
  const walker = sourceDoc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node: Node | null = root;

  while (node) {
    const el = node as HTMLElement;
    if (el.style !== undefined) {
      const cs = sourceDoc.defaultView?.getComputedStyle(el);
      if (cs) {
        // Only patch properties that are likely to carry color values
        const colorProps = [
          "color",
          "backgroundColor",
          "borderTopColor",
          "borderRightColor",
          "borderBottomColor",
          "borderLeftColor",
          "outlineColor",
          "textDecorationColor",
          "caretColor",
          "fill",
          "stroke",
        ];

        colorProps.forEach((prop) => {
          const val = cs.getPropertyValue(
            prop.replace(/([A-Z])/g, "-$1").toLowerCase()
          );
          if (val && (val.includes("lab(") || val.includes("oklch(") || val.includes("color("))) {
            // Fall back to a safe value
            if (prop === "backgroundColor") {
              el.style.setProperty(prop.replace(/([A-Z])/g, "-$1").toLowerCase(), "transparent", "important");
            } else if (prop === "color") {
              el.style.setProperty("color", "#000000", "important");
            } else {
              el.style.setProperty(prop.replace(/([A-Z])/g, "-$1").toLowerCase(), "transparent", "important");
            }
          }
        });

        // Always clear outline — dom renderers sometimes draw it as a visible box
        el.style.setProperty("outline", "none", "important");
        el.style.setProperty("outline-width", "0", "important");
        el.style.setProperty("box-shadow", cs.boxShadow.includes("lab(") || cs.boxShadow.includes("oklch(") ? "none" : cs.boxShadow, "important");
      }
    }
    node = walker.nextNode();
  }
}

export function ExportCertificateButton({
  targetId,
  filename,
  type = "pdf",
  compact = false,
}: {
  targetId: string;
  filename: string;
  type?: "pdf" | "jpg";
  compact?: boolean;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById(targetId);
      if (!element) return;

      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: element.offsetWidth,
        height: element.offsetHeight,
        onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
          inlineAndFixColors(clonedEl, clonedDoc);
          clonedEl.style.position = "relative";
          clonedEl.style.left = "0";
          clonedEl.style.top = "0";
          clonedEl.style.visibility = "visible";
          clonedEl.style.opacity = "1";
        },
      });

      const dataUrl = canvas.toDataURL("image/jpeg", 0.97);

      if (type === "pdf") {
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
          compress: true,
        });
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        pdf.addImage(dataUrl, "JPEG", 0, 0, pdfW, pdfH);
        pdf.save(`Sertifikat - ${filename}.pdf`);
      } else {
        const link = document.createElement("a");
        link.download = `Sertifikat - ${filename}.jpg`;
        link.href = dataUrl;
        link.click();
      }
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={
          type === "pdf"
            ? "flex items-center gap-1.5 h-9 px-4 rounded-full bg-white text-slate-900 font-black uppercase text-[9px] tracking-widest shadow-lg hover:bg-slate-100 transition-all disabled:opacity-50"
            : "flex items-center gap-1.5 h-9 px-4 rounded-full bg-white/8 border border-white/10 text-white font-black uppercase text-[9px] tracking-widest hover:bg-white/15 transition-all disabled:opacity-50"
        }
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : type === "pdf" ? (
          <Printer className="w-3.5 h-3.5" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {type === "pdf" ? "PDF" : "JPG"}
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={
        type === "pdf"
          ? "flex items-center gap-2 rounded-xl bg-white text-slate-900 border-none shadow-2xl font-black hover:bg-slate-100 transition-all uppercase text-[11px] tracking-widest h-14 px-8"
          : "flex items-center gap-2 rounded-xl bg-[#0f1115] border border-white/5 hover:bg-white/5 text-white font-black uppercase text-[11px] tracking-widest h-14 px-8"
      }
    >
      {isExporting ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : type === "pdf" ? (
        <Printer className="w-5 h-5" />
      ) : (
        <Download className="w-5 h-5" />
      )}
      {type === "pdf" ? "PDF O'ta Yuqori Sifat" : "JPG Yuklab Olish"}
    </button>
  );
}
